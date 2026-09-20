import { EarningsRecord, Expense, Trip, FinancialSummary } from '../domain/index.ts';

export const roundMoney = (value: number): number =>
  Number.isFinite(value) ? Math.round((value + Number.EPSILON) * 100) / 100 : 0;

export const calculatePlatformGrossPayout = (records: EarningsRecord[]): number =>
  roundMoney(
    records.reduce((sum, r) => {
      if (['BASE_PAY', 'INCENTIVE', 'BONUS', 'ADJUSTMENT'].includes(r.type) && r.actualAmount && r.actualAmount > 0) {
        return sum + r.actualAmount;
      }
      return sum;
    }, 0)
  );

export const calculatePenalties = (records: EarningsRecord[]): number =>
  roundMoney(
    records.reduce((sum, r) => {
      if (r.type === 'PENALTY' && r.actualAmount && r.actualAmount < 0) {
        return sum + Math.abs(r.actualAmount);
      }
      return sum;
    }, 0)
  );

export const calculateDeductions = (records: EarningsRecord[]): number =>
  roundMoney(
    records.reduce((sum, r) => {
      if (['PENALTY', 'DEDUCTION'].includes(r.type) && r.actualAmount && r.actualAmount < 0) {
        return sum + Math.abs(r.actualAmount);
      }
      return sum;
    }, 0)
  );

export const calculatePlatformNetPayout = (gross: number, penalties: number, otherDeductions: number): number =>
  roundMoney(gross - penalties - otherDeductions);

export const calculateExpenses = (expenses: Expense[]): number =>
  roundMoney(
    expenses.reduce((sum, e) => {
      if (e.amount && e.amount > 0) {
        return sum + e.amount;
      }
      return sum;
    }, 0)
  );

export const calculateActiveHoursFromTrips = (trips: Trip[]): number => {
  if (!trips.length) return 0;
  
  // Group by day
  const days: Record<string, { start: Date; end: Date }> = {};
  for (const t of trips) {
    if (!t.startedAt || !t.completedAt) continue;
    const start = new Date(t.startedAt);
    const end = new Date(t.completedAt);
    const dateStr = start.toISOString().split('T')[0];
    
    if (!days[dateStr]) {
      days[dateStr] = { start, end };
    } else {
      if (start < days[dateStr].start) days[dateStr].start = start;
      if (end > days[dateStr].end) days[dateStr].end = end;
    }
  }

  let totalMs = 0;
  for (const dateStr in days) {
    totalMs += days[dateStr].end.getTime() - days[dateStr].start.getTime();
  }

  return roundMoney(totalMs / (1000 * 60 * 60));
};

export const calculateDisputedAmount = (records: EarningsRecord[]): number => {
  return roundMoney(
    records.reduce((sum, r) => {
      if (r.type === 'PENALTY' && r.actualAmount && r.actualAmount < 0) {
        return sum + Math.abs(r.actualAmount);
      }
      return sum;
    }, 0)
  );
};

export const calculateUnresolvedAmount = (records: EarningsRecord[]): number => {
  return roundMoney(
    records.reduce((sum, r) => {
      if (r.type === 'INCENTIVE' && r.expectedAmount && r.actualAmount !== undefined) {
        const diff = r.expectedAmount - r.actualAmount;
        if (diff > 0) return sum + diff;
      }
      return sum;
    }, 0)
  );
};

export const calculateFinancialSummary = (
  records: EarningsRecord[],
  expenses: Expense[],
  trips: Trip[]
): FinancialSummary => {
  const platformGrossPayout = calculatePlatformGrossPayout(records);
  const penalties = calculatePenalties(records);
  
  const allDeductions = calculateDeductions(records);
  // In our simplified model, otherDeductions is just allDeductions - penalties
  // Or we just compute platformNetPayout as gross - allDeductions directly
  const platformNetPayout = calculatePlatformNetPayout(platformGrossPayout, 0, allDeductions);

  const fuelExpenses = roundMoney(expenses.filter(e => e.type === 'FUEL').reduce((s, e) => s + e.amount, 0));
  const phoneExpenses = roundMoney(expenses.filter(e => e.type === 'PHONE').reduce((s, e) => s + e.amount, 0));
  const otherExpenses = roundMoney(expenses.filter(e => !['FUEL', 'PHONE'].includes(e.type)).reduce((s, e) => s + e.amount, 0));
  const totalExpenses = calculateExpenses(expenses);

  const estimatedRealEarnings = roundMoney(platformNetPayout - totalExpenses);
  const activeHours = calculateActiveHoursFromTrips(trips);
  const effectiveHourlyRate = activeHours > 0 ? roundMoney(estimatedRealEarnings / activeHours) : 0;
  
  const incentives = roundMoney(records.filter(r => r.type === 'INCENTIVE').reduce((s, r) => s + (r.actualAmount || 0), 0));
  
  return {
    platformGrossPayout,
    penalties,
    incentives,
    deductions: allDeductions,
    platformNetPayout,
    fuelExpenses,
    phoneExpenses,
    otherExpenses,
    totalExpenses,
    estimatedRealEarnings,
    activeHours,
    effectiveHourlyRate,
    disputedAmount: calculateDisputedAmount(records),
    unresolvedAmount: calculateUnresolvedAmount(records),
    deliveryCount: trips.length,

    // Backwards compatibility aliases
    grossEarnings: platformGrossPayout,
    netEarnings: estimatedRealEarnings,
    discrepancyTotal: calculateDisputedAmount(records) + calculateUnresolvedAmount(records),
  };
};

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

// Preserve existing exports for backward compatibility if needed:
export const calculateGrossEarnings = calculatePlatformGrossPayout;
export const calculateNetEarnings = (gross: number, expenses: number): number => roundMoney(gross - expenses);
export const calculateRealEarnings = (records: EarningsRecord[], expenses: Expense[]): number =>
  roundMoney(calculatePlatformNetPayout(calculatePlatformGrossPayout(records), 0, calculateDeductions(records)) - calculateExpenses(expenses));
export const calculateEffectiveHourlyEarnings = (netEarnings: number, hours: number): number =>
  Number.isFinite(hours) && hours > 0 ? roundMoney(netEarnings / hours) : 0;
export const calculateEffectiveHourlyWage = (gross: number, expenses: number, hours: number): number =>
  calculateEffectiveHourlyEarnings(calculateNetEarnings(gross, expenses), hours);
