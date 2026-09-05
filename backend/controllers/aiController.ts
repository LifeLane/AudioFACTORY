/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Secure Server AI Controller
 * All AI provider integrations are strictly backend-only. Never exposes API keys to client.
 */
import { Request, Response } from 'express';
import { GenerationService, GenerationUserContext } from '../services/generationService';
import { JobService } from '../services/jobService';
import { ProviderName } from '../providers/AIProvider';

export function extractUserFromRequest(req: Request): GenerationUserContext {
  if (req.user) {
    return {
      userId: req.user.uid,
      isGuest: req.user.isAnonymous,
    };
  }

  // Fallback for unauthenticated testing or direct internal calls
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token.startsWith('guest_') || token.length < 50) {
      return { userId: token, isGuest: true };
    }
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anonymous_guest';
  return { userId: `guest_${ip}`, isGuest: true };
}

/**
 * Handle Unified Speech Generation (Supports Gemini & ElevenLabs)
 */
export async function handleGenerateSpeech(req: Request, res: Response): Promise<void> {
  const userCtx = extractUserFromRequest(req);

  try {
    const { text, voiceName, voiceId, voice, provider, styleInstruction, format } = req.body;
    const selectedVoice = voiceName || voiceId || voice;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Field "text" is required.' });
      return;
    }

    if (!selectedVoice) {
      res.status(400).json({ error: 'Voice identifier ("voiceName" or "voiceId") is required.' });
      return;
    }

    const result = await GenerationService.generateSpeech(userCtx, {
      text,
      voiceNameOrId: selectedVoice,
      provider: provider as ProviderName,
      styleInstruction,
      format,
    });

    if (req.headers.accept === 'audio/mpeg' || req.headers.accept === 'audio/wav' || req.query.binary === 'true') {
      res.setHeader('Content-Type', result.data.contentType);
      res.setHeader('X-Job-Id', result.jobId);
      res.setHeader('X-Quota-Remaining', result.quotaRemaining.toString());
      res.send(result.data.audioBuffer);
      return;
    }

    res.json({
      success: true,
      jobId: result.jobId,
      audioBase64: result.data.audioBase64 || result.data.audioBuffer.toString('base64'),
      contentType: result.data.contentType,
      sampleRate: result.data.sampleRate || 24000,
      format: result.data.format,
      durationSeconds: result.data.durationSeconds,
      quotaRemaining: result.quotaRemaining,
      dailyQuota: result.dailyQuota,
      usedToday: result.usedToday,
      plan: result.plan,
    });
  } catch (error: any) {
    const status = error.statusCode || (error.status ? Number(error.status) : 500);
    res.status(status).json({
      error: error.code || 'SPEECH_GENERATION_FAILED',
      message: error.message || 'Speech generation failed',
      details: error.quotaDetails,
    });
  }
}

/**
 * Legacy Gemini TTS Endpoint Compatibility Handler
 */
export async function handleGeminiTts(req: Request, res: Response): Promise<void> {
  req.body.provider = 'gemini';
  return handleGenerateSpeech(req, res);
}

/**
 * Legacy ElevenLabs TTS Endpoint Compatibility Handler
 */
export async function handleElevenLabsTts(req: Request, res: Response): Promise<void> {
  const userCtx = extractUserFromRequest(req);

  try {
    const { text, voiceId } = req.body;
    if (!text || !voiceId) {
      res.status(400).json({ error: 'Fields "text" and "voiceId" are required.' });
      return;
    }

    const result = await GenerationService.generateSpeech(userCtx, {
      text,
      voiceNameOrId: voiceId,
      provider: 'elevenlabs',
      format: 'mp3',
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-Job-Id', result.jobId);
    res.setHeader('X-Quota-Remaining', result.quotaRemaining.toString());
    res.send(result.data.audioBuffer);
  } catch (error: any) {
    const status = error.statusCode || (error.status ? Number(error.status) : 500);
    res.status(status).json({
      error: error.code || 'ELEVENLABS_TTS_FAILED',
      message: error.message || 'ElevenLabs synthesis failed',
    });
  }
}

/**
 * Handle Script Generation
 */
export async function handleGenerateScript(req: Request, res: Response): Promise<void> {
  const userCtx = extractUserFromRequest(req);

  try {
    const { topic, format, style, speakerCount } = req.body;
    if (!topic || typeof topic !== 'string') {
      res.status(400).json({ error: 'Field "topic" is required.' });
      return;
    }

    const result = await GenerationService.generateScript(userCtx, {
      topic,
      format,
      style,
      speakerCount: Number(speakerCount) || 2,
    });

    res.json({
      ...result.data,
      jobId: result.jobId,
      quotaRemaining: result.quotaRemaining,
      dailyQuota: result.dailyQuota,
      usedToday: result.usedToday,
      plan: result.plan,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      error: error.code || 'SCRIPT_GENERATION_FAILED',
      message: error.message || 'Script generation failed',
    });
  }
}

/**
 * Handle Multi-Speaker Dialogue Generation
 */
export async function handleGenerateDialogue(req: Request, res: Response): Promise<void> {
  const userCtx = extractUserFromRequest(req);

  try {
    const { lines, styleInstruction, format } = req.body;
    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      res.status(400).json({ error: 'Field "lines" must be a non-empty array.' });
      return;
    }

    const result = await GenerationService.generateDialogue(userCtx, {
      lines,
      styleInstruction,
      format,
    });

    res.json({
      ...result.data,
      jobId: result.jobId,
      quotaRemaining: result.quotaRemaining,
      dailyQuota: result.dailyQuota,
      usedToday: result.usedToday,
      plan: result.plan,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      error: error.code || 'DIALOGUE_GENERATION_FAILED',
      message: error.message || 'Dialogue generation failed',
    });
  }
}

/**
 * Handle BGM / Soundtrack Generation
 */
export async function handleGenerateBgm(req: Request, res: Response): Promise<void> {
  const userCtx = extractUserFromRequest(req);

  try {
    const { prompt, duration = 15 } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Field "prompt" is required.' });
      return;
    }

    const result = await GenerationService.generateBGM(userCtx, {
      prompt,
      durationSeconds: Number(duration),
    });

    if (req.headers.accept === 'audio/mpeg' || req.query.binary === 'true') {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('X-Job-Id', result.jobId);
      res.send(result.data.audioBuffer);
      return;
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(result.data.audioBuffer);
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      error: error.code || 'BGM_GENERATION_FAILED',
      message: error.message || 'Failed to generate BGM soundtrack',
    });
  }
}

export const handleElevenLabsBgm = handleGenerateBgm;

/**
 * Handle Instant Voice Cloning
 */
export async function handleCloneVoice(req: Request, res: Response): Promise<void> {
  const userCtx = extractUserFromRequest(req);

  try {
    const { name, description, audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Field "name" is required.' });
      return;
    }

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      res.status(400).json({ error: 'Audio sample "audioBase64" is required.' });
      return;
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');

    const result = await GenerationService.cloneVoice(userCtx, {
      name,
      description,
      audioBuffer,
      mimeType,
    });

    res.json({
      success: true,
      jobId: result.jobId,
      voice: result.data,
      quotaRemaining: result.quotaRemaining,
      dailyQuota: result.dailyQuota,
      usedToday: result.usedToday,
      plan: result.plan,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      error: error.code || 'VOICE_CLONE_FAILED',
      message: error.message || 'Failed to clone voice',
    });
  }
}

/**
 * Handle Voice Catalogues List
 */
export async function handleGetVoices(req: Request, res: Response): Promise<void> {
  const userCtx = extractUserFromRequest(req);

  try {
    const result = await GenerationService.getVoices(userCtx);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      error: 'VOICES_FETCH_FAILED',
      message: error.message || 'Failed to load voices',
    });
  }
}

export async function handleElevenLabsVoices(req: Request, res: Response): Promise<void> {
  const userCtx = extractUserFromRequest(req);
  try {
    const result = await GenerationService.getVoices(userCtx);
    const elevenLabsOnly = result.voices.filter(v => v.provider === 'elevenlabs');
    const isConfigured = result.providers.find(p => p.name === 'elevenlabs')?.configured || false;
    res.json({
      available: isConfigured,
      voices: elevenLabsOnly,
    });
  } catch (error: any) {
    res.json({ available: false, voices: [] });
  }
}

/**
 * Handle Script Analysis & Doctoring
 */
export async function handleAnalyzeScript(req: Request, res: Response): Promise<void> {
  const userCtx = extractUserFromRequest(req);

  try {
    const { rawContent } = req.body;
    if (!rawContent || typeof rawContent !== 'string') {
      res.status(400).json({ error: 'Field "rawContent" is required.' });
      return;
    }

    const result = await GenerationService.analyzeScript(userCtx, rawContent);

    res.json({
      ...result.data,
      jobId: result.jobId,
      quotaRemaining: result.quotaRemaining,
      dailyQuota: result.dailyQuota,
      usedToday: result.usedToday,
      plan: result.plan,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      error: error.code || 'SCRIPT_ANALYSIS_FAILED',
      message: error.message || 'Failed to analyze script',
    });
  }
}

/**
 * Handle Dramatization
 */
export async function handleDramatize(req: Request, res: Response): Promise<void> {
  const userCtx = extractUserFromRequest(req);

  try {
    const { text, styleInstruction } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Field "text" is required.' });
      return;
    }

    const result = await GenerationService.dramatizeText(userCtx, { text, styleInstruction });

    res.json({
      dramatizedText: result.data.dramatizedText,
      jobId: result.jobId,
      quotaRemaining: result.quotaRemaining,
      dailyQuota: result.dailyQuota,
      usedToday: result.usedToday,
      plan: result.plan,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      error: error.code || 'DRAMATIZATION_FAILED',
      message: error.message || 'Failed to dramatize text',
    });
  }
}

/**
 * Retrieve User Generation Jobs History
 */
export async function handleGetJobs(req: Request, res: Response): Promise<void> {
  const { userId } = extractUserFromRequest(req);
  try {
    const limitCount = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    const jobs = await JobService.getUserJobs(userId, limitCount);
    res.json({ jobs });
  } catch (error: any) {
    res.status(500).json({ error: 'FAILED_TO_LOAD_JOBS', message: error.message });
  }
}
