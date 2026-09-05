/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Usage Hook
 */
import { useEffect } from 'react';
import { useEntitlementStore } from '../store/useEntitlementStore';
import { useFirebase } from '../../services/firebaseContext';
import { UsageRecord } from '../../shared/types';

export interface UseUsageReturn {
  usage: UsageRecord | null;
  usedToday: number;
  remainingQuota: number;
  dailyQuota: number;
  isUnlimited: boolean;
  isExhausted: boolean;
  isNearLimit: boolean;
  refreshUsage: () => Promise<void>;
}

export function useUsage(): UseUsageReturn {
  const { user, liveUsage } = useFirebase();
  const entitlement = useEntitlementStore((state) => state.entitlement);
  const storeUsage = useEntitlementStore((state) => state.usage);
  const refresh = useEntitlementStore((state) => state.refreshEntitlement);

  const activeUsage = liveUsage || storeUsage;
  const isUnlimited = entitlement.dailyQuota === -1;
  const dailyQuota = isUnlimited ? -1 : entitlement.dailyQuota;
  const usedToday = activeUsage?.generationCount ?? (entitlement.dailyQuota - entitlement.remainingQuota);
  const remainingQuota = isUnlimited ? -1 : Math.max(0, dailyQuota - usedToday);
  const isExhausted = !isUnlimited && remainingQuota <= 0;
  const isNearLimit = !isUnlimited && remainingQuota === 1 && !isExhausted;

  return {
    usage: activeUsage,
    usedToday,
    remainingQuota,
    dailyQuota,
    isUnlimited,
    isExhausted,
    isNearLimit,
    refreshUsage: () => refresh(user),
  };
}
