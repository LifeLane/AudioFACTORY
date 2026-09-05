/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Voice Library & Audition Hall
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { InteractiveVoicePlayer } from '../components/InteractiveVoicePlayer';
import { CtaBanner } from '../components/CtaBanner';
import { 
  Mic2, 
  Sparkles, 
  Search, 
  Filter, 
  Volume2, 
  Play, 
  Pause, 
  ArrowRight,
  Disc,
  Users
} from 'lucide-react';

export const VoicesPage: React.FC = () => {
  return (
    <div className="space-y-20 py-12">
      <SeoHead
        title="Voice Library & Neural Audition Hall | AudioFACTORY"
        description="Audition 30+ neural voice personalities across Gemini 2.5 and ElevenLabs: cinematic trailers, conversational podcasts, British narrators, dynamic character voices, and zero-shot voice cloning."
        canonicalPath="/voices"
      />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
          <Mic2 className="w-3.5 h-3.5 text-amber-400" />
          <span>30+ Curated Neural Personalities</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
          Find the perfect voice for <br />
          <span className="text-amber-400">every character and mood.</span>
        </h1>
        
        <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
          Explore multi-accent, multi-lingual neural speech models engineered for deep emotional resonance, natural cadence, and zero robotic artifacts.
        </p>
      </section>

      {/* Main Interactive Audition Station */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InteractiveVoicePlayer />
      </section>

      {/* Voice Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Voice Profiles & Acoustical Ensembles
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Engineered specifically for broadcast formats and multi-speaker staging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0C101A] border border-white/10 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Cinematic & Dramatic</span>
            </h3>
            <p className="text-zinc-300 text-xs leading-relaxed">
              Deep resonant baritones and gripping alto tones with natural chest resonance, ideal for movie trailers, game intros, and epic audiobooks.
            </p>
            <div className="text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/5">
              Voices: Algieba, Adam, Fenrir, Marcus S.
            </div>
          </div>

          <div className="bg-[#0C101A] border border-white/10 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Podcast & Conversational</span>
            </h3>
            <p className="text-zinc-300 text-xs leading-relaxed">
              Relaxed, intimate speaking styles with natural pauses, subtle breath marks, and clear articulation designed for long-form listening.
            </p>
            <div className="text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/5">
              Voices: Aoede, Rachel, Callirrhoe, Charon
            </div>
          </div>

          <div className="bg-[#0C101A] border border-white/10 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>Commercial & Radio DJ</span>
            </h3>
            <p className="text-zinc-300 text-xs leading-relaxed">
              High-energy, punchy, persuasive deliveries with snappy cadences, perfect for TikTok promos, Spotify audio ads, and YouTube intros.
            </p>
            <div className="text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/5">
              Voices: Vindemiatrix (Jaz DJ), Puck, Kore
            </div>
          </div>
        </div>
      </section>

      {/* Voice Cloning Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-zinc-950 via-[#131926] to-zinc-950 border border-amber-500/30 rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Need your exact voice?</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Clone your own voice in 10 seconds.
            </h3>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Upload a brief audio sample or speak into your microphone in the studio. AudioFACTORY extracts your unique formant envelope and vocal timbre instantly.
            </p>
          </div>

          <Link
            to="/app"
            className="px-6 py-3.5 text-sm font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg transition-colors shrink-0 flex items-center gap-2"
          >
            <span>Launch Studio Voice Cloner</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <CtaBanner
        title="Audition voices directly in your projects."
        subtitle="Test any voice in real-time with full multi-speaker and BGM mixing."
        primaryCtaText="Launch Free Studio"
        secondaryCtaText="View Studio Plans"
      />
    </div>
  );
};
