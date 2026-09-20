import { describe, it, expect } from 'vitest';
import { SupervisorAgent } from '../../src/agents/supervisor-agent.ts';
import { validateAIInvestigationResult } from '../../src/ai/structured-output.ts';

describe('End-to-End Investigation Golden Path', () => {
  it('executes canonical trip investigation through Supervisor -> Specialists -> Tools -> Findings', async () => {
    const supervisor = new SupervisorAgent();
    const output = await supervisor.run({
      workerId: 'worker-vikram-01',
      tripId: 'trip-2026-09-15-001',
      action: 'INVESTIGATE_CASE',
    });

    expect(output.status).toBe('COMPLETED');
    const inv = output.investigationResult;
    expect(inv).toBeDefined();

    // 1. Validate result against AIInvestigationResult domain schema
    const validation = validateAIInvestigationResult(inv);
    expect(validation.success).toBe(true);

    // 2. Forensics specialist invoked with deterministic calculations
    const forensics = output.agentResults.forensics as any;
    expect(forensics.reconstruction.waitingDurationSeconds).toBe(420); // Exactly 7 minutes
    expect(forensics.reconstruction.remainingSlaSecondsAfterWait).toBe(180); // Exactly 3 minutes
    expect(forensics.reconstruction.slaFeasible).toBe(false);

    // 3. Finding references exact evidence IDs from the canonical fixture
    const primaryFinding = inv!.findings.find((f) => f.id === 'finding-late-penalty-01');
    expect(primaryFinding).toBeDefined();
    expect(primaryFinding?.evidenceIds).toContain('ev-store-arrival-gps');
    expect(primaryFinding?.evidenceIds).toContain('ev-merchant-handover-scan');
    expect(primaryFinding?.evidenceIds).toContain('ev-wait-calc');

    // 4. Missing evidence & Contradictions are surfaced
    expect(inv!.missingEvidence).toContain('Customer app delivery handover photo');
    expect(inv!.contradictions.length).toBeGreaterThan(0);

    // 5. Policy reasoning included in recommended actions
    expect(inv!.recommendedActions.some((a) => a.toLowerCase().includes('merchant-delay') || a.toLowerCase().includes('merchant delay'))).toBe(true);
  });
});
