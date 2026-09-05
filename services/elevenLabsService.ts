/**
@license
* SPDX-License-Identifier: Apache-2.0
* AudioFACTORY Secure ElevenLabs Client
* Calls backend API endpoints via apiClient to protect ElevenLabs secrets.
*/
import { Voice } from '../types';
import { apiGet, apiPost } from '../src/lib/apiClient';
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
  return true;
};

export const getElevenLabsVoices = async (): Promise<Voice[]> => {
  try {
    const data = await apiGet('/ai/voices');
    if (data && data.voices && Array.isArray(data.voices)) {
      const elevenLabsOnly = data.voices.filter((v: Voice) => v.provider === 'elevenlabs');
      if (elevenLabsOnly.length > 0) return elevenLabsOnly;
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
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const { getAuthHeaders } = await import('../src/lib/apiClient');
    const headers = await getAuthHeaders();
    headers['Accept'] = 'audio/mpeg';

    const response = await fetch(`${baseUrl}/api/ai/elevenlabs/tts`, {
      method: 'POST',
      headers,
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
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    return { buffer: audioBuffer, rawData: arrayBuffer };
  } catch (error: any) {
    if (error.status === 429 || error.statusCode === 429) {
      useEntitlementStore.getState().setUpgradeModalOpen(true);
    }
    throw error;
  }
};

export const generateBGM = async (prompt: string, durationSeconds: number = 30): Promise<{ audioBase64: string; contentType: string }> => {
  try {
    const data = await apiPost('/ai/generate-bgm', { prompt, durationSeconds });
    useEntitlementStore.getState().decrementQuota();
    return data;
  } catch (error: any) {
    if (error.status === 429 || error.statusCode === 429) {
      useEntitlementStore.getState().setUpgradeModalOpen(true);
    }
    throw error;
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

  try {
    const data = await apiPost('/ai/clone-voice', {
      name,
      description,
      audioBase64: base64,
      mimeType: audioBlob.type || 'audio/webm',
    });
    useEntitlementStore.getState().decrementQuota();
    return data;
  } catch (error: any) {
    if (error.status === 429 || error.statusCode === 429) {
      useEntitlementStore.getState().setUpgradeModalOpen(true);
    }
    throw error;
  }
};
