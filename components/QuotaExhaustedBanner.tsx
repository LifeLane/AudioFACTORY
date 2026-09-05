/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Quota Alert & Upgrade Banner
 */
import React from 'react';
import { AlertCircle, Zap, Crown, ArrowRight, ShieldCheck } from 'lucide-react';
import { useGenerationQuota } from '../src/hooks/useGenerationQuota';
import { useFirebase } from '../services/firebaseContext';
import { useTerminal } from './terminal/TerminalContext';

export interface QuotaExhaustedBannerProps {
  actionName?: string;
  onDismiss?: () => void;
}

export const QuotaExhaustedBanner: React.FC<QuotaExhaustedBannerProps> = ({ 
  actionName = 'audio generation',
  onDismiss 
}) => {
  const { isGuest, isPro, isUnlimited, usedToday, dailyQuota, isExhausted, openUpgradeModal } = useGenerationQuota();
  const { loginGoogle } = useFirebase();
  const { isTerminalMode } = useTerminal();

  if (isPro || isUnlimited || !isExhausted) return null;

  return (
    <div className={`p-4 rounded-xl border my-3 transition-all ${
      isTerminalMode
        ? 'bg-rose-950/30 border-rose-800/60 text-[#E6EDF3] font-mono'
        : 'bg-rose-50 border-rose-200 text-rose-950 font-sans'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-500 flex-shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">
              Daily generation limit reached ({usedToday} / {dailyQuota})
            </h4>
            <p className="text-xs opacity-85 mt-0.5 max-w-xl">
              {isGuest ? (
                <>
                  Guests receive 3 free generations per day. <strong>Link your Google account</strong> to unlock 10 daily generations with preserved history, or upgrade to Pro for unlimited audio.
                </>
              ) : (
                <>
                  You've used all 10 free daily generations. Upgrade to Pro for unlimited AI speech, ElevenLabs voice cloning, and BGM generation. Daily quotas reset at 00:00 UTC.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
          {isGuest && (
            <button
              onClick={loginGoogle}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Link Google (10/day)</span>
            </button>
          )}

          <button
            onClick={openUpgradeModal}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Upgrade to Pro</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
