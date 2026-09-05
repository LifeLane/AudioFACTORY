/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Universal CTA Banner
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Disc, ShieldCheck, Zap } from 'lucide-react';

interface CtaBannerProps {
  title?: string;
  subtitle?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({
  title = 'Ready to turn words into finished audio?',
  subtitle = 'Join thousands of producers, creators, and game studios building production-ready voice tracks in minutes.',
  primaryCtaText = 'Start Creating Free',
  secondaryCtaText = 'View Pricing Plans'
}) => {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="relative rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-white/15 p-8 sm:p-12 lg:p-16 text-center shadow-2xl overflow-hidden">
        
        {/* Amber Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        
        {/* Radial Wave Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Access &bull; No Credit Card Required</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            {title}
          </h2>

          <p className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-105 rounded-xl shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all duration-200 border border-amber-300"
            >
              <Zap className="w-5 h-5 fill-black" />
              <span>{primaryCtaText}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-zinc-200 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 rounded-xl border border-white/10 transition-colors"
            >
              <span>{secondaryCtaText}</span>
            </Link>
          </div>

          {/* Value Badges */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Full Commercial Rights</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Disc className="w-4 h-4 text-amber-400" />
              <span>Lossless 24-bit 48kHz WAV</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Gemini 2.5 + ElevenLabs V2</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
