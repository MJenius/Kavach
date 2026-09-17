import { describe, it, expect } from 'vitest';
import { EarningsAgent } from '../../src/agents/earnings-agent.ts';

describe('EarningsAgent', () => {
  it('detects late penalty and surge incentive shortfall on canonical worker', async () => {
    const agent = new EarningsAgent();
    const result = await agent.run({ workerId: 'worker-vikram-01' });

    expect(result.workerId).toBe('worker-vikram-01');
    expect(result.summary.totalDeductions).toBe(350);
    expect(typeof result.summary.effectiveHourlyRate).toBe('number');

    const penaltyDisc = result.discrepancies.find((d) => d.type === 'PENALTY');
    expect(penaltyDisc).toBeDefined();
    expect(penaltyDisc?.difference).toBe(350);

    const incentiveDisc = result.discrepancies.find((d) => d.type === 'INCENTIVE_SHORTFALL');
    expect(incentiveDisc).toBeDefined();
    expect(incentiveDisc?.difference).toBe(300); // 500 expected - 200 actual
  });

  it('invokes deterministic calculation tools for arithmetic', async () => {
    const agent = new EarningsAgent();
    const result = await agent.run({ workerId: 'worker-vikram-01' });

    const grossCalc = result.calculatedFacts.find((f) => f.name === 'grossEarnings');
    expect(grossCalc).toBeDefined();
    expect(result.summary.grossEarnings).toBe(grossCalc?.value);
  });
});
