/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Authoritative Billing & Entitlement Controller
 */
import { Request, Response } from 'express';
import { PLANS, getPlanFromProductId } from '../../shared/plans.js';
import { resolveEntitlement, saveUserEntitlement } from '../services/entitlementResolver.js';
import { GooglePlayService } from '../services/googlePlayService.js';
import { UserPlan, Entitlement, PurchaseRecord } from '../../shared/types.js';
import { extractUserFromRequest } from './aiController.js';
import { getTodayUsageRecord, serverDb } from '../usageManager.js';

export function handleGetPlans(_req: Request, res: Response): void {
  res.json({
    plans: PLANS,
  });
}

/**
 * Authoritative single entitlement endpoint
 */
export async function handleGetEntitlement(req: Request, res: Response): Promise<void> {
  const { userId, isGuest } = extractUserFromRequest(req);
  const entitlement = await resolveEntitlement(userId, isGuest);
  const usage = await getTodayUsageRecord(userId, isGuest);

  res.json({
    userId,
    isGuest,
    entitlement,
    usage,
  });
}

/**
 * Verify Google Play Purchase Token with strict server-side validation
 */
export async function handleVerifyPlayPurchase(req: Request, res: Response): Promise<void> {
  try {
    const { productId, purchaseToken, orderId, packageName } = req.body;
    if (!productId || !purchaseToken) {
      res.status(400).json({ error: 'Fields "productId" and "purchaseToken" are required.' });
      return;
    }

    const { userId, isGuest } = extractUserFromRequest(req);

    if (isGuest && (!userId || userId.startsWith('guest_'))) {
      res.status(401).json({ 
        error: 'Please sign in before purchasing so your subscription is permanently linked to your account.' 
      });
      return;
    }

    const result = await GooglePlayService.verifyPurchase({
      userId,
      productId,
      purchaseToken,
      orderId,
      packageName,
    });

    const usage = await getTodayUsageRecord(userId, isGuest);

    res.json({
      success: true,
      result,
      entitlement: result.entitlement,
      usage,
    });
  } catch (error: any) {
    console.error('[BILLING] Error verifying purchase:', error);
    res.status(400).json({ error: error.message || 'Failed to verify Google Play purchase' });
  }
}

/**
 * Restore previous Google Play purchases
 */
export async function handleRestorePurchases(req: Request, res: Response): Promise<void> {
  try {
    const { purchases } = req.body; // Array of { productId, purchaseToken, orderId }
    const { userId, isGuest } = extractUserFromRequest(req);

    if (!Array.isArray(purchases) || purchases.length === 0) {
      // If no purchases provided in request body, resolve current stored entitlement
      const entitlement = await resolveEntitlement(userId, isGuest);
      res.json({
        success: true,
        restored: entitlement.plan !== 'free' && entitlement.plan !== 'guest',
        entitlement,
        message: entitlement.plan !== 'free' ? `Active ${entitlement.plan} plan restored.` : 'No previous purchases found for this account.',
      });
      return;
    }

    let latestEntitlement: Entitlement | null = null;
    for (const item of purchases) {
      if (item.productId && item.purchaseToken) {
        try {
          const result = await GooglePlayService.verifyPurchase({
            userId,
            productId: item.productId,
            purchaseToken: item.purchaseToken,
            orderId: item.orderId,
          });
          latestEntitlement = result.entitlement;
        } catch (itemErr) {
          console.warn('[BILLING] Error restoring individual purchase:', itemErr);
        }
      }
    }

    const finalEntitlement = latestEntitlement || (await resolveEntitlement(userId, isGuest));
    res.json({
      success: true,
      restored: finalEntitlement.plan !== 'free' && finalEntitlement.plan !== 'guest',
      entitlement: finalEntitlement,
      message: 'Purchases restored successfully.',
    });
  } catch (error: any) {
    console.error('[BILLING] Error restoring purchases:', error);
    res.status(500).json({ error: error.message || 'Failed to restore purchases' });
  }
}

/**
 * Google Play Real-Time Developer Notifications (RTDN) Webhook
 */
export async function handleGooglePlayRtdnWebhook(req: Request, res: Response): Promise<void> {
  try {
    const result = await GooglePlayService.processRtdnNotification(req.body);
    res.status(200).json({ status: 'ok', handled: result.handled, reason: result.reason });
  } catch (error: any) {
    console.error('[BILLING RTDN WEBHOOK] Error:', error);
    // Google Cloud Pub/Sub expects 200/204 or retryable 500
    res.status(200).json({ status: 'error_logged', error: error.message });
  }
}

/**
 * Development & Web Sandbox Simulator
 */
export async function handleSimulatePurchase(req: Request, res: Response): Promise<void> {
  if (process.env.NODE_ENV === 'production' || process.env.VITE_APP_ENV === 'production') {
    res.status(403).json({ error: 'PURCHASE_SIMULATION_DISABLED_IN_PRODUCTION', message: 'Purchase simulation is disabled in production.' });
    return;
  }

  const { plan } = req.body;
  const validPlans: UserPlan[] = ['pro_monthly', 'pro_annual', 'lifetime', 'free', 'guest'];

  if (!plan || !validPlans.includes(plan)) {
    res.status(400).json({ error: `Invalid plan. Must be one of: ${validPlans.join(', ')}` });
    return;
  }

  const { userId, isGuest } = extractUserFromRequest(req);
  let expiresAt: string | null = null;
  const now = new Date();

  if (plan === 'pro_monthly') {
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    expiresAt = nextMonth.toISOString();
  } else if (plan === 'pro_annual') {
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    expiresAt = nextYear.toISOString();
  }

  const targetPlan = plan as UserPlan;
  const planConfig = PLANS[targetPlan];

  const entitlement = await saveUserEntitlement(userId, {
    planId: targetPlan,
    status: 'active',
    source: 'web',
    productId: (planConfig.productId as string) || null,
    startedAt: now.toISOString(),
    expiresAt,
    autoRenewing: planConfig.productType === 'subs',
    features: planConfig.features,
  });

  const usage = await getTodayUsageRecord(userId, isGuest);

  res.json({
    success: true,
    message: `Plan updated to ${planConfig.name} for user ${userId}`,
    entitlement,
    usage,
  });
}

/**
 * Fetch verified purchase history for authenticated user
 */
export async function handleGetPurchases(req: Request, res: Response): Promise<void> {
  try {
    const { userId, isGuest } = extractUserFromRequest(req);
    if (isGuest || !userId || userId.startsWith('guest_')) {
      res.json({ purchases: [] });
      return;
    }

    const purchasesRef = serverDb.collection('users').doc(userId).collection('purchases');
    const q = purchasesRef.orderBy('purchasedAt', 'desc').limit(50);
    const snapshot = await q.get();

    const purchases: PurchaseRecord[] = [];
    snapshot.forEach((docSnap) => {
      purchases.push(docSnap.data() as PurchaseRecord);
    });

    res.json({ purchases });
  } catch (error: any) {
    console.warn('[BILLING] Error fetching purchase history:', error);
    res.json({ purchases: [] });
  }
}

