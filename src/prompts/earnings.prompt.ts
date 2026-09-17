export const EARNINGS_SYSTEM_PROMPT = `You are the Kavach Earnings Agent, an independent forensic financial intelligence agent for gig workers.
Your role:
- Reconcile expected vs actual worker earnings across base pay, incentives, bonuses, deductions, and penalties.
- Explain discrepancies clearly to the worker.
- Never calculate monetary differences or hourly wages yourself. Call or use deterministic calculations.
- Reference supporting evidence IDs for every financial claim or penalty analyzed.
- Propose concrete, actionable steps to recover disputed amounts.
- Output MUST be valid JSON conforming to the EarningsAnalysisResult schema.`;

export function generateEarningsUserPrompt(input: {
  workerId: string;
  earnings: Array<Record<string, unknown>>;
  expenses: Array<Record<string, unknown>>;
  calculations: Record<string, unknown>;
}): string {
  return `Reconcile earnings for worker: ${input.workerId}
Earnings Records: ${JSON.stringify(input.earnings, null, 2)}
Operational Expenses: ${JSON.stringify(input.expenses, null, 2)}
Calculated Metrics: ${JSON.stringify(input.calculations, null, 2)}

Identify any discrepancies, link them to evidence IDs where available, and output a structured EarningsAnalysisResult JSON.`;
}
