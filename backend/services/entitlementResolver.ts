/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Single Authoritative Backend Entitlement Resolver
 * All AI generation authorization and access control across the backend MUST query this resolver.
 */
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { serverDb, getTodayUtcDateString } from '../usageManager';
import { 
  Entitlement, 
  UserPlan, 
  SubscriptionLifecycleStatus, 
  EntitlementSource, 
  FeatureEntitlement 
} from '../../shared/types';
import { PLANS, resolveEntitlement as buildEntitlementObject, isPaidPlan, BASE_FREE_FEATURES, BASE_GUEST_FEATURES } from '../../shared/plans';

interface CachedEntitlementEntry {
  entitlement: Entitlement;
  fetchedAt: number;
}

// In-memory hot cache for high-throughput generation checks (TTL: 10 seconds)
const entitlementCache = new Map<string, CachedEntitlementEntry>();
const CACHE_TTL_MS = 10000;

export function invalidateEntitlementCache(userId: string): void {
  entitlementCache.delete(userId);
}

/**
 * Single Authoritative Entitlement Resolver
 * Evaluates subscription lifecycle (active, cancelled, expired, paused, grace_period, account_hold, revoked, refunded)
 * and returns the authoritative Entitlement object including daily quota, remaining quota, and feature flags.
 */
export async function resolveEntitlement(
  userId: string,
  isGuest: boolean = false
): Promise<Entitlement> {
  const now = new Date();
  const nowIso = now.toISOString();
  const today = getTodayUtcDateString();

  // Guest / Anonymous fallback
  if (isGuest || !userId || userId.startsWith('guest_')) {
    const guestUsage = await getDailyUsageCount(userId || 'guest_anonymous', today);
    return buildEntitlementObject('guest', guestUsage, null, null, {
      status: 'active',
      source: 'system',
      autoRenewing: false,
    });
  }

  // Check in-memory hot cache
  const cached = entitlementCache.get(userId);
  if (cached && (Date.now() - cached.fetchedAt < CACHE_TTL_MS)) {
    // If cache entry has an expiration date, verify it hasn't passed
    if (!cached.entitlement.expiresAt || new Date(cached.entitlement.expiresAt) > now) {
      // Refresh current daily usage count to return accurate remaining quota
      const usageCount = await getDailyUsageCount(userId, today);
      const isUnlimited = cached.entitlement.dailyQuota === -1;
      const remainingQuota = isUnlimited ? -1 : Math.max(0, cached.entitlement.dailyQuota - usageCount);
      return {
        ...cached.entitlement,
        remainingQuota,
      };
    }
  }

  const entitlementDocRef = doc(serverDb, 'users', userId, 'entitlements', 'current');
  let planId: UserPlan = 'free';
  let status: SubscriptionLifecycleStatus = 'active';
  let source: EntitlementSource = 'web';
  let productId: string | null = null;
  let expiresAt: string | null = null;
  let startedAt: string | null = null;
  let autoRenewing: boolean = false;
  let orderId: string | null = null;
  let purchaseTokenHash: string | null = null;
  let updatedAt: string = nowIso;

  try {
    const snap = await getDoc(entitlementDocRef);
    if (snap.exists()) {
      const data = snap.data();
      const rawPlanId = data.planId as UserPlan;
      const rawStatus = (data.status as SubscriptionLifecycleStatus) || 'active';
      source = (data.source as EntitlementSource) || 'google_play';
      productId = data.productId || null;
      expiresAt = data.expiresAt || null;
      startedAt = data.startedAt || null;
      autoRenewing = typeof data.autoRenewing === 'boolean' ? data.autoRenewing : true;
      orderId = data.orderId || null;
      purchaseTokenHash = data.purchaseTokenHash || null;
      updatedAt = data.updatedAt || nowIso;

      // Lifecycle Evaluation
      if (rawPlanId === 'lifetime') {
        if (rawStatus === 'refunded' || rawStatus === 'revoked') {
          planId = 'free';
          status = rawStatus;
        } else {
          planId = 'lifetime';
          status = 'active';
          expiresAt = null;
          autoRenewing = false;
        }
      } else if (rawPlanId === 'pro_monthly' || rawPlanId === 'pro_annual') {
        const isPastExpiry = expiresAt ? new Date(expiresAt) <= now : false;

        switch (rawStatus) {
          case 'active':
            if (isPastExpiry) {
              planId = 'free';
              status = 'expired';
              // Trigger background status update to Firestore
              updateDoc(entitlementDocRef, { status: 'expired', updatedAt: nowIso }).catch(() => {});
            } else {
              planId = rawPlanId;
              status = 'active';
            }
            break;

          case 'grace_period':
            // Google Play grace period grants access while billing retry occurs
            planId = rawPlanId;
            status = 'grace_period';
            break;

          case 'cancelled':
            if (isPastExpiry) {
              planId = 'free';
              status = 'expired';
            } else {
              // Active until current billing period ends
              planId = rawPlanId;
              status = 'cancelled';
              autoRenewing = false;
            }
            break;

          case 'paused':
          case 'account_hold':
          case 'expired':
          case 'revoked':
          case 'refunded':
          default:
            // Premium access suspended
            planId = 'free';
            status = rawStatus;
            break;
        }
      } else {
        planId = 'free';
        status = 'active';
      }
    }
  } catch (err) {
    console.warn(`[ENTITLEMENT_RESOLVER] Failed reading Firestore entitlement for ${userId}:`, err);
    planId = 'free';
    status = 'active';
  }

  const usageCount = await getDailyUsageCount(userId, today);
  const resolved = buildEntitlementObject(planId, usageCount, expiresAt, productId, {
    status,
    source,
    autoRenewing,
    orderId,
    purchaseTokenHash,
    startedAt,
    updatedAt,
  });

  // Cache resolved entitlement
  entitlementCache.set(userId, {
    entitlement: resolved,
    fetchedAt: Date.now(),
  });

  return resolved;
}

/**
 * Helper to fetch generation usage count for today
 */
async function getDailyUsageCount(userId: string, today: string): Promise<number> {
  try {
    const usageDocRef = doc(serverDb, 'users', userId, 'usage', today);
    const snap = await getDoc(usageDocRef);
    if (snap.exists()) {
      return Number(snap.data().generationCount || 0);
    }
  } catch (err) {
    // Non-blocking usage fallback
  }
  return 0;
}

/**
 * Saves authoritative entitlement directly to Firestore `users/{uid}/entitlements/current`
 */
export async function saveUserEntitlement(
  userId: string,
  data: {
    planId: UserPlan;
    status: SubscriptionLifecycleStatus;
    source: EntitlementSource;
    productId: string | null;
    orderId?: string | null;
    purchaseTokenHash?: string | null;
    startedAt?: string | null;
    expiresAt?: string | null;
    autoRenewing?: boolean;
    features?: FeatureEntitlement;
  }
): Promise<Entitlement> {
  const nowIso = new Date().toISOString();
  const entitlementDocRef = doc(serverDb, 'users', userId, 'entitlements', 'current');
  const planConfig = PLANS[data.planId] || PLANS.free;

  const docPayload = {
    uid: userId,
    planId: data.planId,
    status: data.status,
    source: data.source,
    productId: data.productId,
    orderId: data.orderId || null,
    purchaseTokenHash: data.purchaseTokenHash || null,
    startedAt: data.startedAt || nowIso,
    expiresAt: data.expiresAt || null,
    autoRenewing: typeof data.autoRenewing === 'boolean' ? data.autoRenewing : (planConfig.productType === 'subs'),
    updatedAt: nowIso,
  };

  await setDoc(entitlementDocRef, docPayload, { merge: true });

  // Invalidate cache immediately so new entitlement is available
  invalidateEntitlementCache(userId);

  return resolveEntitlement(userId, false);
}
