/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Support & Contact Page
 */
import React, { useState } from 'react';
import { SeoHead } from '../components/SeoHead';
import { Mail, MessageSquare, Send, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-16 py-12">
      <SeoHead
        title="Contact & Support | AudioFACTORY"
        description="Get in touch with the AudioFACTORY engineering and customer support team for billing inquiries, custom enterprise pipelines, or technical support."
        canonicalPath="/contact"
      />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
          <Mail className="w-3.5 h-3.5 text-amber-400" />
          <span>Support & Inquiries</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
          How can we help?
        </h1>
        <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
          Whether you need help with your account, have a custom voice model request, or want to partner, we are here for you.
        </p>
      </section>

      {/* Contact Grid */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0C101A] border border-white/10 rounded-2xl p-8 sm:p-12 shadow-xl">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Message Received</h3>
              <p className="text-zinc-300 text-sm max-w-md mx-auto">
                Thank you for reaching out. Our engineering and audio team will respond to your email ({formData.email || 'your address'}) within 24 business hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2 text-xs font-semibold text-amber-400 bg-zinc-900 border border-white/10 rounded-lg hover:bg-zinc-800"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-zinc-300 uppercase">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Marcus Vance"
                    className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-zinc-300 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="marcus@example.com"
                    className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase">Inquiry Topic</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="General Inquiry">General Studio Inquiry</option>
                  <option value="Billing Support">Billing & Subscription Support</option>
                  <option value="Custom Enterprise">Custom Enterprise & Voice Models</option>
                  <option value="Bug Report">Technical Bug Report</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase">Message</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us how we can help you..."
                  className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 text-sm font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
