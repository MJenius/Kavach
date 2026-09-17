import { describe, it, expect } from 'vitest';
import { ForensicsAgent } from '../../src/agents/forensics-agent.ts';

describe('ForensicsAgent', () => {
  it('reconstructs canonical trip trip-2026-09-15-001 with verified telemetry', async () => {
    const agent = new ForensicsAgent();
    const result = await agent.run({ tripId: 'trip-2026-09-15-001' });

    expect(result.tripId).toBe('trip-2026-09-15-001');
    expect(result.reconstruction.waitingDurationSeconds).toBe(420); // 7 minutes
    expect(result.reconstruction.remainingSlaSecondsAfterWait).toBe(180); // 3 minutes of 10m SLA
    expect(result.reconstruction.slaFeasible).toBe(false);
  });

  it('grounds findings in existing fixture evidence IDs', async () => {
    const agent = new ForensicsAgent();
    const result = await agent.run({ tripId: 'trip-2026-09-15-001' });

    expect(result.evidenceIds).toContain('ev-store-arrival-gps');
    expect(result.evidenceIds).toContain('ev-merchant-log');
    expect(result.evidenceIds).toContain('ev-merchant-handover-scan');
    expect(result.findings[0].evidenceIds).toContain('ev-wait-calc');
  });

  it('reports missing evidence and contradictions', async () => {
    const agent = new ForensicsAgent();
    const result = await agent.run({ tripId: 'trip-2026-09-15-001' });

    expect(result.missingEvidence.length).toBeGreaterThan(0);
    expect(result.contradictions.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('fails safely when given a non-existent trip', async () => {
    const agent = new ForensicsAgent();
    await expect(agent.run({ tripId: 'non-existent' })).rejects.toThrow('not found');
  });
});
