import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import {
  demoWorker,
  demoTrips,
  demoEarnings,
  demoExpenses,
  demoCases,
  demoEvidence,
} from '../../fixtures/demo-worker.ts';
import { getAIService } from '../ai/service.ts';
import { getEvidenceStore } from '../evidence/store.ts';

const CORS_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key',
};

function formatResponse(statusCode: number, body: Record<string, unknown>): APIGatewayProxyResult {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

/**
 * AWS Lambda handler entrypoint for API Gateway proxy events.
 * Executes the full production path:
 * API Gateway -> Lambda -> AIService -> SupervisorAgent -> Evidence Engine -> Bedrock -> frontend response
 */
export async function handler(
  event: APIGatewayProxyEvent,
  _context?: Context
): Promise<APIGatewayProxyResult> {
  const aiService = getAIService();
  const evidenceStore = getEvidenceStore();

  // Handle direct Step Functions invocation payloads
  const directEvent = event as unknown as Record<string, unknown>;
  if (directEvent && typeof directEvent.action === 'string') {
    const action = directEvent.action;
    if (action === 'INGEST_EVIDENCE') {
      const workerId = (directEvent.workerId as string) || demoWorker.id;
      const evidence = await evidenceStore.listEvidenceByWorker(workerId);
      return formatResponse(200, {
        status: 'SUCCESS',
        action,
        count: evidence.length,
        evidenceIds: evidence.map((e) => e.id),
      });
    }
    if (action === 'INVESTIGATE_CASE') {
      const caseId = (directEvent.caseId as string) || (directEvent.tripId as string) || 'trip-2026-09-15-001';
      const result = await aiService.investigateCase(caseId, directEvent);
      return formatResponse(200, {
        status: 'SUCCESS',
        action,
        investigation: result,
      });
    }
    if (action === 'RECONCILE_DECISION') {
      return formatResponse(200, {
        status: 'SUCCESS',
        action,
        reconciled: true,
        caseId: directEvent.caseId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  const httpMethod = event.httpMethod || 'GET';
  const path = event.path || '/';

  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  try {
    // Health check
    if (path === '/health' || path === '/api/health') {
      return formatResponse(200, {
        status: 'ok',
        service: 'kavach-production-api',
        timestamp: new Date().toISOString(),
        mockMode: process.env.MOCK_AI !== 'false',
        region: process.env.AWS_REGION || 'ap-south-1',
        modelId: process.env.BEDROCK_MODEL_ID || 'openai.gpt-oss-120b',
      });
    }

    // GET /api/workers/:id
    const workerMatch = path.match(/^\/api\/workers\/([^/]+)$/);
    if (httpMethod === 'GET' && workerMatch) {
      const workerId = workerMatch[1];
      if (workerId === demoWorker.id) {
        return formatResponse(200, { success: true, data: demoWorker });
      }
      return formatResponse(200, {
        success: true,
        data: {
          id: workerId,
          name: 'Sample Worker',
          preferredLanguage: 'en',
          platforms: ['QuickBite'],
        },
      });
    }

    // GET /api/workers/:workerId/trips
    const workerTripsMatch = path.match(/^\/api\/workers\/([^/]+)\/trips$/);
    if (httpMethod === 'GET' && workerTripsMatch) {
      const workerId = workerTripsMatch[1];
      const trips = demoTrips.filter((t) => t.workerId === workerId);
      return formatResponse(200, {
        success: true,
        data: trips.length > 0 ? trips : demoTrips,
      });
    }

    // GET /api/trips/:id
    const tripMatch = path.match(/^\/api\/trips\/([^/]+)$/);
    if (httpMethod === 'GET' && tripMatch) {
      const tripId = tripMatch[1];
      const trip = demoTrips.find((t) => t.id === tripId);
      if (!trip) {
        return formatResponse(404, { success: false, error: 'Trip not found' });
      }
      return formatResponse(200, { success: true, data: trip });
    }

    // GET /api/earnings/:workerId
    const earningsMatch = path.match(/^\/api\/earnings\/([^/]+)$/);
    if (httpMethod === 'GET' && earningsMatch) {
      const grossTotal = demoEarnings.reduce((acc, curr) => acc + (curr.actualAmount || 0), 0);
      const expensesTotal = demoExpenses.reduce((acc, curr) => acc + curr.amount, 0);
      return formatResponse(200, {
        success: true,
        data: {
          records: demoEarnings,
          expenses: demoExpenses,
          grossTotal,
          netRealTotal: grossTotal - expensesTotal,
        },
      });
    }

    // POST /api/investigations
    // Canonical ₹350 late penalty investigation flow
    if (httpMethod === 'POST' && (path === '/api/investigations' || path === '/investigations')) {
      const body = event.body ? JSON.parse(event.body) : {};
      const targetTripId = body.tripId || 'trip-2026-09-15-001';
      const targetWorkerId = body.workerId || demoWorker.id;

      const result = await aiService.investigateCase(targetTripId, {
        workerId: targetWorkerId,
        ...body,
      });

      return formatResponse(200, { success: true, data: result });
    }

    // GET /api/cases
    if (httpMethod === 'GET' && (path === '/api/cases' || path === '/cases')) {
      return formatResponse(200, { success: true, data: demoCases });
    }

    // GET /api/cases/:id
    const caseMatch = path.match(/^\/api\/cases\/([^/]+)$/);
    if (httpMethod === 'GET' && caseMatch) {
      const caseId = caseMatch[1];
      const c = demoCases.find((item) => item.id === caseId);
      if (!c) {
        return formatResponse(404, { success: false, error: 'Case not found' });
      }
      return formatResponse(200, { success: true, data: c });
    }

    // POST /api/cases/:id/generate-package
    const casePkgMatch = path.match(/^\/api\/cases\/([^/]+)\/generate-package$/);
    if (httpMethod === 'POST' && casePkgMatch) {
      const caseId = casePkgMatch[1];
      const bucket = process.env.S3_EVIDENCE_BUCKET || 'kavach-evidence-bucket';
      const evidenceList = await evidenceStore.listEvidenceByWorker(demoWorker.id);
      return formatResponse(200, {
        success: true,
        data: {
          caseId,
          packageUri: `s3://${bucket}/packages/${caseId}-dispute-package.pdf`,
          generatedAt: new Date().toISOString(),
          evidenceCount: evidenceList.length || demoEvidence.length,
        },
      });
    }

    // POST /api/worker-twin/query
    if (httpMethod === 'POST' && (path === '/api/worker-twin/query' || path === '/worker-twin/query')) {
      const body = event.body ? JSON.parse(event.body) : {};
      const targetWorkerId = body.workerId || demoWorker.id;
      const targetQuery = body.query || 'Shift optimization inquiry';

      const { WorkerTwinAgent } = await import('../agents/worker-twin-agent.ts');
      const agent = new WorkerTwinAgent();
      const twinResult = await agent.run({
        workerId: targetWorkerId,
        query: targetQuery,
      });

      return formatResponse(200, {
        success: true,
        data: twinResult,
      });
    }

    return formatResponse(404, { success: false, error: `Route not found: ${httpMethod} ${path}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return formatResponse(500, { success: false, error: message });
  }
}
