# Kavach AI — Data Model Specification

Refer to `src/domain/index.ts` for authoritative TypeScript types.

## Core Entities
1. **Worker**: Identification and active platforms (`QuickBite`, `FlashDrop`).
2. **Trip**: Dispatch metadata, store IDs, timestamps, SLA targets, and status.
3. **TripEvent**: Granular timeline milestones (`STORE_ARRIVAL`, `PACKAGE_RECEIVED`, `TRAFFIC_EVENT`, `DELIVERY_COMPLETED`).
4. **EarningsRecord**: Base pay, incentives, deductions, and disputed penalties.
5. **Expense**: Fuel, maintenance, and mobile data operational costs.
6. **Evidence**: Atomic proof points (screenshots, GPS telemetry, timestamps, calculation outputs).
7. **Finding**: Audited conclusions linking directly to `evidenceIds` with confidence ratings.
8. **Case**: Higher-level dispute or review bundle tracking progress from `DRAFT` to `RESOLVED`.
