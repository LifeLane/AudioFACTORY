/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Gemini AI Provider
 * Server-only integration with @google/genai (Gemini 2.5 Flash & Speech Synthesis).
 */
import { GoogleGenAI, Modality } from '@google/genai';
import { getGeminiKey, getGroqKey } from '../config';
import {
  AIProvider,
  ProviderName,
  SpeechParams,
  SpeechResult,
  ScriptParams,
  ScriptResult,
  ScriptSpeaker,
  ScriptLine,
  DialogueParams,
  DialogueResult,
  BgmParams,
  BgmResult,
  VoiceCloneParams,
  VoiceCloneResult,
  VoiceInfo,
} from './AIProvider';

export const GEMINI_PREBUILT_VOICES: VoiceInfo[] = [
  { id: 'Algieba', name: 'Algieba (Gemini Deep Male)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'gemini' },
  { id: 'Puck', name: 'Puck (Gemini Warm Male)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'gemini' },
  { id: 'Leda', name: 'Leda (Gemini Clear Female)', gender: 'Female', languageCode: 'en-US', languageName: 'English (US)', provider: 'gemini' },
  { id: 'Fenrir', name: 'Fenrir (Gemini Resonant Male)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'gemini' },
  { id: 'Aoede', name: 'Aoede (Gemini Expressive Female)', gender: 'Female', languageCode: 'en-US', languageName: 'English (US)', provider: 'gemini' },
  { id: 'Kore', name: 'Kore (Gemini Gentle Female)', gender: 'Female', languageCode: 'en-US', languageName: 'English (US)', provider: 'gemini' },
  { id: 'Charon', name: 'Charon (Gemini Authoritative Male)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'gemini' },
  { id: 'Vindemiatrix', name: 'Vindemiatrix (Gemini Dynamic Female)', gender: 'Female', languageCode: 'en-US', languageName: 'English (US)', provider: 'gemini' },
  { id: 'Zubenelgenubi', name: 'Zubenelgenubi (Gemini Bright Male)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'gemini' },
  { id: 'Enceladus', name: 'Enceladus (Gemini Smooth Male)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'gemini' },
  { id: 'Orion', name: 'Orion (Gemini Narrative Male)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'gemini' },
  { id: 'Pegasus', name: 'Pegasus (Gemini Broadcast Male)', gender: 'Male', languageCode: 'en-US', languageName: 'English (US)', provider: 'gemini' },
];

async function callGroqCompletions(prompt: string, jsonMode: boolean = false): Promise<string> {
  const apiKey = getGroqKey();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured on the server as fallback.');
  }

  const payload: any = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: jsonMode
          ? 'You are a professional audio script editor. Respond only with valid JSON. Do not write markdown blocks or any other explanation.'
          : 'You are a professional voice director. Respond only with the requested text.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
  };

  if (jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API returned status ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Groq returned an empty response.');
  }

  return content;
}

export class GeminiProvider implements AIProvider {
  public readonly name: ProviderName = 'gemini';

  public isConfigured(): boolean {
    const key = getGeminiKey();
    return Boolean(key && key.trim().length > 0);
  }

  private getClient(): GoogleGenAI {
    const key = getGeminiKey();
    if (!key) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }
    return new GoogleGenAI({ apiKey: key });
  }

  private parseScriptResponse(rawText: string): ScriptResult {
    let cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    let parsed: any;
    try {
      parsed = JSON.parse(cleanedText);
    } catch {
      const match = cleanedText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Failed to parse structured script response.');
      }
    }

    const speakers: ScriptSpeaker[] = (parsed.speakers || []).map((s: any, idx: number) => ({
      name: s.name || `Speaker ${idx + 1}`,
      voice: s.voice || (s.gender === 'FEMALE' ? 'Leda' : 'Puck'),
      provider: 'gemini' as const,
      gender: (s.gender === 'FEMALE' ? 'FEMALE' : 'MALE') as 'MALE' | 'FEMALE',
      color: s.color || (idx === 0 ? 'yellow' : idx === 1 ? 'blue' : 'red'),
    }));

    const lines: ScriptLine[] = (parsed.lines || []).map((l: any, idx: number) => ({
      id: `line-${idx + 1}-${Date.now()}`,
      speaker: l.speaker || speakers[0]?.name || 'Speaker 1',
      text: l.text || '',
      scene: l.scene || 'Scene 1',
      emotion: l.emotion || 'Natural',
      status: 'idle' as const,
    }));

    return {
      title: parsed.title || 'Generated Audio Script',
      summary: parsed.summary || 'A multi-speaker audio performance.',
      speakers,
      lines,
    };
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
          err.status === 500 || 
          err.code === 'RESOURCE_EXHAUSTED' ||
          err.message?.includes('429') ||
          err.message?.includes('503') ||
          err.message?.includes('fetch failed');

        if (!isTransient || attempt > maxRetries) {
          throw err;
        }

        const backoffMs = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 4000);
        console.warn(`[GEMINI] Transient error encountered (attempt ${attempt}/${maxRetries}). Retrying in ${backoffMs}ms...`);
        await new Promise((res) => setTimeout(res, backoffMs));
      }
    }
    throw lastError;
  }

  public async generateSpeech(params: SpeechParams): Promise<SpeechResult> {
    const ai = this.getClient();
    const speakerName = 'Speaker';
    const fullInputText = params.styleInstruction 
      ? `${params.styleInstruction}\n\n${speakerName}: ${params.text}` 
      : `${speakerName}: ${params.text}`;

    const dummySpeakerName = 'Interactant';
    const dummyVoiceName = 'Puck';
    const selectedVoice = params.voiceNameOrId || 'Algieba';

    const response = await this.executeWithRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: fullInputText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: speakerName,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: selectedVoice },
                  },
                },
                {
                  speaker: dummySpeakerName,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: dummyVoiceName },
                  },
                },
              ],
            },
          },
        },
      });
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio data returned from Gemini TTS engine.');
    }

    const audioBuffer = Buffer.from(base64Audio, 'base64');
    return {
      audioBuffer,
      contentType: 'audio/pcm;rate=24000',
      sampleRate: 24000,
      audioBase64: base64Audio,
      format: 'wav',
      durationSeconds: Math.round((audioBuffer.length / (24000 * 2)) * 10) / 10,
    };
  }

  public async generateScript(params: ScriptParams): Promise<ScriptResult> {
    const ai = this.getClient();
    const resolvedFormat = params.format || 'Podcast Dialogue';
    const resolvedStyle = params.style || 'High Energy & Engaging';
    const resolvedSpeakerCount = params.speakerCount || 2;

    const prompt = `
      You are an award-winning audio producer and script writer for broadcast and podcasts.
      Write a compelling audio script based on the following requirements:
      - Topic / Subject: "${params.topic}"
      - Format: ${resolvedFormat}
      - Style / Tone: ${resolvedStyle}
      - Number of Speakers: ${resolvedSpeakerCount}

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
      const response = await this.executeWithRetry(async () => {
        return await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
      });

      const rawText = response.text || '{}';
      return this.parseScriptResponse(rawText);
    } catch (err) {
      console.warn('[GEMINI] generateScript failed. Attempting Groq fallback...', err);
      if (getGroqKey()) {
        try {
          const groqResponse = await callGroqCompletions(prompt, true);
          return this.parseScriptResponse(groqResponse);
        } catch (groqErr) {
          console.error('[GROQ] Fallback generateScript also failed:', groqErr);
          throw err;
        }
      }
      throw err;
    }
  }

  public async generateDialogue(params: DialogueParams): Promise<DialogueResult> {
    const results: DialogueResult['lines'] = [];

    for (let i = 0; i < params.lines.length; i++) {
      const line = params.lines[i];
      const lineInstruction = params.styleInstruction 
        ? `${params.styleInstruction} Emotion: ${line.emotion || 'Natural'}.`
        : `Speak in character as ${line.speaker}. Emotion: ${line.emotion || 'Natural'}.`;

      const speech = await this.generateSpeech({
        text: line.text,
        voiceNameOrId: line.voice,
        styleInstruction: lineInstruction,
        format: params.format || 'wav',
      });

      results.push({
        id: line.id || `line-${i}-${Date.now()}`,
        speaker: line.speaker,
        text: line.text,
        audioBase64: speech.audioBase64 || speech.audioBuffer.toString('base64'),
        contentType: speech.contentType,
        sampleRate: speech.sampleRate || 24000,
      });
    }

    return { lines: results };
  }

  public async analyzeScript(rawContent: string): Promise<ScriptResult> {
    const ai = this.getClient();
    const prompt = `
      You are an expert audio script doctor and director.
      Analyze the following unformatted audio script / monologue / dialogue:
      """
      ${rawContent}
      """

      Parse the characters, dialogue lines, emotions, and scenes.
      Assign appropriate Gemini expressive voices for each speaker.

      Return a valid JSON object ONLY:
      {
        "title": "Extracted or inferred catchy title",
        "summary": "1-2 sentence synopsis",
        "speakers": [
          {
            "name": "Speaker Name",
            "gender": "MALE or FEMALE",
            "voice": "Algieba, Puck, Leda, Vindemiatrix, Fenrir, Aoede, Charon, or Kore",
            "provider": "gemini",
            "color": "red, blue, yellow, or green"
          }
        ],
        "lines": [
          {
            "speaker": "Speaker Name",
            "text": "Exact dialogue text spoken",
            "scene": "Scene or Act",
            "emotion": "Dominant emotion (e.g. Urgent, Intimate, Sarcastic)"
          }
        ]
      }
    `;

    try {
      const response = await this.executeWithRetry(async () => {
        return await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
      });

      const rawText = response.text || '{}';
      return this.parseScriptResponse(rawText);
    } catch (err) {
      console.warn('[GEMINI] analyzeScript failed. Attempting Groq fallback...', err);
      if (getGroqKey()) {
        try {
          const groqResponse = await callGroqCompletions(prompt, true);
          return this.parseScriptResponse(groqResponse);
        } catch (groqErr) {
          console.error('[GROQ] Fallback analyzeScript also failed:', groqErr);
          throw err;
        }
      }
      throw err;
    }
  }

  public async dramatize(text: string, styleInstruction?: string): Promise<string> {
    const ai = this.getClient();
    const prompt = `
      You are an award-winning voice director and monologue dramatizer.
      Rewrite the following text to make it more cinematic, expressive, and compelling for spoken audio performance.
      Maintain the original meaning, but enhance the vocabulary, dramatic pacing, and emotional resonance.

      ${styleInstruction ? `Directorial Style Note: "${styleInstruction}"` : ''}

      Original Text:
      """
      ${text}
      """

      Return ONLY the final dramatized spoken text without explanations, greetings, or quotation marks.
    `;

    try {
      const response = await this.executeWithRetry(async () => {
        return await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
      });

      return response.text?.trim() || text;
    } catch (err) {
      console.warn('[GEMINI] dramatize failed. Attempting Groq fallback...', err);
      if (getGroqKey()) {
        try {
          const groqResponse = await callGroqCompletions(prompt, false);
          return groqResponse.trim();
        } catch (groqErr) {
          console.error('[GROQ] Fallback dramatize also failed:', groqErr);
          throw err;
        }
      }
      throw err;
    }
  }

  public async generateBGM(_params: BgmParams): Promise<BgmResult> {
    throw new Error('Gemini does not currently support native music/sound generation. Use ElevenLabs provider for BGM generation.');
  }

  public async cloneVoice(_params: VoiceCloneParams): Promise<VoiceCloneResult> {
    throw new Error('Gemini neural TTS uses high-fidelity prebuilt voice profiles. Use ElevenLabs provider for custom instant voice cloning.');
  }

  public async getVoices(): Promise<VoiceInfo[]> {
    return GEMINI_PREBUILT_VOICES;
  }
}
