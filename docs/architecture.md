# Kavach AI — Architecture Overview

## 1. System Proposition
**Platforms have a record of what happens during gig work. Kavach gives the worker an independent understanding of what happened, what they earned, what went wrong, and what they can do about it.**

## 2. Core Architecture
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

## 3. Adapters & Isolation
To maintain parallel velocity across 4 developer feature branches, all integrations are guarded by interfaces:
* `AIService` (`MockAIService`, `BedrockAIService`)
* `EvidenceStore` (`LocalEvidenceStore`, `DynamoEvidenceStore`)
* `KavachApiClient` (`MockApiClient`, `HttpApiClient`)
* Deterministic calculation engine handles all math, durations, and currencies. The AI layer is reserved strictly for synthesis, reasoning, and document extraction.
