/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Official Landing Page
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { AudioPipelineVisualizer } from '../components/AudioPipelineVisualizer';
import { InteractiveVoicePlayer } from '../components/InteractiveVoicePlayer';
import { FeatureBentoGrid } from '../components/FeatureBentoGrid';
import { CtaBanner } from '../components/CtaBanner';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Volume2, 
  Layers, 
  Users, 
  Mic, 
  Radio, 
  Sliders, 
  Music, 
  Download, 
  CheckCircle2, 
  Shield, 
  Zap,
  Star,
  Cpu
} from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-24 sm:space-y-32">
      <SeoHead
        title="AudioFACTORY | Turn words into finished audio."
        description="AI-powered scripts, voices, dialogue and sound — in one production studio. Create multi-speaker scenes, high-fidelity speech, instant voice cloning, and algorithmic BGM."
        canonicalPath="/"
      />

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Amber Ambient Top Light */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          
          {/* Studio Release Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>AudioFACTORY Studio v2.5 Online</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">Gemini 2.5 Flash & ElevenLabs</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
            Turn words into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
              finished audio.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal">
            AI-powered scripts, voices, dialogue and sound — in one production studio.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-105 rounded-xl shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all duration-200 border border-amber-300"
            >
              <Zap className="w-5 h-5 fill-black" />
              <span>Start Creating Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#pipeline"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-zinc-200 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 rounded-xl border border-white/10 transition-colors"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Explore AudioFACTORY</span>
            </a>
          </div>

          {/* Social Proof Metric Strip */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">30+</span>
              <span>Neural Personalities</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">&lt;250ms</span>
              <span>Synthesis Latency</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">48kHz</span>
              <span>Lossless 24-Bit WAV</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-sm">100%</span>
              <span>Commercial Rights</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. VISUAL PRODUCTION PIPELINE (Script → Cast → Generate → Mix → Export) */}
      <section id="pipeline" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AudioPipelineVisualizer />
      </section>

      {/* 3. CORE STUDIO CAPABILITIES (Bento Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Complete Feature Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
              Engineered for Real Audio Workflows
            </h2>
          </div>
          <Link
            to="/features"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300"
          >
            <span>View All Detailed Specs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <FeatureBentoGrid />
      </section>

      {/* 4. INTERACTIVE VOICE EXPLORER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InteractiveVoicePlayer />
      </section>

      {/* 5. MULTI-SPEAKER & SCRIPT GENERATION HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-zinc-950 via-[#0E131F] to-zinc-950 border border-white/10 rounded-2xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-2xl">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Multi-Character Orchestration</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Create full podcasts and dramas with casted AI dialogue.
            </h2>

            <p className="text-zinc-300 text-base leading-relaxed">
              Never record a monologue and manually slice it together again. AudioFACTORY allows you to cast independent characters for each dialogue line, insert natural pauses, adjust voice timbres, and synthesize the entire scene with full multichannel stems.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Smart Actor Switching</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Assign distinct neural actors line-by-line in a click.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Automated Sidechain Ducking</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">BGM smoothly dips whenever any speaker talks.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg transition-colors"
              >
                <span>Launch Multi-Speaker Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-black/80 border border-white/10 rounded-xl p-5 font-mono text-xs space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-zinc-400 border-b border-white/10 pb-2">
              <span className="text-amber-400 font-bold">MULTISPEAKER SCENE CONSOLE</span>
              <span className="text-emerald-400 text-[10px]">SYNCED</span>
            </div>
            
            <div className="space-y-2">
              <div className="p-2.5 rounded bg-zinc-900/90 border-l-2 border-amber-500">
                <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold mb-1">
                  <span>SPEAKER 01 &bull; Algieba (Narrator)</span>
                  <span className="text-zinc-500">00:00 - 00:06</span>
                </div>
                <p className="text-zinc-200 text-xs italic">&ldquo;The studio went silent as the red light flared to life.&rdquo;</p>
              </div>

              <div className="p-2.5 rounded bg-zinc-900/90 border-l-2 border-emerald-500">
                <div className="flex items-center justify-between text-[11px] text-emerald-300 font-semibold mb-1">
                  <span>SPEAKER 02 &bull; Rachel (Host)</span>
                  <span className="text-zinc-500">00:07 - 00:14</span>
                </div>
                <p className="text-zinc-200 text-xs italic">&ldquo;We are live. Let’s hear that master stem playback now!&rdquo;</p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
              <span>Master Compression: Fast Peak</span>
              <span>Export: 48kHz WAV</span>
            </div>
          </div>

        </div>
      </section>

      {/* 6. TESTIMONIALS & CREATOR QUOTES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
            Trusted by Creators
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
            Built for High-Velocity Audio Production
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0C101A] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed italic">
              &ldquo;AudioFACTORY slashed our game dialogue prototyping time from three days to under fifteen minutes. The multi-speaker casting and instant WAV stem export are unmatched.&rdquo;
            </p>
            <div className="pt-2 border-t border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300 text-xs">
                DK
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">David K.</h5>
                <span className="text-[11px] text-zinc-400">Lead Sound Designer, Obsidian Void</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0C101A] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed italic">
              &ldquo;The voice cloning and automated BGM sidechain ducking create a polished podcast trailer without touching an external DAW. It just works right in the browser.&rdquo;
            </p>
            <div className="pt-2 border-t border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300 text-xs">
                SL
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Sarah Lin</h5>
                <span className="text-[11px] text-zinc-400">Executive Producer, TechPulse Daily</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0C101A] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed italic">
              &ldquo;Having the Lifetime Pass gives our agency permanent unlimited audio generations. The combination of Gemini 2.5 and ElevenLabs makes it the ultimate audio weapon.&rdquo;
            </p>
            <div className="pt-2 border-t border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300 text-xs">
                MR
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Marc Rossi</h5>
                <span className="text-[11px] text-zinc-400">Creative Director, Apex Media Studio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. UNIVERSAL CTA BANNER */}
      <CtaBanner
        title="Turn words into finished audio today."
        subtitle="Start with 3 free generations daily as a guest, or upgrade for unlimited high-fidelity studio access."
        primaryCtaText="Start Creating Free"
        secondaryCtaText="Explore Pricing Plans"
      />
    </div>
  );
};
