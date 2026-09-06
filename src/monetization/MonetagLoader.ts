/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Monetag Script & Tag Loader
 */

import { AdType } from './AdProvider';

export class MonetagLoader {
  private static loadedZones = new Set<string>();

  /**
   * Loads a Monetag script safely with error boundaries
   */
  public static async loadZone(zoneId: string, type: AdType): Promise<boolean> {
    if (this.loadedZones.has(zoneId)) {
      console.log(`[MonetagLoader] Zone ${zoneId} is already loaded.`);
      return true;
    }

    const src = type === 'VIGNETTE' 
      ? 'https://n6wxm.com/vignette.min.js' 
      : 'https://nap5k.com/tag.min.js';

    try {
      return await new Promise<boolean>((resolve) => {
        // Prevent duplicate script elements in DOM
        const existingScript = Array.from(document.querySelectorAll('script')).find(
          script => script.dataset.zone === zoneId || (script.src === src && script.dataset.zone === zoneId)
        );

        if (existingScript) {
          console.warn(`[MonetagLoader] Script for zone ${zoneId} already exists in DOM.`);
          this.loadedZones.add(zoneId);
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.dataset.zone = zoneId;
        script.src = src;
        script.async = true;

        script.onload = () => {
          console.log(`[MonetagLoader] Successfully loaded zone ${zoneId} (${type})`);
          this.loadedZones.add(zoneId);
          resolve(true);
        };

        script.onerror = (err) => {
          console.error(`[MonetagLoader] Failed to load Monetag script for zone ${zoneId}. It might be blocked.`, err);
          resolve(false); // Non-blocking, continue normal application flow
        };

        // Fallback safety timeout (for slow connections or silent ad-blockers)
        setTimeout(() => {
          if (!this.loadedZones.has(zoneId)) {
            console.warn(`[MonetagLoader] Script loading timed out for zone ${zoneId}`);
            resolve(false);
          }
        }, 5000);

        const container = document.documentElement || document.body || document.head;
        if (container) {
          container.appendChild(script);
        } else {
          resolve(false);
        }
      });
    } catch (e) {
      console.error(`[MonetagLoader] Exception while loading zone ${zoneId}:`, e);
      return false;
    }
  }

  public static getLoadedZones(): string[] {
    return Array.from(this.loadedZones);
  }
}
