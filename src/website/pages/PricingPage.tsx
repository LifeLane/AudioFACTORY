/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Official Pricing Page
 * Directly imports PLANS from shared/plans.ts (Zero constant duplication)
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { CtaBanner } from '../components/CtaBanner';
import { PLANS } from '../../../shared/plans';
import { 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  HelpCircle, 
  Crown, 
  Infinity, 
  ArrowRight,
  Disc,
  Clock,
  Layers,
  Users
} from 'lucide-react';

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // Derive plans directly from authoritative PLANS config
  const guestPlan = PLANS.guest;
  const freePlan = PLANS.free;
  const proMonthly = PLANS.pro_monthly;
  const proAnnual = PLANS.pro_annual;
  const lifetime = PLANS.lifetime;

  return (
    <div className="space-y-20 py-12">
      <SeoHead
        title="Pricing & Studio Plans | AudioFACTORY"
        description="Choose the ideal AudioFACTORY plan: Creator Starter with daily free quotas, Pro Monthly & Annual with unlimited generations, or Lifetime Studio Pass with permanent access."
        canonicalPath="/pricing"
      />

      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>Transparent Creator Pricing</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
          Simple plans for <br />
          <span className="text-amber-400">serious audio production.</span>
        </h1>
        
        <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
          Start creating for free immediately without a credit card. Upgrade whenever you need unlimited generations, instant voice cloning, and priority queues.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="pt-6 flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-zinc-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-14 h-7 rounded-full bg-zinc-800 p-1 relative transition-colors focus:outline-none border border-white/10"
            aria-label="Toggle Billing Cycle"
          >
            <div
              className={`w-5 h-5 rounded-full bg-amber-400 transition-transform ${
                billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-white' : 'text-zinc-400'}`}>
              Annual
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/30">
              Save 35%
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 1. Free / Creator Starter */}
          <div className="bg-[#0C101A] border border-white/10 rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  {freePlan.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Free Access</h3>
              <p className="text-xs text-zinc-400 mt-1 mb-4 leading-relaxed">
                Ideal for testing out monologues and exploring the multi-speaker studio.
              </p>

              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-xs text-zinc-400 font-mono">/ forever</span>
              </div>

              {/* Free Quotas */}
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1 text-xs font-mono mb-6">
                <div className="flex justify-between text-zinc-300">
                  <span>Guest Pass:</span>
                  <span className="font-bold text-amber-400">{guestPlan.dailyGenerations} gens/day</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Free Account:</span>
                  <span className="font-bold text-emerald-400">{freePlan.dailyGenerations} gens/day</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Standard Gemini 2.5 voice models</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Multi-speaker scenes (up to 15 lines)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Dynamic BGM generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Lossless WAV & MP3 exports</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Firebase cloud saving</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                to="/app"
                className="w-full py-3 text-center text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl block transition-colors"
              >
                Start Free in Studio
              </Link>
            </div>
          </div>

          {/* 2. Pro Monthly */}
          <div className="bg-[#0C101A] border border-white/10 rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  {proMonthly.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">{proMonthly.name}</h3>
              <p className="text-xs text-zinc-400 mt-1 mb-4 leading-relaxed">
                Full studio access with zero daily generation caps for high-output creators.
              </p>

              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-black text-white">${proMonthly.priceUsd}</span>
                <span className="text-xs text-zinc-400 font-mono">/ month</span>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300 font-bold mb-6 flex items-center gap-2">
                <Infinity className="w-4 h-4 text-amber-400" />
                <span>Unlimited Daily Speech Gens</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Unlimited generations (No quotas)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>All Gemini & ElevenLabs voices</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Zero-shot instant voice cloning</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Multi-speaker scenes up to 100 lines</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Fastest priority synthesis queues</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                to="/profile"
                className="w-full py-3 text-center text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl block shadow-md transition-colors"
              >
                Request Early Access
              </Link>
            </div>
          </div>

          {/* 3. Pro Annual (Highlighted) */}
          <div className="bg-gradient-to-b from-zinc-900 to-[#121824] border-2 border-amber-400/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative shadow-2xl scale-[1.02]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-400 text-black text-[11px] font-mono font-black uppercase tracking-wider shadow-md">
              Most Popular &bull; Save 35%
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 mt-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                  Annual Pass
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">{proAnnual.name}</h3>
              <p className="text-xs text-zinc-300 mt-1 mb-4 leading-relaxed">
                Full unlimited studio access with maximum discount savings billed annually.
              </p>

              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-black text-white">${proAnnual.priceUsd}</span>
                <span className="text-xs text-zinc-400 font-mono">/ year (~$12.40/mo)</span>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-500/30 text-xs font-mono text-amber-200 font-bold mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Unlimited Gens + Priority Server Queue</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-200">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold">All Pro features included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Unlimited generations all year</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Instant voice cloning engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Lossless 48kHz WAV master stems</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Google Play & Web synchronized billing</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                to="/profile"
                className="w-full py-3 text-center text-xs font-black text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:brightness-105 rounded-xl block shadow-lg shadow-amber-500/30 transition-all active:scale-[0.98]"
              >
                Request Early Access
              </Link>
            </div>
          </div>

          {/* 4. Lifetime Studio Pass */}
          <div className="bg-[#0C101A] border border-white/10 rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  {lifetime.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">{lifetime.name}</h3>
              <p className="text-xs text-zinc-400 mt-1 mb-4 leading-relaxed">
                One single payment. Permanent studio entitlement with all future voice models.
              </p>

              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-black text-white">${lifetime.priceUsd}</span>
                <span className="text-xs text-zinc-400 font-mono">/ one-time</span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 font-bold mb-6 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Never Pay Again &bull; Permanent Access</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Permanent unlimited generations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>All present and future voice models</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Lifetime commercial broadcasting license</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Direct VIP developer support</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                to="/profile"
                className="w-full py-3 text-center text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl block transition-colors"
              >
                Request Early Access
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0C101A] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-xl space-y-6">
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Detailed Plan Comparison Matrix
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 font-mono">
                  <th className="py-3 px-4 font-bold">Feature</th>
                  <th className="py-3 px-4 font-bold">Guest</th>
                  <th className="py-3 px-4 font-bold">Free Account</th>
                  <th className="py-3 px-4 font-bold text-amber-400">Pro (Monthly/Annual)</th>
                  <th className="py-3 px-4 font-bold text-emerald-400">Lifetime Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Daily Speech Generations</td>
                  <td className="py-3 px-4 font-mono">3 / day</td>
                  <td className="py-3 px-4 font-mono">10 / day</td>
                  <td className="py-3 px-4 font-mono text-amber-400 font-bold">Unlimited</td>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-bold">Unlimited (Lifetime)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Voice Models Available</td>
                  <td className="py-3 px-4">Gemini Standard</td>
                  <td className="py-3 px-4">Gemini + ElevenLabs</td>
                  <td className="py-3 px-4 text-amber-400 font-bold">All 30+ Voices + Custom</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">All Models + Future Additions</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Instant Voice Cloning</td>
                  <td className="py-3 px-4 text-zinc-600">&times;</td>
                  <td className="py-3 px-4 text-zinc-600">&times;</td>
                  <td className="py-3 px-4 text-amber-400 font-bold">Included</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Max Dialogue Lines / Scene</td>
                  <td className="py-3 px-4 font-mono">6 lines</td>
                  <td className="py-3 px-4 font-mono">15 lines</td>
                  <td className="py-3 px-4 font-mono text-amber-400 font-bold">100 lines</td>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-bold">100 lines</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Lossless 24-bit 48kHz WAV Export</td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-400" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-400" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-amber-400" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-400" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Cloud Project Auto-Sync</td>
                  <td className="py-3 px-4 text-zinc-600">&times;</td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-400" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-amber-400" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-400" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Commercial Usage Rights</td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-400" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-400" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-amber-400" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-400" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CtaBanner
        title="Ready to upgrade your studio?"
        subtitle="Start with our free tiers or jump straight into unlimited Pro production."
        primaryCtaText="Launch Studio Free"
        secondaryCtaText="Upgrade to Pro"
      />
    </div>
  );
};
