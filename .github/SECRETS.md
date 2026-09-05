# 🔐 AudioFACTORY GitHub Secrets & CI/CD Configuration

This document specifies every GitHub Actions Secret required for automated testing, web deployment, Firebase rule propagation, and signed Android Google Play releases.

---

## 📋 Required GitHub Repository Secrets

Configure these in **GitHub Repository > Settings > Secrets and variables > Actions > New repository secret**.

| Secret Name | Required By | Description / Format | Example / Format Notes |
| :--- | :--- | :--- | :--- |
| `ANDROID_KEYSTORE` | Android Build & Release | Base64-encoded binary string of `audiofactory-release.jks` | Output of `base64 -w 0 audiofactory-release.jks` |
| `ANDROID_KEYSTORE_PASSWORD` | Android Build & Release | Password for the release keystore | Plaintext password string |
| `ANDROID_KEY_ALIAS` | Android Build & Release | Alias name used when generating the keypair | e.g. `audiofactory_release` |
| `ANDROID_KEY_PASSWORD` | Android Build & Release | Password protecting the key alias | Plaintext password string |
| `GOOGLE_PLAY_SERVICE_ACCOUNT` | Android Release Pipeline | Complete Google Play Developer API Service Account JSON key | Full JSON string containing `client_email`, `private_key`, etc. |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Deploy & Cloud Run | Google Cloud / Firebase Service Account JSON key with Firestore Admin & Functions Deployer roles | Full JSON string with service account credentials |
| `GEMINI_API_KEY` | Web Build / Server CI | Production Google Gemini 2.5 Flash API Key | `AIzaSy...` |
| `ELEVENLABS_API_KEY` | Web Build / Server CI | ElevenLabs Text-to-Speech API Key | `sk_...` |
| `STRIPE_SECRET_KEY` | Web Server (Production) | Stripe Secret Key for direct web checkout | `sk_live_...` or `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Web Server (Production) | Stripe Webhook Signing Secret | `whsec_...` |

---

## 🛠️ Step-by-Step Secret Generation Guide

### 1. Android Release Keystore (`ANDROID_KEYSTORE`)

1. Generate your production release keystore locally (or use `./scripts/generate-release-keystore.sh`):
   ```bash
   keytool -genkeypair \
       -v \
       -keystore audiofactory-release.jks \
       -alias audiofactory_release \
       -keyalg RSA \
       -keysize 2048 \
       -validity 10000 \
       -storepass "YourStrongKeystorePassword" \
       -keypass "YourStrongKeyPassword" \
       -dname "CN=AudioFACTORY Release, OU=Audio Production, O=AudioFACTORY Inc, L=Mountain View, ST=California, C=US"
   ```
2. Convert the `.jks` file into a single-line Base64 string:
   ```bash
   # macOS / Linux
   base64 -i audiofactory-release.jks -o keystore_base64.txt || base64 -w 0 audiofactory-release.jks > keystore_base64.txt
   ```
3. Copy the entire contents of `keystore_base64.txt` and save as `ANDROID_KEYSTORE` in GitHub Secrets.
4. Add `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD` with the respective credentials.

---

### 2. Google Play Developer API Service Account (`GOOGLE_PLAY_SERVICE_ACCOUNT`)

1. Open the [Google Cloud Console](https://console.cloud.google.com/) on the project linked to your Google Play Console.
2. Enable **Google Play Android Developer API**.
3. Create a Service Account: `audiofactory-play-billing@<project>.iam.gserviceaccount.com`.
4. Create a **JSON Key** and download it.
5. In [Google Play Console > API access](https://play.google.com/console/u/0/developers/api-access), link the service account and grant permissions:
   * **Releases > Manage internal testing tracks**
   * **Financial > View financial data and manage orders**
6. Copy the raw JSON file contents and paste into `GOOGLE_PLAY_SERVICE_ACCOUNT` in GitHub Secrets.

---

### 3. Firebase / GCP Service Account (`FIREBASE_SERVICE_ACCOUNT`)

1. In the [Google Cloud Console](https://console.cloud.google.com/), navigate to **IAM & Admin > Service Accounts**.
2. Select your Firebase project.
3. Assign roles:
   * **Cloud Datastore User / Cloud Datastore Owner** (for Firestore rules & indexes)
   * **Firebase Admin SDK Administrator Service Agent**
4. Generate a **JSON Key** and paste its content into `FIREBASE_SERVICE_ACCOUNT` in GitHub Secrets.

---

## 🚫 Critical Security Policies

1. **NEVER** commit keystore files (`*.jks`, `*.keystore`) to the Git repository.
2. **NEVER** commit raw Service Account JSON files (`service-account*.json`) to version control.
3. **NEVER** hardcode production API keys into client code or pull requests.
4. Keystores and temporary credentials unpacked during CI runs are automatically wiped in the `always()` post-step cleanup blocks.
