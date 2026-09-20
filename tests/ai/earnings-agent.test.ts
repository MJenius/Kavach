import { describe, it, expect } from 'vitest';
import { EarningsAgent } from '../../src/agents/earnings-agent.ts';
import type { BedrockLLMProvider } from '../../src/ai/types.ts';

function malformedBedrock(output: Record<string, unknown>): BedrockLLMProvider {
  return {
    modelId: 'test',
    generateText: async () => ({ text: '' }),
    extractDocument: async () => { throw new Error('not used'); },
    generateStructured: async <T>() => ({ success: true, data: output as unknown as T }),
  };
}

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

  it('recovers when Bedrock omits the earnings summary object', async () => {
    const result = await new EarningsAgent(malformedBedrock({ workerId: 'worker-vikram-01', findings: [], confidence: 0.9 })).run({ workerId: 'worker-vikram-01' });

    expect(result.summary).toMatchObject({ grossEarnings: 9120, totalDeductions: 350, netEarnings: 7500, effectiveHourlyRate: 157.73 });
  });

  it('rejects a string summary', async () => {
    const result = await new EarningsAgent(malformedBedrock({ workerId: 'worker-vikram-01', summary: '₹7,500 take-home', findings: [], confidence: 0.9 })).run({ workerId: 'worker-vikram-01' });

    expect(result.summary).not.toBe('₹7,500 take-home');
    expect(result.summary.netEarnings).toBe(7500);
  });

  it('rejects hallucinated earnings values', async () => {
    const result = await new EarningsAgent(malformedBedrock({ workerId: 'worker-vikram-01', summary: { grossEarnings: 9120, totalExpenses: 1270, netEarnings: 9120, totalDeductions: 0, effectiveHourlyRate: 0 }, findings: [], confidence: 0.9 })).run({ workerId: 'worker-vikram-01' });

    expect(result.summary.netEarnings).toBe(7500);
  });
});
