/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY RevenueCat React Native Purchases Service Layer
 */
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

/**
 * Checks if RevenueCat is supported natively on the current platform.
 */
export function isRevenueCatSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/**
 * Initializes the RevenueCat SDK with the provided or default API keys.
 */
export function initializeRevenueCat(): void {
  if (!isRevenueCatSupported()) {
    console.log('[RevenueCat] Running on Web / non-native environment. Initialization bypassed.');
    return;
  }

  try {
    // Enable verbose logging in development or staging
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    // Platform-specific API keys
    const iosApiKey = 'test_HOkEFtSbsBzhrNAKOUagjqugpFm';
    const androidApiKey = 'test_HOkEFtSbsBzhrNAKOUagjqugpFm';

    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: iosApiKey });
      console.log('[RevenueCat] Successfully configured SDK for iOS.');
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: androidApiKey });
      console.log('[RevenueCat] Successfully configured SDK for Android.');
    }
  } catch (error) {
    console.error('[RevenueCat] Failed to configure Purchases SDK:', error);
  }
}

/**
 * Checks if the user has an active pro entitlement ('swayam_gpt_pro').
 * Fallbacks cleanly to mock entitlement verification on web to keep preview stable.
 */
export async function checkProEntitlement(): Promise<boolean> {
  if (!isRevenueCatSupported()) {
    console.log('[RevenueCat] Running on Web. Bypassing check and returning sandbox entitlement.');
    return true;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    if (typeof customerInfo.entitlements.active['swayam_gpt_pro'] !== 'undefined') {
      console.log('[RevenueCat] Entitlement active: swayam_gpt_pro is active!');
      return true;
    }
    console.log('[RevenueCat] Entitlement inactive: swayam_gpt_pro not found.');
    return false;
  } catch (e) {
    console.error('[RevenueCat] Error fetching customer info from RevenueCat:', e);
    return false;
  }
}

/**
 * Launches the RevenueCat UI Paywall flow.
 * Returns true if purchase or restore was successful, false otherwise.
 */
export async function presentRevenueCatPaywall(): Promise<boolean> {
  if (!isRevenueCatSupported()) {
    console.log('[RevenueCat] Web simulator: Paywall purchase completed successfully.');
    return true;
  }

  try {
    const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();

    switch (paywallResult) {
      case PAYWALL_RESULT.NOT_PRESENTED:
        console.warn('[RevenueCat] Paywall was not presented.');
        return false;
      case PAYWALL_RESULT.ERROR:
        console.error('[RevenueCat] Paywall presentation error.');
        return false;
      case PAYWALL_RESULT.CANCELLED:
        console.log('[RevenueCat] Paywall presentation cancelled by user.');
        return false;
      case PAYWALL_RESULT.PURCHASED:
        console.log('[RevenueCat] Package purchased successfully via RevenueCat Paywall!');
        return true;
      case PAYWALL_RESULT.RESTORED:
        console.log('[RevenueCat] Purchases restored successfully via RevenueCat Paywall!');
        return true;
      default:
        return false;
    }
  } catch (error) {
    console.error('[RevenueCat] Fatal error displaying RevenueCat Paywall:', error);
    return false;
  }
}
