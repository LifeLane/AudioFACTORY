/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY React useAds Hook
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AdManager } from './AdManager';
import { AdType } from './AdProvider';
import { useEntitlement } from '../hooks/useEntitlement';

export function useAds() {
  const location = useLocation();
  const { plan } = useEntitlement();
  const adManager = AdManager.getInstance();

  useEffect(() => {
    // Automatically trigger vignette or onclick ad check on page navigation
    const triggerPageNavigationAd = () => {
      // Small delay on load to allow rendering, then request Monetag
      setTimeout(async () => {
        const check = adManager.evaluateAdEligibility(location.pathname);
        if (check.eligible) {
          // Vignette is appropriate for page-level navigation
          await adManager.requestAd('VIGNETTE', location.pathname);
        }
      }, 1000);
    };

    triggerPageNavigationAd();
  }, [location.pathname, plan]); // Trigger on route transitions or plan updates

  const triggerAd = async (type: AdType): Promise<boolean> => {
    return await adManager.requestAd(type, location.pathname);
  };

  const suppressAds = (reason: string) => {
    adManager.suppressAds(reason);
  };

  const resumeAds = (reason: string) => {
    adManager.resumeAds(reason);
  };

  return {
    triggerAd,
    suppressAds,
    resumeAds,
    eligibility: adManager.evaluateAdEligibility(location.pathname)
  };
}
