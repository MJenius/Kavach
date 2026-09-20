import { describe, it, expect, beforeEach } from 'vitest';
import { handler } from '../../src/api/handler.ts';

describe('AWS Step Functions State Machine Execution Stages', () => {
  beforeEach(() => {
    process.env.MOCK_AI = 'true';
  });

  it('executes Stage 1: INGEST_EVIDENCE task payload', async () => {
    const payload = {
      action: 'INGEST_EVIDENCE',
      caseId: 'case-001',
      workerId: 'worker-vikram-01',
      tripId: 'trip-2026-09-15-001',
    };

    const result = await handler(payload as any);
    expect(result.statusCode).toBe(200);

    const data = JSON.parse(result.body);
    expect(data.status).toBe('SUCCESS');
    expect(data.action).toBe('INGEST_EVIDENCE');
    expect(data.count).toBeGreaterThan(0);
    expect(data.evidenceIds).toContain('ev-store-arrival-gps');
  });

  it('executes Stage 2: INVESTIGATE_CASE task payload via SupervisorAgent', async () => {
    const payload = {
      action: 'INVESTIGATE_CASE',
      caseId: 'case-001',
      workerId: 'worker-vikram-01',
      tripId: 'trip-2026-09-15-001',
      evidenceResult: { status: 'SUCCESS' },
    };

    const result = await handler(payload as any);
    expect(result.statusCode).toBe(200);

    const data = JSON.parse(result.body);
    expect(data.status).toBe('SUCCESS');
    expect(data.action).toBe('INVESTIGATE_CASE');
    expect(data.investigation).toBeDefined();
    expect(data.investigation.findings.length).toBeGreaterThan(0);
    expect(data.investigation.summary).toContain('Merchant wait time');
  });

  it('executes Stage 3: RECONCILE_DECISION task payload', async () => {
    const payload = {
      action: 'RECONCILE_DECISION',
      caseId: 'case-001',
      investigation: { confidence: 0.94 },
    };

    const result = await handler(payload as any);
    expect(result.statusCode).toBe(200);

    const data = JSON.parse(result.body);
    expect(data.status).toBe('SUCCESS');
    expect(data.action).toBe('RECONCILE_DECISION');
    expect(data.reconciled).toBe(true);
  });
});
