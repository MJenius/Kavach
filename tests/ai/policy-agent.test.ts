import { describe, it, expect } from 'vitest';
import { PolicyAgent } from '../../src/agents/policy-agent.ts';

describe('PolicyAgent', () => {
  it('retrieves and explains QuickBite merchant delay policy', async () => {
    const agent = new PolicyAgent();
    const result = await agent.run({ platform: 'QuickBite', issueType: 'MERCHANT_DELAY' });

    expect(result.isApplicable).toBe(true);
    expect(result.sourceUnavailable).toBe(false);
    expect(result.relevantRule?.clauseReference).toContain('Merchant Delay Policy');
    expect(result.isLegalAdvice).toBe(false);
  });

  it('gracefully handles unavailable policy sources without hallucinating citations', async () => {
    const agent = new PolicyAgent();
    const result = await agent.run({ platform: 'UnknownPlatform', issueType: 'UNKNOWN_ISSUE' });

    expect(result.isApplicable).toBe(false);
    expect(result.sourceUnavailable).toBe(true);
    expect(result.relevantRule).toBeUndefined();
    expect(result.isLegalAdvice).toBe(false);
  });
});
