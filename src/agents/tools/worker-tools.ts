import { Worker } from '../../domain/index.ts';
import { demoWorker } from '../../../fixtures/demo-worker.ts';

export async function getWorker(workerId: string): Promise<Worker | null> {
  if (workerId === demoWorker.id) {
    return demoWorker;
  }
  return null;
}
