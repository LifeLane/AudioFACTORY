/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Production Pipeline Visualizer
 * Script → Cast → Generate → Mix → Export
 */
import React, { useState } from 'react';
import { 
  FileText, 
  Users, 
  Sparkles, 
  Sliders, 
  Download, 
  CheckCircle2, 
  Play, 
  Volume2, 
  Music,
  Cpu,
  Layers,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PipelineStep {
  id: string;
  stepNumber: string;
  name: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  color: string;
  badge: string;
  mockDetails: {
    label: string;
    items: string[];
  };
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'script',
    stepNumber: '01',
    name: 'Script',
    tagline: 'AI Scriptwriting & Dramatization',
    description: 'Transform rough notes, story outlines, or raw dialogue into punchy, character-delineated scripts with auto-inserted emotional cues and SSML performance directions.',
    icon: FileText,
    color: 'from-amber-400 to-amber-600',
    badge: 'Gemini 2.5 Flash Script Engine',
    mockDetails: {
      label: 'Script Analysis & Cue Parsing',
      items: [
        '[Director: Breath intake before punchline]',
        'Marcus (Trailer Voice): "In a world without deadlines..."',
        'Elena (Bright): "Wait, did you check the commit logs?"',
        '[Auto-calculated target duration: 00:42.5s]'
      ]
    }
  },
  {
    id: 'cast',
    stepNumber: '02',
    name: 'Cast',
    tagline: 'Voice Assignment & Persona Matching',
    description: 'Assign unique acoustic signatures to each speaker. Choose from 30+ multi-accent neural voices or clone custom voices instantly from 10-second reference audio.',
    icon: Users,
    color: 'from-amber-500 to-orange-600',
    badge: 'Dual Engine: Gemini + ElevenLabs',
    mockDetails: {
      label: 'Speaker Casting Matrix',
      items: [
        'Speaker 1: Algieba (Deep / Firm / Cinematic)',
        'Speaker 2: Aoede (Breezy / Natural / Podcast)',
        'Speaker 3: Custom Cloned Voice (Studio Mic Profile)',
        'Pitch Offset: -1.2st | Dynamic Range: +4.0dB'
      ]
    }
  },
  {
    id: 'generate',
    stepNumber: '03',
    name: 'Generate',
    tagline: 'Parallel Neural Synthesis',
    description: 'Render multi-character dialogue streams concurrently. AudioFACTORY schedules multi-track synthesis with zero inter-line latency and natural cadence spacing.',
    icon: Sparkles,
    color: 'from-amber-400 to-yellow-500',
    badge: 'Sub-second Voice Synthesis',
    mockDetails: {
      label: 'Real-Time Neural Engine',
      items: [
        'Line 01: 24kHz 16-bit PCM (Synthesized in 240ms)',
        'Line 02: Prosody matching & pitch normalization applied',
        'Line 03: Breath inflection & sentence cadence aligned',
        'Total Generation Time: 0.8s for 14 dialogue turns'
      ]
    }
  },
  {
    id: 'mix',
    stepNumber: '04',
    name: 'Mix',
    tagline: 'Dynamic BGM & Sound FX Layering',
    description: 'Layer AI-synthesized background score, sidechain audio ducking when dialogue speaks, and dial in multi-band EQ and master studio compression.',
    icon: Sliders,
    color: 'from-emerald-400 to-teal-600',
    badge: 'WebAudio DAW Mixer + Sidechain Ducking',
    mockDetails: {
      label: 'Multi-Track Mixing Console',
      items: [
        'Track 1: Voice Master (Dialogue Level: 0.0dB)',
        'Track 2: Ambient Cyber/Lo-Fi BGM (Auto-Ducked -12dB)',
        'Master Bus: Fast Attack Limiter (True Peak -0.3dBFS)',
        'Acoustic Reverb: Studio Isolation Booth Preset'
      ]
    }
  },
  {
    id: 'export',
    stepNumber: '05',
    name: 'Export',
    tagline: 'Broadcast-Grade Lossless Delivery',
    description: 'Render full multichannel audio to 24-bit 48kHz lossless WAV or high-bitrate MP3 ready for YouTube, Spotify, podcast syndication, or video game engines.',
    icon: Download,
    color: 'from-amber-400 to-emerald-500',
    badge: 'Lossless 24-Bit WAV / MP3 / Zip Package',
    mockDetails: {
      label: 'Export Pipeline Matrix',
      items: [
        'Format: Master 48kHz / 24-bit Uncompressed WAV',
        'Separate Stems: Voice Only, BGM Only, Master Mix',
        'Timecode Synced SRT / JSON Subtitle Tracks',
        'Cloud Project Auto-Persisted to Firebase'
      ]
    }
  }
];

export const AudioPipelineVisualizer: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const currentStep = PIPELINE_STEPS[activeStepIndex];

  return (
    <div className="w-full bg-[#090D15] border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
      {/* Background Subtle Grid Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-1">
            <Cpu className="w-4 h-4" />
            <span>AudioFACTORY Studio Workflow</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            The 5-Stage Audio Production Pipeline
          </h3>
        </div>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md transition-colors w-fit"
        >
          <span>Test in Studio</span>
          <Zap className="w-3.5 h-3.5 fill-black" />
        </Link>
      </div>

      {/* Interactive Step Timeline Navigation */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-8">
        {PIPELINE_STEPS.map((step, idx) => {
          const isActive = idx === activeStepIndex;
          const isPassed = idx < activeStepIndex;
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => setActiveStepIndex(idx)}
              className={`text-left p-3.5 rounded-xl border transition-all duration-200 relative group ${
                isActive
                  ? 'bg-zinc-800/90 border-amber-400/80 shadow-lg shadow-amber-500/10'
                  : 'bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-900/80'
              }`}
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-amber-400' : 'text-zinc-500'}`}>
                  STAGE {step.stepNumber}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
              </div>
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>{step.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
              
              {/* Active glow bar */}
              {isActive && (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Step Showcase Card */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-zinc-950/80 border border-white/10 rounded-xl p-6 sm:p-8">
        {/* Step Explanation */}
        <div className="lg:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{currentStep.badge}</span>
          </div>
          
          <h4 className="text-2xl font-bold text-white tracking-tight">
            {currentStep.tagline}
          </h4>
          
          <p className="text-zinc-300 text-sm leading-relaxed">
            {currentStep.description}
          </p>

          <div className="pt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveStepIndex((prev) => (prev > 0 ? prev - 1 : PIPELINE_STEPS.length - 1))}
              className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 border border-white/10 rounded-lg"
            >
              &larr; Previous Stage
            </button>
            <button
              onClick={() => setActiveStepIndex((prev) => (prev < PIPELINE_STEPS.length - 1 ? prev + 1 : 0))}
              className="px-3.5 py-1.5 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm"
            >
              Next Stage: {PIPELINE_STEPS[(activeStepIndex + 1) % PIPELINE_STEPS.length].name} &rarr;
            </button>
          </div>
        </div>

        {/* Live Studio Mock Console */}
        <div className="lg:col-span-6 bg-[#0B0F17] border border-white/10 rounded-lg p-4 sm:p-5 font-mono text-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="font-semibold text-zinc-200">{currentStep.mockDetails.label}</span>
            </div>
            <span className="text-[10px] text-zinc-500">DAW CH-0{activeStepIndex + 1}</span>
          </div>

          {/* Console lines */}
          <div className="space-y-2 py-2 text-zinc-300">
            {currentStep.mockDetails.items.map((line, i) => (
              <div key={i} className="flex items-start gap-2 bg-black/40 p-2 rounded border border-white/5">
                <span className="text-amber-400 font-bold select-none">&gt;</span>
                <span className="leading-snug">{line}</span>
              </div>
            ))}
          </div>

          {/* Live Waveform Simulation */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-zinc-400 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Real-Time Peak Meter: -0.2 dBFS</span>
            </div>
            <div className="flex items-center gap-1 h-3">
              {[40, 70, 95, 60, 85, 100, 50, 75, 90, 45, 65, 80, 55, 30].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-amber-400/80 rounded-full"
                  style={{
                    height: `${(h * (activeStepIndex + 2)) % 100}%`,
                    opacity: 0.4 + (i % 3) * 0.3
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
