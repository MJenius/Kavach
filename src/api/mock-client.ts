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
import { MockAIService } from '../ai/service.ts';

/**
 * MockApiClient implements KavachApiClient purely in-memory using canonical fixtures.
 * Enables zero-dependency offline development for Frontend and UI testing.
 */
export class MockApiClient implements KavachApiClient {
  private aiService = new MockAIService();

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
    return this.aiService.investigateCase(tripId);
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

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || 'http://localhost:3001/api';
  }

  private async fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    const envelope = await res.json();
    return envelope.data;
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
      body: JSON.stringify({ tripId }),
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

/**
 * Singleton client factory
 */
export function createApiClient(): KavachApiClient {
  // If running in browser or test without server, MockApiClient provides immediate resilience
  return new MockApiClient();
}
