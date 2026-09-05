import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Sparkles, 
  Download, 
  Cloud, 
  Settings, 
  RefreshCw, 
  Volume2, 
  Info, 
  Sliders, 
  Wand2, 
  CheckCircle2, 
  Clock, 
  FileText,
  Radio,
  Share2,
  Mic
} from 'lucide-react';
import { IntroStyle, Voice } from '../types';
import { LivePresenceBar } from './LivePresenceBar';
import { QuotaExhaustedBanner } from './QuotaExhaustedBanner';
import { useLiveblocks } from '../services/liveblocksContext';

interface MonologueBentoStudioProps {
  text: string;
  onTextChange: (val: string) => void;
  selectedStyle: IntroStyle;
  selectedVoice: string;
  onOpenPersonaSelect: () => void;
  onOpenVoiceConfig: () => void;
  onOpenPromptModal: () => void;
  isPlaying: boolean;
  isLoading: boolean;
  isDramatizing: boolean;
  generatedAudio: { buffer: AudioBuffer; rawData: Uint8Array } | null;
  audioProgress: number;
  audioDuration: number;
  audioError: string | null;
  onDismissError: () => void;
  onSynthesizeOrPlay: () => void;
  onDramatize: () => void;
  onSaveToCloud: () => void;
  isSaving: boolean;
  justSaved: boolean;
  onDownloadWav: () => void;
}

const DRAMA_CUES = [
  { label: '[short pause]', insert: '... ' },
  { label: '[deep breath]', insert: ' (takes a breath) ' },
  { label: '[emphasis]', insert: ' *absolutely* ' },
  { label: '[whisper]', insert: ' (whispering) ' }
];

export const MonologueBentoStudio: React.FC<MonologueBentoStudioProps> = ({
  text,
  onTextChange,
  selectedStyle,
  selectedVoice,
  onOpenPersonaSelect,
  onOpenVoiceConfig,
  onOpenPromptModal,
  isPlaying,
  isLoading,
  isDramatizing,
  generatedAudio,
  audioProgress,
  audioDuration,
  audioError,
  onDismissError,
  onSynthesizeOrPlay,
  onDramatize,
  onSaveToCloud,
  isSaving,
  justSaved,
  onDownloadWav,
}) => {
  const { broadcastAudioPlay } = useLiveblocks();
  const [speed, setSpeed] = useState<'1.0x' | '1.25x'>('1.0x');

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedReadSeconds = Math.max(1, Math.round(wordCount / 2.5));

  const handleAction = () => {
    onSynthesizeOrPlay();
    if (generatedAudio && !isPlaying) {
      broadcastAudioPlay(selectedStyle.name, 0);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F7F7F4] overflow-y-auto custom-scrollbar p-3 sm:p-5 md:p-6 space-y-4">
      
      {/* Liveblocks Real-Time Collaboration Bar */}
      <LivePresenceBar />

      {/* Quota Exhaustion & Upgrade Prompt */}
      <QuotaExhaustedBanner actionName="monologue generation" />

      {/* Error Notice */}
      {audioError && (
        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 font-mono text-xs flex justify-between items-center z-10 shadow-2xs">
          <span>{audioError}</span>
          <button onClick={onDismissError} className="font-bold text-rose-700 ml-4 hover:text-rose-900">✕</button>
        </div>
      )}

      {/* Bento Grid Layout (Top Deck) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* BENTO CARD 1: Master Audio Transport & Waveform Station (7 cols) */}
        <div className="lg:col-span-7 border border-zinc-200 bg-white p-4 sm:p-5 rounded-xl shadow-2xs flex flex-col justify-between space-y-4">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Primary Tactile Audio Action Button */}
              <button
                onClick={handleAction}
                disabled={isLoading || !text.trim()}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-xs flex-shrink-0 active:scale-95 ${
                  isPlaying 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse' 
                    : generatedAudio 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                    : 'bg-zinc-950 hover:bg-zinc-800 text-white disabled:opacity-40'
                }`}
                title={isPlaying ? "Pause Audio" : generatedAudio ? "Play Synthesized Audio" : "Synthesize Voice"}
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-white" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-bold text-zinc-900 uppercase">
                    {isPlaying ? "Playing Master Audio" : generatedAudio ? "Audio Master Ready" : "Voice Synthesizer"}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-bold ${
                    generatedAudio 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                  }`}>
                    {generatedAudio ? '24kHz HD' : 'Ready'}
                  </span>
                </div>
                <p className="text-xs font-mono text-zinc-500 mt-0.5">
                  {audioDuration > 0 
                    ? `${(audioProgress * audioDuration).toFixed(1)}s / ${audioDuration.toFixed(1)}s broadcast stem` 
                    : `Est. ~${estimatedReadSeconds}s spoken runtime`}
                </p>
              </div>
            </div>

            {/* Quick Actions (Save, Dramatize, Download) */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <button
                onClick={onDramatize}
                disabled={isDramatizing || !text.trim()}
                className="px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Dramatize script tone with Gemini AI"
              >
                <Sparkles className={`w-3.5 h-3.5 text-amber-600 ${isDramatizing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Dramatize</span>
              </button>

              <button
                onClick={onSaveToCloud}
                disabled={isSaving || !text.trim()}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-2xs ${
                  justSaved 
                    ? 'bg-emerald-600 text-white border-emerald-700' 
                    : 'bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200'
                }`}
                title="Save script to Firebase Firestore"
              >
                {justSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5 text-sky-600" />}
                <span className="hidden sm:inline">{justSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={onDownloadWav}
                disabled={!generatedAudio}
                className="px-2.5 py-1.5 rounded-lg border border-zinc-950 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Export high-fidelity WAV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>WAV</span>
              </button>
            </div>
          </div>

          {/* Realtime Waveform Bar */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-1.5">
              <span className="font-bold flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-zinc-400" /> Acoustic Spectrum
              </span>
              <span>{(audioProgress * 100).toFixed(0)}%</span>
            </div>

            <div className="h-8 bg-zinc-50 border border-zinc-200 rounded-lg p-1.5 flex items-end gap-0.5 sm:gap-1 overflow-hidden">
              {[15, 30, 22, 45, 60, 35, 80, 50, 25, 70, 90, 40, 30, 65, 85, 45, 35, 75, 55, 30, 60, 95, 40, 20, 50, 70, 35, 25, 60, 40].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${Math.min(100, Math.max(12, h * (isPlaying ? 1.2 : 0.5)))}%` }}
                  className={`flex-1 rounded-2xs transition-all ${
                    audioProgress > (i / 30) ? 'bg-amber-500' : 'bg-zinc-200'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>

        {/* BENTO CARD 2: Voice Persona & Acoustic Timbre (5 cols) */}
        <div className="lg:col-span-5 border border-zinc-200 bg-white p-4 sm:p-5 rounded-xl shadow-2xs flex flex-col justify-between space-y-3">
          
          <div>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3">
              <span className="text-xs font-mono font-bold text-zinc-600 uppercase tracking-wider">
                Vocal Persona & Profile
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenPromptModal}
                  className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                  title="View acoustic prompt instructions"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onOpenVoiceConfig}
                  className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                  title="Configure voice engine"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Persona Tile */}
            <div 
              onClick={onOpenPersonaSelect}
              className="p-3 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100/70 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-mono font-bold text-sm shadow-xs flex-shrink-0">
                  {selectedStyle.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-zinc-900 truncate group-hover:text-amber-600 transition-colors">
                    {selectedStyle.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 mt-0.5">
                    <span className="truncate">{selectedVoice}</span>
                    <span>•</span>
                    <span className="text-amber-700 font-bold uppercase">{selectedStyle.color}</span>
                  </div>
                </div>
              </div>

              <span className="text-xs font-mono text-zinc-400 group-hover:text-zinc-900 transition-colors">
                Change ▾
              </span>
            </div>
          </div>

          {/* Quick Acoustic Tone Chips */}
          <div>
            <div className="text-[11px] font-mono text-zinc-500 mb-1.5">
              Suggested Acoustic Moods:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Dramatic', 'Natural Tone', 'Excited Pace', 'Whisper Inflection', 'Cinema Voice'].map(mood => (
                <button
                  key={mood}
                  onClick={() => {
                    onTextChange(`[${mood.toLowerCase()}] ` + text);
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors"
                >
                  +{mood}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* BENTO CARD 3: Smart Scripting Workbench (Full Width) */}
      <div className="border border-zinc-200 bg-white rounded-xl shadow-2xs flex-1 flex flex-col min-h-[360px] overflow-hidden">
        
        {/* Script Workbench Header */}
        <div className="p-3.5 sm:px-5 sm:py-3.5 border-b border-zinc-100 bg-zinc-50/70 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono uppercase font-bold text-zinc-900 tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-500" /> Spoken Script & Intro Canvas
            </label>
          </div>

          {/* Quick Drama Cues & Template Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="hidden sm:flex items-center gap-1 text-xs font-mono text-zinc-500">
              <span className="text-[10px] text-zinc-400">Insert:</span>
              {DRAMA_CUES.map(cue => (
                <button
                  key={cue.label}
                  onClick={() => onTextChange(text + cue.insert)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-zinc-100 border border-zinc-200 text-[10px] text-zinc-700 transition-colors"
                >
                  {cue.label}
                </button>
              ))}
            </div>

            <div className="h-3.5 w-[1px] bg-zinc-200 hidden sm:block" />

            <button
              onClick={() => onTextChange(selectedStyle.templateText)}
              className="text-[11px] font-mono text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Reset Template
            </button>
            <span className="text-zinc-300">|</span>
            <button
              onClick={() => onTextChange('')}
              className="text-[11px] font-mono text-zinc-500 hover:text-rose-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="flex-1 p-3.5 sm:p-5 flex flex-col min-h-0">
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            className="w-full flex-1 p-3 sm:p-4 rounded-lg border border-zinc-200 font-mono text-xs sm:text-sm md:text-base leading-relaxed bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 resize-none shadow-inner custom-scrollbar"
            placeholder="Type or paste your spoken script, meeting introduction, or podcast monologue here..."
          />

          {/* Clean, Non-Overlapping Footer Telemetry */}
          <div className="mt-3 pt-2.5 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-zinc-500 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-zinc-600 text-[11px]">
              <span>💡 Tip: Insert commas or ellipses (...) for realistic pauses.</span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{text.length} characters</span>
              <span>•</span>
              <span className="text-amber-700 font-bold">~{estimatedReadSeconds}s spoken</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
