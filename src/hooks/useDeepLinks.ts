/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Capacitor Deep Links & Native Lifecycle Hook
 */
import { useEffect } from 'react';
import { App as CapacitorApp, URLOpenListenerEvent } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { useEntitlementStore } from '../store/useEntitlementStore';

interface DeepLinkOptions {
  onOpenProjects?: () => void;
  onOpenCloning?: () => void;
  onSetMode?: (mode: 'intro' | 'multispeaker' | 'suite') => void;
}

export function useDeepLinks(options?: DeepLinkOptions) {
  const { setUpgradeModalOpen } = useEntitlementStore();

  useEffect(() => {
    // 1. Configure Native Android System Bars & Splash Screen
    if (Capacitor.isNativePlatform()) {
      try {
        StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
        StatusBar.setBackgroundColor({ color: '#0A0A0A' }).catch(() => {});
        SplashScreen.hide({ fadeOutDuration: 400 }).catch(() => {});
      } catch (e) {
        console.warn('Native UI initialization notice:', e);
      }
    }

    // 2. Register Deep Link and App Link Listener
    let appUrlListener: any = null;

    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
        const urlStr = event.url;
        console.log('[DEEP_LINK] Received URL event:', urlStr);

        try {
          // Parse url
          const url = new URL(urlStr);
          const host = url.host.toLowerCase();
          const pathname = url.pathname.toLowerCase();

          // Handle audiofactory:// scheme or https:// host
          if (urlStr.startsWith('audiofactory://billing') || pathname.includes('billing') || pathname.includes('pricing') || pathname.includes('upgrade')) {
            setUpgradeModalOpen(true);
          } else if (urlStr.startsWith('audiofactory://projects') || pathname.includes('projects') || pathname.includes('cloud')) {
            options?.onOpenProjects?.();
          } else if (urlStr.startsWith('audiofactory://clone') || pathname.includes('clone')) {
            options?.onOpenCloning?.();
          } else if (urlStr.startsWith('audiofactory://multispeaker') || pathname.includes('multispeaker')) {
            options?.onSetMode?.('multispeaker');
          } else if (urlStr.startsWith('audiofactory://suite') || pathname.includes('suite')) {
            options?.onSetMode?.('suite');
          } else if (urlStr.startsWith('audiofactory://intro') || pathname.includes('intro') || pathname.includes('monologue')) {
            options?.onSetMode?.('intro');
          }
        } catch (err) {
          // Fallback simple string matcher
          if (urlStr.includes('billing') || urlStr.includes('upgrade') || urlStr.includes('pricing')) {
            setUpgradeModalOpen(true);
          }
        }
      }).then((handle) => {
        appUrlListener = handle;
      });
    }

    return () => {
      if (appUrlListener && typeof appUrlListener.remove === 'function') {
        appUrlListener.remove();
      }
    };
  }, [options, setUpgradeModalOpen]);
}
