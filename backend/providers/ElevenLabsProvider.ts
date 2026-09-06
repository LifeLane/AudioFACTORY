/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY ElevenLabs AI Provider
 * Server-only integration with ElevenLabs REST API.
 */
import { getElevenLabsKey } from '../config';
import {
  AIProvider,
  ProviderName,
  SpeechParams,
  SpeechResult,
  ScriptParams,
  ScriptResult,
  DialogueParams,
  DialogueResult,
  BgmParams,
  BgmResult,
  VoiceCloneParams,
  VoiceCloneResult,
  VoiceInfo,
} from './AIProvider';

export const ELEVENLABS_FALLBACK_VOICES: VoiceInfo[] = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (ElevenLabs)', gender: 'Female', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (ElevenLabs)', gender: 'Female', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (ElevenLabs)', gender: 'Female', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (ElevenLabs)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli (ElevenLabs)', gender: 'Female', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh (ElevenLabs)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold (ElevenLabs)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (ElevenLabs)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam (ElevenLabs)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie (ElevenLabs)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'elevenlabs' },
];

export class ElevenLabsProvider implements AIProvider {
  public readonly name: ProviderName = 'elevenlabs';

  public isConfigured(): boolean {
    const key = getElevenLabsKey();
    return Boolean(key && key.trim().length > 0);
  }

  private getKey(): string {
    const key = getElevenLabsKey();
    if (!key) {
      throw new Error('ELEVENLABS_API_KEY is not configured on the server. Please provide the key in server environment.');
    }
    return key;
  }

  private cachedModels: any[] | null = null;
  private cachedModelsTime: number = 0;

  private async getAvailableModels(): Promise<any[]> {
    const key = this.getKey();
    const now = Date.now();
    // Cache for 1 hour to avoid excessive API calls
    if (this.cachedModels && now - this.cachedModelsTime < 3600000) {
      return this.cachedModels;
    }

    try {
      const res = await fetch('https://api.elevenlabs.io/v1/models', {
        headers: { 'xi-api-key': key, 'Accept': 'application/json' },
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch ElevenLabs models: ${res.status}`);
      }
      
      const models = await res.json();
      if (Array.isArray(models)) {
        this.cachedModels = models;
        this.cachedModelsTime = now;
        return models;
      }
    } catch (err) {
      console.warn('[ELEVENLABS] Could not fetch models programmatically:', err);
    }
    
    // Fallback static list if endpoint fails
    return [
      { model_id: 'eleven_flash_v2_5' },
      { model_id: 'eleven_multilingual_v2' },
      { model_id: 'eleven_turbo_v2_5' },
    ];
  }

  private async executeWithRetry<T>(fn: () => Promise<T>, maxRetries: number = 2): Promise<T> {
    let attempt = 0;
    let lastError: any;

    while (attempt <= maxRetries) {
      try {
        return await fn();
      } catch (err: any) {
        lastError = err;
        attempt++;

        const isTransient = 
          err.status === 429 || 
          err.status === 503 || 
          err.status === 502 ||
          err.message?.includes('429') ||
          err.message?.includes('503') ||
          err.message?.includes('fetch failed');

        if (!isTransient || attempt > maxRetries) {
          throw err;
        }

        const backoffMs = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 4000);
        console.warn(`[ELEVENLABS] Transient error (attempt ${attempt}/${maxRetries}). Retrying in ${backoffMs}ms...`);
        await new Promise((res) => setTimeout(res, backoffMs));
      }
    }
    throw lastError;
  }

  public async generateSpeech(params: SpeechParams): Promise<SpeechResult> {
    const key = this.getKey();
    const voiceId = params.voiceNameOrId || '21m00Tcm4TlvDq8ikWAM';
    
    // Performance Tracking Start
    const startTime = performance.now();

    // Query available models and map them
    const availableModels = await this.getAvailableModels();
    
    // Create priority ranking based on latency and quality
    // Flash models (ultra low latency), Multilingual (high quality & robust), Turbo (great fallback)
    const modelPriority = [
      'eleven_flash_v2_5',
      'eleven_multilingual_v2',
      'eleven_turbo_v2_5'
    ];
    
    const fallbackModels = modelPriority.filter(id => 
      availableModels.some(m => m.model_id === id && (m.can_do_text_to_speech !== false))
    );

    if (fallbackModels.length === 0) {
      fallbackModels.push('eleven_multilingual_v2'); // Absolute fallback
    }

    let lastError: any;
    let response: Response | null = null;
    let successfulModel = '';

    for (const modelId of fallbackModels) {
      try {
        response = await this.executeWithRetry(async () => {
          const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
              'xi-api-key': key,
              'Content-Type': 'application/json',
              'Accept': 'audio/mpeg',
            },
            body: JSON.stringify({
              text: params.text,
              model_id: modelId,
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
              },
            }),
          });

          if (!res.ok) {
            const errorJson = await res.json().catch(() => ({ detail: { message: `Status code ${res.status}` } }));
            const errorMsg = errorJson.detail?.message || errorJson.message || `ElevenLabs synthesis failed (${res.status})`;
            const error = new Error(errorMsg);
            (error as any).status = res.status;
            
            // Mark model-related errors so we know to fallback
            if (res.status === 400 && (errorMsg.toLowerCase().includes('model') || errorMsg.toLowerCase().includes('deprecated') || errorMsg.toLowerCase().includes('unsupported'))) {
              (error as any).isModelError = true;
            }
            throw error;
          }

          return res;
        });

        successfulModel = modelId;
        break;
      } catch (error: any) {
        lastError = error;
        
        // If the error isn't related to the model or a 500 error, there's no point falling back
        // For example, if it's invalid API key (401) or text too long (400 but not model related)
        if (error.status === 401 || error.status === 403 || error.status === 422) {
          throw error;
        }
        
        if (error.status === 400 && !error.isModelError) {
          throw error;
        }
        
        console.warn(`[ELEVENLABS] Model ${modelId} failed: ${error.message}. Attempting next fallback model...`);
      }
    }

    if (!response) {
      throw lastError || new Error('Failed to generate speech with any ElevenLabs model.');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Performance Tracking End
    const duration = performance.now() - startTime;
    console.log(`[ELEVENLABS] Synthesis completed via model ${successfulModel} for voice ${voiceId} in ${duration.toFixed(2)}ms`);

    return {
      audioBuffer: buffer,
      contentType: 'audio/mpeg',
      audioBase64: buffer.toString('base64'),
      format: 'mp3',
      durationSeconds: Math.round((params.text.length / 15) * 10) / 10,
    };
  }

  public async generateScript(_params: ScriptParams): Promise<ScriptResult> {
    throw new Error('ElevenLabs does not support text script authoring. Please route script generation to GeminiProvider.');
  }

  public async generateDialogue(params: DialogueParams): Promise<DialogueResult> {
    const results: DialogueResult['lines'] = [];

    for (let i = 0; i < params.lines.length; i++) {
      const line = params.lines[i];
      const speech = await this.generateSpeech({
        text: line.text,
        voiceNameOrId: line.voice,
        format: params.format || 'mp3',
      });

      results.push({
        id: line.id || `line-${i}-${Date.now()}`,
        speaker: line.speaker,
        text: line.text,
        audioBase64: speech.audioBase64 || speech.audioBuffer.toString('base64'),
        contentType: speech.contentType,
      });
    }

    return { lines: results };
  }

  public async generateBGM(params: BgmParams): Promise<BgmResult> {
    const key = this.getKey();
    const duration = Math.min(Math.max(params.durationSeconds || 10, 1), 60);

    const response = await this.executeWithRetry(async () => {
      const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
        method: 'POST',
        headers: {
          'xi-api-key': key,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: params.prompt,
          duration_seconds: duration,
        }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({ detail: { message: `Status code ${res.status}` } }));
        const errorMsg = errorJson.detail?.message || errorJson.message || `ElevenLabs BGM generation failed (${res.status})`;
        const error = new Error(errorMsg);
        (error as any).status = res.status;
        throw error;
      }

      return res;
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      audioBuffer: buffer,
      contentType: 'audio/mpeg',
      durationSeconds: duration,
    };
  }

  public async cloneVoice(params: VoiceCloneParams): Promise<VoiceCloneResult> {
    const key = this.getKey();

    const formData = new FormData();
    formData.append('name', params.name);
    if (params.description) {
      formData.append('description', params.description);
    }

    const blob = new Blob([params.audioBuffer as any], { type: params.mimeType || 'audio/webm' });
    formData.append('files', blob, params.originalFilename || 'recording.webm');

    const response = await this.executeWithRetry(async () => {
      const res = await fetch('https://api.elevenlabs.io/v1/voices/add', {
        method: 'POST',
        headers: {
          'xi-api-key': key,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({ detail: { message: `Status code ${res.status}` } }));
        const errorMsg = errorJson.detail?.message || errorJson.message || `ElevenLabs Voice Cloning failed (${res.status})`;
        const error = new Error(errorMsg);
        (error as any).status = res.status;
        throw error;
      }

      return res;
    });

    const data = await response.json();
    return {
      voiceId: data.voice_id || `cloned_${Date.now()}`,
      name: params.name,
      status: 'ready',
      provider: 'elevenlabs',
      previewUrl: data.preview_url,
    };
  }

  public async getVoices(): Promise<VoiceInfo[]> {
    const key = getElevenLabsKey();
    if (!key) {
      return ELEVENLABS_FALLBACK_VOICES;
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': key },
      });

      if (!response.ok) {
        console.warn(`[ELEVENLABS] Voice catalogue API returned ${response.status}. Using fallback voices.`);
        return ELEVENLABS_FALLBACK_VOICES;
      }

      const data = await response.json();
      const voices: VoiceInfo[] = (data.voices || []).map((v: any) => ({
        id: v.voice_id,
        name: `${v.name} (ElevenLabs)`,
        gender: v.labels?.gender ? (v.labels.gender.charAt(0).toUpperCase() + v.labels.gender.slice(1)) : 'Unknown',
        languageCode: 'en-US',
        languageName: 'English (US)',
        provider: 'elevenlabs' as const,
        previewUrl: v.preview_url,
        category: v.category || 'premade',
      }));

      return voices.length > 0 ? voices : ELEVENLABS_FALLBACK_VOICES;
    } catch (error) {
      console.warn('[ELEVENLABS] Failed to fetch remote voices list:', error);
      return ELEVENLABS_FALLBACK_VOICES;
    }
  }
}
