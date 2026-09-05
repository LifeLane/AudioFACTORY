/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Entitlement Hook
 */
import { useEffect } from 'react';
import { useEntitlementStore } from '../store/useEntitlementStore';
import { useFirebase } from '../../services/firebaseContext';
import { Entitlement, UserPlan } from '../../shared/types';
import { PLANS } from '../../shared/plans';

export interface UseEntitlementReturn {
  entitlement: Entitlement;
  plan: UserPlan;
  planName: string;
  isPro: boolean;
  isFree: boolean;
  isGuest: boolean;
  isUnlimited: boolean;
  isLoading: boolean;
  features: Entitlement['features'];
  refreshEntitlement: () => Promise<void>;
  openUpgradeModal: () => void;
}

export function useEntitlement(): UseEntitlementReturn {
  const { user, isGuest } = useFirebase();
  const entitlement = useEntitlementStore((state) => state.entitlement);
  const isLoading = useEntitlementStore((state) => state.isLoading);
  const refresh = useEntitlementStore((state) => state.refreshEntitlement);
  const setUpgradeModalOpen = useEntitlementStore((state) => state.setUpgradeModalOpen);

  useEffect(() => {
    refresh(user);
  }, [user, isGuest, refresh]);

  const plan = entitlement.plan || (isGuest ? 'guest' : 'free');
  const isPro = plan === 'pro_monthly' || plan === 'pro_annual' || plan === 'lifetime';
  const isFree = plan === 'free' && !isGuest;
  const isUnlimited = entitlement.dailyQuota === -1;
  const planName = PLANS[plan]?.name || 'Free Plan';

  return {
    entitlement,
    plan,
    planName,
    isPro,
    isFree,
    isGuest,
    isUnlimited,
    isLoading,
    features: entitlement.features,
    refreshEntitlement: () => refresh(user),
    openUpgradeModal: () => setUpgradeModalOpen(true),
  };
}
