import { describe, it, expect } from 'vitest';
import { MockAIService, BedrockAIService, getAIService } from '../../src/ai/service.ts';

describe('AIService Abstraction & Bedrock Adapter', () => {
  it('mock mode runs without AWS credentials' , async () => {
    const ai = getAIService({ mockMode: true });
    const response = await ai.generateText('Hello Kavach');
    expect(response).toContain('Mock AI');
  });

  it('investigateCase returns fixture-grounded result', async () => {
    const service = new MockAIService();
    const result = await service.investigateCase('trip-2026-09-15-001');

    expect(result).toBeDefined();
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.findings[0].evidenceIds).toContain('ev-store-arrival-gps');
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('extractDocument returns validated document data', async () => {
    const service = new MockAIService();
    const res = await service.extractDocument({ documentUri: 's3://bucket/penalty.png' });
    expect(res.extractedType).toBe('PENALTY_NOTICE');
    expect(res.amount).toBe(350);
  });

  it('BedrockAIService fails safely when credentials are missing', async () => {
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI;

    const bedrock = new BedrockAIService({ modelId: 'anthropic.claude-3v2' });
    await expect(bedrock.generateText('Test')).rejects.toThrow('requires AWS credentials');
  });

  it('BedrockAIService.investigateCase delegates directly to SupervisorAgent', async () => {
    const bedrock = new BedrockAIService({ modelId: 'anthropic.claude-3v2' });
    const result = await bedrock.investigateCase('trip-2026-09-15-001', {
      workerId: 'worker-vikram-01',
    });

    expect(result).toBeDefined();
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.summary).toContain('Multi-agent investigation for trip');
    expect(result.findings[0].evidenceIds).toContain('ev-store-arrival-gps');
  });
});
