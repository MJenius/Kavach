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

  it('HttpApiClient aborts and surfaces a clear timeout error when API response is delayed', async () => {
    const { HttpApiClient } = await import('../../src/api/mock-client.ts');
    // Test client with a fast 50ms timeout
    const client = new HttpApiClient('http://127.0.0.1:54321/api', 50);

    const originalFetch = globalThis.fetch;
    globalThis.fetch = ((_url: any, options?: any) => {
      return new Promise((_resolve, reject) => {
        if (options?.signal) {
          options.signal.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        }
      });
    }) as any;

    try {
      await expect(client.investigateTrip('trip-test-01')).rejects.toThrow(
        /Request timed out after/
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('HttpApiClient surfaces clear network error message on API failure', async () => {
    const { HttpApiClient } = await import('../../src/api/mock-client.ts');
    const client = new HttpApiClient('http://127.0.0.1:54321/api', 5000);

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() => {
      return Promise.resolve({
        ok: false,
        status: 504,
        statusText: 'Gateway Timeout',
        json: () => Promise.reject(new Error('no body')),
      });
    }) as any;

    try {
      await expect(client.investigateTrip('trip-test-01')).rejects.toThrow(
        'API error 504: Gateway Timeout'
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
