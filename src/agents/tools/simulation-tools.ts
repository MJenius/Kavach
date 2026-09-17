import { SimulationEngine } from './types.ts';

class MockSimulationEngine implements SimulationEngine {
  async runSimulation(scenario: {
    workerId: string;
    tripId?: string;
    parameter: string;
    baselineValue: number;
    simulatedValue: number;
  }) {
    if (scenario.parameter === 'WAITING_TIME') {
      const savedMinutes = (scenario.baselineValue - scenario.simulatedValue) / 60;
      const earningsImpact = Math.round(savedMinutes * 4.5);
      return {
        impactOnEarnings: earningsImpact,
        explanation: `Reducing wait time by ${savedMinutes} minutes increases shift throughput by ₹${earningsImpact}.`,
      };
    }
    return {
      impactOnEarnings: 0,
      explanation: 'Simulation completed with neutral earnings impact.',
    };
  }
}

let activeSimulationEngine: SimulationEngine = new MockSimulationEngine();

export function setSimulationEngine(engine: SimulationEngine): void {
  activeSimulationEngine = engine;
}

export async function runSimulation(scenario: {
  workerId: string;
  tripId?: string;
  parameter: string;
  baselineValue: number;
  simulatedValue: number;
}) {
  return activeSimulationEngine.runSimulation(scenario);
}
