# 🛡️ AudioFACTORY Firestore Security Specification & Invariant Model

## 1. Data Invariants & Zero-Trust Threat Model

AudioFACTORY strictly separates client-manageable user assets (Projects, Monologues, Profile) from server-authoritative billing, quota, and AI execution resources (Usage, Entitlements, Purchases, Generation Jobs).

### Core Invariants
1. **Identity & Ownership Invariant**: A client may only ever read, create, update, or delete documents within their own `/users/{uid}/` document path hierarchy where `request.auth.uid == uid`. Cross-user access is unconditionally denied.
2. **UID Spoofing Prevention**: For every client-writable collection (`projects`, `monologues`, `profile`), the document's `userId` field must match `request.auth.uid` on creation and cannot be mutated during updates (`incoming().userId == existing().userId`).
3. **Immutable Provenance (`createdAt`)**: `createdAt` cannot be modified after initial creation (`incoming().createdAt == existing().createdAt`).
4. **Server-Authoritative Barrier**: All writes to `usage`, `entitlements`, `purchases`, and `generationJobs` are denied to client SDKs (`allow write: if false`). Only trusted backend processes using Admin SDK / privileged server credentials may mutate these documents.
5. **Privilege Escalation Guard**: Client profile writes are strictly whitelist-bounded to prevent injecting `role`, `isAdmin`, `plan`, `quota`, or billing keys.
6. **Volumetric & DoW (Denial-of-Wallet) Guard**: String lengths, list bounds, and schema fields are strictly checked (e.g., max 200 project characters, max 8,000 monologue characters, max 20 speakers, max 200 lines). Document IDs must match strict alphanumeric patterns `^[a-zA-Z0-9_\-]+$` with max 128 characters.
7. **Global Default Deny**: The fallback root `/{document=**}` denies all read/write operations by default.

---

## 2. The "Dirty Dozen" Adversarial Payloads

The following 12 attack payloads represent malicious attempts to bypass security, manipulate quotas, spoof plans, and escalate privileges. Every payload MUST return `PERMISSION_DENIED`.

| # | Attack Scenario | Target Collection / Path | Malicious Payload / Operation | Expected Security Result |
|---|-----------------|--------------------------|-------------------------------|--------------------------|
| 1 | **UID Spoofing on Project Create** | `/users/user_alice/projects/p1` | `{ userId: 'user_bob', title: 'Stolen Project', ... }` (Auth: `user_alice`) | **PERMISSION_DENIED** (Payload UID mismatch) |
| 2 | **Cross-User Project Hijack** | `/users/user_victim/projects/p1` | Any Read/Write from `user_attacker` | **PERMISSION_DENIED** (Auth UID != Path UID) |
| 3 | **Ownership Transfer on Update** | `/users/user_alice/projects/p1` | Update `{ userId: 'user_bob' }` | **PERMISSION_DENIED** (userId immutability violation) |
| 4 | **CreatedAt Tampering** | `/users/user_alice/projects/p1` | Update `{ createdAt: '2020-01-01T00:00:00Z' }` | **PERMISSION_DENIED** (createdAt immutability violation) |
| 5 | **Privilege Escalation in Profile** | `/users/user_alice/profile/main` | `{ userId: 'user_alice', role: 'admin', isAdmin: true, plan: 'lifetime' }` | **PERMISSION_DENIED** (Shadow/disallowed keys) |
| 6 | **Oversized String / DoW Attack** | `/users/user_alice/projects/p1` | `{ title: 'A'.repeat(5000), userId: 'user_alice', ... }` | **PERMISSION_DENIED** (Title exceeds 200 chars) |
| 7 | **Massive Array Injection** | `/users/user_alice/projects/p1` | `{ speakers: Array(500).fill({...}), userId: 'user_alice', ... }` | **PERMISSION_DENIED** (Speakers exceeds 20 elements) |
| 8 | **Monologue Script Overflow** | `/users/user_alice/monologues/m1` | `{ text: 'X'.repeat(50000), userId: 'user_alice', ... }` | **PERMISSION_DENIED** (Text exceeds 8000 chars) |
| 9 | **Direct Client Quota Reset** | `/users/user_alice/usage/2026-09-05` | `setDoc({ generationCount: 0, planId: 'pro' })` | **PERMISSION_DENIED** (Client write denied) |
| 10| **Plan Entitlement Self-Grant** | `/users/user_alice/entitlements/current` | `setDoc({ planId: 'lifetime', status: 'active' })` | **PERMISSION_DENIED** (Client write denied) |
| 11| **Fake Purchase Injection** | `/users/user_alice/purchases/fake_order` | `setDoc({ productId: 'lifetime_access', status: 'active' })` | **PERMISSION_DENIED** (Client write denied) |
| 12| **Bypassing Generation Job API** | `/users/user_alice/generationJobs/job_999` | `setDoc({ type: 'voice_clone', status: 'completed' })` | **PERMISSION_DENIED** (Client write denied) |

---

## 3. Red Team Evaluation Matrix

| Vector | Project Rules | Monologue Rules | Profile Rules | Server Collections (`usage`, `entitlements`, `purchases`, `jobs`) |
| :--- | :--- | :--- | :--- | :--- |
| **UID Spoofing** | Blocked via `incoming().userId == request.auth.uid` | Blocked via `incoming().userId == request.auth.uid` | Blocked via `incoming().userId == request.auth.uid` | Blocked (No client writes) |
| **Ownership Mutation** | Blocked via `incoming().userId == existing().userId` | Blocked via `incoming().userId == existing().userId` | Blocked via `incoming().userId == existing().userId` | Blocked (No client writes) |
| **Timestamp Alteration** | Blocked via `incoming().createdAt == existing().createdAt` | Blocked via `incoming().createdAt == existing().createdAt` | Blocked via `incoming().createdAt == existing().createdAt` | Blocked (No client writes) |
| **ID Injection / Path Poisoning** | Guarded via `isValidId()` regex + size bounds | Guarded via `isValidId()` regex + size bounds | Guarded via `isValidId()` regex + size bounds | Guarded via `isValidId()` regex + size bounds |
| **Ghost Key / Shadow Fields** | Disallowed keys explicitly prevented | Disallowed keys explicitly prevented | Whitelist enforced via key restrictions | Blocked (No client writes) |
| **Unauthenticated Snooping** | Blocked via `isSignedIn()` | Blocked via `isSignedIn()` | Blocked via `isSignedIn()` | Blocked via `isSignedIn()` + owner match |
