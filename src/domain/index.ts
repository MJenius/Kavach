/**
 * ==============================================================================
 * Kavach AI — Shared Domain Contracts [FROZEN CONTRACT]
 * ==============================================================================
 * SOURCE OF TRUTH: plan.md (Sections 15 & 16)
 *
 * ⚠️ CRITICAL NOTICE:
 * Changes require team agreement because all four feature branches depend on
 * these contracts:
 * - Person 1: feature/ai-intelligence
 * - Person 2: feature/evidence-engine
 * - Person 3: feature/cloud-platform
 * - Person 4: feature/frontend-experience
 *
 * DO NOT modify, rename, or delete these types in individual feature branches.
 * ==============================================================================
 */

export interface Worker {
  id: string;
  name: string;
  preferredLanguage: string;
  platforms: string[];
}

export interface Trip {
  id: string;
  workerId: string;
  platform: string;
  storeId?: string;
  startedAt: string;
  completedAt?: string;
  slaSeconds?: number;
  distanceMeters?: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED' | string;
}

export type TripEventType =
  | 'STORE_ARRIVAL'
  | 'WAITING_STARTED'
  | 'PACKAGE_RECEIVED'
  | 'DELIVERY_STARTED'
  | 'TRAFFIC_EVENT'
  | 'DELIVERY_COMPLETED'
  | 'PLATFORM_PENALTY';

export interface TripEvent {
  id: string;
  tripId: string;
  type: TripEventType;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  source: string;
  confidence?: number;
  evidenceIds?: string[];
}

export type EarningsRecordType =
  | 'BASE_PAY'
  | 'INCENTIVE'
  | 'BONUS'
  | 'PENALTY'
  | 'DEDUCTION'
  | 'ADJUSTMENT';

export interface EarningsRecord {
  id: string;
  workerId: string;
  tripId?: string;
  type: EarningsRecordType;
  expectedAmount?: number;
  actualAmount?: number;
  currency: 'INR';
  timestamp: string;
  source: string;
}

export type ExpenseType = 'FUEL' | 'MAINTENANCE' | 'PHONE' | 'OTHER';

export interface Expense {
  id: string;
  workerId: string;
  type: ExpenseType;
  amount: number;
  timestamp: string;
  source: string;
}

export type EvidenceType =
  | 'SCREENSHOT'
  | 'DOCUMENT'
  | 'TRIP_EVENT'
  | 'PAYOUT'
  | 'WORKER_STATEMENT'
  | 'POLICY'
  | 'CALCULATION';

export interface Evidence {
  id: string;
  type: EvidenceType;
  source: string;
  timestamp?: string;
  uri?: string;
  description: string;
  confidence?: number;
}

export type FindingType =
  | 'PAYOUT_DISCREPANCY'
  | 'INCENTIVE_DISCREPANCY'
  | 'TRIP_DISCREPANCY'
  | 'DECISION_REVIEW'
  | 'SAFETY_RISK';

export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Finding {
  id: string;
  type: FindingType;
  severity: FindingSeverity;
  title: string;
  explanation: string;
  confidence: number;
  evidenceIds: string[];
}

export type CaseType = 'PAYOUT' | 'TRIP' | 'DEACTIVATION' | 'INCIDENT';

export type CaseStatus = 'DRAFT' | 'ANALYZING' | 'REVIEW' | 'READY' | 'RESOLVED';

export interface Case {
  id: string;
  workerId: string;
  type: CaseType;
  status: CaseStatus;
  findingIds: string[];
  createdAt: string;
}

/**
 * Structured AI Output Contracts (Section 16)
 * AI outputs must conform to structured schemas rather than unstructured prose.
 */
export interface AIInvestigationResult {
  summary: string;
  findings: Finding[];
  missingEvidence: string[];
  contradictions: string[];
  recommendedActions: string[];
  confidence: number;
}

/**
 * Worker Twin Query & Response Contracts (Section 21)
 */
export interface WorkerTwinQuery {
  workerId: string;
  query: string;
  timeframe?: string;
}

export type WorkerTwinVerificationBadge =
  | 'VERIFIED_DATA'
  | 'SIMULATION_PROJECTION'
  | 'POLICY_GUIDANCE'
  | 'INSUFFICIENT_EVIDENCE';

export interface WorkerTwinResponse {
  answer: string;
  projectedEarnings?: number;
  optimalHours?: string[];
  observedFactors: string[];
  confidence: number;
  verificationBadge?: WorkerTwinVerificationBadge;
  supportingTrips?: string[];
  evidenceIds?: string[];
  calculationDetails?: string;
  isEvidenceBacked?: boolean;
}

/**
 * Counterfactual Simulator Contracts (Section 22)
 */
export interface CounterfactualScenario {
  id: string;
  workerId: string;
  tripId?: string;
  parameter: 'WAITING_TIME' | 'HOURS_WORKED' | 'FUEL_COST' | 'INCENTIVE_APPLIED';
  baselineValue: number;
  simulatedValue: number;
  impactOnEarnings: number;
  explanation: string;
}

/**
 * Standard API Response Envelope
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface FinancialSummary {
  platformGrossPayout: number;
  penalties: number;
  incentives: number;
  deductions: number;
  platformNetPayout: number;
  fuelExpenses: number;
  phoneExpenses: number;
  otherExpenses: number;
  totalExpenses: number;
  estimatedRealEarnings: number;
  activeHours: number;
  effectiveHourlyRate: number;
  disputedAmount: number;
  unresolvedAmount: number;
  deliveryCount: number;

  // Compatibility aliases
  grossEarnings?: number;
  netEarnings?: number;
  discrepancyTotal?: number;
}
