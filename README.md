# Kavach AI — Trustworthy Multi-Agent AI Evaluation System

> **Trustworthy Multi-Agent AI Evaluation System**

Kavach AI gives gig workers an independent understanding of what happened during their delivery shifts, what they earned, what went wrong (e.g., unexplained deductions, merchant queue delays, disputed penalties), and what actionable steps they can take next.

The repository includes deterministic evidence grounding and a reproducible local adversarial evaluation. Current measured results and scope are in [the generated trust evaluation](results/evaluation/trust-benchmark.md); regenerate it with `npm run eval:trust`. The benchmark uses a synthetic canonical fixture and a stubbed model provider, so its results do not represent AWS/Bedrock performance or broad real-world safety.

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
* `npm run eval:trust`: Runs the deterministic Worker Twin grounding and failure-injection benchmark; writes JSON and Markdown under `results/evaluation/`.

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
* **Deterministic Finding**: Allocated SLA was 10 minutes. Store waiting consumed 7 minutes, leaving only 3 minutes for transit. Penalty warrants review under the applicable merchant-delay policy.
* **Kavach Action**: Generate structured dispute evidence package.

---

## 5. Documentation Map

## Local trust evaluation

Run `npm run eval:trust` for the deterministic 45-scenario synthetic suite. It reports candidate/fallback outcomes, evidence attribution, tested monetary, timestamp, contradiction checks, and measured supervisor routing. The benchmark uses a local stub only; no AWS or Bedrock inference occurs. See [`results/evaluation/trust-benchmark.md`](results/evaluation/trust-benchmark.md) and its JSON companion. Current non-twin routes call all three specialists, producing unnecessary local calls for earnings-only and trip-only actions. Other declared baseline modes remain unmeasured.

The final supervisor synthesis now drops any specialist finding with no evidence IDs or IDs absent from the worker evidence store. The suite does not cover stale evidence policy, specialist disagreement, policy violations, or timeout behavior.

The local production build currently emits a 536.83 kB JavaScript chunk, above Vite's 500 kB advisory threshold; the build succeeds with the warning visible.

* [`plan.md`](plan.md): Repository source of truth and complete product engineering plan.
* [`docs/contributing.md`](docs/contributing.md): Branching, PR guidelines, and ownership rules.
* [`docs/architecture.md`](docs/architecture.md): High-level system architecture and abstraction boundaries.
* [`docs/api.md`](docs/api.md): REST API contracts and endpoints.
* [`docs/agents.md`](docs/agents.md): Agent system hierarchy and tool interfaces.
* [`docs/data-model.md`](docs/data-model.md): Domain entity definitions.
* [`docs/demo.md`](docs/demo.md): Step-by-step walkthrough of the primary golden path.
