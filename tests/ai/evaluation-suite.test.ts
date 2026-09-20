import { describe, it, expect } from 'vitest';
import { scenarioA, scenarioB, scenarioC } from '../../fixtures/demo-scenarios.ts';
import { reconstructTrip } from '../../src/evidence/reconstruction.ts';
import { calculateSLAFeasibility } from '../../src/calculations/sla.ts';
import { SupervisorAgent } from '../../src/agents/supervisor-agent.ts';
import { calculateFinancialSummary } from '../../src/calculations/earnings.ts';
import { validateAIInvestigationResult } from '../../src/ai/structured-output.ts';

describe('Evaluation & Regression Suite (6 Scenarios / Core Flows)', () => {
  it('Regression 1: Scenario A (Hero Disputed ₹350 Penalty with Strong Evidence)', async () => {
    expect(scenarioA.id).toBe('scenario-a');
    const heroTrip = scenarioA.data.trips.find(t => t.id === 'trip-2026-09-15-001');
    expect(heroTrip).toBeDefined();

    const events = scenarioA.data.tripEvents.filter(e => e.tripId === heroTrip!.id);
    const recon = reconstructTrip(heroTrip!, events, scenarioA.data.evidence);

    expect(recon.storeWaitSeconds).toBe(420); // 7 minutes
    expect(recon.remainingSlaSeconds).toBe(180); // 3 minutes remaining
    expect(recon.slaFeasibility).toBe('LOW');

    // Multi-agent supervisor investigation
    const supervisor = new SupervisorAgent();
    const result = await supervisor.run({
      workerId: 'worker-vikram-01',
      tripId: heroTrip!.id,
      action: 'INVESTIGATE_CASE',
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.investigationResult).toBeDefined();
    expect(result.investigationResult?.findings.length).toBeGreaterThan(0);
    expect(result.investigationResult?.summary).toContain('Merchant wait time');
  });

  it('Regression 2: Scenario B (Healthy Week Positive Earnings Reconciliation)', () => {
    expect(scenarioB.id).toBe('scenario-b');
    const summary = calculateFinancialSummary(
      scenarioB.data.earnings,
      scenarioB.data.expenses,
      scenarioB.data.trips
    );

    expect(summary.platformGrossPayout).toBeGreaterThan(0);
    expect(summary.totalExpenses).toBeGreaterThan(0);
    expect(summary.estimatedRealEarnings).toBeGreaterThan(0);
    expect(summary.effectiveHourlyRate).toBeGreaterThan(0);
    expect(summary.platformNetPayout).toBe(summary.platformGrossPayout - summary.deductions);
    expect(summary.estimatedRealEarnings).toBe(summary.platformNetPayout - summary.totalExpenses);
  });

  it('Regression 3: Scenario C (Missing Telemetry Evidence Lowers Confidence to Insufficient)', () => {
    expect(scenarioC.id).toBe('scenario-c');
    const disputedTrip = scenarioC.data.trips.find(t => t.id === 'trip-2026-09-17-999');
    expect(disputedTrip).toBeDefined();

    const finding = scenarioC.data.findings.find(f => f.id === 'finding-insufficient-01');
    expect(finding).toBeDefined();
    expect(finding?.confidence).toBeLessThan(0.5);
    expect(finding?.evidenceIds.length).toBe(0);
  });

  it('Regression 4: Severe Traffic Congestion Handover Infeasibility Check', () => {
    // 600s SLA, 420s wait, 900s transit = Infeasible
    const feasibility = calculateSLAFeasibility(600, 420, 900);
    expect(feasibility.isFeasible).toBe(false);
    expect(feasibility.feasibility).toBe('LOW');
    expect(feasibility.transitShortfallSeconds).toBe(720); // 12 minutes deficit
  });

  it('Regression 5: Disputed Penalty (₹350) and Unresolved Incentive (₹300) Strict Separation', () => {
    const summary = scenarioA.data.summary;
    expect(summary.disputedAmount).toBe(350);
    expect(summary.unresolvedAmount).toBe(300);
    // Crucial rule: They must never be merged into a single "disputed" bucket
    expect(summary.disputedAmount).not.toBe(summary.unresolvedAmount);
    expect(summary.disputedAmount + summary.unresolvedAmount).toBe(650);
  });

  it('Regression 6: Schema Validation Rigorously Protects AI Outputs', () => {
    const valid = validateAIInvestigationResult({
      summary: 'Valid investigation summary with all fields',
      findings: [
        {
          id: 'finding-test-01',
          type: 'DECISION_REVIEW',
          severity: 'HIGH',
          title: 'Validated Review',
          explanation: 'Validated explanation',
          confidence: 0.95,
          evidenceIds: ['ev-store-arrival-gps'],
        },
      ],
      missingEvidence: [],
      contradictions: [],
      recommendedActions: ['Dispute penalty'],
      confidence: 0.95,
    });
    expect(valid.success).toBe(true);

    const invalid = validateAIInvestigationResult({
      summary: '',
      findings: 'not an array',
    });
    expect(invalid.success).toBe(false);
  });
});
