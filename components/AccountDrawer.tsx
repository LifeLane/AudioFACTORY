/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Account Drawer & Monetization Experience
 */
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Crown, 
  Sparkles, 
  Zap, 
  Settings, 
  ShieldCheck, 
  Lock, 
  FileText, 
  Trash2, 
  LogOut, 
  X, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Receipt, 
  CreditCard, 
  Clock, 
  Smartphone, 
  AlertTriangle,
  ChevronRight,
  Terminal as TerminalIcon,
  HelpCircle
} from 'lucide-react';
import { useFirebase } from '../services/firebaseContext';
import { useEntitlementStore } from '../src/store/useEntitlementStore';
import { useGenerationQuota } from '../src/hooks/useGenerationQuota';
import { useTerminal } from './terminal/TerminalContext';
import { UsageCard } from './UsageCard';
import { PLANS } from '../shared/plans';
import { PurchaseRecord, SubscriptionLifecycleStatus } from '../shared/types';
import { isNativeAndroid } from '../services/entitlementService';

export interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPricing: () => void;
}

export const AccountDrawer: React.FC<AccountDrawerProps> = ({
  isOpen,
  onClose,
  onOpenPricing
}) => {
  const { user, loginGoogle, logout, deleteAccountData } = useFirebase();
  const { 
    entitlement, 
    usage, 
    restore, 
    manageSubscription, 
    refreshEntitlement, 
    isRestoring, 
    isLoading 
  } = useEntitlementStore();
  const { isPro, isUnlimited, planName } = useGenerationQuota();
  const { isTerminalMode, toggleTerminalMode } = useTerminal();

  const [activeSection, setActiveSection] = useState<'overview' | 'subscription' | 'purchases' | 'settings' | 'legal'>('overview');
  const [copiedUid, setCopiedUid] = useState(false);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [legalDocType, setLegalDocType] = useState<'privacy' | 'terms'>('privacy');

  const isGuest = !user || user.isAnonymous;
  const onAndroid = isNativeAndroid();

  // Load purchase history
  useEffect(() => {
    if (!isOpen || isGuest) return;
    
    const fetchPurchases = async () => {
      setIsLoadingPurchases(true);
      try {
        const res = await fetch('/api/billing/purchases', {
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.uid || '',
            'Authorization': `Bearer ${user?.uid || ''}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setPurchases(data.purchases || []);
        }
      } catch (err) {
        console.warn('Failed to load purchase history:', err);
      } finally {
        setIsLoadingPurchases(false);
      }
    };

    fetchPurchases();
  }, [isOpen, user, isGuest]);

  const handleCopyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const handleRestorePurchases = async () => {
    await restore(user);
    await refreshEntitlement(user);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteMessage(null);
    try {
      if (deleteAccountData) {
        await deleteAccountData();
      }
      setDeleteMessage('Account and all associated monologue/project data have been scheduled for deletion.');
      setTimeout(() => {
        setShowDeleteConfirm(false);
        setIsDeleting(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      setDeleteMessage(`Failed to delete account: ${err.message}`);
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status?: SubscriptionLifecycleStatus) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">Active</span>;
      case 'grace_period':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">Grace Period</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">Cancelled (Active until expiry)</span>;
      case 'account_hold':
      case 'paused':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">{status.replace('_', ' ').toUpperCase()}</span>;
      case 'expired':
      case 'revoked':
      case 'refunded':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">{status.toUpperCase()}</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">Active</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-drawer-title"
    >
      {/* Backdrop click to dismiss */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div 
        className={`relative w-full max-w-xl h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-200 border-l ${
          isTerminalMode 
            ? 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3] font-mono' 
            : 'bg-white border-zinc-200 text-zinc-900 font-sans'
        }`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between flex-shrink-0 ${
          isTerminalMode ? 'bg-[#161B22] border-[#30363D]' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
              isTerminalMode ? 'bg-[#21262D] text-[#8AB4F8] border border-[#30363D]' : 'bg-zinc-900 text-white'
            }`}>
              {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div>
              <h2 id="account-drawer-title" className="text-base sm:text-lg font-bold tracking-tight">
                {user?.displayName || (isGuest ? 'Guest Creator' : 'AudioFACTORY Account')}
              </h2>
              <p className={`text-xs ${isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-500'}`}>
                {user?.email || 'Anonymous Session (Local Storage)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isTerminalMode ? 'hover:bg-[#21262D] text-[#8B949E] hover:text-white' : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800'
            }`}
            aria-label="Close account drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex items-center gap-1 px-4 pt-2 border-b overflow-x-auto custom-scrollbar flex-shrink-0 ${
          isTerminalMode ? 'border-[#30363D] bg-[#161B22]/60' : 'border-zinc-200 bg-zinc-100/60'
        }`}>
          <button
            onClick={() => setActiveSection('overview')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeSection === 'overview'
                ? isTerminalMode ? 'border-amber-400 text-amber-400' : 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Overview & Usage
          </button>
          <button
            onClick={() => setActiveSection('subscription')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeSection === 'subscription'
                ? isTerminalMode ? 'border-amber-400 text-amber-400' : 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Subscription & Plan
          </button>
          <button
            onClick={() => setActiveSection('purchases')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeSection === 'purchases'
                ? isTerminalMode ? 'border-amber-400 text-amber-400' : 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Purchase History
          </button>
          <button
            onClick={() => setActiveSection('settings')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeSection === 'settings'
                ? isTerminalMode ? 'border-amber-400 text-amber-400' : 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveSection('legal')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeSection === 'legal'
                ? isTerminalMode ? 'border-amber-400 text-amber-400' : 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Privacy & Terms
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">

          {/* SECTION 1: OVERVIEW & USAGE */}
          {activeSection === 'overview' && (
            <div className="space-y-6">

              {/* Profile Card */}
              <div className={`p-4 rounded-xl border ${
                isTerminalMode ? 'bg-[#161B22] border-[#30363D]' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-mono uppercase tracking-wider ${isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-500'}`}>
                    Account Profile
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isGuest ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isGuest ? 'Guest Pass' : 'Google Authenticated'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className={isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-500'}>Display Name:</span>
                    <span className="font-bold">{user?.displayName || 'Anonymous Guest'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-500'}>Email Address:</span>
                    <span className="font-mono">{user?.email || 'Not connected'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-500'}>Account UID:</span>
                    <button
                      onClick={handleCopyUid}
                      className="font-mono text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                      title="Click to copy UID"
                    >
                      <span>{user?.uid ? `${user.uid.slice(0, 14)}...` : 'guest_local'}</span>
                      {copiedUid ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Sign-in Callout for Guest */}
                {isGuest && (
                  <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500">Upgrade to 10 generations/day free:</span>
                    <button
                      onClick={loginGoogle}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Sign In with Google
                    </button>
                  </div>
                )}
              </div>

              {/* USAGE CARD (Single source of truth) */}
              <div>
                <UsageCard onOpenUpgrade={onOpenPricing} />
              </div>

              {/* Plan Quick Summary Card */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                isPro 
                  ? (isTerminalMode ? 'bg-amber-950/20 border-amber-800/40' : 'bg-amber-50/60 border-amber-200')
                  : (isTerminalMode ? 'bg-[#161B22] border-[#30363D]' : 'bg-zinc-50 border-zinc-200')
              }`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <h4 className="text-sm font-bold">{PLANS[entitlement.plan]?.name || planName}</h4>
                    {getStatusBadge(entitlement.status)}
                  </div>
                  <p className={`text-xs ${isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-500'}`}>
                    {isUnlimited 
                      ? 'Unlimited audio rendering across all Gemini and ElevenLabs models.'
                      : 'Standard quota active. Upgrade for unlimited speech synthesis.'}
                  </p>
                </div>

                <div>
                  {isPro ? (
                    <button
                      onClick={() => setActiveSection('subscription')}
                      className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold whitespace-nowrap"
                    >
                      Manage
                    </button>
                  ) : (
                    <button
                      onClick={onOpenPricing}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-lg text-xs font-bold whitespace-nowrap shadow-xs flex items-center gap-1"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>Upgrade</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* SECTION 2: SUBSCRIPTION & PLAN */}
          {activeSection === 'subscription' && (
            <div className="space-y-6">
              
              {/* Active Plan Overview */}
              <div className={`p-5 rounded-xl border ${
                isTerminalMode ? 'bg-[#161B22] border-[#30363D]' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-700/60">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-0.5">Current Plan</span>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      {PLANS[entitlement.plan]?.name || entitlement.plan}
                      {getStatusBadge(entitlement.status)}
                    </h3>
                  </div>
                  <button
                    onClick={onOpenPricing}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Change Plan</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 text-xs">
                  <div>
                    <span className="text-zinc-500 block mb-0.5">Product ID</span>
                    <span className="font-mono font-bold">{entitlement.productId || 'none (standard tier)'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-0.5">Billing Platform</span>
                    <span className="font-bold capitalize">{entitlement.source || 'web'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-0.5">Auto-Renewal</span>
                    <span className="font-bold">{entitlement.autoRenewing ? 'Enabled (Recurring)' : 'One-time or Inactive'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-0.5">Expires / Renews</span>
                    <span className="font-bold">
                      {entitlement.expiresAt ? new Date(entitlement.expiresAt).toLocaleDateString() : 'Permanent Lifetime'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={manageSubscription}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    isTerminalMode 
                      ? 'bg-[#161B22] border-[#30363D] hover:bg-[#21262D]' 
                      : 'bg-white border-zinc-200 hover:bg-zinc-50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold">Manage Subscription</h4>
                      <p className="text-[11px] text-zinc-500">Google Play billing portal</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-400" />
                </button>

                <button
                  onClick={handleRestorePurchases}
                  disabled={isRestoring}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    isTerminalMode 
                      ? 'bg-[#161B22] border-[#30363D] hover:bg-[#21262D]' 
                      : 'bg-white border-zinc-200 hover:bg-zinc-50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <RefreshCw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold">{isRestoring ? 'Restoring...' : 'Restore Purchases'}</h4>
                      <p className="text-[11px] text-zinc-500">Sync store receipts</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              {/* Android Note */}
              <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                onAndroid 
                  ? (isTerminalMode ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900')
                  : (isTerminalMode ? 'bg-[#161B22] border-[#30363D] text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600')
              }`}>
                <div className="flex items-center gap-2 mb-1 font-bold">
                  <Smartphone className="w-4 h-4" />
                  <span>Cross-Platform Entitlements</span>
                </div>
                Subscriptions purchased via Google Play are permanently bound to your account UID and valid across Android, Web, and desktop environments.
              </div>

            </div>
          )}

          {/* SECTION 3: PURCHASE HISTORY */}
          {activeSection === 'purchases' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold">Verified Purchases</h3>
                  <p className="text-xs text-zinc-500">Authoritative transaction records from Firestore.</p>
                </div>
                <button
                  onClick={handleRestorePurchases}
                  className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Sync
                </button>
              </div>

              {isLoadingPurchases ? (
                <div className="text-center py-10 text-xs text-zinc-500">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400" />
                  Loading transactions...
                </div>
              ) : purchases.length > 0 ? (
                <div className="space-y-2.5">
                  {purchases.map((p, idx) => (
                    <div 
                      key={p.orderId || idx}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                        isTerminalMode ? 'bg-[#161B22] border-[#30363D]' : 'bg-white border-zinc-200 shadow-2xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Receipt className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-bold">{p.productId}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800">
                            {p.status || 'Verified'}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-1 font-mono">
                          Order: {p.orderId || 'Direct'} • {new Date(p.purchasedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold">
                        ${p.priceUsd || (p.productId.includes('annual') ? 149 : p.productId.includes('lifetime') ? 299 : 19)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-12 rounded-xl border ${
                  isTerminalMode ? 'bg-[#161B22] border-[#30363D]' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <Receipt className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No purchases found</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5 max-w-xs mx-auto">
                    When you subscribe to Pro or purchase a Lifetime Pass, verified receipts will appear here.
                  </p>
                  <button
                    onClick={onOpenPricing}
                    className="mt-3 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-lg text-xs font-bold shadow-xs"
                  >
                    View Available Plans
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: SETTINGS */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              
              {/* Studio Engine & Preferences */}
              <div className={`p-4 rounded-xl border space-y-4 ${
                isTerminalMode ? 'bg-[#161B22] border-[#30363D]' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-400">
                  Studio Preferences
                </h3>

                {/* Theme / Terminal toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold flex items-center gap-1.5">
                      <TerminalIcon className="w-3.5 h-3.5 text-blue-500" />
                      Terminal Mode (Geek HUD)
                    </h4>
                    <p className="text-[11px] text-zinc-500">Dark high-contrast matrix interface</p>
                  </div>
                  <button
                    onClick={toggleTerminalMode}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                      isTerminalMode 
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                        : 'bg-zinc-200 text-zinc-800 border-zinc-300'
                    }`}
                  >
                    {isTerminalMode ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {/* Audio Sample Rate */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-700/60">
                  <div>
                    <h4 className="text-xs font-bold">Speech Audio Quality</h4>
                    <p className="text-[11px] text-zinc-500">Master output sampling format</p>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">
                    24kHz HD PCM
                  </span>
                </div>
              </div>

              {/* Account Management & Deletion */}
              <div className={`p-4 rounded-xl border space-y-4 ${
                isTerminalMode ? 'bg-[#161B22] border-[#30363D]' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-rose-500">
                  Danger Zone & Account Actions
                </h3>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold">Sign Out</h4>
                    <p className="text-[11px] text-zinc-500">End your current session</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400">Delete Account & Data</h4>
                    <p className="text-[11px] text-zinc-500">Permanently remove cloud projects, monologues & audio history</p>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Account
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* SECTION 5: LEGAL, PRIVACY & TERMS */}
          {activeSection === 'legal' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700/60 pb-3">
                <button
                  onClick={() => setLegalDocType('privacy')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    legalDocType === 'privacy'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setLegalDocType('terms')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    legalDocType === 'terms'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  Terms of Service
                </button>
              </div>

              {legalDocType === 'privacy' ? (
                <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-3 ${
                  isTerminalMode ? 'bg-[#161B22] border-[#30363D] text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'
                }`}>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    AudioFACTORY Privacy Policy
                  </h4>
                  <p>
                    AudioFACTORY processes voice synthesis scripts and custom voice cloning samples strictly to render audio on behalf of the user. 
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-zinc-500">
                    <li>We do not sell user audio records or script data to third parties.</li>
                    <li>Audio synthesis calls are proxied securely through backend endpoints to safeguard API keys.</li>
                    <li>Users can request complete data deletion at any time via the Delete Account trigger.</li>
                  </ul>
                </div>
              ) : (
                <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-3 ${
                  isTerminalMode ? 'bg-[#161B22] border-[#30363D] text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'
                }`}>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-500" />
                    AudioFACTORY Terms of Service
                  </h4>
                  <p>
                    By using AudioFACTORY, you agree to utilize synthetic speech generation responsibly and refrain from generating harmful, deceptive, or non-consensual voice clones.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-zinc-500">
                    <li>Subscriptions renew automatically according to Google Play terms unless cancelled 24 hours before period end.</li>
                    <li>Daily quotas reset at 00:00 UTC each day.</li>
                    <li>Purchases are governed by Google Play standard consumer rights and developer policies.</li>
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl ${
              isTerminalMode ? 'bg-[#161B22] border-rose-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
            }`}>
              <div className="flex items-center gap-3 mb-3 text-rose-500">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-bold text-base">Delete Account & Data?</h3>
              </div>
              <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                This action is irreversible. All your saved monologues, audio projects, and cloud backup records will be permanently erased.
              </p>

              {deleteMessage && (
                <div className="p-3 mb-4 rounded-lg bg-emerald-500/15 text-emerald-600 text-xs font-bold border border-emerald-500/30">
                  {deleteMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-3.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>{isDeleting ? 'Deleting...' : 'Confirm Deletion'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-xs flex-shrink-0 ${
          isTerminalMode ? 'border-[#30363D] bg-[#161B22] text-[#8B949E]' : 'border-zinc-200 bg-zinc-50 text-zinc-500'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>AudioFACTORY v3.0 • Secure Studio Account</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-bold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
