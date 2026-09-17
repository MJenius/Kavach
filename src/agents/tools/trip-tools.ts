import { Trip, TripEvent } from '../../domain/index.ts';
import { demoTrips, demoTripEvents } from '../../../fixtures/demo-worker.ts';

export async function getTrip(tripId: string): Promise<Trip | null> {
  const trip = demoTrips.find((t) => t.id === tripId);
  return trip ?? null;
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

  return {
    allegation: 'Late delivery beyond allocated SLA cutoff',
    penaltyAmount: 350,
    currency: 'INR',
    timestamp: penaltyEvent.timestamp,
  };
}
