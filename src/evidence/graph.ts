import { Evidence, Finding, TripEvent } from '../domain/index.ts';

export type EvidenceRelationshipType = 'SUPPORTS' | 'CONTRADICTS' | 'DERIVED_FROM' | 'RELATES_TO';

export interface EvidenceRelationship {
  fromId: string;
  toId: string;
  type: EvidenceRelationshipType;
}

export class EvidenceGraph {
  private evidence = new Map<string, Evidence>();
  private findings = new Map<string, Finding>();
  private relationships: EvidenceRelationship[] = [];

  constructor(evidence: Evidence[] = [], findings: Finding[] = [], relationships: EvidenceRelationship[] = []) {
    evidence.forEach((item) => this.evidence.set(item.id, item));
    findings.forEach((item) => this.addFinding(item));
    relationships.forEach((relationship) => this.addRelationship(relationship));
  }

  addEvidence(item: Evidence): void { this.evidence.set(item.id, item); }

  addFinding(finding: Finding): void {
    this.findings.set(finding.id, finding);
    for (const evidenceId of finding.evidenceIds) {
      this.relationships.push({ fromId: evidenceId, toId: finding.id, type: 'SUPPORTS' });
    }
  }

  addRelationship(relationship: EvidenceRelationship): void {
    this.relationships.push(relationship);
  }

  getEvidenceForFinding(findingId: string): Evidence[] {
    const ids = this.traceToEvidence(findingId, new Set());
    return [...ids].map((id) => this.evidence.get(id)).filter((item): item is Evidence => item !== undefined);
  }

  getSupportingEvidence(id: string): Evidence[] { return this.relatedEvidence(id, 'SUPPORTS'); }
  getContradictingEvidence(id: string): Evidence[] { return this.relatedEvidence(id, 'CONTRADICTS'); }

  getEvidenceForTrip(tripId: string, events: TripEvent[]): Evidence[] {
    const ids = events.filter((event) => event.tripId === tripId).flatMap((event) => event.evidenceIds ?? []);
    return [...new Set(ids)].map((id) => this.evidence.get(id)).filter((item): item is Evidence => item !== undefined);
  }

  getMissingReferences(): string[] {
    const known = new Set([...this.evidence.keys(), ...this.findings.keys()]);
    return [...new Set(this.relationships.flatMap(({ fromId, toId }) => [fromId, toId]).filter((id) => !known.has(id)))];
  }

  private relatedEvidence(id: string, type: EvidenceRelationshipType): Evidence[] {
    const ids = this.relationships
      .filter((edge) => edge.type === type && (edge.toId === id || edge.fromId === id))
      .map((edge) => edge.toId === id ? edge.fromId : edge.toId);
    return [...new Set(ids)].map((itemId) => this.evidence.get(itemId)).filter((item): item is Evidence => item !== undefined);
  }

  private traceToEvidence(id: string, visited: Set<string>): Set<string> {
    if (visited.has(id)) return new Set();
    visited.add(id);
    const result = new Set<string>();
    if (this.evidence.has(id)) result.add(id);
    for (const edge of this.relationships.filter((item) => item.toId === id && item.type !== 'CONTRADICTS')) {
      for (const evidenceId of this.traceToEvidence(edge.fromId, visited)) result.add(evidenceId);
    }
    return result;
  }
}
