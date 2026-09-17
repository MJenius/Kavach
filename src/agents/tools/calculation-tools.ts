import {
  calculateSLAFeasibility,
  calculateDurationSeconds,
  calculateEffectiveHourlyWage,
  SLAFeasibilityResult,
} from '../../calculations/index.ts';

export function calculateWaitingTime(startIso: string, endIso: string): number {
  return calculateDurationSeconds(startIso, endIso);
}

export function evaluateSLAFeasibility(
  allocatedSlaSeconds: number,
  waitingSeconds: number,
  estimatedTransitSeconds: number
): SLAFeasibilityResult {
  return calculateSLAFeasibility(allocatedSlaSeconds, waitingSeconds, estimatedTransitSeconds);
}

export function compareExpectedActual(expected: number, actual: number): {
  difference: number;
  hasDiscrepancy: boolean;
} {
  const difference = expected - actual;
  return {
    difference,
    hasDiscrepancy: difference !== 0,
  };
}

export function calculateEffectiveHourlyRate(
  grossEarnings: number,
  totalExpenses: number,
  totalWorkHours: number
): number {
  return calculateEffectiveHourlyWage(grossEarnings, totalExpenses, totalWorkHours);
}
