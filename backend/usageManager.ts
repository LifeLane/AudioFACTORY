/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Server-Authoritative Usage & Quota Engine
 * Manages atomic Firestore quota reservations, rate-limiting, and concurrency control.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  runTransaction, 
  getDoc, 
  setDoc,
  updateDoc,
  increment
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { UserPlan, UsageRecord, Entitlement } from '../shared/types';
import { PLANS } from '../shared/plans';
import { resolveEntitlement } from './services/entitlementResolver';

// Initialize server-side Firestore instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const serverDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// In-flight concurrency tracker per user
const activeConcurrentRequests = new Map<string, number>();

// In-memory rate limiting tracker (timestamp of last request)
const lastRequestTimestamps = new Map<string, number>();

export function getTodayUtcDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
}

export interface QuotaReservationResult {
  allowed: boolean;
  reservationId: string;
  generationCount: number;
  dailyQuota: number;
  remainingQuota: number;
  plan: UserPlan;
  reason?: string;
  statusCode?: number;
}

/**
 * Validate incoming generation request for size and safety limits
 */
export function validateGenerationPayload(options: {
  text?: string;
  linesCount?: number;
  durationSeconds?: number;
  isGuest: boolean;
}): { valid: boolean; error?: string } {
  const { text, linesCount, durationSeconds, isGuest } = options;

  if (text !== undefined) {
    const maxChars = isGuest ? 4000 : 15000;
    if (text.length > maxChars) {
      return { 
        valid: false, 
        error: `Text length (${text.length} characters) exceeds the maximum allowed limit of ${maxChars} characters for your plan.` 
      };
    }
    if (text.trim().length === 0) {
      return { valid: false, error: 'Text content cannot be empty.' };
    }
  }

  if (linesCount !== undefined) {
    const maxLines = isGuest ? 8 : 100;
    if (linesCount > maxLines) {
      return { 
        valid: false, 
        error: `Dialogue line count (${linesCount}) exceeds maximum allowed limit of ${maxLines} for your plan.` 
      };
    }
  }

  if (durationSeconds !== undefined && durationSeconds > 60) {
    return { valid: false, error: 'Audio duration cannot exceed 60 seconds per synthesis block.' };
  }

  return { valid: true };
}

/**
 * Acquire concurrency lock and check request frequency
 */
export function acquireConcurrencySlot(userId: string, isGuest: boolean): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const lastTime = lastRequestTimestamps.get(userId) || 0;
  
  // Rate limit: minimum 250ms between generation triggers
  if (now - lastTime < 250) {
    return { 
      allowed: false, 
      reason: 'Generation requests are arriving too quickly. Please wait a moment before trying again.' 
    };
  }
  lastRequestTimestamps.set(userId, now);

  const currentConcurrent = activeConcurrentRequests.get(userId) || 0;
  const maxConcurrent = isGuest ? 1 : 4;

  if (currentConcurrent >= maxConcurrent) {
    return { 
      allowed: false, 
      reason: `A generation is already in progress for this session. Please wait for it to complete.` 
    };
  }

  activeConcurrentRequests.set(userId, currentConcurrent + 1);
  return { allowed: true };
}

export function releaseConcurrencySlot(userId: string) {
  const current = activeConcurrentRequests.get(userId) || 1;
  const next = Math.max(0, current - 1);
  if (next === 0) {
    activeConcurrentRequests.delete(userId);
  } else {
    activeConcurrentRequests.set(userId, next);
  }
}

/**
 * Read today's usage record from Firestore
 */
export async function getTodayUsageRecord(userId: string, isGuest: boolean): Promise<UsageRecord> {
  const date = getTodayUtcDateString();
  const usageRef = doc(serverDb, 'users', userId, 'usage', date);

  try {
    const snap = await getDoc(usageRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        userId,
        date,
        generationCount: Number(data.generationCount || 0),
        characterCount: Number(data.characterCount || 0),
        lastGeneratedAt: data.updatedAt || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn(`[USAGE] Failed to fetch Firestore usage for ${userId}, generating zero-state:`, err);
  }

  return {
    userId,
    date,
    generationCount: 0,
    characterCount: 0,
    lastGeneratedAt: new Date().toISOString(),
  };
}

/**
 * Atomically reserve a generation slot using Firestore transaction.
 * Authoritative plan and lifecycle status resolved via single resolveEntitlement resolver.
 * Structure: users/{uid}/usage/{YYYY-MM-DD}
 */
export async function atomicallyReserveGeneration(
  userId: string,
  isGuest: boolean
): Promise<QuotaReservationResult> {
  const date = getTodayUtcDateString();
  const entitlement = await resolveEntitlement(userId, isGuest);
  const plan = entitlement.plan;
  const planConfig = PLANS[plan] || PLANS.guest;
  const isUnlimited = entitlement.dailyQuota === -1;
  const dailyQuota = entitlement.dailyQuota;
  const reservationId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const usageRef = doc(serverDb, 'users', userId, 'usage', date);

  try {
    const result = await runTransaction(serverDb, async (transaction) => {
      const usageDoc = await transaction.get(usageRef);
      let currentCount = 0;
      let successCount = 0;
      let failCount = 0;
      let charCount = 0;

      if (usageDoc.exists()) {
        const data = usageDoc.data();
        currentCount = Number(data.generationCount || 0);
        successCount = Number(data.successfulGenerations || 0);
        failCount = Number(data.failedGenerations || 0);
        charCount = Number(data.characterCount || 0);
      }

      // Check quota exhaustion
      if (!isUnlimited && currentCount >= dailyQuota) {
        return {
          allowed: false,
          reservationId,
          generationCount: currentCount,
          dailyQuota,
          remainingQuota: 0,
          plan,
          reason: `Daily generation limit of ${dailyQuota} reached for ${planConfig.name}. Please upgrade to Pro for unlimited generations or try again tomorrow after UTC midnight.`,
          statusCode: 429,
        };
      }

      // Atomically increment reserved generation slot
      const nextCount = currentCount + 1;
      const nowIso = new Date().toISOString();

      transaction.set(
        usageRef,
        {
          date,
          generationCount: nextCount,
          successfulGenerations: successCount,
          failedGenerations: failCount,
          characterCount: charCount,
          planId: plan,
          updatedAt: nowIso,
        },
        { merge: true }
      );

      const remaining = isUnlimited ? -1 : Math.max(0, dailyQuota - nextCount);

      return {
        allowed: true,
        reservationId,
        generationCount: nextCount,
        dailyQuota,
        remainingQuota: remaining,
        plan,
      };
    });

    return result;
  } catch (error: any) {
    console.error('[USAGE] Transaction reservation error in Firestore:', error);
    
    // In-memory fallback if Firestore transaction fails
    const fallbackUsage = await getTodayUsageRecord(userId, isGuest);
    if (!isUnlimited && fallbackUsage.generationCount >= dailyQuota) {
      return {
        allowed: false,
        reservationId,
        generationCount: fallbackUsage.generationCount,
        dailyQuota,
        remainingQuota: 0,
        plan,
        reason: `Daily generation limit of ${dailyQuota} reached for ${planConfig.name}.`,
        statusCode: 429,
      };
    }

    return {
      allowed: true,
      reservationId,
      generationCount: fallbackUsage.generationCount + 1,
      dailyQuota,
      remainingQuota: isUnlimited ? -1 : Math.max(0, dailyQuota - (fallbackUsage.generationCount + 1)),
      plan,
    };
  }
}

/**
 * Record generation completion (success or failure) in Firestore
 */
export async function recordGenerationResult(
  userId: string,
  isSuccess: boolean,
  charCount: number = 0
): Promise<void> {
  const date = getTodayUtcDateString();
  const usageRef = doc(serverDb, 'users', userId, 'usage', date);
  const nowIso = new Date().toISOString();

  try {
    await runTransaction(serverDb, async (transaction) => {
      const usageDoc = await transaction.get(usageRef);
      if (usageDoc.exists()) {
        const data = usageDoc.data();
        const currentSuccess = Number(data.successfulGenerations || 0);
        const currentFail = Number(data.failedGenerations || 0);
        const currentChar = Number(data.characterCount || 0);

        if (isSuccess) {
          transaction.update(usageRef, {
            successfulGenerations: currentSuccess + 1,
            characterCount: currentChar + charCount,
            updatedAt: nowIso,
          });
        } else {
          // If failed, record failure and refund the reserved slot so user isn't charged for errors
          const currentTotal = Number(data.generationCount || 1);
          transaction.update(usageRef, {
            generationCount: Math.max(0, currentTotal - 1),
            failedGenerations: currentFail + 1,
            updatedAt: nowIso,
          });
        }
      }
    });
  } catch (err) {
    console.warn(`[USAGE] Failed to record generation outcome for ${userId}:`, err);
  }
}
