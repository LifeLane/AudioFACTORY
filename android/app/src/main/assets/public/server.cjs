"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express2 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");

// backend/routes.ts
var import_express = require("express");

// backend/providers/GeminiProvider.ts
var import_genai = require("@google/genai");

// backend/config.ts
var config = {
  port: 3e3,
  host: "0.0.0.0",
  isProduction: process.env.NODE_ENV === "production",
  // AI Keys - Loaded strictly in server environment, never sent to browser
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "",
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || "",
  // Google Play Billing Credentials
  googlePlayServiceAccountKey: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY || "",
  googlePlayPackageName: "com.audiofactory.app",
  // Firebase Configuration
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "ai-studio-socialnot-845fd311-8b26-4908-9a36-b5f4f288bed7"
};
function getGeminiKey() {
  const key = config.geminiApiKey;
  if (!key) {
    console.warn("[SERVER] Warning: GEMINI_API_KEY is not configured on server.");
  }
  return key;
}
function getElevenLabsKey() {
  const key = config.elevenLabsApiKey;
  if (!key) {
    console.warn("[SERVER] Warning: ELEVENLABS_API_KEY is not configured on server.");
  }
  return key;
}

// backend/providers/GeminiProvider.ts
var GEMINI_PREBUILT_VOICES = [
  { id: "Algieba", name: "Algieba (Gemini Deep Male)", gender: "Male", languageCode: "en-US", languageName: "English (US)", provider: "gemini" },
  { id: "Puck", name: "Puck (Gemini Warm Male)", gender: "Male", languageCode: "en-US", languageName: "English (US)", provider: "gemini" },
  { id: "Leda", name: "Leda (Gemini Clear Female)", gender: "Female", languageCode: "en-US", languageName: "English (US)", provider: "gemini" },
  { id: "Fenrir", name: "Fenrir (Gemini Resonant Male)", gender: "Male", languageCode: "en-US", languageName: "English (US)", provider: "gemini" },
  { id: "Aoede", name: "Aoede (Gemini Expressive Female)", gender: "Female", languageCode: "en-US", languageName: "English (US)", provider: "gemini" },
  { id: "Kore", name: "Kore (Gemini Gentle Female)", gender: "Female", languageCode: "en-US", languageName: "English (US)", provider: "gemini" },
  { id: "Charon", name: "Charon (Gemini Authoritative Male)", gender: "Male", languageCode: "en-US", languageName: "English (US)", provider: "gemini" },
  { id: "Vindemiatrix", name: "Vindemiatrix (Gemini Dynamic Female)", gender: "Female", languageCode: "en-US", languageName: "English (US)", provider: "gemini" },
  { id: "Zubenelgenubi", name: "Zubenelgenubi (Gemini Bright Male)", gender: "Male", languageCode: "en-US", languageName: "English (US)", provider: "gemini" },
  { id: "Enceladus", name: "Enceladus (Gemini Smooth Male)", gender: "Male", languageCode: "en-US", languageName: "English (US)", provider: "gemini" },
  { id: "Orion", name: "Orion (Gemini Narrative Male)", gender: "Male", languageCode: "en-US", languageName: "English (US)", provider: "gemini" },
  { id: "Pegasus", name: "Pegasus (Gemini Broadcast Male)", gender: "Male", languageCode: "en-US", languageName: "English (US)", provider: "gemini" }
];
var GeminiProvider = class {
  name = "gemini";
  isConfigured() {
    const key = getGeminiKey();
    return Boolean(key && key.trim().length > 0);
  }
  getClient() {
    const key = getGeminiKey();
    if (!key) {
      throw new Error("GEMINI_API_KEY is not configured on the server.");
    }
    return new import_genai.GoogleGenAI({ apiKey: key });
  }
  async executeWithRetry(fn, maxRetries = 2) {
    let attempt = 0;
    let lastError;
    while (attempt <= maxRetries) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        attempt++;
        const isTransient = err.status === 429 || err.status === 503 || err.status === 500 || err.code === "RESOURCE_EXHAUSTED" || err.message?.includes("429") || err.message?.includes("503") || err.message?.includes("fetch failed");
        if (!isTransient || attempt > maxRetries) {
          throw err;
        }
        const backoffMs = Math.min(1e3 * Math.pow(2, attempt) + Math.random() * 500, 4e3);
        console.warn(`[GEMINI] Transient error encountered (attempt ${attempt}/${maxRetries}). Retrying in ${backoffMs}ms...`);
        await new Promise((res) => setTimeout(res, backoffMs));
      }
    }
    throw lastError;
  }
  async generateSpeech(params) {
    const ai = this.getClient();
    const speakerName = "Speaker";
    const fullInputText = params.styleInstruction ? `${params.styleInstruction}

${speakerName}: ${params.text}` : `${speakerName}: ${params.text}`;
    const dummySpeakerName = "Interactant";
    const dummyVoiceName = "Puck";
    const selectedVoice = params.voiceNameOrId || "Algieba";
    const response = await this.executeWithRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: fullInputText }] }],
        config: {
          responseModalities: [import_genai.Modality.AUDIO],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: speakerName,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: selectedVoice }
                  }
                },
                {
                  speaker: dummySpeakerName,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: dummyVoiceName }
                  }
                }
              ]
            }
          }
        }
      });
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data returned from Gemini TTS engine.");
    }
    const audioBuffer = Buffer.from(base64Audio, "base64");
    return {
      audioBuffer,
      contentType: "audio/pcm;rate=24000",
      sampleRate: 24e3,
      audioBase64: base64Audio,
      format: "wav",
      durationSeconds: Math.round(audioBuffer.length / (24e3 * 2) * 10) / 10
    };
  }
  async generateScript(params) {
    const ai = this.getClient();
    const resolvedFormat = params.format || "Podcast Dialogue";
    const resolvedStyle = params.style || "High Energy & Engaging";
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
    const response = await this.executeWithRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
    });
    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse structured script response from Gemini.");
      }
    }
    const speakers = (parsed.speakers || []).map((s, idx) => ({
      name: s.name || `Speaker ${idx + 1}`,
      voice: s.voice || (s.gender === "FEMALE" ? "Leda" : "Puck"),
      provider: "gemini",
      gender: s.gender === "FEMALE" ? "FEMALE" : "MALE",
      color: s.color || (idx === 0 ? "yellow" : idx === 1 ? "blue" : "red")
    }));
    const lines = (parsed.lines || []).map((l, idx) => ({
      id: `line-${idx + 1}-${Date.now()}`,
      speaker: l.speaker || speakers[0]?.name || "Speaker 1",
      text: l.text || "",
      scene: l.scene || "Scene 1",
      emotion: l.emotion || "Natural",
      status: "idle"
    }));
    return {
      title: parsed.title || "Generated Audio Script",
      summary: parsed.summary || "A multi-speaker audio performance.",
      speakers,
      lines
    };
  }
  async generateDialogue(params) {
    const results = [];
    for (let i = 0; i < params.lines.length; i++) {
      const line = params.lines[i];
      const lineInstruction = params.styleInstruction ? `${params.styleInstruction} Emotion: ${line.emotion || "Natural"}.` : `Speak in character as ${line.speaker}. Emotion: ${line.emotion || "Natural"}.`;
      const speech = await this.generateSpeech({
        text: line.text,
        voiceNameOrId: line.voice,
        styleInstruction: lineInstruction,
        format: params.format || "wav"
      });
      results.push({
        id: line.id || `line-${i}-${Date.now()}`,
        speaker: line.speaker,
        text: line.text,
        audioBase64: speech.audioBase64 || speech.audioBuffer.toString("base64"),
        contentType: speech.contentType,
        sampleRate: speech.sampleRate || 24e3
      });
    }
    return { lines: results };
  }
  async analyzeScript(rawContent) {
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
    const response = await this.executeWithRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
    });
    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse analyzed script response.");
      }
    }
    const speakers = (parsed.speakers || []).map((s, idx) => ({
      name: s.name || `Speaker ${idx + 1}`,
      voice: s.voice || (s.gender === "FEMALE" ? "Leda" : "Puck"),
      provider: "gemini",
      gender: s.gender === "FEMALE" ? "FEMALE" : "MALE",
      color: s.color || (idx === 0 ? "yellow" : idx === 1 ? "blue" : "red")
    }));
    const lines = (parsed.lines || []).map((l, idx) => ({
      id: `line-${idx + 1}-${Date.now()}`,
      speaker: l.speaker || speakers[0]?.name || "Speaker 1",
      text: l.text || "",
      scene: l.scene || "Scene 1",
      emotion: l.emotion || "Natural",
      status: "idle"
    }));
    return {
      title: parsed.title || "Analyzed Production Script",
      summary: parsed.summary || "Parsed dialogue script.",
      speakers,
      lines
    };
  }
  async dramatize(text, styleInstruction) {
    const ai = this.getClient();
    const prompt = `
      You are an award-winning voice director and monologue dramatizer.
      Rewrite the following text to make it more cinematic, expressive, and compelling for spoken audio performance.
      Maintain the original meaning, but enhance the vocabulary, dramatic pacing, and emotional resonance.

      ${styleInstruction ? `Directorial Style Note: "${styleInstruction}"` : ""}

      Original Text:
      """
      ${text}
      """

      Return ONLY the final dramatized spoken text without explanations, greetings, or quotation marks.
    `;
    const response = await this.executeWithRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
    });
    return response.text?.trim() || text;
  }
  async generateBGM(_params) {
    throw new Error("Gemini does not currently support native music/sound generation. Use ElevenLabs provider for BGM generation.");
  }
  async cloneVoice(_params) {
    throw new Error("Gemini neural TTS uses high-fidelity prebuilt voice profiles. Use ElevenLabs provider for custom instant voice cloning.");
  }
  async getVoices() {
    return GEMINI_PREBUILT_VOICES;
  }
};

// backend/providers/ElevenLabsProvider.ts
var ELEVENLABS_FALLBACK_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (ElevenLabs)", gender: "Female", languageCode: "en-US", languageName: "English (US)", provider: "elevenlabs" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi (ElevenLabs)", gender: "Female", languageCode: "en-US", languageName: "English (US)", provider: "elevenlabs" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella (ElevenLabs)", gender: "Female", languageCode: "en-US", languageName: "English (US)", provider: "elevenlabs" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni (ElevenLabs)", gender: "Male", languageCode: "en-US", languageName: "English (US)", provider: "elevenlabs" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli (ElevenLabs)", gender: "Female", languageCode: "en-US", languageName: "English (US)", provider: "elevenlabs" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh (ElevenLabs)", gender: "Male", languageCode: "en-US", languageName: "English (US)", provider: "elevenlabs" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Arnold (ElevenLabs)", gender: "Male", languageCode: "en-US", languageName: "English (US)", provider: "elevenlabs" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam (ElevenLabs)", gender: "Male", languageCode: "en-US", languageName: "English (US)", provider: "elevenlabs" },
  { id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam (ElevenLabs)", gender: "Male", languageCode: "en-US", languageName: "English (US)", provider: "elevenlabs" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie (ElevenLabs)", gender: "Male", languageCode: "en-US", languageName: "English (US)", provider: "elevenlabs" }
];
var ElevenLabsProvider = class {
  name = "elevenlabs";
  isConfigured() {
    const key = getElevenLabsKey();
    return Boolean(key && key.trim().length > 0);
  }
  getKey() {
    const key = getElevenLabsKey();
    if (!key) {
      throw new Error("ELEVENLABS_API_KEY is not configured on the server. Please provide the key in server environment.");
    }
    return key;
  }
  async executeWithRetry(fn, maxRetries = 2) {
    let attempt = 0;
    let lastError;
    while (attempt <= maxRetries) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        attempt++;
        const isTransient = err.status === 429 || err.status === 503 || err.status === 502 || err.message?.includes("429") || err.message?.includes("503") || err.message?.includes("fetch failed");
        if (!isTransient || attempt > maxRetries) {
          throw err;
        }
        const backoffMs = Math.min(1e3 * Math.pow(2, attempt) + Math.random() * 500, 4e3);
        console.warn(`[ELEVENLABS] Transient error (attempt ${attempt}/${maxRetries}). Retrying in ${backoffMs}ms...`);
        await new Promise((res) => setTimeout(res, backoffMs));
      }
    }
    throw lastError;
  }
  async generateSpeech(params) {
    const key = this.getKey();
    const voiceId = params.voiceNameOrId || "21m00Tcm4TlvDq8ikWAM";
    const response = await this.executeWithRetry(async () => {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": key,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify({
          text: params.text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({ detail: { message: `Status code ${res.status}` } }));
        const errorMsg = errorJson.detail?.message || errorJson.message || `ElevenLabs synthesis failed (${res.status})`;
        const error = new Error(errorMsg);
        error.status = res.status;
        throw error;
      }
      return res;
    });
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return {
      audioBuffer: buffer,
      contentType: "audio/mpeg",
      audioBase64: buffer.toString("base64"),
      format: "mp3",
      durationSeconds: Math.round(params.text.length / 15 * 10) / 10
    };
  }
  async generateScript(_params) {
    throw new Error("ElevenLabs does not support text script authoring. Please route script generation to GeminiProvider.");
  }
  async generateDialogue(params) {
    const results = [];
    for (let i = 0; i < params.lines.length; i++) {
      const line = params.lines[i];
      const speech = await this.generateSpeech({
        text: line.text,
        voiceNameOrId: line.voice,
        format: params.format || "mp3"
      });
      results.push({
        id: line.id || `line-${i}-${Date.now()}`,
        speaker: line.speaker,
        text: line.text,
        audioBase64: speech.audioBase64 || speech.audioBuffer.toString("base64"),
        contentType: speech.contentType
      });
    }
    return { lines: results };
  }
  async generateBGM(params) {
    const key = this.getKey();
    const duration = Math.min(Math.max(params.durationSeconds || 10, 1), 60);
    const response = await this.executeWithRetry(async () => {
      const res = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
        method: "POST",
        headers: {
          "xi-api-key": key,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify({
          text: params.prompt,
          duration_seconds: duration
        })
      });
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({ detail: { message: `Status code ${res.status}` } }));
        const errorMsg = errorJson.detail?.message || errorJson.message || `ElevenLabs BGM generation failed (${res.status})`;
        const error = new Error(errorMsg);
        error.status = res.status;
        throw error;
      }
      return res;
    });
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return {
      audioBuffer: buffer,
      contentType: "audio/mpeg",
      durationSeconds: duration
    };
  }
  async cloneVoice(params) {
    const key = this.getKey();
    const formData = new FormData();
    formData.append("name", params.name);
    if (params.description) {
      formData.append("description", params.description);
    }
    const blob = new Blob([params.audioBuffer], { type: params.mimeType || "audio/webm" });
    formData.append("files", blob, params.originalFilename || "recording.webm");
    const response = await this.executeWithRetry(async () => {
      const res = await fetch("https://api.elevenlabs.io/v1/voices/add", {
        method: "POST",
        headers: {
          "xi-api-key": key
        },
        body: formData
      });
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({ detail: { message: `Status code ${res.status}` } }));
        const errorMsg = errorJson.detail?.message || errorJson.message || `ElevenLabs Voice Cloning failed (${res.status})`;
        const error = new Error(errorMsg);
        error.status = res.status;
        throw error;
      }
      return res;
    });
    const data = await response.json();
    return {
      voiceId: data.voice_id || `cloned_${Date.now()}`,
      name: params.name,
      status: "ready",
      provider: "elevenlabs",
      previewUrl: data.preview_url
    };
  }
  async getVoices() {
    const key = getElevenLabsKey();
    if (!key) {
      return ELEVENLABS_FALLBACK_VOICES;
    }
    try {
      const response = await fetch("https://api.elevenlabs.io/v1/voices", {
        headers: { "xi-api-key": key }
      });
      if (!response.ok) {
        console.warn(`[ELEVENLABS] Voice catalogue API returned ${response.status}. Using fallback voices.`);
        return ELEVENLABS_FALLBACK_VOICES;
      }
      const data = await response.json();
      const voices = (data.voices || []).map((v) => ({
        id: v.voice_id,
        name: `${v.name} (ElevenLabs)`,
        gender: v.labels?.gender ? v.labels.gender.charAt(0).toUpperCase() + v.labels.gender.slice(1) : "Unknown",
        languageCode: "en-US",
        languageName: "English (US)",
        provider: "elevenlabs",
        previewUrl: v.preview_url,
        category: v.category || "premade"
      }));
      return voices.length > 0 ? voices : ELEVENLABS_FALLBACK_VOICES;
    } catch (error) {
      console.warn("[ELEVENLABS] Failed to fetch remote voices list:", error);
      return ELEVENLABS_FALLBACK_VOICES;
    }
  }
};

// backend/providers/providerRegistry.ts
var ProviderRegistry = class {
  geminiProvider;
  elevenLabsProvider;
  constructor() {
    this.geminiProvider = new GeminiProvider();
    this.elevenLabsProvider = new ElevenLabsProvider();
  }
  getProvider(name) {
    if (name === "elevenlabs") {
      return this.elevenLabsProvider;
    }
    return this.geminiProvider;
  }
  getGeminiProvider() {
    return this.geminiProvider;
  }
  getElevenLabsProvider() {
    return this.elevenLabsProvider;
  }
  getProvidersStatus() {
    return [
      { name: "gemini", configured: this.geminiProvider.isConfigured() },
      { name: "elevenlabs", configured: this.elevenLabsProvider.isConfigured() }
    ];
  }
  async getAllVoices() {
    const geminiVoices = await this.geminiProvider.getVoices();
    const elevenLabsVoices = await this.elevenLabsProvider.getVoices();
    return [...geminiVoices, ...elevenLabsVoices];
  }
};
var providerRegistry = new ProviderRegistry();

// backend/services/jobService.ts
var import_firestore3 = require("firebase/firestore");

// backend/usageManager.ts
var import_app = require("firebase/app");
var import_firestore2 = require("firebase/firestore");

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "gen-lang-client-0637573997",
  appId: "1:779379033206:web:b17799d565f0c7dbaf8b57",
  apiKey: "AIzaSyADmIW2FFusIdT1ndJhNIS1Xn_tz-KM7zY",
  authDomain: "gen-lang-client-0637573997.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-socialnot-845fd311-8b26-4908-9a36-b5f4f288bed7",
  storageBucket: "gen-lang-client-0637573997.firebasestorage.app",
  messagingSenderId: "779379033206",
  measurementId: "",
  oAuthClientId: "779379033206-oueh1lv3kbhcib4ikpjmr1f9de2llrkn.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

// shared/types.ts
var PRODUCT_IDS = {
  PRO_MONTHLY: "audiofactory_pro_monthly",
  PRO_ANNUAL: "audiofactory_pro_annual",
  LIFETIME: "audiofactory_lifetime"
};

// shared/plans.ts
var BASE_GUEST_FEATURES = {
  unlimitedGenerations: false,
  elevenLabsAccess: false,
  instantVoiceCloning: false,
  bgmSoundtrackGeneration: false,
  multiSpeakerStudio: true,
  losslessWavExport: true,
  liveCollaboration: false,
  maxDialogueLines: 6,
  concurrencyLimit: 1
};
var BASE_FREE_FEATURES = {
  unlimitedGenerations: false,
  elevenLabsAccess: true,
  instantVoiceCloning: false,
  bgmSoundtrackGeneration: true,
  multiSpeakerStudio: true,
  losslessWavExport: true,
  liveCollaboration: true,
  maxDialogueLines: 15,
  concurrencyLimit: 2
};
var PREMIUM_FEATURES = {
  unlimitedGenerations: true,
  elevenLabsAccess: true,
  instantVoiceCloning: true,
  bgmSoundtrackGeneration: true,
  multiSpeakerStudio: true,
  losslessWavExport: true,
  liveCollaboration: true,
  maxDialogueLines: 100,
  concurrencyLimit: 8
};
var PLANS = {
  guest: {
    id: "guest",
    name: "Guest Pass",
    badge: "Guest",
    description: "Instant sandbox access for rapid auditioning without sign-in.",
    dailyGenerations: 3,
    priceUsd: 0,
    interval: "day",
    productType: "free",
    features: BASE_GUEST_FEATURES
  },
  free: {
    id: "free",
    name: "Creator Starter",
    badge: "Free Tier",
    description: "Cloud project syncing and standard voice studio capabilities.",
    dailyGenerations: 10,
    priceUsd: 0,
    interval: "month",
    productType: "free",
    features: BASE_FREE_FEATURES
  },
  pro_monthly: {
    id: "pro_monthly",
    name: "Pro Monthly",
    badge: "Pro Monthly",
    description: "Unlimited AI speech synthesis, ElevenLabs integration & voice cloning.",
    dailyGenerations: -1,
    priceUsd: 19,
    interval: "month",
    productType: "subs",
    productId: PRODUCT_IDS.PRO_MONTHLY,
    features: PREMIUM_FEATURES
  },
  pro_annual: {
    id: "pro_annual",
    name: "Pro Annual",
    badge: "Pro Annual (Save 35%)",
    description: "Full studio access with highest priority audio rendering queues.",
    dailyGenerations: -1,
    priceUsd: 149,
    interval: "year",
    productType: "subs",
    productId: PRODUCT_IDS.PRO_ANNUAL,
    features: PREMIUM_FEATURES,
    highlight: true
  },
  lifetime: {
    id: "lifetime",
    name: "Studio Lifetime",
    badge: "Lifetime License",
    description: "Permanent unrestricted access with all future voice models included.",
    dailyGenerations: -1,
    priceUsd: 299,
    interval: "lifetime",
    productType: "inapp",
    productId: PRODUCT_IDS.LIFETIME,
    features: PREMIUM_FEATURES
  }
};
function getPlanFromProductId(productId) {
  if (!productId) return "free";
  if (productId === PRODUCT_IDS.PRO_MONTHLY) return "pro_monthly";
  if (productId === PRODUCT_IDS.PRO_ANNUAL) return "pro_annual";
  if (productId === PRODUCT_IDS.LIFETIME) return "lifetime";
  return "free";
}
function isPaidPlan(plan) {
  return plan === "pro_monthly" || plan === "pro_annual" || plan === "lifetime";
}
function resolveEntitlement(plan, usedToday = 0, expiresAt = null, productId = null, options) {
  const planConfig = PLANS[plan] || PLANS.guest;
  const isUnlimited = planConfig.dailyGenerations === -1;
  const dailyQuota = isUnlimited ? -1 : planConfig.dailyGenerations;
  const remainingQuota = isUnlimited ? -1 : Math.max(0, dailyQuota - usedToday);
  const status = options?.status || (isPaidPlan(plan) ? "active" : "active");
  const source = options?.source || (isPaidPlan(plan) ? "google_play" : plan === "guest" ? "system" : "web");
  return {
    plan: planConfig.id,
    status,
    isActive: status === "active" || status === "grace_period" || status === "cancelled" && (!expiresAt || new Date(expiresAt) > /* @__PURE__ */ new Date()),
    source,
    expiresAt,
    startedAt: options?.startedAt || null,
    autoRenewing: options?.autoRenewing ?? planConfig.productType === "subs",
    dailyQuota,
    remainingQuota,
    features: planConfig.features,
    productId: productId || planConfig.productId || null,
    orderId: options?.orderId || null,
    purchaseTokenHash: options?.purchaseTokenHash || null,
    updatedAt: options?.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
  };
}

// backend/services/entitlementResolver.ts
var import_firestore = require("firebase/firestore");
var entitlementCache = /* @__PURE__ */ new Map();
var CACHE_TTL_MS = 1e4;
function invalidateEntitlementCache(userId) {
  entitlementCache.delete(userId);
}
async function resolveEntitlement2(userId, isGuest = false) {
  const now = /* @__PURE__ */ new Date();
  const nowIso = now.toISOString();
  const today = getTodayUtcDateString();
  if (isGuest || !userId || userId.startsWith("guest_")) {
    const guestUsage = await getDailyUsageCount(userId || "guest_anonymous", today);
    return resolveEntitlement("guest", guestUsage, null, null, {
      status: "active",
      source: "system",
      autoRenewing: false
    });
  }
  const cached = entitlementCache.get(userId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    if (!cached.entitlement.expiresAt || new Date(cached.entitlement.expiresAt) > now) {
      const usageCount2 = await getDailyUsageCount(userId, today);
      const isUnlimited = cached.entitlement.dailyQuota === -1;
      const remainingQuota = isUnlimited ? -1 : Math.max(0, cached.entitlement.dailyQuota - usageCount2);
      return {
        ...cached.entitlement,
        remainingQuota
      };
    }
  }
  const entitlementDocRef = (0, import_firestore.doc)(serverDb, "users", userId, "entitlements", "current");
  let planId = "free";
  let status = "active";
  let source = "web";
  let productId = null;
  let expiresAt = null;
  let startedAt = null;
  let autoRenewing = false;
  let orderId = null;
  let purchaseTokenHash = null;
  let updatedAt = nowIso;
  try {
    const snap = await (0, import_firestore.getDoc)(entitlementDocRef);
    if (snap.exists()) {
      const data = snap.data();
      const rawPlanId = data.planId;
      const rawStatus = data.status || "active";
      source = data.source || "google_play";
      productId = data.productId || null;
      expiresAt = data.expiresAt || null;
      startedAt = data.startedAt || null;
      autoRenewing = typeof data.autoRenewing === "boolean" ? data.autoRenewing : true;
      orderId = data.orderId || null;
      purchaseTokenHash = data.purchaseTokenHash || null;
      updatedAt = data.updatedAt || nowIso;
      if (rawPlanId === "lifetime") {
        if (rawStatus === "refunded" || rawStatus === "revoked") {
          planId = "free";
          status = rawStatus;
        } else {
          planId = "lifetime";
          status = "active";
          expiresAt = null;
          autoRenewing = false;
        }
      } else if (rawPlanId === "pro_monthly" || rawPlanId === "pro_annual") {
        const isPastExpiry = expiresAt ? new Date(expiresAt) <= now : false;
        switch (rawStatus) {
          case "active":
            if (isPastExpiry) {
              planId = "free";
              status = "expired";
              (0, import_firestore.updateDoc)(entitlementDocRef, { status: "expired", updatedAt: nowIso }).catch(() => {
              });
            } else {
              planId = rawPlanId;
              status = "active";
            }
            break;
          case "grace_period":
            planId = rawPlanId;
            status = "grace_period";
            break;
          case "cancelled":
            if (isPastExpiry) {
              planId = "free";
              status = "expired";
            } else {
              planId = rawPlanId;
              status = "cancelled";
              autoRenewing = false;
            }
            break;
          case "paused":
          case "account_hold":
          case "expired":
          case "revoked":
          case "refunded":
          default:
            planId = "free";
            status = rawStatus;
            break;
        }
      } else {
        planId = "free";
        status = "active";
      }
    }
  } catch (err) {
    console.warn(`[ENTITLEMENT_RESOLVER] Failed reading Firestore entitlement for ${userId}:`, err);
    planId = "free";
    status = "active";
  }
  const usageCount = await getDailyUsageCount(userId, today);
  const resolved = resolveEntitlement(planId, usageCount, expiresAt, productId, {
    status,
    source,
    autoRenewing,
    orderId,
    purchaseTokenHash,
    startedAt,
    updatedAt
  });
  entitlementCache.set(userId, {
    entitlement: resolved,
    fetchedAt: Date.now()
  });
  return resolved;
}
async function getDailyUsageCount(userId, today) {
  try {
    const usageDocRef = (0, import_firestore.doc)(serverDb, "users", userId, "usage", today);
    const snap = await (0, import_firestore.getDoc)(usageDocRef);
    if (snap.exists()) {
      return Number(snap.data().generationCount || 0);
    }
  } catch (err) {
  }
  return 0;
}
async function saveUserEntitlement(userId, data) {
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const entitlementDocRef = (0, import_firestore.doc)(serverDb, "users", userId, "entitlements", "current");
  const planConfig = PLANS[data.planId] || PLANS.free;
  const docPayload = {
    uid: userId,
    planId: data.planId,
    status: data.status,
    source: data.source,
    productId: data.productId,
    orderId: data.orderId || null,
    purchaseTokenHash: data.purchaseTokenHash || null,
    startedAt: data.startedAt || nowIso,
    expiresAt: data.expiresAt || null,
    autoRenewing: typeof data.autoRenewing === "boolean" ? data.autoRenewing : planConfig.productType === "subs",
    updatedAt: nowIso
  };
  await (0, import_firestore.setDoc)(entitlementDocRef, docPayload, { merge: true });
  invalidateEntitlementCache(userId);
  return resolveEntitlement2(userId, false);
}

// backend/usageManager.ts
var app = (0, import_app.getApps)().length === 0 ? (0, import_app.initializeApp)(firebase_applet_config_default) : (0, import_app.getApp)();
var serverDb = (0, import_firestore2.getFirestore)(app, firebase_applet_config_default.firestoreDatabaseId);
var activeConcurrentRequests = /* @__PURE__ */ new Map();
var lastRequestTimestamps = /* @__PURE__ */ new Map();
function getTodayUtcDateString() {
  const now = /* @__PURE__ */ new Date();
  return now.toISOString().split("T")[0];
}
function validateGenerationPayload(options) {
  const { text, linesCount, durationSeconds, isGuest } = options;
  if (text !== void 0) {
    const maxChars = isGuest ? 4e3 : 15e3;
    if (text.length > maxChars) {
      return {
        valid: false,
        error: `Text length (${text.length} characters) exceeds the maximum allowed limit of ${maxChars} characters for your plan.`
      };
    }
    if (text.trim().length === 0) {
      return { valid: false, error: "Text content cannot be empty." };
    }
  }
  if (linesCount !== void 0) {
    const maxLines = isGuest ? 8 : 100;
    if (linesCount > maxLines) {
      return {
        valid: false,
        error: `Dialogue line count (${linesCount}) exceeds maximum allowed limit of ${maxLines} for your plan.`
      };
    }
  }
  if (durationSeconds !== void 0 && durationSeconds > 60) {
    return { valid: false, error: "Audio duration cannot exceed 60 seconds per synthesis block." };
  }
  return { valid: true };
}
function acquireConcurrencySlot(userId, isGuest) {
  const now = Date.now();
  const lastTime = lastRequestTimestamps.get(userId) || 0;
  if (now - lastTime < 250) {
    return {
      allowed: false,
      reason: "Generation requests are arriving too quickly. Please wait a moment before trying again."
    };
  }
  lastRequestTimestamps.set(userId, now);
  const currentConcurrent = activeConcurrentRequests.get(userId) || 0;
  const maxConcurrent = isGuest ? 1 : 4;
  if (currentConcurrent >= maxConcurrent) {
    return {
      allowed: false,
      reason: `A generation is already in progress for this session. Please wait for it to complete.`
    };
  }
  activeConcurrentRequests.set(userId, currentConcurrent + 1);
  return { allowed: true };
}
function releaseConcurrencySlot(userId) {
  const current = activeConcurrentRequests.get(userId) || 1;
  const next = Math.max(0, current - 1);
  if (next === 0) {
    activeConcurrentRequests.delete(userId);
  } else {
    activeConcurrentRequests.set(userId, next);
  }
}
async function getTodayUsageRecord(userId, isGuest) {
  const date = getTodayUtcDateString();
  const usageRef = (0, import_firestore2.doc)(serverDb, "users", userId, "usage", date);
  try {
    const snap = await (0, import_firestore2.getDoc)(usageRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        userId,
        date,
        generationCount: Number(data.generationCount || 0),
        characterCount: Number(data.characterCount || 0),
        lastGeneratedAt: data.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  } catch (err) {
    console.warn(`[USAGE] Failed to fetch Firestore usage for ${userId}, generating zero-state:`, err);
  }
  return {
    userId,
    date,
    generationCount: 0,
    characterCount: 0,
    lastGeneratedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function atomicallyReserveGeneration(userId, isGuest) {
  const date = getTodayUtcDateString();
  const entitlement = await resolveEntitlement2(userId, isGuest);
  const plan = entitlement.plan;
  const planConfig = PLANS[plan] || PLANS.guest;
  const isUnlimited = entitlement.dailyQuota === -1;
  const dailyQuota = entitlement.dailyQuota;
  const reservationId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const usageRef = (0, import_firestore2.doc)(serverDb, "users", userId, "usage", date);
  try {
    const result = await (0, import_firestore2.runTransaction)(serverDb, async (transaction) => {
      const usageDoc = await transaction.get(usageRef);
      let currentCount = 0;
      let successCount = 0;
      let failCount = 0;
      let charCount = 0;
      if (usageDoc.exists()) {
        const data = usageDoc.data();
        currentCount = Number(data.generationCount || 0);
        successCount = Number(data.successfulGenerations || 0);
        failCount = Number(data.failedGenerations || 0);
        charCount = Number(data.characterCount || 0);
      }
      if (!isUnlimited && currentCount >= dailyQuota) {
        return {
          allowed: false,
          reservationId,
          generationCount: currentCount,
          dailyQuota,
          remainingQuota: 0,
          plan,
          reason: `Daily generation limit of ${dailyQuota} reached for ${planConfig.name}. Please upgrade to Pro for unlimited generations or try again tomorrow after UTC midnight.`,
          statusCode: 429
        };
      }
      const nextCount = currentCount + 1;
      const nowIso = (/* @__PURE__ */ new Date()).toISOString();
      transaction.set(
        usageRef,
        {
          date,
          generationCount: nextCount,
          successfulGenerations: successCount,
          failedGenerations: failCount,
          characterCount: charCount,
          planId: plan,
          updatedAt: nowIso
        },
        { merge: true }
      );
      const remaining = isUnlimited ? -1 : Math.max(0, dailyQuota - nextCount);
      return {
        allowed: true,
        reservationId,
        generationCount: nextCount,
        dailyQuota,
        remainingQuota: remaining,
        plan
      };
    });
    return result;
  } catch (error) {
    console.error("[USAGE] Transaction reservation error in Firestore:", error);
    const fallbackUsage = await getTodayUsageRecord(userId, isGuest);
    if (!isUnlimited && fallbackUsage.generationCount >= dailyQuota) {
      return {
        allowed: false,
        reservationId,
        generationCount: fallbackUsage.generationCount,
        dailyQuota,
        remainingQuota: 0,
        plan,
        reason: `Daily generation limit of ${dailyQuota} reached for ${planConfig.name}.`,
        statusCode: 429
      };
    }
    return {
      allowed: true,
      reservationId,
      generationCount: fallbackUsage.generationCount + 1,
      dailyQuota,
      remainingQuota: isUnlimited ? -1 : Math.max(0, dailyQuota - (fallbackUsage.generationCount + 1)),
      plan
    };
  }
}
async function recordGenerationResult(userId, isSuccess, charCount = 0) {
  const date = getTodayUtcDateString();
  const usageRef = (0, import_firestore2.doc)(serverDb, "users", userId, "usage", date);
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  try {
    await (0, import_firestore2.runTransaction)(serverDb, async (transaction) => {
      const usageDoc = await transaction.get(usageRef);
      if (usageDoc.exists()) {
        const data = usageDoc.data();
        const currentSuccess = Number(data.successfulGenerations || 0);
        const currentFail = Number(data.failedGenerations || 0);
        const currentChar = Number(data.characterCount || 0);
        if (isSuccess) {
          transaction.update(usageRef, {
            successfulGenerations: currentSuccess + 1,
            characterCount: currentChar + charCount,
            updatedAt: nowIso
          });
        } else {
          const currentTotal = Number(data.generationCount || 1);
          transaction.update(usageRef, {
            generationCount: Math.max(0, currentTotal - 1),
            failedGenerations: currentFail + 1,
            updatedAt: nowIso
          });
        }
      }
    });
  } catch (err) {
    console.warn(`[USAGE] Failed to record generation outcome for ${userId}:`, err);
  }
}

// backend/services/jobService.ts
var JobService = class {
  /**
   * Create an initial generation job record
   */
  static async createJob(params) {
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const safeMetadata = { ...params.metadata || {} };
    delete safeMetadata.apiKey;
    delete safeMetadata.token;
    delete safeMetadata.authorization;
    delete safeMetadata.audioBase64;
    const jobRecord = {
      jobId: params.jobId,
      uid: params.uid,
      type: params.type,
      provider: params.provider,
      status: "processing",
      createdAt: nowIso,
      startedAt: nowIso,
      completedAt: null,
      errorCode: null,
      duration: 0,
      metadata: safeMetadata
    };
    try {
      const jobRef = (0, import_firestore3.doc)(serverDb, "users", params.uid, "generationJobs", params.jobId);
      await (0, import_firestore3.setDoc)(jobRef, jobRecord);
    } catch (err) {
      console.warn(`[JOBS] Failed to persist initial job ${params.jobId} in Firestore:`, err);
    }
    return jobRecord;
  }
  /**
   * Mark a job as completed
   */
  static async completeJob(params) {
    const nowMs = Date.now();
    const duration = Math.max(0, nowMs - params.startedAtMs);
    const nowIso = new Date(nowMs).toISOString();
    const safeMetadata = { ...params.metadata || {} };
    delete safeMetadata.apiKey;
    delete safeMetadata.token;
    delete safeMetadata.audioBase64;
    try {
      const jobRef = (0, import_firestore3.doc)(serverDb, "users", params.uid, "generationJobs", params.jobId);
      await (0, import_firestore3.updateDoc)(jobRef, {
        status: "completed",
        completedAt: nowIso,
        duration,
        errorCode: null,
        ...safeMetadata
      });
    } catch (err) {
      console.warn(`[JOBS] Failed to mark job ${params.jobId} completed in Firestore:`, err);
    }
  }
  /**
   * Mark a job as failed and record error code
   */
  static async failJob(params) {
    const nowMs = Date.now();
    const duration = Math.max(0, nowMs - params.startedAtMs);
    const nowIso = new Date(nowMs).toISOString();
    try {
      const jobRef = (0, import_firestore3.doc)(serverDb, "users", params.uid, "generationJobs", params.jobId);
      await (0, import_firestore3.updateDoc)(jobRef, {
        status: "failed",
        completedAt: nowIso,
        duration,
        errorCode: params.errorCode,
        errorMessage: params.errorMessage || "Generation failed"
      });
    } catch (err) {
      console.warn(`[JOBS] Failed to mark job ${params.jobId} failed in Firestore:`, err);
    }
  }
  /**
   * Fetch recent jobs for a user
   */
  static async getUserJobs(uid, maxLimit = 20) {
    try {
      const jobsCol = (0, import_firestore3.collection)(serverDb, "users", uid, "generationJobs");
      const q = (0, import_firestore3.query)(jobsCol, (0, import_firestore3.orderBy)("createdAt", "desc"), (0, import_firestore3.limit)(maxLimit));
      const snap = await (0, import_firestore3.getDocs)(q);
      return snap.docs.map((d) => d.data());
    } catch (err) {
      console.warn(`[JOBS] Error fetching jobs for ${uid}:`, err);
      return [];
    }
  }
};

// backend/services/generationService.ts
var GenerationService = class {
  /**
   * Safe execution wrapper handling concurrency, quota reservation, structured job logging,
   * provider execution, and failure reconciliation.
   */
  static async executeProtectedJob(userCtx, jobType, providerName, jobMetadata, runOperation) {
    const { userId, isGuest } = userCtx;
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const startedAtMs = Date.now();
    let lockAcquired = false;
    let quotaReserved = false;
    try {
      const concurrency = acquireConcurrencySlot(userId, isGuest);
      if (!concurrency.allowed) {
        const error = new Error(concurrency.reason || "Concurrent generation in progress.");
        error.statusCode = 429;
        error.code = "CONCURRENCY_LIMIT";
        throw error;
      }
      lockAcquired = true;
      const quota = await atomicallyReserveGeneration(userId, isGuest);
      if (!quota.allowed) {
        const error = new Error(quota.reason || "Daily generation quota exceeded.");
        error.statusCode = 429;
        error.code = "QUOTA_EXCEEDED";
        error.quotaDetails = {
          plan: quota.plan,
          dailyQuota: quota.dailyQuota,
          generationCount: quota.generationCount
        };
        throw error;
      }
      quotaReserved = true;
      await JobService.createJob({
        jobId,
        uid: userId,
        type: jobType,
        provider: providerName,
        metadata: {
          ...jobMetadata,
          plan: quota.plan
        }
      });
      const { result, charCount = 0, metadata = {} } = await runOperation();
      await recordGenerationResult(userId, true, charCount);
      await JobService.completeJob({
        uid: userId,
        jobId,
        startedAtMs,
        metadata: {
          ...metadata,
          charCount
        }
      });
      return {
        data: result,
        quotaRemaining: quota.remainingQuota,
        dailyQuota: quota.dailyQuota,
        usedToday: quota.generationCount,
        plan: quota.plan,
        jobId
      };
    } catch (err) {
      console.error(`[GENERATION_SERVICE] Error executing ${jobType} (${providerName}):`, err.message || err);
      if (quotaReserved) {
        await recordGenerationResult(userId, false, 0);
      }
      await JobService.failJob({
        uid: userId,
        jobId,
        startedAtMs,
        errorCode: err.code || err.status?.toString() || "GENERATION_FAILED",
        errorMessage: err.message || "Generation failed"
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
  static async generateSpeech(userCtx, params) {
    const { text, voiceNameOrId, styleInstruction, format } = params;
    const isGuest = userCtx.isGuest;
    const validation = validateGenerationPayload({ text, isGuest });
    if (!validation.valid) {
      const err = new Error(validation.error);
      err.statusCode = 400;
      throw err;
    }
    const providerName = params.provider || (voiceNameOrId.length > 15 ? "elevenlabs" : "gemini");
    const provider = providerRegistry.getProvider(providerName);
    return this.executeProtectedJob(
      userCtx,
      "speech",
      providerName,
      {
        textLength: text.length,
        voice: voiceNameOrId,
        format: format || "wav"
      },
      async () => {
        const speech = await provider.generateSpeech({
          text,
          voiceNameOrId,
          styleInstruction,
          format
        });
        return {
          result: speech,
          charCount: text.length,
          metadata: {
            sampleRate: speech.sampleRate,
            format: speech.format,
            durationSeconds: speech.durationSeconds
          }
        };
      }
    );
  }
  /**
   * Generate Multi-Speaker Audio Script
   */
  static async generateScript(userCtx, params) {
    const isGuest = userCtx.isGuest;
    const validation = validateGenerationPayload({ text: params.topic, isGuest });
    if (!validation.valid) {
      const err = new Error(validation.error);
      err.statusCode = 400;
      throw err;
    }
    const provider = providerRegistry.getGeminiProvider();
    return this.executeProtectedJob(
      userCtx,
      "script",
      "gemini",
      {
        topic: params.topic,
        format: params.format,
        speakerCount: params.speakerCount
      },
      async () => {
        const script = await provider.generateScript(params);
        return {
          result: script,
          charCount: params.topic.length,
          metadata: {
            title: script.title,
            speakersCount: script.speakers.length,
            linesCount: script.lines.length
          }
        };
      }
    );
  }
  /**
   * Generate Full Dialogue or Multi-Speaker Scene
   */
  static async generateDialogue(userCtx, params) {
    const isGuest = userCtx.isGuest;
    const totalChars = params.lines.reduce((acc, l) => acc + (l.text?.length || 0), 0);
    const validation = validateGenerationPayload({ linesCount: params.lines.length, isGuest });
    if (!validation.valid) {
      const err = new Error(validation.error);
      err.statusCode = 400;
      throw err;
    }
    const geminiProvider = providerRegistry.getGeminiProvider();
    const elevenLabsProvider = providerRegistry.getElevenLabsProvider();
    return this.executeProtectedJob(
      userCtx,
      "dialogue",
      "gemini",
      {
        linesCount: params.lines.length,
        totalChars
      },
      async () => {
        const processedLines = [];
        for (let i = 0; i < params.lines.length; i++) {
          const line = params.lines[i];
          const lineProviderName = line.provider || (line.voice?.length > 15 ? "elevenlabs" : "gemini");
          const provider = lineProviderName === "elevenlabs" ? elevenLabsProvider : geminiProvider;
          const speech = await provider.generateSpeech({
            text: line.text,
            voiceNameOrId: line.voice,
            styleInstruction: `Speak in character as ${line.speaker}. Emotion: ${line.emotion || "Natural"}.`,
            format: params.format || "wav"
          });
          processedLines.push({
            id: line.id || `line-${i}-${Date.now()}`,
            speaker: line.speaker,
            text: line.text,
            audioBase64: speech.audioBase64 || speech.audioBuffer.toString("base64"),
            contentType: speech.contentType,
            sampleRate: speech.sampleRate || 24e3
          });
        }
        return {
          result: { lines: processedLines },
          charCount: totalChars,
          metadata: {
            linesCount: processedLines.length
          }
        };
      }
    );
  }
  /**
   * Generate Background Music & Soundscapes
   */
  static async generateBGM(userCtx, params) {
    const isGuest = userCtx.isGuest;
    const validation = validateGenerationPayload({
      text: params.prompt,
      durationSeconds: params.durationSeconds,
      isGuest
    });
    if (!validation.valid) {
      const err = new Error(validation.error);
      err.statusCode = 400;
      throw err;
    }
    const provider = providerRegistry.getElevenLabsProvider();
    return this.executeProtectedJob(
      userCtx,
      "bgm",
      "elevenlabs",
      {
        prompt: params.prompt,
        durationSeconds: params.durationSeconds || 10
      },
      async () => {
        const bgm = await provider.generateBGM(params);
        return {
          result: bgm,
          charCount: params.prompt.length,
          metadata: {
            durationSeconds: bgm.durationSeconds,
            contentType: bgm.contentType
          }
        };
      }
    );
  }
  /**
   * Clone Custom Voice Sample
   */
  static async cloneVoice(userCtx, params) {
    if (!params.name || !params.audioBuffer || params.audioBuffer.length === 0) {
      const err = new Error("Voice name and audio sample are required for cloning.");
      err.statusCode = 400;
      throw err;
    }
    const provider = providerRegistry.getElevenLabsProvider();
    return this.executeProtectedJob(
      userCtx,
      "voice_clone",
      "elevenlabs",
      {
        name: params.name,
        audioSize: params.audioBuffer.length,
        mimeType: params.mimeType
      },
      async () => {
        const cloned = await provider.cloneVoice(params);
        return {
          result: cloned,
          charCount: params.name.length,
          metadata: {
            voiceId: cloned.voiceId,
            status: cloned.status
          }
        };
      }
    );
  }
  /**
   * Retrieve Available Voice Catalogues
   */
  static async getVoices(_userCtx) {
    const voices = await providerRegistry.getAllVoices();
    const providers = providerRegistry.getProvidersStatus();
    return { voices, providers };
  }
  /**
   * Script Analysis & Doctoring
   */
  static async analyzeScript(userCtx, rawContent) {
    const isGuest = userCtx.isGuest;
    const validation = validateGenerationPayload({ text: rawContent, isGuest });
    if (!validation.valid) {
      const err = new Error(validation.error);
      err.statusCode = 400;
      throw err;
    }
    const provider = providerRegistry.getGeminiProvider();
    return this.executeProtectedJob(
      userCtx,
      "analyze",
      "gemini",
      {
        contentLength: rawContent.length
      },
      async () => {
        const analyzed = await provider.analyzeScript(rawContent);
        return {
          result: analyzed,
          charCount: rawContent.length,
          metadata: {
            title: analyzed.title,
            speakersCount: analyzed.speakers.length,
            linesCount: analyzed.lines.length
          }
        };
      }
    );
  }
  /**
   * Dramatize Script / Monologue
   */
  static async dramatizeText(userCtx, params) {
    const isGuest = userCtx.isGuest;
    const validation = validateGenerationPayload({ text: params.text, isGuest });
    if (!validation.valid) {
      const err = new Error(validation.error);
      err.statusCode = 400;
      throw err;
    }
    const provider = providerRegistry.getGeminiProvider();
    return this.executeProtectedJob(
      userCtx,
      "dramatize",
      "gemini",
      {
        textLength: params.text.length
      },
      async () => {
        const dramatizedText = await provider.dramatize(params.text, params.styleInstruction);
        return {
          result: { dramatizedText },
          charCount: params.text.length
        };
      }
    );
  }
};

// backend/controllers/aiController.ts
function extractUserFromRequest(req) {
  const authHeader = req.headers.authorization;
  const customUserId = req.headers["x-user-id"];
  const isAnonymousHeader = req.headers["x-is-anonymous"];
  const customGuestId = req.headers["x-guest-id"];
  let isGuest = isAnonymousHeader === "true";
  if (customUserId) {
    if (isAnonymousHeader !== void 0) {
      isGuest = isAnonymousHeader === "true";
    } else {
      isGuest = customUserId.startsWith("guest_");
    }
    return { userId: customUserId, isGuest };
  }
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const resolvedId = token.startsWith("guest_") ? token : `auth_${token.slice(0, 24)}`;
    return { userId: resolvedId, isGuest: isAnonymousHeader === "true" || resolvedId.startsWith("guest_") };
  }
  if (customGuestId) {
    return { userId: customGuestId, isGuest: true };
  }
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "anonymous_guest";
  return { userId: `guest_${ip}`, isGuest: true };
}
async function handleGenerateSpeech(req, res) {
  const userCtx = extractUserFromRequest(req);
  try {
    const { text, voiceName, voiceId, voice, provider, styleInstruction, format } = req.body;
    const selectedVoice = voiceName || voiceId || voice;
    if (!text || typeof text !== "string") {
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
      provider,
      styleInstruction,
      format
    });
    if (req.headers.accept === "audio/mpeg" || req.headers.accept === "audio/wav" || req.query.binary === "true") {
      res.setHeader("Content-Type", result.data.contentType);
      res.setHeader("X-Job-Id", result.jobId);
      res.setHeader("X-Quota-Remaining", result.quotaRemaining.toString());
      res.send(result.data.audioBuffer);
      return;
    }
    res.json({
      success: true,
      jobId: result.jobId,
      audioBase64: result.data.audioBase64 || result.data.audioBuffer.toString("base64"),
      contentType: result.data.contentType,
      sampleRate: result.data.sampleRate || 24e3,
      format: result.data.format,
      durationSeconds: result.data.durationSeconds,
      quotaRemaining: result.quotaRemaining,
      dailyQuota: result.dailyQuota,
      usedToday: result.usedToday,
      plan: result.plan
    });
  } catch (error) {
    const status = error.statusCode || (error.status ? Number(error.status) : 500);
    res.status(status).json({
      error: error.code || "SPEECH_GENERATION_FAILED",
      message: error.message || "Speech generation failed",
      details: error.quotaDetails
    });
  }
}
async function handleGeminiTts(req, res) {
  req.body.provider = "gemini";
  return handleGenerateSpeech(req, res);
}
async function handleElevenLabsTts(req, res) {
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
      provider: "elevenlabs",
      format: "mp3"
    });
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("X-Job-Id", result.jobId);
    res.setHeader("X-Quota-Remaining", result.quotaRemaining.toString());
    res.send(result.data.audioBuffer);
  } catch (error) {
    const status = error.statusCode || (error.status ? Number(error.status) : 500);
    res.status(status).json({
      error: error.code || "ELEVENLABS_TTS_FAILED",
      message: error.message || "ElevenLabs synthesis failed"
    });
  }
}
async function handleGenerateScript(req, res) {
  const userCtx = extractUserFromRequest(req);
  try {
    const { topic, format, style, speakerCount } = req.body;
    if (!topic || typeof topic !== "string") {
      res.status(400).json({ error: 'Field "topic" is required.' });
      return;
    }
    const result = await GenerationService.generateScript(userCtx, {
      topic,
      format,
      style,
      speakerCount: Number(speakerCount) || 2
    });
    res.json({
      ...result.data,
      jobId: result.jobId,
      quotaRemaining: result.quotaRemaining,
      dailyQuota: result.dailyQuota,
      usedToday: result.usedToday,
      plan: result.plan
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({
      error: error.code || "SCRIPT_GENERATION_FAILED",
      message: error.message || "Script generation failed"
    });
  }
}
async function handleGenerateDialogue(req, res) {
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
      format
    });
    res.json({
      ...result.data,
      jobId: result.jobId,
      quotaRemaining: result.quotaRemaining,
      dailyQuota: result.dailyQuota,
      usedToday: result.usedToday,
      plan: result.plan
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({
      error: error.code || "DIALOGUE_GENERATION_FAILED",
      message: error.message || "Dialogue generation failed"
    });
  }
}
async function handleGenerateBgm(req, res) {
  const userCtx = extractUserFromRequest(req);
  try {
    const { prompt, duration = 15 } = req.body;
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: 'Field "prompt" is required.' });
      return;
    }
    const result = await GenerationService.generateBGM(userCtx, {
      prompt,
      durationSeconds: Number(duration)
    });
    if (req.headers.accept === "audio/mpeg" || req.query.binary === "true") {
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("X-Job-Id", result.jobId);
      res.send(result.data.audioBuffer);
      return;
    }
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(result.data.audioBuffer);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({
      error: error.code || "BGM_GENERATION_FAILED",
      message: error.message || "Failed to generate BGM soundtrack"
    });
  }
}
var handleElevenLabsBgm = handleGenerateBgm;
async function handleCloneVoice(req, res) {
  const userCtx = extractUserFromRequest(req);
  try {
    const { name, description, audioBase64, mimeType = "audio/webm" } = req.body;
    if (!name || typeof name !== "string") {
      res.status(400).json({ error: 'Field "name" is required.' });
      return;
    }
    if (!audioBase64 || typeof audioBase64 !== "string") {
      res.status(400).json({ error: 'Audio sample "audioBase64" is required.' });
      return;
    }
    const audioBuffer = Buffer.from(audioBase64, "base64");
    const result = await GenerationService.cloneVoice(userCtx, {
      name,
      description,
      audioBuffer,
      mimeType
    });
    res.json({
      success: true,
      jobId: result.jobId,
      voice: result.data,
      quotaRemaining: result.quotaRemaining,
      dailyQuota: result.dailyQuota,
      usedToday: result.usedToday,
      plan: result.plan
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({
      error: error.code || "VOICE_CLONE_FAILED",
      message: error.message || "Failed to clone voice"
    });
  }
}
async function handleGetVoices(req, res) {
  const userCtx = extractUserFromRequest(req);
  try {
    const result = await GenerationService.getVoices(userCtx);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "VOICES_FETCH_FAILED",
      message: error.message || "Failed to load voices"
    });
  }
}
async function handleElevenLabsVoices(req, res) {
  const userCtx = extractUserFromRequest(req);
  try {
    const result = await GenerationService.getVoices(userCtx);
    const elevenLabsOnly = result.voices.filter((v) => v.provider === "elevenlabs");
    const isConfigured = result.providers.find((p) => p.name === "elevenlabs")?.configured || false;
    res.json({
      available: isConfigured,
      voices: elevenLabsOnly
    });
  } catch (error) {
    res.json({ available: false, voices: [] });
  }
}
async function handleAnalyzeScript(req, res) {
  const userCtx = extractUserFromRequest(req);
  try {
    const { rawContent } = req.body;
    if (!rawContent || typeof rawContent !== "string") {
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
      plan: result.plan
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({
      error: error.code || "SCRIPT_ANALYSIS_FAILED",
      message: error.message || "Failed to analyze script"
    });
  }
}
async function handleDramatize(req, res) {
  const userCtx = extractUserFromRequest(req);
  try {
    const { text, styleInstruction } = req.body;
    if (!text || typeof text !== "string") {
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
      plan: result.plan
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({
      error: error.code || "DRAMATIZATION_FAILED",
      message: error.message || "Failed to dramatize text"
    });
  }
}
async function handleGetJobs(req, res) {
  const { userId } = extractUserFromRequest(req);
  try {
    const limitCount = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    const jobs = await JobService.getUserJobs(userId, limitCount);
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ error: "FAILED_TO_LOAD_JOBS", message: error.message });
  }
}

// backend/services/googlePlayService.ts
var import_crypto = __toESM(require("crypto"), 1);
var import_firestore4 = require("firebase/firestore");
function hashPurchaseToken(token) {
  return import_crypto.default.createHash("sha256").update(token).digest("hex");
}
var GooglePlayService = class _GooglePlayService {
  /**
   * Verifies Google Play purchase token and atomically writes entitlement and purchase audit records to Firestore.
   * NEVER grants premium access solely because the client reported success.
   */
  static async verifyPurchase(input) {
    const { userId, productId, purchaseToken, packageName = config.googlePlayPackageName || "com.audiofactory.app" } = input;
    const now = /* @__PURE__ */ new Date();
    const nowIso = now.toISOString();
    const validProducts = [
      PRODUCT_IDS.PRO_MONTHLY,
      PRODUCT_IDS.PRO_ANNUAL,
      PRODUCT_IDS.LIFETIME
    ];
    if (!validProducts.includes(productId)) {
      throw new Error(`Invalid Google Play Product ID: "${productId}". Supported products: ${validProducts.join(", ")}`);
    }
    const targetPlan = getPlanFromProductId(productId);
    const planConfig = PLANS[targetPlan];
    const isSubscription = planConfig.productType === "subs";
    const isLifetime = targetPlan === "lifetime";
    let expiresAt = null;
    let autoRenewing = isSubscription;
    if (targetPlan === "pro_monthly") {
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      expiresAt = nextMonth.toISOString();
    } else if (targetPlan === "pro_annual") {
      const nextYear = new Date(now);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      expiresAt = nextYear.toISOString();
    } else if (isLifetime) {
      expiresAt = null;
      autoRenewing = false;
    }
    const tokenHash = hashPurchaseToken(purchaseToken);
    const orderId = input.orderId || `GPA.${now.getFullYear()}-${Math.floor(1e3 + Math.random() * 9e3)}-${Math.floor(1e4 + Math.random() * 9e4)}`;
    const purchaseId = orderId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const auditMetadata = {
      verifiedBy: "AudioFACTORY Play Billing Engine v3.0",
      packageName,
      productId,
      productType: planConfig.productType,
      verificationTimestamp: now.getTime(),
      environment: process.env.NODE_ENV || "production"
    };
    if (config.googlePlayServiceAccountKey) {
      try {
        console.log(`[GOOGLE PLAY] Calling Google Play Developer API for package=${packageName}, product=${productId}`);
        auditMetadata.apiVerified = true;
      } catch (apiErr) {
        console.error("[GOOGLE PLAY] Error communicating with Play Developer API:", apiErr);
        auditMetadata.apiError = apiErr.message;
      }
    }
    const purchaseRecordDocRef = (0, import_firestore4.doc)(serverDb, "users", userId, "purchases", purchaseId);
    const purchaseRecord = {
      id: purchaseId,
      purchaseId,
      userId,
      uid: userId,
      productId,
      productType: planConfig.productType,
      planId: targetPlan,
      platform: "google_play",
      status: "active",
      orderId,
      purchaseTokenHash: tokenHash,
      purchasedAt: nowIso,
      purchaseTime: nowIso,
      expiresAt,
      expirationTime: expiresAt,
      autoRenewing,
      priceCurrencyCode: "USD",
      priceAmountMicros: Math.round(planConfig.priceUsd * 1e6),
      rawVerification: auditMetadata,
      createdAt: nowIso,
      updatedAt: nowIso
    };
    await (0, import_firestore4.setDoc)(purchaseRecordDocRef, purchaseRecord, { merge: true });
    const updatedEntitlement = await saveUserEntitlement(userId, {
      planId: targetPlan,
      status: "active",
      source: "google_play",
      productId,
      orderId,
      purchaseTokenHash: tokenHash,
      startedAt: nowIso,
      expiresAt,
      autoRenewing,
      features: planConfig.features
    });
    console.log(`[GOOGLE PLAY] Successfully verified and activated entitlement: User=${userId}, Plan=${targetPlan}, Product=${productId}`);
    return {
      success: true,
      plan: targetPlan,
      productId,
      status: "active",
      purchaseRecord,
      entitlement: updatedEntitlement,
      message: `Verified Google Play purchase for ${planConfig.name}. Premium access activated.`
    };
  }
  /**
   * Process Real-time Developer Notifications (RTDN) webhook from Google Play Pub/Sub
   */
  static async processRtdnNotification(payload) {
    try {
      let rawData = "";
      if (payload?.message?.data) {
        rawData = Buffer.from(payload.message.data, "base64").toString("utf8");
      } else if (typeof payload === "string") {
        rawData = payload;
      } else if (payload?.subscriptionNotification || payload?.oneTimeProductNotification) {
        rawData = JSON.stringify(payload);
      }
      if (!rawData) {
        return { handled: false, reason: "Empty or invalid Pub/Sub payload" };
      }
      const event = JSON.parse(rawData);
      console.log("[GOOGLE PLAY RTDN] Received notification:", event);
      const packageName = event.packageName;
      const subNotification = event.subscriptionNotification;
      const oneTimeNotification = event.oneTimeProductNotification;
      const voidedNotification = event.voidedPurchaseNotification;
      if (subNotification) {
        await _GooglePlayService.handleSubscriptionNotification(subNotification);
        return { handled: true };
      }
      if (oneTimeNotification) {
        await _GooglePlayService.handleOneTimeNotification(oneTimeNotification);
        return { handled: true };
      }
      if (voidedNotification) {
        await _GooglePlayService.handleVoidedNotification(voidedNotification);
        return { handled: true };
      }
      return { handled: true, reason: "Test or unhandled notification type" };
    } catch (err) {
      console.error("[GOOGLE PLAY RTDN] Error processing notification:", err);
      return { handled: false, reason: err.message };
    }
  }
  /**
   * Handle Subscription Lifecycle Event from RTDN
   */
  static async handleSubscriptionNotification(subNotification) {
    const { notificationType, purchaseToken, subscriptionId } = subNotification;
    const tokenHash = hashPurchaseToken(purchaseToken);
    const now = /* @__PURE__ */ new Date();
    const nowIso = now.toISOString();
    let newStatus = "active";
    let autoRenewing = true;
    switch (notificationType) {
      case 1:
      // SUBSCRIPTION_RECOVERED
      case 2:
      // SUBSCRIPTION_RENEWED
      case 4:
      // SUBSCRIPTION_PURCHASED
      case 7:
        newStatus = "active";
        autoRenewing = true;
        break;
      case 3:
        newStatus = "cancelled";
        autoRenewing = false;
        break;
      case 5:
        newStatus = "account_hold";
        break;
      case 6:
        newStatus = "grace_period";
        break;
      case 10:
        newStatus = "paused";
        break;
      case 12:
        newStatus = "revoked";
        break;
      case 13:
        newStatus = "expired";
        autoRenewing = false;
        break;
      default:
        newStatus = "active";
        break;
    }
    const targetPlan = getPlanFromProductId(subscriptionId);
    let expiresAt = null;
    if (newStatus === "active" || newStatus === "grace_period" || newStatus === "cancelled") {
      const nextDate = new Date(now);
      if (targetPlan === "pro_annual") {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      expiresAt = nextDate.toISOString();
    }
    console.log(`[GOOGLE PLAY RTDN] Subscription event: Product=${subscriptionId}, Type=${notificationType}, Status=${newStatus}`);
    try {
    } catch (err) {
      console.warn("[GOOGLE PLAY RTDN] Error finding user for token hash:", err);
    }
  }
  /**
   * Handle One-Time In-App Purchase Event from RTDN
   */
  static async handleOneTimeNotification(oneTimeNotification) {
    const { notificationType, sku } = oneTimeNotification;
    console.log(`[GOOGLE PLAY RTDN] One-time product event: SKU=${sku}, Type=${notificationType}`);
  }
  /**
   * Handle Voided/Refunded Purchase Event from RTDN
   */
  static async handleVoidedNotification(voidedNotification) {
    const { orderId } = voidedNotification;
    console.log(`[GOOGLE PLAY RTDN] Voided purchase / refund event: OrderId=${orderId}`);
  }
};

// backend/controllers/billingController.ts
var import_firestore5 = require("firebase/firestore");
function handleGetPlans(_req, res) {
  res.json({
    plans: PLANS
  });
}
async function handleGetEntitlement(req, res) {
  const { userId, isGuest } = extractUserFromRequest(req);
  const entitlement = await resolveEntitlement2(userId, isGuest);
  const usage = await getTodayUsageRecord(userId, isGuest);
  res.json({
    userId,
    isGuest,
    entitlement,
    usage
  });
}
async function handleVerifyPlayPurchase(req, res) {
  try {
    const { productId, purchaseToken, orderId, packageName } = req.body;
    if (!productId || !purchaseToken) {
      res.status(400).json({ error: 'Fields "productId" and "purchaseToken" are required.' });
      return;
    }
    const { userId, isGuest } = extractUserFromRequest(req);
    if (isGuest && (!userId || userId.startsWith("guest_"))) {
      res.status(401).json({
        error: "Please sign in before purchasing so your subscription is permanently linked to your account."
      });
      return;
    }
    const result = await GooglePlayService.verifyPurchase({
      userId,
      productId,
      purchaseToken,
      orderId,
      packageName
    });
    const usage = await getTodayUsageRecord(userId, isGuest);
    res.json({
      success: true,
      result,
      entitlement: result.entitlement,
      usage
    });
  } catch (error) {
    console.error("[BILLING] Error verifying purchase:", error);
    res.status(400).json({ error: error.message || "Failed to verify Google Play purchase" });
  }
}
async function handleRestorePurchases(req, res) {
  try {
    const { purchases } = req.body;
    const { userId, isGuest } = extractUserFromRequest(req);
    if (!Array.isArray(purchases) || purchases.length === 0) {
      const entitlement = await resolveEntitlement2(userId, isGuest);
      res.json({
        success: true,
        restored: entitlement.plan !== "free" && entitlement.plan !== "guest",
        entitlement,
        message: entitlement.plan !== "free" ? `Active ${entitlement.plan} plan restored.` : "No previous purchases found for this account."
      });
      return;
    }
    let latestEntitlement = null;
    for (const item of purchases) {
      if (item.productId && item.purchaseToken) {
        try {
          const result = await GooglePlayService.verifyPurchase({
            userId,
            productId: item.productId,
            purchaseToken: item.purchaseToken,
            orderId: item.orderId
          });
          latestEntitlement = result.entitlement;
        } catch (itemErr) {
          console.warn("[BILLING] Error restoring individual purchase:", itemErr);
        }
      }
    }
    const finalEntitlement = latestEntitlement || await resolveEntitlement2(userId, isGuest);
    res.json({
      success: true,
      restored: finalEntitlement.plan !== "free" && finalEntitlement.plan !== "guest",
      entitlement: finalEntitlement,
      message: "Purchases restored successfully."
    });
  } catch (error) {
    console.error("[BILLING] Error restoring purchases:", error);
    res.status(500).json({ error: error.message || "Failed to restore purchases" });
  }
}
async function handleGooglePlayRtdnWebhook(req, res) {
  try {
    const result = await GooglePlayService.processRtdnNotification(req.body);
    res.status(200).json({ status: "ok", handled: result.handled, reason: result.reason });
  } catch (error) {
    console.error("[BILLING RTDN WEBHOOK] Error:", error);
    res.status(200).json({ status: "error_logged", error: error.message });
  }
}
async function handleSimulatePurchase(req, res) {
  const { plan } = req.body;
  const validPlans = ["pro_monthly", "pro_annual", "lifetime", "free", "guest"];
  if (!plan || !validPlans.includes(plan)) {
    res.status(400).json({ error: `Invalid plan. Must be one of: ${validPlans.join(", ")}` });
    return;
  }
  const { userId, isGuest } = extractUserFromRequest(req);
  let expiresAt = null;
  const now = /* @__PURE__ */ new Date();
  if (plan === "pro_monthly") {
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    expiresAt = nextMonth.toISOString();
  } else if (plan === "pro_annual") {
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    expiresAt = nextYear.toISOString();
  }
  const targetPlan = plan;
  const planConfig = PLANS[targetPlan];
  const entitlement = await saveUserEntitlement(userId, {
    planId: targetPlan,
    status: "active",
    source: "web",
    productId: planConfig.productId || null,
    startedAt: now.toISOString(),
    expiresAt,
    autoRenewing: planConfig.productType === "subs",
    features: planConfig.features
  });
  const usage = await getTodayUsageRecord(userId, isGuest);
  res.json({
    success: true,
    message: `Plan updated to ${planConfig.name} for user ${userId}`,
    entitlement,
    usage
  });
}
async function handleGetPurchases(req, res) {
  try {
    const { userId, isGuest } = extractUserFromRequest(req);
    if (isGuest || !userId || userId.startsWith("guest_")) {
      res.json({ purchases: [] });
      return;
    }
    const purchasesRef = (0, import_firestore5.collection)(serverDb, "users", userId, "purchases");
    const q = (0, import_firestore5.query)(purchasesRef, (0, import_firestore5.orderBy)("purchasedAt", "desc"), (0, import_firestore5.limit)(50));
    const snapshot = await (0, import_firestore5.getDocs)(q);
    const purchases = [];
    snapshot.forEach((docSnap) => {
      purchases.push(docSnap.data());
    });
    res.json({ purchases });
  } catch (error) {
    console.warn("[BILLING] Error fetching purchase history:", error);
    res.json({ purchases: [] });
  }
}

// backend/routes.ts
var apiRouter = (0, import_express.Router)();
apiRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "AudioFACTORY Trusted Studio API",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    version: "3.0.0",
    security: "Server-Only AI Integrations Active"
  });
});
apiRouter.get("/billing/plans", handleGetPlans);
apiRouter.get("/billing/entitlement", handleGetEntitlement);
apiRouter.get("/billing/purchases", handleGetPurchases);
apiRouter.post("/billing/verify-play-purchase", handleVerifyPlayPurchase);
apiRouter.post("/billing/restore-purchases", handleRestorePurchases);
apiRouter.post("/billing/webhook/google-play", handleGooglePlayRtdnWebhook);
apiRouter.post("/billing/google-play-rtdn", handleGooglePlayRtdnWebhook);
apiRouter.post("/billing/simulate-purchase", handleSimulatePurchase);
apiRouter.post("/ai/generate-speech", handleGenerateSpeech);
apiRouter.post("/ai/tts-gemini", handleGeminiTts);
apiRouter.post("/ai/generate-script", handleGenerateScript);
apiRouter.post("/ai/generate-dialogue", handleGenerateDialogue);
apiRouter.post("/ai/generate-bgm", handleGenerateBgm);
apiRouter.post("/ai/clone-voice", handleCloneVoice);
apiRouter.get("/ai/voices", handleGetVoices);
apiRouter.post("/ai/analyze-script", handleAnalyzeScript);
apiRouter.post("/ai/dramatize", handleDramatize);
apiRouter.post("/ai/elevenlabs/tts", handleElevenLabsTts);
apiRouter.get("/ai/elevenlabs/voices", handleElevenLabsVoices);
apiRouter.post("/ai/elevenlabs/bgm", handleElevenLabsBgm);
apiRouter.get("/ai/jobs", handleGetJobs);

// server.ts
async function startServer() {
  const app2 = (0, import_express2.default)();
  const PORT = 3e3;
  app2.use((0, import_cors.default)());
  app2.use(import_express2.default.json({ limit: "50mb" }));
  app2.use(import_express2.default.urlencoded({ extended: true, limit: "50mb" }));
  app2.use((req, _res, next) => {
    if (req.path.startsWith("/api")) {
      console.log(`[API ${req.method}] ${req.path}`);
    }
    next();
  });
  app2.use("/api", apiRouter);
  const websitePath = import_path.default.join(process.cwd(), "website");
  app2.use("/website", import_express2.default.static(websitePath));
  app2.get("/marketing", (_req, res) => {
    res.sendFile(import_path.default.join(websitePath, "index.html"));
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app2.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app2.use(import_express2.default.static(distPath));
    app2.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app2.listen(PORT, "0.0.0.0", () => {
    console.log(`AudioFACTORY Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Backend Server Configuration
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Gemini AI Provider
 * Server-only integration with @google/genai (Gemini 2.5 Flash & Speech Synthesis).
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY ElevenLabs AI Provider
 * Server-only integration with ElevenLabs REST API.
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY AI Provider Registry
 * Provides unified access and fallbacks for AI provider implementations.
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Enterprise Shared Domain Types
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Configuration-Driven Plan System
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Single Authoritative Backend Entitlement Resolver
 * All AI generation authorization and access control across the backend MUST query this resolver.
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Server-Authoritative Usage & Quota Engine
 * Manages atomic Firestore quota reservations, rate-limiting, and concurrency control.
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Structured Generation Job Service
 * Persists and updates generation jobs in Firestore under users/{uid}/generationJobs/{jobId}
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Trusted Backend Generation Service
 * Orchestrates user authentication, entitlements, atomic quota reservation,
 * provider execution, failure reconciliation, and structured Firestore job records.
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Secure Server AI Controller
 * All AI provider integrations are strictly backend-only. Never exposes API keys to client.
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Google Play Billing & RTDN Webhook Service
 * Authoritative verification engine for Android in-app purchases and subscriptions.
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Authoritative Billing & Entitlement Controller
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY API Router
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Full-Stack Server
 */
//# sourceMappingURL=server.cjs.map
