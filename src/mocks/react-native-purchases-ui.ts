/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mock of react-native-purchases-ui for Web/Vite environments.
 */

export enum PAYWALL_RESULT {
  NOT_PRESENTED = 'NOT_PRESENTED',
  ERROR = 'ERROR',
  CANCELLED = 'CANCELLED',
  PURCHASED = 'PURCHASED',
  RESTORED = 'RESTORED',
}

export const RevenueCatUI = {
  presentPaywall: async (): Promise<PAYWALL_RESULT> => {
    console.log('[RevenueCatUI Web Mock] presentPaywall - Simulated purchase success!');
    return PAYWALL_RESULT.PURCHASED;
  },
};

export default RevenueCatUI;
