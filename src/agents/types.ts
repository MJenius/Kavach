export interface Agent<TInput = Record<string, unknown>, TOutput = Record<string, unknown>> {
  readonly name: string;
  readonly description: string;
  run(input: TInput): Promise<TOutput>;
}

export interface AgentContext {
  workerId?: string;
  tripId?: string;
  caseId?: string;
  evidenceIds?: string[];
  metadata?: Record<string, unknown>;
}

export interface AgentExecutionResult<T> {
  agentName: string;
  success: boolean;
  data?: T;
  error?: string;
  executionTimestamp: string;
}
