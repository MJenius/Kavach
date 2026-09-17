# Kavach AI

> **Independent AI-Powered Work Intelligence and Protection Layer for Gig Workers**

Kavach AI gives gig workers an independent understanding of what happened during their delivery shifts, what they earned, what went wrong (e.g., unexplained deductions, merchant queue delays, disputed penalties), and what actionable steps they can take next.

---

## 1. Quick Start (Mock-First Development)

Kavach AI runs completely offline in **mock mode by default** (`MOCK_AWS=true`, `MOCK_AI=true`). Zero external AWS, Bedrock, or third-party credentials are required.

```bash
# 1. Install dependencies
npm install

# 2. Start both Frontend (:3000) and Mock API (:3001)
npm run dev

# 3. Open your browser
# Frontend: http://localhost:3000
# Mock Backend API: http://localhost:3001/api/workers/worker-vikram-01
```

### Available Scripts

* `npm run dev`: Concurrently runs local Vite UI (:3000) and Express mock backend (:3001).
* `npm run dev:ui`: Starts only the Vite frontend dev server.
* `npm run dev:api`: Starts only the mock API backend server.
* `npm run typecheck`: Runs TypeScript type check across the entire project (`tsc --noEmit`).
* `npm test`: Runs automated Vitest test suite.
* `npm run build`: Compiles production frontend bundle.

---

## 2. System Architecture

```text
Worker
  |
  +-- Earnings
  |
  +-- Trips
  |
  +-- Events
  |
  +-- Incentives
  |
  +-- Expenses
  |
  +-- Documents
  |
  v
Evidence Graph
  |
  +----------------------+
  |                      |
  v                      v
Deterministic Engine    AI Engine (Supervisor + Specialized Agents)
  |                      |
  +----------+-----------+
             |
             v
      Worker Intelligence
             |
       +-----+-----+
       |     |     |
       v     v     v
     Audit Predict  Act
```

---

## 3. Four-Person Parallel Feature Ownership

This repository was architected to support 4 team members working in parallel without merge collisions.

| Contributor | Feature Branch | Ownership Area | Primary Directory Scope |
| :--- | :--- | :--- | :--- |
| **Person 1** | `feature/ai-intelligence` | Bedrock, Strands agents, prompts, AI evaluation | `src/ai/`, `src/agents/`, `src/prompts/`, `tests/ai/` |
| **Person 2** | `feature/evidence-engine` | Evidence Graph, earnings audit, trip reconstruction | `src/evidence/`, `src/calculations/`, `src/simulation/`, `tests/evidence/` |
| **Person 3** | `feature/cloud-platform` | AWS SAM, API endpoints, Cognito, Cedar, S3/Dynamo | `infra/`, `src/api/`, `src/services/`, `src/auth/`, `src/policies/`, `tests/api/` |
| **Person 4** | `feature/frontend-experience` | React UI, dashboard, evidence visuals, cases UI | `src/app/`, `src/components/`, `src/features/`, `src/styles/`, `tests/ui/` |

> ⚠️ **Notice**: Shared domain models (`src/domain/index.ts`) and canonical fixtures (`fixtures/demo-worker.ts`) are **frozen contracts**. Do not modify them in individual feature branches. Read [`docs/contributing.md`](docs/contributing.md) before starting.

---

## 4. Canonical Demo Scenario: Late Delivery Penalty Dispute

* **Worker**: Vikram Sharma (`worker-vikram-01`)
* **Incident Trip**: `trip-2026-09-15-001`
* **Platform Claim**: ₹350 late-delivery penalty
* **Reconstructed Facts**:
  * 19:02: Store arrival verified by GPS telemetry.
  * 19:02–19:09: 7-minute merchant kitchen wait.
  * 19:09: Package received & scanned.
  * 19:16: Traffic obstruction on 80ft Road.
  * 19:24: Order delivered with customer OTP.
* **Deterministic Finding**: Allocated SLA was 10 minutes. Store waiting consumed 7 minutes, leaving only 3 minutes for transit. Penalty warrants review under Section 4.2.1.
* **Kavach Action**: Generate structured dispute evidence package.

---

## 5. Documentation Map

* [`plan.md`](plan.md): Repository source of truth and complete product engineering plan.
* [`docs/contributing.md`](docs/contributing.md): Branching, PR guidelines, and ownership rules.
* [`docs/architecture.md`](docs/architecture.md): High-level system architecture and abstraction boundaries.
* [`docs/api.md`](docs/api.md): REST API contracts and endpoints.
* [`docs/agents.md`](docs/agents.md): Agent system hierarchy and tool interfaces.
* [`docs/data-model.md`](docs/data-model.md): Domain entity definitions.
* [`docs/demo.md`](docs/demo.md): Step-by-step walkthrough of the primary golden path.
