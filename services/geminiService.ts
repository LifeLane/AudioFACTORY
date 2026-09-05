/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Secure Gemini Client
 * Delegates all generative AI synthesis calls to the secure backend server.
 */
import { getAuthHeaders } from './entitlementService';
import { useEntitlementStore } from '../src/store/useEntitlementStore';

// Audio Decoding Helper
function decodeBase64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export function createWavBlob(samples: Uint8Array, sampleRate: number = 24000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length);
  const view = new DataView(buffer);
  
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length, true);

  const dataView = new Uint8Array(buffer, 44);
  dataView.set(samples);

  return new Blob([buffer], { type: 'audio/wav' });
}

export interface GeneratedAudio {
  buffer: AudioBuffer;
  rawData: Uint8Array;
}

/**
 * Server-Proxied Speech Synthesis
 */
export const generateSpeech = async (
  text: string, 
  voiceName: string,
  styleInstruction?: string
): Promise<GeneratedAudio> => {
  const response = await fetch('/api/ai/tts-gemini', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      text,
      voiceName,
      styleInstruction,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Speech generation failed' }));
    if (response.status === 429) {
      useEntitlementStore.getState().setUpgradeModalOpen(true);
      throw new Error(errorData.message || 'Daily generation quota exceeded. Please upgrade to Pro.');
    }
    throw new Error(errorData.error || errorData.message || 'Speech generation failed.');
  }

  const data = await response.json();
  useEntitlementStore.getState().decrementQuota();

  const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: data.sampleRate || 24000, 
  });

  try {
    const audioBytes = decodeBase64ToBytes(data.audioBase64);
    const audioBuffer = await decodeAudioData(audioBytes, outputAudioContext, data.sampleRate || 24000, 1);
    return { buffer: audioBuffer, rawData: audioBytes };
  } finally {
    await outputAudioContext.close();
  }
};

export function audioBufferToWavBlob(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length * numChannels * 2;
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

export async function stitchAudioBuffers(
  buffers: AudioBuffer[],
  pauseSeconds: number = 0.35
): Promise<{ buffer: AudioBuffer; wavBlob: Blob }> {
  if (!buffers || buffers.length === 0) {
    throw new Error("No audio buffers to stitch.");
  }
  const sampleRate = buffers[0].sampleRate || 24000;
  const pauseSamples = Math.floor(pauseSeconds * sampleRate);

  let totalLength = 0;
  buffers.forEach((b, idx) => {
    totalLength += b.length;
    if (idx < buffers.length - 1) {
      totalLength += pauseSamples;
    }
  });

  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
  const stitchedBuffer = ctx.createBuffer(1, totalLength, sampleRate);
  const outChannel = stitchedBuffer.getChannelData(0);

  let currentOffset = 0;
  buffers.forEach((b, idx) => {
    const channelData = b.getChannelData(0);
    outChannel.set(channelData, currentOffset);
    currentOffset += b.length;
    if (idx < buffers.length - 1) {
      currentOffset += pauseSamples;
    }
  });

  await ctx.close();
  const wavBlob = audioBufferToWavBlob(stitchedBuffer);
  return { buffer: stitchedBuffer, wavBlob };
}

/**
 * Server-Proxied Script Generation
 */
export const generateScript = async (params: {
  topic: string;
  format?: string;
  style?: string;
  speakerCount?: number;
}): Promise<{
  title: string;
  summary: string;
  speakers: { name: string; voice: string; provider: 'gemini' | 'elevenlabs'; gender: string; color: string }[];
  lines: { id: string; speaker: string; text: string; scene: string; emotion: string; status: 'idle' }[];
}> => {
  const response = await fetch('/api/ai/generate-script', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Script generation failed' }));
    if (response.status === 429) {
      useEntitlementStore.getState().setUpgradeModalOpen(true);
    }
    throw new Error(errorData.message || errorData.error || 'Failed to generate script.');
  }

  useEntitlementStore.getState().decrementQuota();
  return response.json();
};

/**
 * Server-Proxied Script Analysis & Doctoring
 */
export const analyzeScriptContent = async (rawContent: string): Promise<{
  title: string;
  summary: string;
  speakers: { name: string; voice: string; provider: 'gemini' | 'elevenlabs'; gender: string; color: string }[];
  lines: { id: string; speaker: string; text: string; scene: string; emotion: string; status: 'idle' }[];
}> => {
  const response = await fetch('/api/ai/analyze-script', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ rawContent }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Script analysis failed' }));
    if (response.status === 429) {
      useEntitlementStore.getState().setUpgradeModalOpen(true);
    }
    throw new Error(errorData.message || errorData.error || 'Failed to analyze script.');
  }

  useEntitlementStore.getState().decrementQuota();
  return response.json();
};

/**
 * Server-Proxied Dramatization
 */
export const dramatizeText = async (text: string, styleInstruction?: string): Promise<string> => {
  const response = await fetch('/api/ai/dramatize', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text, styleInstruction }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Dramatization failed' }));
    if (response.status === 429) {
      useEntitlementStore.getState().setUpgradeModalOpen(true);
    }
    throw new Error(errorData.message || errorData.error || 'Failed to dramatize text.');
  }

  const data = await response.json();
  useEntitlementStore.getState().decrementQuota();
  return data.dramatizedText;
};

/**
 * Server-Proxied Multi-Speaker Dialogue Generation
 */
export const generateDialogue = async (params: {
  lines: { speaker: string; text: string; voice: string; emotion?: string; provider?: 'gemini' | 'elevenlabs' }[];
  styleInstruction?: string;
}): Promise<{
  lines: { id: string; speaker: string; text: string; audioBase64: string; contentType: string; sampleRate?: number }[];
}> => {
  const response = await fetch('/api/ai/generate-dialogue', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Dialogue generation failed' }));
    if (response.status === 429) {
      useEntitlementStore.getState().setUpgradeModalOpen(true);
    }
    throw new Error(errorData.message || errorData.error || 'Failed to generate dialogue.');
  }

  useEntitlementStore.getState().decrementQuota();
  return response.json();
};

/**
 * Server-Proxied Voice Catalogue
 */
export const getAllVoices = async () => {
  const response = await fetch('/api/ai/voices', {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch voice catalog from backend.');
  }

  return response.json();
};

