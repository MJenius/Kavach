import { describe, expect, it } from 'vitest';
import { DeterministicSimulationEngine, simulateEarnings, simulateTrip } from '../../src/simulation/index.ts';

describe('counterfactual simulation', () => {
  it('preserves baseline and applies trip overrides', () => {
    const input = { waitingSeconds: 420, trafficDelaySeconds: 360, deliverySeconds: 1440, waitingSecondsOverride: 0 };
    const result = simulateTrip(input);
    expect(result.baseline.waitingSeconds).toBe(420);
    expect(result.scenario.waitingSeconds).toBe(0);
    expect(result.difference.totalSeconds).toBe(-420);
    expect(result.assumptions).not.toHaveLength(0);
  });

  it('simulates hours, fuel, and incentive deterministically', async () => {
    const input = { grossEarnings: 1000, expenses: 200, hoursWorked: 10, additionalHours: 2, hourlyGrossRate: 100, fuelCostMultiplier: 1.1, missingIncentive: 300, applyIncentive: true };
    expect(simulateEarnings(input)).toEqual(simulateEarnings(input));
    expect(simulateEarnings(input).difference.net).toBe(480);
    const engine = new DeterministicSimulationEngine();
    expect(await engine.runSimulation({ workerId: 'w', parameter: 'INCENTIVE_APPLIED', baselineValue: 200, simulatedValue: 500 })).toMatchObject({ impactOnEarnings: 300 });
  });
});
