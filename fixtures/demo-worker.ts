import {
  Worker,
  Trip,
  TripEvent,
  EarningsRecord,
  Expense,
  Evidence,
  Finding,
  Case,
} from '../src/domain/index.ts';

/**
 * ==============================================================================
 * CANONICAL DEMO WORKER FIXTURE — VIKRAM SHARMA
 * ==============================================================================
 * Represents the primary demo scenario described in Section 7 & Section 42 of plan.md:
 * - Worker: Vikram Sharma (Food & Quick-Commerce delivery worker, Bengaluru)
 * - Incident Trip: trip-2026-09-15-001 (Late delivery penalty of ₹350 disputed)
 * - Standardized ISO Timestamps with explicit IST (+05:30) offset:
 *   - 19:00 Accepted: 2026-09-15T19:00:00+05:30
 *   - 19:02 Store Arrival: 2026-09-15T19:02:00+05:30
 *   - 19:02-19:09 Waiting: 7 minutes uncredited delay
 *   - 19:09 Handover: 2026-09-15T19:09:00+05:30
 *   - 19:16 Traffic delay: 2026-09-15T19:16:00+05:30
 *   - 19:24 Delivery completed: 2026-09-15T19:24:00+05:30
 * ==============================================================================
 */

export const demoWorker: Worker = {
  id: 'worker-vikram-01',
  name: 'Vikram Sharma',
  preferredLanguage: 'hi',
  platforms: ['QuickBite', 'FlashDrop'],
};

export const demoTrips: Trip[] = [
  {
    id: 'trip-2026-09-15-001',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    storeId: 'store-koramangala-4b',
    startedAt: '2026-09-15T19:00:00+05:30',
    completedAt: '2026-09-15T19:24:00+05:30',
    slaSeconds: 600, // 10 minutes allocated
    distanceMeters: 3200,
    status: 'DISPUTED',
  },
  {
    id: 'trip-2026-09-15-002',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    storeId: 'store-indiranagar-1a',
    startedAt: '2026-09-15T20:00:00+05:30',
    completedAt: '2026-09-15T20:18:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 4500,
    status: 'COMPLETED',
  },
];

export const demoTripEvents: TripEvent[] = [
  {
    id: 'evt-001',
    tripId: 'trip-2026-09-15-001',
    type: 'STORE_ARRIVAL',
    timestamp: '2026-09-15T19:02:00+05:30',
    latitude: 12.9352,
    longitude: 77.6245,
    source: 'GPS_TELEMETRY',
    confidence: 0.98,
    evidenceIds: ['ev-store-arrival-gps'],
  },
  {
    id: 'evt-002',
    tripId: 'trip-2026-09-15-001',
    type: 'WAITING_STARTED',
    timestamp: '2026-09-15T19:02:00+05:30',
    source: 'MERCHANT_ORDER_QUEUE',
    confidence: 0.95,
    evidenceIds: ['ev-merchant-log'],
  },
  {
    id: 'evt-003',
    tripId: 'trip-2026-09-15-001',
    type: 'PACKAGE_RECEIVED',
    timestamp: '2026-09-15T19:09:00+05:30',
    source: 'PARTNER_APP_SCAN',
    confidence: 0.99,
    evidenceIds: ['ev-merchant-handover-scan'],
  },
  {
    id: 'evt-004',
    tripId: 'trip-2026-09-15-001',
    type: 'DELIVERY_STARTED',
    timestamp: '2026-09-15T19:09:30+05:30',
    latitude: 12.9354,
    longitude: 77.6249,
    source: 'GPS_TELEMETRY',
    confidence: 0.97,
  },
  {
    id: 'evt-005',
    tripId: 'trip-2026-09-15-001',
    type: 'TRAFFIC_EVENT',
    timestamp: '2026-09-15T19:16:00+05:30',
    latitude: 12.9388,
    longitude: 77.6298,
    source: 'CITY_TRAFFIC_FEED',
    confidence: 0.88,
    evidenceIds: ['ev-traffic-alert-koramangala'],
  },
  {
    id: 'evt-006',
    tripId: 'trip-2026-09-15-001',
    type: 'DELIVERY_COMPLETED',
    timestamp: '2026-09-15T19:24:00+05:30',
    latitude: 12.9412,
    longitude: 77.6321,
    source: 'CUSTOMER_OTP_VERIFICATION',
    confidence: 1.0,
    evidenceIds: ['ev-customer-delivery-otp'],
  },
  {
    id: 'evt-007',
    tripId: 'trip-2026-09-15-001',
    type: 'PLATFORM_PENALTY',
    timestamp: '2026-09-15T19:30:00+05:30',
    source: 'PLATFORM_NOTIFICATION',
    confidence: 1.0,
    evidenceIds: ['ev-penalty-screenshot'],
  },
];

export const demoEarnings: EarningsRecord[] = [
  {
    id: 'earn-001',
    workerId: 'worker-vikram-01',
    tripId: 'trip-2026-09-15-001',
    type: 'BASE_PAY',
    expectedAmount: 65,
    actualAmount: 65,
    currency: 'INR',
    timestamp: '2026-09-15T19:25:00+05:30',
    source: 'PLATFORM_PAYOUT_LEDGER',
  },
  {
    id: 'earn-002',
    workerId: 'worker-vikram-01',
    tripId: 'trip-2026-09-15-001',
    type: 'PENALTY',
    expectedAmount: 0,
    actualAmount: -350,
    currency: 'INR',
    timestamp: '2026-09-15T19:30:00+05:30',
    source: 'PLATFORM_DISCIPLINARY_DEDUCTION',
  },
  {
    id: 'earn-003',
    workerId: 'worker-vikram-01',
    type: 'INCENTIVE',
    expectedAmount: 500,
    actualAmount: 200,
    currency: 'INR',
    timestamp: '2026-09-15T22:00:00+05:30',
    source: 'DAILY_PEAK_SURGE_INCENTIVE',
  },
];

export const demoExpenses: Expense[] = [
  {
    id: 'exp-001',
    workerId: 'worker-vikram-01',
    type: 'FUEL',
    amount: 320,
    timestamp: '2026-09-15T17:30:00+05:30',
    source: 'PETROL_BUNK_RECEIPT',
  },
  {
    id: 'exp-002',
    workerId: 'worker-vikram-01',
    type: 'PHONE',
    amount: 25,
    timestamp: '2026-09-15T18:00:00+05:30',
    source: 'MOBILE_DATA_ALLOCATION',
  },
];

export const demoEvidence: Evidence[] = [
  {
    id: 'ev-penalty-screenshot',
    type: 'SCREENSHOT',
    source: 'WORKER_UPLOAD',
    timestamp: '2026-09-15T19:30:00+05:30',
    uri: 's3://kavach-evidence-bucket/vikram/2026-09-15/penalty_screenshot.png',
    description: 'Platform notification screen showing late-delivery penalty of ₹350.',
    confidence: 0.99,
  },
  {
    id: 'ev-store-arrival-gps',
    type: 'TRIP_EVENT',
    source: 'GPS_LOG',
    timestamp: '2026-09-15T19:02:00+05:30',
    description: 'GPS telemetry verifying arrival at merchant location at 19:02 IST.',
    confidence: 0.98,
  },
  {
    id: 'ev-merchant-log',
    type: 'DOCUMENT',
    source: 'MERCHANT_PORTAL_RECEIPT',
    timestamp: '2026-09-15T19:02:00+05:30',
    description: 'Merchant queue confirms order packaging delay of 7 minutes.',
    confidence: 0.95,
  },
  {
    id: 'ev-merchant-handover-scan',
    type: 'TRIP_EVENT',
    source: 'APP_SCAN',
    timestamp: '2026-09-15T19:09:00+05:30',
    description: 'Barcode scan of package handed over at 19:09 IST.',
    confidence: 0.99,
  },
  {
    id: 'ev-traffic-alert-koramangala',
    type: 'TRIP_EVENT',
    source: 'TRAFFIC_API',
    timestamp: '2026-09-15T19:16:00+05:30',
    description: 'Road obstruction / heavy congestion reported on 80 Feet Road Koramangala. trafficDelaySeconds=360',
    confidence: 0.88,
  },
  {
    id: 'ev-customer-delivery-otp',
    type: 'TRIP_EVENT',
    source: 'OTP_VERIFICATION',
    timestamp: '2026-09-15T19:24:00+05:30',
    description: 'Verified successful delivery completed with customer PIN at 19:24 IST.',
    confidence: 1.0,
  },
  {
    id: 'ev-wait-calc',
    type: 'CALCULATION',
    source: 'KAVACH_DETERMINISTIC_ENGINE',
    timestamp: '2026-09-15T19:40:00+05:30',
    description: 'Store waiting calculation: 19:09 - 19:02 = 7 minutes wait. Remaining delivery SLA: 3 minutes.',
    confidence: 1.0,
  },
];

export const demoFindings: Finding[] = [
  {
    id: 'finding-late-penalty-01',
    type: 'DECISION_REVIEW',
    severity: 'HIGH',
    title: 'Late delivery penalty warrants review due to merchant queue delay',
    explanation:
      'Platform levied a ₹350 penalty citing late delivery. Evidence confirms worker arrived at merchant at 19:02 but experienced 7 minutes of uncompensated merchant delay before package handover at 19:09, leaving insufficient SLA for delivery.',
    confidence: 0.94,
    evidenceIds: [
      'ev-store-arrival-gps',
      'ev-merchant-log',
      'ev-merchant-handover-scan',
      'ev-wait-calc',
      'ev-traffic-alert-koramangala',
      'ev-customer-delivery-otp',
    ],
  },
];

export const demoCases: Case[] = [
  {
    id: 'case-001',
    workerId: 'worker-vikram-01',
    type: 'TRIP',
    status: 'READY',
    findingIds: ['finding-late-penalty-01'],
    createdAt: '2026-09-15T20:00:00+05:30',
  },
  {
    id: 'case-002',
    workerId: 'worker-vikram-01',
    type: 'PAYOUT',
    status: 'REVIEW',
    findingIds: [],
    createdAt: '2026-09-15T22:30:00+05:30',
  },
];

/**
 * Single Unified Demo Dataset Loader
 * All pages, tests, and mock handlers should import this to guarantee 100% data consistency.
 */
export interface DemoDataset {
  worker: Worker;
  trips: Trip[];
  tripEvents: TripEvent[];
  earnings: EarningsRecord[];
  expenses: Expense[];
  evidence: Evidence[];
  findings: Finding[];
  cases: Case[];
  summary: {
    grossEarnings: number;
    totalExpenses: number;
    netEarnings: number;
    effectiveHourlyRate: number;
    discrepancyTotal: number;
  };
}

export function loadDemoDataset(): DemoDataset {
  const grossEarnings = demoEarnings.reduce((acc, curr) => acc + (curr.actualAmount || 0), 0);
  const totalExpenses = demoExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netEarnings = grossEarnings - totalExpenses;
  const effectiveHourlyRate = Math.round((netEarnings / 53) * 100) / 100; // 53 active hours
  const penaltyDiscrepancy = demoEarnings
    .filter((e) => e.type === 'PENALTY')
    .reduce((acc, curr) => acc + Math.abs(curr.actualAmount || 0), 0);
  const incentiveDiscrepancy = demoEarnings
    .filter((e) => e.type === 'INCENTIVE')
    .reduce((acc, curr) => acc + Math.max(0, (curr.expectedAmount || 0) - (curr.actualAmount || 0)), 0);
  const discrepancyTotal = penaltyDiscrepancy + incentiveDiscrepancy; // 350 penalty + 300 incentive shortfall = 650

  return {
    worker: demoWorker,
    trips: demoTrips,
    tripEvents: demoTripEvents,
    earnings: demoEarnings,
    expenses: demoExpenses,
    evidence: demoEvidence,
    findings: demoFindings,
    cases: demoCases,
    summary: {
      grossEarnings,
      totalExpenses,
      netEarnings,
      effectiveHourlyRate,
      discrepancyTotal,
    },
  };
}
