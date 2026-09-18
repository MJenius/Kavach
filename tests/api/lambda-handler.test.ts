import { describe, it, expect, beforeEach } from 'vitest';
import { handler } from '../../src/api/handler.ts';
import type { APIGatewayProxyEvent } from 'aws-lambda';

function createMockEvent(
  httpMethod: string,
  path: string,
  body?: Record<string, unknown>
): APIGatewayProxyEvent {
  return {
    httpMethod,
    path,
    headers: { 'Content-Type': 'application/json' },
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
    isBase64Encoded: false,
    body: body ? JSON.stringify(body) : null,
  };
}

describe('AWS Lambda Handler & API Gateway Integration', () => {
  beforeEach(() => {
    process.env.MOCK_AI = 'true';
  });

  it('handles GET /health', async () => {
    const event = createMockEvent('GET', '/health');
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const payload = JSON.parse(result.body);
    expect(payload.status).toBe('ok');
    expect(payload.service).toBe('kavach-production-api');
    expect(result.headers?.['Access-Control-Allow-Origin']).toBe('*');
  });

  it('handles OPTIONS preflight for CORS', async () => {
    const event = createMockEvent('OPTIONS', '/api/investigations');
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.headers?.['Access-Control-Allow-Origin']).toBe('*');
  });

  it('handles GET /api/workers/:id', async () => {
    const event = createMockEvent('GET', '/api/workers/worker-vikram-01');
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const payload = JSON.parse(result.body);
    expect(payload.success).toBe(true);
    expect(payload.data.id).toBe('worker-vikram-01');
    expect(payload.data.name).toBe('Vikram Sharma');
  });

  it('handles GET /api/workers/:workerId/trips', async () => {
    const event = createMockEvent('GET', '/api/workers/worker-vikram-01/trips');
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const payload = JSON.parse(result.body);
    expect(payload.success).toBe(true);
    expect(payload.data.length).toBeGreaterThan(0);
  });

  it('handles GET /api/earnings/:workerId', async () => {
    const event = createMockEvent('GET', '/api/earnings/worker-vikram-01');
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const payload = JSON.parse(result.body);
    expect(payload.success).toBe(true);
    expect(payload.data.grossTotal).toBeDefined();
    expect(payload.data.netRealTotal).toBeDefined();
  });

  it('executes the canonical ₹350 late penalty investigation flow via POST /api/investigations', async () => {
    const event = createMockEvent('POST', '/api/investigations', {
      tripId: 'trip-2026-09-15-001',
      workerId: 'worker-vikram-01',
    });

    const result = await handler(event);
    expect(result.statusCode).toBe(200);

    const payload = JSON.parse(result.body);
    expect(payload.success).toBe(true);
    expect(payload.data).toBeDefined();

    // Canonical check: Multi-agent synthesis
    const investigation = payload.data;
    expect(investigation.findings).toBeDefined();
    expect(investigation.findings.length).toBeGreaterThan(0);

    // Verify ₹350 penalty contestation
    const finding = investigation.findings[0];
    expect(finding.explanation).toContain('350');
    expect(finding.evidenceIds).toContain('ev-store-arrival-gps');
    expect(investigation.confidence).toBeGreaterThan(0.9);
  });

  it('handles GET /api/cases and POST /api/cases/:id/generate-package', async () => {
    const getCasesEvent = createMockEvent('GET', '/api/cases');
    const getRes = await handler(getCasesEvent);
    expect(getRes.statusCode).toBe(200);

    const postPkgEvent = createMockEvent('POST', '/api/cases/case-2026-09-15-001/generate-package');
    const postRes = await handler(postPkgEvent);
    expect(postRes.statusCode).toBe(200);
    const pkgPayload = JSON.parse(postRes.body);
    expect(pkgPayload.data.packageUri).toContain('case-2026-09-15-001-dispute-package.pdf');
  });

  it('handles POST /api/worker-twin/query', async () => {
    const event = createMockEvent('POST', '/api/worker-twin/query', {
      workerId: 'worker-vikram-01',
      query: 'How do I optimize Friday shifts?',
    });
    const res = await handler(event);
    expect(res.statusCode).toBe(200);
    const payload = JSON.parse(res.body);
    expect(payload.success).toBe(true);
    expect(payload.data.answer).toBeDefined();
  });
});
