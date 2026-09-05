/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Terms of Service
 */
import React from 'react';
import { SeoHead } from '../components/SeoHead';
import { FileText, ShieldCheck } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="space-y-12 py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-zinc-300">
      <SeoHead
        title="Terms of Service | AudioFACTORY"
        description="AudioFACTORY Terms of Service. Understand acceptable use, commercial rights, intellectual property, and billing policies."
        canonicalPath="/terms"
      />

      <div className="space-y-3 text-center sm:text-left border-b border-white/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-zinc-500 font-mono">Last updated: September 5, 2026</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">1. Agreement to Terms</h2>
          <p>
            By accessing or using the AudioFACTORY web application, Android mobile app, or associated API services, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">2. Commercial Rights & Ownership</h2>
          <p>
            You retain 100% ownership of your original scripts, audio compositions, and finished exports produced via AudioFACTORY. AudioFACTORY grants you a perpetual, worldwide, royalty-free license to commercially monetize, broadcast, distribute, and perform all audio generated using your account across all platforms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">3. Acceptable Use Policy</h2>
          <p>
            You agree not to use AudioFACTORY for unlawful purposes, including but not limited to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>Generating non-consensual voice clones of individuals for fraudulent, defamatory, or impersonation purposes.</li>
            <li>Producing hate speech, violent incitement, or harassment material.</li>
            <li>Attempting to reverse-engineer, decompile, or bypass rate limits of the speech synthesis API.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">4. Subscriptions & Billing</h2>
          <p>
            Paid subscriptions (Pro Monthly, Pro Annual) renew automatically at the end of each billing cycle unless cancelled prior to the renewal date. Payments made via Google Play Billing are managed through your Google Play account settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">5. Limitation of Liability</h2>
          <p>
            AudioFACTORY is provided &ldquo;as is&rdquo; without warranties of any kind. In no event shall AudioFACTORY Inc. be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the service.
          </p>
        </section>
      </div>
    </div>
  );
};
