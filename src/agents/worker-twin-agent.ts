import { Agent } from './index.ts';
import { WorkerTwinQuery, WorkerTwinResponse } from '../domain/index.ts';
import { validateWorkerTwinResponse } from '../ai/structured-output.ts';
import { BedrockMantleAIService } from '../ai/bedrock-mantle.ts';
import type { BedrockLLMProvider } from '../ai/types.ts';
import { WORKER_TWIN_SYSTEM_PROMPT, generateWorkerTwinUserPrompt } from '../prompts/worker-twin.prompt.ts';
import { getWorker, getEarnings, runSimulation } from './tools/index.ts';
import { getAgentRuntimeConfig } from './agent-config.ts';
import { calculateGrossEarnings } from '../calculations/earnings.ts';

export class WorkerTwinAgent implements Agent<WorkerTwinQuery, WorkerTwinResponse> {
  readonly name = 'WorkerTwinAgent';
  readonly description = 'Personalized worker intelligence answering historical earnings and bottleneck questions using evidence and counterfactual simulation.';

  private bedrock: BedrockLLMProvider | null;

  constructor(bedrock?: BedrockLLMProvider | null) {
    const config = getAgentRuntimeConfig();
    this.bedrock = bedrock ?? (config.useBedrock ? new BedrockMantleAIService() : null);
  }

  async run(input: WorkerTwinQuery): Promise<WorkerTwinResponse> {
    const worker = await getWorker(input.workerId);
    if (!worker) {
      throw new Error(`Worker ${input.workerId} not found`);
    }

    const earnings = await getEarnings(input.workerId);
    const grossTotal = calculateGrossEarnings(earnings);

    let simulationResults: Record<string, unknown> | undefined;
    const queryLower = input.query.toLowerCase();
    const needsSimulation = queryLower.includes('improve') || queryLower.includes('tomorrow') || queryLower.includes('shift');

    if (needsSimulation) {
      const sim = await runSimulation({
        workerId: input.workerId,
        parameter: 'WAITING_TIME',
        baselineValue: 420,
        simulatedValue: 120,
      });
      simulationResults = sim as unknown as Record<string, unknown>;
    }

    const historicalMetrics = {
      workerName: worker.name,
      platforms: worker.platforms,
      grossTotal,
      earningsBreakdown: earnings.map((e) => ({ type: e.type, amount: e.actualAmount, source: e.source })),
    };

    // If Bedrock is available, use AI for natural language reasoning
    if (this.bedrock) {
      try {
        const userPrompt = generateWorkerTwinUserPrompt({
          workerId: input.workerId,
          query: input.query,
          historicalMetrics,
          simulationResults,
        });

        const result = await this.bedrock.generateStructured<WorkerTwinResponse>({
          prompt: userPrompt,
          systemPrompt: WORKER_TWIN_SYSTEM_PROMPT,
          targetSchemaName: 'WorkerTwinResponse',
          validate: validateWorkerTwinResponse,
        });

        if (result.success && result.data) {
          return result.data;
        }
        if (process.env.MOCK_AI === 'false') {
          throw new Error(`Bedrock structured generation failed in WorkerTwinAgent: ${result.error || 'unknown error'}`);
        }
      } catch (err) {
        if (process.env.MOCK_AI === 'false') {
          throw err;
        }
      }
    }

    // Deterministic path: route through resolveGroundedWorkerQuery for evidence-grounded responses
    const { resolveGroundedWorkerQuery } = await import('../ai/grounded-query-engine.ts');
    const groundedResult = resolveGroundedWorkerQuery({
      workerId: input.workerId,
      query: input.query,
    });

    const validated = validateWorkerTwinResponse(groundedResult);
    if (!validated.success || !validated.data) {
      throw new Error(`Worker twin validation failed: ${validated.error}`);
    }

    return validated.data;
  }
}
