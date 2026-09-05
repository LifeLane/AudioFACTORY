# Android Packaging & Capacitor Integration

## 1. Prerequisites
- Node.js 20+
- Java JDK 17
- Android Studio Flamingo+ with SDK 34

## 2. Build Commands

```bash
# 1. Build production web assets
npm run build

# 2. Sync web assets into native Android project
npx cap sync android

# 3. Open project in Android Studio
npx cap open android

# 4. Generate release APK / AAB
cd android && ./gradlew assembleRelease
```

## 3. Native Permissions
- `android.permission.RECORD_AUDIO`: Voice cloning & sample capture
- `android.permission.INTERNET`: Server-side synthesis
- `com.android.vending.BILLING`: Google Play In-App Billing

---

# Production Deployment Manual

## 1. Cloud Run / Container Deployment

```dockerfile
# Build image
docker build -t gcr.io/your-project/audiofactory:latest .

# Deploy on Cloud Run (Port 3000)
gcloud run deploy audiofactory \
  --image gcr.io/your-project/audiofactory:latest \
  --port 3000 \
  --set-env-vars GEMINI_API_KEY="...",ELEVENLABS_API_KEY="..."
```

## 2. Environment Variables Checklist
- `GEMINI_API_KEY`: Server-side Gemini 2.5 Flash API Key
- `ELEVENLABS_API_KEY`: Server-side ElevenLabs Voice API Key
- `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY`: Google Play Developer service JSON
- `FIREBASE_PROJECT_ID`: Target Firebase Firestore project
