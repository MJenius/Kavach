# Kavach AI — Demo Golden Path

## Scenario: Vikram's Disputed Late-Delivery Penalty (₹350)

### 1. The Context
* Worker: Vikram Sharma (`worker-vikram-01`)
* Date: 2026-09-15 19:00 IST
* Platform: QuickBite
* Issue: ₹350 penalty deducted from payout for order delivery delayed beyond 10-minute SLA.

### 2. Independent Evidence Reconstruction
* **19:00**: Order accepted by Vikram.
* **19:02**: Vikram arrives at merchant (`store-koramangala-4b`). GPS verified.
* **19:02–19:09**: Vikram waits for 7 minutes in kitchen queue.
* **19:09**: Merchant hands over package. Barcode scanned.
* **19:16**: Unexpected traffic obstruction on 80ft Road Koramangala (6 min delay).
* **19:24**: Customer delivery completed with verified OTP.

### 3. Kavach Analysis
* Total SLA allocated: 10 minutes (600s).
* Uncompensated store wait: 7 minutes (420s).
* Remaining transit SLA: 3 minutes (180s) for 3.2km — mathematically unfeasible.
* Result: Penalty warrants review under Section 4.2.1 of Partner Agreement.
