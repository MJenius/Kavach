import { describe, it, expect } from 'vitest';
import {
  calculatePlatformGrossPayout,
  calculatePenalties,
  calculatePlatformNetPayout,
  calculateActiveHoursFromTrips,
  calculateFinancialSummary,
  calculateDisputedAmount,
  calculateUnresolvedAmount,
} from '../../src/calculations/earnings.ts';
import { EarningsRecord, Trip, Expense } from '../../src/domain/index.ts';

describe('Financial Model Calculations', () => {
  it('calculatePlatformGrossPayout ignores penalties and negative amounts', () => {
    const records: EarningsRecord[] = [
      { id: '1', type: 'BASE_PAY', actualAmount: 50, currency: 'INR', workerId: '', timestamp: '', source: '' },
      { id: '2', type: 'PENALTY', actualAmount: -350, currency: 'INR', workerId: '', timestamp: '', source: '' },
      { id: '3', type: 'INCENTIVE', actualAmount: 150, currency: 'INR', workerId: '', timestamp: '', source: '' },
      { id: '4', type: 'BASE_PAY', actualAmount: -10, currency: 'INR', workerId: '', timestamp: '', source: '' },
    ];
    const gross = calculatePlatformGrossPayout(records);
    expect(gross).toBe(200);
  });

  it('calculatePenalties only sums absolute negative penalty values', () => {
    const records: EarningsRecord[] = [
      { id: '1', type: 'BASE_PAY', actualAmount: 50, currency: 'INR', workerId: '', timestamp: '', source: '' },
      { id: '2', type: 'PENALTY', actualAmount: -350, currency: 'INR', workerId: '', timestamp: '', source: '' },
      { id: '3', type: 'PENALTY', actualAmount: 50, currency: 'INR', workerId: '', timestamp: '', source: '' }, // Should be ignored (positive)
    ];
    const penalties = calculatePenalties(records);
    expect(penalties).toBe(350);
  });

  it('calculatePlatformNetPayout performs correct math', () => {
    expect(calculatePlatformNetPayout(500, 100, 50)).toBe(350);
    expect(calculatePlatformNetPayout(0, 50, 0)).toBe(-50);
  });

  it('calculateActiveHoursFromTrips computes hours grouped by day correctly', () => {
    const trips: Trip[] = [
      { id: '1', workerId: 'w', platform: 'p', status: 'C', startedAt: '2026-09-14T10:00:00+05:30', completedAt: '2026-09-14T11:00:00+05:30' },
      { id: '2', workerId: 'w', platform: 'p', status: 'C', startedAt: '2026-09-14T10:30:00+05:30', completedAt: '2026-09-14T12:00:00+05:30' },
      // Day 1 total: 10:00 to 12:00 = 2 hours
      { id: '3', workerId: 'w', platform: 'p', status: 'C', startedAt: '2026-09-15T18:00:00+05:30', completedAt: '2026-09-15T19:30:00+05:30' },
      // Day 2 total: 1.5 hours
    ];
    const hours = calculateActiveHoursFromTrips(trips);
    expect(hours).toBe(3.5);
  });

  it('calculateDisputedAmount isolates penalties accurately', () => {
    const records: EarningsRecord[] = [
      { id: '1', type: 'PENALTY', actualAmount: -350, currency: 'INR', workerId: '', timestamp: '', source: '' },
      { id: '2', type: 'PENALTY', actualAmount: -50, currency: 'INR', workerId: '', timestamp: '', source: '' },
    ];
    expect(calculateDisputedAmount(records)).toBe(400);
  });

  it('calculateUnresolvedAmount accurately tracks incentive shortfalls', () => {
    const records: EarningsRecord[] = [
      { id: '1', type: 'INCENTIVE', expectedAmount: 500, actualAmount: 200, currency: 'INR', workerId: '', timestamp: '', source: '' }, // 300 shortfall
      { id: '2', type: 'INCENTIVE', expectedAmount: 150, actualAmount: 150, currency: 'INR', workerId: '', timestamp: '', source: '' }, // 0
      { id: '3', type: 'BASE_PAY', expectedAmount: 100, actualAmount: 50, currency: 'INR', workerId: '', timestamp: '', source: '' }, // Ignored, not INCENTIVE
    ];
    expect(calculateUnresolvedAmount(records)).toBe(300);
  });

  it('calculateFinancialSummary reconciles properly', () => {
    const records: EarningsRecord[] = [
      { id: '1', type: 'BASE_PAY', actualAmount: 500, currency: 'INR', workerId: '', timestamp: '', source: '' },
      { id: '2', type: 'INCENTIVE', expectedAmount: 500, actualAmount: 200, currency: 'INR', workerId: '', timestamp: '', source: '' },
      { id: '3', type: 'PENALTY', actualAmount: -350, currency: 'INR', workerId: '', timestamp: '', source: '' },
    ];
    const expenses: Expense[] = [
      { id: '1', workerId: '', type: 'FUEL', amount: 200, timestamp: '', source: '' },
      { id: '2', workerId: '', type: 'PHONE', amount: 50, timestamp: '', source: '' },
    ];
    const trips: Trip[] = [
      { id: '1', workerId: 'w', platform: 'p', status: 'C', startedAt: '2026-09-14T10:00:00+05:30', completedAt: '2026-09-14T14:00:00+05:30' },
    ]; // 4 hours

    const summary = calculateFinancialSummary(records, expenses, trips);

    expect(summary.platformGrossPayout).toBe(700); // 500 + 200
    expect(summary.penalties).toBe(350);
    expect(summary.deductions).toBe(350);
    expect(summary.platformNetPayout).toBe(350); // 700 - 350
    
    expect(summary.fuelExpenses).toBe(200);
    expect(summary.phoneExpenses).toBe(50);
    expect(summary.otherExpenses).toBe(0);
    expect(summary.totalExpenses).toBe(250);

    expect(summary.estimatedRealEarnings).toBe(100); // 350 - 250
    expect(summary.activeHours).toBe(4);
    expect(summary.effectiveHourlyRate).toBe(25); // 100 / 4

    expect(summary.disputedAmount).toBe(350);
    expect(summary.unresolvedAmount).toBe(300); // 500 - 200
  });

  it('Edge cases: empty arrays and negative values', () => {
    const summary = calculateFinancialSummary([], [], []);
    expect(summary.platformGrossPayout).toBe(0);
    expect(summary.platformNetPayout).toBe(0);
    expect(summary.totalExpenses).toBe(0);
    expect(summary.estimatedRealEarnings).toBe(0);
    expect(summary.activeHours).toBe(0);
    expect(summary.effectiveHourlyRate).toBe(0);
    expect(summary.disputedAmount).toBe(0);
    expect(summary.unresolvedAmount).toBe(0);
  });
});
