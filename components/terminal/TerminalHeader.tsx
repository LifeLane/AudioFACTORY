import React from 'react';
import { 
  Terminal, 
  Layers, 
  Radio, 
  Music, 
  Mic, 
  FolderOpen, 
  Sparkles, 
  Settings, 
  Volume2, 
  Monitor,
  LayoutGrid,
  Crown,
  Globe
} from 'lucide-react';
import { useTerminal } from './TerminalContext';
import { GenerationQuotaBadge } from '../GenerationQuotaBadge';
import { useEntitlementStore } from '../../src/store/useEntitlementStore';
import { PLANS } from '../../shared/plans';

interface TerminalHeaderProps {
  activeMode: 'intro' | 'multispeaker' | 'suite';
  onModeChange: (mode: 'intro' | 'multispeaker' | 'suite') => void;
  onOpenProjectsModal: () => void;
  onOpenConfigModal: () => void;
  isPlaying: boolean;
  isGenerating: boolean;
  onToggleTheme: () => void;
  isTerminalMode: boolean;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  activeMode,
  onModeChange,
  onOpenProjectsModal,
  onOpenConfigModal,
  isPlaying,
  isGenerating,
  onToggleTheme,
  isTerminalMode
}) => {
  const { terminalTheme, setTerminalTheme } = useTerminal();

  return (
    <header className="border-b border-[#30363D] bg-[#0D1117]/95 backdrop-blur-md sticky top-0 z-30 select-none">
      
      {/* Top Telemetry & Global System Bar */}
      <div className="px-3 sm:px-6 py-2 flex items-center justify-between gap-3 border-b border-[#21262D]">
        
        {/* Left: Terminal ASCII Brand + Google 4-Color LEDs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#161B22] border border-[#30363D] flex items-center justify-center text-[#4285F4] shadow-xs">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-xs text-[#E6EDF3] tracking-wider">
                  G-TERM
                </span>
                <span className="text-[10px] font-mono text-[#8B949E]">
                  // AUDIO.FACTORY
                </span>
              </div>
              <div className="text-[9px] font-mono text-[#4285F4] leading-none hidden sm:block">
                SYS.VERSION: 2.4.0-DEV
              </div>
            </div>
          </div>

          {/* Google 4-Color Status LED Array */}
          <div className="hidden md:flex items-center gap-2.5 px-2.5 py-1 rounded bg-[#161B22] border border-[#30363D] text-[10px] font-mono">
            <div className="flex items-center gap-1" title="Firebase Cloud Database">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4] shadow-[0_0_6px_#4285F4]" />
              <span className="text-[#8B949E]">NET</span>
            </div>
            <div className="flex items-center gap-1" title="Active Audio Playback Stream">
              <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#EA4335] shadow-[0_0_8px_#EA4335] animate-pulse' : 'bg-[#30363D]'}`} />
              <span className="text-[#8B949E]">ON-AIR</span>
            </div>
            <div className="flex items-center gap-1" title="Gemini 2.5 Flash Neural TTS">
              <span className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-[#FBBC04] shadow-[0_0_8px_#FBBC04] animate-ping' : 'bg-[#FBBC04]'}`} />
              <span className="text-[#8B949E]">SYNTH</span>
            </div>
            <div className="flex items-center gap-1" title="ElevenLabs Soundscapes Engine">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34A853] shadow-[0_0_6px_#34A853]" />
              <span className="text-[#8B949E]">STEMS</span>
            </div>
          </div>
        </div>

        {/* Center: Realtime Audio VU Output Meter */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded bg-[#161B22] border border-[#30363D]">
          <Volume2 className="w-3.5 h-3.5 text-[#8B949E]" />
          <div className="flex items-end gap-1 h-3.5 w-24">
            {[18, 45, 30, 70, 55, 85, 40, 95, 60, 30].map((h, idx) => (
              <div
                key={idx}
                style={{ height: `${isPlaying ? Math.min(100, h * 1.1) : 20}%` }}
                className={`flex-1 rounded-2xs transition-all duration-150 ${
                  idx > 7 
                    ? 'bg-[#EA4335]' 
                    : idx > 5 
                    ? 'bg-[#FBBC04]' 
                    : 'bg-[#34A853]'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono text-[#8B949E]">
            {isPlaying ? '-3dB' : 'MUTE'}
          </span>
        </div>

        {/* Right: Theme Toggle & Cloud Vault & Voice Settings */}
        <div className="flex items-center gap-2">
          {/* Plan & Daily Quota Status */}
          <GenerationQuotaBadge />

          {/* Marketing Website Link */}
          <a
            href="/website"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg border border-[#30363D] bg-[#161B22] hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] transition-colors hidden sm:flex items-center gap-1 text-xs font-mono"
            title="Open AudioFACTORY Marketing Website"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
          </a>

          {/* Theme Toggle Button (G-TERM vs BAUHAUS) */}
          <button
            onClick={onToggleTheme}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs ${
              isTerminalMode
                ? 'border-[#4285F4]/60 bg-[#4285F4]/15 text-[#8AB4F8] hover:bg-[#4285F4]/25 shadow-[0_0_12px_rgba(66,133,244,0.25)]'
                : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100'
            }`}
            title="Toggle between G-Term Matrix and Bauhaus Modernist UI"
          >
            <Monitor className="w-3.5 h-3.5 text-[#4285F4]" />
            <span className="hidden sm:inline">G-TERM</span>
          </button>

          {isTerminalMode && (
            <button
              onClick={() => setTerminalTheme(terminalTheme === 'classic' ? 'googly' : 'classic')}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs ${
                terminalTheme === 'googly'
                  ? 'border-[#EA4335]/60 bg-[#EA4335]/15 text-[#F28B82] hover:bg-[#EA4335]/25 shadow-[0_0_15px_rgba(234,67,53,0.35)] animate-pulse'
                  : 'border-[#30363D] bg-[#161B22] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]'
              }`}
              title="Switch between Classic Terminal and vibrant, bold Googly Terminal theme"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FBBC04]" />
              <span>{terminalTheme === 'googly' ? 'GOOGLY' : 'CLASSIC'}</span>
            </button>
          )}

          {/* Cloud Projects Button */}
          <button
            onClick={onOpenProjectsModal}
            className="px-2.5 py-1.5 rounded-lg border border-[#30363D] bg-[#161B22] hover:bg-[#21262D] text-[#E6EDF3] text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors"
            title="Open Cloud Projects"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#FBBC04]" />
            <span className="hidden sm:inline">VAULT</span>
          </button>

          {/* Voice Settings */}
          <button
            onClick={onOpenConfigModal}
            className="p-1.5 rounded-lg border border-[#30363D] bg-[#161B22] hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
            title="Configure System Voice Models"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Primary Terminal Mode Tabs */}
      <div className="px-3 sm:px-6 py-1.5 flex items-center gap-2 overflow-x-auto custom-scrollbar bg-[#0D1117]">
        
        <button
          onClick={() => onModeChange('intro')}
          className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-2 transition-all whitespace-nowrap ${
            activeMode === 'intro'
              ? 'bg-[#4285F4]/20 text-[#8AB4F8] border border-[#4285F4]/60 shadow-[0_0_10px_rgba(66,133,244,0.2)]'
              : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]'
          }`}
        >
          <span className="text-[#4285F4]">❯</span>
          <Radio className="w-3.5 h-3.5" />
          <span>01_MONO_SPEECH</span>
          {activeMode === 'intro' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4] animate-ping" />
          )}
        </button>

        <button
          onClick={() => onModeChange('multispeaker')}
          className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-2 transition-all whitespace-nowrap ${
            activeMode === 'multispeaker'
              ? 'bg-[#EA4335]/20 text-[#F28B82] border border-[#EA4335]/60 shadow-[0_0_10px_rgba(234,67,53,0.2)]'
              : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]'
          }`}
        >
          <span className="text-[#EA4335]">❯</span>
          <Layers className="w-3.5 h-3.5" />
          <span>02_SCENE_DRAMA</span>
          {activeMode === 'multispeaker' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335] animate-ping" />
          )}
        </button>

        <button
          onClick={() => onModeChange('suite')}
          className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-2 transition-all whitespace-nowrap ${
            activeMode === 'suite'
              ? 'bg-[#FBBC04]/20 text-[#FDD663] border border-[#FBBC04]/60 shadow-[0_0_10px_rgba(251,188,4,0.2)]'
              : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]'
          }`}
        >
          <span className="text-[#FBBC04]">❯</span>
          <Music className="w-3.5 h-3.5" />
          <span>03_BGM_&_STEMS</span>
          {activeMode === 'suite' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#FBBC04] animate-ping" />
          )}
        </button>

      </div>

    </header>
  );
};
