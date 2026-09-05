/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Polite Daily Quota Exhaustion Modal
 */
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  Crown, 
  X, 
  CheckCircle2, 
  ArrowRight,
  Infinity as InfinityIcon,
  Zap
} from 'lucide-react';
import { useEntitlementStore } from '../src/store/useEntitlementStore';
import { useGenerationQuota } from '../src/hooks/useGenerationQuota';
import { useFirebase } from '../services/firebaseContext';
import { useTerminal } from './terminal/TerminalContext';

export interface DailyQuotaExhaustedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const DailyQuotaExhaustedModal: React.FC<DailyQuotaExhaustedModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
}) => {
  const { isTerminalMode } = useTerminal();
  const { isGuest, usedToday, dailyQuota } = useGenerationQuota();
  const { user, loginGoogle } = useFirebase();

  // Calculate live countdown to 00:00 UTC
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const utcTomorrow = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0, 0
      ));
      const diffMs = utcTomorrow.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeUntilReset('0h 0m');
        return;
      }
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeUntilReset(`${hours} hours, ${minutes} minutes`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quota-exhausted-title"
    >
      <div 
        className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 relative flex flex-col ${
          isTerminalMode 
            ? 'bg-[#161B22] border-[#30363D] text-[#E6EDF3] font-mono' 
            : 'bg-white border-zinc-200 text-zinc-900 font-sans'
        }`}
      >
        {/* Close icon */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
            isTerminalMode ? 'text-[#8B949E] hover:text-white hover:bg-[#21262D]' : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
          }`}
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center mt-2 mb-5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-xs ${
            isTerminalMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-100 text-amber-800'
          }`}>
            <Clock className="w-6 h-6" />
          </div>

          <h2 id="quota-exhausted-title" className="text-lg sm:text-xl font-bold tracking-tight mb-1.5">
            You're out of generations for today.
          </h2>

          <p className={`text-xs leading-relaxed max-w-xs ${
            isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-600'
          }`}>
            You have used all <strong className="text-zinc-900 dark:text-white">{usedToday} of {dailyQuota}</strong> free generations for today. Your daily limit will automatically refresh tomorrow.
          </p>
        </div>

        {/* Reset time highlight */}
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs mb-5 ${
          isTerminalMode ? 'bg-[#0D1117] border-[#30363D]' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <span className={isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-600'}>
              Daily reset in:
            </span>
          </div>
          <span className="font-mono font-bold text-zinc-900 dark:text-white">
            {timeUntilReset || '00:00 UTC'}
          </span>
        </div>

        {/* Pro features preview */}
        <div className="mb-6 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Unlimited AI speech synthesis without daily caps</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>ElevenLabs custom voice cloning & neural voices</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Adaptive background music and multi-speaker studio</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              onClose();
              onUpgrade();
            }}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4" />
            <span>Upgrade to Pro</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {isGuest && (
            <button
              onClick={() => {
                onClose();
                loginGoogle();
              }}
              className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                isTerminalMode ? 'border-[#30363D] hover:bg-[#21262D] text-[#8AB4F8]' : 'border-zinc-200 hover:bg-zinc-50 text-blue-600'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Link Google Account (Get 10/day)</span>
            </button>
          )}

          <button
            onClick={onClose}
            className={`w-full py-2 px-4 rounded-xl text-xs font-medium transition-all ${
              isTerminalMode ? 'text-[#8B949E] hover:text-white hover:bg-[#21262D]' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
            }`}
          >
            Come back tomorrow
          </button>
        </div>
      </div>
    </div>
  );
};
