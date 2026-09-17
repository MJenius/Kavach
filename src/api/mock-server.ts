import express, { Request, Response } from 'express';
import cors from 'cors';
import {
  demoWorker,
  demoTrips,
  demoEarnings,
  demoExpenses,
  demoCases,
  demoEvidence,
} from '../../fixtures/demo-worker.ts';
import { MockAIService } from '../ai/service.ts';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const aiService = new MockAIService();

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'kavach-mock-backend', timestamp: new Date().toISOString() });
});

// Section 27 Endpoint: GET /workers/:id
app.get('/api/workers/:id', (req: Request, res: Response) => {
  if (req.params.id === demoWorker.id) {
    return res.json({ success: true, data: demoWorker });
  }
  return res.json({
    success: true,
    data: { id: req.params.id, name: 'Sample Worker', preferredLanguage: 'en', platforms: ['QuickBite'] },
  });
});

// Section 27 Endpoint: POST /trips & GET /trips/:id
app.get('/api/workers/:workerId/trips', (_req: Request, res: Response) => {
  res.json({ success: true, data: demoTrips });
});

app.get('/api/trips/:id', (req: Request, res: Response) => {
  const trip = demoTrips.find((t) => t.id === req.params.id);
  if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
  res.json({ success: true, data: trip });
});

// Section 27 Endpoint: GET /earnings/:workerId
app.get('/api/earnings/:workerId', (_req: Request, res: Response) => {
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
app.post('/api/investigations', async (req: Request, res: Response) => {
  const { tripId } = req.body;
  const result = await aiService.investigateCase(tripId || 'demo-trip');
  res.json({ success: true, data: result });
});

// Section 27 Endpoint: GET /cases & POST /cases/:id/generate-package
app.get('/api/cases', (_req: Request, res: Response) => {
  res.json({ success: true, data: demoCases });
});

app.get('/api/cases/:id', (req: Request, res: Response) => {
  const c = demoCases.find((item) => item.id === req.params.id);
  if (!c) return res.status(404).json({ success: false, error: 'Case not found' });
  res.json({ success: true, data: c });
});

app.post('/api/cases/:id/generate-package', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      caseId: req.params.id,
      packageUri: `s3://kavach-evidence-bucket/packages/${req.params.id}-dispute-package.pdf`,
      generatedAt: new Date().toISOString(),
      evidenceCount: demoEvidence.length,
    },
  });
});

// Section 27 Endpoint: POST /worker-twin/query
app.post('/api/worker-twin/query', async (req: Request, res: Response) => {
  const { workerId, query } = req.body;
  res.json({
    success: true,
    data: {
      workerId,
      query,
      answer: `Historical shift analysis indicates peak efficiency between 18:00 - 22:00 in Koramangala. Avoiding Hub 4b during rush hours improves hourly returns by ₹25/hr.`,
      projectedEarnings: 1250,
      optimalHours: ['18:00 - 22:00'],
      observedFactors: ['Merchant wait times', 'Peak surge incentives'],
      confidence: 0.91,
    },
  });
});

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`[Kavach Mock Backend] running on http://localhost:${port}`);
  });
}
