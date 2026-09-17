import { AIInvestigationResult } from '../domain/index.ts';

/**
 * Interface for AI service interactions (Amazon Bedrock / Mock).
 * Enables running without credentials in local mock mode.
 */
export interface AIService {
  generateText(prompt: string, context?: Record<string, unknown>): Promise<string>;
  investigateCase(caseId: string, contextData: Record<string, unknown>): Promise<AIInvestigationResult>;
  extractDocumentData(documentUri: string): Promise<Record<string, unknown>>;
}

/**
 * MockAIService provides realistic mock responses without invoking external LLMs.
 */
export class MockAIService implements AIService {
  async generateText(prompt: string): Promise<string> {
    return `[Mock AI Response] Evaluated query: "${prompt}". Evidence indicates consistent timeline.`;
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
    return {
      documentUri,
      extractedType: 'PENALTY_NOTICE',
      amount: 350,
      currency: 'INR',
      reason: 'Order delivery delayed beyond SLA cutoff',
      orderId: 'QB-984210',
      timestamp: '2026-09-15T19:30:00Z',
    };
  }
}

/**
 * BedrockAIService placeholder for Person 1 (branch: feature/ai-intelligence).
 * Kept behind this adapter so switching between mock and real Bedrock is seamless.
 */
export class BedrockAIService implements AIService {
  private modelId: string;

  constructor(modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0') {
    this.modelId = modelId;
  }

  async generateText(_prompt: string): Promise<string> {
    // Person 1 will implement via @aws-sdk/client-bedrock-runtime
    throw new Error(`BedrockAIService not yet implemented for ${this.modelId}. Use MockAIService during local development.`);
  }

  async investigateCase(_caseId: string): Promise<AIInvestigationResult> {
    throw new Error('BedrockAIService not yet implemented. Use MockAIService during local development.');
  }

  async extractDocumentData(_documentUri: string): Promise<Record<string, unknown>> {
    throw new Error('BedrockAIService not yet implemented. Use MockAIService during local development.');
  }
}

/**
 * Factory helper to obtain configured AI service instance based on environment.
 */
export function getAIService(): AIService {
  if (process.env.MOCK_AI === 'false') {
    return new BedrockAIService();
  }
  return new MockAIService();
}
