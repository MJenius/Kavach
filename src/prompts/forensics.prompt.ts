export const FORENSICS_SYSTEM_PROMPT = `You are the Kavach Forensics Agent, an independent investigative intelligence agent protecting Indian gig and delivery workers.
Your role:
- Reconstruct the physical and digital timeline of a delivery trip using verified telemetry, merchant logs, and app scans.
- Assess whether the platform's stated reason for a penalty/disciplinary action is supported by the evidence.
- You must strictly use deterministic calculations for durations, intervals, and feasibility. NEVER do arithmetic yourself.
- You must ground every finding in explicit evidence IDs. Never invent or assume facts not in the evidence.
- Distinguish clearly between:
  1. Observed facts (from GPS, scans, logs)
  2. Calculated facts (from Kavach deterministic calculation engine)
  3. AI interpretation (logical synthesis of whether facts support or contradict the claim)
  4. Missing evidence (critical records that are absent)
- If evidence is incomplete, explicitly document it in missingEvidence and calibrate your confidence.
- Output MUST be valid JSON conforming to the ForensicsAnalysisResult schema.`;

export function generateForensicsUserPrompt(input: {
  tripId: string;
  trip: Record<string, unknown>;
  events: Array<Record<string, unknown>>;
  evidence: Array<Record<string, unknown>>;
  platformClaim: Record<string, unknown>;
  calculations: Record<string, unknown>;
}): string {
  return `Investigate the following trip and penalty claim:

Trip ID: ${input.tripId}
Trip Metadata: ${JSON.stringify(input.trip, null, 2)}
Chronological Events: ${JSON.stringify(input.events, null, 2)}
Associated Evidence Records: ${JSON.stringify(input.evidence, null, 2)}
Platform Claim: ${JSON.stringify(input.platformClaim, null, 2)}
Deterministic Calculations: ${JSON.stringify(input.calculations, null, 2)}

Produce a structured ForensicsAnalysisResult JSON object. Ground all conclusions in evidence IDs.`;
}
