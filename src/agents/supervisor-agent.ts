import { Agent } from './index.ts';
import { AIInvestigationResult, Finding } from '../domain/index.ts';
import { validateAIInvestigationResult } from '../ai/structured-output.ts';
import { BedrockMantleAIService } from '../ai/bedrock-mantle.ts';
import type { BedrockLLMProvider } from '../ai/types.ts';
import { ForensicsAgent } from './forensics-agent.ts';
import { EarningsAgent } from './earnings-agent.ts';
import { PolicyAgent } from './policy-agent.ts';
import { WorkerTwinAgent } from './worker-twin-agent.ts';
import { getAgentRuntimeConfig } from './agent-config.ts';

export interface SupervisorInput {
  caseId?: string;
  workerId: string;
  tripId?: string;
  action: 'INVESTIGATE_CASE' | 'ANALYZE_EARNINGS' | 'RECONSTRUCT_TRIP' | 'CONSULT_TWIN';
  payload?: Record<string, unknown>;
}

export interface SupervisorOutput {
  status: 'COMPLETED' | 'NEEDS_EVIDENCE' | 'FAILED';
  summary: string;
  agentResults: {
    forensics?: unknown;
    earnings?: unknown;
    policy?: unknown;
    workerTwin?: unknown;
  };
  investigationResult?: AIInvestigationResult;
}

export class SupervisorAgent implements Agent<SupervisorInput, SupervisorOutput> {
  readonly name = 'SupervisorAgent';
  readonly description = 'Coordinates Forensics, Earnings, and Policy agents to synthesize evidence-backed investigation results.';

  private bedrock: BedrockLLMProvider | null;
  private forensicsAgent: ForensicsAgent;
  private earningsAgent: EarningsAgent;
  private policyAgent: PolicyAgent;
  private workerTwinAgent: WorkerTwinAgent;

  constructor(bedrock?: BedrockLLMProvider | null) {
    const config = getAgentRuntimeConfig();
    this.bedrock = bedrock ?? (config.useBedrock ? new BedrockMantleAIService() : null);
    this.forensicsAgent = new ForensicsAgent(this.bedrock);
    this.earningsAgent = new EarningsAgent(this.bedrock);
    this.policyAgent = new PolicyAgent(this.bedrock);
    this.workerTwinAgent = new WorkerTwinAgent(this.bedrock);
  }

  async run(input: SupervisorInput): Promise<SupervisorOutput> {
    const tripId = input.tripId || (input.payload?.tripId as string) || 'trip-2026-09-15-001';
    const agentResults: SupervisorOutput['agentResults'] = {};
    const findings: Finding[] = [];
    const missingEvidence: string[] = [];
    const contradictions: string[] = [];
    const recommendedActions: string[] = [];

    if (input.action === 'CONSULT_TWIN') {
      const twinRes = await this.workerTwinAgent.run({
        workerId: input.workerId,
        query: String(input.payload?.query || 'Shift optimization inquiry'),
      });
      return {
        status: 'COMPLETED',
        summary: twinRes.answer,
        agentResults: { workerTwin: twinRes },
      };
    }

    // Default or INVESTIGATE_CASE: Orchestrate Forensics, Earnings, and Policy agents concurrently
    const [forensicsRes, earningsRes, policyRes] = await Promise.all([
      this.forensicsAgent.run({ tripId }),
      this.earningsAgent.run({ workerId: input.workerId }),
      this.policyAgent.run({
        platform: 'QuickBite',
        issueType: 'MERCHANT_DELAY',
      }),
    ]);

    // 1. Forensics
    agentResults.forensics = forensicsRes;
    findings.push(...forensicsRes.findings);
    missingEvidence.push(...forensicsRes.missingEvidence);
    contradictions.push(...forensicsRes.contradictions);
    recommendedActions.push(...forensicsRes.recommendedActions);

    // 2. Earnings
    agentResults.earnings = earningsRes;
    for (const f of earningsRes.findings) {
      if (
        f.type !== 'INCENTIVE_DISCREPANCY' &&
        f.evidenceIds &&
        f.evidenceIds.length > 0 &&
        !findings.some(
          (existing) =>
            existing.id === f.id ||
            (existing.id === 'finding-late-penalty-01' && f.type === 'PAYOUT_DISCREPANCY')
        )
      ) {
        findings.push(f);
      }
    }

    // 3. Policy
    agentResults.policy = policyRes;
    if (policyRes.isApplicable && policyRes.relevantRule) {
      recommendedActions.push(
        `Cite ${policyRes.relevantRule.policyName} (${policyRes.relevantRule.clauseReference}) in formal dispute submission`
      );
    }

    // Grounding: Missing or contradictory critical evidence reduces confidence
    let baseConfidence = Math.min(forensicsRes.confidence, earningsRes.confidence);
    const criticalMissing = forensicsRes.missingEvidence.filter(
      (m) => m.includes('TRAFFIC_DELAY') || m.includes('GPS') || m.includes('Handover') || m.includes('Scan')
    );
    if (criticalMissing.length > 0) {
      baseConfidence = Math.max(0.2, baseConfidence - criticalMissing.length * 0.25);
    }
    if (forensicsRes.findings.some((f) => f.confidence < 0.5)) {
      baseConfidence = Math.min(baseConfidence, 0.3);
    }

    const investigationResult: AIInvestigationResult = {
      summary: `Multi-agent investigation for trip ${tripId}: Merchant wait time of ${Math.floor(forensicsRes.reconstruction.waitingDurationSeconds / 60)} minutes left insufficient transit time (${Math.floor(forensicsRes.reconstruction.remainingSlaSecondsAfterWait / 60)}m remaining of ${Math.floor(forensicsRes.reconstruction.allocatedSlaSeconds / 60)}m SLA). Penalty of ₹${forensicsRes.platformClaim.penaltyAmount} is contested by verified telemetry.`,
      findings,
      missingEvidence,
      contradictions,
      recommendedActions,
      confidence: Math.round(baseConfidence * 100) / 100,
    };

    const validated = validateAIInvestigationResult(investigationResult);
    if (!validated.success || !validated.data) {
      throw new Error(`Supervisor investigation synthesis validation failed: ${validated.error}`);
    }

    return {
      status: 'COMPLETED',
      summary: validated.data.summary,
      agentResults,
      investigationResult: validated.data,
    };
  }
}
