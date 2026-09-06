/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Authoritative Studio Lockdown Screen
 * Displays a full-viewport lock when daily credits are exhausted.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Clock, 
  Crown, 
  Zap, 
  LogIn, 
  RefreshCw, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  User
} from 'lucide-react';
import { useFirebase } from '../services/firebaseContext';
import { useGenerationQuota } from '../src/hooks/useGenerationQuota';
import { useUsage } from '../src/hooks/useUsage';
import { useTerminal } from './terminal/TerminalContext';

interface LockdownOverlayProps {
  onOpenPricing: () => void;
  onOpenAuth: () => void;
}

export const LockdownOverlay: React.FC<LockdownOverlayProps> = ({
  onOpenPricing,
  onOpenAuth
}) => {
  const { isTerminalMode } = useTerminal();
  const { user, loginGoogle, logout } = useFirebase();
  const { isGuest, usedToday, dailyQuota } = useGenerationQuota();
  const { refreshUsage } = useUsage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live countdown to Midnight UTC
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Calculate exact UTC Tomorrow 00:00:00
      const utcTomorrow = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0, 0
      ));
      const diffMs = utcTomorrow.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setCountdown({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUsage();
    } catch (err) {
      console.error('Failed to manually sync credits:', err);
    } finally {
      // Simulate slight delay to feel authoritative and reassuring
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <AnimatePresence>
      <div id="studio-lockdown-overlay" className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-md overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`w-full max-w-xl rounded-2xl border-2 p-6 md:p-8 flex flex-col relative my-8 shadow-2xl ${
            isTerminalMode 
              ? 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3] font-mono shadow-[0_0_40px_rgba(251,188,4,0.1)]' 
              : 'bg-[#FDFCFB] border-black text-zinc-900 font-sans shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]'
          }`}
        >
          {/* Header Status Badge */}
          <div className="flex items-center gap-2 mb-6 self-start">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
              isTerminalMode 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}>
              Operational Limit Reached • System Locked
            </span>
          </div>

          {/* Central Security/Alert Graphic */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-105 ${
              isTerminalMode 
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' 
                : 'bg-zinc-100 border-2 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            }`}>
              <Lock className="w-8 h-8" />
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold font-mono tracking-tight text-white mb-3">
              {isTerminalMode ? 'LIMIT_EXCEEDED_LOCKOUT' : 'Quota Exhausted'}
            </h1>
            <p className={`text-sm max-w-md ${isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-600'}`}>
              You have used all <strong className={isTerminalMode ? 'text-white' : 'text-zinc-900'}>{usedToday} of {dailyQuota}</strong> free generations allotted for today. Standard limits ensure system performance.
            </p>
          </div>

          {/* Precise Midnight UTC Countdown Section */}
          <div className={`p-5 rounded-xl border mb-6 flex flex-col items-center justify-center ${
            isTerminalMode ? 'bg-[#161B22] border-[#30363D]' : 'bg-zinc-50 border-2 border-black'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className={`text-xs font-bold uppercase tracking-wider ${isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-500'}`}>
                Automatic Refresh Countdown (UTC Midnight)
              </span>
            </div>

            <div className="flex items-center gap-4 text-3xl md:text-4xl font-mono font-black text-white bg-black p-4 rounded-xl shadow-inner border border-zinc-800 tracking-wider">
              <div>
                <span>{formatNumber(countdown.hours)}</span>
                <span className="text-[10px] uppercase font-mono block text-center text-zinc-500 tracking-normal mt-1">Hours</span>
              </div>
              <span className="text-zinc-600 animate-pulse">:</span>
              <div>
                <span>{formatNumber(countdown.minutes)}</span>
                <span className="text-[10px] uppercase font-mono block text-center text-zinc-500 tracking-normal mt-1">Mins</span>
              </div>
              <span className="text-zinc-600 animate-pulse">:</span>
              <div>
                <span>{formatNumber(countdown.seconds)}</span>
                <span className="text-[10px] uppercase font-mono block text-center text-zinc-500 tracking-normal mt-1">Secs</span>
              </div>
            </div>

            <p className={`text-[11px] text-center mt-3 max-w-xs ${isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-500'}`}>
              New generation credits will be automatically credited to your session at exactly 00:00 UTC.
            </p>
          </div>

          {/* Onboarding / Exit Routes Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Left Card: Upgrades */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
              isTerminalMode ? 'bg-[#161B22]/60 border-[#30363D]' : 'bg-white border-2 border-black hover:translate-y-[-2px]'
            }`}>
              <div>
                <h3 className="text-xs font-extrabold uppercase font-mono mb-1 text-amber-400 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  Go Premium
                </h3>
                <p className={`text-[11px] leading-relaxed ${isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-500'}`}>
                  Get unlimited rendering, high-definition models, and ElevenLabs voice cloning.
                </p>
              </div>
              <button
                onClick={onOpenPricing}
                className="mt-4 w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold font-mono uppercase text-[11px] tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Upgrade to Pro</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right Card: Google Auth Sync */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
              isTerminalMode ? 'bg-[#161B22]/60 border-[#30363D]' : 'bg-white border-2 border-black hover:translate-y-[-2px]'
            }`}>
              <div>
                <h3 className="text-xs font-extrabold uppercase font-mono mb-1 text-blue-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  {isGuest ? 'Upgrade Guest' : 'Account Connected'}
                </h3>
                <p className={`text-[11px] leading-relaxed ${isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-500'}`}>
                  {isGuest 
                    ? 'Link a free Google account to immediately upgrade daily limit to 10 generations!'
                    : `Active session linked to ${user?.email || 'authenticated profile'}.`}
                </p>
              </div>
              {isGuest ? (
                <button
                  onClick={loginGoogle}
                  className="mt-4 w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold font-mono uppercase text-[11px] tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Link Google Account</span>
                </button>
              ) : (
                <button
                  onClick={logout}
                  className="mt-4 w-full py-2 px-3 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-300 dark:text-zinc-400 font-bold font-mono uppercase text-[11px] tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Switch Account</span>
                </button>
              )}
            </div>
          </div>

          {/* Authoritative Control Utilities */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                isTerminalMode 
                  ? 'border-[#30363D] text-[#8B949E] hover:text-white hover:bg-[#21262D]' 
                  : 'border-zinc-300 text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing credits...' : 'Sync Quota'}</span>
            </button>

            <span className={`text-[10px] font-mono text-center sm:text-right ${isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-400'}`}>
              Session ID: <span className="font-bold">{user?.uid ? user.uid.slice(0, 10) : 'guest'}</span>
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
