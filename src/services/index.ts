import { Case, Evidence } from '../domain/index.ts';

/**
 * ============================================================================
 * Backend Services (Person 3 - feature/cloud-platform)
 * ============================================================================
 * Business orchestration services (e.g. Ingestion, Case Dispatch, Evidence Export).
 * ============================================================================
 */

export interface CaseService {
  getCase(caseId: string): Promise<Case | null>;
  createCase(caseData: Partial<Case>): Promise<Case>;
  exportCasePackage(caseId: string, evidenceItems: Evidence[]): Promise<{ packageUri: string }>;
}

export class MockCaseService implements CaseService {
  async getCase(_caseId: string): Promise<Case | null> {
    return null;
  }

  async createCase(caseData: Partial<Case>): Promise<Case> {
    return {
      id: `case-${Date.now()}`,
      workerId: caseData.workerId || 'worker-vikram-01',
      type: caseData.type || 'TRIP',
      status: 'DRAFT',
      findingIds: caseData.findingIds || [],
      createdAt: new Date().toISOString(),
    };
  }

  async exportCasePackage(caseId: string, evidenceItems: Evidence[]): Promise<{ packageUri: string }> {
    return {
      packageUri: `s3://kavach-evidence-bucket/packages/${caseId}-dispute-package.pdf?evidenceCount=${evidenceItems.length}`,
    };
  }
}
