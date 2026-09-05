/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Privacy Policy
 */
import React from 'react';
import { SeoHead } from '../components/SeoHead';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="space-y-12 py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-zinc-300">
      <SeoHead
        title="Privacy Policy | AudioFACTORY"
        description="AudioFACTORY Privacy Policy. Learn how we collect, protect, and isolate your audio projects, voice samples, and personal data."
        canonicalPath="/privacy"
      />

      <div className="space-y-3 text-center sm:text-left border-b border-white/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Privacy & Data Protection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-zinc-500 font-mono">Last updated: September 5, 2026</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
          <p>
            When you use AudioFACTORY, we collect information you provide directly to us:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li><strong>Account Data:</strong> Email address and authentication credentials managed securely via Firebase Authentication.</li>
            <li><strong>Project Content:</strong> Scripts, dialogue lines, voice assignments, and generated audio assets you create within the studio.</li>
            <li><strong>Voice Reference Audio:</strong> Short audio samples you upload solely to extract acoustic timbres for instant voice cloning.</li>
            <li><strong>Usage & Telemetry:</strong> Anonymized performance logs, synthesis latency, and crash diagnostics to maintain service reliability.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">2. Voice Data Isolation & Ownership</h2>
          <p>
            Your scripts and cloned voice profiles are strictly your private intellectual property. We do <strong>not</strong> sell your voice samples or user-generated scripts to third-party data brokers, nor do we use your private audio to train public foundational AI models without your explicit consent.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">3. How We Process Audio</h2>
          <p>
            Audio synthesis is processed securely through server-side APIs utilizing Google Gemini 2.5 Flash and ElevenLabs neural rendering engines. All communications between your client device and our servers are encrypted in transit using industry-standard TLS 1.3 encryption.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">4. Data Storage & Security</h2>
          <p>
            Persistent audio projects are stored in Google Cloud Firestore with granular user-level security rules preventing unauthorized read or write access. Uncompressed WAV files and stems are cached temporarily in local browser storage or secure cloud buckets.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">5. Your Privacy Rights (GDPR & CCPA)</h2>
          <p>
            You have the right to access, export, or permanently delete your account and all associated project data at any time. To exercise your right to erasure, visit our dedicated <a href="/account-deletion" className="text-amber-400 underline">Account Deletion</a> page.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">6. Contact Us</h2>
          <p>
            If you have questions regarding this Privacy Policy, please contact our Data Protection Officer at <strong>privacy@audiofactory.app</strong> or via our <a href="/contact" className="text-amber-400 underline">Contact Page</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
