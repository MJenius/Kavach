import { describe, expect, it } from 'vitest';
import { demoEvidence, demoTripEvents, demoTrips } from '../../fixtures/demo-worker.ts';
import { reconstructTrip } from '../../src/evidence/reconstruction.ts';

describe('trip reconstruction', () => {
  it('sorts out-of-order events and calculates durations', () => {
    const result = reconstructTrip(demoTrips[0], [...demoTripEvents].reverse(), demoEvidence);
    expect(result.timeline[0].type).toBe('STORE_ARRIVAL');
    expect(result.storeWaitSeconds).toBe(420);
    expect(result.deliveryDurationSeconds).toBe(870);
    expect(result.remainingSlaSeconds).toBe(180);
    expect(result.trafficDelaySeconds).toBe(360);
    expect(result.missingEvidence).not.toContain('TRAFFIC_DELAY_DURATION');
  });

  it('does not infer traffic duration from a timestamp without explicit duration evidence', () => {
    const evidenceWithoutDuration = demoEvidence.map((item) => item.id === 'ev-traffic-alert-koramangala'
      ? { ...item, description: 'Traffic observed at this timestamp.' }
      : item);
    const result = reconstructTrip(demoTrips[0], demoTripEvents, evidenceWithoutDuration);
    expect(result.trafficDelaySeconds).toBeNull();
    expect(result.missingEvidence).toContain('TRAFFIC_DELAY_DURATION');
  });

  it('reports missing events, evidence, and duplicates explicitly', () => {
    const events = [demoTripEvents[0], { ...demoTripEvents[0], id: 'duplicate' }];
    const result = reconstructTrip(demoTrips[0], events, []);
    expect(result.duplicateEvents).toContain('STORE_ARRIVAL');
    expect(result.missingEvents).toContain('PACKAGE_RECEIVED');
    expect(result.missingEvidenceIds).toContain('ev-store-arrival-gps');
  });
});
