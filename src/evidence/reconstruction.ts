import { Evidence, Trip, TripEvent, TripEventType } from '../domain/index.ts';
import { calculateSLAFeasibility, durationSeconds, timestampMs } from '../calculations/index.ts';

const EXPECTED_EVENTS: TripEventType[] = [
  'STORE_ARRIVAL', 'WAITING_STARTED', 'PACKAGE_RECEIVED', 'DELIVERY_STARTED', 'TRAFFIC_EVENT', 'DELIVERY_COMPLETED',
];

export interface TimelineItem extends TripEvent {
  evidence: Evidence[];
  missingEvidenceIds: string[];
}

export interface TripReconstruction {
  tripId: string;
  timeline: TimelineItem[];
  missingEvents: TripEventType[];
  missingEvidenceIds: string[];
  missingEvidence: string[];
  duplicateEvents: TripEventType[];
  storeWaitSeconds: number | null;
  deliveryDurationSeconds: number | null;
  remainingSlaSeconds: number | null;
  delayBeyondSlaSeconds: number | null;
  trafficDelaySeconds: number | null;
  requiredAverageSpeedKph: number | null;
  slaFeasibility: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
}

export function reconstructTrip(trip: Trip, events: TripEvent[], evidence: Evidence[]): TripReconstruction {
  const evidenceById = new Map(evidence.map((item) => [item.id, item]));
  const normalized = events
    .filter((event) => event.tripId === trip.id && timestampMs(event.timestamp) !== null)
    .sort((a, b) => timestampMs(a.timestamp)! - timestampMs(b.timestamp)! || a.id.localeCompare(b.id));
  const counts = new Map<TripEventType, number>();
  for (const event of normalized) counts.set(event.type, (counts.get(event.type) ?? 0) + 1);
  const first = (type: TripEventType) => normalized.find((event) => event.type === type);
  const waitStart = first('WAITING_STARTED') ?? first('STORE_ARRIVAL');
  const packageReceived = first('PACKAGE_RECEIVED');
  const deliveryStarted = first('DELIVERY_STARTED') ?? packageReceived;
  const completed = first('DELIVERY_COMPLETED');
  const traffic = first('TRAFFIC_EVENT');
  const trafficEvidence = (traffic?.evidenceIds ?? [])
    .map((id) => evidenceById.get(id))
    .filter((item): item is Evidence => item !== undefined);
  const trafficDelay = trafficEvidence
    .map((item) => item.description.match(/\btrafficDelaySeconds=(\d+)\b/)?.[1])
    .find((value) => value !== undefined);
  const wait = durationSeconds(waitStart?.timestamp, packageReceived?.timestamp);
  const delivery = durationSeconds(deliveryStarted?.timestamp, completed?.timestamp);
  const total = durationSeconds(trip.startedAt, completed?.timestamp ?? trip.completedAt);
  const remaining = trip.slaSeconds === undefined || wait === null ? null : Math.max(0, trip.slaSeconds - wait);
  const feasibility = trip.slaSeconds === undefined || wait === null || delivery === null
    ? 'UNKNOWN'
    : calculateSLAFeasibility(trip.slaSeconds, wait, delivery).feasibility;
  const requiredSpeed = trip.distanceMeters === undefined || remaining === null || remaining <= 0
    ? null
    : Math.round(((trip.distanceMeters / 1000) / (remaining / 3600)) * 100) / 100;
  const referencedIds = normalized.flatMap((event) => event.evidenceIds ?? []);

  return {
    tripId: trip.id,
    timeline: normalized.map((event) => {
      const ids = event.evidenceIds ?? [];
      return {
        ...event,
        evidence: ids.map((id) => evidenceById.get(id)).filter((item): item is Evidence => item !== undefined),
        missingEvidenceIds: ids.filter((id) => !evidenceById.has(id)),
      };
    }),
    missingEvents: EXPECTED_EVENTS.filter((type) => !counts.has(type)),
    missingEvidenceIds: [...new Set(referencedIds.filter((id) => !evidenceById.has(id)))],
    missingEvidence: traffic && trafficDelay === undefined ? ['TRAFFIC_DELAY_DURATION'] : [],
    duplicateEvents: EXPECTED_EVENTS.filter((type) => (counts.get(type) ?? 0) > 1),
    storeWaitSeconds: wait,
    deliveryDurationSeconds: delivery,
    remainingSlaSeconds: remaining,
    delayBeyondSlaSeconds: trip.slaSeconds === undefined || total === null ? null : Math.max(0, total - trip.slaSeconds),
    trafficDelaySeconds: trafficDelay === undefined ? null : Number(trafficDelay),
    requiredAverageSpeedKph: requiredSpeed,
    slaFeasibility: feasibility,
  };
}
