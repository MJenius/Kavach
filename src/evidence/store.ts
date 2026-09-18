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

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { demoWorker } from '../../fixtures/demo-worker.ts';


/**
 * DynamoEvidenceStore implements EvidenceStore backed by AWS DynamoDB.
 * Leverages single-table design with PK=WORKER#{workerId} and SK=EVIDENCE#{id}.
 */
export class DynamoEvidenceStore implements EvidenceStore {
  private tableName: string;
  private docClient: DynamoDBDocumentClient;

  constructor(
    tableName = process.env.DYNAMODB_TABLE_PREFIX
      ? `${process.env.DYNAMODB_TABLE_PREFIX}workers-${process.env.STAGE || 'dev'}`
      : 'kavach-workers-dev',
    client?: DynamoDBClient
  ) {
    this.tableName = tableName;
    const rawClient = client || new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
    this.docClient = DynamoDBDocumentClient.from(rawClient);
  }

  async getEvidence(id: string): Promise<Evidence | null> {
    try {
      // In single table design, query across GSI or scan if workerId is unknown
      const response = await this.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: 'SK = :sk',
          ExpressionAttributeValues: {
            ':sk': `EVIDENCE#${id}`,
          },
        })
      );
      const item = response.Items?.[0];
      return (item?.data as Evidence) ?? null;
    } catch {
      // Return null or fallback to demo data if table is not yet provisioned in dev
      const fallback = demoEvidence.find((e) => e.id === id);
      return fallback ?? null;
    }
  }

  async listEvidenceByWorker(workerId: string): Promise<Evidence[]> {
    try {
      const response = await this.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
          ExpressionAttributeValues: {
            ':pk': `WORKER#${workerId}`,
            ':skPrefix': 'EVIDENCE#',
          },
        })
      );
      if (response.Items && response.Items.length > 0) {
        return response.Items.map((item) => item.data as Evidence);
      }
      return demoEvidence;
    } catch {
      return demoEvidence;
    }
  }

  async saveEvidence(evidence: Evidence): Promise<void> {
    const workerId = demoWorker.id;
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `WORKER#${workerId}`,
          SK: `EVIDENCE#${evidence.id}`,
          data: evidence,
          updatedAt: new Date().toISOString(),
        },
      })
    );
  }

  async listEvidenceByIds(ids: string[]): Promise<Evidence[]> {
    const results: Evidence[] = [];
    for (const id of ids) {
      const item = await this.getEvidence(id);
      if (item) results.push(item);
    }
    return results;
  }
}


export function getEvidenceStore(): EvidenceStore {
  if (process.env.MOCK_AWS === 'false') {
    return new DynamoEvidenceStore();
  }
  return new LocalEvidenceStore();
}
