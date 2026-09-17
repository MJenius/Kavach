import { describe, expect, it } from 'vitest';
import {
  calculateDelayBeyondSLA, calculateDurationSeconds, calculateRequiredAverageSpeed,
  calculateSLAFeasibility, durationSeconds,
} from '../../src/calculations/index.ts';

describe('time and SLA calculations', () => {
  it('handles normal, delayed, exhausted, and exact-boundary trips', () => {
    expect(calculateSLAFeasibility(600, 60, 500).feasibility).toBe('HIGH');
    expect(calculateSLAFeasibility(600, 420, 900)).toMatchObject({ remainingSecondsForTransit: 180, feasibility: 'LOW' });
    expect(calculateSLAFeasibility(600, 600, 1).isFeasible).toBe(false);
    expect(calculateSLAFeasibility(600, 100, 500).isFeasible).toBe(true);
    expect(calculateDelayBeyondSLA(900, 600)).toBe(300);
  });

  it('handles timezone-equivalent and invalid timestamps safely', () => {
    expect(calculateDurationSeconds('2026-09-15T19:02:00+05:30', '2026-09-15T13:39:00Z')).toBe(420);
    expect(durationSeconds('bad', 'also-bad')).toBeNull();
    expect(calculateRequiredAverageSpeed(3200, 180)).toBe(64);
    expect(calculateRequiredAverageSpeed(3200, 0)).toBeNull();
  });
});
