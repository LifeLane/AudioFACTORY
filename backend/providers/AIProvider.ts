/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY AI Provider Interface & Types
 * Clean abstraction separating provider-specific logic from application services.
 */

export type ProviderName = 'gemini' | 'elevenlabs';

export type JobType = 
  | 'speech' 
  | 'script' 
  | 'dialogue' 
  | 'bgm' 
  | 'voice_clone' 
  | 'dramatize' 
  | 'analyze';

export interface VoiceInfo {
  id: string;
  name: string;
  gender: string;
  languageCode: string;
  languageName: string;
  provider: ProviderName;
  previewUrl?: string;
  category?: string;
}

export interface SpeechParams {
  text: string;
  voiceNameOrId: string;
  styleInstruction?: string;
  format?: 'wav' | 'mp3';
  speed?: number;
}

export interface SpeechResult {
  audioBuffer: Buffer;
  contentType: string;
  sampleRate?: number;
  audioBase64?: string;
  format: 'wav' | 'mp3';
  durationSeconds?: number;
}

export interface ScriptParams {
  topic: string;
  format?: string;
  style?: string;
  speakerCount?: number;
}

export interface ScriptSpeaker {
  name: string;
  gender: 'MALE' | 'FEMALE';
  voice: string;
  provider: ProviderName;
  color: string;
}

export interface ScriptLine {
  id: string;
  speaker: string;
  text: string;
  scene: string;
  emotion: string;
  status: 'idle' | 'ready' | 'error';
}

export interface ScriptResult {
  title: string;
  summary: string;
  speakers: ScriptSpeaker[];
  lines: ScriptLine[];
}

export interface DialogueLineInput {
  id?: string;
  speaker: string;
  text: string;
  voice: string;
  emotion?: string;
  scene?: string;
  provider?: ProviderName;
}

export interface DialogueParams {
  lines: DialogueLineInput[];
  styleInstruction?: string;
  format?: 'wav' | 'mp3';
}

export interface DialogueResult {
  lines: {
    id: string;
    speaker: string;
    text: string;
    audioBase64: string;
    contentType: string;
    sampleRate?: number;
  }[];
  stitchedAudioBuffer?: Buffer;
  stitchedBase64?: string;
  contentType?: string;
}

export interface BgmParams {
  prompt: string;
  durationSeconds?: number;
}

export interface BgmResult {
  audioBuffer: Buffer;
  contentType: string;
  durationSeconds: number;
}

export interface VoiceCloneParams {
  name: string;
  description?: string;
  audioBuffer: Buffer;
  mimeType: string;
  originalFilename?: string;
}

export interface VoiceCloneResult {
  voiceId: string;
  name: string;
  status: string;
  provider: ProviderName;
  previewUrl?: string;
}

export interface AIProvider {
  readonly name: ProviderName;
  isConfigured(): boolean;

  generateSpeech(params: SpeechParams): Promise<SpeechResult>;
  generateScript(params: ScriptParams): Promise<ScriptResult>;
  generateDialogue(params: DialogueParams): Promise<DialogueResult>;
  generateBGM(params: BgmParams): Promise<BgmResult>;
  cloneVoice(params: VoiceCloneParams): Promise<VoiceCloneResult>;
  getVoices(): Promise<VoiceInfo[]>;
  
  analyzeScript?(rawContent: string): Promise<ScriptResult>;
  dramatize?(text: string, styleInstruction?: string): Promise<string>;
}
