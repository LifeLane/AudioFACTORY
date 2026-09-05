/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mock of react-native-purchases for Web/Vite environments.
 */

export enum LOG_LEVEL {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  VERBOSE = 'VERBOSE',
}

export const Purchases = {
  setLogLevel: (level: LOG_LEVEL) => {
    console.log('[Purchases Web Mock] setLogLevel:', level);
  },
  configure: (config: { apiKey: string }) => {
    console.log('[Purchases Web Mock] configure:', config);
  },
  getCustomerInfo: async () => {
    console.log('[Purchases Web Mock] getCustomerInfo');
    return {
      entitlements: {
        active: {
          'swayam_gpt_pro': {
            identifier: 'swayam_gpt_pro',
            isActive: true,
          },
        },
      },
    };
  },
};

export default Purchases;
