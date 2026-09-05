/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mock of react-native for Web/Vite environments.
 */
export const Platform = {
  OS: 'web',
  select: (obj: any) => obj.web || obj.default,
};

export default {
  Platform,
};
