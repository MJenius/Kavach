import { describe, expect, it } from 'vitest';
import { reconcileIncentive } from '../../src/calculations/index.ts';

describe('incentive reconciliation', () => {
  it('covers correct, underpaid, overpaid, ineligible, and incomplete evidence', () => {
    expect(reconcileIncentive(500, 500, true).status).toBe('MATCH');
    expect(reconcileIncentive(500, 200, true).status).toBe('UNDERPAID');
    expect(reconcileIncentive(200, 500, true).status).toBe('OVERPAID');
    expect(reconcileIncentive(500, 0, false).status).toBe('MATCH');
    expect(reconcileIncentive(500, 200, undefined, false).missingEvidence).toEqual(['INCENTIVE_RULE', 'ELIGIBILITY']);
  });
});
