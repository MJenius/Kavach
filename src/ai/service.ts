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
import { SupervisorAgent } from '../agents/supervisor-agent.ts';

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

  async investigateCase(caseId: string, contextData?: Record<string, unknown>): Promise<AIInvestigationResult> {
    const workerId = (contextData?.workerId as string) || 'worker-vikram-01';
    const supervisor = new SupervisorAgent();
    const output = await supervisor.run({
      caseId,
      workerId,
      tripId: caseId,
      action: 'INVESTIGATE_CASE',
      payload: contextData,
    });

    if (!output.investigationResult) {
      throw new Error(`SupervisorAgent failed to produce an investigation result for case ${caseId}`);
    }

    return output.investigationResult;
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

  async investigateCase(caseId: string, contextData?: Record<string, unknown>): Promise<AIInvestigationResult> {
    // In production/Bedrock mode, investigations execute through SupervisorAgent,
    // coordinating Forensics, Earnings, and Policy agents over real tools.
    const workerId = (contextData?.workerId as string) || 'worker-vikram-01';
    const supervisor = new SupervisorAgent();
    const output = await supervisor.run({
      caseId,
      workerId,
      tripId: caseId,
      action: 'INVESTIGATE_CASE',
      payload: contextData,
    });

    if (!output.investigationResult) {
      throw new Error(`SupervisorAgent failed to produce an investigation result for case ${caseId}`);
    }

    return output.investigationResult;
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
