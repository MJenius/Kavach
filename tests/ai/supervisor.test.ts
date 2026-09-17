import { describe, it, expect } from 'vitest';
import { SupervisorAgent } from '../../src/agents/supervisor-agent.ts';

describe('SupervisorAgent', () => {
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
