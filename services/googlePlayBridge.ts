/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Native Capacitor Google Play Billing Bridge Interface
 */
import { registerPlugin, Capacitor } from '@capacitor/core';
import { ProductIdentifier, PRODUCT_IDS } from '../shared/types';

export interface NativePlayProduct {
  productId: string;
  title: string;
  description: string;
  productType: 'subs' | 'inapp';
  formattedPrice?: string;
  priceAmountMicros?: number;
  priceCurrencyCode?: string;
  offerToken?: string;
}

export interface NativePlayPurchase {
  orderId: string;
  purchaseToken: string;
  purchaseTime: number;
  purchaseState: number;
  isAcknowledged: boolean;
  isAutoRenewing: boolean;
  packageName: string;
  productId?: string;
  products: string[];
}

export interface GooglePlayBillingPluginInterface {
  initializeBilling(): Promise<{ connected: boolean }>;
  queryProductDetails(): Promise<{ products: NativePlayProduct[] }>;
  launchPurchaseFlow(options: { 
    productId: string; 
    obfuscatedAccountId?: string;
  }): Promise<{ success: boolean; purchases?: NativePlayPurchase[] }>;
  restorePurchases(): Promise<{ success: boolean; purchases: NativePlayPurchase[] }>;
  acknowledgePurchase(options: { purchaseToken: string }): Promise<{ acknowledged: boolean }>;
}

export const NativeGooglePlayBilling = registerPlugin<GooglePlayBillingPluginInterface>('GooglePlayBilling');

export function isAndroidNative(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

/**
 * Executes native purchase flow through Google Play Billing client
 */
export async function executeNativePlayPurchase(
  productId: ProductIdentifier | string,
  userId?: string
): Promise<{ orderId: string; purchaseToken: string; productId: string } | null> {
  if (!isAndroidNative()) {
    return null;
  }

  try {
    const result = await NativeGooglePlayBilling.launchPurchaseFlow({
      productId,
      obfuscatedAccountId: userId || undefined,
    });

    if (result.success && result.purchases && result.purchases.length > 0) {
      const p = result.purchases[0];
      return {
        orderId: p.orderId,
        purchaseToken: p.purchaseToken,
        productId: p.productId || productId,
      };
    }
  } catch (err: any) {
    console.error('[PLAY_BILLING_NATIVE] Error launching purchase flow:', err);
    throw err;
  }

  return null;
}

/**
 * Restores purchases from native Android cache and Play services
 */
export async function getNativeRestoredPurchases(): Promise<NativePlayPurchase[]> {
  if (!isAndroidNative()) {
    return [];
  }

  try {
    const res = await NativeGooglePlayBilling.restorePurchases();
    return res.purchases || [];
  } catch (err) {
    console.warn('[PLAY_BILLING_NATIVE] Error querying restored purchases:', err);
    return [];
  }
}
