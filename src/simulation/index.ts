import { CounterfactualScenario } from '../domain/index.ts';

/**
 * ============================================================================
 * Counterfactual Simulator Placeholder (Person 2 - feature/evidence-engine)
 * ============================================================================
 * Answers: "What would have happened if X were different?" (Section 22)
 *
 * NOTE: Simulation calculations must be programmatic and deterministic.
 * LLMs may suggest what scenarios to test, but arithmetic is executed here.
 * ============================================================================
 */

export interface SimulationEngine {
  simulateScenario(
    workerId: string,
    parameter: 'WAITING_TIME' | 'HOURS_WORKED' | 'FUEL_COST' | 'INCENTIVE_APPLIED',
    delta: number
  ): Promise<CounterfactualScenario>;
}

export class MockSimulationEngine implements SimulationEngine {
  async simulateScenario(
    workerId: string,
    parameter: 'WAITING_TIME' | 'HOURS_WORKED' | 'FUEL_COST' | 'INCENTIVE_APPLIED',
    delta: number
  ): Promise<CounterfactualScenario> {
    return {
      id: `sim-${Date.now()}`,
      workerId,
      parameter,
      baselineValue: 7, // 7 min wait
      simulatedValue: 7 + delta,
      impactOnEarnings: delta < 0 ? 350 : 0, // eliminating delay prevents late penalty
      explanation: `Reducing merchant wait time by ${Math.abs(delta)} minutes maintains SLA feasibility and prevents late penalty deduction.`,
    };
  }
}
