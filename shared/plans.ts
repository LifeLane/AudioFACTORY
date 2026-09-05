/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Configuration-Driven Plan System
 */
import { PlanConfig, UserPlan, PRODUCT_IDS, FeatureEntitlement, Entitlement } from './types';

export const BASE_GUEST_FEATURES: FeatureEntitlement = {
  unlimitedGenerations: false,
  elevenLabsAccess: false,
  instantVoiceCloning: false,
  bgmSoundtrackGeneration: false,
  multiSpeakerStudio: true,
  losslessWavExport: true,
  liveCollaboration: false,
  maxDialogueLines: 6,
  concurrencyLimit: 1,
};

export const BASE_FREE_FEATURES: FeatureEntitlement = {
  unlimitedGenerations: false,
  elevenLabsAccess: true,
  instantVoiceCloning: false,
  bgmSoundtrackGeneration: true,
  multiSpeakerStudio: true,
  losslessWavExport: true,
  liveCollaboration: true,
  maxDialogueLines: 15,
  concurrencyLimit: 2,
};

export const PREMIUM_FEATURES: FeatureEntitlement = {
  unlimitedGenerations: true,
  elevenLabsAccess: true,
  instantVoiceCloning: true,
  bgmSoundtrackGeneration: true,
  multiSpeakerStudio: true,
  losslessWavExport: true,
  liveCollaboration: true,
  maxDialogueLines: 100,
  concurrencyLimit: 8,
};

export const PLANS: Record<UserPlan, PlanConfig> = {
  guest: {
    id: 'guest',
    name: 'Guest Pass',
    badge: 'Guest',
    description: 'Instant sandbox access for rapid auditioning without sign-in.',
    dailyGenerations: 3,
    priceUsd: 0,
    interval: 'day',
    productType: 'free',
    features: BASE_GUEST_FEATURES,
  },
  free: {
    id: 'free',
    name: 'Creator Starter',
    badge: 'Free Tier',
    description: 'Cloud project syncing and standard voice studio capabilities.',
    dailyGenerations: 10,
    priceUsd: 0,
    interval: 'month',
    productType: 'free',
    features: BASE_FREE_FEATURES,
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    badge: 'Pro Monthly',
    description: 'Unlimited AI speech synthesis, ElevenLabs integration & voice cloning.',
    dailyGenerations: -1,
    priceUsd: 19,
    interval: 'month',
    productType: 'subs',
    productId: PRODUCT_IDS.PRO_MONTHLY,
    features: PREMIUM_FEATURES,
  },
  pro_annual: {
    id: 'pro_annual',
    name: 'Pro Annual',
    badge: 'Pro Annual (Save 35%)',
    description: 'Full studio access with highest priority audio rendering queues.',
    dailyGenerations: -1,
    priceUsd: 149,
    interval: 'year',
    productType: 'subs',
    productId: PRODUCT_IDS.PRO_ANNUAL,
    features: PREMIUM_FEATURES,
    highlight: true,
  },
  lifetime: {
    id: 'lifetime',
    name: 'Studio Lifetime',
    badge: 'Lifetime License',
    description: 'Permanent unrestricted access with all future voice models included.',
    dailyGenerations: -1,
    priceUsd: 299,
    interval: 'lifetime',
    productType: 'inapp',
    productId: PRODUCT_IDS.LIFETIME,
    features: PREMIUM_FEATURES,
  },
};

export function getPlanFromProductId(productId: string | null | undefined): UserPlan {
  if (!productId) return 'free';
  if (productId === PRODUCT_IDS.PRO_MONTHLY) return 'pro_monthly';
  if (productId === PRODUCT_IDS.PRO_ANNUAL) return 'pro_annual';
  if (productId === PRODUCT_IDS.LIFETIME) return 'lifetime';
  return 'free';
}

export function isPaidPlan(plan: UserPlan): boolean {
  return plan === 'pro_monthly' || plan === 'pro_annual' || plan === 'lifetime';
}

/**
 * Resolves an Entitlement object given a plan, current usage count, and expiration date.
 */
export function resolveEntitlement(
  plan: UserPlan,
  usedToday: number = 0,
  expiresAt: string | null = null,
  productId: string | null = null,
  options?: {
    status?: any;
    source?: any;
    autoRenewing?: boolean;
    orderId?: string | null;
    purchaseTokenHash?: string | null;
    startedAt?: string | null;
    updatedAt?: string | null;
  }
): Entitlement {
  const planConfig = PLANS[plan] || PLANS.guest;
  const isUnlimited = planConfig.dailyGenerations === -1;
  const dailyQuota = isUnlimited ? -1 : planConfig.dailyGenerations;
  const remainingQuota = isUnlimited ? -1 : Math.max(0, dailyQuota - usedToday);
  const status = options?.status || (isPaidPlan(plan) ? 'active' : 'active');
  const source = options?.source || (isPaidPlan(plan) ? 'google_play' : (plan === 'guest' ? 'system' : 'web'));

  return {
    plan: planConfig.id,
    status,
    isActive: status === 'active' || status === 'grace_period' || (status === 'cancelled' && (!expiresAt || new Date(expiresAt) > new Date())),
    source,
    expiresAt,
    startedAt: options?.startedAt || null,
    autoRenewing: options?.autoRenewing ?? (planConfig.productType === 'subs'),
    dailyQuota,
    remainingQuota,
    features: planConfig.features,
    productId: productId || (planConfig.productId as string) || null,
    orderId: options?.orderId || null,
    purchaseTokenHash: options?.purchaseTokenHash || null,
    updatedAt: options?.updatedAt || new Date().toISOString(),
  };
}
