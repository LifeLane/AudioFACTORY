/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY About Page
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { CtaBanner } from '../components/CtaBanner';
import { Sparkles, Users, Disc, ShieldCheck, Heart, Zap, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-20 py-12">
      <SeoHead
        title="About Us | AudioFACTORY"
        description="Learn about the mission, audio engineering philosophy, and team behind AudioFACTORY — empowering creators with next-generation AI speech synthesis."
        canonicalPath="/about"
      />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Our Vision</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
          Democratizing <br />
          <span className="text-amber-400">master-grade audio production.</span>
        </h1>
        <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
          We built AudioFACTORY because creating high-production audio shouldn’t require thousands of dollars in studio gear or weeks of voice actor scheduling.
        </p>
      </section>

      {/* Philosophy Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0C101A] border border-white/10 rounded-2xl p-8 sm:p-12 space-y-6 shadow-xl leading-relaxed text-zinc-300 text-base">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            The Hybrid Audio Philosophy
          </h2>
          <p>
            Traditional text-to-speech tools treat voice as an afterthought — monotone sentences delivered in isolation. But real audio production is an interconnected symphony: the natural breathing of an actor, the subtle back-and-forth cadence of conversation, the atmospheric rise of background music, and the precise sidechain ducking that keeps speech intelligible.
          </p>
          <p>
            At AudioFACTORY, we combine the ultra-low latency intelligence of Google Gemini 2.5 with the hyper-realistic neural acoustic models of ElevenLabs into a single unified browser and mobile workstation.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-center">
            <div className="p-4 rounded-xl bg-zinc-900 border border-white/5">
              <span className="text-3xl font-black text-amber-400">100%</span>
              <p className="text-xs text-zinc-400 mt-1 font-mono">Creator Owned Rights</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900 border border-white/5">
              <span className="text-3xl font-black text-emerald-400">48kHz</span>
              <p className="text-xs text-zinc-400 mt-1 font-mono">Broadcast Lossless WAV</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900 border border-white/5">
              <span className="text-3xl font-black text-sky-400">&lt;250ms</span>
              <p className="text-xs text-zinc-400 mt-1 font-mono">Real-Time Synthesis</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CtaBanner
        title="Experience the new standard in audio."
        subtitle="Join the AudioFACTORY community and build your next voice project today."
        primaryCtaText="Launch Studio Free"
        secondaryCtaText="View Pricing"
      />
    </div>
  );
};
