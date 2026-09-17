/**
 * Programmatic, deterministic calculations (Section 24).
 * LLMs must NOT perform arithmetic. Code handles numbers and time intervals.
 */

export interface SLAFeasibilityResult {
  totalAllocatedSeconds: number;
  waitingDurationSeconds: number;
  remainingSecondsForTransit: number;
  isFeasible: boolean;
  transitShortfallSeconds: number;
}

/**
 * Calculates whether the remaining delivery time was feasible given merchant waiting time.
 */
export function calculateSLAFeasibility(
  allocatedSlaSeconds: number,
  waitingSeconds: number,
  estimatedTransitSeconds: number
): SLAFeasibilityResult {
  const remainingSecondsForTransit = allocatedSlaSeconds - waitingSeconds;
  const shortfall = estimatedTransitSeconds - remainingSecondsForTransit;
  return {
    totalAllocatedSeconds: allocatedSlaSeconds,
    waitingDurationSeconds: waitingSeconds,
    remainingSecondsForTransit,
    isFeasible: shortfall <= 0,
    transitShortfallSeconds: Math.max(0, shortfall),
  };
}

/**
 * Calculates wait time in seconds between two ISO timestamps.
 */
export function calculateDurationSeconds(startIso: string, endIso: string): number {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return Math.max(0, Math.floor((end - start) / 1000));
}

/**
 * Calculates effective hourly wage after deducting fuel/operational expenses.
 */
export function calculateEffectiveHourlyWage(
  grossEarnings: number,
  totalExpenses: number,
  totalWorkHours: number
): number {
  if (totalWorkHours <= 0) return 0;
  const netEarnings = grossEarnings - totalExpenses;
  return Math.round((netEarnings / totalWorkHours) * 100) / 100;
}
