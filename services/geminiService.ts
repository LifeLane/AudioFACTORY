/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Modality } from "@google/genai";

// Initialize Gemini Client
// Note: We use process.env.API_KEY as per instructions.
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Audio Decoding Helper
function decode(base64: string) {
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
  // Simple check for WAV header vs raw PCM.
  // Gemini TTS usually returns raw PCM, but let's be safe.
  // If it's raw PCM, we construct the buffer manually.
  
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert Int16 to Float32 [-1.0, 1.0]
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
  
  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + samples.length, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 is PCM)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, samples.length, true);

  const dataView = new Uint8Array(buffer, 44);
  dataView.set(samples);

  return new Blob([buffer], { type: 'audio/wav' });
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
  const ai = getClient();
  
  const speakerName = 'Speaker';
  // Use speaker labeling to distinguish instructions from the text to be spoken.
  const fullInputText = styleInstruction 
    ? `${styleInstruction}\n\n${speakerName}: ${text}` 
    : `${speakerName}: ${text}`;

  // We need a second speaker to satisfy the API requirement of exactly 2 speakers for multiSpeakerVoiceConfig.
  // We'll use a dummy speaker that is never invoked in the text.
  const dummySpeakerName = 'Interactant'; 
  const dummyVoiceName = 'Puck'; 

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: fullInputText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: speakerName,
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voiceName },
                }
              },
              {
                speaker: dummySpeakerName,
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: dummyVoiceName },
                }
              }
            ]
          }
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data returned from Gemini.");
    }

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000, 
    });

    try {
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, outputAudioContext, 24000, 1);
      
      return { buffer: audioBuffer, rawData: audioBytes };
    } finally {
      await outputAudioContext.close();
    }

  } catch (error) {
    console.error("Error generating speech:", error);
    // Log detailed error for diagnostic purposes
    if (typeof error === 'object' && error !== null) {
      console.error("Detailed Error Details:", JSON.stringify(error, null, 2));
    }
    throw error;
  }
};

export function audioBufferToWavBlob(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length * numChannels * 2;
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true); // byte rate
  view.setUint16(32, numChannels * 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  // Write PCM samples
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
      currentOffset += pauseSamples; // silence
    }
  });

  await ctx.close();
  const wavBlob = audioBufferToWavBlob(stitchedBuffer);
  return { buffer: stitchedBuffer, wavBlob };
}

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
  const ai = getClient();
  const format = params.format || 'Podcast Dialogue';
  const style = params.style || 'High Energy & Engaging';
  const speakerCount = params.speakerCount || 2;

  const prompt = `
    You are an award-winning audio producer and script writer.
    Write a compelling audio script based on the following requirements:
    - Topic / Subject: "${params.topic}"
    - Format: ${format}
    - Style / Tone: ${style}
    - Number of Speakers: ${speakerCount}

    Return a valid JSON object ONLY (no markdown formatting, no code blocks):
    {
      "title": "Short catchy title",
      "summary": "1-2 sentence overview of the scene",
      "speakers": [
        {
          "name": "Speaker Name (e.g. Host Alex)",
          "gender": "MALE or FEMALE",
          "voice": "Recommended Gemini voice name such as Algieba, Puck, Leda, Vindemiatrix, Fenrir, Aoede, Charon, Kore, Zubenelgenubi",
          "provider": "gemini",
          "color": "red, blue, yellow, or green"
        }
      ],
      "lines": [
        {
          "speaker": "Speaker Name",
          "text": "The exact dialogue text to be spoken naturally.",
          "scene": "Scene 1: Introduction",
          "emotion": "Excited, Whispering, Confident, Mysterious, etc."
        }
      ]
    }
    Make sure the dialogue has between 4 and 8 dynamic conversational turns that flow naturally.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(rawText);

    const speakers = (parsed.speakers || []).map((s: any, idx: number) => ({
      name: s.name || `Speaker ${idx + 1}`,
      voice: s.voice || (s.gender === 'FEMALE' ? 'Leda' : 'Puck'),
      provider: 'gemini' as const,
      gender: s.gender || 'MALE',
      color: s.color || (idx === 0 ? 'yellow' : idx === 1 ? 'blue' : 'red')
    }));

    const lines = (parsed.lines || []).map((l: any, idx: number) => ({
      id: `line-${idx + 1}-${Date.now()}`,
      speaker: l.speaker || speakers[0]?.name || 'Speaker 1',
      text: l.text || '',
      scene: l.scene || 'Scene 1',
      emotion: l.emotion || 'Natural',
      status: 'idle' as const
    }));

    return {
      title: parsed.title || 'Generated Audio Script',
      summary: parsed.summary || 'A multi-speaker audio performance.',
      speakers,
      lines
    };
  } catch (error) {
    console.error("Error generating script:", error);
    throw error;
  }
};

export const analyzeScriptContent = async (rawContent: string): Promise<{
  title: string;
  summary: string;
  speakers: { name: string; voice: string; provider: 'gemini' | 'elevenlabs'; gender: string; color: string }[];
  lines: { id: string; speaker: string; text: string; scene: string; emotion: string; status: 'idle' }[];
}> => {
  const ai = getClient();

  const prompt = `
    Analyze the following text or script. Detect any speakers, dialogue turns, scenes, and emotions.
    If the text has explicit speaker tags (e.g. "Alex: Hello"), parse them.
    If the text is a raw passage, monologue, or article without speaker tags, break it down into natural dialogue turns between 2 compelling characters (e.g. Narrator / Host or Host A / Host B) who present and react to the ideas engagingly.

    Input Content:
    "${rawContent}"

    Return a valid JSON object ONLY (no markdown formatting, no code blocks):
    {
      "title": "Title reflecting the script content",
      "summary": "Brief summary of the dialogue",
      "speakers": [
        {
          "name": "Speaker Name",
          "gender": "MALE or FEMALE",
          "voice": "Recommended Gemini voice name from: Algieba, Puck, Leda, Vindemiatrix, Fenrir, Aoede, Charon, Kore, Zubenelgenubi",
          "provider": "gemini",
          "color": "red, blue, yellow, or green"
        }
      ],
      "lines": [
        {
          "speaker": "Speaker Name exactly matching one in speakers list",
          "text": "The spoken sentence or phrase.",
          "scene": "Scene 1: Opening",
          "emotion": "Curious, Bold, Serious, Enthusiastic, Dramatic, etc."
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(rawText);

    const colors = ['yellow', 'blue', 'red', 'green', 'black'];
    const geminiVoices = ['Algieba', 'Vindemiatrix', 'Leda', 'Puck', 'Fenrir', 'Aoede', 'Charon', 'Kore'];

    const speakers = (parsed.speakers || []).map((s: any, idx: number) => ({
      name: s.name || `Speaker ${idx + 1}`,
      voice: s.voice || geminiVoices[idx % geminiVoices.length],
      provider: 'gemini' as const,
      gender: s.gender || (idx % 2 === 0 ? 'MALE' : 'FEMALE'),
      color: s.color || colors[idx % colors.length]
    }));

    const lines = (parsed.lines || []).map((l: any, idx: number) => ({
      id: `line-${idx + 1}-${Date.now()}`,
      speaker: l.speaker || speakers[0]?.name || 'Speaker 1',
      text: l.text || '',
      scene: l.scene || 'Scene 1',
      emotion: l.emotion || 'Natural',
      status: 'idle' as const
    }));

    return {
      title: parsed.title || 'Analyzed Script',
      summary: parsed.summary || 'Detected dialogue segments and speaker assignments.',
      speakers,
      lines
    };
  } catch (error) {
    console.error("Error analyzing script:", error);
    throw error;
  }
};

export const dramatizeText = async (text: string, styleInstruction?: string): Promise<string> => {
  const ai = getClient();
  
  const persona = styleInstruction 
    ? `Style/Persona: ${styleInstruction}` 
    : `Style: Dramatic, hype-building meeting introduction. Make it intriguing and engaging, to grab people's attention.`;

  try {
    const prompt = `
      Rewrite this business meeting introduction or text to be more engaging and expressive, according to the specified persona.
      
      Persona: ${persona}
      
      Guidelines:
      1. **Natural conversation**: Use patterns of rhythm and expressivity natural to the persona for fluid delivery.
      2. **Style control**: Incorporate natural language that steers the delivery to adopt the appropriate tone and expression.
      3. **Dynamic performance**: Bring the text to life with energy suitable for the persona (e.g., poetic, newscast, storytelling).
      4. **Pace and pronunciation**: Ensure the text allows for clear pronunciation and appropriate pacing.
      5. **Accuracy**: Keep all core facts, names, and data accurate.
      6. **Format**: Return ONLY the rewritten text without quotes. Keep it in the original language.
      
      Input Text:
      "${text}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || text;
  } catch (error) {
    console.error("Error dramatizing text:", error);
    throw error;
  }
};

