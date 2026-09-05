/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Refund Policy
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="space-y-12 py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-zinc-300">
      <SeoHead
        title="Refund Policy | AudioFACTORY"
        description="AudioFACTORY 14-day refund policy, subscription cancellation guidelines, and Google Play refund instructions."
        canonicalPath="/refund-policy"
      />

      <div className="space-y-3 text-center sm:text-left border-b border-white/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Billing Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Refund Policy
        </h1>
        <p className="text-xs text-zinc-500 font-mono">Last updated: September 5, 2026</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">1. 14-Day Refund Guarantee</h2>
          <p>
            We stand behind the quality of AudioFACTORY. If you purchase a Pro Monthly, Pro Annual, or Lifetime Pass and are not satisfied with the studio performance or audio output quality, you are eligible for a full refund within <strong>14 calendar days</strong> of your initial purchase.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">2. Web Purchases (Stripe / Direct)</h2>
          <p>
            For purchases made directly on the AudioFACTORY web application:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>Email <strong>billing@audiofactory.app</strong> with your account email address and transaction ID.</li>
            <li>Refunds are processed to the original payment method within 3–5 business days.</li>
            <li>Upon refund confirmation, your account is reverted to the Free plan.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">3. Google Play In-App Purchases</h2>
          <p>
            For purchases made through the AudioFACTORY Android application via Google Play Billing:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>Refunds for Google Play purchases are subject to Google Play’s standard refund policies.</li>
            <li>You can request a refund directly through the Google Play Store (Profile &rarr; Payments & Subscriptions &rarr; Budget & Order History).</li>
            <li>You can also contact our support team with your Google Play Order Number (e.g. GPA.XXXX-XXXX-XXXX-XXXXX) for manual validation.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">4. Subscription Cancellation</h2>
          <p>
            You can cancel your recurring subscription at any time via the <Link to="/app/billing" className="text-amber-400 underline">Billing Settings</Link> page in the studio or through your Google Play subscription portal. Cancellation takes effect at the end of the current paid billing period with no further charges.
          </p>
        </section>
      </div>
    </div>
  );
};
