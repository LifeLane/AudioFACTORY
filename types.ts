/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export interface IntroStyle {
  id: string;
  name: string;
  description: string;
  defaultVoice: string; // Gemini voice name
  templateText: string;
  color: 'red' | 'blue' | 'yellow' | 'white' | 'green' | 'black';
  icon: 'circle' | 'square' | 'triangle' | 'half-circle' | 'rect' | 'plus';
  avatarSrc?: string; // Path to avatar image
  audioSrc?: string; // Path to pre-generated audio file
}

export interface Voice {
  id: string;
  name: string;
  gender: string;
  languageCode: string;
  languageName: string;
  provider?: 'gemini' | 'elevenlabs';
}

export interface VoiceOption {
  name: string;
  ssmlGender: string;
}

export interface SceneSpeaker {
  name: string;
  voice: string;
  provider: 'gemini' | 'elevenlabs';
  gender?: string;
  color?: string;
}

export interface DialogueLine {
  id: string;
  speaker: string;
  text: string;
  scene?: string;
  emotion?: string;
  audioBuffer?: AudioBuffer | null;
  audioUrl?: string | null;
  status: 'idle' | 'generating' | 'ready' | 'error';
  errorMessage?: string;
}

export interface ScriptAnalysisResult {
  title?: string;
  summary?: string;
  speakers: SceneSpeaker[];
  lines: DialogueLine[];
}

export interface SavedAudioProject {
  id: string;
  title: string;
  summary?: string;
  format?: string;
  style?: string;
  speakerCount?: number;
  speakers: SceneSpeaker[];
  lines: {
    id: string;
    speaker: string;
    text: string;
    scene?: string;
    emotion?: string;
  }[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedMonologue {
  id: string;
  title: string;
  styleId?: string;
  voice?: string;
  text: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectInput = Omit<SavedAudioProject, 'createdAt' | 'updatedAt' | 'userId' | 'id'> & { 
  id?: string;
  createdAt?: string;
};

export type MonologueInput = Omit<SavedMonologue, 'createdAt' | 'updatedAt' | 'userId' | 'id'> & { 
  id?: string;
  createdAt?: string;
};

