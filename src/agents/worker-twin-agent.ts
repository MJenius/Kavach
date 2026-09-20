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

    // Deterministic resolution: source of authoritative facts
    const { resolveGroundedWorkerQuery } = await import('../ai/grounded-query-engine.ts');
    const groundedResult = resolveGroundedWorkerQuery({
      workerId: input.workerId,
      query: input.query,
    });

    // Check if query is canonical supported query (e.g. ₹350 penalty, take-home, incentive, hourly rate, simulation, review)
    const isSupportedDeterministicQuery = groundedResult.verificationBadge !== 'INSUFFICIENT_EVIDENCE';

    // If Bedrock is available, use AI for natural language reasoning
    if (this.bedrock) {
      try {
        const userPrompt = generateWorkerTwinUserPrompt({
          workerId: input.workerId,
          query: input.query,
          historicalMetrics,
          simulationResults,
        });

        let result = await this.bedrock.generateStructured<WorkerTwinResponse>({
          prompt: userPrompt,
          systemPrompt: WORKER_TWIN_SYSTEM_PROMPT,
          targetSchemaName: 'WorkerTwinResponse',
          validate: validateWorkerTwinResponse,
        });

        // Controlled repair retry if the response was invalid or empty
        if (!result.success || !result.data || !result.data.answer || !result.data.answer.trim()) {
          console.warn(
            `[WorkerTwinAgent] Initial Bedrock generation failed validation: ${result.error || 'empty answer'}. Attempting schema repair retry.`
          );

          const repairPrompt = `${userPrompt}\n\nCRITICAL ERROR: Your previous response failed schema validation: "${result.error || 'answer must be a non-empty string'}". You MUST return a valid JSON object conforming to WorkerTwinResponse with a comprehensive, non-empty "answer" property explaining the facts directly to the worker.`;

          result = await this.bedrock.generateStructured<WorkerTwinResponse>({
            prompt: repairPrompt,
            systemPrompt: WORKER_TWIN_SYSTEM_PROMPT,
            targetSchemaName: 'WorkerTwinResponse',
            validate: validateWorkerTwinResponse,
          });
        }

        // Semantic evidence validation:
        // Do NOT treat a structurally valid Bedrock response as evidence-backed merely because it has non-empty answer/evidenceIds.
        if (result.success && result.data && typeof result.data.answer === 'string' && result.data.answer.trim().length > 0) {
          const candidate = result.data;
          const candidateAnswerLower = candidate.answer.toLowerCase();

          // 1. Validate evidence IDs against real evidence store
          const { getEvidence } = await import('./tools/index.ts');
          const allKnownEvidence = await getEvidence(input.workerId);
          const knownEvidenceIds = new Set(allKnownEvidence.map((e) => e.id));

          let hasInvalidEvidenceId = false;
          if (Array.isArray(candidate.evidenceIds)) {
            for (const id of candidate.evidenceIds) {
              if (!knownEvidenceIds.has(id)) {
                hasInvalidEvidenceId = true;
                break;
              }
            }
          }

          // 2. Reject hallucinated/fabricated causal explanations absent from canonical evidence
          const forbiddenHallucinations = [
            'disciplinary',
            'repeated cancellation',
            'acceptance rate',
            'cancelling orders',
            'order cancellation',
            'fraud',
            'suspension',
            'tax deduction',
            'tds',
            'platform fee deduction',
          ];
          const containsHallucination = forbiddenHallucinations.some((term) =>
            candidateAnswerLower.includes(term)
          );

          // 3. For canonical supported queries (like the ₹350 penalty), check consistency with deterministic facts
          const isPenaltyQuery =
            queryLower.includes('350') ||
            queryLower.includes('deducted') ||
            queryLower.includes('penalty') ||
            (queryLower.includes('why') && (queryLower.includes('deduction') || queryLower.includes('cut')));

          let violatesPenaltyTruth = false;
          if (isPenaltyQuery) {
            // Must reference the actual merchant delay and SLA sequence
            const referencesMerchantDelay =
              candidateAnswerLower.includes('merchant') ||
              candidateAnswerLower.includes('kitchen') ||
              candidateAnswerLower.includes('restaurant') ||
              candidateAnswerLower.includes('wait') ||
              candidateAnswerLower.includes('delay');

            const referencesSlaOrTime =
              candidateAnswerLower.includes('sla') ||
              candidateAnswerLower.includes('7 min') ||
              candidateAnswerLower.includes('3 min') ||
              candidateAnswerLower.includes('19:02') ||
              candidateAnswerLower.includes('19:09') ||
              candidateAnswerLower.includes('trip-2026-09-15-001');

            if (!referencesMerchantDelay || !referencesSlaOrTime) {
              violatesPenaltyTruth = true;
            }
          }

          // 4. Unsupported query guard: never allow Bedrock to invent an answer for questions lacking evidence
          let fabricatedUnsupportedAnswer = false;
          if (!isSupportedDeterministicQuery && candidate.verificationBadge !== 'INSUFFICIENT_EVIDENCE') {
            // If the canonical dataset lacks evidence for this question, Bedrock cannot invent an evidence-backed answer
            fabricatedUnsupportedAnswer = true;
          }

          const semanticValidationPassed =
            !hasInvalidEvidenceId &&
            !containsHallucination &&
            !violatesPenaltyTruth &&
            !fabricatedUnsupportedAnswer;

          if (semanticValidationPassed) {
            // Normalize Unicode formatting (ensure UTF-8 ₹ is clean)
            candidate.answer = candidate.answer.normalize('NFC');
            return candidate;
          }

          console.warn(
            `[WorkerTwinAgent] Bedrock response failed semantic grounding validation (hasInvalidEvidenceId=${hasInvalidEvidenceId}, containsHallucination=${containsHallucination}, violatesPenaltyTruth=${violatesPenaltyTruth}, fabricatedUnsupportedAnswer=${fabricatedUnsupportedAnswer}). Discarding Bedrock response and using deterministic grounded resolution.`
          );
        } else {
          // Log schema validation failure
          console.warn(
            `[WorkerTwinAgent] Bedrock structured generation failed schema validation: ${result.error || 'Empty or invalid answer'}. Falling back to deterministic grounded engine for query: "${input.query}".`
          );
        }
      } catch (err) {
        // Log the exception cleanly for production observability
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn(
          `[WorkerTwinAgent] Bedrock invocation threw an exception: ${errMsg}. Falling back to deterministic grounded engine for query: "${input.query}".`
        );
      }
    }

    // Deterministic safe path: return validated groundedResult using real evidence/earnings records
    const validated = validateWorkerTwinResponse(groundedResult);
    if (!validated.success || !validated.data) {
      throw new Error(`Worker twin validation failed: ${validated.error}`);
    }

    // Ensure Unicode normalization
    validated.data.answer = validated.data.answer.normalize('NFC');
    return validated.data;
  }
}
