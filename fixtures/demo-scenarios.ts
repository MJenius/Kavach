import { loadDemoDataset, DemoDataset } from './demo-worker.ts';
import { calculateFinancialSummary } from '../src/calculations/earnings.ts';
import type { EarningsRecord, Trip, Case, Finding, AIInvestigationResult } from '../src/domain/index.ts';

const baseData = loadDemoDataset();

export interface Scenario {
  id: string;
  name: string;
  description: string;
  data: DemoDataset;
}

/**
 * Scenario A: Hero Investigation
 * Disputed ₹350 penalty caused by 7 minutes of uncredited merchant delay.
 * Strong corroborating evidence chain (GPS arrival, merchant log, scan).
 */
export const scenarioA: Scenario = {
  id: 'scenario-a',
  name: 'Hero Investigation',
  description: 'Worker facing a late penalty of ₹350 due to 7 minutes of uncredited merchant delay. Strong evidence supports the worker.',
  data: baseData,
};

/**
 * Scenario B: Genuinely Healthy Week (Distinct Ground Truth Dataset)
 * Zero penalty deductions (disputedAmount = 0).
 * Full incentive bonuses paid (₹500 full surge credit).
 * Clean delivery runs across 37 trips, zero disputed trips, high net take-home (₹8,350 vs ₹7,500).
 */
const healthyEarnings: EarningsRecord[] = baseData.earnings
  .filter((e) => e.type !== 'PENALTY') // Remove ₹350 penalty deduction
  .map((e) =>
    e.id === 'earn-003'
      ? { ...e, actualAmount: 500, expectedAmount: 500 } // Full ₹500 incentive credited (no shortfall)
      : e
  );

const healthyTrips: Trip[] = baseData.trips.map((t) => ({
  ...t,
  status: 'COMPLETED' as const, // Zero disputed trips
}));

const healthyCases: Case[] = [];
const healthyFindings: Finding[] = [];
const healthyInvestigation: AIInvestigationResult = {
  summary: 'Healthy operational week: 37 completed trips with 100% on-time handover and zero penalty deductions.',
  findings: [],
  missingEvidence: [],
  contradictions: [],
  recommendedActions: ['Continue operating during high-yield weekend surge windows.'],
  confidence: 1.0,
};

export const scenarioB: Scenario = {
  id: 'scenario-b',
  name: 'Healthy Week',
  description: 'A full week of flawless deliveries: zero penalties, full incentive bonuses paid, and zero disputed cases.',
  data: {
    ...baseData,
    trips: healthyTrips,
    earnings: healthyEarnings,
    cases: healthyCases,
    findings: healthyFindings,
    investigation: healthyInvestigation,
    summary: calculateFinancialSummary(healthyEarnings, baseData.expenses, healthyTrips),
  },
};

/**
 * Scenario C: Genuinely Insufficient Evidence (Distinct Ground Truth Dataset)
 * Worker claims missing ₹400 payout for an untracked shift, but lacks GPS telemetry,
 * merchant logs, and app scans. Rejection with confidence 0.18.
 */
const insufficientTrip: Trip = {
  id: 'trip-2026-09-17-999',
  workerId: 'worker-vikram-01',
  platform: 'FlashDrop',
  startedAt: '2026-09-17T12:00:00+05:30',
  completedAt: '2026-09-17T12:20:00+05:30',
  slaSeconds: 1200,
  distanceMeters: 2500,
  status: 'DISPUTED',
};

const insufficientFinding: Finding = {
  id: 'finding-insufficient-01',
  type: 'PAYOUT_DISCREPANCY',
  severity: 'LOW',
  title: 'Missing payment claim lacks backing evidence',
  explanation: 'Worker claims missing payment but there is zero GPS arrival, cell tower triangulation, or merchant handover telemetry on record.',
  confidence: 0.18,
  evidenceIds: [],
};

const insufficientCase: Case = {
  id: 'case-003',
  workerId: 'worker-vikram-01',
  type: 'PAYOUT',
  status: 'REVIEW',
  findingIds: ['finding-insufficient-01'],
  createdAt: '2026-09-17T13:00:00+05:30',
};

const insufficientInvestigation: AIInvestigationResult = {
  summary: 'Investigation inconclusive: Insufficient evidence available to substantiate worker dispute.',
  findings: [insufficientFinding],
  missingEvidence: [
    'GPS breadcrumb log between 12:00 and 12:20 IST',
    'Merchant counter receipt / package scan',
    'Customer delivery verification OTP',
  ],
  contradictions: ['Worker manual log claims delivery completed, but platform API reports trip cancelled before pickup.'],
  recommendedActions: ['Request worker to upload platform trip history screenshot or UPI settlement SMS.'],
  confidence: 0.18,
};

export const scenarioC: Scenario = {
  id: 'scenario-c',
  name: 'Insufficient Evidence Problem',
  description: 'Disputed missing payment claim completely lacking telemetry and merchant logs, producing low confidence refusal.',
  data: {
    ...baseData,
    trips: [insufficientTrip, ...baseData.trips],
    cases: [insufficientCase, ...baseData.cases],
    findings: [insufficientFinding, ...baseData.findings],
    investigation: insufficientInvestigation,
  },
};

export const allScenarios = [scenarioA, scenarioB, scenarioC];
