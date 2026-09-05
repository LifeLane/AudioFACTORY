/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Single-Source Generation Quota Hook
 */
import { useCallback } from 'react';
import { useEntitlement } from './useEntitlement';
import { useUsage } from './useUsage';
import { useEntitlementStore } from '../store/useEntitlementStore';
import { useFirebase } from '../../services/firebaseContext';

export interface UseGenerationQuotaReturn {
  plan: string;
  planName: string;
  isGuest: boolean;
  isFree: boolean;
  isPro: boolean;
  usedToday: number;
  dailyQuota: number;
  remainingQuota: number;
  isUnlimited: boolean;
  isExhausted: boolean;
  isNearLimit: boolean;
  quotaLabel: string;
  subLabel: string;
  canGenerate: boolean;
  openUpgradeModal: () => void;
  checkQuotaBeforeAction: (actionDescription?: string) => boolean;
  decrementLocalQuota: () => void;
  refresh: () => Promise<void>;
}

export function useGenerationQuota(): UseGenerationQuotaReturn {
  const { plan, planName, isPro, isFree, isGuest, isUnlimited, openUpgradeModal, refreshEntitlement } = useEntitlement();
  const { usedToday, remainingQuota, dailyQuota, isExhausted, isNearLimit, refreshUsage } = useUsage();
  const decrementQuota = useEntitlementStore((state) => state.decrementQuota);
  const setUpgradeModalOpen = useEntitlementStore((state) => state.setUpgradeModalOpen);

  let quotaLabel = '';
  let subLabel = '';

  if (isUnlimited) {
    quotaLabel = 'Unlimited Generations';
    subLabel = `${planName} Active`;
  } else if (isGuest) {
    quotaLabel = `${usedToday} / ${dailyQuota} generations today`;
    subLabel = 'Guest Mode (Sign in for 10/day)';
  } else {
    quotaLabel = `${usedToday} / ${dailyQuota} generations today`;
    subLabel = 'Free Plan (Reset at 00:00 UTC)';
  }

  const checkQuotaBeforeAction = useCallback((actionDescription?: string): boolean => {
    if (isUnlimited) return true;

    if (isExhausted || remainingQuota <= 0) {
      setUpgradeModalOpen(true);
      return false;
    }
    return true;
  }, [isUnlimited, isExhausted, remainingQuota, setUpgradeModalOpen]);

  return {
    plan,
    planName,
    isGuest,
    isFree,
    isPro,
    usedToday,
    dailyQuota,
    remainingQuota,
    isUnlimited,
    isExhausted,
    isNearLimit,
    quotaLabel,
    subLabel,
    canGenerate: isUnlimited || remainingQuota > 0,
    openUpgradeModal,
    checkQuotaBeforeAction,
    decrementLocalQuota: decrementQuota,
    refresh: async () => {
      await Promise.all([refreshEntitlement(), refreshUsage()]);
    },
  };
}
