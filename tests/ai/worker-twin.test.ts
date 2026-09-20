import { describe, it, expect } from 'vitest';
import { WorkerTwinAgent } from '../../src/agents/worker-twin-agent.ts';

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
});
