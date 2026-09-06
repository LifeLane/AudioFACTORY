import React from 'react';
import { 
  Music, 
  Mic, 
  Sparkles, 
  Volume2, 
  Sliders, 
  Play, 
  Pause, 
  Zap,
  Disc3,
  Flame,
  Wind,
  BellRing
} from 'lucide-react';
import { BgmGenerator } from '../BgmGenerator';
import { TerminalWindow } from './TerminalWindow';
import { LivePresenceBar } from '../LivePresenceBar';

const QUICK_SFX_PRESETS = [
  { id: 'whoosh', name: 'Cinematic Whoosh', prompt: 'Fast airy cinematic sub-bass whoosh transition', icon: Wind },
  { id: 'impact', name: 'Dramatic Impact', prompt: 'Heavy cinematic sub-bass hit impact with reverb tail', icon: Flame },
  { id: 'chime', name: 'Studio Bell Stinger', prompt: 'Crystal clean modern broadcast chime notification', icon: BellRing },
  { id: 'vinyl', name: 'Vinyl Crackle Bed', prompt: 'Vintage warm vinyl static crackle room tone loop', icon: Disc3 }
];

interface TerminalAudioSuiteViewProps {
  onBgmBufferGenerated?: (buffer: AudioBuffer) => void;
  onOpenVoiceCloning: () => void;
  activeBgmBuffer?: AudioBuffer | null;
  onRequireAuth?: (action?: () => void) => void;
  bgmVolume: number;
  setBgmVolume: (v: number) => void;
  voiceVolume: number;
  setVoiceVolume: (v: number) => void;
  sfxGeneratingId: string | null;
  generatedSfx: Record<string, string>;
  playingSfxId: string | null;
  handleGenerateQuickSfx: (preset: typeof QUICK_SFX_PRESETS[0]) => void;
  playSfx: (id: string) => void;
}

export const TerminalAudioSuiteView: React.FC<TerminalAudioSuiteViewProps> = ({
  onBgmBufferGenerated,
  onOpenVoiceCloning,
  activeBgmBuffer,
  onRequireAuth,
  bgmVolume,
  setBgmVolume,
  voiceVolume,
  setVoiceVolume,
  sfxGeneratingId,
  generatedSfx,
  playingSfxId,
  handleGenerateQuickSfx,
  playSfx
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-3 sm:p-5 md:p-6 space-y-4 font-mono text-[#E1E4E8]">
      
      {/* 1. TOP STATUS PANEL */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3 mb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EA4335]/20 text-[#F28B82] border border-[#EA4335]/40 uppercase tracking-wider">
              G-TERM // AUDIO_PRODUCTION
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#30363D] text-[#8B949E] uppercase">
              Pro Suite & Foley Lab
            </span>
          </div>
          <p className="text-xs text-[#8B949E] mt-1.5 leading-relaxed">
            Synthesize soundscapes, clone actor timbres, trigger dynamic sound effects, and mix stems.
          </p>
        </div>

        <button
          onClick={onOpenVoiceCloning}
          className="px-3.5 py-1.5 rounded-lg border border-[#EA4335] bg-[#EA4335]/15 hover:bg-[#EA4335]/25 text-[#F28B82] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Clone Voice</span>
        </button>
      </div>

      {/* Live Presence state indicator */}
      <div className="scale-90 origin-left border border-[#30363D] rounded-lg p-2 bg-[#161B22]/20">
        <LivePresenceBar />
      </div>

      {/* 2. MAIN BENTO GRID OF COMPARTMENTS */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-y-auto custom-scrollbar pr-1">
        
        {/* COMPARTMENT 1: AI Soundscape Engine (7 cols) */}
        <div className="lg:col-span-7 flex flex-col min-h-0">
          <TerminalWindow
            title="AI_AMBIENT_SOUNDSCAPE_ENGINE.sh"
            badge="Looping Ready"
            accentColor="yellow"
          >
            <div className="p-4 space-y-4 bg-[#0D1117] h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Music className="w-4 h-4 text-[#FBBC04]" />
                  <span className="text-xs font-bold text-[#E6EDF3] uppercase">
                    ElevenLabs Audio Neural Synthesis
                  </span>
                </div>
                
                {/* Background music soundscape builder */}
                <BgmGenerator 
                  onBgmGenerated={async (buf) => {
                    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const decoded = await ctx.decodeAudioData(buf.slice(0));
                    onBgmBufferGenerated?.(decoded);
                  }}
                  onRequireAuth={onRequireAuth}
                />
              </div>
            </div>
          </TerminalWindow>
        </div>

        {/* COMPARTMENT 2: Voice Cloning Telemetry (5 cols) */}
        <div className="lg:col-span-5 flex flex-col min-h-0">
          <TerminalWindow
            title="VOICE_CLONING_TELEMETRY.conf"
            badge="HD Acoustic"
            accentColor="red"
          >
            <div className="p-4 space-y-4 bg-[#0D1117] h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#F28B82]" />
                  <span className="text-xs font-bold text-[#E6EDF3] uppercase">
                    Custom Vocal Resonance Cloning
                  </span>
                </div>
                
                <p className="text-xs text-[#8B949E] leading-relaxed">
                  Clone your vocal resonance with a 30-second studio recording. Once cloned, your voice model becomes immediately assignable to actors in the Multi-Speaker Drama Studio.
                </p>

                {/* Animated waveform visualizer mock */}
                <div className="p-3.5 rounded-lg bg-[#161B22] border border-[#30363D] space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-[#E6EDF3] font-bold">
                    <span>Microphone Telemetry</span>
                    <span className="text-[#34A853]">Ready</span>
                  </div>
                  <div className="flex items-center gap-1 h-3 bg-[#0D1117] rounded overflow-hidden px-1 border border-[#30363D]/60">
                    {[20, 45, 75, 30, 60, 85, 40, 25, 50, 90, 65, 30, 40, 70, 80, 50, 35].map((val, i) => (
                      <div 
                        key={i} 
                        style={{ height: `${val}%` }} 
                        className="flex-1 bg-rose-500/80 rounded-xs" 
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-[#8B949E]">
                    <span>-48 dB</span>
                    <span>Stereo 48kHz Target</span>
                    <span>0 dB Peak</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenVoiceCloning}
                className="w-full py-2.5 rounded-lg border border-[#30363D] bg-[#161B22] hover:bg-[#21262D] text-[#E6EDF3] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Mic className="w-3.5 h-3.5 text-rose-400" />
                <span>Open Recording Wizard</span>
              </button>
            </div>
          </TerminalWindow>
        </div>

        {/* COMPARTMENT 3: Foley Soundboard (6 cols) */}
        <div className="lg:col-span-6 flex flex-col min-h-0">
          <TerminalWindow
            title="FOLEY_EFFECTS_SOUNDBOARD.sh"
            badge="Instant Sync"
            accentColor="blue"
          >
            <div className="p-4 space-y-3.5 bg-[#0D1117] h-full">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#8AB4F8]" />
                <span className="text-xs font-bold text-[#E6EDF3] uppercase">
                  Foley & Sound Effects Soundboard
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {QUICK_SFX_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const hasGenerated = Boolean(generatedSfx[preset.id]);
                  const isGen = sfxGeneratingId === preset.id;
                  const isPlaying = playingSfxId === preset.id;

                  return (
                    <div
                      key={preset.id}
                      className="p-3 rounded-lg border border-[#30363D] bg-[#161B22] hover:border-[#8B949E]/40 transition-all flex flex-col justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Icon className="w-3.5 h-3.5 text-[#8B949E] flex-shrink-0" />
                        <span className="text-xs font-bold text-[#E6EDF3] truncate">
                          {preset.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        {hasGenerated ? (
                          <button
                            onClick={() => playSfx(preset.id)}
                            className={`flex-1 py-1.5 px-2.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all uppercase tracking-wider ${
                              isPlaying 
                                ? 'bg-amber-400 text-zinc-950 animate-pulse' 
                                : 'bg-[#0D1117] border border-[#30363D] text-[#C9D1D9] hover:bg-[#21262D]'
                            }`}
                          >
                            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                            <span>{isPlaying ? 'Playing' : 'Play FX'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGenerateQuickSfx(preset)}
                            disabled={isGen}
                            className="flex-1 py-1.5 px-2.5 rounded border border-[#30363D] bg-[#161B22] hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] text-[10px] font-bold flex items-center justify-center gap-1 transition-all uppercase tracking-wider disabled:opacity-40"
                          >
                            {isGen ? (
                              <div className="w-3 h-3 border-2 border-[#E6EDF3] border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3 text-[#8AB4F8]" />
                            )}
                            <span>{isGen ? 'Synth...' : 'Generate'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TerminalWindow>
        </div>

        {/* COMPARTMENT 4: Master Mix Console (6 cols) */}
        <div className="lg:col-span-6 flex flex-col min-h-0">
          <TerminalWindow
            title="MASTER_STEM_MIX_CONSOLE.exec"
            badge="Bus Faders"
            accentColor="green"
          >
            <div className="p-4 space-y-4 bg-[#0D1117] h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#81C995]" />
                  <span className="text-xs font-bold text-[#E6EDF3] uppercase">
                    Master Stem Mixer & Bus Faders
                  </span>
                </div>

                <div className="space-y-3.5 pt-1">
                  {/* Dialogue Track Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-[#8B949E] mb-1.5">
                      <span className="font-bold flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-[#F28B82]" /> Spoken Dialogue Stem
                      </span>
                      <span className="text-[#E6EDF3]">{voiceVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={voiceVolume}
                      onChange={e => setVoiceVolume(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#161B22] border border-[#30363D] rounded-lg appearance-none cursor-pointer accent-[#EA4335]"
                    />
                  </div>

                  {/* BGM Track Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-[#8B949E] mb-1.5">
                      <span className="font-bold flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5 text-[#FDD663]" /> Background Soundscape Bed
                      </span>
                      <span className="text-[#E6EDF3]">{bgmVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={bgmVolume}
                      onChange={e => setBgmVolume(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#161B22] border border-[#30363D] rounded-lg appearance-none cursor-pointer accent-[#FBBC04]"
                    />
                  </div>
                </div>
              </div>

              {/* Active Soundscape Status */}
              <div className="p-2.5 rounded-lg bg-[#161B22] border border-[#30363D] flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 text-[#8B949E]">
                  <div className={`w-2 h-2 rounded-full ${activeBgmBuffer ? 'bg-[#34A853]' : 'bg-[#30363D]'}`} />
                  <span>{activeBgmBuffer ? 'Background Bed Active in Memory' : 'No Background Bed Loaded'}</span>
                </div>
                {activeBgmBuffer && (
                  <span className="text-[#34A853] font-bold">
                    {activeBgmBuffer.duration.toFixed(1)}s
                  </span>
                )}
              </div>
            </div>
          </TerminalWindow>
        </div>

      </div>

    </div>
  );
};
