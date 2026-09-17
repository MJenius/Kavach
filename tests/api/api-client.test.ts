import { describe, it, expect } from 'vitest';
import { MockApiClient } from '../../src/api/mock-client.ts';
import { demoWorker } from '../../fixtures/demo-worker.ts';

describe('API Client Layer', () => {
  it('MockApiClient retrieves worker and trip fixtures', async () => {
    const client = new MockApiClient();
    const worker = await client.getWorker(demoWorker.id);
    expect(worker.id).toBe(demoWorker.id);
    expect(worker.name).toBe(demoWorker.name);

    const trips = await client.getTrips(demoWorker.id);
    expect(trips.length).toBeGreaterThan(0);
    expect(trips[0].status).toBe('DISPUTED');
  });

  it('MockApiClient returns reconciled earnings data', async () => {
    const client = new MockApiClient();
    const earnings = await client.getEarnings(demoWorker.id);
    expect(earnings.records.length).toBeGreaterThan(0);
    expect(earnings.expenses.length).toBeGreaterThan(0);
    expect(earnings.grossTotal).toBeDefined();
    expect(earnings.netRealTotal).toBeLessThan(earnings.grossTotal);
  });
});
