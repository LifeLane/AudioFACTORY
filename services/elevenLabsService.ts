import { Voice } from '../types';

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
  const key = import.meta.env.VITE_ELEVENLABS_API_KEY;
  return Boolean(key && typeof key === 'string' && key.trim().length > 0);
};

const getApiKey = () => {
  const key = import.meta.env.VITE_ELEVENLABS_API_KEY;
  if (!key || typeof key !== 'string' || !key.trim()) {
    throw new Error("VITE_ELEVENLABS_API_KEY is missing in environment variables. Please configure it in your settings or switch to Gemini Voices.");
  }
  return key.trim();
};

export const getElevenLabsVoices = async (): Promise<Voice[]> => {
  const key = import.meta.env.VITE_ELEVENLABS_API_KEY;
  if (!key || typeof key !== 'string' || !key.trim()) {
    // Return the curated list without failing
    return DEFAULT_ELEVENLABS_VOICES;
  }
  try {
    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": key.trim() },
    });
    if (!response.ok) {
      console.warn("ElevenLabs API voice fetch returned non-ok status. Using default voices list.");
      return DEFAULT_ELEVENLABS_VOICES;
    }
    const data = await response.json();
    if (!data.voices || !Array.isArray(data.voices)) {
      return DEFAULT_ELEVENLABS_VOICES;
    }
    return data.voices.map((v: any) => ({
      id: v.voice_id,
      name: `${v.name} (ElevenLabs)`,
      gender: v.labels?.gender ? (v.labels.gender.charAt(0).toUpperCase() + v.labels.gender.slice(1)) : 'Unknown',
      languageCode: 'en-US',
      languageName: 'English (US)',
      provider: 'elevenlabs' as const
    }));
  } catch (err) {
    console.warn("Error fetching voices from ElevenLabs, falling back to default voice list:", err);
    return DEFAULT_ELEVENLABS_VOICES;
  }
};


export const generateSpeechElevenLabs = async (text: string, voiceId: string): Promise<{ buffer: AudioBuffer, rawData: ArrayBuffer }> => {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": getApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_monolingual_v1",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 }
    }),
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail?.message || "Failed to generate speech");
  }
  
  const arrayBuffer = await response.arrayBuffer();
  
  // Decode audio data
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
  
  return { buffer: audioBuffer, rawData: arrayBuffer };
};

export const cloneVoice = async (name: string, description: string, audioBlob: Blob) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  formData.append("files", audioBlob, "recording.webm");

  const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
    method: "POST",
    headers: { "xi-api-key": getApiKey() },
    body: formData,
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail?.message || "Failed to clone voice");
  }
  
  return response.json();
};

export const generateBGM = async (prompt: string, duration: number = 10): Promise<ArrayBuffer> => {
  const response = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
    method: "POST",
    headers: {
      "xi-api-key": getApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: prompt, duration_seconds: duration }),
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail?.message || "Failed to generate BGM");
  }
  
  return response.arrayBuffer();
};
