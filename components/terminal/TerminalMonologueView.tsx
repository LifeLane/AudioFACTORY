import React from 'react';
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
  onDownloadWav
}) => {
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

      {/* WINDOW 1: MASTER COMMAND STATION & AUDIO DECK */}
      <TerminalWindow
        title="MASTER_COMMAND_STATION.exec"
        subtitle="Linear PCM 24kHz / Neural Synthesis Core"
        badge={isLoading ? 'PROCESSING' : isPlaying ? 'ON AIR' : generatedAudio ? 'BUFFER READY' : 'STANDBY'}
        badgeColor={isLoading ? 'yellow' : isPlaying ? 'red' : generatedAudio ? 'green' : 'blue'}
        accentColor="blue"
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

      {/* TWO COLUMN BENTO TERMINAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        
        {/* LEFT COLUMN: SCRIPT EDITOR TERMINAL BUFFER (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col min-h-[360px]">
          <TerminalWindow
            title="SCRIPT_STREAM_BUFFER.txt"
            subtitle="Spoken Speech Synthesis Pipeline"
            badge={`${text.length} CHARS`}
            badgeColor="blue"
            accentColor="green"
            className="h-full"
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
                  className="text-[#8B949E] hover:text-[#EA4335] transition-colors"
                  title="Clear script buffer"
                >
                  [CLEAR]
                </button>
              </div>
            }
          >
            <div className="flex-1 flex flex-col p-3 sm:p-4 bg-[#0D1117] min-h-0">
              
              {/* Quick Drama Injector Chips with safe touch padding */}
              <div className="flex items-center gap-2 py-2 mb-2 border-b border-[#21262D] overflow-x-auto custom-scrollbar flex-shrink-0">
                <span className="text-[10px] font-mono text-[#8B949E] uppercase font-bold flex-shrink-0">
                  CUES:
                </span>
                {DRAMA_CUES.map((cue, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => insertCue(cue.tag)}
                    className="px-2.5 py-1 rounded bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] hover:border-[#FBBC04] text-[11px] font-mono text-[#FBBC04] whitespace-nowrap transition-colors flex-shrink-0"
                  >
                    + {cue.label}
                  </button>
                ))}
              </div>

              {/* Textarea Editor Styled like Vim/Nano Buffer */}
              <div className="relative flex-1 flex min-h-[220px]">
                {/* Line numbers simulated */}
                <div className="w-8 pr-2 text-right select-none font-mono text-xs text-[#484F58] leading-relaxed hidden sm:block">
                  {Array.from({ length: Math.max(8, text.split('\n').length + 2) }).map((_, i) => (
                    <div key={i}>{String(i + 1).padStart(2, '0')}</div>
                  ))}
                </div>

                <textarea
                  value={text}
                  onChange={(e) => onTextChange(e.target.value)}
                  placeholder=">_ Enter prompt or speech script here... (e.g. In a world where neural networks speak with emotion...)"
                  className="flex-1 p-2 bg-transparent text-[#E6EDF3] font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-none overflow-y-auto custom-scrollbar border-l border-[#21262D] pl-3"
                />
              </div>

              {/* Status Bar */}
              <div className="mt-3 pt-2 border-t border-[#21262D] flex items-center justify-between text-[10px] font-mono text-[#8B949E] flex-shrink-0">
                <span>ENCODING: UTF-8 // 24kHz SAMPLING</span>
                <span className="text-[#34A853]">STATUS: READY TO DISPATCH</span>
              </div>

            </div>
          </TerminalWindow>
        </div>

        {/* RIGHT COLUMN: VOCAL TIMBRE & PERSONA MATRIX (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col min-h-[360px]">
          <TerminalWindow
            title="VOCAL_TIMBRE_ROUTER.conf"
            subtitle="Speaker Model Selection"
            badge={selectedStyle.name}
            badgeColor="yellow"
            accentColor="yellow"
            className="h-full"
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
                ACTIVE_VOICE: <span className="text-[#4285F4]">{selectedVoice}</span>
              </div>

              {/* Persona Terminal Cards */}
              <div className="space-y-2 flex-1">
                {INTRO_STYLES.map((style: IntroStyle, idx: number) => {
                  const isSelected = selectedStyle.id === style.id;
                  const colors = ['#EA4335', '#4285F4', '#FBBC04', '#34A853'];
                  const color = colors[idx % colors.length];

                  return (
                    <div
                      key={style.id}
                      onClick={() => onSelectStyle(style)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-[#4285F4] bg-[#21262D] shadow-[0_0_12px_rgba(66,133,244,0.25)]'
                          : 'border-[#30363D] bg-[#0D1117] hover:border-[#8B949E] hover:bg-[#161B22]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: color, boxShadow: isSelected ? `0 0 8px ${color}` : 'none' }}
                          />
                          <span className="text-xs font-mono font-bold text-[#E6EDF3]">
                            {style.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#8B949E]">
                          PID: {100 + idx}
                        </span>
                      </div>

                      <p className="text-[11px] font-mono text-[#8B949E] mt-1 line-clamp-2">
                        {style.description}
                      </p>

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

    </div>
  );
};
