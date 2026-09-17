import { describe, it, expect } from 'vitest';
import { WorkerTwinAgent } from '../../src/agents/worker-twin-agent.ts';

describe('WorkerTwinAgent', () => {
  it('answers shift optimization query using simulation and historical patterns', async () => {
    const agent = new WorkerTwinAgent();
    const result = await agent.run({
      workerId: 'worker-vikram-01',
      query: 'How can I improve my earnings tomorrow?',
    });

    expect(result.answer).toBeDefined();
    expect(result.optimalHours).toBeDefined();
    expect(result.observedFactors.some((f) => f.includes('Simulation projection'))).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.85);
  });

  it('answers bottleneck questions with observed historical facts', async () => {
    const agent = new WorkerTwinAgent();
    const result = await agent.run({
      workerId: 'worker-vikram-01',
      query: 'Where am I losing money?',
    });

    expect(result.answer).toContain('350');
    expect(result.observedFactors.some((f) => f.includes('merchant wait'))).toBe(true);
  });
});
