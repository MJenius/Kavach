import { EarningsRecord, Expense } from '../domain/index.ts';

export const roundMoney = (value: number): number =>
  Number.isFinite(value) ? Math.round((value + Number.EPSILON) * 100) / 100 : 0;

export const calculateGrossEarnings = (records: EarningsRecord[]): number =>
  roundMoney(records.reduce((sum, record) =>
    record.type !== 'PENALTY' && record.type !== 'DEDUCTION' && Number.isFinite(record.actualAmount)
      ? sum + Math.max(0, record.actualAmount!)
      : sum, 0));

export const calculateDeductions = (records: EarningsRecord[]): number =>
  roundMoney(records.reduce((sum, record) =>
    record.type === 'PENALTY' || record.type === 'DEDUCTION'
      ? sum + Math.abs(Number.isFinite(record.actualAmount) ? record.actualAmount! : 0)
      : sum, 0));

export const calculateExpenses = (expenses: Expense[]): number =>
  roundMoney(expenses.reduce((sum, expense) => sum + (Number.isFinite(expense.amount) ? Math.max(0, expense.amount) : 0), 0));

export const calculateNetEarnings = (gross: number, expenses: number): number =>
  roundMoney((Number.isFinite(gross) ? gross : 0) - (Number.isFinite(expenses) ? expenses : 0));

export const calculateRealEarnings = (records: EarningsRecord[], expenses: Expense[]): number =>
  calculateNetEarnings(calculateGrossEarnings(records), calculateDeductions(records) + calculateExpenses(expenses));

export function calculateEffectiveHourlyEarnings(netEarnings: number, hours: number): number {
  return Number.isFinite(hours) && hours > 0 ? roundMoney(netEarnings / hours) : 0;
}

export const calculateEffectiveHourlyWage = (gross: number, expenses: number, hours: number): number =>
  calculateEffectiveHourlyEarnings(calculateNetEarnings(gross, expenses), hours);

export interface PayoutReconciliation {
  expected: number;
  actual: number;
  difference: number;
  status: 'MATCH' | 'UNDERPAID' | 'OVERPAID' | 'MISSING_EXPECTED' | 'MISSING_ACTUAL';
}

export function reconcilePayout(expected?: number, actual?: number): PayoutReconciliation {
  const validExpected = Number.isFinite(expected);
  const validActual = Number.isFinite(actual);
  const expectedValue = validExpected ? roundMoney(expected!) : 0;
  const actualValue = validActual ? roundMoney(actual!) : 0;
  const signedDifference = roundMoney(actualValue - expectedValue);
  const difference = Math.abs(signedDifference);
  const status = !validExpected
    ? 'MISSING_EXPECTED'
    : !validActual
      ? 'MISSING_ACTUAL'
      : signedDifference === 0
        ? 'MATCH'
        : signedDifference < 0
          ? 'UNDERPAID'
          : 'OVERPAID';
  return { expected: expectedValue, actual: actualValue, difference, status };
}
