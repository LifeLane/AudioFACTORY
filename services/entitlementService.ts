/**
@license
* SPDX-License-Identifier: Apache-2.0
* AudioFACTORY Client-Side Entitlement & Quota Service
*/
import { Entitlement, UsageRecord, UserPlan, PurchaseRecord } from '../shared/types';
import { PLANS, resolveEntitlement } from '../shared/plans';
import { Capacitor } from '@capacitor/core';
import { apiGet, apiPost } from '../src/lib/apiClient';
import { executeNativePlayPurchase, getNativeRestoredPurchases, isAndroidNative } from './googlePlayBridge';

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

export async function getCurrentEntitlement(user?: { uid?: string } | null): Promise<Entitlement> {
  try {
    const data = await apiGet('/billing/entitlement');
    if (data && data.entitlement) {
      return data.entitlement;
    }
  } catch (err) {
    console.warn('[ENTITLEMENT] Failed to fetch server entitlement, using fallback:', err);
  }

  const defaultPlan: UserPlan = user?.uid ? 'free' : 'guest';
  return resolveEntitlement(defaultPlan, 0);
}

export async function getUsage(user?: { uid?: string } | null): Promise<UsageRecord> {
  try {
    const data = await apiGet('/billing/entitlement');
    if (data && data.usage) {
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

export async function verifyPlayPurchase(productId: string, purchaseToken: string, orderId?: string, packageName?: string): Promise<{ success: boolean; entitlement: Entitlement }> {
  const result = await apiPost('/billing/verify-play-purchase', {
    productId,
    purchaseToken,
    orderId,
    packageName,
  });
  return result;
}

export async function upgradePlan(plan: UserPlan, user?: { uid?: string } | null): Promise<Entitlement> {
  const result = await apiPost('/billing/simulate-purchase', { plan });
  return result.entitlement;
}

export async function purchaseProduct(productId: string, user?: { uid?: string; email?: string } | null): Promise<{ success: boolean; entitlement: Entitlement }> {
  if (isAndroidNative()) {
    const nativePurchase = await executeNativePlayPurchase(productId, user?.uid);
    if (nativePurchase) {
      const verified = await verifyPlayPurchase(nativePurchase.productId, nativePurchase.purchaseToken, nativePurchase.orderId);
      return { success: true, entitlement: verified.entitlement };
    }
    throw new Error('Native Google Play purchase flow was cancelled or failed.');
  } else {
    // Web / Desktop sandbox / simulator purchase
    let plan: UserPlan = 'free';
    if (productId.includes('monthly')) plan = 'pro_monthly';
    else if (productId.includes('annual')) plan = 'pro_annual';
    else if (productId.includes('lifetime')) plan = 'lifetime';

    const entitlement = await upgradePlan(plan, user);
    return { success: true, entitlement };
  }
}

export async function restorePurchases(user?: { uid?: string } | null): Promise<{ success: boolean; restored: boolean; entitlement: Entitlement }> {
  if (isAndroidNative()) {
    const nativePurchases = await getNativeRestoredPurchases();
    const result = await apiPost('/billing/restore-purchases', { purchases: nativePurchases });
    return result;
  } else {
    const result = await apiPost('/billing/restore-purchases', { purchases: [] });
    return result;
  }
}

export function openGooglePlaySubscriptionManagement(): void {
  if (typeof window !== 'undefined') {
    window.open('https://play.google.com/store/account/subscriptions', '_blank');
  }
}

export function canGenerate(entitlement: Entitlement): { allowed: boolean; reason?: string } {
  if (entitlement.dailyQuota === -1) {
    return { allowed: true };
  }
  const remaining = entitlement.remainingQuota;
  if (remaining <= 0) {
    return {
      allowed: false,
      reason: `Daily generation quota of ${entitlement.dailyQuota} reached. Upgrade to Pro for unlimited generations.`,
    };
  }
  return { allowed: true };
}
