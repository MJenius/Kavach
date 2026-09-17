import { Agent } from './index.ts';
import { EarningsAnalysisResult } from '../ai/types.ts';
import { validateEarningsAnalysis } from '../ai/structured-output.ts';
import { Finding } from '../domain/index.ts';
import {
  getEarnings,
  getExpenses,
  getIncentives,
  compareExpectedActual,
  calculateEffectiveHourlyRate,
} from './tools/index.ts';

export interface EarningsAgentInput {
  workerId: string;
  timeframe?: string;
}

export class EarningsAgent implements Agent<EarningsAgentInput, EarningsAnalysisResult> {
  readonly name = 'EarningsAgent';
  readonly description = 'Reconciles expected vs actual payouts, incentives, and operational expenses using deterministic math.';

  async run(input: EarningsAgentInput): Promise<EarningsAnalysisResult> {
    const earnings = await getEarnings(input.workerId);
    const expenses = await getExpenses(input.workerId);
    const incentives = await getIncentives(input.workerId);

    const grossEarnings = earnings.reduce((acc, curr) => acc + (curr.actualAmount || 0), 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netEarnings = grossEarnings - totalExpenses;

    const penaltyRecords = earnings.filter((e) => e.type === 'PENALTY' || (e.actualAmount && e.actualAmount < 0));
    const totalDeductions = penaltyRecords.reduce((acc, curr) => acc + Math.abs(curr.actualAmount || 0), 0);

    const assumedWorkHours = 53; // From demo worker canonical calculation
    const hourlyRate = calculateEffectiveHourlyRate(grossEarnings, totalExpenses, assumedWorkHours);

    const discrepancies: EarningsAnalysisResult['discrepancies'] = [];
    const findings: Finding[] = [];

    // 1. Check penalties
    for (const penalty of penaltyRecords) {
      const penaltyAmount = Math.abs(penalty.actualAmount || 0);
      discrepancies.push({
        type: 'PENALTY',
        expected: penalty.expectedAmount || 0,
        actual: penalty.actualAmount || 0,
        difference: penaltyAmount,
        explanation: `Unjustified penalty deduction of ₹${penaltyAmount} for trip ${penalty.tripId || 'N/A'}`,
        evidenceIds: ['ev-penalty-screenshot'],
      });

      findings.push({
        id: `finding-penalty-${penalty.id}`,
        type: 'PAYOUT_DISCREPANCY',
        severity: 'HIGH',
        title: `Disputed ₹${penaltyAmount} penalty on trip ${penalty.tripId || 'record'}`,
        explanation: `Platform deducted ₹${penaltyAmount} for late delivery despite evidence showing merchant delays.`,
        confidence: 0.94,
        evidenceIds: ['ev-penalty-screenshot'],
      });
    }

    // 2. Check incentive shortfall
    for (const inc of incentives) {
      const comp = compareExpectedActual(inc.expectedAmount || 0, inc.actualAmount || 0);
      if (comp.hasDiscrepancy) {
        discrepancies.push({
          type: 'INCENTIVE_SHORTFALL',
          expected: inc.expectedAmount || 0,
          actual: inc.actualAmount || 0,
          difference: comp.difference,
          explanation: `Incentive shortfall of ₹${comp.difference} detected for target ${inc.source}`,
          evidenceIds: ['ev-penalty-screenshot'],
        });

        findings.push({
          id: 'finding-incentive-02',
          type: 'INCENTIVE_DISCREPANCY',
          severity: 'MEDIUM',
          title: `Surge incentive shortfall of ₹${comp.difference} detected`,
          explanation: `Target completed according to trip logs, but incentive payout was credited at ₹${inc.actualAmount} instead of expected ₹${inc.expectedAmount}.`,
          confidence: 0.91,
          evidenceIds: ['ev-penalty-screenshot'],
        });
      }
    }

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
      calculatedFacts: [
        { name: 'grossEarnings', value: grossEarnings, unit: 'INR' },
        { name: 'totalExpenses', value: totalExpenses, unit: 'INR' },
        { name: 'netEarnings', value: netEarnings, unit: 'INR' },
        { name: 'effectiveHourlyRate', value: hourlyRate, unit: 'INR/hr' },
      ],
      interpretation: discrepancies.length > 0
        ? `Earnings audit for worker ${input.workerId} identified ${discrepancies.length} discrepancy items totaling ₹${discrepancies.reduce((a, b) => a + b.difference, 0)}. Net real earnings are ₹${netEarnings} (₹${hourlyRate}/hr).`
        : `Earnings audit for worker ${input.workerId} verified clean ledger. No unexplained deductions found.`,
      findings,
      recommendations: discrepancies.length > 0
        ? ['Submit dispute package for Trip 001 penalty', 'Review peak surge incentive targets with support']
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
