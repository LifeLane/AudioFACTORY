# AudioFACTORY System Architecture

## 1. High-Level Topology

AudioFACTORY is a secure, full-stack, enterprise-grade AI audio and multi-speaker speech production suite. It employs a server-authoritative proxy model to isolate all AI model API credentials and enforce daily generation quotas.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Client Layer (Web / Android)                          │
│                                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────────┐  │
│  │ Bauhaus / Modern UI  │  │ G-TERM Tactical OLED │  │ Android (Native)  │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └─────────┬─────────┘  │
│             └─────────────────────────┼────────────────────────┘             │
│                                       ▼                                     │
│                     Zustand Store & Entitlement Resolver                    │
│                          (getCurrentEntitlement)                            │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │ HTTP / REST (/api/*)
                                        │ Headers: x-guest-id | x-user-id | Bearer
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Backend Server Layer (Express + Node)                    │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Auth & Quota Controller (Atomic increments, UTC midnight reset)       │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────┴───────────────────────────────────┐  │
│  │ AI Service Proxies (Zero browser secret leakage)                      │  │
│  │  - Gemini 2.5 Flash Speech & Script Analysis                          │  │
│  │  - ElevenLabs Neural TTS, Voice Cloning & BGM Synthesis               │  │
│  │  - Google Play Developer API v3 Purchase Verification                 │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                ▼                      ▼                      ▼
    ┌──────────────────────┐ ┌──────────────────┐  ┌──────────────────┐
    │ Google Gemini API    │ │ ElevenLabs API   │  │ Firebase Cloud   │
    │ (24kHz PCM / Flash)  │ │ (Voice Models)   │  │ Firestore & Auth │
    └──────────────────────┘ └──────────────────┘  └──────────────────┘
```

## 2. Directory Structure

```
├── app/               # Application logic & UI
├── backend/           # Server controllers, quota store, Play verifier
│   ├── config.ts
│   ├── quotaStore.ts
│   ├── googlePlayVerifier.ts
│   ├── routes.ts
│   └── controllers/
│       ├── aiController.ts
│       └── billingController.ts
├── android/           # Native Android Capacitor packaging
├── website/           # Dedicated marketing landing site
├── firebase/          # Firestore rules, security schemas, blueprint
├── docs/              # Architectural & operational manuals
└── .github/workflows/ # CI/CD workflows
```
