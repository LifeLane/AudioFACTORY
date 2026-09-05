/**
@license
* SPDX-License-Identifier: Apache-2.0
* AudioFACTORY Secure Gemini Client
* Delegates all generative AI synthesis calls to the secure backend server via apiClient.
*/
import { apiGet, apiPost } from '../src/lib/apiClient';
import { useEntitlementStore } from '../src/store/useEntitlementStore';

export function decodeBase64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function createWavBlob(samples: Uint8Array, sampleRate: number = 24000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length);
  const view = new DataView(buffer);
  
  function writeString(v: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      v.setUint8(offset + i, str.charCodeAt(i));
    }
  }

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

export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  let channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function writeString(str: string) {
    for (let i = 0; i < str.length; i++) {
      out.setUint8(pos++, str.charCodeAt(i));
    }
  }

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  writeString('RIFF');
  setUint32(length - 8);
  writeString('WAVE');
  writeString('fmt ');
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  writeString('data');
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}

export async function stitchAudioBuffers(buffers: AudioBuffer[], ctx: AudioContext): Promise<AudioBuffer> {
  const sampleRate = ctx.sampleRate;
  const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
  const numChannels = Math.max(...buffers.map(b => b.numberOfChannels));
  const result = ctx.createBuffer(numChannels, totalLength, sampleRate);

  let offset = 0;
  for (const buf of buffers) {
    for (let ch = 0; ch < numChannels; ch++) {
      const channelData = result.getChannelData(ch);
      if (ch < buf.numberOfChannels) {
        channelData.set(buf.getChannelData(ch), offset);
      }
    }
    offset += buf.length;
  }
  return result;
}

export interface GeneratedAudio {
  buffer: AudioBuffer;
  rawData: Uint8Array;
}

export const generateSpeech = async (
  text: string, 
  voiceName: string,
  styleInstruction?: string
): Promise<GeneratedAudio> => {
  try {
    const data = await apiPost('/ai/tts-gemini', {
      text,
      voiceName,
      styleInstruction,
    });

    useEntitlementStore.getState().decrementQuota();

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: data.sampleRate || 24000, 
    });

    const audioBytes = decodeBase64ToBytes(data.audioBase64);
    const audioBuffer = await outputAudioContext.decodeAudioData(audioBytes.buffer.slice(0) as ArrayBuffer);

    return {
      buffer: audioBuffer,
      rawData: audioBytes,
    };
  } catch (error: any) {
    if (error.status === 429 || error.statusCode === 429) {
      useEntitlementStore.getState().setUpgradeModalOpen(true);
    }
    throw error;
  }
};

export const generateScript = async (params: {
  topic: string;
  durationMinutes: number;
  format: string;
  style: string;
  customPrompt?: string;
  speakersCount?: number;
}): Promise<{
  title: string;
  summary: string;
  speakers: { name: string; voice: string; provider: 'gemini' | 'elevenlabs'; gender: string; color: string }[];
  lines: { id: string; speaker: string; text: string; scene: string; emotion: string; status: 'idle' }[];
}> => {
  try {
    const data = await apiPost('/ai/generate-script', params);
    useEntitlementStore.getState().decrementQuota();
    return data;
  } catch (error: any) {
    if (error.status === 429 || error.statusCode === 429) {
      useEntitlementStore.getState().setUpgradeModalOpen(true);
    }
    throw error;
  }
};

export const analyzeScriptContent = async (rawContent: string): Promise<{
  title: string;
  summary: string;
  speakers: { name: string; voice: string; provider: 'gemini' | 'elevenlabs'; gender: string; color: string }[];
  lines: { id: string; speaker: string; text: string; scene: string; emotion: string; status: 'idle' }[];
}> => {
  try {
    const data = await apiPost('/ai/analyze-script', { rawContent });
    useEntitlementStore.getState().decrementQuota();
    return data;
  } catch (error: any) {
    if (error.status === 429 || error.statusCode === 429) {
      useEntitlementStore.getState().setUpgradeModalOpen(true);
    }
    throw error;
  }
};

export const dramatizeText = async (text: string, styleInstruction?: string): Promise<string> => {
  try {
    const data = await apiPost('/ai/dramatize', { text, styleInstruction });
    useEntitlementStore.getState().decrementQuota();
    return data.dramatizedText;
  } catch (error: any) {
    if (error.status === 429 || error.statusCode === 429) {
      useEntitlementStore.getState().setUpgradeModalOpen(true);
    }
    throw error;
  }
};

export const generateDialogue = async (params: {
  lines: { speaker: string; text: string; voice: string; emotion?: string; provider?: 'gemini' | 'elevenlabs' }[];
  styleInstruction?: string;
}): Promise<{
  lines: { id: string; speaker: string; text: string; audioBase64: string; contentType: string; sampleRate?: number }[];
}> => {
  try {
    const data = await apiPost('/ai/generate-dialogue', params);
    useEntitlementStore.getState().decrementQuota();
    return data;
  } catch (error: any) {
    if (error.status === 429 || error.statusCode === 429) {
      useEntitlementStore.getState().setUpgradeModalOpen(true);
    }
    throw error;
  }
};

export const getAllVoices = async () => {
  return apiGet('/ai/voices');
};
