/**
@license
* SPDX-License-Identifier: Apache-2.0
* AudioFACTORY API Router with Strict Authoritative Authentication Middleware
*/
import { Router } from 'express';
import { verifyAuth } from './middleware/auth';
import {
  handleGenerateSpeech,
  handleGeminiTts,
  handleGenerateScript,
  handleGenerateDialogue,
  handleGenerateBgm,
  handleElevenLabsBgm,
  handleCloneVoice,
  handleGetVoices,
  handleElevenLabsVoices,
  handleElevenLabsTts,
  handleAnalyzeScript,
  handleDramatize,
  handleGetJobs,
} from './controllers/aiController';
import {
  handleGetPlans,
  handleGetEntitlement,
  handleGetPurchases,
  handleVerifyPlayPurchase,
  handleRestorePurchases,
  handleGooglePlayRtdnWebhook,
  handleSimulatePurchase,
} from './controllers/billingController';
import { handleAdminLogin } from './controllers/adminController';

export const apiRouter = Router();

// Admin Route
apiRouter.post('/admin/login', handleAdminLogin);

// Health check (Public)
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'AudioFACTORY Trusted Studio API',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    security: 'Server-Only AI Integrations & Firebase Admin Active',
  });
});

// Dependency Health Check (Public diagnostic)
apiRouter.get('/health/dependencies', (_req, res) => {
  res.json({
    status: 'ok',
    firebaseAdmin: 'initialized',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    elevenLabsConfigured: Boolean(process.env.ELEVENLABS_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Public Plans List
apiRouter.get('/billing/plans', handleGetPlans);

// Protected Billing & Entitlements (Requires Firebase ID Token)
apiRouter.get('/billing/entitlement', verifyAuth, handleGetEntitlement);
apiRouter.get('/billing/purchases', verifyAuth, handleGetPurchases);
apiRouter.post('/billing/verify-play-purchase', verifyAuth, handleVerifyPlayPurchase);
apiRouter.post('/billing/restore-purchases', verifyAuth, handleRestorePurchases);
apiRouter.post('/billing/webhook/google-play', handleGooglePlayRtdnWebhook);
apiRouter.post('/billing/google-play-rtdn', handleGooglePlayRtdnWebhook);
apiRouter.post('/billing/simulate-purchase', verifyAuth, handleSimulatePurchase);

// Protected Server-Side AI Endpoints (Requires Firebase ID Token & Quota Verification)
apiRouter.post('/ai/generate-speech', verifyAuth, handleGenerateSpeech);
apiRouter.post('/ai/tts-gemini', verifyAuth, handleGeminiTts);
apiRouter.post('/ai/generate-script', verifyAuth, handleGenerateScript);
apiRouter.post('/ai/generate-dialogue', verifyAuth, handleGenerateDialogue);
apiRouter.post('/ai/generate-bgm', verifyAuth, handleGenerateBgm);
apiRouter.post('/ai/clone-voice', verifyAuth, handleCloneVoice);
apiRouter.get('/ai/voices', verifyAuth, handleGetVoices);
apiRouter.post('/ai/analyze-script', verifyAuth, handleAnalyzeScript);
apiRouter.post('/ai/dramatize', verifyAuth, handleDramatize);

// Backward Compatibility Aliases for ElevenLabs endpoints
apiRouter.post('/ai/elevenlabs/tts', verifyAuth, handleElevenLabsTts);
apiRouter.get('/ai/elevenlabs/voices', verifyAuth, handleElevenLabsVoices);
apiRouter.post('/ai/elevenlabs/bgm', verifyAuth, handleElevenLabsBgm);

// Structured Generation Jobs
apiRouter.get('/ai/jobs', verifyAuth, handleGetJobs);
