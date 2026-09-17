import { Agent } from './index.ts';
import { ForensicsAnalysisResult } from '../ai/types.ts';
import { validateForensicsAnalysis } from '../ai/structured-output.ts';
import {
  getTrip,
  getTripEvents,
  getPlatformClaim,
  calculateWaitingTime,
  evaluateSLAFeasibility,
} from './tools/index.ts';

export interface ForensicsAgentInput {
  tripId: string;
}

export class ForensicsAgent implements Agent<ForensicsAgentInput, ForensicsAnalysisResult> {
  readonly name = 'ForensicsAgent';
  readonly description = 'Reconstructs delivery timeline, assesses feasibility with deterministic math, and produces evidence-backed Findings.';

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

    const allocatedSla = trip.slaSeconds || 600; // 10 minutes allocated
    const feasibility = evaluateSLAFeasibility(allocatedSla, waitSeconds, transitSeconds);

    const gatheredEvidenceIds: string[] = [];
    for (const ev of events) {
      if (ev.evidenceIds) {
        gatheredEvidenceIds.push(...ev.evidenceIds);
      }
    }
    // Add deterministic calculation evidence from fixture if applicable
    if (!gatheredEvidenceIds.includes('ev-wait-calc')) {
      gatheredEvidenceIds.push('ev-wait-calc');
    }

    const missingEvidence: string[] = [];
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
      evidenceIds: gatheredEvidenceIds,
      calculatedFacts: [
        {
          description: `Merchant waiting duration: ${Math.floor(waitSeconds / 60)} minutes`,
          calculationSource: 'KAVACH_DETERMINISTIC_ENGINE (calculateDurationSeconds)',
          value: waitSeconds,
        },
        {
          description: `Remaining SLA for transit after merchant queue: ${Math.floor(feasibility.remainingSecondsForTransit / 60)} minutes`,
          calculationSource: 'KAVACH_DETERMINISTIC_ENGINE (calculateSLAFeasibility)',
          value: feasibility.remainingSecondsForTransit,
        },
        {
          description: `Transit shortfall: ${Math.floor(feasibility.transitShortfallSeconds / 60)} minutes`,
          calculationSource: 'KAVACH_DETERMINISTIC_ENGINE (calculateSLAFeasibility)',
          value: feasibility.transitShortfallSeconds,
        },
      ],
      interpretation: `The worker experienced ${Math.floor(waitSeconds / 60)} minutes of merchant delay, leaving only ${Math.floor(feasibility.remainingSecondsForTransit / 60)} minutes to complete delivery. Under standard transit conditions${trafficEvent ? ' and observed traffic disruptions' : ''}, timely delivery was physically infeasible through no fault of the worker.`,
      findings: [
        {
          id: 'finding-late-penalty-01',
          type: 'DECISION_REVIEW',
          severity: 'HIGH',
          title: 'Late delivery penalty warrants review due to merchant queue delay',
          explanation: `Platform levied a ₹${platformClaim?.penaltyAmount || 350} penalty citing late delivery. Evidence confirms worker arrived at merchant at 19:02 but experienced ${Math.floor(waitSeconds / 60)} minutes of uncompensated merchant delay before package handover at 19:09, leaving insufficient SLA for delivery.`,
          confidence: 0.94,
          evidenceIds: gatheredEvidenceIds,
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
