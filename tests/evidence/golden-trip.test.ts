import { describe, expect, it } from 'vitest';
import { demoEarnings, demoEvidence, demoFindings, demoTripEvents, demoTrips } from '../../fixtures/demo-worker.ts';
import { LocalEvidenceStore } from '../../src/evidence/store.ts';
import { reconstructTrip } from '../../src/evidence/reconstruction.ts';

describe('canonical ₹350 penalty scenario', () => {
  it('returns deterministic facts with supporting evidence and no AI conclusion', async () => {
    const trip = demoTrips[0];
    const reconstruction = reconstructTrip(trip, demoTripEvents, demoEvidence);
    const evidence = await new LocalEvidenceStore(demoEvidence, demoFindings, demoTripEvents)
      .getEvidenceForFinding('finding-late-penalty-01');
    const penalty = demoEarnings.find((record) => record.type === 'PENALTY');

    expect(Math.abs(penalty?.actualAmount ?? 0)).toBe(350);
    expect(reconstruction).toMatchObject({
      storeWaitSeconds: 420,
      remainingSlaSeconds: 180,
      trafficDelaySeconds: 360,
      slaFeasibility: 'LOW',
    });
    expect(evidence.map(({ id }) => id)).toContain('ev-traffic-alert-koramangala');
    expect(evidence.find(({ id }) => id === 'ev-traffic-alert-koramangala')?.description)
      .toContain('trafficDelaySeconds=360');
    expect(reconstruction.missingEvidence).not.toContain('TRAFFIC_DELAY_DURATION');
  });
});
