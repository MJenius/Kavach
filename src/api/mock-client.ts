import { KavachApiClient } from './client.ts';
import {
  Worker,
  Trip,
  Case,
  AIInvestigationResult,
  WorkerTwinQuery,
  WorkerTwinResponse,
} from '../domain/index.ts';
import {
  demoWorker,
  demoTrips,
  demoEarnings,
  demoExpenses,
  demoCases,
  canonicalInvestigationResult,
} from '../../fixtures/demo-worker.ts';
import { resolveGroundedWorkerQuery } from '../ai/grounded-query-engine.ts';

/**
 * MockApiClient implements KavachApiClient purely in-memory using canonical fixtures.
 * Enables zero-dependency offline development for Frontend and UI testing.
 */
export class MockApiClient implements KavachApiClient {

  async getWorker(workerId: string): Promise<Worker> {
    if (workerId === demoWorker.id) {
      return demoWorker;
    }
    return {
      id: workerId,
      name: 'Demo Partner',
      preferredLanguage: 'en',
      platforms: ['QuickBite'],
    };
  }

  async getTrips(_workerId: string): Promise<Trip[]> {
    return demoTrips;
  }

  async getTrip(tripId: string): Promise<Trip | null> {
    return demoTrips.find((t) => t.id === tripId) || null;
  }

  async getEarnings(_workerId: string) {
    const grossTotal = demoEarnings.reduce((acc, curr) => acc + (curr.actualAmount || 0), 0);
    const expensesTotal = demoExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    return {
      records: demoEarnings,
      expenses: demoExpenses,
      grossTotal,
      netRealTotal: grossTotal - expensesTotal,
    };
  }

  async getCases(_workerId: string): Promise<Case[]> {
    return demoCases;
  }

  async getCase(caseId: string): Promise<Case | null> {
    return demoCases.find((c) => c.id === caseId) || null;
  }

  async investigateTrip(_tripId: string): Promise<AIInvestigationResult> {
    return canonicalInvestigationResult;
  }

  async queryWorkerTwin(query: WorkerTwinQuery): Promise<WorkerTwinResponse> {
    return resolveGroundedWorkerQuery({
      workerId: query.workerId,
      query: query.query,
    });
  }

  async generateEvidencePackage(caseId: string): Promise<{ packageUri: string; generatedAt: string }> {
    return {
      packageUri: `s3://kavach-evidence-bucket/packages/${caseId}-dispute-package.pdf`,
      generatedAt: new Date().toISOString(),
    };
  }
}

/**
 * HttpApiClient delegates requests to the mock server or API Gateway endpoint.
 */
export class HttpApiClient implements KavachApiClient {
  private baseUrl: string;

  private defaultTimeoutMs: number;

  constructor(baseUrl?: string, defaultTimeoutMs: number = 120000) {
    this.baseUrl = (baseUrl || 'http://localhost:3001/api').replace(/\/+$/, '');
    this.defaultTimeoutMs = defaultTimeoutMs;
  }

  private async fetchJson<T>(path: string, options?: RequestInit, timeoutMs?: number): Promise<T> {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const timeout = timeoutMs ?? this.defaultTimeoutMs;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const res = await fetch(`${this.baseUrl}${cleanPath}`, {
        ...options,
        signal: options?.signal || controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      clearTimeout(timer);
      if (!res.ok) {
        let detail = res.statusText;

        try {
          const errorBody = await res.json();
          detail =
            errorBody?.error ||
            errorBody?.message ||
            errorBody?.detail ||
            detail;
        } catch {
          // Response was not JSON; keep status text.
        }

        throw new Error(`API error ${res.status}: ${detail}`);
      }
      const envelope = await res.json();
      return envelope.data;
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Request timed out after ${Math.round(timeout / 1000)}s. Please retry.`);
      }
      throw err;
    }
  }

  async getWorker(workerId: string): Promise<Worker> {
    return this.fetchJson<Worker>(`/workers/${workerId}`);
  }

  async getTrips(workerId: string): Promise<Trip[]> {
    return this.fetchJson<Trip[]>(`/workers/${workerId}/trips`);
  }

  async getTrip(tripId: string): Promise<Trip | null> {
    return this.fetchJson<Trip>(`/trips/${tripId}`);
  }

  async getEarnings(workerId: string) {
    return this.fetchJson<{
      records: any[];
      expenses: any[];
      grossTotal: number;
      netRealTotal: number;
    }>(`/earnings/${workerId}`);
  }

  async getCases(workerId: string): Promise<Case[]> {
    return this.fetchJson<Case[]>(`/cases?workerId=${workerId}`);
  }

  async getCase(caseId: string): Promise<Case | null> {
    return this.fetchJson<Case>(`/cases/${caseId}`);
  }

  async investigateTrip(tripId: string): Promise<AIInvestigationResult> {
    return this.fetchJson<AIInvestigationResult>(`/investigations`, {
      method: 'POST',
      body: JSON.stringify({ tripId, workerId: 'worker-vikram-01' }),
    });
  }

  async queryWorkerTwin(query: WorkerTwinQuery): Promise<WorkerTwinResponse> {
    return this.fetchJson<WorkerTwinResponse>(`/worker-twin/query`, {
      method: 'POST',
      body: JSON.stringify(query),
    });
  }

  async generateEvidencePackage(caseId: string) {
    return this.fetchJson<{ packageUri: string; generatedAt: string }>(`/cases/${caseId}/generate-package`, {
      method: 'POST',
    });
  }
}

export function isLiveApiConfigured(): boolean {
  return Boolean(
    (typeof import.meta !== 'undefined' &&
      ((import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_API_URL)) ||
    (typeof process !== 'undefined' &&
      (process.env?.VITE_API_BASE_URL || process.env?.VITE_API_URL)) ||
    (typeof window !== 'undefined' &&
      ((window as any).__ENV__?.VITE_API_BASE_URL || (window as any).__ENV__?.VITE_API_URL))
  );
}

export function createApiClient(): KavachApiClient {
  const apiUrl =
    (typeof import.meta !== 'undefined' &&
      ((import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_API_URL)) ||
    (typeof process !== 'undefined' &&
      (process.env?.VITE_API_BASE_URL || process.env?.VITE_API_URL)) ||
    (typeof window !== 'undefined' &&
      ((window as any).__ENV__?.VITE_API_BASE_URL || (window as any).__ENV__?.VITE_API_URL));

  if (apiUrl) {
    return new HttpApiClient(apiUrl);
  }
  // If running in browser or test without configured server, MockApiClient provides immediate resilience
  return new MockApiClient();
}

