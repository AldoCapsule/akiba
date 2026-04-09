# Akiba API Reference

> Base URL: `http://localhost:4000/api/v1`
> Authentication: Bearer JWT token (unless marked Public)

---

## Health

| Method | Path | Description | Auth | KYC Tier |
|--------|------|-------------|------|----------|
| GET | `/health` | Health check with DB connectivity | Public | — |

## Authentication

| Method | Path | Description | Auth | KYC Tier |
|--------|------|-------------|------|----------|
| POST | `/auth/register` | Register with phone number | Public | — |
| POST | `/auth/verify-otp` | Verify SMS OTP code | Public | — |
| POST | `/auth/login` | Login with phone + PIN | Public | — |
| POST | `/auth/refresh` | Refresh access token | Refresh Token | — |
| POST | `/auth/set-pin` | Set or update 6-digit PIN | Bearer | Tier 0+ |
| POST | `/auth/request-otp` | Request new OTP | Public | — |

## Users

| Method | Path | Description | Auth | KYC Tier |
|--------|------|-------------|------|----------|
| GET | `/users/me` | Get current user profile | Bearer | Tier 0+ |
| PATCH | `/users/me` | Update profile (name, email, language, halal preference) | Bearer | Tier 0+ |
| POST | `/users/kyc/submit` | Submit KYC documents (ID photos, selfie) | Bearer | Tier 0+ |
| GET | `/users/kyc/status` | Get KYC verification status | Bearer | Tier 0+ |
| POST | `/users/risk-assessment` | Submit risk assessment questionnaire | Bearer | Tier 1+ |
| GET | `/users/risk-profile` | Get calculated risk profile | Bearer | Tier 1+ |

## Payments (PI-SPI)

| Method | Path | Description | Auth | KYC Tier |
|--------|------|-------------|------|----------|
| POST | `/payments/deposit` | Create deposit via PI-SPI payment request | Bearer | Tier 1+ |
| POST | `/payments/withdraw` | Create withdrawal to mobile wallet/bank | Bearer | Tier 1+ |
| GET | `/payments/transactions` | List transaction history (paginated, filterable) | Bearer | Tier 0+ |
| GET | `/payments/transactions/:id` | Get single transaction detail | Bearer | Tier 0+ |
| GET | `/payments/balance` | Get wallet balances (cash, investment, savings) | Bearer | Tier 0+ |
| POST | `/payments/webhooks/pispi` | PI-SPI webhook receiver (HMAC verified) | Webhook Secret | — |

## Portfolios

| Method | Path | Description | Auth | KYC Tier |
|--------|------|-------------|------|----------|
| POST | `/portfolios` | Create portfolio (robo-managed, self-directed, halal) | Bearer | Tier 1+ |
| GET | `/portfolios` | List user's portfolios | Bearer | Tier 1+ |
| GET | `/portfolios/:id` | Get portfolio detail with holdings | Bearer | Tier 1+ |
| DELETE | `/portfolios/:id` | Deactivate portfolio | Bearer | Tier 1+ |
| GET | `/portfolios/:id/performance` | Get portfolio performance over time | Bearer | Tier 1+ |
| GET | `/portfolios/:id/allocation` | Get current vs target allocation | Bearer | Tier 1+ |
| POST | `/portfolios/:id/rebalance` | Trigger portfolio rebalance | Bearer | Tier 2+ |

## Investments

| Method | Path | Description | Auth | KYC Tier |
|--------|------|-------------|------|----------|
| POST | `/investments/trade` | Execute buy/sell trade order | Bearer | Tier 1+ |
| GET | `/investments/trades` | List trade history | Bearer | Tier 1+ |
| GET | `/investments/trades/:id` | Get trade detail | Bearer | Tier 1+ |
| GET | `/investments/holdings` | Get all holdings across portfolios | Bearer | Tier 1+ |
| GET | `/investments/summary` | Get investment summary (total invested, returns, IRR) | Bearer | Tier 1+ |

## Savings Goals

| Method | Path | Description | Auth | KYC Tier |
|--------|------|-------------|------|----------|
| POST | `/savings/goals` | Create savings goal | Bearer | Tier 1+ |
| GET | `/savings/goals` | List savings goals | Bearer | Tier 0+ |
| GET | `/savings/goals/:id` | Get goal detail with progress | Bearer | Tier 0+ |
| PATCH | `/savings/goals/:id` | Update goal (name, target, date) | Bearer | Tier 1+ |
| DELETE | `/savings/goals/:id` | Deactivate goal | Bearer | Tier 1+ |
| POST | `/savings/goals/:id/contribute` | Contribute to goal from wallet | Bearer | Tier 1+ |
| POST | `/savings/goals/:id/withdraw` | Withdraw from goal to wallet | Bearer | Tier 1+ |
| POST | `/savings/recurring` | Set up recurring deposit | Bearer | Tier 1+ |
| GET | `/savings/recurring` | List recurring deposits | Bearer | Tier 1+ |
| DELETE | `/savings/recurring/:id` | Cancel recurring deposit | Bearer | Tier 1+ |
| GET | `/savings/vault` | Get savings vault summary (balance, yield) | Bearer | Tier 1+ |

## Markets

| Method | Path | Description | Auth | KYC Tier |
|--------|------|-------------|------|----------|
| GET | `/markets/assets` | List all assets (filterable by type, halal, risk) | Bearer | Tier 0+ |
| GET | `/markets/assets/:id` | Get asset detail | Bearer | Tier 0+ |
| GET | `/markets/assets/:id/price-history` | Get historical price data (OHLCV) | Bearer | Tier 0+ |
| GET | `/markets/search` | Search assets by name/ticker | Bearer | Tier 0+ |
| GET | `/markets/indices` | Get BRVM index values (BRVM Composite, BRVM 10) | Bearer | Tier 0+ |
| GET | `/markets/movers` | Get top gainers and losers | Bearer | Tier 0+ |

## Education

| Method | Path | Description | Auth | KYC Tier |
|--------|------|-------------|------|----------|
| GET | `/education/paths` | List learning paths | Bearer | Tier 0+ |
| GET | `/education/paths/:id` | Get learning path with lessons | Bearer | Tier 0+ |
| GET | `/education/lessons/:id` | Get lesson content | Bearer | Tier 0+ |
| POST | `/education/lessons/:id/complete` | Mark lesson complete + submit quiz | Bearer | Tier 0+ |
| GET | `/education/progress` | Get user's learning progress, XP, level | Bearer | Tier 0+ |
| GET | `/education/badges` | Get earned badges | Bearer | Tier 0+ |
| GET | `/education/leaderboard` | Get learning leaderboard (opt-in) | Bearer | Tier 0+ |

## Notifications

| Method | Path | Description | Auth | KYC Tier |
|--------|------|-------------|------|----------|
| GET | `/notifications` | List notifications (paginated) | Bearer | Tier 0+ |
| PATCH | `/notifications/:id/read` | Mark notification as read | Bearer | Tier 0+ |
| PATCH | `/notifications/read-all` | Mark all as read | Bearer | Tier 0+ |
| GET | `/notifications/unread-count` | Get unread notification count | Bearer | Tier 0+ |
| POST | `/notifications/device-token` | Register push notification device token | Bearer | Tier 0+ |

## Compliance

| Method | Path | Description | Auth | KYC Tier |
|--------|------|-------------|------|----------|
| GET | `/compliance/alerts` | List AML alerts (admin only) | Admin Bearer | — |
| GET | `/compliance/alerts/:id` | Get alert detail | Admin Bearer | — |
| PATCH | `/compliance/alerts/:id` | Update alert status (investigate, resolve, escalate) | Admin Bearer | — |
| POST | `/compliance/screen` | Screen user against sanctions lists | Admin Bearer | — |
| GET | `/compliance/audit-logs` | Query audit logs (filterable) | Admin Bearer | — |

## Admin

| Method | Path | Description | Auth | KYC Tier |
|--------|------|-------------|------|----------|
| POST | `/admin/login` | Admin login (email + password) | Public | — |
| GET | `/admin/users` | List users with search/filter | Admin Bearer | — |
| GET | `/admin/users/:id` | Get user detail (full admin view) | Admin Bearer | — |
| PATCH | `/admin/users/:id` | Update user (KYC tier, status, suspend) | Admin Bearer | — |
| GET | `/admin/kyc/queue` | Get pending KYC submissions | Admin Bearer | — |
| POST | `/admin/kyc/:id/approve` | Approve KYC submission | Admin Bearer | — |
| POST | `/admin/kyc/:id/reject` | Reject KYC submission with reason | Admin Bearer | — |
| GET | `/admin/dashboard` | Dashboard metrics (users, AUM, volume) | Admin Bearer | — |
| GET | `/admin/reports/transactions` | Transaction volume report | Admin Bearer | — |
| GET | `/admin/reports/users` | User growth report | Admin Bearer | — |
| GET | `/admin/reports/aum` | Assets under management report | Admin Bearer | — |

---

## Common Query Parameters

| Parameter | Type | Description | Used On |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | All list endpoints |
| `limit` | number | Items per page (default: 20, max: 100) | All list endpoints |
| `sort` | string | Sort field (e.g., `created_at`, `amount`) | All list endpoints |
| `order` | string | Sort direction: `asc` or `desc` | All list endpoints |
| `search` | string | Full-text search query | Users, assets, transactions |
| `status` | string | Filter by status | Transactions, KYC, alerts |
| `type` | string | Filter by type | Transactions, assets, goals |
| `from` | ISO date | Start date filter | Transactions, reports |
| `to` | ISO date | End date filter | Transactions, reports |

## Response Format

All endpoints return:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_KYC_TIER",
    "message": "This action requires KYC Tier 1. Please verify your identity.",
    "details": { "requiredTier": "tier_1", "currentTier": "tier_0" }
  }
}
```
