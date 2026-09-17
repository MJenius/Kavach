import { roundMoney } from '../calculations/index.ts';
import { SimulationResult } from './trip-simulator.ts';

export interface EarningsSimulationInput {
  grossEarnings: number;
  expenses: number;
  hoursWorked: number;
  additionalHours?: number;
  hourlyGrossRate?: number;
  fuelCostMultiplier?: number;
  missingIncentive?: number;
  applyIncentive?: boolean;
}

export function simulateEarnings(input: EarningsSimulationInput): SimulationResult<{ gross: number; expenses: number; net: number; hours: number }> {
  const additionalHours = input.additionalHours ?? 0;
  const addedGross = additionalHours * (input.hourlyGrossRate ?? 0);
  const incentive = input.applyIncentive ? (input.missingIncentive ?? 0) : 0;
  const baseline = {
    gross: roundMoney(input.grossEarnings),
    expenses: roundMoney(input.expenses),
    net: roundMoney(input.grossEarnings - input.expenses),
    hours: input.hoursWorked,
  };
  const scenario = {
    gross: roundMoney(input.grossEarnings + addedGross + incentive),
    expenses: roundMoney(input.expenses * (input.fuelCostMultiplier ?? 1)),
    net: 0,
    hours: input.hoursWorked + additionalHours,
  };
  scenario.net = roundMoney(scenario.gross - scenario.expenses);
  return {
    baseline,
    scenario,
    difference: {
      gross: roundMoney(scenario.gross - baseline.gross),
      expenses: roundMoney(scenario.expenses - baseline.expenses),
      net: roundMoney(scenario.net - baseline.net),
      hours: scenario.hours - baseline.hours,
    },
    assumptions: [
      ...(additionalHours === 0 ? [] : [`${additionalHours} additional work hours at ₹${input.hourlyGrossRate ?? 0} gross per hour.`]),
      ...(input.fuelCostMultiplier === undefined ? [] : [`Expense multiplier changed to ${input.fuelCostMultiplier}.`]),
      ...(input.applyIncentive ? [`₹${input.missingIncentive ?? 0} missing incentive applied.`] : []),
      'All non-overridden earnings inputs remain unchanged.',
    ],
  };
}
