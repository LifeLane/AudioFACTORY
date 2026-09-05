/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Interactive Voice Preview Player
 */
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Sparkles, Mic, Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface VoiceDemoItem {
  id: string;
  name: string;
  category: 'Cinematic' | 'Podcast' | 'Narrative' | 'Character' | 'Commercial' | 'Cloned';
  gender: 'Male' | 'Female';
  provider: 'Gemini 2.5' | 'ElevenLabs';
  style: string;
  accent: string;
  sampleLine: string;
  tempoBpm: number;
}

export const FEATURED_VOICE_DEMOS: VoiceDemoItem[] = [
  {
    id: 'Algieba',
    name: 'Algieba (Marcus S.)',
    category: 'Cinematic',
    gender: 'Male',
    provider: 'Gemini 2.5',
    style: 'Deep, Authoritative, Trailer',
    accent: 'US Cinematic',
    sampleLine: 'In a world where ordinary sounds fail to inspire, one studio rewrites the frequency of storytelling.',
    tempoBpm: 92
  },
  {
    id: 'Aoede',
    name: 'Aoede',
    category: 'Podcast',
    gender: 'Female',
    provider: 'Gemini 2.5',
    style: 'Breezy, Natural, Intimate',
    accent: 'US Neutral',
    sampleLine: 'Welcome back to the studio. Today, we are dissecting how multi-speaker AI changes the podcasting landscape.',
    tempoBpm: 110
  },
  {
    id: 'Vindemiatrix',
    name: 'Vindemiatrix (Jaz DJ)',
    category: 'Commercial',
    gender: 'Male',
    provider: 'Gemini 2.5',
    style: 'High-Energy, Punchy, Radio DJ',
    accent: 'British Estuary',
    sampleLine: 'Massive vibes locked in! Turn this right up — the brand new audio revolution starts in three, two, let’s go!',
    tempoBpm: 128
  },
  {
    id: 'Callirrhoe',
    name: 'Callirrhoe',
    category: 'Narrative',
    gender: 'Female',
    provider: 'Gemini 2.5',
    style: 'Warm, Easy-going, Audiobook',
    accent: 'US Warm',
    sampleLine: 'The morning mist slowly rolled across the valley, carrying with it the quiet whispers of forgotten travelers.',
    tempoBpm: 100
  },
  {
    id: 'Charon',
    name: 'Charon',
    category: 'Narrative',
    gender: 'Male',
    provider: 'Gemini 2.5',
    style: 'Informative, Documentary, Steady',
    accent: 'Mid-Atlantic',
    sampleLine: 'Deep within the acoustic architecture of the studio, neural networks reconstruct the subtle nuances of human inflection.',
    tempoBpm: 104
  },
  {
    id: 'Rachel',
    name: 'Rachel (Studio Elite)',
    category: 'Podcast',
    gender: 'Female',
    provider: 'ElevenLabs',
    style: 'Crisp, Professional, Conversational',
    accent: 'American Standard',
    sampleLine: 'AudioFACTORY empowers modern audio producers to build complex multi-character dialogue in seconds flat.',
    tempoBpm: 112
  },
  {
    id: 'Adam',
    name: 'Adam (Narrator Prime)',
    category: 'Cinematic',
    gender: 'Male',
    provider: 'ElevenLabs',
    style: 'Resonant, Dynamic, Dramatic',
    accent: 'US Deep',
    sampleLine: 'When you take complete control of both script and voice, the line between fiction and reality disappears completely.',
    tempoBpm: 98
  },
  {
    id: 'CustomClone',
    name: 'Acoustic Clone Matrix',
    category: 'Cloned',
    gender: 'Male',
    provider: 'Gemini 2.5',
    style: 'Zero-Shot Mic Matched Voice',
    accent: 'Custom Cloned Profile',
    sampleLine: 'This custom voice signature was extracted from just ten seconds of clean reference microphone audio.',
    tempoBpm: 106
  }
];

export const InteractiveVoicePlayer: React.FC = () => {
  const [activeVoiceId, setActiveVoiceId] = useState<string>('Algieba');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const activeVoice = FEATURED_VOICE_DEMOS.find((v) => v.id === activeVoiceId) || FEATURED_VOICE_DEMOS[0];
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackProgress(0);
  };

  const playVoiceSample = (voice: VoiceDemoItem) => {
    stopAudio();
    setActiveVoiceId(voice.id);

    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(voice.sampleLine);
      utteranceRef.current = utterance;

      // Match voice parameters
      utterance.rate = voice.category === 'Cinematic' ? 0.9 : (voice.category === 'Commercial' ? 1.15 : 1.0);
      utterance.pitch = voice.gender === 'Female' ? 1.15 : 0.85;

      // Try selecting a matching system voice
      const voices = synthRef.current.getVoices();
      if (voices.length > 0) {
        const langVoice = voices.find(v => 
          (voice.gender === 'Female' ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('zira') : v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george'))
        );
        if (langVoice) {
          utterance.voice = langVoice;
        }
      }

      const estimatedDurationMs = (voice.sampleLine.split(' ').length / 2.5) * 1000;
      const startTime = Date.now();

      progressIntervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / estimatedDurationMs) * 100);
        setPlaybackProgress(progress);
        if (progress >= 100) {
          stopAudio();
        }
      }, 50);

      utterance.onend = () => {
        stopAudio();
      };
      utterance.onerror = () => {
        stopAudio();
      };

      synthRef.current.speak(utterance);
      setIsPlaying(true);
    } else {
      // Fallback timer simulation
      setIsPlaying(true);
      const startTime = Date.now();
      const dur = 4000;
      progressIntervalRef.current = window.setInterval(() => {
        const p = Math.min(100, ((Date.now() - startTime) / dur) * 100);
        setPlaybackProgress(p);
        if (p >= 100) stopAudio();
      }, 50);
    }
  };

  const categories = ['All', 'Cinematic', 'Podcast', 'Commercial', 'Narrative', 'Cloned'];
  const filteredVoices = filterCategory === 'All' 
    ? FEATURED_VOICE_DEMOS 
    : FEATURED_VOICE_DEMOS.filter(v => v.category === filterCategory);

  return (
    <div className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
            Interactive Voice Explorer
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Audition Neural Personas & Timbres
          </h3>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Voice List + Master Audition Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        
        {/* Left Column: Voice Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {filteredVoices.map((voice) => {
            const isSelected = voice.id === activeVoiceId;
            const isThisPlaying = isSelected && isPlaying;

            return (
              <div
                key={voice.id}
                onClick={() => {
                  if (isSelected && isPlaying) {
                    stopAudio();
                  } else {
                    playVoiceSample(voice);
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-zinc-800/90 border-amber-400/80 shadow-md shadow-amber-500/10'
                    : 'bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-900/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-black/40 text-amber-300 border border-amber-500/20">
                      {voice.category}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {voice.provider}
                    </span>
                  </div>
                  <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{voice.name}</span>
                  </h5>
                  <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                    {voice.style} &bull; {voice.accent}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                    <Mic className="w-3 h-3 text-amber-400" />
                    <span>{voice.gender}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isThisPlaying) {
                        stopAudio();
                      } else {
                        playVoiceSample(voice);
                      }
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-95 ${
                      isThisPlaying
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-500/30'
                        : 'bg-zinc-800 text-zinc-200 hover:bg-amber-400 hover:text-black'
                    }`}
                    aria-label={`Audition ${voice.name}`}
                  >
                    {isThisPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Master Audition Player Deck */}
        <div className="lg:col-span-5 bg-black/60 border border-white/10 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                Audition Console
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Audio Engine
              </span>
            </div>

            <div>
              <h4 className="text-lg font-black text-white">{activeVoice.name}</h4>
              <p className="text-xs text-amber-400 font-mono mt-0.5">
                {activeVoice.style} &bull; {activeVoice.provider}
              </p>
            </div>

            {/* Script Teleprompter Card */}
            <div className="p-3.5 rounded-lg bg-zinc-900/90 border border-white/10 text-xs text-zinc-200 leading-relaxed italic relative">
              &ldquo;{activeVoice.sampleLine}&rdquo;
            </div>

            {/* Audio Waveform Canvas Preview */}
            <div className="space-y-2">
              <div className="h-10 bg-zinc-950 rounded-lg border border-white/10 p-2 flex items-center justify-between gap-1 overflow-hidden">
                {[15, 45, 80, 60, 95, 100, 75, 40, 60, 85, 90, 50, 70, 95, 60, 40, 80, 50, 30, 60, 85, 70, 40, 90, 55, 30, 20].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-all duration-150 ${
                      isPlaying
                        ? 'bg-amber-400 shadow-sm shadow-amber-500/20'
                        : 'bg-zinc-700'
                    }`}
                    style={{
                      height: isPlaying ? `${Math.max(15, (h * (i % 3 + 1)) % 100)}%` : '20%',
                    }}
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full transition-all duration-75"
                  style={{ width: `${playbackProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-5 border-t border-white/10 flex items-center justify-between gap-3 mt-4">
            <button
              onClick={() => {
                if (isPlaying) stopAudio();
                else playVoiceSample(activeVoice);
              }}
              className="flex-1 py-2.5 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-[0.98]"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-black" />
                  <span>Pause Audition</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Play Sample ({activeVoice.name.split(' ')[0]})</span>
                </>
              )}
            </button>

            <Link
              to="/app"
              className="px-3.5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <span>Use in Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
