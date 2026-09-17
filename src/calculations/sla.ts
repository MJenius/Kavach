export type SLAFeasibility = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export interface SLAFeasibilityResult {
  totalAllocatedSeconds: number;
  waitingDurationSeconds: number;
  remainingSecondsForTransit: number;
  isFeasible: boolean;
  transitShortfallSeconds: number;
  feasibility: SLAFeasibility;
}

export function calculateRemainingSLA(allocatedSeconds: number, waitingSeconds: number): number {
  if (!Number.isFinite(allocatedSeconds) || !Number.isFinite(waitingSeconds)) return 0;
  return Math.max(0, allocatedSeconds - waitingSeconds);
}

export function calculateDelayBeyondSLA(actualSeconds: number, allocatedSeconds: number): number {
  if (!Number.isFinite(actualSeconds) || !Number.isFinite(allocatedSeconds)) return 0;
  return Math.max(0, actualSeconds - allocatedSeconds);
}

export function calculateSLAFeasibility(
  allocatedSlaSeconds: number,
  waitingSeconds: number,
  estimatedTransitSeconds: number
): SLAFeasibilityResult {
  const valid = [allocatedSlaSeconds, waitingSeconds, estimatedTransitSeconds].every(
    (value) => Number.isFinite(value) && value >= 0
  );
  const remaining = valid ? calculateRemainingSLA(allocatedSlaSeconds, waitingSeconds) : 0;
  const shortfall = valid ? Math.max(0, estimatedTransitSeconds - remaining) : 0;
  const ratio = estimatedTransitSeconds > 0 ? remaining / estimatedTransitSeconds : 1;
  return {
    totalAllocatedSeconds: valid ? allocatedSlaSeconds : 0,
    waitingDurationSeconds: valid ? waitingSeconds : 0,
    remainingSecondsForTransit: remaining,
    isFeasible: valid && shortfall === 0,
    transitShortfallSeconds: shortfall,
    feasibility: !valid ? 'UNKNOWN' : shortfall === 0 ? 'HIGH' : ratio >= 0.75 ? 'MEDIUM' : 'LOW',
  };
}
