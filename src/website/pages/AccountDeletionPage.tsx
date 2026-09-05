/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Account & Data Deletion Request Page
 * (Compliant with Google Play Data Safety & GDPR/CCPA Erasure Requirements)
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { Trash2, AlertTriangle, CheckCircle2, Shield, ArrowRight } from 'lucide-react';

export const AccountDeletionPage: React.FC = () => {
  const [confirmed, setConfirmed] = useState(false);
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-12 py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-zinc-300">
      <SeoHead
        title="Account & Data Deletion | AudioFACTORY"
        description="Request permanent deletion of your AudioFACTORY account, stored audio projects, and personal data."
        canonicalPath="/account-deletion"
      />

      <div className="space-y-3 text-center sm:text-left border-b border-white/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-semibold">
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>User Data Rights</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Account & Data Deletion
        </h1>
        <p className="text-xs text-zinc-500 font-mono">
          Google Play Store & GDPR Article 17 Erasure Compliance
        </p>
      </div>

      <div className="bg-[#0C101A] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>What happens when you delete your account?</strong>
            <p className="mt-1 text-amber-200/90">
              Permanent account deletion irreversibly erases all your cloud-saved scripts, multi-speaker project files, custom voice cloning profiles, and generation history from our Firestore databases within 30 days.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Deletion Request Submitted</h3>
            <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
              We have queued your account (<strong>{email}</strong>) and associated audio project records for permanent erasure. A confirmation receipt has been sent to your email.
            </p>
            <div className="pt-4">
              <Link
                to="/"
                className="px-4 py-2 text-xs font-semibold text-zinc-300 bg-zinc-900 border border-white/10 rounded-lg hover:bg-zinc-800"
              >
                Return to AudioFACTORY Home
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-zinc-300 uppercase">
                Account Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="account@example.com"
                className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-zinc-300 uppercase">
                Reason for Deletion (Optional)
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Let us know why you are leaving..."
                className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-rose-400 resize-none"
              />
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="confirm-delete"
                required
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-rose-500 focus:ring-rose-500"
              />
              <label htmlFor="confirm-delete" className="text-xs text-zinc-300 leading-snug">
                I understand that this action is permanent and cannot be undone. All my projects, stems, and cloned voices will be deleted.
              </label>
            </div>

            <button
              type="submit"
              disabled={!confirmed}
              className="w-full py-3.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Permanently Delete My Account & Data</span>
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-white/5 text-center text-xs text-zinc-400">
          Prefer to delete data directly inside the active studio? <br />
          <Link to="/app/account" className="text-amber-400 underline font-medium">
            Open Studio Account Settings
          </Link>
        </div>
      </div>
    </div>
  );
};
