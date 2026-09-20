import {
  Worker,
  Trip,
  TripEvent,
  EarningsRecord,
  Expense,
  Evidence,
  Finding,
  Case,
  AIInvestigationResult,
} from '../src/domain/index.ts';

/**
 * ==============================================================================
 * CANONICAL DEMO WORKER FIXTURE — VIKRAM SHARMA
 * ==============================================================================
 * Represents a credible, full-time food and quick-commerce delivery worker in Bengaluru:
 * - Worker: Vikram Sharma (worker-vikram-01)
 * - Week: Mon Sep 14 to Sat Sep 19, 2026 (6-day work week, 37 total trips)
 * - Incident Trip: trip-2026-09-15-001 (Late delivery penalty of ₹350 disputed)
 * - Reconciled Financials:
 *   - Gross Platform Payout: ₹9,120
 *   - Deductions (Disputed Penalty): ₹350
 *   - Net Platform Payout: ₹8,770
 *   - Operating Expenses: ₹1,270 (Fuel: ₹900, Phone: ₹120, Maintenance: ₹250)
 *   - Real Take-Home Earnings: ₹7,500
 *   - Active Hours: 47.55 hrs (~47.5 hrs)
 *   - Effective Hourly Rate: ~₹157.73 / hr (~₹158/hr)
 *   - Disputed Penalty: ₹350 (trip-2026-09-15-001)
 *   - Unresolved Incentive Shortfall: ₹300 (earn-003, expected ₹500, paid ₹200)
 * ==============================================================================
 */

export const demoWorker: Worker = {
  id: 'worker-vikram-01',
  name: 'Vikram Sharma',
  preferredLanguage: 'hi',
  platforms: ['QuickBite', 'FlashDrop'],
};

export const demoTrips: Trip[] = [
  // Tuesday Sep 15 — Hero Incident Trip (Canonical, preserved exactly)
  {
    id: 'trip-2026-09-15-001',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    storeId: 'store-koramangala-4b',
    startedAt: '2026-09-15T19:00:00+05:30',
    completedAt: '2026-09-15T19:24:00+05:30',
    slaSeconds: 600,
    distanceMeters: 3200,
    status: 'DISPUTED',
  },
  // Tuesday Sep 15 — Trip 2 (Canonical, preserved exactly)
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

  // Monday Sep 14 — 6 trips (12:30 to 20:15 = 7.75 hrs)
  {
    id: 'trip-2026-09-14-003',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    storeId: 'store-koramangala-2',
    startedAt: '2026-09-14T12:30:00+05:30',
    completedAt: '2026-09-14T12:50:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 3200,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-14-004',
    workerId: 'worker-vikram-01',
    platform: 'FlashDrop',
    storeId: 'store-hsr-1',
    startedAt: '2026-09-14T13:10:00+05:30',
    completedAt: '2026-09-14T13:30:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 2800,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-14-005',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    storeId: 'store-btm-3',
    startedAt: '2026-09-14T14:00:00+05:30',
    completedAt: '2026-09-14T14:25:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 4100,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-14-006',
    workerId: 'worker-vikram-01',
    platform: 'FlashDrop',
    storeId: 'store-koramangala-4b',
    startedAt: '2026-09-14T18:00:00+05:30',
    completedAt: '2026-09-14T18:25:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 3500,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-14-007',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    storeId: 'store-indiranagar-2',
    startedAt: '2026-09-14T19:15:00+05:30',
    completedAt: '2026-09-14T19:40:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 4600,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-14-008',
    workerId: 'worker-vikram-01',
    platform: 'FlashDrop',
    storeId: 'store-koramangala-1',
    startedAt: '2026-09-14T20:00:00+05:30',
    completedAt: '2026-09-14T20:15:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 2200,
    status: 'COMPLETED',
  },

  // Tuesday Sep 15 — 5 afternoon trips before hero trip (12:00 to 18:40)
  {
    id: 'trip-2026-09-15-009',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    storeId: 'store-koramangala-3',
    startedAt: '2026-09-15T12:00:00+05:30',
    completedAt: '2026-09-15T12:20:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 2900,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-15-010',
    workerId: 'worker-vikram-01',
    platform: 'FlashDrop',
    storeId: 'store-hsr-2',
    startedAt: '2026-09-15T12:45:00+05:30',
    completedAt: '2026-09-15T13:05:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 2600,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-15-011',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    storeId: 'store-btm-1',
    startedAt: '2026-09-15T13:30:00+05:30',
    completedAt: '2026-09-15T13:50:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 3100,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-15-012',
    workerId: 'worker-vikram-01',
    platform: 'FlashDrop',
    storeId: 'store-koramangala-4b',
    startedAt: '2026-09-15T17:30:00+05:30',
    completedAt: '2026-09-15T17:55:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 3400,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-15-013',
    workerId: 'worker-vikram-01',
    platform: 'FlashDrop',
    storeId: 'store-indiranagar-1',
    startedAt: '2026-09-15T18:15:00+05:30',
    completedAt: '2026-09-15T18:40:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 3800,
    status: 'COMPLETED',
  },

  // Wednesday Sep 16 — 6 trips (12:30 to 20:15 = 7.75 hrs)
  {
    id: 'trip-2026-09-16-014',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    startedAt: '2026-09-16T12:30:00+05:30',
    completedAt: '2026-09-16T12:50:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 3000,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-16-015',
    workerId: 'worker-vikram-01',
    platform: 'FlashDrop',
    startedAt: '2026-09-16T13:10:00+05:30',
    completedAt: '2026-09-16T13:30:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 2700,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-16-016',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    startedAt: '2026-09-16T14:00:00+05:30',
    completedAt: '2026-09-16T14:25:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 4200,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-16-017',
    workerId: 'worker-vikram-01',
    platform: 'FlashDrop',
    startedAt: '2026-09-16T18:00:00+05:30',
    completedAt: '2026-09-16T18:25:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 3600,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-16-018',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    startedAt: '2026-09-16T19:15:00+05:30',
    completedAt: '2026-09-16T19:40:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 4400,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-16-019',
    workerId: 'worker-vikram-01',
    platform: 'FlashDrop',
    startedAt: '2026-09-16T20:00:00+05:30',
    completedAt: '2026-09-16T20:15:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 2500,
    status: 'COMPLETED',
  },

  // Thursday Sep 17 — 6 trips (12:30 to 20:15 = 7.75 hrs)
  {
    id: 'trip-2026-09-17-020',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    startedAt: '2026-09-17T12:30:00+05:30',
    completedAt: '2026-09-17T12:50:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 3100,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-17-021',
    workerId: 'worker-vikram-01',
    platform: 'FlashDrop',
    startedAt: '2026-09-17T13:10:00+05:30',
    completedAt: '2026-09-17T13:30:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 2900,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-17-022',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    startedAt: '2026-09-17T14:00:00+05:30',
    completedAt: '2026-09-17T14:25:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 3900,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-17-023',
    workerId: 'worker-vikram-01',
    platform: 'FlashDrop',
    startedAt: '2026-09-17T18:00:00+05:30',
    completedAt: '2026-09-17T18:25:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 3700,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-17-024',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    startedAt: '2026-09-17T19:15:00+05:30',
    completedAt: '2026-09-17T19:40:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 4500,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-17-025',
    workerId: 'worker-vikram-01',
    platform: 'FlashDrop',
    startedAt: '2026-09-17T20:00:00+05:30',
    completedAt: '2026-09-17T20:15:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 2300,
    status: 'COMPLETED',
  },

  // Friday Sep 18 — 6 trips (12:00 to 20:00 = 8.0 hrs)
  {
    id: 'trip-2026-09-18-026',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    startedAt: '2026-09-18T12:00:00+05:30',
    completedAt: '2026-09-18T12:20:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 3300,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-18-027',
    workerId: 'worker-vikram-01',
    platform: 'FlashDrop',
    startedAt: '2026-09-18T12:45:00+05:30',
    completedAt: '2026-09-18T13:10:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 3100,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-18-028',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    startedAt: '2026-09-18T13:30:00+05:30',
    completedAt: '2026-09-18T13:55:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 3800,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-18-029',
    workerId: 'worker-vikram-01',
    platform: 'FlashDrop',
    startedAt: '2026-09-18T17:45:00+05:30',
    completedAt: '2026-09-18T18:15:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 4200,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-18-030',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    startedAt: '2026-09-18T18:40:00+05:30',
    completedAt: '2026-09-18T19:10:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 4900,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-18-031',
    workerId: 'worker-vikram-01',
    platform: 'FlashDrop',
    startedAt: '2026-09-18T19:30:00+05:30',
    completedAt: '2026-09-18T20:00:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 4000,
    status: 'COMPLETED',
  },

  // Saturday Sep 19 — 6 trips (12:30 to 20:30 = 8.0 hrs)
  {
    id: 'trip-2026-09-19-032',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    startedAt: '2026-09-19T12:30:00+05:30',
    completedAt: '2026-09-19T12:55:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 3600,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-19-033',
    workerId: 'worker-vikram-01',
    platform: 'FlashDrop',
    startedAt: '2026-09-19T13:15:00+05:30',
    completedAt: '2026-09-19T13:40:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 3200,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-19-034',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    startedAt: '2026-09-19T14:00:00+05:30',
    completedAt: '2026-09-19T14:30:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 4500,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-19-035',
    workerId: 'worker-vikram-01',
    platform: 'FlashDrop',
    startedAt: '2026-09-19T18:00:00+05:30',
    completedAt: '2026-09-19T18:30:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 4100,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-19-036',
    workerId: 'worker-vikram-01',
    platform: 'QuickBite',
    startedAt: '2026-09-19T19:00:00+05:30',
    completedAt: '2026-09-19T19:35:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 5200,
    status: 'COMPLETED',
  },
  {
    id: 'trip-2026-09-19-037',
    workerId: 'worker-vikram-01',
    platform: 'FlashDrop',
    startedAt: '2026-09-19T20:00:00+05:30',
    completedAt: '2026-09-19T20:30:00+05:30',
    slaSeconds: 1200,
    distanceMeters: 4800,
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
    source: 'CITY_TRAFFIC_FEED',
    confidence: 0.91,
    evidenceIds: ['ev-traffic-alert-koramangala'],
  },
  {
    id: 'evt-006',
    tripId: 'trip-2026-09-15-001',
    type: 'DELIVERY_COMPLETED',
    timestamp: '2026-09-15T19:24:00+05:30',
    latitude: 12.9279,
    longitude: 77.6271,
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
  // Canonical hero trip records
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

  // Monday Sep 14 Base Pays (6 trips)
  { id: 'earn-trip-003', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-14-003', type: 'BASE_PAY', expectedAmount: 88, actualAmount: 88, currency: 'INR', timestamp: '2026-09-14T12:50:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-004', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-14-004', type: 'BASE_PAY', expectedAmount: 84, actualAmount: 84, currency: 'INR', timestamp: '2026-09-14T13:30:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-005', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-14-005', type: 'BASE_PAY', expectedAmount: 99, actualAmount: 99, currency: 'INR', timestamp: '2026-09-14T14:25:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-006', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-14-006', type: 'BASE_PAY', expectedAmount: 92, actualAmount: 92, currency: 'INR', timestamp: '2026-09-14T18:25:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-007', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-14-007', type: 'BASE_PAY', expectedAmount: 105, actualAmount: 105, currency: 'INR', timestamp: '2026-09-14T19:40:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-008', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-14-008', type: 'BASE_PAY', expectedAmount: 76, actualAmount: 76, currency: 'INR', timestamp: '2026-09-14T20:15:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },

  // Tuesday Sep 15 Base Pays (remaining 6 trips)
  { id: 'earn-trip-002', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-15-002', type: 'BASE_PAY', expectedAmount: 104, actualAmount: 104, currency: 'INR', timestamp: '2026-09-15T20:18:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-009', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-15-009', type: 'BASE_PAY', expectedAmount: 85, actualAmount: 85, currency: 'INR', timestamp: '2026-09-15T12:20:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-010', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-15-010', type: 'BASE_PAY', expectedAmount: 81, actualAmount: 81, currency: 'INR', timestamp: '2026-09-15T13:05:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-011', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-15-011', type: 'BASE_PAY', expectedAmount: 87, actualAmount: 87, currency: 'INR', timestamp: '2026-09-15T13:50:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-012', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-15-012', type: 'BASE_PAY', expectedAmount: 91, actualAmount: 91, currency: 'INR', timestamp: '2026-09-15T17:55:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-013', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-15-013', type: 'BASE_PAY', expectedAmount: 96, actualAmount: 96, currency: 'INR', timestamp: '2026-09-15T18:40:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },

  // Wednesday Sep 16 Base Pays (6 trips)
  { id: 'earn-trip-014', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-16-014', type: 'BASE_PAY', expectedAmount: 86, actualAmount: 86, currency: 'INR', timestamp: '2026-09-16T12:50:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-015', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-16-015', type: 'BASE_PAY', expectedAmount: 82, actualAmount: 82, currency: 'INR', timestamp: '2026-09-16T13:30:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-016', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-16-016', type: 'BASE_PAY', expectedAmount: 100, actualAmount: 100, currency: 'INR', timestamp: '2026-09-16T14:25:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-017', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-16-017', type: 'BASE_PAY', expectedAmount: 93, actualAmount: 93, currency: 'INR', timestamp: '2026-09-16T18:25:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-018', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-16-018', type: 'BASE_PAY', expectedAmount: 103, actualAmount: 103, currency: 'INR', timestamp: '2026-09-16T19:40:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-019', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-16-019', type: 'BASE_PAY', expectedAmount: 80, actualAmount: 80, currency: 'INR', timestamp: '2026-09-16T20:15:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },

  // Thursday Sep 17 Base Pays (6 trips)
  { id: 'earn-trip-020', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-17-020', type: 'BASE_PAY', expectedAmount: 87, actualAmount: 87, currency: 'INR', timestamp: '2026-09-17T12:50:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-021', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-17-021', type: 'BASE_PAY', expectedAmount: 85, actualAmount: 85, currency: 'INR', timestamp: '2026-09-17T13:30:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-022', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-17-022', type: 'BASE_PAY', expectedAmount: 97, actualAmount: 97, currency: 'INR', timestamp: '2026-09-17T14:25:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-023', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-17-023', type: 'BASE_PAY', expectedAmount: 94, actualAmount: 94, currency: 'INR', timestamp: '2026-09-17T18:25:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-024', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-17-024', type: 'BASE_PAY', expectedAmount: 104, actualAmount: 104, currency: 'INR', timestamp: '2026-09-17T19:40:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-025', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-17-025', type: 'BASE_PAY', expectedAmount: 78, actualAmount: 78, currency: 'INR', timestamp: '2026-09-17T20:15:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },

  // Friday Sep 18 Base Pays (6 trips)
  { id: 'earn-trip-026', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-18-026', type: 'BASE_PAY', expectedAmount: 90, actualAmount: 90, currency: 'INR', timestamp: '2026-09-18T12:20:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-027', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-18-027', type: 'BASE_PAY', expectedAmount: 87, actualAmount: 87, currency: 'INR', timestamp: '2026-09-18T13:10:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-028', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-18-028', type: 'BASE_PAY', expectedAmount: 96, actualAmount: 96, currency: 'INR', timestamp: '2026-09-18T13:55:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-029', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-18-029', type: 'BASE_PAY', expectedAmount: 100, actualAmount: 100, currency: 'INR', timestamp: '2026-09-18T18:15:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-030', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-18-030', type: 'BASE_PAY', expectedAmount: 109, actualAmount: 109, currency: 'INR', timestamp: '2026-09-18T19:10:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-031', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-18-031', type: 'BASE_PAY', expectedAmount: 98, actualAmount: 98, currency: 'INR', timestamp: '2026-09-18T20:00:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },

  // Saturday Sep 19 Base Pays (6 trips)
  { id: 'earn-trip-032', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-19-032', type: 'BASE_PAY', expectedAmount: 93, actualAmount: 93, currency: 'INR', timestamp: '2026-09-19T12:55:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-033', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-19-033', type: 'BASE_PAY', expectedAmount: 88, actualAmount: 88, currency: 'INR', timestamp: '2026-09-19T13:40:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-034', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-19-034', type: 'BASE_PAY', expectedAmount: 104, actualAmount: 104, currency: 'INR', timestamp: '2026-09-19T14:30:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-035', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-19-035', type: 'BASE_PAY', expectedAmount: 99, actualAmount: 99, currency: 'INR', timestamp: '2026-09-19T18:30:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-036', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-19-036', type: 'BASE_PAY', expectedAmount: 112, actualAmount: 112, currency: 'INR', timestamp: '2026-09-19T19:35:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },
  { id: 'earn-trip-037', workerId: 'worker-vikram-01', tripId: 'trip-2026-09-19-037', type: 'BASE_PAY', expectedAmount: 108, actualAmount: 108, currency: 'INR', timestamp: '2026-09-19T20:30:00+05:30', source: 'PLATFORM_PAYOUT_LEDGER' },

  // Daily Peak Surge Incentives (Mon, Wed, Thu, Fri, Sat)
  {
    id: 'earn-inc-mon',
    workerId: 'worker-vikram-01',
    type: 'INCENTIVE',
    expectedAmount: 350,
    actualAmount: 350,
    currency: 'INR',
    timestamp: '2026-09-14T22:00:00+05:30',
    source: 'DAILY_PEAK_SURGE_INCENTIVE',
  },
  {
    id: 'earn-inc-wed',
    workerId: 'worker-vikram-01',
    type: 'INCENTIVE',
    expectedAmount: 350,
    actualAmount: 350,
    currency: 'INR',
    timestamp: '2026-09-16T22:00:00+05:30',
    source: 'DAILY_PEAK_SURGE_INCENTIVE',
  },
  {
    id: 'earn-inc-thu',
    workerId: 'worker-vikram-01',
    type: 'INCENTIVE',
    expectedAmount: 350,
    actualAmount: 350,
    currency: 'INR',
    timestamp: '2026-09-17T22:00:00+05:30',
    source: 'DAILY_PEAK_SURGE_INCENTIVE',
  },
  {
    id: 'earn-inc-fri',
    workerId: 'worker-vikram-01',
    type: 'INCENTIVE',
    expectedAmount: 450,
    actualAmount: 450,
    currency: 'INR',
    timestamp: '2026-09-18T22:30:00+05:30',
    source: 'DAILY_PEAK_SURGE_INCENTIVE',
  },
  {
    id: 'earn-inc-sat',
    workerId: 'worker-vikram-01',
    type: 'INCENTIVE',
    expectedAmount: 500,
    actualAmount: 500,
    currency: 'INR',
    timestamp: '2026-09-19T22:30:00+05:30',
    source: 'DAILY_PEAK_SURGE_INCENTIVE',
  },

  // Target Milestone Bonus & Customer In-App Tips
  {
    id: 'earn-bonus-milestone',
    workerId: 'worker-vikram-01',
    type: 'BONUS',
    expectedAmount: 2400,
    actualAmount: 2400,
    currency: 'INR',
    timestamp: '2026-09-19T23:00:00+05:30',
    source: 'WEEKLY_ORDER_TARGET_MILESTONE',
  },
  {
    id: 'earn-bonus-weekend',
    workerId: 'worker-vikram-01',
    type: 'BONUS',
    expectedAmount: 450,
    actualAmount: 450,
    currency: 'INR',
    timestamp: '2026-09-19T23:15:00+05:30',
    source: 'WEEKEND_PEAK_COMPLETION_BONUS',
  },
  {
    id: 'earn-bonus-tips',
    workerId: 'worker-vikram-01',
    type: 'BONUS',
    expectedAmount: 644,
    actualAmount: 644,
    currency: 'INR',
    timestamp: '2026-09-19T23:30:00+05:30',
    source: 'CUSTOMER_TIPS_PASS_THROUGH',
  },
];

export const demoExpenses: Expense[] = [
  // Tuesday hero expenses (IDs preserved)
  {
    id: 'exp-001',
    workerId: 'worker-vikram-01',
    type: 'FUEL',
    amount: 155,
    timestamp: '2026-09-15T17:30:00+05:30',
    source: 'PETROL_BUNK_RECEIPT',
  },
  {
    id: 'exp-002',
    workerId: 'worker-vikram-01',
    type: 'PHONE',
    amount: 20,
    timestamp: '2026-09-15T18:00:00+05:30',
    source: 'MOBILE_DATA_ALLOCATION',
  },

  // Monday Sep 14
  {
    id: 'exp-mon-fuel',
    workerId: 'worker-vikram-01',
    type: 'FUEL',
    amount: 145,
    timestamp: '2026-09-14T09:00:00+05:30',
    source: 'PETROL_BUNK_RECEIPT',
  },
  {
    id: 'exp-mon-phone',
    workerId: 'worker-vikram-01',
    type: 'PHONE',
    amount: 20,
    timestamp: '2026-09-14T09:05:00+05:30',
    source: 'MOBILE_DATA_ALLOCATION',
  },

  // Wednesday Sep 16
  {
    id: 'exp-wed-fuel',
    workerId: 'worker-vikram-01',
    type: 'FUEL',
    amount: 150,
    timestamp: '2026-09-16T09:00:00+05:30',
    source: 'PETROL_BUNK_RECEIPT',
  },
  {
    id: 'exp-wed-phone',
    workerId: 'worker-vikram-01',
    type: 'PHONE',
    amount: 20,
    timestamp: '2026-09-16T09:05:00+05:30',
    source: 'MOBILE_DATA_ALLOCATION',
  },
  {
    id: 'exp-gen-9',
    workerId: 'worker-vikram-01',
    type: 'MAINTENANCE',
    amount: 250,
    timestamp: '2026-09-16T15:00:00+05:30',
    source: 'MECHANIC_RECEIPT',
  },

  // Thursday Sep 17
  {
    id: 'exp-thu-fuel',
    workerId: 'worker-vikram-01',
    type: 'FUEL',
    amount: 145,
    timestamp: '2026-09-17T09:00:00+05:30',
    source: 'PETROL_BUNK_RECEIPT',
  },
  {
    id: 'exp-thu-phone',
    workerId: 'worker-vikram-01',
    type: 'PHONE',
    amount: 20,
    timestamp: '2026-09-17T09:05:00+05:30',
    source: 'MOBILE_DATA_ALLOCATION',
  },

  // Friday Sep 18
  {
    id: 'exp-fri-fuel',
    workerId: 'worker-vikram-01',
    type: 'FUEL',
    amount: 155,
    timestamp: '2026-09-18T09:00:00+05:30',
    source: 'PETROL_BUNK_RECEIPT',
  },
  {
    id: 'exp-fri-phone',
    workerId: 'worker-vikram-01',
    type: 'PHONE',
    amount: 20,
    timestamp: '2026-09-18T09:05:00+05:30',
    source: 'MOBILE_DATA_ALLOCATION',
  },

  // Saturday Sep 19
  {
    id: 'exp-sat-fuel',
    workerId: 'worker-vikram-01',
    type: 'FUEL',
    amount: 150,
    timestamp: '2026-09-19T09:00:00+05:30',
    source: 'PETROL_BUNK_RECEIPT',
  },
  {
    id: 'exp-sat-phone',
    workerId: 'worker-vikram-01',
    type: 'PHONE',
    amount: 20,
    timestamp: '2026-09-19T09:05:00+05:30',
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
  {
    id: 'ev-incentive-target-screenshot',
    type: 'SCREENSHOT',
    source: 'WORKER_UPLOAD',
    timestamp: '2026-09-15T22:05:00+05:30',
    uri: 's3://kavach-evidence-bucket/vikram/2026-09-15/incentive_target_screenshot.png',
    description: 'In-app surge bonus promotional screen showing ₹500 payout for completing 6 peak-hour deliveries.',
    confidence: 0.95,
  },
  {
    id: 'ev-policy-clause-4-2',
    type: 'DOCUMENT',
    source: 'PLATFORM_TERMS',
    timestamp: '2026-09-01T00:00:00+05:30',
    description: 'Demo Policy Evidence: QuickBite Delivery Partner Terms Clause 4.2 (Merchant Preparation Delay). Mandates automatic 1:1 delivery SLA extension when merchant wait time exceeds 5 minutes.',
    confidence: 0.90,
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

export const canonicalInvestigationResult: AIInvestigationResult = {
  summary:
    'Multi-agent investigation for trip trip-2026-09-15-001: Merchant wait time of 7 minutes left insufficient transit time (3m remaining of 10m SLA). Penalty of ₹350 is contested by verified telemetry.',
  findings: [
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
  ],
  missingEvidence: ['Customer app delivery handover photo'],
  contradictions: [
    `Platform penalty allegation in 'ev-penalty-screenshot' (claiming partner delivery delay) contradicts verified merchant terminal queue log 'ev-merchant-log' and GPS arrival 'ev-store-arrival-gps' (confirming 7-minute in-kitchen preparation delay before handover).`,
  ],
  recommendedActions: [
    'Available evidence indicates uncompensated merchant delay; recommend submitting dispute package with GPS arrival and scan telemetry',
    'Request review under the applicable merchant-delay policy based on uncredited merchant wait time',
  ],
  confidence: 0.94,
};

export interface DemoDataset {
  worker: Worker;
  trips: Trip[];
  tripEvents: TripEvent[];
  earnings: EarningsRecord[];
  expenses: Expense[];
  evidence: Evidence[];
  findings: Finding[];
  cases: Case[];
  summary: import('../src/domain/index.ts').FinancialSummary;
  investigation: AIInvestigationResult;
}

import { calculateFinancialSummary } from '../src/calculations/earnings.ts';

export function loadDemoDataset(): DemoDataset {
  return {
    worker: demoWorker,
    trips: demoTrips,
    tripEvents: demoTripEvents,
    earnings: demoEarnings,
    expenses: demoExpenses,
    evidence: demoEvidence,
    findings: demoFindings,
    cases: demoCases,
    summary: calculateFinancialSummary(demoEarnings, demoExpenses, demoTrips),
    investigation: canonicalInvestigationResult,
  };
}
