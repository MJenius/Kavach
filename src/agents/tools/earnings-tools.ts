import { EarningsRecord, Expense } from '../../domain/index.ts';
import { demoEarnings, demoExpenses } from '../../../fixtures/demo-worker.ts';

export async function getEarnings(workerId: string): Promise<EarningsRecord[]> {
  return demoEarnings.filter((e) => e.workerId === workerId);
}

export async function getExpenses(workerId: string): Promise<Expense[]> {
  return demoExpenses.filter((e) => e.workerId === workerId);
}

export async function getIncentives(workerId: string): Promise<EarningsRecord[]> {
  return demoEarnings.filter((e) => e.workerId === workerId && e.type === 'INCENTIVE');
}
