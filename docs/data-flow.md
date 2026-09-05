# AudioFACTORY Data Flow Trace

## 1. Synthesis Pipeline Execution

```
[User Action in UI]
       │
       ▼
[Client Pre-Check: canGenerate(entitlement)]
       │  (UX helper; prevents unnecessary round-trips if quota is 0)
       ▼
[POST /api/ai/tts-gemini]
       │  Headers: { x-user-id / x-guest-id, Authorization }
       │  Body: { text, voiceName, styleInstruction }
       ▼
[Backend Quota Enforcement]
       ├── Check user plan in memory/Firestore
       ├── Check daily usage counter for UTC date (YYYY-MM-DD)
       ├── If usage >= dailyLimit: return HTTP 429 QUOTA_EXCEEDED
       └── Else: Atomically increment generationCount and proceed
       ▼
[Backend Gemini SDK Call]
       │  Invokes @google/genai with server-side GEMINI_API_KEY
       │  Configures multiSpeakerVoiceConfig & Modality.AUDIO
       ▼
[Gemini Audio Response]
       │  Returns raw PCM base64 encoded audio
       ▼
[JSON Payload Delivery to Client]
       │  Payload: { success: true, audioBase64, sampleRate: 24000, quotaRemaining }
       ▼
[Client-Side Web Audio Decoding]
       │  Converts base64 -> Uint8Array -> Int16Array -> AudioBuffer
       │  Updates Zustand store quota state
       ▼
[Audio Playback & Waveform Rendering]
```
