/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY How It Works Guide
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { AudioPipelineVisualizer } from '../components/AudioPipelineVisualizer';
import { CtaBanner } from '../components/CtaBanner';
import { 
  FileText, 
  Users, 
  Sparkles, 
  Sliders, 
  Download, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  Cpu,
  Mic2
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const workflowSteps = [
    {
      num: '01',
      title: 'Write or Dramatize Your Script',
      desc: 'Enter your monologue, trailer hook, or conversation outline. Use our built-in AI Dramatizer to instantly add pause timing, cinematic breath cues, and expressive emphasis.',
      icon: FileText,
      detail: 'Supports SSML, custom speed markers, and auto-segmentation for multi-character dialogues.'
    },
    {
      num: '02',
      title: 'Cast Neural Voices or Clone Your Own',
      desc: 'Pick from 30+ distinctive voice personalities spanning cinematic movie narrators, high-energy radio DJs, calm podcast hosts, or clone a custom voice in 10 seconds.',
      icon: Users,
      detail: 'Dual engine architecture combining Google Gemini 2.5 Flash and ElevenLabs V2.'
    },
    {
      num: '03',
      title: 'Generate Speech with Zero Latency',
      desc: 'Hit Generate and watch the neural network synthesize broadcast-grade 48kHz audio streams with natural cadence, pitch variation, and human breath sounds.',
      icon: Sparkles,
      detail: 'Sub-250ms time-to-first-byte with parallel synthesis across multi-actor scenes.'
    },
    {
      num: '04',
      title: 'Layer BGM & Automatic Ducking',
      desc: 'Add AI-generated ambient or upbeat background music. The studio automatically applies sidechain compression so the music gracefully ducks whenever voices are speaking.',
      icon: Sliders,
      detail: 'Fine-tune volume faders, attack times, and master isolation booth acoustics.'
    },
    {
      num: '05',
      title: 'Export Lossless WAV & Stems',
      desc: 'Download uncompressed 24-bit 48kHz WAV audio files, separated stems (Voice Only, BGM Only), or share directly via cloud persistence.',
      icon: Download,
      detail: 'Ready for instant drag-and-drop into Premiere, DaVinci, Unreal Engine, or podcast hosts.'
    }
  ];

  return (
    <div className="space-y-20 py-12">
      <SeoHead
        title="How It Works | AudioFACTORY Production Pipeline"
        description="Learn how AudioFACTORY turns words into finished audio through our 5-stage production pipeline: Script, Cast, Generate, Mix, and Export."
        canonicalPath="/how-it-works"
      />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>The End-to-End Workflow</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
          How AudioFACTORY turns <br />
          <span className="text-amber-400">text into finished master audio.</span>
        </h1>
        <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
          No complex DAW configurations. No scheduling voice actors. Produce polished, multi-track audio projects right in your browser or Android app.
        </p>
      </section>

      {/* Visual Pipeline Interactive Component */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AudioPipelineVisualizer />
      </section>

      {/* Step by step deep dive cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Detailed Step Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-[#0C101A] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-4 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                      STEP {step.num}
                    </span>
                    <Icon className="w-5 h-5 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-zinc-300 text-xs leading-relaxed mt-2">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 text-[11px] text-zinc-400 font-mono">
                  {step.detail}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <CtaBanner
        title="Ready to build your first voice project?"
        subtitle="Open the studio now and generate your first audio track in under 60 seconds."
        primaryCtaText="Start Creating Free"
        secondaryCtaText="Explore Voice Library"
      />
    </div>
  );
};
