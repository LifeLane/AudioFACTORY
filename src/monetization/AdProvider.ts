/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY AdProvider Abstraction Interface
 */

export type AdType = 'VIGNETTE' | 'IN_PAGE_PUSH' | 'ONCLICK' | 'CUSTOM';

export interface AdProvider {
  id: string;
  name: string;
  initialize(): Promise<void>;
  showAd(type: AdType, zoneId?: string): Promise<boolean>;
  destroy(): void;
}
