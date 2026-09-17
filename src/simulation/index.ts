import { CounterfactualScenario } from '../domain/index.ts';
export { simulateTrip } from './trip-simulator.ts';
export { simulateEarnings } from './earnings-simulator.ts';
export type { TripSimulationInput, SimulationResult } from './trip-simulator.ts';
export type { EarningsSimulationInput } from './earnings-simulator.ts';

export interface SimulationEngine {
  simulateScenario(
    workerId: string,
    parameter: 'WAITING_TIME' | 'HOURS_WORKED' | 'FUEL_COST' | 'INCENTIVE_APPLIED',
    delta: number
  ): Promise<CounterfactualScenario>;
  runSimulation(scenario: {
    workerId: string;
    tripId?: string;
    parameter: string;
    baselineValue: number;
    simulatedValue: number;
  }): Promise<{ impactOnEarnings: number; explanation: string }>;
}

export class DeterministicSimulationEngine implements SimulationEngine {
  async simulateScenario(
    workerId: string,
    parameter: 'WAITING_TIME' | 'HOURS_WORKED' | 'FUEL_COST' | 'INCENTIVE_APPLIED',
    delta: number
  ): Promise<CounterfactualScenario> {
    const baselineValue = parameter === 'WAITING_TIME' ? 7 : 0;
    const simulatedValue = baselineValue + delta;
    return {
      id: `sim-${workerId}-${parameter}-${simulatedValue}`,
      workerId,
      parameter,
      baselineValue,
      simulatedValue,
      impactOnEarnings: parameter === 'INCENTIVE_APPLIED' ? Math.max(0, delta) : 0,
      explanation: `${parameter} changed from ${baselineValue} to ${simulatedValue}; all other inputs were held constant.`,
    };
  }

  async runSimulation(scenario: {
    workerId: string;
    tripId?: string;
    parameter: string;
    baselineValue: number;
    simulatedValue: number;
  }): Promise<{ impactOnEarnings: number; explanation: string }> {
    const difference = scenario.simulatedValue - scenario.baselineValue;
    return {
      impactOnEarnings: scenario.parameter === 'INCENTIVE_APPLIED' ? Math.max(0, difference) : 0,
      explanation: `${scenario.parameter} changed by ${difference}; baseline evidence was not modified.`,
    };
  }
}

export class MockSimulationEngine extends DeterministicSimulationEngine {}
