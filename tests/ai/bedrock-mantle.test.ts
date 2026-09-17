import { describe, it, expect, vi } from 'vitest';
import { BedrockMantleAIService } from '../../src/ai/bedrock-mantle.ts';

describe('Bedrock Mantle OpenAI-compatible Adapter', () => {
  it('correctly formats and sends completions to OpenAI-compatible Bedrock Mantle endpoint', async () => {
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: 'Bedrock Mantle Live Response: Evidence verified.',
          },
        },
      ],
      usage: {
        prompt_tokens: 15,
        completion_tokens: 25,
        total_tokens: 40,
      },
    });

    const mockOpenAIClient = {
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    } as any;

    const mantleService = new BedrockMantleAIService({
      modelId: 'openai.gpt-oss-120b',
      baseURL: 'https://bedrock-mantle.ap-south-1.api.aws/v1',
      client: mockOpenAIClient,
    });

    const res = await mantleService.generateText({
      prompt: 'Verify late delivery penalty of ₹350',
      systemPrompt: 'You are Kavach AI Forensics Engine',
    });

    expect(res.text).toBe('Bedrock Mantle Live Response: Evidence verified.');
    expect(res.usage?.totalTokens).toBe(40);
    expect(mockCreate).toHaveBeenCalledOnce();

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.model).toBe('openai.gpt-oss-120b');
    expect(callArgs.messages).toEqual([
      { role: 'system', content: 'You are Kavach AI Forensics Engine' },
      { role: 'user', content: 'Verify late delivery penalty of ₹350' },
    ]);
  });

  it('generateStructured parses valid JSON from Bedrock Mantle and validates schema', async () => {
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              penaltyDisputed: true,
              amount: 350,
              rationale: 'Merchant wait time exceeds allowable buffer',
            }),
          },
        },
      ],
    });

    const mockOpenAIClient = {
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    } as any;

    const mantleService = new BedrockMantleAIService({
      client: mockOpenAIClient,
    });

    const result = await mantleService.generateStructured<{
      penaltyDisputed: boolean;
      amount: number;
    }>({
      prompt: 'Analyze ₹350 penalty',
      targetSchemaName: 'PenaltyReview',
      validate: (data: any) => ({
        success: typeof data.penaltyDisputed === 'boolean' && typeof data.amount === 'number',
        data,
      }),
    });

    expect(result.success).toBe(true);
    expect(result.data?.penaltyDisputed).toBe(true);
    expect(result.data?.amount).toBe(350);
  });
});
