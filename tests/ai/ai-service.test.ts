import { describe, it, expect, vi } from 'vitest';
import { MockAIService, BedrockAIService, getAIService } from '../../src/ai/service.ts';
import { BedrockAIService as BedrockRuntime } from '../../src/ai/bedrock.ts';

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

    // Test Claude provider credentials check
    const bedrockClaude = new BedrockAIService({ provider: 'bedrock-claude', modelId: 'anthropic.claude-3v2' });
    await expect(bedrockClaude.generateText('Test')).rejects.toThrow('requires AWS credentials');

    // Test Mantle provider failure on invalid/missing auth
    const bedrockMantle = new BedrockAIService({ provider: 'mantle', modelId: 'openai.gpt-oss-120b', apiKey: 'invalid-key' });
    await expect(bedrockMantle.generateText('Test')).rejects.toThrow('Bedrock Mantle invocation failed');
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

  it('BedrockAIService correctly sends InvokeModelCommand with Anthropic messages format', async () => {
    const mockSend = vi.fn().mockResolvedValue({
      body: new TextEncoder().encode(
        JSON.stringify({
          content: [{ type: 'text', text: 'Simulated Bedrock Response' }],
          usage: { input_tokens: 12, output_tokens: 24 },
        })
      ),
    });

    const mockClient = { send: mockSend } as any;
    const service = new BedrockRuntime({
      modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      region: 'ap-south-1',
      client: mockClient,
    });

    const res = await service.generateText({
      prompt: 'Hello Bedrock',
      systemPrompt: 'You are Kavach AI',
      maxTokens: 1000,
    });

    expect(res.text).toBe('Simulated Bedrock Response');
    expect(res.usage?.totalTokens).toBe(36);
    expect(mockSend).toHaveBeenCalledOnce();

    const command = mockSend.mock.calls[0][0];
    expect(command.input.modelId).toBe('anthropic.claude-3-5-sonnet-20241022-v2:0');
    expect(command.input.contentType).toBe('application/json');

    const parsedBody = JSON.parse(command.input.body);
    expect(parsedBody.anthropic_version).toBe('bedrock-2023-05-31');
    expect(parsedBody.system).toBe('You are Kavach AI');
    expect(parsedBody.messages).toEqual([{ role: 'user', content: 'Hello Bedrock' }]);
  });

  it('BedrockAIService.generateStructured parses valid JSON and retries on failure', async () => {
    let callCount = 0;
    const mockSend = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // Return malformed JSON first
        return Promise.resolve({
          body: new TextEncoder().encode(
            JSON.stringify({
              content: [{ type: 'text', text: 'This is not json' }],
            })
          ),
        });
      }
      // Retry returns valid JSON
      return Promise.resolve({
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ type: 'text', text: '{"status": "ok"}' }],
          })
        ),
      });
    });

    const mockClient = { send: mockSend } as any;
    const service = new BedrockRuntime({ client: mockClient });

    const result = await service.generateStructured<{ status: string }>({
      prompt: 'Get status',
      targetSchemaName: 'Status',
      validate: (data: any) => ({ success: true, data }),
    });

    expect(result.success).toBe(true);
    expect(result.data?.status).toBe('ok');
    expect(mockSend).toHaveBeenCalledTimes(2);
  });
});
