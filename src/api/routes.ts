import { Router, Request, Response } from 'express';
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

export function createApiRouter(): Router {
  const router = Router();
  const aiService = getAIService();
  const evidenceStore = getEvidenceStore();

  // Health check
  router.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'kavach-api',
      timestamp: new Date().toISOString(),
      mockMode: process.env.MOCK_AI !== 'false',
      region: process.env.AWS_REGION || 'ap-south-1',
    });
  });

  // Section 27 Endpoint: GET /workers/:id
  router.get('/workers/:id', (req: Request, res: Response) => {
    if (req.params.id === demoWorker.id) {
      return res.json({ success: true, data: demoWorker });
    }
    return res.json({
      success: true,
      data: {
        id: req.params.id,
        name: 'Sample Worker',
        preferredLanguage: 'en',
        platforms: ['QuickBite'],
      },
    });
  });

  // Section 27 Endpoint: GET /workers/:workerId/trips
  router.get('/workers/:workerId/trips', (req: Request, res: Response) => {
    const workerTrips = demoTrips.filter((t) => t.workerId === req.params.workerId);
    res.json({ success: true, data: workerTrips.length > 0 ? workerTrips : demoTrips });
  });

  // GET /trips/:id
  router.get('/trips/:id', (req: Request, res: Response) => {
    const trip = demoTrips.find((t) => t.id === req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    res.json({ success: true, data: trip });
  });

  // Section 27 Endpoint: GET /earnings/:workerId
  router.get('/earnings/:workerId', (_req: Request, res: Response) => {
    const grossTotal = demoEarnings.reduce((acc, curr) => acc + (curr.actualAmount || 0), 0);
    const expensesTotal = demoExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    res.json({
      success: true,
      data: {
        records: demoEarnings,
        expenses: demoExpenses,
        grossTotal,
        netRealTotal: grossTotal - expensesTotal,
      },
    });
  });

  // Section 27 Endpoint: POST /investigations
  // Production flow: API Gateway -> Lambda -> AIService -> SupervisorAgent -> ForensicsAgent/Evidence Engine -> Bedrock
  router.post('/investigations', async (req: Request, res: Response) => {
    try {
      const { tripId, workerId } = req.body || {};
      const targetTripId = tripId || 'trip-2026-09-15-001';
      const targetWorkerId = workerId || demoWorker.id;

      const result = await aiService.investigateCase(targetTripId, {
        workerId: targetWorkerId,
        ...req.body,
      });

      res.json({ success: true, data: result });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ success: false, error: msg });
    }
  });

  // Section 27 Endpoint: GET /cases & GET /cases/:id
  router.get('/cases', (_req: Request, res: Response) => {
    res.json({ success: true, data: demoCases });
  });

  router.get('/cases/:id', (req: Request, res: Response) => {
    const c = demoCases.find((item) => item.id === req.params.id);
    if (!c) return res.status(404).json({ success: false, error: 'Case not found' });
    res.json({ success: true, data: c });
  });

  // Section 27 Endpoint: POST /cases/:id/generate-package
  router.post('/cases/:id/generate-package', async (req: Request, res: Response) => {
    const bucket = process.env.S3_EVIDENCE_BUCKET || 'kavach-evidence-bucket';
    const evidenceList = await evidenceStore.listEvidenceByWorker(demoWorker.id);
    res.json({
      success: true,
      data: {
        caseId: req.params.id,
        packageUri: `s3://${bucket}/packages/${req.params.id}-dispute-package.pdf`,
        generatedAt: new Date().toISOString(),
        evidenceCount: evidenceList.length || demoEvidence.length,
      },
    });
  });

  // Section 27 Endpoint: POST /worker-twin/query
  router.post('/worker-twin/query', async (req: Request, res: Response) => {
    try {
      const { workerId, query } = req.body || {};
      const targetWorkerId = workerId || demoWorker.id;
      const targetQuery = query || 'Shift optimization inquiry';

      // We can route through AIService or direct deterministic/twin path
      res.json({
        success: true,
        data: {
          workerId: targetWorkerId,
          query: targetQuery,
          answer: `Historical shift analysis indicates peak efficiency between 18:00 - 22:00 in Koramangala. Avoiding Hub 4b during rush hours improves hourly returns by ₹25/hr.`,
          projectedEarnings: 1250,
          optimalHours: ['18:00 - 22:00'],
          observedFactors: ['Merchant wait times', 'Peak surge incentives'],
          confidence: 0.91,
        },
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ success: false, error: msg });
    }
  });

  return router;
}
