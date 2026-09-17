# Kavach AI — Contributing & Team Ownership Guidelines

> **CRITICAL RULE**: Four team members are working on parallel feature branches. Do NOT modify files outside your assigned area without prior discussion and agreement.

---

## 1. Branch Ownership Matrix

| Person | Branch | Primary Ownership Area | Allowed Directories |
| :--- | :--- | :--- | :--- |
| **Person 1** | `feature/ai-intelligence` | Bedrock, Strands agents, prompts, AI evaluation | `src/ai/`, `src/agents/`, `src/prompts/`, `tests/ai/` |
| **Person 2** | `feature/evidence-engine` | Evidence Graph, earnings audit, trip reconstruction, simulation | `src/evidence/`, `src/calculations/`, `src/simulation/`, `tests/evidence/` |
| **Person 3** | `feature/cloud-platform` | AWS SAM, API endpoints, auth/Cognito, Cedar, services, policies | `infra/`, `src/api/`, `src/services/`, `src/auth/`, `src/policies/`, `tests/api/` |
| **Person 4** | `feature/frontend-experience` | React UI, dashboard, evidence visuals, cases UI | `src/app/`, `src/components/`, `src/features/`, `src/styles/`, `tests/ui/` |

---

## 2. Core Repository Rules

1. **No Direct Commits to `main`**:
   - `main` is protected and represents the integrated, demo-ready release.
   - All work happens on the dedicated feature branches listed above.

2. **Strict Directory Ownership ("Don't modify another team's area")**:
   - Never simultaneously modify another developer's files.
   - If Person 1 needs a new calculation, ask Person 2 to add it to `src/calculations/` or agree on the interface before touching it.

3. **Shared Contracts Are FROZEN**:
   - `src/domain/index.ts` (Domain models: `Worker`, `Trip`, `TripEvent`, `EarningsRecord`, `Evidence`, `Finding`, `Case`, AI contracts) and `src/api/client.ts` (`KavachApiClient`) are **frozen contracts**.
   - Proposing changes to shared contracts requires team consensus across all 4 developers before merging.

4. **All Pre-PR Checks Must Pass**:
   - Every pull request must pass the automated gate check:
     ```bash
     npm run check
     ```
     This runs `typecheck + lint + test + build`.

5. **No Secrets in Code**:
   - Never commit API keys, AWS credentials, or personal tokens. Always use `.env.example` and mock services by default.

---

## 3. How to Run Locally (Mock-First Mode)

By default, Kavach runs in 100% offline mock mode (`MOCK_AWS=true`, `MOCK_AI=true`). No AWS credentials or cloud dependencies are required.

```bash
# 1. Install dependencies
npm install

# 2. Start local development (runs UI on :3000 and mock API on :3001)
npm run dev

# 3. Run full verification check
npm run check
```

---

## 4. Architectural Separation: Local Mock vs Target AWS

```text
LOCAL DEVELOPMENT
React/Vite (:3000)
    ↓
Express Mock API (:3001)
    ↓
Mock services / In-Memory Adapters
    ↓
Fixtures (demo-worker.ts)

TARGET AWS
React/Vite (Amplify)
    ↓
API Gateway
    ↓
Lambda Handlers
    ↓
DynamoDB / S3 / Step Functions / EventBridge
    ↓
Amazon Bedrock + Strands Agents
```

The Express server is strictly a local developer convenience and must never be coupled to production AWS infrastructure.
