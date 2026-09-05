/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Marketing Footer
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Disc, ArrowUpRight, Heart, Activity } from 'lucide-react';

export const MarketingFooter: React.FC = () => {
  return (
    <footer className="bg-[#06090E] border-t border-white/10 text-zinc-400 text-sm">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black font-black text-base shadow-md shadow-amber-500/20">
                AF
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Audio<span className="text-amber-400">FACTORY</span>
              </span>
            </Link>
            <p className="text-zinc-400 text-sm max-w-sm leading-relaxed">
              The complete AI-powered audio workstation for podcasters, game devs, filmmakers, and creators. Turn words into master-ready audio with multi-speaker casting, voice cloning, and BGM synthesis.
            </p>
            
            {/* Status Signal */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-white/10 w-fit text-xs font-mono text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-semibold">Gemini 2.5 & ElevenLabs V2</span>
              <span className="text-zinc-500">|</span>
              <span>All Systems Nominal</span>
            </div>
          </div>

          {/* Product Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
              Studio Platform
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/features" className="hover:text-amber-400 transition-colors">
                  Features Overview
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-amber-400 transition-colors">
                  Production Pipeline
                </Link>
              </li>
              <li>
                <Link to="/voices" className="hover:text-amber-400 transition-colors">
                  Voice Library (30+)
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-amber-400 transition-colors">
                  Plans & Pricing
                </Link>
              </li>
              <li>
                <Link to="/app" className="inline-flex items-center gap-1 text-amber-400 font-semibold hover:text-amber-300">
                  <span>Launch Studio</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions & Use Cases */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
              Solutions
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/use-cases#podcasts" className="hover:text-amber-400 transition-colors">
                  Podcasts & Audio Dramas
                </Link>
              </li>
              <li>
                <Link to="/use-cases#gaming" className="hover:text-amber-400 transition-colors">
                  Game Voice Acting
                </Link>
              </li>
              <li>
                <Link to="/use-cases#youtube" className="hover:text-amber-400 transition-colors">
                  YouTube & Short Video
                </Link>
              </li>
              <li>
                <Link to="/use-cases#audiobooks" className="hover:text-amber-400 transition-colors">
                  Audiobooks & E-Learning
                </Link>
              </li>
              <li>
                <Link to="/use-cases#commercials" className="hover:text-amber-400 transition-colors">
                  Trailers & Commercials
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
              Legal & Trust
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/privacy" className="hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-amber-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-amber-400 transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/account-deletion" className="hover:text-amber-400 transition-colors text-rose-400/90 hover:text-rose-300">
                  Account & Data Deletion
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition-colors">
                  Support & Contact
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 bg-[#04060A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500 font-mono">
            &copy; {new Date().getFullYear()} AudioFACTORY Inc. All rights reserved. Built for professional audio creators.
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <Link to="/privacy" className="hover:text-zinc-300">Privacy</Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:text-zinc-300">Terms</Link>
            <span>&bull;</span>
            <Link to="/refund-policy" className="hover:text-zinc-300">Refunds</Link>
            <span>&bull;</span>
            <Link to="/account-deletion" className="hover:text-zinc-300">Data Deletion</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
