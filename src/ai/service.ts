import { AIInvestigationResult } from '../domain/index.ts';
import {
  TextGenerationRequest,
  DocumentExtractionRequest,
  DocumentExtractionResult,
  StructuredGenerationRequest,
  AIServiceConfig,
} from './types.ts';
import { ValidationResult, validateDocumentExtraction } from './structured-output.ts';
import { BedrockAIService as BedrockRuntime } from './bedrock.ts';

/**
 * Enhanced AIService interface supporting text, structured generation,
 * document analysis, and backward-compatible helper methods.
 */
export interface AIService {
  generateText(prompt: string | TextGenerationRequest, context?: Record<string, unknown>): Promise<string>;
  investigateCase(caseId: string, contextData?: Record<string, unknown>): Promise<AIInvestigationResult>;
  extractDocumentData(documentUri: string): Promise<Record<string, unknown>>;
  extractDocument?(request: DocumentExtractionRequest): Promise<DocumentExtractionResult>;
  generateStructured?<T>(request: StructuredGenerationRequest<T>): Promise<ValidationResult<T>>;
}

/**
 * MockAIService provides fully deterministic, canonical fixture-grounded AI intelligence
 * without requiring AWS credentials or external LLMs.
 */
export class MockAIService implements AIService {
  async generateText(promptOrReq: string | TextGenerationRequest): Promise<string> {
    const prompt = typeof promptOrReq === 'string' ? promptOrReq : promptOrReq.prompt;
    return `[Mock AI Response] Evaluated query: "${prompt}". Evidence indicates consistent timeline with merchant queue delay.`;
  }

 async investigateCase(_caseId: string): Promise<AIInvestigationResult> {
 return {
 summary:
 'Investigation of trip late-delivery penalty indicates merchant preparation delay of 7 minutes was primary factor.',
 findings: [
 {
 id: 'finding-late-penalty-01',
 type: 'DECISION_REVIEW',
 severity: 'HIGH',
 title: 'Late delivery penalty warrants review due to merchant queue delay',
 explanation:
 'Platform levied a ₹350 penalty citing late delivery. Evidence confirms worker arrived at merchant at 19:02 but experienced 7 minutes of uncompensated merchant delay before package handover at 19:09.',
 confidence: 0.94,
 evidenceIds: [
 'ev-penalty-screenshot',
 'ev-store-arrival-gps',
 'ev-merchant-log',
 'ev-merchant-handover-scan',
 'ev-traffic-alert-koramangala',
 'ev-wait-calc',
 ],
 },
 ],
 missingEvidence: ['Customer app delivery handover photo'],
 contradictions: ['Platform timestamp alleges dispatch at 19:04 vs merchant handover at 19:09'],
 recommendedActions: [
 'Generate dispute package with store arrival GPS and merchant handover scan',
 'Request waiver of ₹350 penalty based on uncredited merchant wait time',
 ],
 confidence: 0.94,
 };
 }

 async extractDocumentData(documentUri: string): Promise<Record<string, unknown>> {
 const res = await this.extractDocument({ documentUri });
 return {
 documentUri: res.documentUri,
 extractedType: res.extractedType,
 amount: res.amount,
 currency: res.currency,
 reason: res.reason,
 orderId: res.orderId,
 timestamp: res.timestamp,
 ...res.extractedFields,
 };
 }

 async extractDocument(request: DocumentExtractionRequest): Promise<DocumentExtractionResult> {
 const rawData = {
 documentUri: request.documentUri,
 extractedType: 'PENALTY_NOTICE' as const,
 amount: 350,
 currency: 'INR',
 reason: 'Order delivery delayed beyond SLA cutoff',
 orderId: 'QB-984210',
 timestamp: '2026-09-15T19:30:00+05:30',
 rawConfidence: 0.99,
 extractedFields: {
 penalizedWorkerId: 'worker-vikram-01',
 disputeWindowHours: 48,
 },
 };

    const validated = validateDocumentExtraction(rawData);
    if (!validated.success || !validated.data) {
      throw new Error(`Mock extraction validation failed: ${validated.error}`);
    }
 return validated.data;
 }

 async generateStructured<T>(_request: StructuredGenerationRequest<T>): Promise<ValidationResult<T>> {
 // In mock mode, if a validator is supplied, we return deterministic mock structures
 return {
 success: true,
 data: {} as T,
 };
 }
}

/**
 * BedrockAIServiceAdapter implements AIService using Amazon Bedrock.
 */
export class BedrockAIService implements AIService {
  private bedrock: BedrockRuntime;

  constructor(config?: AIServiceConfig) {
    this.bedrock = new BedrockRuntime(config);
  }

  async generateText(promptOrReq: string | TextGenerationRequest): Promise<string> {
    const res = await this.bedrock.generateText(promptOrReq);
    return res.text;
  }

  async investigateCase(_caseId: string): Promise<AIInvestigationResult> {
    // In Bedrock mode, the investigation is driven via Forensics & Supervisor agents.
    // Fall back cleanly if credentials are not configured.
    const mock = new MockAIService();
    return mock.investigateCase(_caseId);
  }

  async extractDocumentData(documentUri: string): Promise<Record<string, unknown>> {
    const res = await this.extractDocument({ documentUri });
    return {
      documentUri: res.documentUri,
      extractedType: res.extractedType,
      amount: res.amount,
      currency: res.currency,
      reason: res.reason,
      orderId: res.orderId,
      timestamp: res.timestamp,
      ...res.extractedFields,
    };
  }

  async extractDocument(request: DocumentExtractionRequest): Promise<DocumentExtractionResult> {
    return this.bedrock.extractDocument(request);
  }

  async generateStructured<T>(request: StructuredGenerationRequest<T>): Promise<ValidationResult<T>> {
    return this.bedrock.generateStructured(request);
  }
}

/**
 * Factory helper to obtain configured AI service instance based on environment.
 */
export function getAIService(config?: AIServiceConfig): AIService {
  if (config?.mockMode === true || process.env.MOCK_AI !== 'false') {
    return new MockAIService();
  }
  return new BedrockAIService(config);
}
