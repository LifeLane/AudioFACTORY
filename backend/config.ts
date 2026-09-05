/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Backend Server Configuration
 */

export const config = {
  port: 3000,
  host: '0.0.0.0',
  isProduction: process.env.NODE_ENV === 'production',
  
  // AI Keys - Loaded strictly in server environment, never sent to browser
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '',
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  
  // Google Play Billing Credentials
  googlePlayServiceAccountKey: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY || '',
  googlePlayPackageName: 'com.audiofactory.app',
  
  // Firebase Configuration
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'ai-studio-socialnot-845fd311-8b26-4908-9a36-b5f4f288bed7',
};

export function getGeminiKey(): string {
  const key = config.geminiApiKey;
  if (!key) {
    console.warn('[SERVER] Warning: GEMINI_API_KEY is not configured on server.');
  }
  return key;
}

export function getElevenLabsKey(): string {
  const key = config.elevenLabsApiKey;
  if (!key) {
    console.warn('[SERVER] Warning: ELEVENLABS_API_KEY is not configured on server.');
  }
  return key;
}

export function getGroqKey(): string {
  const key = config.groqApiKey;
  if (!key) {
    console.warn('[SERVER] Warning: GROQ_API_KEY is not configured on server.');
  }
  return key;
}
