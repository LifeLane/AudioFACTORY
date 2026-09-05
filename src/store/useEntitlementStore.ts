/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Authoritative Entitlement & Subscription Store
 */
import { create } from 'zustand';
import { Entitlement, UsageRecord, UserPlan, ProductIdentifier } from '../../shared/types';
import { resolveEntitlement } from '../../shared/plans';
import { 
  getCurrentEntitlement, 
  getUsage, 
  upgradePlan, 
  verifyPlayPurchase,
  purchaseProduct as executePurchaseProduct,
  restorePurchases as executeRestorePurchases,
  openGooglePlaySubscriptionManagement
} from '../../services/entitlementService';

interface EntitlementState {
  entitlement: Entitlement;
  usage: UsageRecord | null;
  isLoading: boolean;
  isRestoring: boolean;
  isUpgradeModalOpen: boolean;
  billingMessage: string | null;
  refreshEntitlement: (user?: { uid?: string } | null) => Promise<void>;
  setUpgradeModalOpen: (isOpen: boolean) => void;
  setBillingMessage: (msg: string | null) => void;
  applyPlan: (plan: UserPlan, user?: { uid?: string } | null) => Promise<boolean>;
  applyPlayPurchase: (productId: string, token: string, user?: { uid?: string } | null) => Promise<boolean>;
  purchase: (productId: ProductIdentifier | string, user?: { uid?: string } | null) => Promise<{ success: boolean; message?: string }>;
  restore: (user?: { uid?: string } | null) => Promise<{ success: boolean; restored: boolean; message?: string }>;
  manageSubscription: () => void;
  decrementQuota: () => void;
}

export const useEntitlementStore = create<EntitlementState>((set, get) => ({
  entitlement: resolveEntitlement('guest', 0),
  usage: null,
  isLoading: false,
  isRestoring: false,
  isUpgradeModalOpen: false,
  billingMessage: null,

  refreshEntitlement: async (user) => {
    set({ isLoading: true });
    try {
      const [entitlement, usage] = await Promise.all([
        getCurrentEntitlement(user),
        getUsage(user),
      ]);
      set({ entitlement, usage, isLoading: false });
    } catch (err) {
      console.error('Failed to load entitlements:', err);
      set({ isLoading: false });
    }
  },

  setUpgradeModalOpen: (isOpen) => set({ isUpgradeModalOpen: isOpen }),
  setBillingMessage: (msg) => set({ billingMessage: msg }),

  purchase: async (productId, user) => {
    set({ isLoading: true, billingMessage: null });
    try {
      const result = await executePurchaseProduct(productId, user);
      if (result.success && result.entitlement) {
        set({ 
          entitlement: result.entitlement, 
          isLoading: false, 
          billingMessage: 'Purchase successful! Entitlement updated.' 
        });
        return { success: true, message: 'Purchase successful! Entitlement updated.' };
      } else {
        set({ 
          isLoading: false, 
          billingMessage: 'Purchase could not be verified.' 
        });
        return { success: false, message: 'Purchase could not be verified.' };
      }
    } catch (err: any) {
      const msg = err.message || 'Purchase transaction failed';
      set({ isLoading: false, billingMessage: msg });
      return { success: false, message: msg };
    }
  },

  restore: async (user) => {
    set({ isRestoring: true, billingMessage: null });
    try {
      const result = await executeRestorePurchases(user);
      if (result.success && result.entitlement) {
        set({ 
          entitlement: result.entitlement, 
          isRestoring: false, 
          billingMessage: 'Purchases restored.' 
        });
        return result;
      }
      set({ isRestoring: false, billingMessage: 'No purchases restored.' });
      return result;
    } catch (err: any) {
      const msg = err.message || 'Failed to restore purchases.';
      set({ isRestoring: false, billingMessage: msg });
      return { success: false, restored: false, message: msg };
    }
  },

  manageSubscription: () => {
    openGooglePlaySubscriptionManagement();
  },

  applyPlan: async (plan, user) => {
    set({ isLoading: true });
    try {
      const entitlement = await upgradePlan(plan, user);
      if (entitlement) {
        set({ entitlement, isLoading: false });
        return true;
      }
    } catch (err) {
      console.error('Plan upgrade error:', err);
    }
    set({ isLoading: false });
    return false;
  },

  applyPlayPurchase: async (productId, token, user) => {
    set({ isLoading: true });
    try {
      const result = await verifyPlayPurchase(productId, token);
      if (result.success && result.entitlement) {
        set({ entitlement: result.entitlement, isLoading: false });
        return true;
      }
    } catch (err) {
      console.error('Play verification error:', err);
    }
    set({ isLoading: false });
    return false;
  },

  decrementQuota: () => {
    const current = get().entitlement;
    if (current.dailyQuota !== -1 && current.remainingQuota > 0) {
      set({
        entitlement: {
          ...current,
          remainingQuota: current.remainingQuota - 1,
        },
      });
    }
  },
}));
