/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Monetization Central Configuration
 */

const isDev = import.meta.env.DEV;

// 1. Core switches
export const ADS_ENABLED = isDev
  ? (import.meta.env.VITE_ADS_ENABLED === 'true') // Always false in dev unless explicitly forced to true
  : (import.meta.env.VITE_ADS_ENABLED !== 'false'); // Always true in prod unless explicitly disabled

export const MONETAG_ENABLED = import.meta.env.VITE_MONETAG_ENABLED !== 'false';

// 2. Monetag Zones (from dashboard config source of truth)
export const MONETAG_ZONE_PRIMARY = import.meta.env.VITE_MONETAG_ZONE_PRIMARY || '11735060';
export const MONETAG_ZONE_SECONDARY = import.meta.env.VITE_MONETAG_ZONE_SECONDARY || '11735061';
export const MONETAG_ZONE_VIGNETTE = import.meta.env.VITE_MONETAG_ZONE_VIGNETTE || '11735062';

// 3. Subscription/Plan Entitlement Rules
export const ADS_SHOW_GUEST = import.meta.env.VITE_ADS_SHOW_GUEST !== 'false'; // guest gets ads
export const ADS_SHOW_FREE = import.meta.env.VITE_ADS_SHOW_FREE !== 'false'; // free authenticated gets ads
export const ADS_SHOW_PRO = import.meta.env.VITE_ADS_SHOW_PRO === 'true'; // pro (monthly/annual) gets no ads by default
export const ADS_SHOW_LIFETIME = import.meta.env.VITE_ADS_SHOW_LIFETIME === 'true'; // lifetime gets no ads by default

// 4. Platform Rules
export const ADS_SHOW_WEB = import.meta.env.VITE_ADS_SHOW_WEB !== 'false'; // web browser gets ads
export const ADS_SHOW_ANDROID = import.meta.env.VITE_ADS_SHOW_ANDROID === 'true'; // native android gets no ads by default

// 5. Context / Target Area Rules
export const ADS_SHOW_MARKETING = import.meta.env.VITE_ADS_SHOW_MARKETING === 'true'; // marketing gets no ads by default
export const ADS_SHOW_STUDIO = import.meta.env.VITE_ADS_SHOW_STUDIO !== 'false'; // studio workspace gets ads

// 6. Frequency and Cooldown rules
export const ADS_COOLDOWN_SECONDS = Number(import.meta.env.VITE_ADS_COOLDOWN_SECONDS || '180');
export const ADS_MIN_SESSION_SECONDS = Number(import.meta.env.VITE_ADS_MIN_SESSION_SECONDS || '10');

// 7. Route Whitelists & Whitelist Whackers
export const ALLOWED_AD_ROUTES = [
  '/app',
  '/app/studio',
  '/app/projects',
  '/app/account',
  '/app/billing'
];

export const FORBIDDEN_AD_ROUTES = [
  '/app/checkout',
  '/app/purchase-confirmation',
  '/app/account-deletion',
  '/privacy',
  '/terms',
  '/refund-policy'
];
