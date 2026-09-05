/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Generation Quota & Entitlement Status Badge
 */
import React from 'react';
import { Crown, Sparkles, AlertTriangle, Zap, ArrowUpRight } from 'lucide-react';
import { useGenerationQuota } from '../src/hooks/useGenerationQuota';
import { useTerminal } from './terminal/TerminalContext';

export interface GenerationQuotaBadgeProps {
  className?: string;
}

export const GenerationQuotaBadge: React.FC<GenerationQuotaBadgeProps> = ({ className = '' }) => {
  const { 
    plan, 
    planName, 
    isGuest, 
    isPro, 
    isUnlimited, 
    usedToday, 
    dailyQuota, 
    remainingQuota, 
    isExhausted, 
    isNearLimit, 
    openUpgradeModal 
  } = useGenerationQuota();
  
  const { isTerminalMode } = useTerminal();

  if (isPro || isUnlimited) {
    return (
      <button
        onClick={openUpgradeModal}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold shadow-xs transition-all ${
          isTerminalMode
            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
            : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
        } ${className}`}
        title="Pro Entitlement Active — Unlimited AI Generations"
      >
        <Crown className="w-3.5 h-3.5 text-amber-500" />
        <span className="hidden sm:inline">Pro</span>
        <span className="text-[10px] font-bold opacity-80">Unlimited</span>
      </button>
    );
  }

  // Near limit or exhausted states
  if (isExhausted) {
    return (
      <button
        onClick={openUpgradeModal}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold shadow-xs animate-pulse transition-all ${
          isTerminalMode
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
            : 'bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200'
        } ${className}`}
        title="Daily Quota Exhausted. Click to Upgrade to Pro or Link Account."
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
        <span>{usedToday}/{dailyQuota}</span>
        <span className="hidden sm:inline text-[10px] uppercase font-extrabold text-rose-600">Limit Reached</span>
        <ArrowUpRight className="w-3 h-3 ml-0.5" />
      </button>
    );
  }

  if (isNearLimit) {
    return (
      <button
        onClick={openUpgradeModal}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold shadow-xs transition-all ${
          isTerminalMode
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
            : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
        } ${className}`}
        title="1 generation remaining today. Click to upgrade for unlimited access."
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>{usedToday}/{dailyQuota}</span>
        <span className="hidden md:inline text-[10px] text-amber-700">(1 left)</span>
      </button>
    );
  }

  // Normal free or guest status
  return (
    <button
      onClick={openUpgradeModal}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium shadow-xs transition-all ${
        isTerminalMode
          ? 'bg-[#21262D] text-[#C9D1D9] border border-[#30363D] hover:bg-[#30363D]'
          : 'bg-zinc-100 text-zinc-800 border border-zinc-200 hover:bg-zinc-200'
      } ${className}`}
      title={isGuest ? "Guest Quota (3/day). Sign in with Google for 10/day or upgrade." : "Free Tier Quota (10/day). Upgrade for unlimited."}
    >
      <span className={`w-2 h-2 rounded-full ${isGuest ? 'bg-sky-500' : 'bg-emerald-500'}`} />
      <span className="font-bold">{usedToday}/{dailyQuota}</span>
      <span className="hidden lg:inline text-[10px] text-zinc-500">
        {isGuest ? 'Guest' : 'Free'}
      </span>
    </button>
  );
};
