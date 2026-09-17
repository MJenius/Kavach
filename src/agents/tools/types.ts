export interface Tool<TInput = Record<string, unknown>, TOutput = unknown> {
  name: string;
  description: string;
  execute(input: TInput): Promise<TOutput>;
}

export interface SimulationEngine {
  runSimulation(scenario: {
    workerId: string;
    tripId?: string;
    parameter: string;
    baselineValue: number;
    simulatedValue: number;
  }): Promise<{
    impactOnEarnings: number;
    explanation: string;
  }>;
}

export interface PolicyRepository {
  findPolicy(platform: string, issueType: string): Promise<{
    policyName: string;
    clauseReference: string;
    summaryText: string;
    sourceUri?: string;
  } | null>;
}
