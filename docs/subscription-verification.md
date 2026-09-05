# Authentication & Session Management

## 1. Authentication Modes

AudioFACTORY supports two primary user modes:

### A. Guest Users (Zero Friction)
- A persistent `guest_{timestamp}_{random}` identifier is generated in browser localStorage.
- Sent via the `x-guest-id` HTTP header on all API calls.
- Entitled to **3 daily generations**.
- Local project persistence in client cache.

### B. Authenticated Google Users (Firebase Auth)
- Signed in via Google OAuth popup (`signInWithPopup`).
- Sent via `x-user-id` and `Authorization: Bearer <uid>` headers.
- Entitled to **10 daily generations** on the free tier.
- Full cloud synchronization across devices via Firestore.

---

# Usage Accounting & Daily Quotas

## 1. Plan Configurations
- **Guest**: 3 daily generations (reset at 00:00 UTC)
- **Creator Free**: 10 daily generations
- **Pro Monthly (`audiofactory_pro_monthly`)**: Unlimited generations
- **Pro Annual (`audiofactory_pro_annual`)**: Unlimited generations + priority queue
- **Studio Lifetime (`audiofactory_lifetime`)**: Unlimited generations permanently

## 2. Midnight UTC Reset
Every usage record is keyed by UTC date string (`YYYY-MM-DD`). At 00:00:00 UTC, subsequent requests automatically initialize a new usage counter starting from 0.

---

# Subscription & Google Play Entitlement Verification

## 1. Product Identifiers
- `audiofactory_pro_monthly`
- `audiofactory_pro_annual`
- `audiofactory_lifetime`

## 2. Server-to-Server Verification Flow
1. Android client receives purchase token from Google Play Billing Client.
2. Client posts `{ productId, purchaseToken, packageName }` to `POST /api/billing/verify-play-purchase`.
3. Backend validates token against Google Play Developer API v3.
4. Backend assigns the entitlement and updates the user's plan state.
