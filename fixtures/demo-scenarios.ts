import { loadDemoDataset, DemoDataset } from './demo-worker.ts';


const baseData = loadDemoDataset();

export interface Scenario {
  id: string;
  name: string;
  description: string;
  data: DemoDataset;
}

export const scenarioA: Scenario = {
  id: 'scenario-a',
  name: 'Hero Investigation',
  description: 'Worker facing a late penalty of ₹350 due to 7 minutes of uncredited merchant delay. Strong evidence supports the worker.',
  data: baseData, // Base dataset includes the hero trip and penalty
};

export const scenarioB: Scenario = {
  id: 'scenario-b',
  name: 'Healthy Week',
  description: 'A full week of earnings, demonstrating standard payout models and standard expenses, yielding positive earnings.',
  data: baseData,
};

export const scenarioC: Scenario = {
  id: 'scenario-c',
  name: 'Insufficient Evidence Problem',
  description: 'A trip where worker disputes a missing payment but lacks GPS telemetry and merchant handover scan, leading to low confidence.',
  data: {
    ...baseData,
    trips: [
      {
        id: 'trip-2026-09-17-999',
        workerId: 'worker-vikram-01',
        platform: 'FlashDrop',
        startedAt: '2026-09-17T12:00:00+05:30',
        completedAt: '2026-09-17T12:20:00+05:30',
        slaSeconds: 1200,
        distanceMeters: 2500,
        status: 'DISPUTED',
      },
      ...baseData.trips
    ],
    cases: [
      {
        id: 'case-003',
        workerId: 'worker-vikram-01',
        type: 'PAYOUT',
        status: 'REVIEW',
        findingIds: ['finding-insufficient-01'],
        createdAt: '2026-09-17T13:00:00+05:30',
      },
      ...baseData.cases
    ],
    findings: [
      {
        id: 'finding-insufficient-01',
        type: 'PAYOUT_DISCREPANCY',
        severity: 'LOW',
        title: 'Missing payment claim lacks backing evidence',
        explanation: 'Worker claims missing payment but there is no GPS arrival or app handover scan data.',
        confidence: 0.2,
        evidenceIds: [],
      },
      ...baseData.findings
    ]
  },
};

export const allScenarios = [scenarioA, scenarioB, scenarioC];
