/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY AdManager Subsystem
 */

import { AdType } from './AdProvider';
import { MonetagLoader } from './MonetagLoader';
import { useEntitlementStore } from '../store/useEntitlementStore';
import { Capacitor } from '@capacitor/core';
import {
  ADS_ENABLED,
  MONETAG_ENABLED,
  MONETAG_ZONE_PRIMARY,
  MONETAG_ZONE_SECONDARY,
  MONETAG_ZONE_VIGNETTE,
  ADS_SHOW_GUEST,
  ADS_SHOW_FREE,
  ADS_SHOW_PRO,
  ADS_SHOW_LIFETIME,
  ADS_SHOW_WEB,
  ADS_SHOW_ANDROID,
  ADS_SHOW_MARKETING,
  ADS_SHOW_STUDIO,
  ADS_COOLDOWN_SECONDS,
  ADS_MIN_SESSION_SECONDS,
  FORBIDDEN_AD_ROUTES,
  ALLOWED_AD_ROUTES
} from './adConfig';

export class AdManager {
  private static instance: AdManager | null = null;
  private activeSuppressionReasons = new Set<string>();
  private sessionStartTime: number;

  private constructor() {
    this.sessionStartTime = Date.now();
    this.setupDebugInterface();
  }

  public static getInstance(): AdManager {
    if (!this.instance) {
      this.instance = new AdManager();
    }
    return this.instance;
  }

  /**
   * Evaluates if ads are currently permitted based on all strict business policy layers
   */
  public evaluateAdEligibility(currentRoute: string): { eligible: boolean; reason?: string } {
    if (!ADS_ENABLED) {
      return { eligible: false, reason: 'ADS_ENABLED is false' };
    }

    // 1. Session age threshold (Frequency Control)
    const sessionSeconds = (Date.now() - this.sessionStartTime) / 1000;
    if (sessionSeconds < ADS_MIN_SESSION_SECONDS) {
      return { eligible: false, reason: 'Session age below minimum threshold' };
    }

    // 2. Active generation or flow suppressions
    if (this.activeSuppressionReasons.size > 0) {
      return { 
        eligible: false, 
        reason: `Suppressed by active tasks: ${Array.from(this.activeSuppressionReasons).join(', ')}` 
      };
    }

    // 3. Platform policy rules (using Capacitor for native and web differentiation)
    let platform = 'web';
    try {
      if (Capacitor.isNativePlatform()) {
        platform = Capacitor.getPlatform();
      }
    } catch {
      // Fallback if Capacitor module is not loaded/initialized
    }

    if (platform === 'android') {
      if (!ADS_SHOW_ANDROID) {
        return { eligible: false, reason: 'Ads disabled on native Android platform' };
      }
    } else {
      if (!ADS_SHOW_WEB) {
        return { eligible: false, reason: 'Ads disabled on Web platform' };
      }
    }

    // 4. Entitlement and subscription policy rules
    let plan = 'guest';
    try {
      plan = useEntitlementStore.getState().entitlement.plan || 'guest';
    } catch (e) {
      console.warn('[AdManager] Entitlement store state read failed, defaulting to guest:', e);
    }

    if (plan === 'guest' && !ADS_SHOW_GUEST) {
      return { eligible: false, reason: 'Ads disabled for guest user plan' };
    }
    if (plan === 'free' && !ADS_SHOW_FREE) {
      return { eligible: false, reason: 'Ads disabled for free user plan' };
    }
    if ((plan === 'pro_monthly' || plan === 'pro_annual') && !ADS_SHOW_PRO) {
      return { eligible: false, reason: 'Ads disabled for Pro subscribers' };
    }
    if (plan === 'lifetime' && !ADS_SHOW_LIFETIME) {
      return { eligible: false, reason: 'Ads disabled for Lifetime pass users' };
    }

    // 5. Route authorization check
    const cleanRoute = currentRoute.split('?')[0].split('#')[0];
    if (FORBIDDEN_AD_ROUTES.some(r => cleanRoute === r || cleanRoute.startsWith(r))) {
      return { eligible: false, reason: `Ad forbidden on route: ${cleanRoute}` };
    }

    const isMarketing = !cleanRoute.startsWith('/app');
    if (isMarketing && !ADS_SHOW_MARKETING) {
      return { eligible: false, reason: `Ads disabled on marketing page: ${cleanRoute}` };
    }
    if (cleanRoute.startsWith('/app') && !ADS_SHOW_STUDIO) {
      return { eligible: false, reason: 'Ads disabled across studio application' };
    }
    if (cleanRoute.startsWith('/app') && !ALLOWED_AD_ROUTES.some(r => cleanRoute === r || cleanRoute.startsWith(r))) {
      return { eligible: false, reason: `Ad route not in whitelist: ${cleanRoute}` };
    }

    // 6. Session-level cooldown check
    const lastAdTime = sessionStorage.getItem('g_last_ad_time');
    if (lastAdTime) {
      const elapsedSeconds = (Date.now() - Number(lastAdTime)) / 1000;
      if (elapsedSeconds < ADS_COOLDOWN_SECONDS) {
        return { 
          eligible: false, 
          reason: `Ad is on cooldown. Remaining: ${Math.round(ADS_COOLDOWN_SECONDS - elapsedSeconds)}s` 
        };
      }
    }

    return { eligible: true };
  }

  /**
   * Requests an ad injection with frequency limits and loaded zone trackers
   */
  public async requestAd(type: AdType, currentRoute: string): Promise<boolean> {
    const check = this.evaluateAdEligibility(currentRoute);
    if (!check.eligible) {
      console.log(`[AdManager] Ad request rejected. Reason: ${check.reason}`);
      return false;
    }

    if (!MONETAG_ENABLED) {
      return false;
    }

    // Pick Monetag zone based on formatting requests
    let zoneId = MONETAG_ZONE_PRIMARY;
    if (type === 'VIGNETTE') {
      zoneId = MONETAG_ZONE_VIGNETTE;
    } else if (type === 'ONCLICK') {
      zoneId = MONETAG_ZONE_SECONDARY;
    }

    console.log(`[AdManager] Eligibility passed. Loading Monetag Zone ${zoneId} (${type}) on route ${currentRoute}`);
    
    // Inject and trigger script loading
    const success = await MonetagLoader.loadZone(zoneId, type);
    if (success) {
      sessionStorage.setItem('g_last_ad_time', String(Date.now()));
    }
    return success;
  }

  /**
   * Programmatic ad suppressions (e.g., active synthesis blocks, downloads, checkouts)
   */
  public suppressAds(reason: string): void {
    this.activeSuppressionReasons.add(reason);
    console.log(`[AdManager] Ads suppressed for: ${reason}. Active suppressions: ${Array.from(this.activeSuppressionReasons).join(', ')}`);
  }

  public resumeAds(reason: string): void {
    this.activeSuppressionReasons.delete(reason);
    console.log(`[AdManager] Ad suppression resumed for: ${reason}. Remaining suppressions: ${Array.from(this.activeSuppressionReasons).join(', ')}`);
  }

  /**
   * Diagnostic window interface for local and environment debugging
   */
  private setupDebugInterface(): void {
    if (typeof window !== 'undefined') {
      (window as any).__AUDIOFACTORY_AD_DEBUG__ = {
        getDiagnostic: () => {
          let platform = 'web';
          let plan = 'guest';
          try {
            if (Capacitor.isNativePlatform()) {
              platform = Capacitor.getPlatform();
            }
          } catch {}
          try {
            plan = useEntitlementStore.getState().entitlement.plan || 'guest';
          } catch {}

          const currentPath = window.location.pathname;
          const check = this.evaluateAdEligibility(currentPath);
          const lastAdTime = sessionStorage.getItem('g_last_ad_time');
          const lastAdTimeFormatted = lastAdTime ? new Date(Number(lastAdTime)).toISOString() : 'Never';

          return {
            enabled: ADS_ENABLED && MONETAG_ENABLED,
            provider: 'Monetag',
            platform,
            plan,
            currentRoute: currentPath,
            activeSuppressions: Array.from(this.activeSuppressionReasons),
            sessionSeconds: Math.round((Date.now() - this.sessionStartTime) / 1000),
            lastAdTime: lastAdTimeFormatted,
            cooldownSeconds: ADS_COOLDOWN_SECONDS,
            loadedZones: MonetagLoader.getLoadedZones(),
            status: check.eligible ? 'Eligible for new ads' : `Blocked: ${check.reason}`
          };
        }
      };
    }
  }
}
