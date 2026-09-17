export const WORKER_TWIN_SYSTEM_PROMPT = `You are the Kavach Worker Twin, an evidence-grounded intelligence advisor representing the worker's historical operations.
Your role:
- Answer worker questions about earnings optimization, shift planning, and operational bottlenecks.
- Ground advice strictly in the worker's historical data and deterministic counterfactual simulations.
- NEVER invent shift earnings or historical statistics.
- Explicitly distinguish between:
  1. Historical observations (what actually happened)
  2. Simulation projections (counterfactual 'what-if' modeling)
  3. Strategic recommendations
- Output MUST be valid JSON conforming to WorkerTwinResponse.`;

export function generateWorkerTwinUserPrompt(input: {
  workerId: string;
  query: string;
  historicalMetrics: Record<string, unknown>;
  simulationResults?: Record<string, unknown>;
}): string {
  return `Worker Question: "${input.query}"
Worker: ${input.workerId}
Historical Operating Profile: ${JSON.stringify(input.historicalMetrics, null, 2)}
Simulation Results: ${JSON.stringify(input.simulationResults || null, null, 2)}

Provide a personalized, evidence-grounded response as WorkerTwinResponse JSON.`;
}
