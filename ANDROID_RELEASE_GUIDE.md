# 📱 AudioFACTORY Android & Google Play Billing Production Guide

This guide details the complete Android architecture, Google Play Billing integration, signed release build pipeline, and Google Play Console release configuration for **AudioFACTORY**.

---

## 1. Application Identity & Metadata

| Property | Value | Notes |
| :--- | :--- | :--- |
| **Application ID** | `com.audiofactory.app` | Defined in `android/app/build.gradle` & `capacitor.config.ts` |
| **App Name** | `AudioFACTORY` | Displayed on Android launcher and system dialogs |
| **Min SDK** | `22` (Android 5.1+) | Maximum device compatibility |
| **Target / Compile SDK** | `34` (Android 14) | Google Play requirement |
| **Version Name** | `1.0.0` | Production SemVer |
| **Version Code** | `1` | Increment for every Play Console release |

---

## 2. Google Play Monetization Products Configuration

In the [Google Play Console](https://play.google.com/console), navigate to **Monetize > Products**:

### Subscriptions

#### 1. Pro Monthly Subscription
* **Product ID:** `audiofactory_pro_monthly`
* **Name:** `AudioFACTORY Pro Monthly`
* **Description:** `Unlimited high-fidelity AI audio monologue & multi-speaker scene generation with instant priority synthesis.`
* **Base Plan:**
  * **Base Plan ID:** `monthly-standard`
  * **Type:** Auto-renewing
  * **Billing Period:** 1 Month
  * **Grace Period:** 16 Days
* **Benefits:** Unlimited generations, all 12+ Gemini/ElevenLabs personas, high-res WAV downloads.

#### 2. Pro Annual Subscription
* **Product ID:** `audiofactory_pro_annual`
* **Name:** `AudioFACTORY Pro Annual`
* **Description:** `Full unlimited AudioFACTORY studio access with annual discount savings.`
* **Base Plan:**
  * **Base Plan ID:** `annual-standard`
  * **Type:** Auto-renewing
  * **Billing Period:** 1 Year
  * **Grace Period:** 16 Days

---

### In-App Products (One-Time Purchase)

#### 3. Lifetime Studio Pass
* **Product ID:** `audiofactory_lifetime`
* **Name:** `AudioFACTORY Lifetime Studio Pass`
* **Description:** `Permanent lifetime access to AudioFACTORY with unlimited daily quota and lifetime cloud persistence.`
* **Type:** **In-app product (One-time purchase)** *(Do NOT configure as a recurring subscription)*
* **Consumption:** Non-consumable (managed product).

---

## 3. Server-Authoritative Architecture & Verification Flow

To eliminate client-side spoofing, **entitlements are never granted solely on client-side success reports**. The backend is the single source of truth.

```
┌─────────────────┐       ┌──────────────────────┐       ┌────────────────────────┐
│  Android Client │       │ Google Play Billing  │       │  AudioFACTORY Backend  │
│  (Capacitor UI) │       │      (Native)        │       │  (Express + Firebase)  │
└────────┬────────┘       └──────────┬───────────┘       └───────────┬────────────┘
         │                           │                               │
         │ 1. Tap "Upgrade Plan"     │                               │
         ├──────────────────────────►│                               │
         │                           │                               │
         │ 2. Complete payment sheet │                               │
         │◄──────────────────────────┤                               │
         │                           │                               │
         │ 3. PurchaseToken received │                               │
         │                           │                               │
         │ 4. POST /api/billing/verify-play-purchase                 │
         ├──────────────────────────────────────────────────────────►│
         │                           │                               │
         │                           │ 5. Google Play Developer API  │
         │                           │    purchases.subscriptions.get│
         │                           │◄──────────────────────────────┤
         │                           │    purchases.products.get     │
         │                           ├──────────────────────────────►│
         │                           │                               │
         │                           │ 6. Verify order validity      │
         │                           │ 7. Write entitlement to DB    │
         │                           │    users/{uid}/entitlements/current
         │                           │    users/{uid}/purchases/{id} │
         │                           │                               │
         │ 8. Return authoritative entitlement                       │
         │◄──────────────────────────────────────────────────────────┤
         │                                                           │
         │ 9. UI unlocks Pro Studio features instantly               │
         ▼                                                           ▼
```

### Firestore Database Schema

#### Entitlement Record (`users/{uid}/entitlements/current`)
```json
{
  "uid": "USER_FIREBASE_UID",
  "planId": "pro_monthly",
  "status": "active",
  "source": "google_play",
  "productId": "audiofactory_pro_monthly",
  "purchaseTokenHash": "3f8b89c4...",
  "startedAt": "2025-01-01T00:00:00.000Z",
  "expiresAt": "2025-02-01T00:00:00.000Z",
  "autoRenewing": true,
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

#### Purchase Ledger Record (`users/{uid}/purchases/{purchaseId}`)
```json
{
  "purchaseId": "GPA.3344-5566-7788-99000",
  "uid": "USER_FIREBASE_UID",
  "productId": "audiofactory_pro_monthly",
  "orderId": "GPA.3344-5566-7788-99000",
  "packageName": "com.audiofactory.app",
  "purchaseToken": "token_xxx...",
  "purchaseTime": 1735689600000,
  "verifiedAt": "2025-01-01T00:00:00.000Z",
  "status": "verified",
  "rawValidationResponse": { ... }
}
```

---

## 4. Google Play Developer API Credentials Setup

To verify real purchase tokens with Google Play Developer APIs:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) on the project linked to your Google Play Console account.
2. Enable **Google Play Android Developer API**.
3. Create a **Service Account** with the name `audiofactory-play-billing`.
4. Create and download a **Service Account Key (JSON)**.
5. In [Google Play Console > API access](https://play.google.com/console/u/0/developers/api-access), invite the service account email and grant permissions:
   * **View financial data, orders, and cancellation survey responses**
   * **Manage orders and subscriptions**
6. Set environment variables on your production backend / `.env`:
   ```env
   GOOGLE_PLAY_PACKAGE_NAME=com.audiofactory.app
   GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL=audiofactory-play-billing@your-project.iam.gserviceaccount.com
   GOOGLE_PLAY_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

---

## 5. Firebase Native Configuration

1. In the [Firebase Console](https://console.firebase.google.com/), add an **Android App**:
   * **Android package name:** `com.audiofactory.app`
   * **App nickname:** `AudioFACTORY Android`
   * **Debug signing certificate SHA-1:** (from your debug keystore)
   * **Release signing certificate SHA-1:** (from your release keystore)
2. Download `google-services.json`.
3. Place `google-services.json` inside:
   ```
   android/app/google-services.json
   ```

---

## 6. Release Builds & Signing Configuration

`android/app/build.gradle` is configured to automatically read signing credentials from environment variables without hard-coding secrets into version control.

### Keystore Generation

Run the keystore generation script on your build machine:
```bash
keytool -genkeypair \
    -v \
    -keystore android/keystores/audiofactory-release.jks \
    -alias audiofactory_release \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000
```

### Environment Variables for CI / Local Release Builds

```bash
export KEYSTORE_PATH="/path/to/android/keystores/audiofactory-release.jks"
export KEYSTORE_PASSWORD="YourKeystorePassword"
export KEY_ALIAS="audiofactory_release"
export KEY_PASSWORD="YourKeyPassword"
```

---

## 7. Build Commands

### 1. Build and Sync Web Assets
```bash
npm run build
npx cap sync android
```

### 2. Debug Build (Local Testing)
```bash
cd android
./gradlew assembleDebug
# APK generated at: android/app/build/outputs/apk/debug/app-debug.apk
```

### 3. Internal Testing Build (QA / Staging Track)
```bash
cd android
./gradlew bundleInternalTesting
# AAB generated at: android/app/build/outputs/bundle/internalTesting/app-internalTesting.aab
```

### 4. Signed Production Android App Bundle (.aab)
```bash
cd android
./gradlew bundleRelease
# Signed AAB generated at: android/app/build/outputs/bundle/release/app-release.aab
```

---

## 8. Deep Links & Android App Links

AudioFACTORY supports dual routing:

### Custom URL Scheme
* `audiofactory://billing` → Opens the Plan Upgrade & Quota Manager modal.
* `audiofactory://projects` → Opens Firebase Cloud Projects.
* `audiofactory://clone` → Opens Voice Cloning modal.
* `audiofactory://multispeaker` → Switches directly to Multi-Speaker Studio mode.

### Verified HTTPS Android App Links
Host verification is configured in `AndroidManifest.xml`:
* `https://audiofactory.app/billing`
* `https://audiofactory.app/projects`

To enable auto-verification (`android:autoVerify="true"`), host `.well-known/assetlinks.json` on your domain:
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.audiofactory.app",
      "sha256_cert_fingerprints": [
        "YOUR_RELEASE_KEYSTORE_SHA256_FINGERPRINT_HEX"
      ]
    }
  }
]
```

---

## 9. Launch Verification Checklist

- [x] Application ID configured as `com.audiofactory.app`
- [x] Launcher icons and dark studio splash screen generated in `android/app/src/main/res/`
- [x] Google Play Billing Client v6+ native bridge registered in `MainActivity.java`
- [x] `BILLING` and `INTERNET` permissions declared in `AndroidManifest.xml`
- [x] Product IDs (`audiofactory_pro_monthly`, `audiofactory_pro_annual`, `audiofactory_lifetime`) configured
- [x] Backend server token verification route `/api/billing/verify-play-purchase` implemented
- [x] Firestore security rules and persistence for `users/{uid}/entitlements/current` and `users/{uid}/purchases`
- [x] Dynamic release/internal/debug build signing in `android/app/build.gradle`
- [x] Deep links listener integrated with React UI state
