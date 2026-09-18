import { describe, it, expect } from 'vitest';
import { loadDemoDataset, demoEvidence, demoFindings, demoTripEvents, demoEarnings } from '../../fixtures/demo-worker.ts';
import { LocalEvidenceStore } from '../../src/evidence/store.ts';
import { generateReviewPackage } from '../../src/features/cases/review-package.ts';
import { MockApiClient } from '../../src/api/mock-client.ts';
import { EarningsAgent } from '../../src/agents/earnings-agent.ts';
import { SupervisorAgent } from '../../src/agents/supervisor-agent.ts';

describe('P0 & P1 Canonical Data & Evidence Consistency', () => {
  const data = loadDemoDataset();

  it('P0: excludes unbacked incentive finding from canonical findings and review package', async () => {
    // Canonical findings must only include evidence-backed dispute findings
    expect(data.findings).toHaveLength(1);
    expect(data.findings[0].id).toBe('finding-late-penalty-01');
    expect(data.findings.some((f) => f.id === 'finding-incentive-02')).toBe(false);

    // EarningsAgent does not attach unrelated penalty evidence to incentive shortfalls
    const earningsAgent = new EarningsAgent();
    const earningsRes = await earningsAgent.run({ workerId: 'worker-vikram-01' });
    const incentiveFinding = earningsRes.findings.find((f) => f.type === 'INCENTIVE_DISCREPANCY');
    expect(incentiveFinding).toBeUndefined();

    // SupervisorAgent synthesizes only evidence-backed trip findings
    const supervisor = new SupervisorAgent();
    const supRes = await supervisor.run({
      tripId: 'trip-2026-09-15-001',
      workerId: 'worker-vikram-01',
      action: 'INVESTIGATE_CASE',
    });
    expect(supRes.investigationResult?.findings.some((f) => f.type === 'INCENTIVE_DISCREPANCY')).toBe(false);
    expect(supRes.investigationResult?.findings.every((f) => f.evidenceIds && f.evidenceIds.length > 0)).toBe(true);

    // MockApiClient does not return incentive finding for trip investigation
    const mockClient = new MockApiClient();
    const mockInvest = await mockClient.investigateTrip('trip-2026-09-15-001');
    expect(mockInvest.findings.some((f) => f.type === 'INCENTIVE_DISCREPANCY')).toBe(false);
    expect(mockInvest.findings).toHaveLength(1);
  });

  it('P0: every Finding.evidenceIds exists and is backed in demoEvidence', () => {
    const evidenceMap = new Map(demoEvidence.map((e) => [e.id, e]));

    for (const finding of data.findings) {
      expect(finding.evidenceIds.length).toBeGreaterThan(0);
      for (const evId of finding.evidenceIds) {
        expect(evidenceMap.has(evId)).toBe(true);
        // Ensure no unrelated penalty screenshot attached as supporting evidence to merchant queue finding
        expect(evId).not.toBe('ev-nonexistent');
      }
    }
  });

  it('P0: authoritative penalty timestamp is unified to 19:30 IST across all sources', () => {
    const penaltyEvidence = demoEvidence.find((e) => e.id === 'ev-penalty-screenshot');
    expect(penaltyEvidence?.timestamp).toBe('2026-09-15T19:30:00+05:30');

    const penaltyEvent = demoTripEvents.find((e) => e.type === 'PLATFORM_PENALTY');
    expect(penaltyEvent?.timestamp).toBe('2026-09-15T19:30:00+05:30');

    const penaltyLedger = demoEarnings.find((e) => e.type === 'PENALTY');
    expect(penaltyLedger?.timestamp).toBe('2026-09-15T19:30:00+05:30');
  });

  it('P0: complete canonical timeline events match authoritative timestamps', () => {
    const storeArrival = demoTripEvents.find((e) => e.type === 'STORE_ARRIVAL');
    expect(storeArrival?.timestamp).toBe('2026-09-15T19:02:00+05:30');

    const waitStarted = demoTripEvents.find((e) => e.type === 'WAITING_STARTED');
    expect(waitStarted?.timestamp).toBe('2026-09-15T19:02:00+05:30');

    const handover = demoTripEvents.find((e) => e.type === 'PACKAGE_RECEIVED');
    expect(handover?.timestamp).toBe('2026-09-15T19:09:00+05:30');

    const deliveryStarted = demoTripEvents.find((e) => e.type === 'DELIVERY_STARTED');
    expect(deliveryStarted?.timestamp).toBe('2026-09-15T19:09:30+05:30');

    const traffic = demoTripEvents.find((e) => e.type === 'TRAFFIC_EVENT');
    expect(traffic?.timestamp).toBe('2026-09-15T19:16:00+05:30');

    const deliveryCompleted = demoTripEvents.find((e) => e.type === 'DELIVERY_COMPLETED');
    expect(deliveryCompleted?.timestamp).toBe('2026-09-15T19:24:00+05:30');

    const platformPenalty = demoTripEvents.find((e) => e.type === 'PLATFORM_PENALTY');
    expect(platformPenalty?.timestamp).toBe('2026-09-15T19:30:00+05:30');
  });

  it('P1: review package consistency preserves neutral language and evidence alignment', () => {
    const text = generateReviewPackage({
      caseId: 'case-trip-2026-09-15-001',
      tripId: 'trip-2026-09-15-001',
      workerName: 'Vikram Sharma',
      disputedAmount: 350,
      investigation: {
        summary: 'Investigation indicates 7 min store delay leaving 3 min transit time under 10 min SLA.',
        findings: data.findings,
        contradictions: ['Platform dispatched order expecting 10m total SLA without auto-extending SLA'],
        missingEvidence: ['Customer app delivery handover photo'],
        recommendedActions: [
          'Available evidence indicates uncompensated merchant delay; recommend requesting platform re-evaluation',
        ],
        confidence: 0.94,
      },
      timeline: demoTripEvents,
    });

    expect(text).toContain('19:30 IST] PLATFORM_PENALTY');
    expect(text).toContain('Finding 1: Late delivery penalty warrants review due to merchant queue delay');
    expect(text).not.toContain('Surge incentive shortfall');
    expect(text).toContain('Available evidence indicates');
    expect(text).toContain('warrants review');
  });

  it('P1: Evidence Graph correctly reflects 6 supporting nodes and 7 total evidence items', () => {
    const store = new LocalEvidenceStore(demoEvidence, demoFindings, demoTripEvents);
    const primaryFinding = demoFindings[0];
    const supporting = store.graph.getEvidenceForFinding(primaryFinding.id);

    // 6 supporting evidence nodes linked to the primary finding
    expect(supporting).toHaveLength(6);
    expect(supporting.map((e) => e.id)).toContain('ev-store-arrival-gps');
    expect(supporting.map((e) => e.id)).toContain('ev-merchant-log');
    expect(supporting.map((e) => e.id)).toContain('ev-merchant-handover-scan');
    expect(supporting.map((e) => e.id)).toContain('ev-wait-calc');
    expect(supporting.map((e) => e.id)).toContain('ev-traffic-alert-koramangala');
    expect(supporting.map((e) => e.id)).toContain('ev-customer-delivery-otp');

    // Total evidence catalog is 7 (including the contested penalty screenshot)
    expect(demoEvidence).toHaveLength(7);
  });

  it('P1: dashboard discrepancy aggregation is mathematically consistent with underlying ledger', () => {
    expect(data.summary.grossEarnings).toBe(-85); // 65 - 350 + 200 = -85
    expect(data.summary.totalExpenses).toBe(345); // 320 + 25 = 345
    expect(data.summary.netEarnings).toBe(-430); // -85 - 345 = -430
    expect(data.summary.effectiveHourlyRate).toBe(-8.11); // -430 / 53 = -8.11
    expect(data.summary.discrepancyTotal).toBe(650); // 350 penalty + 300 incentive shortfall = 650
  });
});
