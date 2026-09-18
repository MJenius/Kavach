import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { CasesPage } from '../../src/features/cases/CasesPage.tsx';
import type { ReviewPackageNavigationState } from '../../src/features/cases/review-package.ts';

describe('Cases Page Flow & Rendering', () => {
  it('renders existing case list when navigating directly without investigation state', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/cases']}>
        <CasesPage />
      </MemoryRouter>
    );

    expect(html).toContain('Cases &amp; Dispute Review Packages');
    expect(html).toContain('All Registered Cases');
    expect(html).toContain('case-001');
    expect(html).toContain('case-002');
    // Must NOT show generated review case card when direct access
    expect(html).not.toContain('NEW GENERATED REVIEW CASE');
    expect(html).not.toContain('Copy Review Package');
  });

  it('renders generated review case card with all required fields when state is passed', () => {
    const mockState: ReviewPackageNavigationState = {
      type: 'generated-review-package',
      caseId: 'case-trip-2026-09-15-001',
      tripId: 'trip-2026-09-15-001',
      workerId: 'worker-vikram-01',
      workerName: 'Vikram Sharma',
      disputedAmount: 350,
      caseStatus: 'READY',
      investigation: {
        summary: 'Investigation indicates 7 min store delay leaving 3 min transit time under 10 min SLA.',
        findings: [
          {
            id: 'finding-late-penalty-01',
            type: 'DECISION_REVIEW',
            severity: 'HIGH',
            title: 'Late delivery penalty warrants review due to merchant queue delay',
            explanation: 'Uncompensated merchant wait caused SLA breach.',
            confidence: 0.94,
            evidenceIds: ['ev-store-arrival-gps', 'ev-merchant-handover-scan'],
          },
        ],
        contradictions: ['Dispatched expecting 10m total SLA without auto-extension'],
        missingEvidence: ['Customer app delivery handover photo'],
        recommendedActions: ['Generate dispute package and request waiver'],
        confidence: 0.94,
      },
      timeline: [
        {
          id: 'evt-001',
          tripId: 'trip-2026-09-15-001',
          type: 'STORE_ARRIVAL',
          timestamp: '2026-09-15T19:02:00+05:30',
          source: 'GPS_TELEMETRY',
          confidence: 0.98,
          evidenceIds: ['ev-store-arrival-gps'],
        },
      ],
    };

    const html = renderToString(
      <MemoryRouter initialEntries={[{ pathname: '/cases', state: mockState }]}>
        <CasesPage />
      </MemoryRouter>
    );

    // Required Fields Validation:
    // 1. Case ID & 2. Trip ID
    expect(html).toContain('Case #');
    expect(html).toContain('case-trip-2026-09-15-001');
    expect(html).toContain('Trip');
    expect(html).toContain('trip-2026-09-15-001');
    // 3. ₹350 Disputed Penalty
    expect(html).toContain('350');
    expect(html).toContain('DISPUTED PENALTY');
    // 4. Investigation Summary
    expect(html).toContain('Investigation indicates 7 min store delay leaving 3 min transit time under 10 min SLA.');
    // 5. Findings
    expect(html).toContain('Late delivery penalty warrants review due to merchant queue delay');
    // 6. Evidence IDs
    expect(html).toContain('ev-store-arrival-gps');
    expect(html).toContain('ev-merchant-handover-scan');
    // 7. Reconstructed Timeline
    expect(html).toContain('STORE_ARRIVAL');
    expect(html).toContain('GPS_TELEMETRY');
    // 8. Contradictions
    expect(html).toContain('Dispatched expecting 10m total SLA without auto-extension');
    // 9. Missing Evidence
    expect(html).toContain('Customer app delivery handover photo');
    // 10. Recommended Actions
    expect(html).toContain('Generate dispute package and request waiver');
    // 11. Confidence
    expect(html).toContain('94');
    // 12. Case Status
    expect(html).toContain('READY');

    // Copy Review Package button present
    expect(html).toContain('Copy Review Package');

    // Neutral disclaimer present
    expect(html).toContain('Available evidence indicates that the penalty decision warrants review');

    // Existing cases still preserved
    expect(html).toContain('All Registered Cases');
    expect(html).toContain('case-001');
  });
});
