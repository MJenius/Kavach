import { Trip, TripEvent } from '../../domain/index.ts';
import { demoTrips, demoTripEvents, demoEarnings } from '../../../fixtures/demo-worker.ts';

export async function getTrip(tripId: string): Promise<Trip | null> {
  const trip = demoTrips.find((t) => t.id === tripId);
  return trip ?? null;
}

export async function getTrips(workerId: string): Promise<Trip[]> {
  return demoTrips.filter((trip) => trip.workerId === workerId);
}

export async function getTripEvents(tripId: string): Promise<TripEvent[]> {
  return demoTripEvents.filter((evt) => evt.tripId === tripId);
}

export async function getPlatformClaim(tripId: string): Promise<{
  allegation: string;
  penaltyAmount: number;
  currency: string;
  timestamp: string;
} | null> {
  const penaltyEvent = demoTripEvents.find(
    (evt) => evt.tripId === tripId && evt.type === 'PLATFORM_PENALTY'
  );
  if (!penaltyEvent) return null;

  const penaltyRecord = demoEarnings.find(
    (e) => e.tripId === tripId && e.type === 'PENALTY'
  );
  const penaltyAmount = penaltyRecord ? Math.abs(penaltyRecord.actualAmount || 0) : 350;
  const currency = penaltyRecord ? penaltyRecord.currency : 'INR';

  return {
    allegation: 'Late delivery beyond allocated SLA cutoff',
    penaltyAmount,
    currency,
    timestamp: penaltyEvent.timestamp,
  };
}
