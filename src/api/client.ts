import {
  Worker,
  Trip,
  EarningsRecord,
  Expense,
  Case,
  AIInvestigationResult,
  WorkerTwinQuery,
  WorkerTwinResponse,
} from '../domain/index.ts';

/**
 * ==============================================================================
 * Kavach AI — API Client Contracts [FROZEN CONTRACT]
 * ==============================================================================
 * SOURCE OF TRUTH: plan.md (Section 27)
 *
 * ⚠️ CRITICAL NOTICE:
 * Changes require team agreement because all four feature branches depend on
 * these contracts.
 * ==============================================================================
 */

export interface KavachApiClient {
  getWorker(workerId: string): Promise<Worker>;
  getTrips(workerId: string): Promise<Trip[]>;
  getTrip(tripId: string): Promise<Trip | null>;
  getEarnings(workerId: string): Promise<{
    records: EarningsRecord[];
    expenses: Expense[];
    grossTotal: number;
    netRealTotal: number;
  }>;
  getCases(workerId: string): Promise<Case[]>;
  getCase(caseId: string): Promise<Case | null>;
  investigateTrip(tripId: string): Promise<AIInvestigationResult>;
  queryWorkerTwin(query: WorkerTwinQuery): Promise<WorkerTwinResponse>;
  generateEvidencePackage(caseId: string): Promise<{ packageUri: string; generatedAt: string }>;
}
