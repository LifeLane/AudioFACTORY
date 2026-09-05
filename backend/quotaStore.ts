/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Quota & Usage Store (Firestore-backed)
 */
import { UsageRecord, UserPlan } from '../shared/types';
import { 
  getTodayUsageRecord, 
  atomicallyReserveGeneration, 
  recordGenerationResult,
  getTodayUtcDateString
} from './usageManager';
import { resolveEntitlement, saveUserEntitlement } from './services/entitlementResolver';

export function getTodayUtcString(): string {
  return getTodayUtcDateString();
}

export async function getUserPlan(userId: string, isGuest: boolean = false) {
  const ent = await resolveEntitlement(userId, isGuest);
  return { plan: ent.plan, expiresAt: ent.expiresAt, productId: ent.productId };
}

export async function setUserPlan(
  userId: string, 
  plan: UserPlan, 
  expiresAt: string | null = null, 
  productId: string | null = null
) {
  await saveUserEntitlement(userId, {
    planId: plan,
    status: 'active',
    source: 'web',
    productId,
    expiresAt,
  });
}

export async function getUsageRecord(userId: string, isGuest: boolean = false): Promise<UsageRecord> {
  return getTodayUsageRecord(userId, isGuest);
}

export async function reserveQuota(userId: string, isGuest: boolean = false) {
  return atomicallyReserveGeneration(userId, isGuest);
}

export async function finishGeneration(userId: string, isSuccess: boolean, characters: number = 0) {
  return recordGenerationResult(userId, isSuccess, characters);
}

