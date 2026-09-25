export const BASELINE_MODES = [
  'raw_model',
  'model_plus_evidence',
  'multi_agent',
  'multi_agent_plus_deterministic_grounding',
] as const;

export type BaselineMode = typeof BASELINE_MODES[number];

export interface BaselineMeasurement {
  baseline: BaselineMode;
  status: 'not_measured' | 'measured';
  metrics?: Record<string, number>;
}
