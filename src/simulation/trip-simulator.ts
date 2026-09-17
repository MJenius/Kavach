export interface TripSimulationInput {
  waitingSeconds: number;
  trafficDelaySeconds: number;
  deliverySeconds: number;
  waitingSecondsOverride?: number;
  trafficDelaySecondsOverride?: number;
}

export interface SimulationResult<T> {
  baseline: T;
  scenario: T;
  difference: T;
  assumptions: string[];
}

export function simulateTrip(input: TripSimulationInput): SimulationResult<{ totalSeconds: number; waitingSeconds: number; trafficDelaySeconds: number }> {
  const waiting = input.waitingSecondsOverride ?? input.waitingSeconds;
  const traffic = input.trafficDelaySecondsOverride ?? input.trafficDelaySeconds;
  const baseline = {
    totalSeconds: input.deliverySeconds,
    waitingSeconds: input.waitingSeconds,
    trafficDelaySeconds: input.trafficDelaySeconds,
  };
  const scenario = {
    totalSeconds: Math.max(0, input.deliverySeconds - (input.waitingSeconds - waiting) - (input.trafficDelaySeconds - traffic)),
    waitingSeconds: waiting,
    trafficDelaySeconds: traffic,
  };
  return {
    baseline,
    scenario,
    difference: {
      totalSeconds: scenario.totalSeconds - baseline.totalSeconds,
      waitingSeconds: scenario.waitingSeconds - baseline.waitingSeconds,
      trafficDelaySeconds: scenario.trafficDelaySeconds - baseline.trafficDelaySeconds,
    },
    assumptions: [
      ...(input.waitingSecondsOverride === undefined ? [] : [`Store wait changed to ${waiting} seconds.`]),
      ...(input.trafficDelaySecondsOverride === undefined ? [] : [`Traffic delay changed to ${traffic} seconds.`]),
      'All non-overridden trip conditions remain unchanged.',
    ],
  };
}
