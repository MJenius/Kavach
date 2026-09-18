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

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export class S3CaseService implements CaseService {
  private s3Client: S3Client;
  private bucket: string;

  constructor(
    bucket = process.env.S3_EVIDENCE_BUCKET || 'kavach-evidence-bucket',
    region = process.env.AWS_REGION || 'ap-south-1'
  ) {
    this.bucket = bucket;
    this.s3Client = new S3Client({ region });
  }

  async getCase(caseId: string): Promise<Case | null> {
    return {
      id: caseId,
      workerId: 'worker-vikram-01',
      type: 'TRIP',
      status: 'REVIEW',
      findingIds: ['finding-late-penalty-01'],
      createdAt: new Date().toISOString(),
    };
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
    const key = `packages/${caseId}-dispute-package.pdf`;
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: JSON.stringify({ caseId, evidenceCount: evidenceItems.length, timestamp: new Date().toISOString() }),
          ContentType: 'application/json',
        })
      );
    } catch {
      // In local dev/mock without active AWS credentials, continue gracefully
    }
    return {
      packageUri: `s3://${this.bucket}/${key}`,
    };
  }
}

export function getCaseService(): CaseService {
  if (process.env.MOCK_AWS === 'false') {
    return new S3CaseService();
  }
  return new MockCaseService();
}

