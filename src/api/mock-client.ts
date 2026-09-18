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
} from '../../fixtures/demo-worker.ts';

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

  async investigateTrip(tripId: string): Promise<AIInvestigationResult> {
    return {
      summary: `Multi-agent investigation for trip ${tripId}: Merchant wait time of 15 minutes left insufficient transit time (15m remaining of 30m SLA). Penalty of ₹350 is contested by verified telemetry.`,
      findings: [
        {
          id: 'finding-late-penalty-01',
          type: 'DECISION_REVIEW',
          severity: 'HIGH',
          title: 'Late delivery penalty warrants review due to merchant queue delay',
          explanation:
            'Platform levied a ₹350 penalty citing late delivery. Evidence confirms worker arrived at merchant but experienced 15 minutes of uncompensated merchant delay before package handover, leaving insufficient SLA for delivery.',
          confidence: 0.94,
          evidenceIds: ['ev-store-arrival-gps', 'ev-merchant-handover-scan'],
        },
      ],
      missingEvidence: [],
      contradictions: [],
      recommendedActions: [
        'Generate dispute package with store arrival GPS and merchant handover scan',
        'Request waiver of ₹350 penalty based on uncredited merchant wait time',
      ],
      confidence: 0.94,
    };
  }

  async queryWorkerTwin(query: WorkerTwinQuery): Promise<WorkerTwinResponse> {
    return {
      answer: `Analysis for ${query.workerId}: Shift earnings peak between 18:00 - 22:00 in Koramangala. Avoiding Merchant Hub 4b during Friday rush increases effective hourly wage by ~18%.`,
      projectedEarnings: 1250,
      optimalHours: ['18:00 - 22:00'],
      observedFactors: ['Merchant wait times', 'Peak surge incentives'],
      confidence: 0.91,
    };
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

  constructor(baseUrl?: string, defaultTimeoutMs: number = 30000) {
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
        throw new Error(`API error ${res.status}: ${res.statusText}`);
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

