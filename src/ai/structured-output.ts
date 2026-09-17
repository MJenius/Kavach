import {
  AIInvestigationResult,
  Finding,
  WorkerTwinResponse,
} from '../domain/index.ts';
import {
  DocumentExtractionResult,
  EarningsAnalysisResult,
  ForensicsAnalysisResult,
  PolicyAnalysisResult,
} from './types.ts';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function isString(val: unknown): val is string {
  return typeof val === 'string';
}

function isNumber(val: unknown): val is number {
  return typeof val === 'number' && !Number.isNaN(val);
}

function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val);
}

export function validateDocumentExtraction(data: unknown): ValidationResult<DocumentExtractionResult> {
  if (!isObject(data)) {
    return { success: false, error: 'Document extraction output must be an object' };
  }
  if (!isString(data.documentUri)) {
    return { success: false, error: 'Missing or invalid documentUri' };
  }
  const allowedTypes = ['PENALTY_NOTICE', 'EARNINGS_PAYSLIP', 'FUEL_RECEIPT', 'TRIP_RECEIPT', 'UNKNOWN'];
  if (!isString(data.extractedType) || !allowedTypes.includes(data.extractedType)) {
    return { success: false, error: 'Invalid or missing extractedType' };
  }
  const rawConfidence = isNumber(data.rawConfidence) ? Math.max(0, Math.min(1, data.rawConfidence)) : 0.5;

  return {
    success: true,
    data: {
      documentUri: data.documentUri,
      extractedType: data.extractedType as DocumentExtractionResult['extractedType'],
      amount: isNumber(data.amount) ? data.amount : undefined,
      currency: isString(data.currency) ? data.currency : undefined,
      reason: isString(data.reason) ? data.reason : undefined,
      orderId: isString(data.orderId) ? data.orderId : undefined,
      timestamp: isString(data.timestamp) ? data.timestamp : undefined,
      rawConfidence,
      extractedFields: isObject(data.extractedFields) ? data.extractedFields : {},
    },
  };
}

export function validateFinding(data: unknown): ValidationResult<Finding> {
  if (!isObject(data)) {
    return { success: false, error: 'Finding must be an object' };
  }
  if (!isString(data.id) || !data.id.trim()) {
    return { success: false, error: 'Finding must have a non-empty id' };
  }
  const allowedFindingTypes = [
    'PAYOUT_DISCREPANCY',
    'INCENTIVE_DISCREPANCY',
    'TRIP_DISCREPANCY',
    'DECISION_REVIEW',
    'SAFETY_RISK',
  ];
  if (!isString(data.type) || !allowedFindingTypes.includes(data.type)) {
    return { success: false, error: 'Invalid finding type: ' + String(data.type) };
  }
  const allowedSeverities = ['LOW', 'MEDIUM', 'HIGH'];
  if (!isString(data.severity) || !allowedSeverities.includes(data.severity)) {
    return { success: false, error: 'Invalid severity: ' + String(data.severity) };
  }
  if (!isString(data.title) || !data.title.trim()) {
    return { success: false, error: 'Finding title must be a non-empty string' };
  }
  if (!isString(data.explanation) || !data.explanation.trim()) {
    return { success: false, error: 'Finding explanation must be a non-empty string' };
  }
  if (!isNumber(data.confidence) || data.confidence < 0 || data.confidence > 1) {
    return { success: false, error: 'Finding confidence must be a number between 0 and 1' };
  }
  if (!isArray(data.evidenceIds) || !data.evidenceIds.every(isString)) {
    return { success: false, error: 'Finding evidenceIds must be an array of string IDs' };
  }

  return {
    success: true,
    data: {
      id: data.id,
      type: data.type as Finding['type'],
      severity: data.severity as Finding['severity'],
      title: data.title,
      explanation: data.explanation,
      confidence: data.confidence,
      evidenceIds: data.evidenceIds,
    },
  };
}

export function validateForensicsAnalysis(data: unknown): ValidationResult<ForensicsAnalysisResult> {
  if (!isObject(data)) {
    return { success: false, error: 'ForensicsAnalysisResult must be an object' };
  }
  if (!isString(data.tripId)) {
    return { success: false, error: 'Forensics result missing tripId' };
  }
  if (!isString(data.timelineSummary)) {
    return { success: false, error: 'Forensics result missing timelineSummary' };
  }
  if (!isObject(data.platformClaim) || !isString(data.platformClaim.allegation)) {
    return { success: false, error: 'Forensics result missing valid platformClaim' };
  }
  if (!isObject(data.reconstruction)) {
    return { success: false, error: 'Forensics result missing reconstruction object' };
  }
  if (!isArray(data.findings)) {
    return { success: false, error: 'Forensics result missing findings array' };
  }

  const findings: Finding[] = [];
  for (const f of data.findings) {
    const val = validateFinding(f);
    if (!val.success || !val.data) {
      return { success: false, error: 'Invalid finding in forensics result: ' + (val.error || '') };
    }
    findings.push(val.data);
  }

  if (!isArray(data.evidenceIds) || !data.evidenceIds.every(isString)) {
    return { success: false, error: 'Forensics result evidenceIds must be an array of strings' };
  }

  const confidence = isNumber(data.confidence) ? Math.max(0, Math.min(1, data.confidence)) : 0.5;

  return {
    success: true,
    data: {
      tripId: data.tripId,
      timelineSummary: data.timelineSummary,
      platformClaim: {
        allegation: String(data.platformClaim.allegation),
        penaltyAmount: isNumber(data.platformClaim.penaltyAmount) ? data.platformClaim.penaltyAmount : 0,
        currency: isString(data.platformClaim.currency) ? data.platformClaim.currency : 'INR',
      },
      reconstruction: {
        storeArrivalTimestamp: String(data.reconstruction.storeArrivalTimestamp || ''),
        packageHandoverTimestamp: String(data.reconstruction.packageHandoverTimestamp || ''),
        deliveryCompletedTimestamp: String(data.reconstruction.deliveryCompletedTimestamp || ''),
        waitingDurationSeconds: isNumber(data.reconstruction.waitingDurationSeconds) ? data.reconstruction.waitingDurationSeconds : 0,
        transitDurationSeconds: isNumber(data.reconstruction.transitDurationSeconds) ? data.reconstruction.transitDurationSeconds : 0,
        totalDurationSeconds: isNumber(data.reconstruction.totalDurationSeconds) ? data.reconstruction.totalDurationSeconds : 0,
        allocatedSlaSeconds: isNumber(data.reconstruction.allocatedSlaSeconds) ? data.reconstruction.allocatedSlaSeconds : 0,
        remainingSlaSecondsAfterWait: isNumber(data.reconstruction.remainingSlaSecondsAfterWait) ? data.reconstruction.remainingSlaSecondsAfterWait : 0,
        slaFeasible: Boolean(data.reconstruction.slaFeasible),
      },
      contradictions: isArray(data.contradictions) ? data.contradictions.filter(isString) : [],
      missingEvidence: isArray(data.missingEvidence) ? data.missingEvidence.filter(isString) : [],
      evidenceIds: data.evidenceIds,
      calculatedFacts: isArray(data.calculatedFacts)
        ? data.calculatedFacts.filter(isObject).map((cf) => ({
            description: String(cf.description || ''),
            calculationSource: String(cf.calculationSource || 'DETERMINISTIC_ENGINE'),
            value: cf.value,
          }))
        : [],
      interpretation: isString(data.interpretation) ? data.interpretation : '',
      findings,
      recommendedActions: isArray(data.recommendedActions) ? data.recommendedActions.filter(isString) : [],
      confidence,
    },
  };
}

export function validateEarningsAnalysis(data: unknown): ValidationResult<EarningsAnalysisResult> {
  if (!isObject(data)) {
    return { success: false, error: 'EarningsAnalysisResult must be an object' };
  }
  if (!isString(data.workerId)) {
    return { success: false, error: 'Missing workerId in earnings analysis' };
  }
  if (!isObject(data.summary)) {
    return { success: false, error: 'Missing summary object in earnings analysis' };
  }
  if (!isArray(data.findings)) {
    return { success: false, error: 'Missing findings array in earnings analysis' };
  }

  const findings: Finding[] = [];
  for (const f of data.findings) {
    const val = validateFinding(f);
    if (!val.success || !val.data) {
      return { success: false, error: 'Invalid finding in earnings analysis: ' + (val.error || '') };
    }
    findings.push(val.data);
  }

  const confidence = isNumber(data.confidence) ? Math.max(0, Math.min(1, data.confidence)) : 0.5;

  return {
    success: true,
    data: {
      workerId: data.workerId,
      summary: {
        grossEarnings: isNumber(data.summary.grossEarnings) ? data.summary.grossEarnings : 0,
        totalExpenses: isNumber(data.summary.totalExpenses) ? data.summary.totalExpenses : 0,
        netEarnings: isNumber(data.summary.netEarnings) ? data.summary.netEarnings : 0,
        totalDeductions: isNumber(data.summary.totalDeductions) ? data.summary.totalDeductions : 0,
        effectiveHourlyRate: isNumber(data.summary.effectiveHourlyRate) ? data.summary.effectiveHourlyRate : 0,
      },
      discrepancies: isArray(data.discrepancies)
        ? data.discrepancies.filter(isObject).map((d) => ({
            type: String(d.type || 'DISCREPANCY'),
            expected: isNumber(d.expected) ? d.expected : 0,
            actual: isNumber(d.actual) ? d.actual : 0,
            difference: isNumber(d.difference) ? d.difference : 0,
            explanation: String(d.explanation || ''),
            evidenceIds: isArray(d.evidenceIds) ? d.evidenceIds.filter(isString) : [],
          }))
        : [],
      calculatedFacts: isArray(data.calculatedFacts)
        ? data.calculatedFacts.filter(isObject).map((cf) => ({
            name: String(cf.name || ''),
            value: isNumber(cf.value) ? cf.value : 0,
            unit: String(cf.unit || ''),
          }))
        : [],
      interpretation: isString(data.interpretation) ? data.interpretation : '',
      findings,
      recommendations: isArray(data.recommendations) ? data.recommendations.filter(isString) : [],
      confidence,
    },
  };
}

export function validatePolicyAnalysis(data: unknown): ValidationResult<PolicyAnalysisResult> {
  if (!isObject(data)) {
    return { success: false, error: 'PolicyAnalysisResult must be an object' };
  }
  if (!isString(data.platform) || !isString(data.issueType)) {
    return { success: false, error: 'PolicyAnalysis missing platform or issueType' };
  }
  if (!isString(data.interpretation)) {
    return { success: false, error: 'PolicyAnalysis missing interpretation' };
  }

  const confidence = isNumber(data.confidence) ? Math.max(0, Math.min(1, data.confidence)) : 0.5;

  let relevantRule: PolicyAnalysisResult['relevantRule'];
  if (isObject(data.relevantRule)) {
    relevantRule = {
      policyName: String(data.relevantRule.policyName || ''),
      clauseReference: String(data.relevantRule.clauseReference || ''),
      summaryText: String(data.relevantRule.summaryText || ''),
      sourceUri: isString(data.relevantRule.sourceUri) ? data.relevantRule.sourceUri : undefined,
    };
  }

  return {
    success: true,
    data: {
      platform: data.platform,
      issueType: data.issueType,
      relevantRule,
      isApplicable: Boolean(data.isApplicable),
      sourceUnavailable: Boolean(data.sourceUnavailable),
      interpretation: data.interpretation,
      uncertaintyNotes: isString(data.uncertaintyNotes) ? data.uncertaintyNotes : undefined,
      isLegalAdvice: false,
      confidence,
    },
  };
}

export function validateAIInvestigationResult(data: unknown): ValidationResult<AIInvestigationResult> {
  if (!isObject(data)) {
    return { success: false, error: 'AIInvestigationResult must be an object' };
  }
  if (!isString(data.summary) || !data.summary.trim()) {
    return { success: false, error: 'AIInvestigationResult must have a non-empty summary' };
  }
  if (!isArray(data.findings)) {
    return { success: false, error: 'AIInvestigationResult missing findings array' };
  }

  const findings: Finding[] = [];
  for (const f of data.findings) {
    const val = validateFinding(f);
    if (!val.success || !val.data) {
      return { success: false, error: 'Invalid finding in investigation result: ' + (val.error || '') };
    }
    findings.push(val.data);
  }

  const confidence = isNumber(data.confidence) ? Math.max(0, Math.min(1, data.confidence)) : 0.5;

  return {
    success: true,
    data: {
      summary: data.summary,
      findings,
      missingEvidence: isArray(data.missingEvidence) ? data.missingEvidence.filter(isString) : [],
      contradictions: isArray(data.contradictions) ? data.contradictions.filter(isString) : [],
      recommendedActions: isArray(data.recommendedActions) ? data.recommendedActions.filter(isString) : [],
      confidence,
    },
  };
}

export function validateWorkerTwinResponse(data: unknown): ValidationResult<WorkerTwinResponse> {
  if (!isObject(data)) {
    return { success: false, error: 'WorkerTwinResponse must be an object' };
  }
  if (!isString(data.answer) || !data.answer.trim()) {
    return { success: false, error: 'WorkerTwinResponse answer must be a non-empty string' };
  }
  if (!isArray(data.observedFactors) || !data.observedFactors.every(isString)) {
    return { success: false, error: 'WorkerTwinResponse observedFactors must be an array of strings' };
  }
  const confidence = isNumber(data.confidence) ? Math.max(0, Math.min(1, data.confidence)) : 0.5;

  return {
    success: true,
    data: {
      answer: data.answer,
      projectedEarnings: isNumber(data.projectedEarnings) ? data.projectedEarnings : undefined,
      optimalHours: isArray(data.optimalHours) ? data.optimalHours.filter(isString) : undefined,
      observedFactors: data.observedFactors,
      confidence,
    },
  };
}

export function parseSafeJson<T>(
  raw: string,
  validator: (data: unknown) => ValidationResult<T>
): ValidationResult<T> {
  try {
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(cleaned);
    return validator(parsed);
  } catch (err) {
    return {
      success: false,
      error: 'Failed to parse JSON: ' + (err instanceof Error ? err.message : String(err)),
    };
  }
}

export function validateEvidenceIds(requestedIds: string[], availableIds: string[]): string[] { return requestedIds.filter(id => !availableIds.includes(id)); }

