import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Sparkles, 
  Download, 
  Cloud, 
  CheckCircle2, 
  Settings, 
  Radio, 
  Sliders, 
  RefreshCw, 
  Layers,
  Terminal,
  Volume2
} from 'lucide-react';
import { TerminalWindow } from './TerminalWindow';
import { IntroStyle } from '../../types';
import { INTRO_STYLES } from '../../constants';
import { LivePresenceBar } from '../LivePresenceBar';
import { QuotaExhaustedBanner } from '../QuotaExhaustedBanner';

interface TerminalMonologueViewProps {
  text: string;
  onTextChange: (text: string) => void;
  selectedStyle: IntroStyle;
  onSelectStyle: (style: IntroStyle) => void;
  selectedVoice: string;
  onOpenVoiceConfig: () => void;
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
  emotionalMode: string;
  onEmotionalModeChange: (mode: string) => void;
  lyricalMode: boolean;
  onLyricalModeChange: (enabled: boolean) => void;
}

const DRAMA_CUES = [
  { label: '[short pause]', tag: '... [pause] ...' },
  { label: '[whisper]', tag: '[soft whisper] ' },
  { label: '[dramatic]', tag: '[dramatic pause] ' },
  { label: '[emphasis]', tag: '[emphasize] ' }
];

export const TerminalMonologueView: React.FC<TerminalMonologueViewProps> = ({
  text,
  onTextChange,
  selectedStyle,
  onSelectStyle,
  selectedVoice,
  onOpenVoiceConfig,
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
  emotionalMode,
  onEmotionalModeChange,
  lyricalMode,
  onLyricalModeChange
}) => {
  const [isCommandStationMinimized, setIsCommandStationMinimized] = useState(false);
  const [isScriptBufferMinimized, setIsScriptBufferMinimized] = useState(false);
  const [isTimbreRouterMinimized, setIsTimbreRouterMinimized] = useState(false);

  const insertCue = (cue: string) => {
    onTextChange(text + (text.endsWith(' ') ? '' : ' ') + cue);
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-5 md:p-6 space-y-4 max-w-7xl mx-auto w-full min-h-0 overflow-y-auto custom-scrollbar pb-16">
      
      {/* Live Collaborative Presence Bar (G-Term Styled) */}
      <div className="flex-shrink-0">
        <LivePresenceBar className="border border-[#30363D] bg-[#161B22]" />
      </div>

      {/* Quota Exhaustion & Upgrade Prompt */}
      <QuotaExhaustedBanner actionName="monologue generation" />

      {/* TWO COLUMN BENTO TERMINAL GRID */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 transition-all duration-200 ${isScriptBufferMinimized && isTimbreRouterMinimized ? 'flex-initial' : 'flex-1 min-h-0'}`}>
        
        {/* LEFT COLUMN: SCRIPT EDITOR TERMINAL BUFFER (8 COLS) */}
        <div className={`lg:col-span-8 flex flex-col transition-all duration-200 ${isScriptBufferMinimized ? 'min-h-0' : 'min-h-[360px]'}`}>
          <TerminalWindow
            title="SCRIPT_STREAM_BUFFER.txt"
            subtitle="Spoken Speech Synthesis Pipeline"
            badge={`${text.length} CHARS`}
            badgeColor="blue"
            accentColor="green"
            className="h-full"
            isMinimized={isScriptBufferMinimized}
            onMinimizeChange={setIsScriptBufferMinimized}
            headerActions={
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                <button
                  onClick={() => onTextChange(selectedStyle.templateText)}
                  className="text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                  title="Reset to persona default template"
                >
                  [RESET]
                </button>
                <span className="text-[#30363D]">|</span>
                <button
                  onClick={() => onTextChange('')}
                  className="text-[#EA4335] hover:text-[#FF6B6B] transition-colors"
                  title="Clear all script buffer"
                >
                  [CLEAR]
                </button>
              </div>
            }
          >
            <div className="flex-1 p-3.5 bg-[#161B22] flex flex-col gap-3 min-h-0">
              
              {/* Cue Injectors Header */}
              <div className="flex flex-wrap items-center gap-2 border-b border-[#21262D] pb-2.5 flex-shrink-0">
                <span className="text-[10px] font-mono font-bold text-[#8B949E] uppercase tracking-wide">
                  Injection Hooks:
                </span>
                {DRAMA_CUES.map((cue) => (
                  <button
                    key={cue.label}
                    onClick={() => insertCue(cue.tag)}
                    className="px-2 py-1 rounded bg-[#21262D] border border-[#30363D] hover:border-[#34A853] text-[#E6EDF3] hover:text-[#34A853] font-mono text-[10px] uppercase transition-all select-none active:scale-95"
                  >
                    {cue.label}
                  </button>
                ))}
              </div>

              {/* Lyrical / Emotional Fine-Tuning controls in G-TERM style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 rounded-lg border border-[#30363D] bg-[#0D1117]/60 flex-shrink-0">
                {/* Lyrical Mode Toggle */}
                <div className="flex items-center justify-between border-r border-[#21262D]/60 pr-3 last:border-0 last:pr-0">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-mono font-bold text-[#E6EDF3]">LYRICAL_MELODY_ENGINE</span>
                    <span className="text-[9px] font-mono text-[#8B949E]">Improves voice note cadence</span>
                  </div>
                  <button
                    onClick={() => onLyricalModeChange(!lyricalMode)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      lyricalMode ? 'bg-[#34A853]' : 'bg-[#30363D]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        lyricalMode ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Emotional Pitch Level Preset Selector */}
                <div className="flex items-center justify-between pl-0 sm:pl-3">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-mono font-bold text-[#E6EDF3]">EMOTION_COEFFICIENT</span>
                    <span className="text-[9px] font-mono text-[#8B949E]">Sets psychological coloring</span>
                  </div>
                  <select
                    value={emotionalMode}
                    onChange={(e) => onEmotionalModeChange(e.target.value)}
                    className="p-1 px-1.5 rounded bg-[#21262D] border border-[#30363D] text-[#E6EDF3] font-mono text-[10px] outline-none cursor-pointer hover:border-[#FBBC04]"
                  >
                    <option value="none">00_FLAT_MONO</option>
                    <option value="whisper">01_WHISPER</option>
                    <option value="lyrical">02_SPOKEN_MELODY</option>
                    <option value="dramatic">03_DRAMA_CREST</option>
                    <option value="extreme">04_EMOTION_MAX</option>
                  </select>
                </div>
              </div>

              {/* Main Code-like Textarea */}
              <div className="flex-1 relative min-h-0">
                <textarea
                  value={text}
                  onChange={(e) => onTextChange(e.target.value)}
                  className="w-full h-full p-4 border border-[#30363D] hover:border-[#8B949E] focus:border-[#34A853] rounded-lg font-mono text-xs sm:text-sm bg-[#0D1117] text-[#C9D1D9] focus:outline-none focus:ring-1 focus:ring-[#34A853]/50 resize-none leading-relaxed selection:bg-[#34A853]/30 custom-scrollbar"
                  placeholder="// ENTER VOICENOTE PROMPT SCRIPT HERE... //"
                />
                
                {/* Decorative terminal watermark */}
                <div className="absolute bottom-3 right-3 pointer-events-none text-[9px] font-mono text-[#30363D] select-none uppercase">
                  pipeline.codec: PCM_24_RAW
                </div>
              </div>

              {/* Bottom Telemetry Status bar */}
              <div className="mt-3 pt-2 border-t border-[#21262D] flex items-center justify-between text-[10px] font-mono text-[#8B949E] flex-shrink-0">
                <span>ENCODING: UTF-8 // 24kHz SAMPLING</span>
                <span className="text-[#34A853]">STATUS: READY TO DISPATCH</span>
              </div>

            </div>
          </TerminalWindow>
        </div>

        {/* RIGHT COLUMN: VOCAL TIMBRE & PERSONA MATRIX (4 COLS) */}
        <div className={`lg:col-span-4 flex flex-col transition-all duration-200 ${isTimbreRouterMinimized ? 'min-h-0' : 'min-h-[360px]'}`}>
          <TerminalWindow
            title="VOCAL_TIMBRE_ROUTER.conf"
            subtitle="Speaker Model Selection"
            badge={selectedStyle.name}
            badgeColor="yellow"
            accentColor="yellow"
            className="h-full"
            isMinimized={isTimbreRouterMinimized}
            onMinimizeChange={setIsTimbreRouterMinimized}
            headerActions={
              <button
                onClick={onOpenVoiceConfig}
                className="p-1 rounded text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors"
                title="Configure Voice Parameters"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="flex-1 p-3 bg-[#161B22] flex flex-col gap-2 overflow-y-auto custom-scrollbar">
              
              <div className="text-[10px] font-mono text-[#8B949E] pb-1 uppercase font-bold">
                Timbre Profiles available:
              </div>

              <div className="flex-1 flex flex-col gap-2 min-h-0">
                {INTRO_STYLES.map((style) => {
                  const isSelected = selectedStyle.id === style.id;
                  
                  return (
                    <div
                      key={style.id}
                      onClick={() => onSelectStyle(style)}
                      className={`p-3 rounded-lg border font-mono text-xs cursor-pointer select-none transition-all ${
                        isSelected
                          ? 'border-[#FBBC04] bg-[#FBBC04]/10 shadow-[0_0_12px_rgba(251,188,4,0.15)] text-white'
                          : 'border-[#30363D] bg-[#0D1117]/60 text-[#8B949E] hover:border-[#8B949E] hover:bg-[#161B22]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className={isSelected ? 'text-[#FBBC04]' : 'text-[#E6EDF3]'}>
                          {style.name}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#21262D]">
                          {style.id === 'custom' ? 'USER_DEF' : 'SYS_PRE'}
                        </span>
                      </div>
                      
                      <div className="text-[10px] text-[#8B949E] mt-1 line-clamp-2 leading-relaxed">
                        {style.description}
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-[#30363D]">
                        <span className="text-[#8B949E]">DEFAULT: {style.defaultVoice}</span>
                        {isSelected && (
                          <span className="text-[#34A853] font-bold">● PATCHED</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </TerminalWindow>
        </div>

      </div>

      {/* WINDOW 1: MASTER COMMAND STATION & AUDIO DECK (Placed at bottom) */}
      <TerminalWindow
        title="MASTER_COMMAND_STATION.exec"
        subtitle="Linear PCM 24kHz / Neural Synthesis Core"
        badge={isLoading ? 'PROCESSING' : isPlaying ? 'ON AIR' : generatedAudio ? 'BUFFER READY' : 'STANDBY'}
        badgeColor={isLoading ? 'yellow' : isPlaying ? 'red' : generatedAudio ? 'green' : 'blue'}
        accentColor="blue"
        isMinimized={isCommandStationMinimized}
        onMinimizeChange={setIsCommandStationMinimized}
      >
        <div className="p-3.5 sm:p-4 bg-[#161B22] flex flex-col gap-3.5">
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Primary Action Button & Status */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onSynthesizeOrPlay}
                disabled={isLoading || !text.trim()}
                className={`h-11 sm:h-12 px-5 sm:px-6 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 flex-shrink-0 ${
                  isLoading
                    ? 'bg-[#FBBC04] text-black border border-[#FBBC04]/50 cursor-wait'
                    : isPlaying
                    ? 'bg-[#EA4335] hover:bg-[#D93025] text-white border border-[#EA4335]/50 shadow-[0_0_15px_rgba(234,67,53,0.4)] animate-pulse'
                    : generatedAudio
                    ? 'bg-[#34A853] hover:bg-[#2D9247] text-white border border-[#34A853]/50 shadow-[0_0_15px_rgba(52,168,83,0.4)]'
                    : 'bg-[#4285F4] hover:bg-[#3367D6] text-white border border-[#4285F4]/50 shadow-[0_0_15px_rgba(66,133,244,0.4)]'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>SYNTHESIZING...</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>PAUSE_STREAM</span>
                  </>
                ) : generatedAudio ? (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>REPLAY_BUFFER</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>EXECUTE_SYNTH</span>
                  </>
                )}
              </button>

              {/* Status Telemetry */}
              <div className="flex flex-col justify-center font-mono min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-[#E6EDF3] font-bold truncate">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    isLoading ? 'bg-[#FBBC04] animate-ping' :
                    isPlaying ? 'bg-[#EA4335] animate-pulse' :
                    generatedAudio ? 'bg-[#34A853]' : 'bg-[#8B949E]'
                  }`} />
                  <span className="truncate">
                    {isLoading ? 'NEURAL COMPILATION' : isPlaying ? 'STREAM ACTIVE' : generatedAudio ? '24kHz STEREO' : 'IDLE'}
                  </span>
                </div>
                <div className="text-[10px] text-[#8B949E] truncate">
                  {audioDuration > 0 ? `${audioDuration.toFixed(1)}s generated` : `${text.length} chars buffered`}
                </div>
              </div>
            </div>

            {/* Tactical Command Buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
              {/* AI Dramatize Button */}
              <button
                onClick={onDramatize}
                disabled={isDramatizing || !text.trim()}
                className={`px-3 py-2 rounded-lg border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-all ${
                  isDramatizing
                    ? 'bg-[#FBBC04]/20 text-[#FBBC04] border-[#FBBC04]/50'
                    : 'bg-[#21262D] hover:bg-[#30363D] text-[#FBBC04] border-[#30363D] hover:border-[#FBBC04]/50'
                }`}
                title="Dramatize script using Gemini AI"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isDramatizing ? 'animate-spin' : ''}`} />
                <span>DRAMATIZE</span>
              </button>

              {/* Save to Cloud */}
              <button
                onClick={onSaveToCloud}
                disabled={isSaving || !text.trim()}
                className={`px-3 py-2 rounded-lg border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-all ${
                  justSaved
                    ? 'bg-[#34A853] text-white border-[#34A853]'
                    : 'bg-[#21262D] hover:bg-[#30363D] text-[#8AB4F8] border-[#30363D]'
                }`}
                title="Save script to Firebase Firestore"
              >
                {justSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5 text-[#4285F4]" />}
                <span>{justSaved ? 'SAVED' : 'SAVE_VAULT'}</span>
              </button>

              {/* WAV Export Button */}
              <button
                onClick={onDownloadWav}
                disabled={!generatedAudio}
                className="px-3.5 py-2 rounded-lg border border-[#4285F4] bg-[#4285F4] hover:bg-[#3367D6] disabled:opacity-40 disabled:hover:bg-[#4285F4] text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(66,133,244,0.3)]"
                title="Download 24kHz Master WAV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT_WAV</span>
              </button>
            </div>

          </div>

          {/* Waveform Scrubber Strip */}
          <div className="pt-2 border-t border-[#21262D] flex items-center gap-3">
            <span className="text-[10px] font-mono text-[#8B949E] uppercase font-bold flex-shrink-0">
              SPECTRUM: {(audioProgress * 100).toFixed(0)}%
            </span>
            <div className="flex-1 flex items-end gap-1 h-6 bg-[#0D1117] border border-[#30363D] rounded px-2 py-1 overflow-hidden">
              {[15, 30, 22, 45, 60, 25, 38, 70, 48, 20, 35, 55, 65, 32, 40, 75, 50, 28, 36, 62, 44, 25, 35, 55, 40, 25].map((h, idx) => (
                <div
                  key={idx}
                  style={{ height: `${Math.min(100, Math.max(15, h * (isPlaying ? 1.2 : 0.6)))}%` }}
                  className={`flex-1 rounded-2xs transition-all ${
                    audioProgress > (idx / 26) 
                      ? 'bg-[#34A853]' 
                      : 'bg-[#21262D]'
                  }`}
                />
              ))}
            </div>
            {audioDuration > 0 && (
              <span className="text-[10px] font-mono text-[#8B949E] flex-shrink-0">
                {(audioProgress * audioDuration).toFixed(1)}s / {audioDuration.toFixed(1)}s
              </span>
            )}
          </div>

          {/* Error Banner */}
          {audioError && (
            <div className="p-2.5 rounded border border-[#EA4335]/40 bg-[#EA4335]/10 text-[#EA4335] font-mono text-xs flex items-center justify-between">
              <span>[ERR]: {audioError}</span>
              <button onClick={onDismissError} className="font-bold text-white px-2 py-0.5 bg-[#EA4335] rounded">✕</button>
            </div>
          )}

        </div>
      </TerminalWindow>

    </div>
  );
};
