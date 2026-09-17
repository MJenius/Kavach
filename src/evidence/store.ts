import { Evidence, Finding, TripEvent } from '../domain/index.ts';
import { demoEvidence, demoFindings, demoTripEvents } from '../../fixtures/demo-worker.ts';
import { EvidenceGraph, EvidenceRelationship } from './graph.ts';

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
  readonly graph: EvidenceGraph;

  constructor(
    initialData: Evidence[] = demoEvidence,
    findings: Finding[] = demoFindings,
    private tripEvents: TripEvent[] = demoTripEvents,
    relationships: EvidenceRelationship[] = []
  ) {
    for (const item of initialData) {
      this.items.set(item.id, item);
    }
    this.graph = new EvidenceGraph(initialData, findings, relationships);
  }

  async getEvidence(id: string): Promise<Evidence | null> {
    return this.items.get(id) ?? null;
  }

  async listEvidenceByWorker(_workerId: string): Promise<Evidence[]> {
    return Array.from(this.items.values());
  }

  async saveEvidence(evidence: Evidence): Promise<void> {
    this.items.set(evidence.id, evidence);
    this.graph.addEvidence(evidence);
  }

  async listEvidenceByIds(ids: string[]): Promise<Evidence[]> {
    return ids.map((id) => this.items.get(id)).filter((item): item is Evidence => item !== undefined);
  }

  async getEvidenceForTrip(tripId: string): Promise<Evidence[]> {
    return this.graph.getEvidenceForTrip(tripId, this.tripEvents);
  }

  async getEvidenceForFinding(findingId: string): Promise<Evidence[]> {
    return this.graph.getEvidenceForFinding(findingId);
  }

  async getSupportingEvidence(id: string): Promise<Evidence[]> {
    return this.graph.getSupportingEvidence(id);
  }

  async getContradictingEvidence(id: string): Promise<Evidence[]> {
    return this.graph.getContradictingEvidence(id);
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
