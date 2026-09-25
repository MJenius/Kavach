import { describe, it, expect } from 'vitest';
import { keepEvidenceBackedFindings, SupervisorAgent } from '../../src/agents/supervisor-agent.ts';
import { getEvidence } from '../../src/agents/tools/index.ts';

describe('SupervisorAgent', () => {
  it('does not promote unsupported specialist findings during synthesis', () => {
    const known = new Set(['ev-valid']);
    const base = {
      id: 'finding', type: 'PAYOUT_DISCREPANCY' as const, severity: 'HIGH' as const,
      title: 'Finding', explanation: 'Claim', confidence: 0.9,
    };
    expect(keepEvidenceBackedFindings([
      { ...base, evidenceIds: ['ev-valid'] },
      { ...base, id: 'missing', evidenceIds: [] },
      { ...base, id: 'forged', evidenceIds: ['ev-forged'] },
      { ...base, id: 'mixed', evidenceIds: ['ev-valid', 'ev-forged'] },
    ], known).map((finding) => finding.id)).toEqual(['finding']);
  });

  it('coordinates multi-agent investigation and synthesizes evidence-backed result', async () => {
    const supervisor = new SupervisorAgent();
    const result = await supervisor.run({
      workerId: 'worker-vikram-01',
      tripId: 'trip-2026-09-15-001',
      action: 'INVESTIGATE_CASE',
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.agentResults.forensics).toBeDefined();
    expect(result.agentResults.earnings).toBeDefined();
    expect(result.agentResults.policy).toBeDefined();

    expect(result.investigationResult).toBeDefined();
    expect(result.investigationResult?.findings.length).toBeGreaterThan(0);
    expect(result.investigationResult?.confidence).toBeGreaterThan(0.9);
    const knownIds = new Set((await getEvidence('worker-vikram-01')).map((item) => item.id));
    expect(result.investigationResult?.findings.every((finding) =>
      finding.evidenceIds.length > 0 && finding.evidenceIds.every((id) => knownIds.has(id))
    )).toBe(true);
  });

  it('delegates to WorkerTwin for twin queries', async () => {
    const supervisor = new SupervisorAgent();
    const result = await supervisor.run({
      workerId: 'worker-vikram-01',
      action: 'CONSULT_TWIN',
      payload: { query: 'optimal shift hours' },
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.agentResults.workerTwin).toBeDefined();
  });
});
