import { describe, it, expect } from 'vitest';
import { generateReviewPackage } from '../../src/features/cases/review-package.ts';
import type { AIInvestigationResult, TripEvent } from '../../src/domain/index.ts';

describe('Review Package Pure Generator', () => {
  const mockInvestigation: AIInvestigationResult = {
    summary: 'Investigation confirms 7 min merchant delay leaving 3 min transit time under 10 min SLA.',
    findings: [
      {
        id: 'finding-late-penalty-01',
        type: 'DECISION_REVIEW',
        severity: 'HIGH',
        title: 'Late delivery penalty warrants review due to merchant queue delay',
        explanation: 'Worker arrived on time at 19:02 but waited until 19:09 for package handover.',
        confidence: 0.94,
        evidenceIds: ['ev-store-arrival-gps', 'ev-merchant-handover-scan'],
      },
    ],
    contradictions: [
      'Platform recorded late delivery without adjusting SLA for merchant preparation queue.',
    ],
    missingEvidence: [
      'Customer app delivery handover photo',
    ],
    recommendedActions: [
      'Submit dispute review citing merchant queue timestamps',
      'Request fee adjustment under policy clause 4.2',
    ],
    confidence: 0.94,
  };

  const mockTimeline: TripEvent[] = [
    {
      id: 'evt-001',
      tripId: 'trip-2026-09-15-001',
      type: 'STORE_ARRIVAL',
      timestamp: '2026-09-15T19:02:00+05:30',
      source: 'GPS_TELEMETRY',
      confidence: 0.98,
      evidenceIds: ['ev-store-arrival-gps'],
    },
    {
      id: 'evt-003',
      tripId: 'trip-2026-09-15-001',
      type: 'PACKAGE_RECEIVED',
      timestamp: '2026-09-15T19:09:00+05:30',
      source: 'PARTNER_APP_SCAN',
      confidence: 0.99,
      evidenceIds: ['ev-merchant-handover-scan'],
    },
  ];

  it('generates a clean plain-text package with all required identifiers and evidence', () => {
    const text = generateReviewPackage({
      caseId: 'case-trip-2026-09-15-001',
      tripId: 'trip-2026-09-15-001',
      workerName: 'Vikram Sharma',
      disputedAmount: 350,
      investigation: mockInvestigation,
      timeline: mockTimeline,
    });

    // Identifiers
    expect(text).toContain('Case ID:            case-trip-2026-09-15-001');
    expect(text).toContain('Trip ID:            trip-2026-09-15-001');
    expect(text).toContain('Disputed Penalty:   ₹350');
    expect(text).toContain('Partner Name:       Vikram Sharma');
    expect(text).toContain('Overall Confidence: 94%');

    // Findings & Evidence IDs
    expect(text).toContain('Late delivery penalty warrants review');
    expect(text).toContain('ev-store-arrival-gps');
    expect(text).toContain('ev-merchant-handover-scan');

    // Timeline
    expect(text).toContain('STORE_ARRIVAL');
    expect(text).toContain('PACKAGE_RECEIVED');
    expect(text).toContain('GPS_TELEMETRY');

    // Contradictions & Missing Evidence
    expect(text).toContain('Platform recorded late delivery without adjusting SLA');
    expect(text).toContain('Customer app delivery handover photo');

    // Recommended Actions
    expect(text).toContain('Submit dispute review citing merchant queue timestamps');

    // Neutral, non-legal phrasing checks
    expect(text).toContain('Available evidence indicates');
    expect(text).toContain('warrants review');

    // Must NOT contain definitive legal conclusions or guarantees
    expect(text.toLowerCase()).not.toContain('illegal');
    expect(text.toLowerCase()).not.toContain('guarantee reimbursement');
    expect(text.toLowerCase()).not.toContain('guaranteed refund');
    expect(text.toLowerCase()).not.toContain('violated the law');
  });
});
