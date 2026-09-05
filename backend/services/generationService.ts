/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Trusted Backend Generation Service
 * Orchestrates user authentication, entitlements, atomic quota reservation,
 * provider execution, failure reconciliation, and structured Firestore job records.
 */
import { providerRegistry } from '../providers/providerRegistry.js';
import {
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
} from '../providers/AIProvider.js';
import { JobService } from './jobService.js';
import {
  atomicallyReserveGeneration,
  recordGenerationResult,
  acquireConcurrencySlot,
  releaseConcurrencySlot,
  validateGenerationPayload,
} from '../usageManager.js';
import { PLANS } from '../../shared/plans.js';

export interface GenerationUserContext {
  userId: string;
  isGuest: boolean;
}

export class GenerationService {
  /**
   * Safe execution wrapper handling concurrency, quota reservation, structured job logging,
   * provider execution, and failure reconciliation.
   */
  private static async executeProtectedJob<T>(
    userCtx: GenerationUserContext,
    jobType: 'speech' | 'script' | 'dialogue' | 'bgm' | 'voice_clone' | 'dramatize' | 'analyze',
    providerName: ProviderName,
    jobMetadata: Record<string, any>,
    runOperation: () => Promise<{ result: T; charCount?: number; metadata?: Record<string, any> }>
  ): Promise<{
    data: T;
    quotaRemaining: number;
    dailyQuota: number;
    usedToday: number;
    plan: string;
    jobId: string;
  }> {
    const { userId, isGuest } = userCtx;
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const startedAtMs = Date.now();
    let lockAcquired = false;
    let quotaReserved = false;

    try {
      // 1. Concurrency and frequency check
      const concurrency = acquireConcurrencySlot(userId, isGuest);
      if (!concurrency.allowed) {
        const error = new Error(concurrency.reason || 'Concurrent generation in progress.');
        (error as any).statusCode = 429;
        (error as any).code = 'CONCURRENCY_LIMIT';
        throw error;
      }
      lockAcquired = true;

      // 2. Atomically reserve generation quota in Firestore
      const quota = await atomicallyReserveGeneration(userId, isGuest);
      if (!quota.allowed) {
        const error = new Error(quota.reason || 'Daily generation quota exceeded.');
        (error as any).statusCode = 429;
        (error as any).code = 'QUOTA_EXCEEDED';
        (error as any).quotaDetails = {
          plan: quota.plan,
          dailyQuota: quota.dailyQuota,
          generationCount: quota.generationCount,
        };
        throw error;
      }
      quotaReserved = true;

      // 3. Create structured generation job record in Firestore
      await JobService.createJob({
        jobId,
        uid: userId,
        type: jobType,
        provider: providerName,
        metadata: {
          ...jobMetadata,
          plan: quota.plan,
        },
      });

      // 4. Run actual provider operation
      const { result, charCount = 0, metadata = {} } = await runOperation();

      // 5. Record successful completion in usage record & job record
      await recordGenerationResult(userId, true, charCount);
      await JobService.completeJob({
        uid: userId,
        jobId,
        startedAtMs,
        metadata: {
          ...metadata,
          charCount,
        },
      });

      return {
        data: result,
        quotaRemaining: quota.remainingQuota,
        dailyQuota: quota.dailyQuota,
        usedToday: quota.generationCount,
        plan: quota.plan,
        jobId,
      };
    } catch (err: any) {
      console.error(`[GENERATION_SERVICE] Error executing ${jobType} (${providerName}):`, err.message || err);

      // 6. If quota was reserved, reconcile and refund usage quota so user is not penalized for backend failures
      if (quotaReserved) {
        await recordGenerationResult(userId, false, 0);
      }

      // 7. Update structured job record to failed
      await JobService.failJob({
        uid: userId,
        jobId,
        startedAtMs,
        errorCode: err.code || err.status?.toString() || 'GENERATION_FAILED',
        errorMessage: err.message || 'Generation failed',
      });

      throw err;
    } finally {
      if (lockAcquired) {
        releaseConcurrencySlot(userId);
      }
    }
  }

  /**
   * Generate Speech Synthesis
   */
  public static async generateSpeech(
    userCtx: GenerationUserContext,
    params: {
      text: string;
      voiceNameOrId: string;
      provider?: ProviderName;
      styleInstruction?: string;
      format?: 'wav' | 'mp3';
    }
  ) {
    const { text, voiceNameOrId, styleInstruction, format } = params;
    const isGuest = userCtx.isGuest;

    const validation = validateGenerationPayload({ text, isGuest });
    if (!validation.valid) {
      const err = new Error(validation.error);
      (err as any).statusCode = 400;
      throw err;
    }

    const providerName: ProviderName = params.provider || (voiceNameOrId.length > 15 ? 'elevenlabs' : 'gemini');
    const provider = providerRegistry.getProvider(providerName);

    return this.executeProtectedJob<SpeechResult>(
      userCtx,
      'speech',
      providerName,
      {
        textLength: text.length,
        voice: voiceNameOrId,
        format: format || 'wav',
      },
      async () => {
        const speech = await provider.generateSpeech({
          text,
          voiceNameOrId,
          styleInstruction,
          format,
        });

        return {
          result: speech,
          charCount: text.length,
          metadata: {
            sampleRate: speech.sampleRate,
            format: speech.format,
            durationSeconds: speech.durationSeconds,
          },
        };
      }
    );
  }

  /**
   * Generate Multi-Speaker Audio Script
   */
  public static async generateScript(
    userCtx: GenerationUserContext,
    params: ScriptParams
  ) {
    const isGuest = userCtx.isGuest;
    const validation = validateGenerationPayload({ text: params.topic, isGuest });
    if (!validation.valid) {
      const err = new Error(validation.error);
      (err as any).statusCode = 400;
      throw err;
    }

    const provider = providerRegistry.getGeminiProvider();

    return this.executeProtectedJob<ScriptResult>(
      userCtx,
      'script',
      'gemini',
      {
        topic: params.topic,
        format: params.format,
        speakerCount: params.speakerCount,
      },
      async () => {
        const script = await provider.generateScript(params);
        return {
          result: script,
          charCount: params.topic.length,
          metadata: {
            title: script.title,
            speakersCount: script.speakers.length,
            linesCount: script.lines.length,
          },
        };
      }
    );
  }

  /**
   * Generate Full Dialogue or Multi-Speaker Scene
   */
  public static async generateDialogue(
    userCtx: GenerationUserContext,
    params: DialogueParams
  ) {
    const isGuest = userCtx.isGuest;
    const totalChars = params.lines.reduce((acc, l) => acc + (l.text?.length || 0), 0);
    const validation = validateGenerationPayload({ linesCount: params.lines.length, isGuest });
    if (!validation.valid) {
      const err = new Error(validation.error);
      (err as any).statusCode = 400;
      throw err;
    }

    // Process lines using appropriate provider for each line
    const geminiProvider = providerRegistry.getGeminiProvider();
    const elevenLabsProvider = providerRegistry.getElevenLabsProvider();

    return this.executeProtectedJob<DialogueResult>(
      userCtx,
      'dialogue',
      'gemini',
      {
        linesCount: params.lines.length,
        totalChars,
      },
      async () => {
        const processedLines: DialogueResult['lines'] = [];

        for (let i = 0; i < params.lines.length; i++) {
          const line = params.lines[i];
          const lineProviderName: ProviderName = line.provider || (line.voice?.length > 15 ? 'elevenlabs' : 'gemini');
          const provider = lineProviderName === 'elevenlabs' ? elevenLabsProvider : geminiProvider;

          const speech = await provider.generateSpeech({
            text: line.text,
            voiceNameOrId: line.voice,
            styleInstruction: `Speak in character as ${line.speaker}. Emotion: ${line.emotion || 'Natural'}.`,
            format: params.format || 'wav',
          });

          processedLines.push({
            id: line.id || `line-${i}-${Date.now()}`,
            speaker: line.speaker,
            text: line.text,
            audioBase64: speech.audioBase64 || speech.audioBuffer.toString('base64'),
            contentType: speech.contentType,
            sampleRate: speech.sampleRate || 24000,
          });
        }

        return {
          result: { lines: processedLines },
          charCount: totalChars,
          metadata: {
            linesCount: processedLines.length,
          },
        };
      }
    );
  }

  /**
   * Generate Background Music & Soundscapes
   */
  public static async generateBGM(
    userCtx: GenerationUserContext,
    params: BgmParams
  ) {
    const isGuest = userCtx.isGuest;
    const validation = validateGenerationPayload({
      text: params.prompt,
      durationSeconds: params.durationSeconds,
      isGuest,
    });
    if (!validation.valid) {
      const err = new Error(validation.error);
      (err as any).statusCode = 400;
      throw err;
    }

    const provider = providerRegistry.getElevenLabsProvider();

    return this.executeProtectedJob<BgmResult>(
      userCtx,
      'bgm',
      'elevenlabs',
      {
        prompt: params.prompt,
        durationSeconds: params.durationSeconds || 10,
      },
      async () => {
        const bgm = await provider.generateBGM(params);
        return {
          result: bgm,
          charCount: params.prompt.length,
          metadata: {
            durationSeconds: bgm.durationSeconds,
            contentType: bgm.contentType,
          },
        };
      }
    );
  }

  /**
   * Clone Custom Voice Sample
   */
  public static async cloneVoice(
    userCtx: GenerationUserContext,
    params: VoiceCloneParams
  ) {
    if (!params.name || !params.audioBuffer || params.audioBuffer.length === 0) {
      const err = new Error('Voice name and audio sample are required for cloning.');
      (err as any).statusCode = 400;
      throw err;
    }

    const provider = providerRegistry.getElevenLabsProvider();

    return this.executeProtectedJob<VoiceCloneResult>(
      userCtx,
      'voice_clone',
      'elevenlabs',
      {
        name: params.name,
        audioSize: params.audioBuffer.length,
        mimeType: params.mimeType,
      },
      async () => {
        const cloned = await provider.cloneVoice(params);
        return {
          result: cloned,
          charCount: params.name.length,
          metadata: {
            voiceId: cloned.voiceId,
            status: cloned.status,
          },
        };
      }
    );
  }

  /**
   * Retrieve Available Voice Catalogues
   */
  public static async getVoices(_userCtx: GenerationUserContext): Promise<{
    voices: VoiceInfo[];
    providers: { name: ProviderName; configured: boolean }[];
  }> {
    const voices = await providerRegistry.getAllVoices();
    const providers = providerRegistry.getProvidersStatus();
    return { voices, providers };
  }

  /**
   * Script Analysis & Doctoring
   */
  public static async analyzeScript(
    userCtx: GenerationUserContext,
    rawContent: string
  ) {
    const isGuest = userCtx.isGuest;
    const validation = validateGenerationPayload({ text: rawContent, isGuest });
    if (!validation.valid) {
      const err = new Error(validation.error);
      (err as any).statusCode = 400;
      throw err;
    }

    const provider = providerRegistry.getGeminiProvider();

    return this.executeProtectedJob<ScriptResult>(
      userCtx,
      'analyze',
      'gemini',
      {
        contentLength: rawContent.length,
      },
      async () => {
        const analyzed = await provider.analyzeScript(rawContent);
        return {
          result: analyzed,
          charCount: rawContent.length,
          metadata: {
            title: analyzed.title,
            speakersCount: analyzed.speakers.length,
            linesCount: analyzed.lines.length,
          },
        };
      }
    );
  }

  /**
   * Dramatize Script / Monologue
   */
  public static async dramatizeText(
    userCtx: GenerationUserContext,
    params: { text: string; styleInstruction?: string }
  ) {
    const isGuest = userCtx.isGuest;
    const validation = validateGenerationPayload({ text: params.text, isGuest });
    if (!validation.valid) {
      const err = new Error(validation.error);
      (err as any).statusCode = 400;
      throw err;
    }

    const provider = providerRegistry.getGeminiProvider();

    return this.executeProtectedJob<{ dramatizedText: string }>(
      userCtx,
      'dramatize',
      'gemini',
      {
        textLength: params.text.length,
      },
      async () => {
        const dramatizedText = await provider.dramatize(params.text, params.styleInstruction);
        return {
          result: { dramatizedText },
          charCount: params.text.length,
        };
      }
    );
  }
}
