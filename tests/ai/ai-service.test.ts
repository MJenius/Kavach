import { describe, it, expect } from 'vitest';
import { MockAIService } from '../../src/ai/service.ts';
import { MockSupervisorAgent } from '../../src/agents/index.ts';

describe('AI Layer Isolation & Mocks', () => {
  it('MockAIService investigates case and returns structured result', async () => {
    const service = new MockAIService();
    const result = await service.investigateCase('test-trip-001');

    expect(result).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0.9);
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.findings[0].evidenceIds).toContain('ev-store-arrival-gps');
  });

  it('SupervisorAgent coordinates agent workflows in mock mode', async () => {
    const supervisor = new MockSupervisorAgent();
    const output = await supervisor.run({
      workerId: 'worker-vikram-01',
      action: 'INVESTIGATE_CASE',
    });

    expect(output.status).toBe('COMPLETED');
    expect(output.agentResults.forensics).toBeDefined();
  });
});
