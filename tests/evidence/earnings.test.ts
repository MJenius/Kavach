import { describe, expect, it } from 'vitest';
import { demoEarnings, demoExpenses } from '../../fixtures/demo-worker.ts';
import {
  calculateDeductions, calculateEffectiveHourlyEarnings, calculateExpenses, calculateGrossEarnings,
  calculateNetEarnings, calculateRealEarnings, reconcilePayout, roundMoney,
} from '../../src/calculations/index.ts';

describe('earnings calculations', () => {
  it('calculates gross, deductions, expenses, net, and hourly earnings', () => {
    expect(calculateGrossEarnings(demoEarnings)).toBe(265);
    expect(calculateDeductions(demoEarnings)).toBe(350);
    expect(calculateExpenses(demoExpenses)).toBe(345);
    expect(calculateRealEarnings(demoEarnings, demoExpenses)).toBe(-430);
    expect(calculateNetEarnings(8460, 3390)).toBe(5070);
    expect(calculateEffectiveHourlyEarnings(5070, 53)).toBe(95.66);
  });

  it('handles zero hours, invalid values, negative expenses, and rounding', () => {
    expect(calculateEffectiveHourlyEarnings(100, 0)).toBe(0);
    expect(roundMoney(Number.NaN)).toBe(0);
    expect(roundMoney(1.005)).toBe(1.01);
    expect(calculateExpenses([{ ...demoExpenses[0], amount: -10 }])).toBe(0);
  });

  it('reconciles matching, underpaid, overpaid, and missing payouts', () => {
    expect(reconcilePayout(500, 200)).toEqual({ expected: 500, actual: 200, difference: 300, status: 'UNDERPAID' });
    expect(reconcilePayout(200, 500).status).toBe('OVERPAID');
    expect(reconcilePayout(200, 200).status).toBe('MATCH');
    expect(reconcilePayout(undefined, 200).status).toBe('MISSING_EXPECTED');
  });
});
