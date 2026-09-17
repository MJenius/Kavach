import {
  Finding,
  WorkerTwinQuery,
  WorkerTwinResponse,
} from '../domain/index.ts';

/**
 * Common agent contract. Every specialized agent implements or delegates to this interface.
 */
export interface Agent<TInput = Record<string, unknown>, TOutput = Record<string, unknown>> {
  readonly name: string;
  readonly description: string;
  run(input: TInput): Promise<TOutput>;
}

/**
 * 1. Supervisor Agent (Coordinates specialized agents)
 */
export interface SupervisorInput {
  caseId?: string;
  workerId: string;
  action: 'INVESTIGATE_CASE' | 'ANALYZE_EARNINGS' | 'RECONSTRUCT_TRIP' | 'CONSULT_TWIN';
  payload?: Record<string, unknown>;
}

export interface SupervisorOutput {
  status: 'COMPLETED' | 'NEEDS_EVIDENCE' | 'FAILED';
  summary: string;
  agentResults: Record<string, unknown>;
  finalFinding?: Finding;
}

export class MockSupervisorAgent implements Agent<SupervisorInput, SupervisorOutput> {
  readonly name = 'SupervisorAgent';
  readonly description = 'Coordinates Earnings, Forensics, and Policy agents to investigate discrepancies.';

  async run(input: SupervisorInput): Promise<SupervisorOutput> {
    return {
      status: 'COMPLETED',
      summary: `Investigation orchestrated for worker ${input.workerId}. Discrepancy confirmed in trip SLA.`,
      agentResults: {
        forensics: { storeWaitingMinutes: 7, remainingSLAMinutes: 3 },
        earnings: { penaltyAmount: 350, warranted: false },
        policy: { relevantClause: 'QuickBite Partner SLA Section 4.2 - Merchant Delay Exemption' },
      },
    };
  }
}

/**
 * 2. Earnings Agent (Section 18)
 * Investigates "Why did my earnings change?"
 */
export interface EarningsAgentInput {
  workerId: string;
  timeframe?: string;
}

export interface EarningsAgentOutput {
  incomeSummary: {
    grossEarnings: number;
    netRealEarnings: number;
    totalDeductions: number;
    effectiveHourlyRate: number;
  };
  discrepancies: string[];
  recommendations: string[];
}

export class MockEarningsAgent implements Agent<EarningsAgentInput, EarningsAgentOutput> {
  readonly name = 'EarningsAgent';
  readonly description = 'Reconciles expected vs actual payouts, incentives, and deductions.';

  async run(_input: EarningsAgentInput): Promise<EarningsAgentOutput> {
    return {
      incomeSummary: {
        grossEarnings: 8460,
        netRealEarnings: 5070,
        totalDeductions: 350,
        effectiveHourlyRate: 95,
      },
      discrepancies: ['Disputed ₹350 late penalty', 'Uncredited peak surge bonus of ₹300'],
      recommendations: ['Submit dispute package for Trip 001', 'Log fuel expenses to claim deduction tracker'],
    };
  }
}

/**
 * 3. Forensics Agent (Section 19)
 * Investigates "What happened during this trip?"
 */
export interface ForensicsAgentInput {
  tripId: string;
}

export interface ForensicsAgentOutput {
  timelineSummary: string;
  platformClaim: string;
  independentReconstruction: {
    merchantWaitSeconds: number;
    trafficDelaySeconds: number;
    actualTransitSeconds: number;
  };
  contradictions: string[];
  confidence: number;
}

export class MockForensicsAgent implements Agent<ForensicsAgentInput, ForensicsAgentOutput> {
  readonly name = 'ForensicsAgent';
  readonly description = 'Reconstructs trip timeline using multimodal evidence and telemetry.';

  async run(input: ForensicsAgentInput): Promise<ForensicsAgentOutput> {
    return {
      timelineSummary: `Trip ${input.tripId} reconstructed: Arrived at merchant 19:02, Handover 19:09 (7m wait).`,
      platformClaim: 'Delivery late by 8 minutes without merchant delay acknowledgment.',
      independentReconstruction: {
        merchantWaitSeconds: 420,
        trafficDelaySeconds: 360,
        actualTransitSeconds: 870,
      },
      contradictions: ['Platform dispatch log does not account for 7 min kitchen queue'],
      confidence: 0.94,
    };
  }
}

/**
 * 4. Policy Agent (Section 20)
 * Retrieves and explains relevant platform policies and regulations.
 */
export interface PolicyAgentInput {
  platform: string;
  issueType: string;
}

export interface PolicyAgentOutput {
  policyCitation: string;
  interpretation: string;
  isLegalAdvice: false;
}

export class MockPolicyAgent implements Agent<PolicyAgentInput, PolicyAgentOutput> {
  readonly name = 'PolicyAgent';
  readonly description = 'Explains platform service level agreements and regulatory norms without legal advice.';

  async run(input: PolicyAgentInput): Promise<PolicyAgentOutput> {
    return {
      policyCitation: `${input.platform} Delivery Partner Agreement, Section 4.2.1 (Merchant Handover Delays)`,
      interpretation:
        'When order preparation exceeds 5 minutes at store, delivery partner SLA must automatically adjust or be waived upon evidence submission.',
      isLegalAdvice: false,
    };
  }
}

/**
 * 5. Worker Twin Agent (Section 21)
 * Historical operating profile & counterfactual advisor.
 */
export class MockWorkerTwinAgent implements Agent<WorkerTwinQuery, WorkerTwinResponse> {
  readonly name = 'WorkerTwinAgent';
  readonly description = 'Reasoning agent representing worker historical profile and earning strategies.';

  async run(_input: WorkerTwinQuery): Promise<WorkerTwinResponse> {
    return {
      answer: `Based on your past 90 days of deliveries, shifts between 18:00 and 22:00 yield ₹140/hr on QuickBite in Koramangala. Avoiding Merchant Hub 4b during Friday rush increases effective earnings by ~18%.`,
      projectedEarnings: 1250,
      optimalHours: ['18:00 - 22:00', '12:00 - 14:30'],
      observedFactors: ['High restaurant wait times on Friday evenings', 'Surge zones in Koramangala'],
      confidence: 0.89,
    };
  }
}
