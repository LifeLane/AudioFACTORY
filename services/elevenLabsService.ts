/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Secure ElevenLabs Client
 * Calls the backend API endpoints to protect ElevenLabs secrets.
 */
import { Voice } from '../types';
import { getAuthHeaders } from './entitlementService';
import { useEntitlementStore } from '../src/store/useEntitlementStore';

export const DEFAULT_ELEVENLABS_VOICES: Voice[] = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (ElevenLabs)', gender: 'Female', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (ElevenLabs)', gender: 'Female', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (ElevenLabs)', gender: 'Female', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (ElevenLabs)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli (ElevenLabs)', gender: 'Female', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh (ElevenLabs)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold (ElevenLabs)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (ElevenLabs)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam (ElevenLabs)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie (ElevenLabs)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' }
];

export const isElevenLabsKeyAvailable = (): boolean => {
  return true; // Supported through backend server proxy
};

export const getElevenLabsVoices = async (): Promise<Voice[]> => {
  try {
    const response = await fetch('/api/ai/voices', {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.voices && Array.isArray(data.voices) && data.voices.length > 0) {
        const elevenLabsOnly = data.voices.filter((v: Voice) => v.provider === 'elevenlabs');
        if (elevenLabsOnly.length > 0) return elevenLabsOnly;
      }
    }
    return DEFAULT_ELEVENLABS_VOICES;
  } catch (err) {
    console.warn('[ELEVENLABS] Using fallback voices catalogue:', err);
    return DEFAULT_ELEVENLABS_VOICES;
  }
};

export const generateSpeechElevenLabs = async (
  text: string, 
  voiceId: string
): Promise<{ buffer: AudioBuffer, rawData: ArrayBuffer }> => {
  const response = await fetch('/api/ai/elevenlabs/tts', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text, voiceId }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Speech synthesis failed' }));
    if (response.status === 429) {
      useEntitlementStore.getState().setUpgradeModalOpen(true);
    }
    throw new Error(err.message || err.error || 'Failed to synthesize ElevenLabs speech.');
  }

  useEntitlementStore.getState().decrementQuota();
  const arrayBuffer = await response.arrayBuffer();

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    return { buffer: audioBuffer, rawData: arrayBuffer };
  } finally {
    // Audio buffer remains valid in browser memory
  }
};

export const cloneVoice = async (name: string, description: string, audioBlob: Blob) => {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  const response = await fetch('/api/ai/clone-voice', {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description,
      audioBase64: base64,
      mimeType: audioBlob.type || 'audio/webm',
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Voice cloning failed' }));
    if (response.status === 429) {
      useEntitlementStore.getState().setUpgradeModalOpen(true);
    }
    throw new Error(err.message || err.error || 'Failed to clone voice.');
  }

  useEntitlementStore.getState().decrementQuota();
  const data = await response.json();
  return data.voice || data;
};

export const generateBGM = async (prompt: string, duration: number = 10): Promise<ArrayBuffer> => {
  const response = await fetch('/api/ai/generate-bgm', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ prompt, duration }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'BGM generation failed' }));
    if (response.status === 429) {
      useEntitlementStore.getState().setUpgradeModalOpen(true);
    }
    throw new Error(err.message || err.error || 'Failed to generate BGM soundtrack.');
  }

  useEntitlementStore.getState().decrementQuota();
  return response.arrayBuffer();
};
