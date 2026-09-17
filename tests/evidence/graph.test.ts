import { describe, expect, it } from 'vitest';
import { demoEvidence, demoFindings, demoTripEvents } from '../../fixtures/demo-worker.ts';
import { EvidenceGraph } from '../../src/evidence/graph.ts';

describe('evidence graph', () => {
  it('traces findings and trips to evidence', () => {
    const graph = new EvidenceGraph(demoEvidence, demoFindings);
    expect(graph.getEvidenceForFinding('finding-late-penalty-01').map(({ id }) => id)).toContain('ev-wait-calc');
    expect(graph.getEvidenceForTrip('trip-2026-09-15-001', demoTripEvents)).toHaveLength(6);
  });

  it('preserves supporting, contradictory, derived, and missing references', () => {
    const graph = new EvidenceGraph(demoEvidence, [], [
      { fromId: 'ev-store-arrival-gps', toId: 'calculation-1', type: 'DERIVED_FROM' },
      { fromId: 'calculation-1', toId: 'finding-1', type: 'SUPPORTS' },
      { fromId: 'ev-penalty-screenshot', toId: 'finding-1', type: 'CONTRADICTS' },
    ]);
    expect(graph.getEvidenceForFinding('finding-1').map(({ id }) => id)).toContain('ev-store-arrival-gps');
    expect(graph.getContradictingEvidence('finding-1')[0].id).toBe('ev-penalty-screenshot');
    expect(graph.getMissingReferences()).toEqual(expect.arrayContaining(['calculation-1', 'finding-1']));
  });
});
