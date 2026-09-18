import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { EvidenceInspector } from '../../src/components/EvidenceInspector.tsx';
import { EvidencePage } from '../../src/features/evidence/EvidencePage.tsx';
import { InvestigationPage } from '../../src/features/investigation/InvestigationPage.tsx';
import { CasesPage } from '../../src/features/cases/CasesPage.tsx';
import { loadDemoDataset } from '../../fixtures/demo-worker.ts';
import type { ReviewPackageNavigationState } from '../../src/features/cases/review-package.ts';

describe('Evidence Inspector & Provenance Flow', () => {
  it('renders null when evidenceId is null', () => {
    const html = renderToString(
      <EvidenceInspector evidenceId={null} onClose={() => {}} />
    );
    expect(html).toBe('');
  });

  it('renders complete concrete metadata for an existing evidence ID', () => {
    const html = renderToString(
      <EvidenceInspector evidenceId="ev-merchant-log" onClose={() => {}} />
    );

    expect(html).toContain('ev-merchant-log');
    expect(html).toContain('MERCHANT_PORTAL_RECEIPT');
    expect(html).toContain('DOCUMENT');
    expect(html).toContain('95%');
    expect(html).toContain('SUPPORTS');
    expect(html).toContain('Merchant queue confirms order packaging delay of 7 minutes');
    expect(html).toContain('WAITING_STARTED');
    expect(html).toContain('finding-late-penalty-01');
  });

  it('handles unknown evidence ID gracefully', () => {
    const html = renderToString(
      <EvidenceInspector evidenceId="ev-nonexistent-999" onClose={() => {}} />
    );

    expect(html).toContain('Unknown Evidence Record');
    expect(html).toContain('ev-nonexistent-999');
  });

  it('renders interactive provenance chain on EvidencePage', () => {
    const data = loadDemoDataset();
    const html = renderToString(
      <MemoryRouter initialEntries={['/evidence']}>
        <EvidencePage />
      </MemoryRouter>
    );

    // Provenance section and DAG steps exist
    expect(html).toContain('INTERACTIVE PROVENANCE CHAIN');
    expect(html).toContain('Late delivery penalty warrants review due to merchant queue delay');
    expect(html).toContain('1. Store Arrival');
    expect(html).toContain('2. Merchant Queue / Waiting');
    expect(html).toContain('3. Package Handover');
    expect(html).toContain('4. Delivery Started &amp; SLA Feasibility');
    expect(html).toContain('5. Traffic Disruption');
    expect(html).toContain('6. Delivery Completed');
    expect(html).toContain('7. Platform Penalty');

    // Evidence IDs are present in provenance nodes
    expect(html).toContain('ev-penalty-screenshot');
    expect(html).toContain('ev-store-arrival-gps');
    expect(html).toContain('ev-merchant-log');
    expect(html).toContain('ev-merchant-handover-scan');
    expect(html).toContain('ev-wait-calc');
    expect(html).toContain('ev-traffic-alert-koramangala');
    expect(html).toContain('ev-customer-delivery-otp');

    // All original evidence cards preserved
    expect(html).toContain('All Standardized Evidence Graph Objects');
    expect(html).toContain('items logged');
    expect(html).toContain(String(data.evidence.length));
  });

  it('renders interactive evidence chip buttons in InvestigationPage', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/investigation']}>
        <InvestigationPage />
      </MemoryRouter>
    );

    expect(html).toContain('Supporting Evidence:');
    expect(html).toContain('ev-penalty-screenshot');
    expect(html).toContain('ev-store-arrival-gps');
    expect(html).toContain('title="Inspect evidence provenance"');
  });

  it('renders interactive evidence chip buttons in CasesPage for generated review case', () => {
    const mockState: ReviewPackageNavigationState = {
      type: 'generated-review-package',
      caseId: 'case-trip-2026-09-15-001',
      tripId: 'trip-2026-09-15-001',
      workerId: 'worker-vikram-01',
      workerName: 'Vikram Sharma',
      disputedAmount: 350,
      caseStatus: 'READY',
      investigation: {
        summary: 'Investigation indicates 7 min store delay.',
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
        contradictions: [],
        missingEvidence: [],
        recommendedActions: [],
        confidence: 0.94,
      },
      timeline: [],
    };

    const html = renderToString(
      <MemoryRouter initialEntries={[{ pathname: '/cases', state: mockState }]}>
        <CasesPage />
      </MemoryRouter>
    );

    expect(html).toContain('Supporting Evidence IDs:');
    expect(html).toContain('ev-store-arrival-gps');
    expect(html).toContain('ev-merchant-handover-scan');
    expect(html).toContain('title="Inspect evidence provenance"');
  });
});
