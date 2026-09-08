/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Authoritative Plan Upgrade & Google Play Billing Modal
 */
import React, { useState } from 'react';
import { 
  Crown, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  X, 
  RefreshCw,
  Clock,
  Infinity as InfinityIcon,
  ArrowRight,
  ExternalLink,
  CreditCard,
  AlertCircle,
  HelpCircle,
  Award
} from 'lucide-react';
import { useEntitlementStore } from '../src/store/useEntitlementStore';
import { useFirebase } from '../services/firebaseContext';
import { PLANS } from '../shared/plans';
import { UserPlan, PRODUCT_IDS, ProductIdentifier, SubscriptionLifecycleStatus } from '../shared/types';
import { useTerminal } from './terminal/TerminalContext';
import { isNativeAndroid } from '../services/entitlementService';

export const PlanUpgradeModal: React.FC = () => {
  const { 
    isUpgradeModalOpen, 
    setUpgradeModalOpen, 
    entitlement, 
    usage, 
    purchase, 
    restore, 
    manageSubscription,
    refreshEntitlement,
    isLoading,
    isRestoring,
    billingMessage,
    setBillingMessage,
    applyPlan
  } = useEntitlementStore();

  const { user, loginGoogle } = useFirebase();
  const { isTerminalMode } = useTerminal();
  
  const [playTokenInput, setPlayTokenInput] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>(PRODUCT_IDS.PRO_MONTHLY);
  const [showPlayVerifier, setShowPlayVerifier] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'subscription' | 'developer'>('plans');

  if (!isUpgradeModalOpen) return null;

  const isTerminal = isTerminalMode;
  const isGuest = !user;
  const currentPlan = entitlement.plan;
  const isUnlimited = entitlement.dailyQuota === -1;
  const usedGenerations = usage?.generationCount || 0;
  const quotaLimit = isUnlimited ? 'Unlimited' : entitlement.dailyQuota;
  const remaining = isUnlimited ? 'Unlimited' : entitlement.remainingQuota;
  const onAndroid = isNativeAndroid();

  const handlePurchase = async (productId: ProductIdentifier | string) => {
    if (isGuest) {
      setBillingMessage('Please sign in with Google first so your purchase is tied to your account across all devices.');
      return;
    }
    await purchase(productId, user);
    await refreshEntitlement(user);
  };

  const handleRestore = async () => {
    await restore(user);
    await refreshEntitlement(user);
  };

  const handleRefresh = async () => {
    await refreshEntitlement(user);
    setBillingMessage('Entitlement refreshed from authoritative backend.');
    setTimeout(() => setBillingMessage(null), 3000);
  };

  const handleManualVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playTokenInput.trim()) return;
    try {
      const res = await fetch('/api/billing/verify-play-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.uid || 'anonymous',
          'x-is-anonymous': String(isGuest),
        },
        body: JSON.stringify({
          productId: selectedProductId,
          purchaseToken: playTokenInput.trim(),
          orderId: `MANUAL-${Date.now()}`,
          packageName: 'com.audiofactory.app',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBillingMessage('Play purchase verified and Firestore entitlement updated!');
        await refreshEntitlement(user);
      } else {
        setBillingMessage(`Verification failed: ${data.error}`);
      }
    } catch (err: any) {
      setBillingMessage(`Verification error: ${err.message}`);
    }
  };

  const getStatusBadge = (status?: SubscriptionLifecycleStatus) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">Active</span>;
      case 'grace_period':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">Grace Period</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">Cancelled (Expires Soon)</span>;
      case 'account_hold':
      case 'paused':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">{status.replace('_', ' ').toUpperCase()}</span>;
      case 'expired':
      case 'revoked':
      case 'refunded':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">{status.toUpperCase()}</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Active</span>;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-modal-title"
    >
      <div 
        className={`w-full max-w-4xl max-h-[94vh] overflow-y-auto rounded-2xl border shadow-2xl flex flex-col ${
          isTerminal 
            ? 'bg-[#0D1117] border-[#30363D] text-[#C9D1D9] font-mono' 
            : 'bg-white border-zinc-300 text-zinc-900 font-sans'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${isTerminal ? 'border-[#30363D] bg-[#161B22]' : 'border-zinc-200 bg-zinc-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isTerminal ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-amber-100 text-amber-800'}`}>
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 id="plan-modal-title" className="text-lg sm:text-xl font-bold tracking-tight">
                AudioFACTORY Billing & Google Play Plans
              </h2>
              <p className={`text-xs ${isTerminal ? 'text-[#8B949E]' : 'text-zinc-500'}`}>
                Authoritative backend entitlement resolver & cross-platform monetization suite
              </p>
            </div>
          </div>
          <button
            onClick={() => setUpgradeModalOpen(false)}
            className={`p-2 rounded-lg transition-colors ${
              isTerminal ? 'hover:bg-[#21262D] text-[#8B949E] hover:text-white' : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex items-center gap-2 px-6 pt-3 border-b ${isTerminal ? 'border-[#30363D] bg-[#161B22]/50' : 'border-zinc-200 bg-zinc-100/50'}`}>
          <button
            onClick={() => setActiveTab('plans')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'plans'
                ? isTerminal ? 'border-amber-400 text-amber-400' : 'border-amber-600 text-amber-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Choose Plan
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'subscription'
                ? isTerminal ? 'border-amber-400 text-amber-400' : 'border-amber-600 text-amber-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Subscription Details & Status
          </button>
          <button
            onClick={() => setActiveTab('developer')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'developer'
                ? isTerminal ? 'border-amber-400 text-amber-400' : 'border-amber-600 text-amber-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Google Play Verifier
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-6">

          {/* Banner notification */}
          {billingMessage && (
            <div className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-between gap-2 ${
              billingMessage.includes('failed') || billingMessage.includes('Error')
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-500'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{billingMessage}</span>
              </div>
              <button onClick={() => setBillingMessage(null)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: PLANS GRID */}
          {activeTab === 'plans' && (
            <>
              {/* Platform Awareness Notice */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                onAndroid
                  ? isTerminal ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : isTerminal ? 'bg-blue-950/20 border-blue-800/40 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span>
                    {onAndroid 
                      ? 'Android Device Detected: Transactions are securely processed through Google Play Billing.' 
                      : 'Web / Sandbox Mode: Subscriptions and lifetime passes are validated via backend entitlement services.'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRestore}
                    disabled={isRestoring}
                    className="px-2.5 py-1 rounded bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 font-bold transition-all"
                  >
                    {isRestoring ? 'Restoring...' : 'Restore Purchases'}
                  </button>
                </div>
              </div>

              {/* 3 Monetization Products + Free Tier */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Monthly Subscription */}
                <div className={`p-5 rounded-xl border flex flex-col justify-between relative ${
                  currentPlan === 'pro_monthly'
                    ? isTerminal ? 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500' : 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500'
                    : isTerminal ? 'border-[#30363D] bg-[#161B22]' : 'border-zinc-200 bg-white'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-extrabold">Subscription</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        ${PLANS.pro_monthly.priceUsd} / mo
                      </span>
                    </div>
                    <h3 className="font-bold text-base flex items-center gap-1.5 mb-1">
                      <Crown className="w-4 h-4 text-amber-500" />
                      {PLANS.pro_monthly.name}
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-500 mb-2">{PRODUCT_IDS.PRO_MONTHLY}</p>
                    <p className="text-[11px] text-zinc-500 mb-4">Flexible monthly billing, cancel anytime in Google Play.</p>
                    
                    <ul className="space-y-2 text-xs mb-6">
                      <li className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                        <InfinityIcon className="w-3.5 h-3.5" />
                        Unlimited AI Speech Synthesis
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ElevenLabs custom voice cloning
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Background music soundscape engine
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Multi-speaker dialogue editor
                      </li>
                    </ul>
                  </div>

                  <div>
                    {currentPlan === 'pro_monthly' ? (
                      <button disabled className="w-full py-2.5 bg-amber-600 text-white rounded-lg text-xs font-bold cursor-default flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        Active Monthly Plan
                      </button>
                    ) : (
                      <button
                        disabled={isLoading}
                        onClick={() => handlePurchase(PRODUCT_IDS.PRO_MONTHLY)}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg text-xs transition-all shadow-xs flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : onAndroid ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Crown className="w-4 h-4" />
                        )}
                        <span>
                          {isLoading 
                            ? 'Processing...' 
                            : onAndroid 
                            ? `Subscribe via Google Play ($${PLANS.pro_monthly.priceUsd}/mo)` 
                            : `Subscribe Monthly ($${PLANS.pro_monthly.priceUsd}/mo)`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Annual Subscription (HIGHLIGHTED BEST VALUE) */}
                <div className={`p-5 rounded-xl border flex flex-col justify-between relative ring-2 ring-purple-500 ${
                  currentPlan === 'pro_annual'
                    ? isTerminal ? 'border-purple-500 bg-purple-950/20' : 'border-purple-500 bg-purple-50/50'
                    : isTerminal ? 'border-purple-500 bg-[#161B22]' : 'border-purple-300 bg-white'
                }`}>
                  <div className="absolute -top-3 right-4 px-3 py-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Best Value • Save 35%
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-purple-500 font-extrabold">Annual Billing</span>
                      <div className="text-right">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-purple-500/20 text-purple-600 dark:text-purple-400 block">
                          ${PLANS.pro_annual.priceUsd} / yr
                        </span>
                      </div>
                    </div>
                    <h3 className="font-bold text-base flex items-center gap-1.5 mb-0.5">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      {PLANS.pro_annual.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        ${(PLANS.pro_annual.priceUsd / 12).toFixed(2)}/month equivalent
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        (Save $79/yr)
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-500 mb-4">{PRODUCT_IDS.PRO_ANNUAL}</p>
                    
                    <ul className="space-y-2 text-xs mb-6">
                      <li className="flex items-center gap-2 font-bold text-purple-600 dark:text-purple-400">
                        <InfinityIcon className="w-3.5 h-3.5" />
                        Unlimited AI Generations
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Highest priority generation queues
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Full ElevenLabs + Gemini pro features
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Cloud project backup & lossless WAV
                      </li>
                    </ul>
                  </div>

                  <div>
                    {currentPlan === 'pro_annual' ? (
                      <button disabled className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-xs font-bold cursor-default flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        Active Annual Plan
                      </button>
                    ) : (
                      <button
                        disabled={isLoading}
                        onClick={() => handlePurchase(PRODUCT_IDS.PRO_ANNUAL)}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : onAndroid ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        <span>
                          {isLoading 
                            ? 'Processing...' 
                            : onAndroid 
                            ? `Subscribe via Google Play ($${PLANS.pro_annual.priceUsd}/yr)` 
                            : `Subscribe Annual ($${PLANS.pro_annual.priceUsd}/yr)`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. One-Time Product: Lifetime */}
                <div className={`p-5 rounded-xl border flex flex-col justify-between relative ${
                  currentPlan === 'lifetime'
                    ? isTerminal ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500' : 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                    : isTerminal ? 'border-[#30363D] bg-[#161B22]' : 'border-zinc-200 bg-white'
                }`}>
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-xs">
                    One-Time Purchase
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-extrabold">Permanent License</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        ${PLANS.lifetime.priceUsd} once
                      </span>
                    </div>
                    <h3 className="font-bold text-base flex items-center gap-1.5 mb-1">
                      <Award className="w-4 h-4 text-emerald-500" />
                      {PLANS.lifetime.name}
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-500 mb-2">{PRODUCT_IDS.LIFETIME}</p>
                    <p className="text-[11px] text-zinc-500 mb-4">Pay once, own forever. No recurring monthly or annual fees.</p>
                    
                    <ul className="space-y-2 text-xs mb-6">
                      <li className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                        <InfinityIcon className="w-3.5 h-3.5" />
                        Never expires (Non-recurring)
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        All future models & upgrades included
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Unlimited custom voice clones
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Multi-device permanent entitlement
                      </li>
                    </ul>
                  </div>

                  <div>
                    {currentPlan === 'lifetime' ? (
                      <button disabled className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-default flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        Lifetime Active
                      </button>
                    ) : (
                      <button
                        disabled={isLoading}
                        onClick={() => handlePurchase(PRODUCT_IDS.LIFETIME)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all shadow-xs flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : onAndroid ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Award className="w-4 h-4" />
                        )}
                        <span>
                          {isLoading 
                            ? 'Processing...' 
                            : onAndroid 
                            ? `Buy Lifetime License ($${PLANS.lifetime.priceUsd})` 
                            : `Buy Lifetime Pass ($${PLANS.lifetime.priceUsd})`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Free Tier Callout */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                currentPlan === 'free' ? (isTerminal ? 'bg-blue-950/20 border-blue-800' : 'bg-blue-50 border-blue-200') : (isTerminal ? 'bg-[#161B22] border-[#30363D]' : 'bg-zinc-50 border-zinc-200')
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold">Creator Starter (Free Tier)</h4>
                    <span className="text-[11px] text-zinc-500">10 daily speech generations with project cloud sync.</span>
                  </div>
                </div>
                {isGuest ? (
                  <button
                    onClick={loginGoogle}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Sign In with Google
                  </button>
                ) : (
                  <span className="text-xs text-zinc-400 font-semibold">Logged in: {user?.email}</span>
                )}
              </div>
            </>
          )}

          {/* TAB 2: SUBSCRIPTION DETAILS & LIFECYCLE */}
          {activeTab === 'subscription' && (
            <div className="flex flex-col gap-4">
              <div className={`p-5 rounded-xl border ${isTerminal ? 'bg-[#161B22] border-[#30363D]' : 'bg-zinc-50 border-zinc-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-700/40">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">Authoritative Firestore Entitlement</span>
                    <h3 className="text-lg font-bold flex items-center gap-2 mt-0.5">
                      {PLANS[currentPlan]?.name || currentPlan}
                      {getStatusBadge(entitlement.status)}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRefresh}
                      disabled={isLoading}
                      className="px-3 py-1.5 border border-zinc-600 hover:bg-zinc-700/50 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                    {entitlement.productId && (
                      <button
                        onClick={manageSubscription}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Manage in Google Play
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 text-xs">
                  <div>
                    <span className="text-zinc-500 block mb-0.5">Product ID</span>
                    <span className="font-mono font-bold">{entitlement.productId || 'none (standard tier)'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-0.5">Entitlement Source</span>
                    <span className="font-mono font-bold capitalize">{entitlement.source || 'system'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-0.5">Auto Renewing</span>
                    <span className="font-bold">{entitlement.autoRenewing ? 'Yes (Recurring)' : 'No (One-time or Cancelled)'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-0.5">Generations Today</span>
                    <span className="font-bold">{usedGenerations} / {quotaLimit}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-0.5">Expires / Renews</span>
                    <span className="font-bold">
                      {entitlement.expiresAt ? new Date(entitlement.expiresAt).toLocaleDateString() : 'Permanent Lifetime'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-0.5">Order ID</span>
                    <span className="font-mono text-[11px] truncate block">{entitlement.orderId || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Lifecycle explanation card */}
              <div className={`p-4 rounded-xl border ${isTerminal ? 'bg-[#161B22]/60 border-[#30363D]' : 'bg-zinc-100/70 border-zinc-200'}`}>
                <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                  Subscription Lifecycle Handling
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  AudioFACTORY automatically tracks all Google Play lifecycle states: <strong>active</strong>, <strong>grace_period</strong> (during payment retries), <strong>cancelled</strong> (active until period end), <strong>paused</strong>, <strong>account_hold</strong>, <strong>revoked</strong>, and <strong>refunded</strong>. Changes received through Real-Time Developer Notifications immediately sync to your Firestore entitlement record.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: DEVELOPER / PLAY VERIFIER */}
          {activeTab === 'developer' && (
            <div className="flex flex-col gap-4">
              <div className={`p-5 rounded-xl border ${isTerminal ? 'bg-[#161B22] border-[#30363D]' : 'bg-zinc-50 border-zinc-200'}`}>
                <h3 className="text-sm font-bold flex items-center gap-2 mb-1">
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  Google Play Developer Token Manual Verifier
                </h3>
                <p className="text-xs text-zinc-500 mb-4">
                  Test and inspect server-side receipt validation with the Google Play Developer API v3 backend.
                </p>

                <form onSubmit={handleManualVerification} className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 mb-1">Product ID</label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className={`w-full p-2.5 rounded-lg border text-xs font-mono ${
                          isTerminal ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300'
                        }`}
                      >
                        <option value={PRODUCT_IDS.PRO_MONTHLY}>audiofactory_pro_monthly</option>
                        <option value={PRODUCT_IDS.PRO_ANNUAL}>audiofactory_pro_annual</option>
                        <option value={PRODUCT_IDS.LIFETIME}>audiofactory_lifetime</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 mb-1">Purchase Token</label>
                      <input
                        type="text"
                        placeholder="e.g. gpa.token_xyz_sample_12345"
                        value={playTokenInput}
                        onChange={(e) => setPlayTokenInput(e.target.value)}
                        className={`w-full p-2.5 rounded-lg border text-xs font-mono ${
                          isTerminal ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setPlayTokenInput(`play_token_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`)}
                      className="px-3 py-1.5 border border-zinc-600 hover:bg-zinc-700/50 rounded-lg text-xs font-bold"
                    >
                      Generate Mock Token
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !playTokenInput.trim()}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Verify via Server Backend
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${isTerminal ? 'border-[#30363D] bg-[#161B22] text-[#8B949E]' : 'border-zinc-200 bg-zinc-50 text-zinc-500'}`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Authoritative backend resolver • users/{'{uid}'}/entitlements/current</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setUpgradeModalOpen(false)}
              className="px-4 py-1.5 rounded-lg border border-zinc-600 hover:bg-zinc-700/50 text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
