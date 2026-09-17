import { Evidence } from '../domain/index.ts';
import { demoEvidence } from '../../fixtures/demo-worker.ts';

/**
 * Interface for Evidence Storage abstraction (Section 33).
 * Keeps AWS DynamoDB / S3 integration details cleanly decoupled.
 */
export interface EvidenceStore {
  getEvidence(id: string): Promise<Evidence | null>;
  listEvidenceByWorker(workerId: string): Promise<Evidence[]>;
  saveEvidence(evidence: Evidence): Promise<void>;
  listEvidenceByIds(ids: string[]): Promise<Evidence[]>;
}

/**
 * Local in-memory evidence store initialized with demo worker evidence fixtures.
 */
export class LocalEvidenceStore implements EvidenceStore {
  private items = new Map<string, Evidence>();

  constructor(initialData: Evidence[] = demoEvidence) {
    for (const item of initialData) {
      this.items.set(item.id, item);
    }
  }

  async getEvidence(id: string): Promise<Evidence | null> {
    return this.items.get(id) ?? null;
  }

  async listEvidenceByWorker(_workerId: string): Promise<Evidence[]> {
    return Array.from(this.items.values());
  }

  async saveEvidence(evidence: Evidence): Promise<void> {
    this.items.set(evidence.id, evidence);
  }

  async listEvidenceByIds(ids: string[]): Promise<Evidence[]> {
    return ids.map((id) => this.items.get(id)).filter((item): item is Evidence => item !== undefined);
  }
}

/**
 * DynamoEvidenceStore placeholder for Person 3 / AWS Platform branch.
 */
export class DynamoEvidenceStore implements EvidenceStore {
  private tableName: string;

  constructor(tableName = process.env.DYNAMODB_TABLE_PREFIX ? `${process.env.DYNAMODB_TABLE_PREFIX}evidence` : 'kavach-evidence') {
    this.tableName = tableName;
  }

  async getEvidence(_id: string): Promise<Evidence | null> {
    throw new Error(`DynamoEvidenceStore not implemented for ${this.tableName}. Use LocalEvidenceStore in mock mode.`);
  }

  async listEvidenceByWorker(_workerId: string): Promise<Evidence[]> {
    throw new Error('DynamoEvidenceStore not implemented. Use LocalEvidenceStore in mock mode.');
  }

  async saveEvidence(_evidence: Evidence): Promise<void> {
    throw new Error('DynamoEvidenceStore not implemented. Use LocalEvidenceStore in mock mode.');
  }

  async listEvidenceByIds(_ids: string[]): Promise<Evidence[]> {
    throw new Error('DynamoEvidenceStore not implemented. Use LocalEvidenceStore in mock mode.');
  }
}

export function getEvidenceStore(): EvidenceStore {
  if (process.env.MOCK_AWS === 'false') {
    return new DynamoEvidenceStore();
  }
  return new LocalEvidenceStore();
}
