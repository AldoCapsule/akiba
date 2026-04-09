# PI-SPI Payment Flow Diagrams

## Overview

Akiba processes all deposits and withdrawals through the BCEAO PI-SPI (Plateforme d'Interoperabilite du Systeme de Paiement Instantane) gateway, which provides instant interoperable payments across mobile money providers (Wave, Orange Money, Free Money) and bank accounts within the WAEMU zone. All amounts are denominated in XOF (CFA Franc).

## Deposit Flow

When a user deposits funds from their mobile money wallet into their Akiba cash wallet:

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant API as Akiba API
    participant Redis as Redis Cache
    participant DB as PostgreSQL
    participant PISPI as PI-SPI Gateway
    participant MoMo as Mobile Money Provider<br/>(Wave / Orange Money)
    participant Queue as RabbitMQ

    User->>App: Tap "Deposit" + enter amount
    App->>API: POST /payments/deposits<br/>{amount: 50000, source: "wave", pin: "****"}

    Note over API: Validate JWT + verify PIN

    API->>Redis: CHECK idempotency key
    Redis-->>API: Key not found (new request)

    API->>DB: BEGIN TRANSACTION
    API->>DB: INSERT Transaction (status: pending)
    API->>DB: INSERT LedgerEntry (debit: pi_spi_clearing, credit: pending)
    API->>Redis: SET idempotency key (TTL: 24h)
    API->>DB: COMMIT

    API->>PISPI: POST /transfers/initiate<br/>{amount: 50000, currency: "XOF",<br/>debitParty: user_wave_id,<br/>creditParty: akiba_merchant_id}
    PISPI-->>API: {reference: "PISPI-xxxx", status: "pending"}

    API->>DB: UPDATE Transaction SET pi_spi_reference = "PISPI-xxxx"
    API-->>App: {transactionId, status: "pending",<br/>message: "Confirm on your Wave app"}
    App-->>User: "Check your Wave app to confirm"

    Note over PISPI,MoMo: PI-SPI routes to provider

    PISPI->>MoMo: Debit request
    MoMo-->>User: Push USSD / app prompt to confirm
    User->>MoMo: Confirms payment (enters PIN)
    MoMo-->>PISPI: Payment confirmed

    Note over PISPI,API: Async webhook callback

    PISPI->>API: POST /payments/webhook/pispi<br/>{reference: "PISPI-xxxx",<br/>status: "completed",<br/>signature: "hmac-sha256-xxx"}

    Note over API: Verify HMAC signature

    API->>Redis: CHECK idempotency (webhook ref)
    Redis-->>API: Not yet processed

    API->>DB: BEGIN TRANSACTION
    API->>DB: UPDATE Transaction SET status = completed
    API->>DB: UPDATE Wallet SET balance += 50000
    API->>DB: INSERT LedgerEntry (debit: pi_spi_clearing, credit: user_cash)
    API->>Redis: SET webhook processed (TTL: 48h)
    API->>DB: COMMIT

    API->>Queue: PUBLISH wallet.credited<br/>{userId, amount: 50000, walletType: "cash"}
    API-->>PISPI: HTTP 200 OK

    Queue-->>App: Push notification: "50,000 FCFA deposited"
    App-->>User: Balance updated + success notification

    Note over Queue: If auto-invest is configured
    Queue->>API: Trigger auto-invest flow
```

## Withdrawal Flow

When a user withdraws funds from their Akiba cash wallet to their mobile money account:

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant API as Akiba API
    participant Redis as Redis Cache
    participant DB as PostgreSQL
    participant PISPI as PI-SPI Gateway
    participant MoMo as Mobile Money Provider
    participant Queue as RabbitMQ

    User->>App: Tap "Withdraw" + enter amount + destination
    App->>API: POST /payments/withdrawals<br/>{amount: 25000, destination: "wave",<br/>destinationAccount: "+221XXXXXXX",<br/>pin: "****"}

    Note over API: Validate JWT + verify PIN

    API->>DB: SELECT balance FROM wallets WHERE user_id = ? AND wallet_type = 'cash'
    DB-->>API: balance: 50000

    Note over API: 50000 >= 25000 + fee (250) -- sufficient

    API->>Redis: CHECK idempotency key
    Redis-->>API: Key not found

    API->>DB: BEGIN TRANSACTION
    API->>DB: UPDATE Wallet SET balance -= 25250 (amount + fee)
    API->>DB: INSERT Transaction (status: processing, amount: 25000, fee: 250)
    API->>DB: INSERT LedgerEntry (debit: user_cash 25250)
    API->>DB: INSERT LedgerEntry (credit: pi_spi_clearing 25000)
    API->>DB: INSERT LedgerEntry (credit: platform_fees 250)
    API->>Redis: SET idempotency key (TTL: 24h)
    API->>DB: COMMIT

    API->>PISPI: POST /transfers/initiate<br/>{amount: 25000, currency: "XOF",<br/>debitParty: akiba_merchant_id,<br/>creditParty: user_wave_id}
    PISPI-->>API: {reference: "PISPI-yyyy", status: "processing"}

    API->>DB: UPDATE Transaction SET pi_spi_reference = "PISPI-yyyy"
    API-->>App: {transactionId, status: "processing"}
    App-->>User: "Withdrawal processing..."

    PISPI->>MoMo: Credit request
    MoMo-->>PISPI: Credit confirmed

    PISPI->>API: POST /payments/webhook/pispi<br/>{reference: "PISPI-yyyy",<br/>status: "completed"}

    Note over API: Verify HMAC signature

    API->>Redis: CHECK webhook processed
    Redis-->>API: Not yet processed

    API->>DB: BEGIN TRANSACTION
    API->>DB: UPDATE Transaction SET status = completed, completed_at = NOW()
    API->>DB: INSERT LedgerEntry (debit: pi_spi_clearing, credit: settled)
    API->>Redis: SET webhook processed (TTL: 48h)
    API->>DB: COMMIT

    API->>Queue: PUBLISH wallet.debited<br/>{userId, amount: 25000}
    API-->>PISPI: HTTP 200 OK

    Queue-->>App: Push notification: "25,000 FCFA sent to Wave"
    App-->>User: "Withdrawal complete"
```

## Webhook Handling with Idempotency

The webhook handler is designed to be safely retried by PI-SPI. Every webhook delivery is deduplicated using the PI-SPI reference as an idempotency key.

```mermaid
flowchart TD
    Start["Receive POST /payments/webhook/pispi"] --> VerifySig{"Verify HMAC-SHA256<br/>signature?"}

    VerifySig -->|"Invalid"| Reject["Return HTTP 401<br/>Log security event"]
    VerifySig -->|"Valid"| CheckIdempotency{"Check Redis:<br/>webhook already<br/>processed?"}

    CheckIdempotency -->|"Already processed"| Ack["Return HTTP 200 OK<br/>(safe duplicate)"]
    CheckIdempotency -->|"New webhook"| FindTx{"Find Transaction<br/>by PI-SPI reference?"}

    FindTx -->|"Not found"| Log404["Log unknown reference<br/>Return HTTP 200 OK"]
    FindTx -->|"Found"| CheckStatus{"Transaction current<br/>status?"}

    CheckStatus -->|"Already completed/failed"| Ack
    CheckStatus -->|"Pending / Processing"| ParseEvent{"Parse webhook<br/>event type"}

    ParseEvent -->|"status: completed"| ProcessSuccess["BEGIN TRANSACTION<br/>1. Update TX status = completed<br/>2. Credit/confirm wallet balance<br/>3. Insert ledger entries<br/>4. COMMIT<br/>5. SET Redis idempotency key"]
    ParseEvent -->|"status: failed"| ProcessFailure["BEGIN TRANSACTION<br/>1. Update TX status = failed<br/>2. Reverse wallet balance hold<br/>3. Insert reversal ledger entries<br/>4. COMMIT<br/>5. SET Redis idempotency key"]
    ParseEvent -->|"status: reversed"| ProcessReversal["BEGIN TRANSACTION<br/>1. Update TX status = reversed<br/>2. Reverse wallet balance<br/>3. Insert reversal ledger entries<br/>4. COMMIT<br/>5. SET Redis idempotency key"]

    ProcessSuccess --> PublishEvent["Publish to RabbitMQ<br/>(wallet.credited / wallet.debited)"]
    ProcessFailure --> PublishFailEvent["Publish to RabbitMQ<br/>(payment.failed)"]
    ProcessReversal --> PublishReversalEvent["Publish to RabbitMQ<br/>(payment.reversed)"]

    PublishEvent --> ReturnOK["Return HTTP 200 OK"]
    PublishFailEvent --> ReturnOK
    PublishReversalEvent --> ReturnOK

    ProcessSuccess -->|"DB error"| Retry["Return HTTP 500<br/>PI-SPI will retry"]
    ProcessFailure -->|"DB error"| Retry
    ProcessReversal -->|"DB error"| Retry

    classDef success fill:#00A86B,stroke:#008F5B,color:#fff
    classDef error fill:#E74C3C,stroke:#C0392B,color:#fff
    classDef neutral fill:#3498DB,stroke:#2980B9,color:#fff

    class ProcessSuccess,PublishEvent,ReturnOK,Ack success
    class Reject,ProcessFailure,ProcessReversal,Retry error
    class Start,CheckIdempotency,FindTx,CheckStatus,ParseEvent neutral
```

## PI-SPI Retry Policy

PI-SPI retries webhook delivery using exponential backoff when it does not receive an HTTP 200 response:

| Attempt | Delay | Cumulative Wait |
|---------|-------|-----------------|
| 1 | Immediate | 0s |
| 2 | 30 seconds | 30s |
| 3 | 2 minutes | 2m 30s |
| 4 | 10 minutes | 12m 30s |
| 5 | 1 hour | 1h 12m 30s |
| 6 | 4 hours | 5h 12m 30s |
| 7 (final) | 24 hours | 29h 12m 30s |

After all retries are exhausted, the transaction remains in `processing` status and requires manual reconciliation via the admin dashboard.

## Error Scenarios and Rollback

```mermaid
sequenceDiagram
    participant API as Akiba API
    participant DB as PostgreSQL
    participant PISPI as PI-SPI Gateway
    participant Queue as RabbitMQ

    Note over API,PISPI: Scenario 1: PI-SPI API call fails

    API->>PISPI: POST /transfers/initiate
    PISPI-->>API: HTTP 500 / timeout

    API->>DB: UPDATE Transaction SET status = failed
    API->>DB: Reverse balance hold (if withdrawal)
    API->>DB: INSERT reversal LedgerEntries
    API->>Queue: PUBLISH payment.failed {reason: "provider_error"}

    Note over API,PISPI: Scenario 2: User cancels on mobile money

    PISPI->>API: Webhook {status: "cancelled"}
    API->>DB: UPDATE Transaction SET status = failed
    API->>Queue: PUBLISH payment.failed {reason: "user_cancelled"}

    Note over API,PISPI: Scenario 3: Partial / delayed settlement

    PISPI->>API: Webhook {status: "completed"} (arrives late)

    Note over API: Same idempotent processing as normal flow

    API->>DB: UPDATE Transaction SET status = completed
    API->>DB: Credit wallet
    API->>Queue: PUBLISH wallet.credited

    Note over API,PISPI: Scenario 4: Duplicate webhook

    PISPI->>API: Webhook {reference: "PISPI-xxxx"} (retry)
    API->>API: Redis check: already processed
    API-->>PISPI: HTTP 200 OK (no-op)

    Note over API,PISPI: Scenario 5: Withdrawal sent but provider reverses

    PISPI->>API: Webhook {status: "reversed",<br/>reference: "PISPI-yyyy"}
    API->>DB: BEGIN TRANSACTION
    API->>DB: UPDATE Transaction SET status = reversed
    API->>DB: UPDATE Wallet SET balance += 25000 (refund)
    API->>DB: INSERT reversal LedgerEntries
    API->>DB: COMMIT
    API->>Queue: PUBLISH payment.reversed
    API->>Queue: PUBLISH notification.send<br/>{message: "Withdrawal reversed, funds returned"}
```

## Double-Entry Ledger Examples

Every financial operation produces balanced ledger entries. The `LedgerEntry` table ensures that debits always equal credits.

### Deposit (50,000 FCFA)

| Account | Debit | Credit |
|---------|-------|--------|
| `pi_spi_clearing` | 50,000 | |
| `user_cash:{userId}` | | 50,000 |

### Withdrawal (25,000 FCFA + 250 FCFA fee)

| Account | Debit | Credit |
|---------|-------|--------|
| `user_cash:{userId}` | 25,250 | |
| `pi_spi_clearing` | | 25,000 |
| `platform_fees` | | 250 |

### Investment Purchase (10,000 FCFA + 100 FCFA fee)

| Account | Debit | Credit |
|---------|-------|--------|
| `user_cash:{userId}` | 10,100 | |
| `user_investment:{portfolioId}` | | 10,000 |
| `platform_fees` | | 100 |

### Withdrawal Reversal (25,000 FCFA refund, fee waived)

| Account | Debit | Credit |
|---------|-------|--------|
| `pi_spi_clearing` | 25,000 | |
| `platform_fees` | 250 | |
| `user_cash:{userId}` | | 25,250 |
