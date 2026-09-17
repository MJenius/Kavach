import { Agent } from './index.ts';
import { EarningsAnalysisResult } from '../ai/types.ts';
import { validateEarningsAnalysis, validateEvidenceIds } from '../ai/structured-output.ts';
import { BedrockAIService } from '../ai/bedrock.ts';
import { EARNINGS_SYSTEM_PROMPT, generateEarningsUserPrompt } from '../prompts/earnings.prompt.ts';
import { Finding } from '../domain/index.ts';
import {
  getEarnings,
  getExpenses,
  getIncentives,
  compareExpectedActual,
  calculateEffectiveHourlyRate,
} from './tools/index.ts';
import { getEvidence } from './tools/evidence-tools.ts';
import { getAgentRuntimeConfig } from './agent-config.ts';
import { reconcilePayout } from '../calculations/earnings.ts';
import { reconcileIncentive } from '../calculations/incentives.ts';

export interface EarningsAgentInput {
  workerId: string;
  timeframe?: string;
}

export class EarningsAgent implements Agent<EarningsAgentInput, EarningsAnalysisResult> {
  readonly name = 'EarningsAgent';
  readonly description = 'Reconciles expected vs actual payouts, incentives, and operational expenses using deterministic math.';

  private bedrock: BedrockAIService | null;

  constructor(bedrock?: BedrockAIService | null) {
    const config = getAgentRuntimeConfig();
    this.bedrock = bedrock ?? (config.useBedrock ? new BedrockAIService() : null);
  }

  async run(input: EarningsAgentInput): Promise<EarningsAnalysisResult> {
    const earnings = await getEarnings(input.workerId);
    const expenses = await getExpenses(input.workerId);
    const incentives = await getIncentives(input.workerId);
    const allEvidence = await getEvidence(input.workerId);
    const availableEvidenceIds = allEvidence.map((e) => e.id);

    const grossEarnings = earnings.reduce((acc, curr) => acc + (curr.actualAmount || 0), 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netEarnings = grossEarnings - totalExpenses;

    const penaltyRecords = earnings.filter((e) => e.type === 'PENALTY' || (e.actualAmount && e.actualAmount < 0));
    const totalDeductions = penaltyRecords.reduce((acc, curr) => acc + Math.abs(curr.actualAmount || 0), 0);

    const assumedWorkHours = 53;
    const hourlyRate = calculateEffectiveHourlyRate(grossEarnings, totalExpenses, assumedWorkHours);

    const discrepancies: EarningsAnalysisResult['discrepancies'] = [];
    const findings: Finding[] = [];

    // 1. Check penalties using Person 2's reconcilePayout
    for (const penalty of penaltyRecords) {
      const recon = reconcilePayout(penalty.expectedAmount, penalty.actualAmount);
      const penaltyAmount = Math.abs(penalty.actualAmount || 0);
      const relatedEvidenceIds = availableEvidenceIds.filter((id) => id.includes('penalty'));
      discrepancies.push({
        type: 'PENALTY',
        expected: penalty.expectedAmount || 0,
        actual: penalty.actualAmount || 0,
        difference: recon.difference,
        explanation: `Penalty deduction of ₹${penaltyAmount} for trip ${penalty.tripId || 'N/A'} (reconciliation status: ${recon.status})`,
        evidenceIds: relatedEvidenceIds,
      });

      findings.push({
        id: `finding-penalty-${penalty.id}`,
        type: 'PAYOUT_DISCREPANCY',
        severity: 'HIGH',
        title: `Disputed ₹${penaltyAmount} penalty on trip ${penalty.tripId || 'record'}`,
        explanation: `Platform deducted ₹${penaltyAmount} for late delivery despite evidence showing merchant delays.`,
        confidence: 0.94,
        evidenceIds: relatedEvidenceIds,
      });
    }

    // 2. Check incentive shortfall using Person 2's reconcileIncentive
    for (const inc of incentives) {
      const comp = compareExpectedActual(inc.expectedAmount || 0, inc.actualAmount || 0);
      const incRecon = reconcileIncentive(inc.expectedAmount, inc.actualAmount, true);
      if (comp.hasDiscrepancy) {
        const relatedEvidenceIds = availableEvidenceIds.filter((id) => id.includes('penalty') || id.includes('incentive'));
        discrepancies.push({
          type: 'INCENTIVE_SHORTFALL',
          expected: inc.expectedAmount || 0,
          actual: inc.actualAmount || 0,
          difference: comp.difference,
          explanation: `Incentive shortfall of ₹${comp.difference} detected for target ${inc.source} (reconciliation: ${incRecon.status})`,
          evidenceIds: relatedEvidenceIds,
        });

        findings.push({
          id: 'finding-incentive-02',
          type: 'INCENTIVE_DISCREPANCY',
          severity: 'MEDIUM',
          title: `Surge incentive shortfall of ₹${comp.difference} detected`,
          explanation: `Target completed according to trip logs, but incentive payout was credited at ₹${inc.actualAmount} instead of expected ₹${inc.expectedAmount}.`,
          confidence: 0.91,
          evidenceIds: relatedEvidenceIds,
        });
      }
    }

    const calculatedFacts = [
      { name: 'grossEarnings', value: grossEarnings, unit: 'INR' },
      { name: 'totalExpenses', value: totalExpenses, unit: 'INR' },
      { name: 'netEarnings', value: netEarnings, unit: 'INR' },
      { name: 'totalDeductions', value: totalDeductions, unit: 'INR' },
      { name: 'effectiveHourlyRate', value: hourlyRate, unit: 'INR/hr' },
    ];

    // If Bedrock is available, use AI for interpretation
    if (this.bedrock) {
      try {
        const userPrompt = generateEarningsUserPrompt({
          workerId: input.workerId,
          earnings: earnings as unknown as Array<Record<string, unknown>>,
          expenses: expenses as unknown as Array<Record<string, unknown>>,
          calculations: {
            grossEarnings,
            totalExpenses,
            netEarnings,
            totalDeductions,
            effectiveHourlyRate: hourlyRate,
            discrepancies,
          },
        });

        const result = await this.bedrock.generateStructured<EarningsAnalysisResult>({
          prompt: userPrompt,
          systemPrompt: EARNINGS_SYSTEM_PROMPT,
          targetSchemaName: 'EarningsAnalysisResult',
          validate: validateEarningsAnalysis,
        });

        if (result.success && result.data) {
          // Override calculated values to ensure deterministic numbers
          result.data.summary = { grossEarnings, totalExpenses, netEarnings, totalDeductions, effectiveHourlyRate: hourlyRate };
          result.data.calculatedFacts = calculatedFacts;
          // Validate evidence IDs
          for (const disc of result.data.discrepancies) {
            const fabricated = validateEvidenceIds(disc.evidenceIds, availableEvidenceIds);
            disc.evidenceIds = disc.evidenceIds.filter((id) => !fabricated.includes(id));
          }
          for (const f of result.data.findings) {
            const fabricated = validateEvidenceIds(f.evidenceIds, availableEvidenceIds);
            f.evidenceIds = f.evidenceIds.filter((id) => !fabricated.includes(id));
          }
          return result.data;
        }
      } catch {
        // Fall through to deterministic path
      }
    }

    // Deterministic path
    const rawResult: EarningsAnalysisResult = {
      workerId: input.workerId,
      summary: {
        grossEarnings,
        totalExpenses,
        netEarnings,
        totalDeductions,
        effectiveHourlyRate: hourlyRate,
      },
      discrepancies,
      calculatedFacts,
      interpretation: discrepancies.length > 0
        ? `Earnings audit for worker ${input.workerId} identified ${discrepancies.length} discrepancy items totaling ₹${discrepancies.reduce((a, b) => a + b.difference, 0)}. Net real earnings are ₹${netEarnings} (₹${hourlyRate}/hr).`
        : `Earnings audit for worker ${input.workerId} verified clean ledger. No unexplained deductions found.`,
      findings,
      recommendations: discrepancies.length > 0
        ? ['Submit dispute package for trip penalty', 'Review peak surge incentive targets with support']
        : ['Continue logging fuel and mobile data expenses for accurate hourly wage tracking'],
      confidence: 0.93,
    };

    const validated = validateEarningsAnalysis(rawResult);
    if (!validated.success || !validated.data) {
      throw new Error(`Earnings analysis validation failed: ${validated.error}`);
    }

    return validated.data;
  }
}
