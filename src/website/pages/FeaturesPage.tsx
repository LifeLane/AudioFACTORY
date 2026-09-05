/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Features Deep Dive Page
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { CtaBanner } from '../components/CtaBanner';
import { 
  FileText, 
  Users, 
  Mic2, 
  Sparkles, 
  Music, 
  Download, 
  Cloud, 
  Radio, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  Zap, 
  Cpu, 
  Lock,
  ArrowRight,
  Headphones,
  Compass,
  Activity
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const featuresList = [
    {
      id: 'script-engine',
      category: 'Stage 01: Pre-Production',
      title: 'AI Scriptwriting & Dramatization',
      tagline: 'Transform raw ideas into performance-ready voiceover scripts.',
      icon: FileText,
      color: 'text-amber-400',
      bullets: [
        'Automatic theatrical dramatization with pause and emotion cues',
        'Direct SSML performance tags for breath intake and pacing',
        'Multi-character script parsing that segments dialogue automatically',
        'Estimated speaking duration calculator before generation'
      ],
      mockCode: 'Director Cue: [Sharp breath intake before punchline]\nMarcus: "In a world without audio boundaries..."'
    },
    {
      id: 'multi-speaker',
      category: 'Stage 02: Casting & Performance',
      title: 'Multi-Speaker Scene Production',
      tagline: 'Direct complex multi-actor conversations in a single unified timeline.',
      icon: Users,
      color: 'text-amber-400',
      bullets: [
        'Cast up to 10+ distinct neural actors per scene',
        'Independent track volume, pitch offset, and timing adjustments',
        'Automatic cross-character cadence balancing and room acoustics',
        'Instant multi-track timeline auditioning in the browser'
      ],
      mockCode: 'Speaker 01 (Algieba): "Commencing sequence."\nSpeaker 02 (Aoede): "Buffers synchronized."'
    },
    {
      id: 'neural-voices',
      category: 'Stage 03: Neural Synthesis',
      title: 'Hybrid Dual-Engine Voice Matrix',
      tagline: 'Access 30+ premium Gemini 2.5 and ElevenLabs V2 neural voices.',
      icon: Sparkles,
      color: 'text-amber-400',
      bullets: [
        'Gemini 2.5 Flash sub-250ms neural speech synthesis',
        'ElevenLabs ultra-realistic conversational and narrative models',
        'Multilingual support with native dialect phrasing',
        'Dynamic pitch and speaking rate controls per speaker'
      ],
      mockCode: 'Engine: Gemini 2.5 + ElevenLabs V2\nSample Rate: 24kHz - 48kHz Lossless\nLatency: 220ms'
    },
    {
      id: 'voice-cloning',
      category: 'Stage 03: Voice Customization',
      title: 'Zero-Shot Instant Voice Cloning',
      tagline: 'Clone any speaker signature from 10 seconds of clear audio.',
      icon: Mic2,
      color: 'text-amber-400',
      bullets: [
        'Upload WAV/MP3 or record directly via microphone in studio',
        'Extracts acoustic timbre, cadence, and vocal fry profiles',
        'Instant studio availability across Monologue and Multi-Speaker modes',
        'Zero model training wait times or cloud queuing delays'
      ],
      mockCode: 'Reference Sample: 10.4s WAV\nTimbre Extraction: 100% Match\nStudio ID: custom_clone_01'
    },
    {
      id: 'bgm-sidechain',
      category: 'Stage 04: Sound Design & Mixing',
      title: 'Algorithmic BGM & Sidechain Ducking',
      tagline: 'Synthesize custom background scores with automated vocal ducking.',
      icon: Music,
      color: 'text-emerald-400',
      bullets: [
        'Styles: Cyber Ambient, Lo-Fi Beat, Cinematic Drone, Top 40',
        'Smart Sidechain: Automatically dips BGM volume during speech',
        'Custom ducking attack, release time, and attenuation levels',
        'Real-time WebAudio DAW playback with independent faders'
      ],
      mockCode: 'BGM Track: Ambient Cyber Pulse\nDucking Level: -12.0 dB\nRelease: 350ms'
    },
    {
      id: 'master-export',
      category: 'Stage 05: Master Delivery',
      title: 'Broadcast-Grade Lossless Audio Export',
      tagline: 'Render uncompressed master tracks and isolated stems.',
      icon: Download,
      color: 'text-emerald-400',
      bullets: [
        'Master 24-bit 48kHz uncompressed WAV rendering',
        'Isolated stems export (Voice-only, BGM-only, Subtitles)',
        'Built-in peak limiter preventing digital clipping (>0.0dBFS)',
        'Commercial broadcast rights included across all exports'
      ],
      mockCode: 'Format: 24-bit 48kHz PCM WAV\nPeak: -0.3 dBFS True Peak\nStems Included: Yes'
    },
    {
      id: 'cloud-persistence',
      category: 'Infrastructure & Collaboration',
      title: 'Firebase Cloud Sync & Live Collaboration',
      tagline: 'Seamlessly save, reopen, and collaborate on audio projects.',
      icon: Cloud,
      color: 'text-amber-400',
      bullets: [
        'Persistent project storage backed by Google Cloud Firestore',
        'Live presence indicators and collaborative multi-user editing',
        'Offline caching with automatic cloud reconciliation',
        'Cross-platform sync between Web and Android app'
      ],
      mockCode: 'Persistence: Firestore Realtime\nSync Latency: <50ms\nSecurity: User Token Isolated'
    }
  ];

  return (
    <div className="space-y-20 py-12">
      <SeoHead
        title="Features & Specifications | AudioFACTORY"
        description="Explore the complete AudioFACTORY suite: AI script dramatization, multi-speaker dialogue production, 30+ neural voices, voice cloning, BGM synthesis, and lossless export."
        canonicalPath="/features"
      />

      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span>Complete Technical Capabilities</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
          Every tool you need to build <br />
          <span className="text-amber-400">master-grade voice audio.</span>
        </h1>
        <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
          From the first word in the script to the final 24-bit WAV master file, AudioFACTORY consolidates the entire audio workflow.
        </p>
      </section>

      {/* Detailed Features List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {featuresList.map((feat, idx) => {
          const Icon = feat.icon;
          const isEven = idx % 2 === 0;

          return (
            <div
              key={feat.id}
              id={feat.id}
              className={`bg-[#0C101A] border border-white/10 rounded-2xl p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xl ${
                !isEven ? 'lg:grid-flow-dense' : ''
              }`}
            >
              {/* Text & Bullets */}
              <div className={`lg:col-span-7 space-y-5 ${!isEven ? 'lg:col-start-6' : ''}`}>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                  {feat.category}
                </span>
                
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {feat.title}
                </h3>
                
                <p className="text-zinc-300 text-base leading-relaxed">
                  {feat.tagline}
                </p>

                <ul className="space-y-3 pt-2">
                  {feat.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-3 text-sm text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-3">
                  <Link
                    to="/app"
                    className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300"
                  >
                    <span>Try this in Audio Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Console / Visual Mock Card */}
              <div className={`lg:col-span-5 bg-black/80 border border-white/10 rounded-xl p-5 font-mono text-xs space-y-4 shadow-inner ${
                !isEven ? 'lg:col-start-1' : ''
              }`}>
                <div className="flex items-center justify-between text-zinc-400 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${feat.color}`} />
                    <span className="text-zinc-200 font-bold">DAW TELEMETRY</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">ACTIVE</span>
                </div>

                <pre className="text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap bg-zinc-950/80 p-3.5 rounded-lg border border-white/5">
                  {feat.mockCode}
                </pre>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                  <span>AudioFACTORY Engine</span>
                  <span className="text-amber-400">Production Ready</span>
                </div>
              </div>

            </div>
          );
        })}
      </section>

      {/* CTA */}
      <CtaBanner
        title="Experience the full audio production suite."
        subtitle="No installation needed. Open AudioFACTORY in your browser or Android device."
        primaryCtaText="Launch Free Studio"
        secondaryCtaText="Compare Plans"
      />
    </div>
  );
};
