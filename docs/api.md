# Kavach AI — API Contract Specification

Based strictly on Section 27 of `plan.md`.

## Endpoints

### 1. Worker Profile
* `GET /api/workers/{id}`
  - Returns worker profile object (`Worker`).

### 2. Trips & Reconstruction
* `GET /api/workers/{workerId}/trips`
  - Returns list of trips for worker (`Trip[]`).
* `GET /api/trips/{id}`
  - Returns trip details by ID (`Trip`).

### 3. Earnings & Expenses
* `GET /api/earnings/{workerId}`
  - Returns reconciliation summary:
  ```json
  {
    "records": [...],
    "expenses": [...],
    "grossTotal": 8460,
    "netRealTotal": 5070
  }
  ```

### 4. Investigations
* `POST /api/investigations`
  - Body: `{ "tripId": "string" }`
  - Returns: `AIInvestigationResult` (structured findings, missing evidence, contradictions, recommended actions).

### 5. Cases & Dispute Packages
* `GET /api/cases`
  - Returns list of active cases (`Case[]`).
* `GET /api/cases/{id}`
  - Returns single case detail (`Case`).
* `POST /api/cases/{id}/generate-package`
  - Assembles evidence graph into structured dispute artifact.
  - Returns: `{ "packageUri": "s3://...", "generatedAt": "..." }`

### 6. Worker Digital Twin
* `POST /api/worker-twin/query`
  - Body: `{ "workerId": "string", "query": "string" }`
  - Returns: `WorkerTwinResponse` (projected earnings, optimal hours, observed factors).
