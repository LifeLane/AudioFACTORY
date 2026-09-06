/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Enterprise Shared Domain Types
 */

export type UserPlan = 'guest' | 'free' | 'pro_monthly' | 'pro_annual' | 'lifetime';

export type SubscriptionLifecycleStatus = 
  | 'active'
  | 'cancelled'
  | 'expired'
  | 'paused'
  | 'grace_period'
  | 'account_hold'
  | 'revoked'
  | 'refunded';

export type EntitlementSource = 'google_play' | 'web' | 'admin' | 'system';

export const PRODUCT_IDS = {
  PRO_MONTHLY: 'audiofactory_pro_monthly',
  PRO_ANNUAL: 'audiofactory_pro_annual',
  LIFETIME: 'audiofactory_lifetime',
} as const;

export type ProductIdentifier = typeof PRODUCT_IDS[keyof typeof PRODUCT_IDS];

export interface FeatureEntitlement {
  unlimitedGenerations: boolean;
  elevenLabsAccess: boolean;
  instantVoiceCloning: boolean;
  bgmSoundtrackGeneration: boolean;
  multiSpeakerStudio: boolean;
  losslessWavExport: boolean;
  liveCollaboration: boolean;
  maxDialogueLines: number;
  concurrencyLimit: number;
}

export interface PlanConfig {
  id: UserPlan;
  name: string;
  badge: string;
  description: string;
  dailyGenerations: number; // -1 represents unlimited
  priceUsd: number;
  interval?: 'day' | 'month' | 'year' | 'lifetime';
  productType: 'free' | 'subs' | 'inapp';
  productId?: ProductIdentifier | string;
  features: FeatureEntitlement;
  highlight?: boolean;
}

export interface Entitlement {
  plan: UserPlan;
  status: SubscriptionLifecycleStatus;
  isActive: boolean;
  source: EntitlementSource;
  expiresAt: string | null;
  startedAt?: string | null;
  autoRenewing?: boolean;
  dailyQuota: number;
  remainingQuota: number;
  features: FeatureEntitlement;
  productId?: string | null;
  orderId?: string | null;
  purchaseTokenHash?: string | null;
  updatedAt?: string | null;
}

export interface UsageRecord {
  userId: string;
  date: string; // YYYY-MM-DD (UTC)
  generationCount: number;
  successfulGenerations?: number;
  failedGenerations?: number;
  lastGeneratedAt: string;
  characterCount: number;
}

export interface PurchaseRecord {
  id: string;
  purchaseId?: string;
  userId: string;
  uid?: string;
  productId: ProductIdentifier | string;
  productType?: 'subs' | 'inapp';
  planId?: UserPlan | string;
  purchaseToken?: string;
  purchaseTokenHash?: string;
  platform: 'google_play' | 'web' | 'stripe';
  status: SubscriptionLifecycleStatus;
  orderId?: string | null;
  purchasedAt: string;
  purchaseTime?: string;
  expiresAt?: string | null;
  expirationTime?: string | null;
  autoRenewing?: boolean;
  priceCurrencyCode?: string | null;
  priceAmountMicros?: number | null;
  priceUsd?: number | null;
  rawVerification?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  plan: UserPlan;
  status: SubscriptionLifecycleStatus;
  productId?: string | null;
  renewsAt?: string | null;
  expiresAt?: string | null;
  isLifetime: boolean;
  autoRenewing: boolean;
  source: EntitlementSource;
}

// Existing Studio Domain Types
export interface IntroStyle {
  id: string;
  name: string;
  description: string;
  defaultVoice: string;
  templateText: string;
  color: 'red' | 'blue' | 'yellow' | 'white' | 'green' | 'black';
  icon: 'circle' | 'square' | 'triangle' | 'half-circle' | 'rect' | 'plus';
  avatarSrc?: string;
  audioSrc?: string;
  category?: string;
  languages?: string[];
  useCases?: string[];
  tags?: string[];
  systemPrompt?: string;
}

export interface Voice {
  id: string;
  name: string;
  gender: string;
  languageCode: string;
  languageName: string;
  provider?: 'gemini' | 'elevenlabs';
}

export interface VoiceOption {
  name: string;
  ssmlGender: string;
}

export interface SceneSpeaker {
  name: string;
  voice: string;
  provider: 'gemini' | 'elevenlabs';
  gender?: string;
  color?: string;
}

export interface DialogueLine {
  id: string;
  speaker: string;
  text: string;
  scene?: string;
  emotion?: string;
  audioBuffer?: AudioBuffer | null;
  audioUrl?: string | null;
  status: 'idle' | 'generating' | 'ready' | 'error';
  errorMessage?: string;
}

export interface ScriptAnalysisResult {
  title?: string;
  summary?: string;
  speakers: SceneSpeaker[];
  lines: DialogueLine[];
}

export interface SavedAudioProject {
  id: string;
  title: string;
  summary?: string;
  format?: string;
  style?: string;
  speakerCount?: number;
  speakers: SceneSpeaker[];
  lines: {
    id: string;
    speaker: string;
    text: string;
    scene?: string;
    emotion?: string;
  }[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedMonologue {
  id: string;
  title: string;
  styleId?: string;
  voice?: string;
  text: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectInput = Omit<SavedAudioProject, 'createdAt' | 'updatedAt' | 'userId' | 'id'> & { 
  id?: string;
  createdAt?: string;
};

export type MonologueInput = Omit<SavedMonologue, 'createdAt' | 'updatedAt' | 'userId' | 'id'> & { 
  id?: string;
  createdAt?: string;
};
