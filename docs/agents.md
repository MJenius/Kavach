# Kavach AI — AI Agents Specification

Based on Sections 17–21 of `plan.md`.

## Agent Hierarchy
```text
                    Supervisor
                         |
         +---------------+---------------+
         |               |               |
         v               v               v
    Earnings Agent   Forensics Agent   Policy Agent
         |               |               |
         +---------------+---------------+
                         |
                         v
                    Worker Twin
```

## Agent Responsibilities
1. **Supervisor Agent**: Orchestrates multi-agent analysis for cases and disputes.
2. **Earnings Agent**: Audits base pay, incentives, and deductions; detects unexplained penalties.
3. **Forensics Agent**: Reconstructs trip timeline using telemetry, scans, and wait-time math.
4. **Policy Agent**: Retrieves and cites platform service agreements without rendering legal opinions.
5. **Worker Twin**: Answers historical work-pattern queries and simulates counterfactual earnings scenarios.
