/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY API Router
 */
import { Router } from 'express';
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

export const apiRouter = Router();

// Health check
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'AudioFACTORY Trusted Studio API',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    security: 'Server-Only AI Integrations Active',
  });
});

// Billing & Entitlements (Google Play & Cross-Platform Resolver)
apiRouter.get('/billing/plans', handleGetPlans);
apiRouter.get('/billing/entitlement', handleGetEntitlement);
apiRouter.get('/billing/purchases', handleGetPurchases);
apiRouter.post('/billing/verify-play-purchase', handleVerifyPlayPurchase);
apiRouter.post('/billing/restore-purchases', handleRestorePurchases);
apiRouter.post('/billing/webhook/google-play', handleGooglePlayRtdnWebhook);
apiRouter.post('/billing/google-play-rtdn', handleGooglePlayRtdnWebhook);
apiRouter.post('/billing/simulate-purchase', handleSimulatePurchase);

// Trusted Server-Side AI Endpoints (Never expose API keys to browser)
apiRouter.post('/ai/generate-speech', handleGenerateSpeech);
apiRouter.post('/ai/tts-gemini', handleGeminiTts);
apiRouter.post('/ai/generate-script', handleGenerateScript);
apiRouter.post('/ai/generate-dialogue', handleGenerateDialogue);
apiRouter.post('/ai/generate-bgm', handleGenerateBgm);
apiRouter.post('/ai/clone-voice', handleCloneVoice);
apiRouter.get('/ai/voices', handleGetVoices);
apiRouter.post('/ai/analyze-script', handleAnalyzeScript);
apiRouter.post('/ai/dramatize', handleDramatize);

// Backward Compatibility Aliases for ElevenLabs endpoints
apiRouter.post('/ai/elevenlabs/tts', handleElevenLabsTts);
apiRouter.get('/ai/elevenlabs/voices', handleElevenLabsVoices);
apiRouter.post('/ai/elevenlabs/bgm', handleElevenLabsBgm);

// Structured Generation Jobs
apiRouter.get('/ai/jobs', handleGetJobs);
