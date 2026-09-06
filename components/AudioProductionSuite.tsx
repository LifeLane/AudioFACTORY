import React, { useState } from 'react';
import { 
  Music, 
  Mic, 
  Sparkles, 
  Volume2, 
  Sliders, 
  Play, 
  Pause, 
  Download, 
  Radio, 
  Wand2, 
  Layers, 
  CheckCircle2, 
  Zap,
  Disc3,
  Flame,
  Wind,
  BellRing,
  VolumeX
} from 'lucide-react';
import { BgmGenerator } from './BgmGenerator';
import { generateBGM } from '../services/elevenLabsService';
import { decodeBase64ToBytes } from '../services/geminiService';
import { LivePresenceBar } from './LivePresenceBar';
import { useFirebase } from '../services/firebaseContext';

interface AudioProductionSuiteProps {
  onBgmBufferGenerated?: (buffer: AudioBuffer) => void;
  onOpenVoiceCloning: () => void;
  activeBgmBuffer?: AudioBuffer | null;
  onRequireAuth?: (action?: () => void) => void;
}

const QUICK_SFX_PRESETS = [
  { id: 'whoosh', name: 'Cinematic Whoosh', prompt: 'Fast airy cinematic sub-bass whoosh transition', icon: Wind },
  { id: 'impact', name: 'Dramatic Impact', prompt: 'Heavy cinematic sub-bass hit impact with reverb tail', icon: Flame },
  { id: 'chime', name: 'Studio Bell Stinger', prompt: 'Crystal clean modern broadcast chime notification', icon: BellRing },
  { id: 'vinyl', name: 'Vinyl Crackle Bed', prompt: 'Vintage warm vinyl static crackle room tone loop', icon: Disc3 }
];

export const AudioProductionSuite: React.FC<AudioProductionSuiteProps> = ({
  onBgmBufferGenerated,
  onOpenVoiceCloning,
  activeBgmBuffer,
  onRequireAuth
}) => {
  const { user } = useFirebase();
  const [sfxGeneratingId, setSfxGeneratingId] = useState<string | null>(null);
  const [generatedSfx, setGeneratedSfx] = useState<Record<string, string>>({});
  const [playingSfxId, setPlayingSfxId] = useState<string | null>(null);
  const [bgmVolume, setBgmVolume] = useState<number>(75);
  const [voiceVolume, setVoiceVolume] = useState<number>(100);

  const handleGenerateQuickSfx = async (preset: typeof QUICK_SFX_PRESETS[0], skipAuthCheck = false) => {
    if (!user && !skipAuthCheck) {
      if (onRequireAuth) onRequireAuth(() => handleGenerateQuickSfx(preset, true));
      return;
    }
    setSfxGeneratingId(preset.id);
    try {
      const buffer = await generateBGM(preset.prompt, 5);
      const audioBytes = decodeBase64ToBytes(buffer.audioBase64);
      const blob = new Blob([audioBytes as any], { type: buffer.contentType || 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      setGeneratedSfx(prev => ({ ...prev, [preset.id]: url }));
      // Play immediately
      const audio = new Audio(url);
      setPlayingSfxId(preset.id);
      audio.onended = () => setPlayingSfxId(null);
      audio.play();
    } catch (err) {
      console.error("SFX generation error:", err);
    } finally {
      setSfxGeneratingId(null);
    }
  };

  const playSfx = (id: string) => {
    const url = generatedSfx[id];
    if (!url) return;
    const audio = new Audio(url);
    setPlayingSfxId(id);
    audio.onended = () => setPlayingSfxId(null);
    audio.play();
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-3 sm:p-5 md:p-6 space-y-4 bg-[#F7F7F4] dark:bg-[#0D1117] dark:text-[#E6EDF3]">
      
      {/* Live Collaboration & Studio Status Bar */}
      <LivePresenceBar />

      {/* Top Header Bento Strip */}
      <div className="border border-zinc-200 dark:border-[#30363D] bg-white dark:bg-[#161B22]/95 p-4 sm:p-5 rounded-xl shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-[#E6EDF3] uppercase tracking-tight">
              Audio Production Suite & Foley Lab
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-[#FBBC04]/15 text-amber-900 dark:text-[#FBBC04] border border-amber-200 dark:border-[#FBBC04]/30">
              Multi-Track Pro
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-500 dark:text-[#8B949E] mt-0.5">
            Synthesize soundscapes, clone actor timbres, trigger dynamic sound effects, and mix stems.
          </p>
        </div>

        <button
          onClick={onOpenVoiceCloning}
          className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider border border-rose-700 shadow-xs flex items-center gap-2 transition-transform active:scale-95"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Launch Voice Cloner</span>
        </button>
      </div>

      {/* Main 4-Quadrant Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* BENTO CARD 1: Background Music (BGM) Generator (7 cols) */}
        <div className="lg:col-span-7 border border-zinc-200 dark:border-[#30363D] bg-white dark:bg-[#161B22]/95 p-4 sm:p-5 rounded-xl shadow-2xs flex flex-col justify-between space-y-4 backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#30363D] pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-[#FBBC04]/15 text-amber-900 dark:text-[#FBBC04] flex items-center justify-center font-mono font-bold">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-[#E6EDF3] uppercase">
                    AI Ambient & BGM Soundscapes
                  </h2>
                  <span className="text-[11px] font-mono text-zinc-400 dark:text-[#8B949E]">
                    ElevenLabs Audio Neural Engine
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-zinc-100 dark:bg-[#21262D] text-zinc-700 dark:text-[#8B949E] px-2 py-0.5 rounded">
                Looping Ready
              </span>
            </div>

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

        {/* BENTO CARD 2: Instant Voice Cloning Booth (5 cols) */}
        <div className="lg:col-span-5 border border-zinc-200 dark:border-[#30363D] bg-white dark:bg-[#161B22]/95 p-4 sm:p-5 rounded-xl shadow-2xs flex flex-col justify-between space-y-4 backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#30363D] pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-[#EA4335]/15 text-rose-700 dark:text-[#EA4335] flex items-center justify-center font-mono font-bold">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-[#E6EDF3] uppercase">
                    Voice Cloning Booth
                  </h2>
                  <span className="text-[11px] font-mono text-zinc-400 dark:text-[#8B949E]">
                    Custom Actor Profiles
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-rose-50 dark:bg-[#EA4335]/15 text-rose-700 dark:text-[#EA4335] border border-rose-200 dark:border-[#EA4335]/30 px-2 py-0.5 rounded font-bold">
                HD Acoustic
              </span>
            </div>

            <p className="text-xs font-mono text-zinc-600 dark:text-[#8B949E] leading-relaxed">
              Clone your vocal resonance with a 30-second studio recording. Once cloned, your voice model becomes immediately assignable to actors in the Multi-Speaker Drama Studio.
            </p>

            <div className="mt-4 p-3.5 rounded-lg bg-zinc-50 dark:bg-[#0D1117] border border-zinc-200 dark:border-[#30363D] space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-700 dark:text-[#E6EDF3] font-bold">
                <span>Microphone Telemetry</span>
                <span className="text-emerald-600 dark:text-[#34A853]">Ready</span>
              </div>
              <div className="flex items-center gap-1 h-3 bg-zinc-200 dark:bg-[#21262D] rounded overflow-hidden px-1">
                {[20, 45, 75, 30, 60, 85, 40, 25, 50, 90, 65, 30, 40, 70, 80, 50, 35].map((val, i) => (
                  <div 
                    key={i} 
                    style={{ height: `${val}%` }} 
                    className="flex-1 bg-rose-500/80 rounded-xs" 
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-400 dark:text-[#8B949E]">
                <span>-48 dB</span>
                <span>Stereo 48kHz Target</span>
                <span>0 dB Peak</span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenVoiceCloning}
            className="w-full py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <Mic className="w-3.5 h-3.5 text-rose-400" />
            <span>Open Recording Wizard</span>
          </button>
        </div>

        {/* BENTO CARD 3: Quick SFX & Foley Soundboard (6 cols) */}
        <div className="lg:col-span-6 border border-zinc-200 dark:border-[#30363D] bg-white dark:bg-[#161B22]/95 p-4 sm:p-5 rounded-xl shadow-2xs space-y-3 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#30363D] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-[#4285F4]/15 text-sky-900 dark:text-[#4285F4] flex items-center justify-center font-mono font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-[#E6EDF3] uppercase">
                  Foley & Sound Effects Soundboard
                </h2>
                <span className="text-[11px] font-mono text-zinc-400 dark:text-[#8B949E]">
                  Instant Neural Sound Synthesis
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-sky-50 dark:bg-[#4285F4]/15 text-sky-800 dark:text-[#4285F4] border border-sky-200 dark:border-[#4285F4]/30 px-2 py-0.5 rounded font-bold">
              1-Click
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_SFX_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const hasGenerated = Boolean(generatedSfx[preset.id]);
              const isGen = sfxGeneratingId === preset.id;
              const isPlaying = playingSfxId === preset.id;

              return (
                <div
                  key={preset.id}
                  className="p-3 rounded-lg border border-zinc-200 dark:border-[#30363D] bg-zinc-50 dark:bg-[#0D1117] hover:bg-zinc-100/80 dark:hover:bg-[#161B22]/50 transition-all flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Icon className="w-3.5 h-3.5 text-zinc-600 dark:text-[#8B949E] flex-shrink-0" />
                      <span className="text-xs font-mono font-bold text-zinc-900 dark:text-[#E6EDF3] truncate">
                        {preset.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1">
                    {hasGenerated ? (
                      <button
                        onClick={() => playSfx(preset.id)}
                        className={`flex-1 py-1 px-2 rounded text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-colors ${
                          isPlaying 
                            ? 'bg-amber-400 text-zinc-950 animate-pulse' 
                            : 'bg-zinc-900 dark:bg-[#21262D] text-white hover:bg-zinc-800 dark:hover:bg-[#30363D]'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                        <span>{isPlaying ? 'Playing' : 'Play FX'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGenerateQuickSfx(preset)}
                        disabled={isGen}
                        className="flex-1 py-1 px-2 rounded bg-white dark:bg-[#161B22] hover:bg-zinc-200 dark:hover:bg-[#21262D] border border-zinc-200 dark:border-[#30363D] text-zinc-800 dark:text-[#E6EDF3] text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        {isGen ? (
                          <div className="w-3 h-3 border-2 border-zinc-800 dark:border-[#E6EDF3] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-sky-600 dark:text-[#4285F4]" />
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

        {/* BENTO CARD 4: Master Stem Console & Mixing Radar (6 cols) */}
        <div className="lg:col-span-6 border border-zinc-200 dark:border-[#30363D] bg-white dark:bg-[#161B22]/95 p-4 sm:p-5 rounded-xl shadow-2xs space-y-3 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#30363D] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-[#34A853]/15 text-emerald-900 dark:text-[#34A853] flex items-center justify-center font-mono font-bold">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-[#E6EDF3] uppercase">
                  Master Stem Mixer & Bus Faders
                </h2>
                <span className="text-[11px] font-mono text-zinc-400 dark:text-[#8B949E]">
                  Dialogue vs Soundscape Balance
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 dark:bg-[#34A853]/15 text-emerald-800 dark:text-[#34A853] border border-emerald-200 dark:border-[#34A853]/30 px-2 py-0.5 rounded font-bold">
              24kHz Master
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {/* Dialogue Track Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono text-zinc-700 dark:text-[#E6EDF3] mb-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-rose-600 dark:text-[#EA4335]" /> Spoken Dialogue Stem
                </span>
                <span>{voiceVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={voiceVolume}
                onChange={e => setVoiceVolume(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-[#21262D] rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
            </div>

            {/* BGM Track Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono text-zinc-700 dark:text-[#E6EDF3] mb-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-amber-500 dark:text-[#FBBC04]" /> Background Soundscape Bed
                </span>
                <span>{bgmVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={bgmVolume}
                onChange={e => setBgmVolume(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-[#21262D] rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Active BGM Buffer Status */}
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#0D1117] border border-zinc-200 dark:border-[#30363D] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-700 dark:text-[#E6EDF3]">
                <div className={`w-2 h-2 rounded-full ${activeBgmBuffer ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-[#30363D]'}`} />
                <span>{activeBgmBuffer ? 'Background Bed Active in Memory' : 'No Background Bed Loaded'}</span>
              </div>
              {activeBgmBuffer && (
                <span className="text-emerald-700 dark:text-[#34A853] font-bold text-[11px]">
                  {activeBgmBuffer.duration.toFixed(1)}s
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
