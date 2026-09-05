/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Client-Side Entitlement & Quota Service
 */
import { Entitlement, UsageRecord, UserPlan, PurchaseRecord, PRODUCT_IDS, ProductIdentifier } from '../shared/types';
import { PLANS, resolveEntitlement, getPlanFromProductId } from '../shared/plans';
import { Capacitor } from '@capacitor/core';
import { executeNativePlayPurchase, getNativeRestoredPurchases } from './googlePlayBridge';

const GUEST_ID_KEY = 'audiofactory_guest_id';

export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return 'server_guest';
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = `guest_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

export function getAuthHeaders(user?: { uid?: string; isAnonymous?: boolean } | null): HeadersInit {
  const guestId = getOrCreateGuestId();
  const isAnonymous = user ? !!user.isAnonymous : true;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-guest-id': guestId,
    'x-is-anonymous': String(isAnonymous),
  };

  if (user?.uid) {
    headers['x-user-id'] = user.uid;
    headers['Authorization'] = `Bearer ${user.uid}`;
  }

  return headers;
}

/**
 * Single Authoritative Entitlement Resolver on frontend
 */
export async function getCurrentEntitlement(user?: { uid?: string } | null): Promise<Entitlement> {
  try {
    const response = await fetch('/api/billing/entitlement', {
      headers: getAuthHeaders(user),
    });

    if (response.ok) {
      const data = await response.json();
      return data.entitlement;
    }
  } catch (err) {
    console.warn('[ENTITLEMENT] Failed to fetch server entitlement, using fallback:', err);
  }

  // Local fallback resolver
  const defaultPlan: UserPlan = user?.uid ? 'free' : 'guest';
  return resolveEntitlement(defaultPlan, 0);
}

/**
 * Fetch current daily usage record
 */
export async function getUsage(user?: { uid?: string } | null): Promise<UsageRecord> {
  try {
    const response = await fetch('/api/billing/entitlement', {
      headers: getAuthHeaders(user),
    });

    if (response.ok) {
      const data = await response.json();
      return data.usage;
    }
  } catch (err) {
    console.warn('[USAGE] Failed to fetch usage from server:', err);
  }

  const today = new Date().toISOString().split('T')[0];
  return {
    userId: user?.uid || getOrCreateGuestId(),
    date: today,
    generationCount: 0,
    characterCount: 0,
    lastGeneratedAt: new Date().toISOString(),
  };
}

/**
 * canGenerate UX Helper (Frontend validation check)
 * Note: Backend remains the strict authoritative gatekeeper.
 */
export function canGenerate(entitlement: Entitlement): { allowed: boolean; reason?: string } {
  if (entitlement.dailyQuota === -1) {
    return { allowed: true };
  }

  if (entitlement.remainingQuota <= 0) {
    const planName = PLANS[entitlement.plan]?.name || entitlement.plan;
    return {
      allowed: false,
      reason: `You have reached your daily quota (${entitlement.dailyQuota} generations) on the ${planName}. Upgrade to Pro for unlimited generations.`,
    };
  }

  return { allowed: true };
}

/**
 * Initiates Google Play Purchase or fallback Web checkout
 * NEVER grants premium access on the client without authoritative backend verification.
 */
export async function purchaseProduct(
  productId: ProductIdentifier | string,
  user?: { uid?: string } | null
): Promise<{ success: boolean; entitlement?: Entitlement; message?: string }> {
  const onAndroid = isNativeAndroid();

  if (onAndroid) {
    try {
      // 1. Launch native Google Play billing sheet via Capacitor Plugin
      const nativePurchase = await executeNativePlayPurchase(productId, user?.uid);
      
      if (nativePurchase && nativePurchase.purchaseToken) {
        // 2. Authoritative backend verification of the acquired token
        return await verifyPlayPurchase(
          nativePurchase.productId || productId, 
          nativePurchase.purchaseToken, 
          user, 
          nativePurchase.orderId
        );
      } else {
        // Fallback for emulator / non-play-services devices
        const purchaseToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
        const orderId = `GPA.${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10000 + Math.random() * 90000)}`;
        return await verifyPlayPurchase(productId, purchaseToken, user, orderId);
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Google Play purchase cancelled or failed.',
      };
    }
  } else {
    // Graceful Web degradation: Verify and activate through backend sandbox
    const plan = getPlanFromProductId(productId);
    return await upgradePlan(plan, user);
  }
}

/**
 * Authoritative Backend Verification for Google Play Purchase
 */
export async function verifyPlayPurchase(
  productId: string,
  purchaseToken: string,
  user?: { uid?: string } | null,
  orderId?: string
): Promise<{ success: boolean; entitlement?: Entitlement; message?: string }> {
  try {
    const response = await fetch('/api/billing/verify-play-purchase', {
      method: 'POST',
      headers: getAuthHeaders(user),
      body: JSON.stringify({
        productId,
        purchaseToken,
        orderId,
        packageName: 'com.audiofactory.app',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Verification failed');
    }

    return {
      success: true,
      entitlement: data.entitlement,
      message: data.result?.message || 'Google Play purchase verified successfully.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Google Play purchase verification failed.',
    };
  }
}

/**
 * Restore Purchases from Google Play
 */
export async function restorePurchases(
  user?: { uid?: string } | null
): Promise<{ success: boolean; restored: boolean; entitlement?: Entitlement; message?: string }> {
  try {
    if (isNativeAndroid()) {
      const nativePurchases = await getNativeRestoredPurchases();
      if (nativePurchases && nativePurchases.length > 0) {
        // Verify latest purchase token on backend
        const latest = nativePurchases[0];
        const res = await verifyPlayPurchase(latest.productId || PRODUCT_IDS.PRO_MONTHLY, latest.purchaseToken, user, latest.orderId);
        if (res.success && res.entitlement) {
          return {
            success: true,
            restored: true,
            entitlement: res.entitlement,
            message: 'Active Google Play purchases successfully restored!',
          };
        }
      }
    }

    const response = await fetch('/api/billing/restore-purchases', {
      method: 'POST',
      headers: getAuthHeaders(user),
      body: JSON.stringify({}),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Restore failed');
    }

    return {
      success: true,
      restored: !!data.restored,
      entitlement: data.entitlement,
      message: data.message || 'Purchases restored successfully.',
    };
  } catch (err: any) {
    return {
      success: false,
      restored: false,
      message: err.message || 'Failed to restore purchases.',
    };
  }
}

/**
 * Open Google Play Subscription Management screen
 */
export function openGooglePlaySubscriptionManagement(productId?: string | null): void {
  const packageName = 'com.audiofactory.app';
  let url = 'https://play.google.com/store/account/subscriptions';
  if (productId && productId !== PRODUCT_IDS.LIFETIME) {
    url = `https://play.google.com/store/account/subscriptions?sku=${encodeURIComponent(productId)}&package=${encodeURIComponent(packageName)}`;
  }

  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Simulated / Sandbox Plan Upgrade for Web & QA
 */
export async function upgradePlan(
  plan: UserPlan,
  user?: { uid?: string } | null
): Promise<{ success: boolean; entitlement?: Entitlement; message?: string }> {
  try {
    const response = await fetch('/api/billing/simulate-purchase', {
      method: 'POST',
      headers: getAuthHeaders(user),
      body: JSON.stringify({ plan }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Upgrade failed');
    }

    return {
      success: true,
      entitlement: data.entitlement,
      message: data.message,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to update plan.',
    };
  }
}
