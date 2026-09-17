import { Finding } from '../domain/index.ts';
import type { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';

export interface TextGenerationRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  context?: Record<string, unknown>;
}

export interface TextGenerationResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface DocumentExtractionRequest {
  documentUri: string;
  mimeType?: string;
  documentBase64?: string;
  targetSchemaDescription?: string;
}

export interface DocumentExtractionResult {
  documentUri: string;
  extractedType: 'PENALTY_NOTICE' | 'EARNINGS_PAYSLIP' | 'FUEL_RECEIPT' | 'TRIP_RECEIPT' | 'UNKNOWN';
  amount?: number;
  currency?: string;
  reason?: string;
  orderId?: string;
  timestamp?: string;
  rawConfidence: number;
  extractedFields: Record<string, unknown>;
}

export interface StructuredGenerationRequest<T = unknown> {
  prompt: string;
  systemPrompt?: string;
  targetSchemaName: string;
  validate?: (data: unknown) => { success: boolean; data?: T; error?: string };
}

export interface AIServiceConfig {
  region?: string;
  modelId?: string;
  maxTokens?: number;
  temperature?: number;
  mockMode?: boolean;
  client?: BedrockRuntimeClient;
}

export interface ForensicsAnalysisResult {
  tripId: string;
  timelineSummary: string;
  platformClaim: {
    allegation: string;
    penaltyAmount: number;
    currency: string;
  };
  reconstruction: {
    storeArrivalTimestamp: string;
    packageHandoverTimestamp: string;
    deliveryCompletedTimestamp: string;
    waitingDurationSeconds: number;
    transitDurationSeconds: number;
    totalDurationSeconds: number;
    allocatedSlaSeconds: number;
    remainingSlaSecondsAfterWait: number;
    slaFeasible: boolean;
  };
  contradictions: string[];
  missingEvidence: string[];
  evidenceIds: string[];
  calculatedFacts: Array<{
    description: string;
    calculationSource: string;
    value: unknown;
  }>;
  interpretation: string;
  findings: Finding[];
  recommendedActions: string[];
  confidence: number;
}

export interface EarningsAnalysisResult {
  workerId: string;
  summary: {
    grossEarnings: number;
    totalExpenses: number;
    netEarnings: number;
    totalDeductions: number;
    effectiveHourlyRate: number;
  };
  discrepancies: Array<{
    type: string;
    expected: number;
    actual: number;
    difference: number;
    explanation: string;
    evidenceIds: string[];
  }>;
  calculatedFacts: Array<{
    name: string;
    value: number;
    unit: string;
  }>;
  interpretation: string;
  findings: Finding[];
  recommendations: string[];
  confidence: number;
}

export interface PolicyAnalysisResult {
  platform: string;
  issueType: string;
  relevantRule?: {
    policyName: string;
    clauseReference: string;
    summaryText: string;
    sourceUri?: string;
  };
  isApplicable: boolean;
  sourceUnavailable: boolean;
  interpretation: string;
  uncertaintyNotes?: string;
  isLegalAdvice: false;
  confidence: number;
}
