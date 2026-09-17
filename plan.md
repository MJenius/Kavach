# Kavach AI — Engineering Plan

> **Repository Source of Truth**
>
> This document defines the product scope, architecture, ownership, interfaces, branch strategy, implementation boundaries, and acceptance criteria for the Kavach AI hackathon project.
>
> All contributors should read this document before creating a branch or implementing a feature.
>
> **Rule:** If a proposed implementation conflicts with this document, discuss and update the plan before changing the architecture.

---

# 1. Project Overview

## Kavach AI

**Kavach AI** is an independent AI-powered work intelligence and protection layer for gig workers.

### Core proposition

> **Platforms have a record of what happens during gig work. Kavach gives the worker an independent understanding of what happened, what they earned, what went wrong, and what they can do about it.**

Kavach combines:

* multimodal document understanding
* earnings reconciliation
* trip/event reconstruction
* anomaly detection
* evidence graphs
* policy-aware reasoning
* multi-agent investigation
* personalized worker intelligence
* counterfactual simulation
* actionable dispute/evidence generation

The system should not be positioned as an anti-platform product or as an automated legal authority.

It should be positioned as an:

> **Independent worker-side intelligence and evidence system.**

---

# 2. Primary User

The primary user is an Indian gig worker, initially modeled around delivery workers.

Examples:

* quick-commerce delivery partners
* food-delivery riders
* courier workers
* other app-mediated delivery/gig workers

The initial demo should focus on one worker persona and one coherent scenario.

Do not attempt to support every gig-work category during the hackathon.

---

# 3. Core User Problems

Kavach addresses five connected problems.

## 3.1 Earnings opacity

Workers see gross platform payouts but may not understand their actual economic return after:

* fuel
* maintenance
* waiting
* unpaid time
* incentives
* deductions
* penalties

### Kavach question

> **“What did I actually earn?”**

---

## 3.2 Payout discrepancies

Workers may have difficulty determining whether:

* an incentive was applied
* a deduction is explained
* expected payout matches actual payout
* a trip was incorrectly classified

### Kavach question

> **“Does my payout match the available evidence?”**

---

## 3.3 Trip and event opacity

A worker may be blamed for:

* late delivery
* route deviation
* cancellation
* failed completion

while not having an independent record of what happened.

### Kavach question

> **“What actually happened during this trip?”**

---

## 3.4 Platform decision opacity

Workers may receive:

* warnings
* penalties
* restrictions
* reduced allocation
* account actions

without understanding the observable factors behind them.

### Kavach question

> **“Why did this happen, and does the available evidence support it?”**

---

## 3.5 Lack of actionable support

Even after identifying a problem, the worker may not know what to do.

### Kavach question

> **“What should I do next?”**

---

# 4. Product Architecture

Kavach is built around one central concept:

## The Worker Evidence Graph

All important information eventually contributes to a common representation of the worker's work.

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
  +-- Platform Decisions
  |
  +-- Incidents
  |
  +-- Policies
  |
  v
Evidence Graph
  |
  +----------------------+
  |                      |
  v                      v
Deterministic Engine    AI Engine
  |                      |
  |                 Multi-Agent System
  |                      |
  +----------+-----------+
             |
             v
      Worker Intelligence
             |
       +-----+-----+
       |     |     |
       v     v     v
     Audit  Predict  Act
```

The Evidence Graph is the conceptual center of the application.

Features should consume and produce standardized evidence rather than creating isolated data models.

---

# 5. Product Pillars

The product has four major pillars.

## Pillar A — Understand

Turn messy worker information into structured intelligence.

Includes:

* screenshot/document understanding
* payout extraction
* incentive extraction
* trip/event extraction
* policy retrieval
* multilingual input

---

## Pillar B — Audit

Determine whether observed information is internally consistent.

Includes:

* expected vs actual payout
* incentive reconciliation
* effective hourly earnings
* expense-adjusted earnings
* trip feasibility
* anomaly detection

---

## Pillar C — Protect

Preserve evidence and investigate adverse events.

Includes:

* trip reconstruction
* evidence graph
* decision review
* deactivation analysis
* incident/accident evidence

---

## Pillar D — Act

Turn intelligence into useful next actions.

Includes:

* dispute/evidence package
* recommended worker action
* work optimization
* personalized Worker Twin recommendations

---

# 6. Hackathon MVP

The MVP must have one complete end-to-end flow.

## Primary flow

```text
Upload worker data
        ↓
AI extracts information
        ↓
Evidence is normalized
        ↓
Earnings/trip data is reconstructed
        ↓
Deterministic calculations run
        ↓
AI investigates discrepancy
        ↓
Evidence Graph is displayed
        ↓
Worker receives explanation
        ↓
Worker can generate an action/evidence package
```

This flow is the highest priority in the entire repository.

If secondary features fail, this flow must still work.

---

# 7. Primary Demo Scenario

The canonical demo scenario is:

> A delivery worker receives a late-delivery penalty.

The platform records:

```text
Penalty: ₹350
Reason: Late delivery
```

Kavach receives worker-side evidence.

It reconstructs:

```text
19:02 — Store arrival
19:02–19:09 — Waiting
19:09 — Package received
19:09 — Delivery starts
19:16 — Traffic disruption
19:24 — Delivery completed
```

The system calculates:

```text
SLA:              10 minutes
Store waiting:     7 minutes
Remaining SLA:     3 minutes
Traffic delay:     6 minutes
```

Kavach then produces:

> **Potential discrepancy detected**

The system should not automatically claim that a platform has violated the law.

Instead:

> **Available evidence suggests the decision warrants review.**

The user can then generate an evidence-backed review/dispute package.

---

# 8. Feature Ownership

Each feature has exactly **one primary owner**.

The owner is responsible for:

* implementation
* tests
* feature-specific UI
* feature-specific backend
* documentation
* integration contract
* resolving merge conflicts in their owned area

Other team members may contribute, but no two people should independently implement the same feature.

---

# 9. Team Structure

Use the following four ownership areas.

---

## PERSON 1 — AI / Agent Intelligence

### Branch

```text
feature/ai-intelligence
```

### Owns

* Bedrock integration
* Strands agents
* agent tools
* agent supervisor
* prompt/system instructions
* structured AI outputs
* AI evaluation fixtures
* Worker Twin reasoning
* AI explanation generation

### Primary features

1. Earnings Agent
2. Forensics Agent
3. Policy Agent
4. Worker Twin
5. Agent Supervisor

### Owns directories

```text
src/ai/
src/agents/
src/prompts/
tests/ai/
```

### Must not own

* global frontend layout
* database infrastructure
* authentication
* deployment configuration
* unrelated feature APIs

---

# 10. PERSON 2 — Evidence / Earnings / Data Intelligence

### Branch

```text
feature/evidence-engine
```

### Owns

* document normalization
* earnings reconciliation
* trip reconstruction
* Evidence Graph
* anomaly calculations
* deterministic calculations
* Worker Ledger
* simulation primitives

### Primary features

1. Multimodal data ingestion
2. Earnings audit
3. Trip reconstruction
4. Evidence Graph
5. Counterfactual calculations

### Owns directories

```text
src/evidence/
src/domain/
src/calculations/
src/simulation/
tests/evidence/
```

### Must not own

* agent orchestration
* authentication
* global UI
* AWS deployment configuration

---

# 11. PERSON 3 — AWS / Backend / Security

### Branch

```text
feature/cloud-platform
```

### Owns

* AWS infrastructure
* API Gateway
* Lambda
* DynamoDB
* S3
* Step Functions
* EventBridge
* Cognito
* Cedar
* environment configuration
* IAM
* backend API contracts
* deployment

### Primary responsibilities

1. Cloud infrastructure
2. Persistence
3. API layer
4. Authentication
5. Authorization
6. asynchronous workflows
7. deployment

### Owns directories

```text
infra/
src/api/
src/services/
src/auth/
src/policies/
tests/api/
```

### Must not own

* agent logic
* feature-specific frontend
* domain calculations unless required to expose an API

---

# 12. PERSON 4 — Frontend / Product Experience

### Branch

```text
feature/frontend-experience
```

### Owns

* application shell
* dashboard
* evidence visualization
* earnings UI
* investigation UI
* worker profile
* Worker Twin interface
* dispute/evidence package UI
* responsive design
* UX states

### Primary features

1. Worker dashboard
2. Earnings intelligence screen
3. Evidence Graph
4. Investigation view
5. Worker Twin
6. Action/dispute view

### Owns directories

```text
src/app/
src/components/
src/features/
src/styles/
tests/ui/
```

### Must not own

* backend business logic
* AWS infrastructure
* agent implementation
* database schema

---

# 13. Shared Ownership

The following areas are shared and must not be modified casually:

```text
README.md
plan.md
package.json
lockfiles
environment schema
API contracts
domain types
root configuration
```

Changes to shared contracts require communication in the team channel before merging.

---

# 14. Repository Structure

The initial repository should follow this structure:

```text
kavach/
│
├── README.md
├── plan.md
├── LICENSE
├── .gitignore
├── .env.example
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── agents.md
│   ├── data-model.md
│   └── demo.md
│
├── infra/
│   ├── template.yaml
│   ├── policies/
│   └── config/
│
├── src/
│   ├── app/
│   │
│   ├── components/
│   │
│   ├── features/
│   │   ├── dashboard/
│   │   ├── earnings/
│   │   ├── evidence/
│   │   ├── investigation/
│   │   ├── worker-twin/
│   │   └── cases/
│   │
│   ├── api/
│   │
│   ├── ai/
│   │
│   ├── agents/
│   │
│   ├── evidence/
│   │
│   ├── domain/
│   │
│   ├── calculations/
│   │
│   ├── simulation/
│   │
│   ├── auth/
│   │
│   ├── services/
│   │
│   └── policies/
│
├── tests/
│   ├── ai/
│   ├── api/
│   ├── evidence/
│   ├── integration/
│   └── ui/
│
├── fixtures/
│   ├── workers/
│   ├── trips/
│   ├── payouts/
│   ├── incentives/
│   └── policies/
│
└── scripts/
```

The exact framework may change during skeleton creation, but the ownership boundaries should remain.

---

# 15. Shared Domain Contracts

Before feature work begins, the team must agree on the core domain types.

These should be treated as API contracts.

## Worker

```typescript
type Worker = {
  id: string;
  name: string;
  preferredLanguage: string;
  platforms: string[];
};
```

---

## Trip

```typescript
type Trip = {
  id: string;
  workerId: string;
  platform: string;
  storeId?: string;
  startedAt: string;
  completedAt?: string;
  slaSeconds?: number;
  distanceMeters?: number;
  status: string;
};
```

---

## TripEvent

```typescript
type TripEvent = {
  id: string;
  tripId: string;
  type:
    | "STORE_ARRIVAL"
    | "WAITING_STARTED"
    | "PACKAGE_RECEIVED"
    | "DELIVERY_STARTED"
    | "TRAFFIC_EVENT"
    | "DELIVERY_COMPLETED"
    | "PLATFORM_PENALTY";
  timestamp: string;
  latitude?: number;
  longitude?: number;
  source: string;
  confidence?: number;
  evidenceIds?: string[];
};
```

---

## EarningsRecord

```typescript
type EarningsRecord = {
  id: string;
  workerId: string;
  tripId?: string;
  type:
    | "BASE_PAY"
    | "INCENTIVE"
    | "BONUS"
    | "PENALTY"
    | "DEDUCTION"
    | "ADJUSTMENT";
  expectedAmount?: number;
  actualAmount?: number;
  currency: "INR";
  timestamp: string;
  source: string;
};
```

---

## Expense

```typescript
type Expense = {
  id: string;
  workerId: string;
  type:
    | "FUEL"
    | "MAINTENANCE"
    | "PHONE"
    | "OTHER";
  amount: number;
  timestamp: string;
  source: string;
};
```

---

## Evidence

```typescript
type Evidence = {
  id: string;
  type:
    | "SCREENSHOT"
    | "DOCUMENT"
    | "TRIP_EVENT"
    | "PAYOUT"
    | "WORKER_STATEMENT"
    | "POLICY"
    | "CALCULATION";
  source: string;
  timestamp?: string;
  uri?: string;
  description: string;
  confidence?: number;
};
```

---

## Finding

```typescript
type Finding = {
  id: string;
  type:
    | "PAYOUT_DISCREPANCY"
    | "INCENTIVE_DISCREPANCY"
    | "TRIP_DISCREPANCY"
    | "DECISION_REVIEW"
    | "SAFETY_RISK";
  severity: "LOW" | "MEDIUM" | "HIGH";
  title: string;
  explanation: string;
  confidence: number;
  evidenceIds: string[];
};
```

---

## Case

```typescript
type Case = {
  id: string;
  workerId: string;
  type:
    | "PAYOUT"
    | "TRIP"
    | "DEACTIVATION"
    | "INCIDENT";
  status:
    | "DRAFT"
    | "ANALYZING"
    | "REVIEW"
    | "READY"
    | "RESOLVED";
  findingIds: string[];
  createdAt: string;
};
```

These types should live in a shared domain location.

Do not duplicate them in individual feature branches.

---

# 16. AI Output Contracts

AI should return structured objects whenever possible.

Never make the frontend parse free-form prose when a structured response is possible.

Example:

```typescript
type AIInvestigationResult = {
  summary: string;
  findings: Finding[];
  missingEvidence: string[];
  contradictions: string[];
  recommendedActions: string[];
  confidence: number;
};
```

The agent can generate the explanation, but the application should receive predictable fields.

---

# 17. AI Architecture

Kavach should use a supervisor + specialized agents.

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
                        |
                        v
                Action Planner
```

---

# 18. Earnings Agent

### Responsibility

Investigate:

> “Why did my earnings change?”

### Tools

```text
get_worker_earnings()
get_trip()
get_expenses()
get_incentives()
calculate_effective_wage()
compare_expected_actual()
find_earnings_anomalies()
```

### Output

```text
income_summary
primary_causes
discrepancies
supporting_evidence
recommendations
confidence
```

The agent must not invent financial values.

---

# 19. Forensics Agent

### Responsibility

Investigate:

> “What happened during this trip?”

### Tools

```text
get_trip_events()
get_trip_evidence()
calculate_wait_time()
calculate_sla_feasibility()
calculate_route_metrics()
get_platform_claim()
```

### Output

```text
timeline
platform_claim
independent_reconstruction
contradictions
missing_evidence
confidence
```

---

# 20. Policy Agent

### Responsibility

Retrieve and explain relevant policies and regulations.

### Tools

```text
search_policy()
get_policy_section()
compare_policy_requirement()
```

The Policy Agent must distinguish:

* source text
* interpretation
* recommendation

It must never present an AI-generated legal conclusion as authoritative legal advice.

---

# 21. Worker Twin

The Worker Twin represents the worker's historical operating profile.

It can reason over:

```text
earnings
hours
expenses
trips
waiting
incentives
locations
historical outcomes
preferences
```

Primary questions:

> “Why did I earn less?”

> “How can I make ₹1,000 tomorrow?”

> “Which work pattern has historically worked best for me?”

> “What is causing my earnings to fall?”

The Worker Twin should use deterministic calculations for numerical predictions.

The LLM is responsible for reasoning and explanation, not arithmetic.

---

# 22. Counterfactual Simulator

The simulator answers:

> **“What would have happened if X were different?”**

Examples:

```text
What if store waiting was 2 minutes instead of 8?

What if I worked 2 additional hours?

What if I avoided a particular store?

What if fuel costs increased by 10%?

What if the incentive had been applied?
```

Simulation functions should be deterministic.

AI may decide which scenarios are useful, but the underlying calculations should be programmatic.

---

# 23. Evidence Graph

The Evidence Graph connects conclusions to evidence.

Every major finding must be traceable.

Example:

```text
Finding:
"Potential late-delivery discrepancy"

       |
       +-- Platform claim
       |
       +-- Store arrival event
       |
       +-- Package receipt event
       |
       +-- Waiting duration calculation
       |
       +-- Traffic event
       |
       +-- SLA calculation
```

UI must allow the user to click a finding and inspect supporting evidence.

---

# 24. Deterministic vs AI Responsibilities

This separation is mandatory.

## AI should handle

* extracting meaning from messy documents
* summarization
* classification
* reasoning
* planning
* selecting relevant tools
* finding patterns
* explaining findings
* generating recommendations
* natural-language interaction

## Code should handle

* arithmetic
* currency calculations
* time calculations
* distance calculations
* thresholds
* validation
* authorization
* database state
* workflow state
* evidence IDs
* confidence aggregation where deterministic
* security decisions

The LLM must not be the source of truth for numerical calculations or authorization.

---

# 25. AWS Architecture

Target the Ship It track.

```text
                        Amplify
                           |
                        Cognito
                           |
                       API Gateway
                           |
                         Lambda
                           |
             +-------------+-------------+
             |                           |
         DynamoDB                       S3
             |                           |
             +-------------+-------------+
                           |
                    Step Functions
                           |
                  +--------+--------+
                  |                 |
             EventBridge         AI Layer
                                    |
                              Amazon Bedrock
                                    |
                             Strands Agents
                                    |
                              OpenSearch
                                    |
                                  Cedar
```

Use AWS where it materially contributes to the system.

Do not add services purely to increase the architecture diagram.

---

# 26. AWS Service Responsibilities

## Amplify

Hosts the frontend.

---

## Cognito

Worker authentication.

---

## API Gateway

Public API boundary.

---

## Lambda

Stateless application/business functions.

---

## S3

Stores:

* uploaded documents
* screenshots
* evidence packages
* generated reports

---

## DynamoDB

Stores:

* worker state
* trips
* events
* earnings
* findings
* cases

---

## Bedrock

AI inference.

Potential uses:

* multimodal extraction
* reasoning
* summarization
* agent models

---

## Strands Agents

Agent orchestration.

---

## OpenSearch

Search/retrieval for:

* policies
* regulations
* historical knowledge
* indexed evidence where appropriate

---

## Step Functions

Long-running case workflows.

---

## EventBridge

Event-driven system communication.

---

## Cedar

Fine-grained authorization.

Cedar is primarily an authorization mechanism.

Do not represent it as an automated legal judge.

---

# 27. API Contract

The backend should expose stable endpoints.

Example:

```text
POST /workers
GET  /workers/{id}

POST /documents
POST /trips
GET  /trips/{id}

POST /earnings/analyze
GET  /earnings/{workerId}

POST /investigations
GET  /investigations/{id}

POST /cases
GET  /cases/{id}

POST /cases/{id}/generate-package

POST /worker-twin/query
```

The exact framework may change, but the semantic contract should remain stable.

---

# 28. Branch Strategy

Use:

```text
main
```

as the only integration branch.

Feature branches:

```text
feature/ai-intelligence
feature/evidence-engine
feature/cloud-platform
feature/frontend-experience
```

Do not commit directly to `main`.

---

# 29. Branch Rules

Every branch must:

1. Start from the latest `main`.
2. Implement only its assigned area.
3. Keep shared interfaces stable.
4. Add tests for its functionality.
5. Run the project locally before opening a PR.
6. Rebase/merge latest `main` before final merge if required.
7. Never commit secrets.
8. Never modify another person's owned feature without discussion.

---

# 30. Merge Rules

A PR should contain:

```text
What changed?
Why?
Files changed
Dependencies
How to test
Screenshots if UI changed
Known limitations
```

Before merge:

* build succeeds
* tests pass
* application starts
* feature works against the current main branch
* no secrets are committed
* no unrelated files were modified

---

# 31. Shared Contract Freeze

The following must be frozen early:

* domain types
* API response shapes
* folder ownership
* environment variable names
* AWS resource naming
* authentication model
* evidence object structure

After these are frozen, feature work can proceed independently.

Changing a shared contract requires explicit team discussion.

---

# 32. Mock-First Development

No feature should wait for another feature to exist.

If the AI agent is not ready:

```text
frontend → mock AI response
```

If AWS infrastructure is not ready:

```text
feature → local adapter
```

If the frontend is not ready:

```text
backend → curl/Postman/test fixture
```

Every component should have an interface that can be replaced by a mock.

This is essential for parallel four-person development.

---

# 33. Adapter Pattern

External systems must be accessed through adapters.

Example:

```text
AIService
├── BedrockAIService
└── MockAIService
```

Similarly:

```text
EvidenceStore
├── DynamoEvidenceStore
└── LocalEvidenceStore
```

This prevents AWS integration details from spreading throughout the codebase.

---

# 34. Environment Variables

Use `.env.example`.

Never commit:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
API_KEYS
TOKENS
PRIVATE_URLS
```

Use AWS IAM/role-based credentials where possible.

---

# 35. Feature Checklist

This checklist is the authoritative list of planned functionality.

Each feature has one owner.

---

## CORE — MUST WORK

### Data foundation

* [ ] Shared domain types
* [ ] Worker model
* [ ] Trip model
* [ ] Event model
* [ ] Earnings model
* [ ] Evidence model
* [ ] Finding model
* [ ] Case model

### Ingestion

* [ ] Upload screenshot/document
* [ ] Store document
* [ ] Extract structured information
* [ ] Normalize extracted information

### Earnings

* [ ] Expected vs actual payout
* [ ] Incentive reconciliation
* [ ] Expense calculation
* [ ] Effective hourly earnings
* [ ] Earnings anomaly detection

### Trip

* [ ] Trip timeline
* [ ] Store waiting calculation
* [ ] SLA feasibility calculation
* [ ] Platform claim representation
* [ ] Evidence-backed finding

### AI

* [ ] Bedrock integration
* [ ] Strands integration
* [ ] Supervisor
* [ ] Earnings Agent
* [ ] Forensics Agent
* [ ] Structured AI output

### Evidence

* [ ] Evidence Graph
* [ ] Finding → evidence links
* [ ] Evidence inspection UI

### Action

* [ ] Generate investigation summary
* [ ] Generate evidence-backed review/dispute package

### Cloud

* [ ] Cognito
* [ ] Amplify
* [ ] API Gateway
* [ ] Lambda
* [ ] S3
* [ ] DynamoDB
* [ ] Bedrock

---

# 36. SECONDARY FEATURES

Implement only after the core workflow is stable.

### Worker Twin

* [ ] Worker profile
* [ ] Historical earnings analysis
* [ ] Personalized explanation
* [ ] Work recommendation
* [ ] Scenario simulation

### Policy Agent

* [ ] Policy ingestion
* [ ] Retrieval
* [ ] Source citations
* [ ] Policy explanation

### Counterfactuals

* [ ] Store-wait scenario
* [ ] Work-hours scenario
* [ ] Expense scenario
* [ ] Incentive scenario

### Deactivation Shield

* [ ] Platform decision input
* [ ] Evidence reconstruction
* [ ] Contradiction detection
* [ ] Human-review recommendation

---

# 37. STRETCH FEATURES

These should not be started until the core product is working.

* [ ] Multilingual voice
* [ ] Collective anonymized intelligence
* [ ] Safety agent
* [ ] Accident evidence package
* [ ] Advanced route analysis
* [ ] Advanced predictive risk
* [ ] Multi-platform comparison
* [ ] Worker protection score
* [ ] Cryptographic evidence ledger

---

# 38. Explicitly Out of Scope

Do not spend hackathon time on:

* automatic government filing
* autonomous legal representation
* legal adjudication
* real platform integrations
* scraping platform applications
* real insurer integrations
* production-scale worker onboarding
* biometric identity verification
* invasive device monitoring
* blockchain infrastructure
* complex IoT hardware
* nationwide deployment

These may be future product directions but are not required for the hackathon.

---

# 39. AI Safety / Trust Principles

Kavach must never fabricate evidence.

Every AI finding should distinguish:

```text
Observed
Calculated
Inferred
Recommended
```

Example:

### Observed

> Store arrival: 19:02.

### Calculated

> Waiting duration: 7 minutes.

### Inferred

> Waiting appears to have materially contributed to late completion.

### Recommended

> Request review of the late-delivery penalty.

This distinction should be visible in the UI where appropriate.

---

# 40. Confidence

Important AI findings should expose:

```text
Confidence: 91%
Evidence coverage: 8/9
Contradictions: 1
Missing evidence: 2
```

Confidence must not be presented as mathematical certainty.

---

# 41. AI Evaluation

Create a small fixed evaluation dataset.

Minimum target:

```text
20 scenarios
```

Each should contain:

* input documents
* expected extracted values
* expected findings
* expected evidence
* expected recommendation

Measure:

```text
Extraction accuracy
Finding accuracy
Evidence attribution
Numerical correctness
Hallucination rate
```

The evaluation should run independently of the UI.

---

# 42. Demo Dataset

The project should ship with realistic synthetic demo data.

Create:

```text
fixtures/
├── workers/
├── payouts/
├── trips/
├── incentives/
├── expenses/
├── policies/
└── cases/
```

The primary demo worker should have a coherent multi-day history.

Do not use random disconnected fake values.

All screenshots/documents/trips should refer to the same worker and consistent IDs.

---

# 43. Demo Golden Path

The application must have a reliable golden path.

```text
Dashboard
   ↓
Explain My Week
   ↓
AI investigation
   ↓
Earnings discrepancy
   ↓
Open trip
   ↓
Evidence Graph
   ↓
Trip reconstruction
   ↓
Counterfactual
   ↓
Decision Review
   ↓
Generate Evidence Package
```

This flow should work even if every optional feature is disabled.

---

# 44. UI Principles

The product should feel like a serious worker financial/intelligence tool.

Avoid:

* generic AI chat UI
* excessive gradients
* meaningless dashboards
* huge AI-generated paragraphs
* decorative metrics
* unexplained scores

Prefer:

* clear numbers
* evidence
* timelines
* explanations
* source attribution
* actionable next steps
* simple language
* strong hierarchy

The worker should understand the important result within seconds.

---

# 45. The Primary Dashboard

The dashboard should answer:

### How am I doing?

```text
₹8,460
Platform earnings

₹5,070
Estimated real earnings

₹95/hr
Effective earnings
```

### What went wrong?

```text
3 potential discrepancies

₹740 potential impact
```

### What should I do?

```text
2 cases ready for review
```

---

# 46. Primary “Magic Moment”

The most important UI interaction is:

```text
Platform:
₹350 late-delivery penalty

Kavach:
Potential discrepancy detected

7 min
store waiting

3 min
remaining SLA

6 min
traffic disruption

94%
evidence confidence
```

Then:

> **Generate evidence-backed review**

This should be the most polished interaction in the entire product.

---

# 47. Engineering Quality Bar

The goal is not production perfection.

The goal is:

> **One complete, credible, technically sophisticated workflow.**

Prioritize:

1. correctness
2. reliability
3. evidence traceability
4. clear UX
5. AWS integration
6. AI quality
7. architecture
8. secondary features

Do not sacrifice the golden path to add more features.

---

# 48. Definition of Done

A feature is complete only when:

* [ ] Feature works locally.
* [ ] Feature works with realistic fixture data.
* [ ] Feature has a defined input/output contract.
* [ ] Feature handles basic errors.
* [ ] Feature does not depend on another unfinished feature unless explicitly documented.
* [ ] Feature has tests for important logic.
* [ ] Feature is documented.
* [ ] Feature does not break the main application.
* [ ] Feature is demonstrable.

---

# 49. Definition of Integration Done

A merged feature is considered integrated when:

* [ ] It is merged into `main`.
* [ ] Existing features still work.
* [ ] Shared contracts remain valid.
* [ ] Frontend and backend agree on data shape.
* [ ] AWS deployment succeeds.
* [ ] Golden-path test succeeds.

---

# 50. Commit Convention

Use conventional commits.

Examples:

```text
feat: add payout reconciliation
feat: add trip evidence graph
feat: add earnings agent
feat: add worker twin
feat: add investigation API

fix: handle missing payout evidence
fix: correct SLA calculation

refactor: extract evidence adapter

test: add earnings reconciliation fixtures

docs: document agent contracts
```

Keep commits small enough to understand.

---

# 51. Pull Request Convention

PR title:

```text
feat(scope): description
```

Example:

```text
feat(evidence): add trip reconstruction
```

PR description:

```text
## What
Adds trip reconstruction and evidence linking.

## Why
Required for the primary investigation workflow.

## Testing
- local fixture
- unit tests
- golden trip scenario

## Dependencies
Requires shared TripEvent contract.

## Screenshots
[if applicable]

## Known limitations
Uses synthetic GPS/traffic events.
```

---

# 52. Conflict Prevention Rules

## Never simultaneously modify the same feature files.

For example:

Person 1 should not edit:

```text
src/ai/earnings-agent.ts
```

while Person 2 independently rewrites the same file.

---

## Never independently redesign shared models.

If the `Trip` type needs to change:

1. announce it
2. discuss it
3. update the shared contract
4. update affected branches
5. merge contract change first where possible

---

## Never make frontend assumptions about backend responses.

Frontend uses the shared API types.

Backend implements those types.

---

# 53. Integration Order

Recommended merge sequence:

### 1. Skeleton

Everyone branches from it.

### 2. Shared domain contracts

Freeze models.

### 3. Backend/cloud foundation

API + persistence + auth.

### 4. Evidence engine

Core data logic.

### 5. AI

Agents consume evidence APIs.

### 6. Frontend

Frontend consumes stable APIs.

### 7. Integration

Connect the golden path.

### 8. Secondary features

Only after golden path works.

---

# 54. Local Development

The project should support a local/mock mode.

Example:

```text
npm run dev
npm run test
npm run lint
npm run build
```

Where backend/AI services are unavailable:

```text
MOCK_AWS=true
MOCK_AI=true
```

The application should still load with fixture data.

---

# 55. AWS Development

Production/demo mode:

```text
MOCK_AWS=false
MOCK_AI=false
```

AWS credentials must be supplied through the environment/IAM.

Never embed credentials in source code.

---

# 56. Error Handling

AI and cloud services will fail.

The UI must not simply crash.

Examples:

```text
AI unavailable
→ show retry + previous result

Document extraction failed
→ allow manual correction

Evidence missing
→ explicitly show missing evidence

Agent timeout
→ show investigation incomplete

AWS service unavailable
→ preserve local state where possible
```

---

# 57. Data Privacy

Kavach handles potentially sensitive worker data.

Principles:

* collect only what is necessary
* don't expose one worker's raw data to another
* use authorization for sensitive records
* use anonymized aggregation for collective insights
* never commit real personal data
* use synthetic data for the hackathon demo

---

# 58. Product Language

Use:

> Potential discrepancy

instead of:

> Illegal deduction

Use:

> Evidence suggests review is warranted

instead of:

> Platform violated the law

Use:

> AI assessment

instead of:

> Legal judgment

Use:

> Independent evidence

instead of:

> Truth

This keeps the system credible.

---

# 59. Future Architecture

The project should be designed so future capabilities can be added without rewriting the core.

Potential future features:

```text
Multiple platforms
Voice interaction
Regional languages
Collective intelligence
Insurance workflows
Safety intelligence
Benefits passport
Worker organizations
Platform transparency APIs
Mobile background telemetry
```

These are future extensions, not hackathon requirements.

---

# 60. Hackathon Priority Matrix

| Feature                  | Priority | Owner        |
| ------------------------ | -------- | ------------ |
| Shared domain model      | P0       | Team         |
| AWS skeleton             | P0       | Person 3     |
| Evidence ingestion       | P0       | Person 2     |
| Earnings reconciliation  | P0       | Person 2     |
| Trip reconstruction      | P0       | Person 2     |
| Bedrock                  | P0       | Person 1     |
| Strands                  | P0       | Person 1     |
| Earnings Agent           | P0       | Person 1     |
| Forensics Agent          | P0       | Person 1     |
| Dashboard                | P0       | Person 4     |
| Evidence Graph UI        | P0       | Person 4     |
| Investigation UI         | P0       | Person 4     |
| Evidence package         | P0       | Person 3 + 1 |
| Cognito                  | P1       | Person 3     |
| Cedar                    | P1       | Person 3     |
| Step Functions           | P1       | Person 3     |
| Policy Agent             | P1       | Person 1     |
| Worker Twin              | P1       | Person 1     |
| Counterfactual simulator | P1       | Person 2     |
| Deactivation Shield      | P2       | Person 1 + 2 |
| Voice                    | P2       | Person 1     |
| Collective intelligence  | P2       | Person 1 + 2 |
| Safety Agent             | P2       | Person 1     |
| Accident workflows       | P3       | Team         |

---

# 61. Final Success Criteria

Kavach is successful for the hackathon if a judge can understand this sequence within three minutes:

```text
A gig worker loses money
        ↓
The platform provides an explanation
        ↓
Kavach independently reconstructs what happened
        ↓
AI investigates the evidence
        ↓
Kavach identifies a potential discrepancy
        ↓
The worker sees exactly why
        ↓
The worker receives an actionable next step
```

And technically, the judge can see:

```text
Multimodal AI
      +
Agentic reasoning
      +
Evidence Graph
      +
Deterministic calculations
      +
Counterfactual simulation
      +
Policy retrieval
      +
AWS serverless architecture
      +
Fine-grained authorization
```

That is the target.

---

# 62. Final Product Definition

## Kavach AI

**AI-powered independent work intelligence for gig workers.**

### Core promise

> **Understand your work. Protect your earnings. Make better decisions.**

### Core loop

```text
UNDERSTAND
    ↓
RECONSTRUCT
    ↓
AUDIT
    ↓
PREDICT
    ↓
ACT
```

### Core technical abstraction

> **Worker Evidence Graph + AI Agent System + Deterministic Intelligence Engine**

### Primary demo

> **Explain a disputed delivery penalty using independent evidence, reconstruct the trip, identify the discrepancy, explain it with AI, and generate an actionable evidence package.**

Everything else is secondary to this flow.

---

# 63. Final Rule

When in doubt:

> **Make the core workflow better, not the feature list longer.**

A working feature that demonstrates real intelligence is worth more than five incomplete features.

The repository should always remain capable of demonstrating the primary Kavach flow from a clean checkout of `main`.