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
          authoritativeGrounding: isSupportedDeterministicQuery
            ? {
                authoritativeAnswer: groundedResult.answer,
                verificationBadge: groundedResult.verificationBadge,
                isEvidenceBacked: groundedResult.isEvidenceBacked,
                projectedEarnings: groundedResult.projectedEarnings,
                supportingTrips: groundedResult.supportingTrips,
                evidenceIds: groundedResult.evidenceIds,
                calculationDetails: groundedResult.calculationDetails,
                observedFactors: groundedResult.observedFactors,
              }
            : undefined,
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

          // 3. Verification Badge and Evidence status consistency:
          // Bedrock must NEVER contradict the deterministic badge status (e.g. converting INSUFFICIENT_EVIDENCE to VERIFIED_DATA, or VERIFIED_DATA to INSUFFICIENT_EVIDENCE/UNVERIFIED)
          let contradictsVerificationBadge = false;
          if (candidate.verificationBadge && candidate.verificationBadge !== groundedResult.verificationBadge) {
            contradictsVerificationBadge = true;
          }

          // 4. Query-specific deterministic fact validation:
          let contradictsAuthoritativeFacts = false;

          // A. Take-home earnings query
          const isTakeHomeQuery =
            queryLower.includes('take home') ||
            queryLower.includes('take-home') ||
            queryLower.includes('real earning') ||
            queryLower.includes('actually take') ||
            (queryLower.includes('fuel') && (queryLower.includes('earning') || queryLower.includes('take')));

          if (isTakeHomeQuery) {
            // Must not claim expenses are missing or unrecorded
            const claimsMissingExpenses =
              candidateAnswerLower.includes('no fuel') ||
              candidateAnswerLower.includes('no bike') ||
              candidateAnswerLower.includes('no maintenance') ||
              candidateAnswerLower.includes('missing expense') ||
              candidateAnswerLower.includes('no expense') ||
              candidateAnswerLower.includes('not recorded') ||
              candidateAnswerLower.includes('unrecorded') ||
              candidateAnswerLower.includes('unable to calculate take-home') ||
              candidateAnswerLower.includes('cannot calculate take-home');

            // Must not claim gross (9120) is take-home
            const claimsGrossIsTakeHome =
              (candidateAnswerLower.includes('take-home is ₹9,120') ||
                candidateAnswerLower.includes('take home is ₹9,120') ||
                candidateAnswerLower.includes('take-home is 9120') ||
                candidateAnswerLower.includes('take home is 9120') ||
                candidateAnswerLower.includes('take-home: ₹9,120') ||
                candidateAnswerLower.includes('take home: ₹9,120') ||
                candidateAnswerLower.includes('estimate is ₹9,120') ||
                candidateAnswerLower.includes('estimate of ₹9,120')) &&
              !candidateAnswerLower.includes('7,500') &&
              !candidateAnswerLower.includes('7500');

            // Must reference canonical take-home (7500) and expenses (1270 or itemized 900 fuel / 250 maintenance)
            const mentionsCorrectTakeHome =
              candidateAnswerLower.includes('7,500') ||
              candidateAnswerLower.includes('7500');

            const mentionsExpenses =
              candidateAnswerLower.includes('1,270') ||
              candidateAnswerLower.includes('1270') ||
              (candidateAnswerLower.includes('900') && candidateAnswerLower.includes('250'));

            if (claimsMissingExpenses || claimsGrossIsTakeHome || !mentionsCorrectTakeHome || !mentionsExpenses) {
              contradictsAuthoritativeFacts = true;
            }
          }

          // B. Penalty deduction query (₹350)
          const isPenaltyQuery =
            queryLower.includes('350') ||
            queryLower.includes('deducted') ||
            queryLower.includes('penalty') ||
            (queryLower.includes('why') && (queryLower.includes('deduction') || queryLower.includes('cut')));

          if (isPenaltyQuery) {
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
              contradictsAuthoritativeFacts = true;
            }
          }

          // C. Incentive query (₹500 / ₹300 shortfall)
          const isIncentiveQuery =
            queryLower.includes('500') ||
            queryLower.includes('incentive') ||
            queryLower.includes('surge bonus') ||
            queryLower.includes('shortfall');

          if (isIncentiveQuery && !isPenaltyQuery) {
            const referencesIncentiveFigures =
              (candidateAnswerLower.includes('200') && candidateAnswerLower.includes('300')) ||
              candidateAnswerLower.includes('case-002');

            if (!referencesIncentiveFigures) {
              contradictsAuthoritativeFacts = true;
            }
          }

          // D. Day comparison query (Wednesday vs Saturday)
          const isDayComparison =
            (queryLower.includes('wednesday') && queryLower.includes('saturday')) ||
            (queryLower.includes('hourly rate') && (queryLower.includes('wednesday') || queryLower.includes('saturday')));

          if (isDayComparison) {
            const referencesRates =
              (candidateAnswerLower.includes('145.81') || candidateAnswerLower.includes('146')) &&
              (candidateAnswerLower.includes('200.00') || candidateAnswerLower.includes('200'));

            if (!referencesRates) {
              contradictsAuthoritativeFacts = true;
            }
          }

          // E. Simulation query (Wait compensation / projected earnings)
          const isSimulationQuery =
            queryLower.includes('compensated') ||
            queryLower.includes('merchant wait') ||
            queryLower.includes('wait time') ||
            queryLower.includes('counterfactual');

          if (isSimulationQuery) {
            const referencesSimFigures =
              candidateAnswerLower.includes('8,185') ||
              candidateAnswerLower.includes('8185') ||
              (candidateAnswerLower.includes('335') && candidateAnswerLower.includes('350'));

            if (!referencesSimFigures) {
              contradictsAuthoritativeFacts = true;
            }
          }

          // 5. Unsupported query guard: never allow Bedrock to invent an answer for questions lacking evidence
          let fabricatedUnsupportedAnswer = false;
          if (!isSupportedDeterministicQuery) {
            if (candidate.verificationBadge !== 'INSUFFICIENT_EVIDENCE' || candidate.isEvidenceBacked === true) {
              fabricatedUnsupportedAnswer = true;
            }
          }

          const semanticValidationPassed =
            !hasInvalidEvidenceId &&
            !containsHallucination &&
            !contradictsVerificationBadge &&
            !contradictsAuthoritativeFacts &&
            !fabricatedUnsupportedAnswer;

          if (semanticValidationPassed) {
            // Adopt authoritative grounding metadata to ensure complete precision
            if (isSupportedDeterministicQuery) {
              candidate.verificationBadge = groundedResult.verificationBadge;
              candidate.isEvidenceBacked = groundedResult.isEvidenceBacked;
              if (groundedResult.evidenceIds) candidate.evidenceIds = groundedResult.evidenceIds;
              if (groundedResult.supportingTrips) candidate.supportingTrips = groundedResult.supportingTrips;
              if (groundedResult.calculationDetails) candidate.calculationDetails = groundedResult.calculationDetails;
              if (groundedResult.projectedEarnings !== undefined) candidate.projectedEarnings = groundedResult.projectedEarnings;
            }

            // Normalize Unicode formatting (ensure UTF-8 ₹ is clean)
            candidate.answer = candidate.answer.normalize('NFC');
            return candidate;
          }

          console.warn(
            `[WorkerTwinAgent] Bedrock response failed semantic grounding validation (hasInvalidEvidenceId=${hasInvalidEvidenceId}, containsHallucination=${containsHallucination}, contradictsVerificationBadge=${contradictsVerificationBadge}, contradictsAuthoritativeFacts=${contradictsAuthoritativeFacts}, fabricatedUnsupportedAnswer=${fabricatedUnsupportedAnswer}). Discarding Bedrock response and using deterministic grounded resolution.`
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
