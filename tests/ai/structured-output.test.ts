import { describe, it, expect } from 'vitest';
import {
  validateDocumentExtraction,
  validateFinding,
  validateForensicsAnalysis,
  validateEarningsAnalysis,
  validatePolicyAnalysis,
  validateAIInvestigationResult,
  validateWorkerTwinResponse,
  parseSafeJson,
  validateEvidenceIds,
} from '../../src/ai/structured-output.ts';

describe('Structured AI Output Validation', () => {
  it('validates document extraction successfully', () => {
    const res = validateDocumentExtraction({
      documentUri: 's3://evidence/penalty.png',
      extractedType: 'PENALTY_NOTICE',
      amount: 350,
      currency: 'INR',
      rawConfidence: 0.98,
    });
    expect(res.success).toBe(true);
    expect(res.data?.amount).toBe(350);
  });

  it('rejects invalid document extraction', () => {
    const res = validateDocumentExtraction({ documentUri: 'path' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('Invalid or missing extractedType');
  });

  it('validates Finding with evidence IDs', () => {
    const res = validateFinding({
      id: 'finding-01',
      type: 'DECISION_REVIEW',
      severity: 'HIGH',
      title: 'Penalty warrants review',
      explanation: 'Merchant delay detected.',
      confidence: 0.95,
      evidenceIds: ['ev-store-arrival-gps'],
    });
    expect(res.success).toBe(true);
  });

  it('rejects Finding with out-of-bounds confidence', () => {
    const res = validateFinding({
      id: 'finding-01',
      type: 'DECISION_REVIEW',
      severity: 'HIGH',
      title: 'Title',
      explanation: 'Explanation',
      confidence: 1.5,
      evidenceIds: [],
    });
    expect(res.success).toBe(false);
  });

  it('parses JSON safely with markdown blocks', () => {
    const raw = '```json\n{"answer": "Optimized shift", "observedFactors": ["Peak times"], "confidence": 0.9}\n```';
    const res = parseSafeJson(raw, validateWorkerTwinResponse);
    expect(res.success).toBe(true);
    expect(res.data?.answer).toBe('Optimized shift');
  });

  it('validates ForensicsAnalysisResult structure', () => {
    const res = validateForensicsAnalysis({
      tripId: 'trip-01',
      timelineSummary: 'Reconstructed',
      platformClaim: { allegation: 'Late delivery', penaltyAmount: 350, currency: 'INR' },
      reconstruction: {
        storeArrivalTimestamp: '2026-09-15T19:02:00Z',
        packageHandoverTimestamp: '2026-09-15T19:09:00Z',
        deliveryCompletedTimestamp: '2026-09-15T19:24:00Z',
        waitingDurationSeconds: 420,
        transitDurationSeconds: 900,
        totalDurationSeconds: 1320,
        allocatedSlaSeconds: 600,
        remainingSlaSecondsAfterWait: 180,
        slaFeasible: false,
      },
      contradictions: [],
      missingEvidence: [],
      evidenceIds: ['ev-store-arrival-gps'],
      calculatedFacts: [],
      interpretation: 'Infeasible SLA',
      findings: [
        {
          id: 'f-1',
          type: 'DECISION_REVIEW',
          severity: 'HIGH',
          title: 'Review',
          explanation: 'Wait time delay',
          confidence: 0.94,
          evidenceIds: ['ev-store-arrival-gps'],
        },
      ],
      recommendedActions: [],
      confidence: 0.94,
    });
    expect(res.success).toBe(true);
  });

  it('validates EarningsAnalysisResult, PolicyAnalysisResult, and AIInvestigationResult', () => {
    const earnRes = validateEarningsAnalysis({
      workerId: 'worker-01',
      summary: { grossEarnings: 8460, totalExpenses: 345, netEarnings: 8115, totalDeductions: 350, effectiveHourlyRate: 95 },
      discrepancies: [],
      calculatedFacts: [],
      interpretation: 'Earnings verified',
      findings: [],
      recommendations: [],
      confidence: 0.9,
    });
    expect(earnRes.success).toBe(true);

    const polRes = validatePolicyAnalysis({
      platform: 'QuickBite',
      issueType: 'MERCHANT_DELAY',
      isApplicable: true,
      sourceUnavailable: false,
      interpretation: 'Applicable SLA rule',
      isLegalAdvice: false,
      confidence: 0.95,
    });
    expect(polRes.success).toBe(true);

    const invRes = validateAIInvestigationResult({
      summary: 'Investigation summary',
      findings: [],
      missingEvidence: [],
      contradictions: [],
      recommendedActions: [],
      confidence: 0.92,
    });
    expect(invRes.success).toBe(true);
  });

  it('returns safe error on malformed JSON', () => {
    const res = parseSafeJson('{ malformed', validateWorkerTwinResponse);
    expect(res.success).toBe(false);
    expect(res.error).toContain('Failed to parse JSON:');
  });

  it('validates evidence IDs against available evidence set', () => {
    const available = ['ev-store-arrival-gps', 'ev-merchant-log', 'ev-wait-calc'];
    const claimedWithFabricated = ['ev-store-arrival-gps', 'ev-fake-id-123', 'ev-wait-calc'];

    const invalid = validateEvidenceIds(claimedWithFabricated, available);
    expect(invalid).toEqual(['ev-fake-id-123']);

    const allValid = ['ev-store-arrival-gps', 'ev-wait-calc'];
    expect(validateEvidenceIds(allValid, available)).toEqual([]);
  });
});
