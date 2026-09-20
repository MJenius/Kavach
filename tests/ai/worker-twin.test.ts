import { describe, it, expect } from 'vitest';
import { WorkerTwinAgent } from '../../src/agents/worker-twin-agent.ts';
import type { BedrockLLMProvider } from '../../src/ai/types.ts';
import type { ValidationResult } from '../../src/ai/structured-output.ts';

describe('WorkerTwinAgent', () => {
  it('answers shift optimization query using simulation and historical patterns', async () => {
    const agent = new WorkerTwinAgent();
    const result = await agent.run({
      workerId: 'worker-vikram-01',
      query: 'How can I improve my earnings tomorrow?',
    });

    expect(result.answer).toBeDefined();
    expect(result.optimalHours).toBeDefined();
    expect(result.observedFactors.some((f) => f.includes('Simulation projection'))).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.85);
  });

  it('answers bottleneck questions with observed historical facts', async () => {
    const agent = new WorkerTwinAgent();
    const result = await agent.run({
      workerId: 'worker-vikram-01',
      query: 'Where am I losing money?',
    });

    expect(result.answer).toContain('350');
    expect(result.observedFactors.some((f) => f.includes('merchant'))).toBe(true);
  });

  it('Question 1: Why was ₹350 deducted? -> Grounds in trip-2026-09-15-001, 7m delay, 3m SLA, and case-001 evidence', async () => {
    const agent = new WorkerTwinAgent();
    const result = await agent.run({
      workerId: 'worker-vikram-01',
      query: 'Why was ₹350 deducted from my QuickBite shift on Tuesday?',
    });

    expect(result.verificationBadge).toBe('VERIFIED_DATA');
    expect(result.isEvidenceBacked).toBe(true);
    expect(result.answer).toContain('₹350');
    expect(result.answer).toContain('trip-2026-09-15-001');
    expect(result.answer).toContain('7 minutes');
    expect(result.evidenceIds).toContain('ev-store-arrival-gps');
    expect(result.evidenceIds).toContain('ev-merchant-log');
    expect(result.supportingTrips).toContain('trip-2026-09-15-001');
    expect(result.calculationDetails).toContain('180s');
  });

  it('Question 2: What was my real take-home this week? -> Grounds in ₹7,500 real take home, ₹9,120 gross, and ₹1,270 expenses', async () => {
    const agent = new WorkerTwinAgent();
    const result = await agent.run({
      workerId: 'worker-vikram-01',
      query: 'What was my real take-home this week?',
    });

    expect(result.verificationBadge).toBe('VERIFIED_DATA');
    expect(result.isEvidenceBacked).toBe(true);
    expect(result.answer).toContain('7,500');
    expect(result.answer).toContain('9,120');
    expect(result.answer).toContain('1,270');
    expect(result.calculationDetails).toContain('₹157.73/hr');
  });

  it('Question 3: What happened to my ₹500 incentive? -> Grounds in Case case-002, ₹200 credited, ₹300 shortfall, and INSUFFICIENT_EVIDENCE badge', async () => {
    const agent = new WorkerTwinAgent();
    const result = await agent.run({
      workerId: 'worker-vikram-01',
      query: 'What happened to my ₹500 incentive?',
    });

    expect(result.verificationBadge).toBe('INSUFFICIENT_EVIDENCE');
    expect(result.isEvidenceBacked).toBe(false);
    expect(result.answer).toContain('500');
    expect(result.answer).toContain('200');
    expect(result.answer).toContain('300');
    expect(result.evidenceIds).toContain('ev-incentive-target-screenshot');
    expect(result.calculationDetails).toContain('Shortfall: ₹300');
  });

  it('Question 4: What was my hourly rate on Wednesday vs Saturday? -> Grounds in ₹145.81/hr vs ₹200.00/hr and itemized expenses', async () => {
    const agent = new WorkerTwinAgent();
    const result = await agent.run({
      workerId: 'worker-vikram-01',
      query: 'What was my hourly rate on Wednesday vs Saturday?',
    });

    expect(result.verificationBadge).toBe('VERIFIED_DATA');
    expect(result.isEvidenceBacked).toBe(true);
    expect(result.answer).toContain('145.81');
    expect(result.answer).toContain('200.00');
    expect(result.answer).toContain('bike repair');
    expect(result.calculationDetails).toContain('₹145.81/hr');
    expect(result.calculationDetails).toContain('₹200.00/hr');
  });

  it('Question 5: How much would earnings increase if merchant wait were compensated? -> Grounds in SIMULATION_PROJECTION, +₹335 wait, +₹350 penalty, and ₹8,185 total', async () => {
    const agent = new WorkerTwinAgent();
    const result = await agent.run({
      workerId: 'worker-vikram-01',
      query: 'How much would earnings increase if merchant wait were compensated?',
    });

    expect(result.verificationBadge).toBe('SIMULATION_PROJECTION');
    expect(result.isEvidenceBacked).toBe(false);
    expect(result.answer).toContain('335');
    expect(result.answer).toContain('350');
    expect(result.answer).toContain('8,185');
    expect(result.projectedEarnings).toBe(8185);
    expect(result.calculationDetails).toContain('8,185');
  });

  it('Preset Question 5: Can QuickBite legally penalize me if the restaurant delayed my order? -> Grounds in Demo Policy Evidence Clause 4.2 and disclaims legal counsel', async () => {
    const agent = new WorkerTwinAgent();
    const result = await agent.run({
      workerId: 'worker-vikram-01',
      query: 'Can QuickBite legally penalize me if the restaurant delayed my order?',
    });

    expect(result.verificationBadge).toBe('POLICY_GUIDANCE');
    expect(result.isEvidenceBacked).toBe(false);
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.answer).toContain('Demo Policy Evidence');
    expect(result.answer).toContain('Clause 4.2');
    expect(result.answer).toContain('not legal advice');
    expect(result.evidenceIds).toContain('ev-policy-clause-4-2');
    expect(result.evidenceIds).toContain('ev-store-arrival-gps');
  });

  it('Preset Question 6: How much would earnings increase if merchant wait were compensated? -> Grounds in SIMULATION_PROJECTION, +₹335 wait, +₹350 penalty, and ₹8,185 total', async () => {
    const agent = new WorkerTwinAgent();
    const result = await agent.run({
      workerId: 'worker-vikram-01',
      query: 'How much would my weekly earnings increase if merchant wait times were compensated?',
    });

    expect(result.verificationBadge).toBe('SIMULATION_PROJECTION');
    expect(result.isEvidenceBacked).toBe(false);
    expect(result.answer).toContain('335');
    expect(result.answer).toContain('350');
    expect(result.answer).toContain('8,185');
    expect(result.projectedEarnings).toBe(8185);
    expect(result.calculationDetails).toContain('8,185');
  });

  it('Unsupported Question 1: Stock price -> INSUFFICIENT_EVIDENCE without hallucination', async () => {
    const agent = new WorkerTwinAgent();
    const result = await agent.run({
      workerId: 'worker-vikram-01',
      query: 'What is the stock price of Tesla today?',
    });

    expect(result.verificationBadge).toBe('INSUFFICIENT_EVIDENCE');
    expect(result.confidence).toBe(0.0);
    expect(result.answer).toContain('Insufficient evidence');
    expect(result.observedFactors.some((f) => f.includes('never fabricates'))).toBe(true);
  });

  it('Unsupported Question 2: Weather forecast -> INSUFFICIENT_EVIDENCE without hallucination', async () => {
    const agent = new WorkerTwinAgent();
    const result = await agent.run({
      workerId: 'worker-vikram-01',
      query: 'Will it rain heavily in Whitefield tomorrow evening?',
    });

    expect(result.verificationBadge).toBe('INSUFFICIENT_EVIDENCE');
    expect(result.confidence).toBe(0.0);
    expect(result.answer).toContain('Insufficient evidence');
  });

  it('Unsupported Question 3: Non-existent platform -> INSUFFICIENT_EVIDENCE without hallucination', async () => {
    const agent = new WorkerTwinAgent();
    const result = await agent.run({
      workerId: 'worker-vikram-01',
      query: 'Why was my UberEats payout delayed last month?',
    });

    expect(result.verificationBadge).toBe('INSUFFICIENT_EVIDENCE');
    expect(result.confidence).toBe(0.0);
    expect(result.answer).toContain('Insufficient evidence');
  });

  describe('Bedrock structured-generation resilience and fallback', () => {
    const mockWorkerId = 'worker-vikram-01';

    it('accepts a valid Bedrock response with non-empty answer and valid grounding', async () => {
      const mockBedrock: BedrockLLMProvider = {
        modelId: 'openai.gpt-oss-120b',
        generateText: async () => ({ text: '' }),
        extractDocument: async () => ({} as any),
        generateStructured: async <T>(): Promise<ValidationResult<T>> => ({
          success: true,
          data: {
            answer: 'Bedrock grounded answer: The ₹350 deduction on trip trip-2026-09-15-001 was due to merchant delay of 7 minutes at store arrival 19:02 leaving 3 minutes in SLA.',
            confidence: 0.92,
            observedFactors: ['Verified factor 1'],
            evidenceIds: ['ev-store-arrival-gps', 'ev-merchant-log'],
            verificationBadge: 'VERIFIED_DATA' as const,
          } as unknown as T,
        }),
      };

      const agent = new WorkerTwinAgent(mockBedrock);
      const result = await agent.run({
        workerId: mockWorkerId,
        query: 'Why was ₹350 deducted from my QuickBite shift on Tuesday?',
      });

      expect(result.answer).toContain('Bedrock grounded answer:');
      expect(result.confidence).toBe(0.92);
      expect(result.observedFactors).toContain('Verified factor 1');
      expect(result.evidenceIds).toContain('ev-store-arrival-gps');
    });

    it('rejects hallucinated Bedrock response claiming disciplinary penalty and fake EID-2024-09-20-001', async () => {
      const mockBedrock: BedrockLLMProvider = {
        modelId: 'openai.gpt-oss-120b',
        generateText: async () => ({ text: '' }),
        extractDocument: async () => ({} as any),
        generateStructured: async <T>(): Promise<ValidationResult<T>> => ({
          success: true,
          data: {
            answer: 'The ₹350 deduction was a disciplinary penalty for cancellation of orders and acceptance rate violations.',
            confidence: 0.96,
            evidenceIds: ['EID-2024-09-20-001'],
            verificationBadge: 'VERIFIED_DATA' as const,
            isEvidenceBacked: true,
          } as unknown as T,
        }),
      };

      const agent = new WorkerTwinAgent(mockBedrock);
      const result = await agent.run({
        workerId: mockWorkerId,
        query: 'Why was ₹350 deducted from my QuickBite shift on Tuesday?',
      });

      // Verifies the hallucinated response is completely discarded and canonical deterministic response returned
      expect(result.answer).not.toContain('disciplinary');
      expect(result.answer).not.toContain('cancellation');
      expect(result.answer).not.toContain('acceptance rate');
      expect(result.evidenceIds).not.toContain('EID-2024-09-20-001');

      // Canonical grounding must be present
      expect(result.answer).toContain('QuickBite deducted ₹350');
      expect(result.answer).toContain('7 minutes');
      expect(result.answer).toContain('3 minutes remaining');
      expect(result.evidenceIds).toContain('ev-store-arrival-gps');
      expect(result.evidenceIds).toContain('ev-merchant-log');
      expect(result.verificationBadge).toBe('VERIFIED_DATA');
      expect(result.isEvidenceBacked).toBe(true);
    });

    it('falls back safely to deterministic grounded engine when Bedrock returns an empty answer', async () => {
      let callCount = 0;
      const mockBedrock: BedrockLLMProvider = {
        modelId: 'openai.gpt-oss-120b',
        generateText: async () => ({ text: '' }),
        extractDocument: async () => ({} as any),
        generateStructured: async <T>(): Promise<ValidationResult<T>> => {
          callCount++;
          return {
            success: true,
            data: {
              answer: '   ', // Empty/whitespace answer
              confidence: 0.5,
              observedFactors: [],
            } as unknown as T,
          };
        },
      };

      const agent = new WorkerTwinAgent(mockBedrock);
      const result = await agent.run({
        workerId: mockWorkerId,
        query: 'Why was ₹350 deducted from my QuickBite shift on Tuesday?',
      });

      // Verifies controlled repair retry was attempted
      expect(callCount).toBe(2);
      // Verifies deterministic grounded fallback was used without returning error
      expect(result.answer).toContain('QuickBite deducted ₹350');
      expect(result.answer).toContain('trip-2026-09-15-001');
      expect(result.verificationBadge).toBe('VERIFIED_DATA');
      expect(result.evidenceIds).toContain('ev-store-arrival-gps');
      expect(result.evidenceIds).toContain('ev-merchant-log');
    });

    it('falls back safely to deterministic grounded engine when Bedrock returns missing answer', async () => {
      const mockBedrock: BedrockLLMProvider = {
        modelId: 'openai.gpt-oss-120b',
        generateText: async () => ({ text: '' }),
        extractDocument: async () => ({} as any),
        generateStructured: async <T>(): Promise<ValidationResult<T>> => ({
          success: true,
          data: {
            confidence: 0.8,
            observedFactors: ['Some factor'],
          } as unknown as T,
        }),
      };

      const agent = new WorkerTwinAgent(mockBedrock);
      const result = await agent.run({
        workerId: mockWorkerId,
        query: 'Why was ₹350 deducted from my QuickBite shift on Tuesday?',
      });

      expect(result.answer).toContain('QuickBite deducted ₹350');
      expect(result.answer).toContain('7 minutes');
      expect(result.verificationBadge).toBe('VERIFIED_DATA');
    });

    it('falls back safely when Bedrock throws an exception or returns malformed structured response', async () => {
      const mockBedrock: BedrockLLMProvider = {
        modelId: 'openai.gpt-oss-120b',
        generateText: async () => ({ text: '' }),
        extractDocument: async () => ({} as any),
        generateStructured: async <T>(): Promise<ValidationResult<T>> => ({
          success: false,
          error: 'WorkerTwinResponse answer must be a non-empty string',
        }),
      };

      const agent = new WorkerTwinAgent(mockBedrock);
      const result = await agent.run({
        workerId: mockWorkerId,
        query: 'Why was ₹350 deducted from my QuickBite shift on Tuesday?',
      });

      expect(result.answer).toContain('₹350');
      expect(result.verificationBadge).toBe('VERIFIED_DATA');
      expect(result.isEvidenceBacked).toBe(true);
      expect(result.supportingTrips).toContain('trip-2026-09-15-001');
    });

    it('unsupported question remains an honest insufficient evidence refusal even during Bedrock failure', async () => {
      const mockBedrock: BedrockLLMProvider = {
        modelId: 'openai.gpt-oss-120b',
        generateText: async () => ({ text: '' }),
        extractDocument: async () => ({} as any),
        generateStructured: async <T>(): Promise<ValidationResult<T>> => ({
          success: false,
          error: 'Bedrock connection timed out',
        }),
      };

      const agent = new WorkerTwinAgent(mockBedrock);
      const result = await agent.run({
        workerId: mockWorkerId,
        query: 'What will the weather in Mumbai be next week?',
      });

      expect(result.verificationBadge).toBe('INSUFFICIENT_EVIDENCE');
      expect(result.confidence).toBe(0.0);
      expect(result.answer).toContain('Insufficient evidence');
      expect(result.observedFactors.some((f) => f.includes('never fabricates'))).toBe(true);
    });
  });
});
