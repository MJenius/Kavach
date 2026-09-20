import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../src/app/App.tsx';
import { loadDemoDataset, demoEvidence } from '../../fixtures/demo-worker.ts';
import { MockApiClient } from '../../src/api/mock-client.ts';
import { generateReviewPackage } from '../../src/features/cases/review-package.ts';
import { calculateFinancialSummary } from '../../src/calculations/earnings.ts';
import { getCaseService } from '../../src/services/index.ts';

describe('Worker Journey E2E Verification Flow', () => {
  const data = loadDemoDataset();
  const mockClient = new MockApiClient();

  it('Step 1: Dashboard loads financial command center with reconciling metrics', () => {
    const summary = calculateFinancialSummary(data.earnings, data.expenses, data.trips);
    expect(summary.platformGrossPayout).toBeGreaterThan(0);
    expect(summary.platformNetPayout).toBe(summary.platformGrossPayout - summary.deductions);
    expect(summary.estimatedRealEarnings).toBe(summary.platformNetPayout - summary.totalExpenses);
    expect(summary.disputedAmount).toBe(350);
    expect(summary.unresolvedAmount).toBe(300);

    const html = renderToString(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(html).toContain('Financial Command Center');
    expect(html).toContain('Needs Attention');
    expect(html).toContain('350');
    expect(html).toContain('300');
  });

  it('Step 2: Investigation Page frames the ₹350 penalty and reconstructs SLA feasibility', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/cases/case-trip-001/analysis']}>
        <App />
      </MemoryRouter>
    );
    expect(html).toContain('Penalty Review');
    expect(html).toContain('Vikram Sharma accepted order at 19:00');
    expect(html).toContain('Merchant delayed handover by 7 minutes');
    expect(html).toContain('Only 3 minutes remained out of 10-minute SLA');
    expect(html).toContain('Evidence Strength');
  });

  it('Step 3: Evidence Graph renders all canonical evidence objects with provenance', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/cases/case-trip-001/evidence']}>
        <App />
      </MemoryRouter>
    );
    expect(html).toContain('All Standardized Evidence Graph Objects');
    expect(html).toContain('ev-store-arrival-gps');
    expect(html).toContain('ev-merchant-log');
    expect(html).toContain('ev-merchant-handover-scan');
  });

  it('Step 4: AI Multi-Agent Investigation produces evidence-grounded result', async () => {
    const investigationResult = await mockClient.investigateTrip('trip-2026-09-15-001');
    expect(investigationResult.confidence).toBeGreaterThan(0.9);
    expect(investigationResult.findings).toHaveLength(1);
    expect(investigationResult.findings[0].evidenceIds.length).toBeGreaterThanOrEqual(4);
    expect(investigationResult.contradictions.length).toBeGreaterThan(0);
    expect(investigationResult.recommendedActions.length).toBeGreaterThan(0);
  });

  it('Step 5: Review Package generation produces neutral dispute packet with timeline', async () => {
    const investigation = await mockClient.investigateTrip('trip-2026-09-15-001');
    const heroTripEvents = data.tripEvents.filter((e) => e.tripId === 'trip-2026-09-15-001');

    const pkgText = generateReviewPackage({
      caseId: 'case-trip-2026-09-15-001',
      tripId: 'trip-2026-09-15-001',
      workerName: data.worker.name,
      disputedAmount: 350,
      investigation,
      timeline: heroTripEvents,
    });

    expect(pkgText).toContain('KAVACH AI — FORMAL DISPUTE REVIEW SUBMISSION PACKAGE');
    expect(pkgText).toContain('Vikram Sharma');
    expect(pkgText).toContain('₹350');
    expect(pkgText).toContain('19:02');
    expect(pkgText).toContain('19:09');
    expect(pkgText).toContain('warrants review');
    expect(pkgText).not.toContain('guarantee reimbursement');
  });

  it('Step 6: Case Service exports case package and case detail renders correctly', async () => {
    const caseService = getCaseService();
    const exportResult = await caseService.exportCasePackage('case-trip-001', demoEvidence);
    expect(exportResult.packageUri).toBeDefined();

    const html = renderToString(
      <MemoryRouter initialEntries={['/cases/case-trip-001']}>
        <App />
      </MemoryRouter>
    );
    expect(html).toContain('case-trip-001');
    expect(html).toContain('Late Delivery Penalty');
    expect(html).toContain('₹350');
  });

  it('Step 7: Ask Kavach provides grounded intelligence with citations', async () => {
    const twinResponse = await mockClient.queryWorkerTwin({
      workerId: 'worker-vikram-01',
      query: 'Why was ₹350 deducted from my QuickBite shift on Tuesday?',
    });
    expect(twinResponse.answer).toContain('Koramangala');
    expect(twinResponse.observedFactors.length).toBeGreaterThan(0);

    const html = renderToString(
      <MemoryRouter initialEntries={['/ask-kavach']}>
        <App />
      </MemoryRouter>
    );
    expect(html).toContain('Ask Kavach');
    expect(html).toContain('Why was ₹350 deducted from my QuickBite shift on Tuesday?');
    expect(html).toContain('How much did I actually take home after fuel and bike maintenance this week?');
  });
});
