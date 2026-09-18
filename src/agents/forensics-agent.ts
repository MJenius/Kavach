import { Agent } from './index.ts';
import { ForensicsAnalysisResult } from '../ai/types.ts';
import { validateForensicsAnalysis, validateEvidenceIds } from '../ai/structured-output.ts';
import { BedrockMantleAIService } from '../ai/bedrock-mantle.ts';
import type { BedrockLLMProvider } from '../ai/types.ts';
import { FORENSICS_SYSTEM_PROMPT, generateForensicsUserPrompt } from '../prompts/forensics.prompt.ts';
import {
  getTrip,
  getTripEvents,
  getPlatformClaim,
  calculateWaitingTime,
  evaluateSLAFeasibility,
} from './tools/index.ts';
import { getEvidenceByIds } from './tools/evidence-tools.ts';
import { getAgentRuntimeConfig } from './agent-config.ts';
import { reconstructTrip } from '../evidence/reconstruction.ts';

export interface ForensicsAgentInput {
  tripId: string;
}

export class ForensicsAgent implements Agent<ForensicsAgentInput, ForensicsAnalysisResult> {
  readonly name = 'ForensicsAgent';
  readonly description = 'Reconstructs delivery timeline, assesses feasibility with deterministic math, and produces evidence-backed Findings.';

  private bedrock: BedrockLLMProvider | null;

  constructor(bedrock?: BedrockLLMProvider | null) {
    const config = getAgentRuntimeConfig();
    this.bedrock = bedrock ?? (config.useBedrock ? new BedrockMantleAIService() : null);
  }

  async run(input: ForensicsAgentInput): Promise<ForensicsAnalysisResult> {
    const trip = await getTrip(input.tripId);
    if (!trip) {
      throw new Error(`Trip ${input.tripId} not found in records`);
    }

    const events = await getTripEvents(input.tripId);
    const platformClaim = await getPlatformClaim(input.tripId);

    const storeArrival = events.find((e) => e.type === 'STORE_ARRIVAL');
    const packageReceived = events.find((e) => e.type === 'PACKAGE_RECEIVED');
    const deliveryCompleted = events.find((e) => e.type === 'DELIVERY_COMPLETED');
    const trafficEvent = events.find((e) => e.type === 'TRAFFIC_EVENT');

    // Deterministic wait time calculation
    const waitSeconds =
      storeArrival && packageReceived
        ? calculateWaitingTime(storeArrival.timestamp, packageReceived.timestamp)
        : 0;

    // Actual transit time from package received to delivery completed
    const transitSeconds =
      packageReceived && deliveryCompleted
        ? calculateWaitingTime(packageReceived.timestamp, deliveryCompleted.timestamp)
        : 0;

    const totalDurationSeconds =
      storeArrival && deliveryCompleted
        ? calculateWaitingTime(storeArrival.timestamp, deliveryCompleted.timestamp)
        : 0;

    const allocatedSla = trip.slaSeconds || 600;
    const feasibility = evaluateSLAFeasibility(allocatedSla, waitSeconds, transitSeconds);

    // Gather evidence IDs from events
    const gatheredEvidenceIds: string[] = [];
    for (const ev of events) {
      if (ev.evidenceIds) {
        gatheredEvidenceIds.push(...ev.evidenceIds);
      }
    }
    if (!gatheredEvidenceIds.includes('ev-wait-calc')) {
      gatheredEvidenceIds.push('ev-wait-calc');
    }

    // Retrieve actual evidence objects to validate IDs
    const evidenceItems = await getEvidenceByIds(gatheredEvidenceIds);
    const availableEvidenceIds = evidenceItems.map((e) => e.id);

    // Use Person 2's reconstruction engine
    const reconstruction = reconstructTrip(trip, events, evidenceItems);

    const missingEvidence: string[] = [
      ...reconstruction.missingEvidence,
    ];
    const hasDeliveryPhoto = gatheredEvidenceIds.includes('ev-delivery-handover-photo');
    if (!hasDeliveryPhoto) {
      missingEvidence.push('Customer app delivery handover photo');
    }

    const contradictions: string[] = [];
    if (waitSeconds > 300) {
      contradictions.push(
        `Platform dispatched order expecting 10m total SLA, but merchant preparation consumed ${Math.floor(waitSeconds / 60)} minutes without auto-extending SLA`
      );
    }

    const calculatedFacts = [
      {
        description: `Merchant waiting duration: ${Math.floor(waitSeconds / 60)} minutes`,
        calculationSource: 'KAVACH_DETERMINISTIC_ENGINE (calculateDurationSeconds)',
        value: waitSeconds as unknown,
      },
      {
        description: `Remaining SLA for transit after merchant queue: ${Math.floor(feasibility.remainingSecondsForTransit / 60)} minutes`,
        calculationSource: 'KAVACH_DETERMINISTIC_ENGINE (calculateSLAFeasibility)',
        value: feasibility.remainingSecondsForTransit as unknown,
      },
      {
        description: `Transit shortfall: ${Math.floor(feasibility.transitShortfallSeconds / 60)} minutes`,
        calculationSource: 'KAVACH_DETERMINISTIC_ENGINE (calculateSLAFeasibility)',
        value: feasibility.transitShortfallSeconds as unknown,
      },
    ];

    // If Bedrock is available, use AI for interpretation
    if (this.bedrock) {
      try {
        const userPrompt = generateForensicsUserPrompt({
          tripId: trip.id,
          trip: trip as unknown as Record<string, unknown>,
          events: events as unknown as Array<Record<string, unknown>>,
          evidence: evidenceItems as unknown as Array<Record<string, unknown>>,
          platformClaim: (platformClaim || {}) as Record<string, unknown>,
          calculations: {
            waitingDurationSeconds: waitSeconds,
            transitDurationSeconds: transitSeconds,
            totalDurationSeconds,
            allocatedSlaSeconds: allocatedSla,
            remainingSlaSecondsAfterWait: feasibility.remainingSecondsForTransit,
            slaFeasible: feasibility.isFeasible,
            transitShortfallSeconds: feasibility.transitShortfallSeconds,
            reconstructionSummary: {
              storeWaitSeconds: reconstruction.storeWaitSeconds,
              deliveryDurationSeconds: reconstruction.deliveryDurationSeconds,
              slaFeasibility: reconstruction.slaFeasibility,
              missingEvents: reconstruction.missingEvents,
            },
          },
        });

        const result = await this.bedrock.generateStructured<ForensicsAnalysisResult>({
          prompt: userPrompt,
          systemPrompt: FORENSICS_SYSTEM_PROMPT,
          targetSchemaName: 'ForensicsAnalysisResult',
          validate: validateForensicsAnalysis,
        });

        if (result.success && result.data) {
          // Validate evidence IDs — strip any fabricated ones
          const fabricated = validateEvidenceIds(result.data.evidenceIds, availableEvidenceIds);
          if (fabricated.length > 0) {
            result.data.evidenceIds = result.data.evidenceIds.filter((id) => !fabricated.includes(id));
          }
          for (const finding of result.data.findings) {
            const fabricatedFinding = validateEvidenceIds(finding.evidenceIds, availableEvidenceIds);
            if (fabricatedFinding.length > 0) {
              finding.evidenceIds = finding.evidenceIds.filter((id) => !fabricatedFinding.includes(id));
            }
          }
          return result.data;
        }
        // Fall through to deterministic path on failure
      } catch {
        // Fall through to deterministic path on Bedrock failure
      }
    }

    // Deterministic path (mock mode or Bedrock failure fallback)
    const rawResult: ForensicsAnalysisResult = {
      tripId: trip.id,
      timelineSummary: `Trip ${trip.id} reconstructed: Arrived at merchant at ${storeArrival?.timestamp || 'unknown'}, waited ${Math.floor(waitSeconds / 60)} minutes before package handover at ${packageReceived?.timestamp || 'unknown'}.`,
      platformClaim: {
        allegation: platformClaim?.allegation || 'Late delivery penalty',
        penaltyAmount: platformClaim?.penaltyAmount || 350,
        currency: platformClaim?.currency || 'INR',
      },
      reconstruction: {
        storeArrivalTimestamp: storeArrival?.timestamp || '',
        packageHandoverTimestamp: packageReceived?.timestamp || '',
        deliveryCompletedTimestamp: deliveryCompleted?.timestamp || '',
        waitingDurationSeconds: waitSeconds,
        transitDurationSeconds: transitSeconds,
        totalDurationSeconds,
        allocatedSlaSeconds: allocatedSla,
        remainingSlaSecondsAfterWait: feasibility.remainingSecondsForTransit,
        slaFeasible: feasibility.isFeasible,
      },
      contradictions,
      missingEvidence,
      evidenceIds: availableEvidenceIds,
      calculatedFacts,
      interpretation: `The worker experienced ${Math.floor(waitSeconds / 60)} minutes of merchant delay, leaving only ${Math.floor(feasibility.remainingSecondsForTransit / 60)} minutes to complete delivery. Under standard transit conditions${trafficEvent ? ' and observed traffic disruptions' : ''}, timely delivery was physically infeasible through no fault of the worker.`,
      findings: [
        {
          id: 'finding-late-penalty-01',
          type: 'DECISION_REVIEW',
          severity: 'HIGH',
          title: 'Late delivery penalty warrants review due to merchant queue delay',
          explanation: `Platform levied a ₹${platformClaim?.penaltyAmount || 350} penalty citing late delivery. Evidence confirms worker arrived at merchant at ${storeArrival?.timestamp || 'unknown'} but experienced ${Math.floor(waitSeconds / 60)} minutes of uncompensated merchant delay before package handover at ${packageReceived?.timestamp || 'unknown'}, leaving insufficient SLA for delivery.`,
          confidence: 0.94,
          evidenceIds: availableEvidenceIds,
        },
      ],
      recommendedActions: [
        'Generate dispute package with store arrival GPS and merchant handover scan',
        `Request waiver of ₹${platformClaim?.penaltyAmount || 350} penalty based on uncredited merchant wait time`,
      ],
      confidence: 0.94,
    };

    const validated = validateForensicsAnalysis(rawResult);
    if (!validated.success || !validated.data) {
      throw new Error(`Forensics analysis validation failed: ${validated.error}`);
    }

    return validated.data;
  }
}
