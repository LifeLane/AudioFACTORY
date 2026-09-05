/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Frequently Asked Questions
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { CtaBanner } from '../components/CtaBanner';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, Shield, ArrowRight } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      category: 'General & Audio Architecture',
      question: 'What is AudioFACTORY and how does it differ from simple TTS tools?',
      answer: 'AudioFACTORY is a complete AI-native digital audio workstation. Unlike basic text-to-speech converters, AudioFACTORY allows you to dramatize scripts with emotion cues, cast multiple independent speakers across a single unified dialogue timeline, generate dynamic background music, automatically duck audio when voices speak, and export broadcast-grade 24-bit 48kHz lossless WAV files and isolated stems.'
    },
    {
      category: 'General & Audio Architecture',
      question: 'Which neural AI models power AudioFACTORY?',
      answer: 'AudioFACTORY utilizes a hybrid dual-engine architecture combining Google Gemini 2.5 Flash for ultra-low-latency neural speech and intelligent script dramatization alongside ElevenLabs V2 for hyper-realistic conversational and cinematic timbres.'
    },
    {
      category: 'Licensing & Rights',
      question: 'Do I own 100% of the commercial rights to generated audio?',
      answer: 'Yes. All audio generated through AudioFACTORY — across Free, Pro, and Lifetime tiers — includes full, unrestricted commercial broadcast and monetization rights. You can use your audio tracks in monetized YouTube videos, Spotify podcasts, commercial games, audiobooks, and TV commercials with zero royalty obligations.'
    },
    {
      category: 'Features & Formats',
      question: 'What audio formats and resolutions are supported for export?',
      answer: 'You can export master uncompressed 24-bit 48kHz PCM WAV audio files, standard 320kbps MP3 tracks, separated multi-track stems (Voice-Only and BGM-Only), and timecode-synced SRT/JSON subtitles.'
    },
    {
      category: 'Features & Formats',
      question: 'How does the Zero-Shot Voice Cloning feature work?',
      answer: 'In the studio, simply upload a 10-second reference audio clip or record directly into your browser microphone. AudioFACTORY extracts the vocal acoustic signature, timbre, and formant structure in real time, allowing you to synthesize any text in your cloned voice immediately.'
    },
    {
      category: 'Plans & Billing',
      question: 'What are the limits on the Free plans?',
      answer: 'Guest users without an account receive 3 speech generations per day. Creating a free account raises your limit to 10 generations per day with persistent cloud project storage. Upgrading to Pro Monthly, Pro Annual, or Lifetime provides unlimited generations with priority synthesis queues.'
    },
    {
      category: 'Plans & Billing',
      question: 'How does billing sync between the Web application and the Android app?',
      answer: 'Your AudioFACTORY account synchronizes entitlements seamlessly. If you purchase Pro or Lifetime on the Web, it is instantly unlocked on the Android app, and vice versa when purchasing via Google Play Billing.'
    },
    {
      category: 'Plans & Billing',
      question: 'What is your refund policy?',
      answer: 'We offer a 14-day refund guarantee for monthly and annual subscriptions if you are not satisfied with the studio performance. Lifetime passes can also be refunded within 14 days if usage has not exceeded standard limits. See our full Refund Policy page for details.'
    }
  ];

  return (
    <div className="space-y-20 py-12">
      <SeoHead
        title="Frequently Asked Questions (FAQ) | AudioFACTORY"
        description="Got questions about AudioFACTORY? Learn about our dual neural engine, commercial rights, lossless 48kHz WAV exports, multi-speaker casting, and billing."
        canonicalPath="/faq"
      />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Knowledge Base & FAQ</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
          Everything you need to know about AudioFACTORY licensing, synthesis quality, formats, and billing.
        </p>
      </section>

      {/* FAQ Accordion List */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className="bg-[#0C101A] border border-white/10 rounded-2xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                    {faq.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {faq.question}
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 text-zinc-400">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-6 text-sm text-zinc-300 leading-relaxed border-t border-white/5 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Still have questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-zinc-900/50 border border-white/10 rounded-2xl p-8 space-y-4">
        <h3 className="text-xl font-bold text-white">Still have questions?</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Our engineering and audio support team is ready to help you with custom enterprise pipelines or voice models.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md transition-colors"
        >
          <span>Contact Audio Support</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      {/* CTA */}
      <CtaBanner
        title="Ready to hear the difference?"
        subtitle="Test the audio engine for free with your own script."
        primaryCtaText="Launch Free Studio"
        secondaryCtaText="Compare Plans"
      />
    </div>
  );
};
