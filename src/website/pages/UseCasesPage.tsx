/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Industry Use Cases
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { CtaBanner } from '../components/CtaBanner';
import { 
  Radio, 
  Gamepad2, 
  Video, 
  BookOpen, 
  Megaphone, 
  Globe2, 
  CheckCircle2, 
  ArrowRight,
  Disc,
  Layers,
  Sparkles
} from 'lucide-react';

export const UseCasesPage: React.FC = () => {
  const useCases = [
    {
      id: 'podcasts',
      title: 'Podcasts & Audio Dramas',
      tagline: 'Produce full conversational episodes and fictional radio plays without a physical studio.',
      icon: Radio,
      color: 'text-amber-400',
      bullets: [
        'Cast host and co-host voices with realistic natural cadence and back-and-forth interruptions',
        'Automatic intro/outro BGM ducking that matches professional NPR broadcast standards',
        'Directly generate episodic scripts from research notes or outlines'
      ],
      quote: '"We turned a 2-person script into a broadcast-ready audio drama episode in 20 minutes."'
    },
    {
      id: 'gaming',
      title: 'Video Game NPC & Dialogue Prototyping',
      tagline: 'Give life to hundreds of quest-givers, tavern keepers, and cinematic lore narrators.',
      icon: Gamepad2,
      color: 'text-emerald-400',
      bullets: [
        'Massive multi-character casting across fantasy, sci-fi, and military archetypes',
        'Lossless 48kHz WAV export ready for Unity, Unreal Engine 5, or FMOD audio middleware',
        'Instant iteration of voice acting lines as game narrative evolves'
      ],
      quote: '"Our indie RPG prototype went from silent text boxes to fully voiced cinematics overnight."'
    },
    {
      id: 'youtube',
      title: 'YouTube, TikTok & Social Creators',
      tagline: 'Speed up video production with dynamic narration and high-retention audio pacing.',
      icon: Video,
      color: 'text-rose-400',
      bullets: [
        'Snappy pacing and punchy trailer voices optimized for high video retention',
        'Timecode-synced SRT subtitle export for effortless Premiere / CapCut editing',
        '100% royalty-free commercial monetization rights on all platforms'
      ],
      quote: '"Our faceless channel output tripled without losing voice fidelity or video engagement."'
    },
    {
      id: 'audiobooks',
      title: 'Audiobooks & Educational Modules',
      tagline: 'Narrate complete chapters with consistent vocal timbre and soothing listening cadence.',
      icon: BookOpen,
      color: 'text-sky-400',
      bullets: [
        'Long-form prosody stability ensuring the narrator sounds identical across 50+ chapters',
        'Expressive character dialogue distinct from the main narrator voice',
        'High-density 24-bit audio compliant with ACX and Audible submission guidelines'
      ],
      quote: '"The prosody stability across hours of training modules is genuinely exceptional."'
    },
    {
      id: 'commercials',
      title: 'Commercials, Promos & Radio Ads',
      tagline: 'Deliver urgent, authoritative, and persuasive product voiceovers on demand.',
      icon: Megaphone,
      color: 'text-amber-400',
      bullets: [
        'High-energy radio DJ and dramatic trailer styles with razor-sharp cadence',
        'Built-in peak limiters and broadcast compression for punchy loudness',
        'Rapid multi-variant A/B testing of different hook lines'
      ],
      quote: '"We tested 10 different audio hook variants for our mobile game ad in one afternoon."'
    }
  ];

  return (
    <div className="space-y-20 py-12">
      <SeoHead
        title="Solutions & Use Cases | AudioFACTORY"
        description="Discover how audio creators, game developers, podcasters, educators, and social media producers use AudioFACTORY to turn scripts into finished master audio."
        canonicalPath="/use-cases"
      />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
          <Disc className="w-3.5 h-3.5 text-amber-400" />
          <span>Built for Diverse Production Needs</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
          Whatever your story, <br />
          <span className="text-amber-400">AudioFACTORY brings it to life.</span>
        </h1>
        
        <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
          Explore specialized workflows for podcasts, gaming, video content, e-learning, and commercial advertising.
        </p>
      </section>

      {/* Use Cases Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {useCases.map((uc) => {
          const Icon = uc.icon;

          return (
            <div
              key={uc.id}
              id={uc.id}
              className="bg-[#0C101A] border border-white/10 rounded-2xl p-8 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${uc.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {uc.title}
                  </h3>
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed">
                  {uc.tagline}
                </p>

                <ul className="space-y-2.5 pt-2">
                  {uc.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  <Link
                    to="/app"
                    className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"
                  >
                    <span>Launch Studio for {uc.title.split(' ')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 bg-black/60 border border-white/10 rounded-xl p-6 flex flex-col justify-between italic text-sm text-zinc-300 font-serif leading-relaxed relative">
                <div className="text-amber-400/40 text-4xl leading-none absolute top-3 left-3">&ldquo;</div>
                <div className="pt-4 relative z-10">{uc.quote}</div>
                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-sans text-zinc-500 font-mono">
                  <span>Verified Producer</span>
                  <span className="text-amber-400">AudioFACTORY Studio</span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* CTA */}
      <CtaBanner
        title="Ready to turn your vision into finished audio?"
        subtitle="Start creating your first multi-track scene for free right now."
        primaryCtaText="Launch Studio Free"
        secondaryCtaText="View Voice Library"
      />
    </div>
  );
};
