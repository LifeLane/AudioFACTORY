# 🚀 AudioFACTORY CI/CD & GitHub Actions Production Guide

This guide details the complete continuous integration and deployment architecture for AudioFACTORY, covering Web, Firebase, and Android Google Play release pipelines.

---

## 📂 Workflow Matrix

| Workflow File | Purpose | Triggers | Target Output / Action |
| :--- | :--- | :--- | :--- |
| `.github/workflows/ci.yml` | Quality & Verification | Push / PR on `main`, `master`, `develop` | Lint, typecheck, unit tests, full-stack build & security scans |
| `.github/workflows/web-deploy.yml` | Production Web Deploy | Push to `main`, manual dispatch | Builds client + server and triggers Cloud Run / Container deployment |
| `.github/workflows/firebase-deploy.yml` | Firebase Rules & Indexes | Rule / index file changes, manual dispatch | Deploys `firestore.rules` and `firestore.indexes.json` |
| `.github/workflows/android-build.yml` | Android Build & Artifacts | Push / PR on `main`, manual dispatch | Builds Debug/Release APK and Release AAB; uploads artifacts |
| `.github/workflows/android-release.yml` | Google Play Store Release | Push on version tag (`v*`), manual dispatch | Builds signed AAB, authenticates, uploads to **Google Play Internal Testing** |

---

## 🔒 Required GitHub Repository Secrets

Configure the following secrets in **GitHub > Repository Settings > Secrets and variables > Actions**:

| Secret Name | Required By | Description |
| :--- | :--- | :--- |
| `ANDROID_KEYSTORE` | Android Build & Release | Base64-encoded `audiofactory-release.jks` binary |
| `ANDROID_KEYSTORE_PASSWORD` | Android Build & Release | Password for the release keystore |
| `ANDROID_KEY_ALIAS` | Android Build & Release | Alias name used when creating keystore (`audiofactory_release`) |
| `ANDROID_KEY_PASSWORD` | Android Build & Release | Password protecting key alias |
| `GOOGLE_PLAY_SERVICE_ACCOUNT` | Android Release | Google Play Developer API Service Account JSON key string |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Deploy & Cloud Run | Google Cloud Service Account JSON key with Firestore deployment roles |
| `GEMINI_API_KEY` | Web Build & CI | Google Gemini 2.5 Flash API Key |
| `ELEVENLABS_API_KEY` | Web Build & CI | ElevenLabs Text-to-Speech API Key |
| `STRIPE_SECRET_KEY` | Web Production Server | Stripe Secret API Key |
| `STRIPE_WEBHOOK_SECRET` | Web Production Server | Stripe Webhook Secret |

---

## 🧪 CI Verification (`ci.yml`)

The CI workflow executes on every commit and PR:
1. **TypeScript Verification:** `npm run lint` (`tsc --noEmit`)
2. **Deterministic Tests:** `npm test` running unit test suites
3. **Full-Stack Build:** Compiles Vite frontend SPA and bundles Express Node.js server to `dist/server.cjs`
4. **Artifact Integrity:** Asserts existence of `dist/index.html` and `dist/server.cjs`
5. **Secret Leak Prevention:** Audits Git index to prevent accidental tracking of `.jks`, `.keystore`, `.env`, or service account files
6. **NPM Security Audit:** Scans for known high/critical CVEs

---

## 🤖 Android Google Play Release Workflow (`android-release.yml`)

When a new version tag is pushed (e.g. `git tag v1.0.0 && git push origin v1.0.0`):
1. Node dependencies and Web assets are compiled cleanly.
2. Capacitor syncs the Android native platform (`npx cap sync android`).
3. The keystore is decoded in-memory and used to sign the Android App Bundle (`./gradlew bundleRelease`).
4. The temporary keystore is securely erased in the `always()` post-step.
5. The signed AAB is uploaded directly to the **Google Play Store Internal Testing track**.
6. A GitHub Release is drafted with the signed AAB attached as an asset.

> **Safety Notice:** Per AudioFACTORY release policy, builds uploaded to Google Play are placed strictly in the **Internal Testing track** for QA sign-off. Releases are never automatically promoted to public production without explicit manual promotion in the Google Play Console.
