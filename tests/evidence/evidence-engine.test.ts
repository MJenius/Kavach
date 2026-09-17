import { describe, it, expect } from 'vitest';
import { LocalEvidenceStore } from '../../src/evidence/store.ts';
import { calculateSLAFeasibility, calculateEffectiveHourlyWage } from '../../src/calculations/index.ts';
import { demoWorker, demoEvidence } from '../../fixtures/demo-worker.ts';

describe('Evidence & Deterministic Calculations Engine', () => {
  it('LocalEvidenceStore retrieves demo evidence records correctly', async () => {
    const store = new LocalEvidenceStore();
    const allEvidence = await store.listEvidenceByWorker(demoWorker.id);
    expect(allEvidence.length).toBe(demoEvidence.length);

    const singleItem = await store.getEvidence('ev-penalty-screenshot');
    expect(singleItem).not.toBeNull();
    expect(singleItem?.type).toBe('SCREENSHOT');
  });

  it('calculateSLAFeasibility detects unfeasible transit SLA after 7m store wait', () => {
    // 10 min SLA = 600s, 7 min wait = 420s, 15 min estimated travel = 900s
    const result = calculateSLAFeasibility(600, 420, 900);
    expect(result.remainingSecondsForTransit).toBe(180);
    expect(result.isFeasible).toBe(false);
    expect(result.transitShortfallSeconds).toBe(720);
  });

  it('calculateEffectiveHourlyWage correctly factors fuel & mobile expenses', () => {
    // Gross: 8460, Expenses: 3390, Hours: 53 => Net: 5070 / 53 = 95.66
    const rate = calculateEffectiveHourlyWage(8460, 3390, 53);
    expect(rate).toBe(95.66);
  });
});
