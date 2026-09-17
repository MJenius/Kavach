import express from 'express';
import cors from 'cors';
import { createApiRouter } from './routes.ts';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mount the standard API router
app.use('/api', createApiRouter());

// Root health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'kavach-mock-backend',
    timestamp: new Date().toISOString(),
    mockMode: process.env.MOCK_AI !== 'false',
  });
});

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`[Kavach Mock Backend] running on http://localhost:${port}`);
  });
}

