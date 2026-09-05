/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Core Feature Bento Grid
 */
import React from 'react';
import { 
  FileText, 
  Users, 
  Mic2, 
  Sparkles, 
  Music, 
  Download, 
  Cloud, 
  Radio, 
  Layers, 
  ArrowRight,
  Cpu,
  Volume2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeatureBentoGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      
      {/* 1. Multi-Speaker Scene Generation (Large 8-col) */}
      <div className="md:col-span-8 bg-[#0C101A] border border-white/10 hover:border-amber-500/30 rounded-2xl p-6 sm:p-8 transition-all duration-300 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 font-bold">
            Flagship Studio Mode
          </span>
        </div>

        <h3 className="text-2xl font-bold text-white tracking-tight mb-2">
          Multi-Speaker Dialogue Production
        </h3>
        <p className="text-zinc-300 text-sm leading-relaxed mb-6 max-w-xl">
          Direct complex multi-character conversations with distinct actor voices, natural pause pacing, emotional inflection tags, and seamless timeline orchestration.
        </p>

        {/* Visual Mini Mock */}
        <div className="bg-black/60 rounded-xl border border-white/10 p-4 font-mono text-xs space-y-2.5">
          <div className="flex items-center justify-between text-zinc-400 pb-2 border-b border-white/5">
            <span className="text-amber-400 font-bold">SCENE: CYBERPUNK BRIEFING (2 CHARACTERS)</span>
            <span>00:38.2</span>
          </div>
          <div className="p-2.5 rounded bg-zinc-900/80 border border-white/5 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-[10px] shrink-0">A1</span>
            <div>
              <span className="text-amber-300 font-semibold">Algieba (Commander):</span>
              <p className="text-zinc-300 mt-0.5">&ldquo;Grid perimeter is failing. Initiate the synthesis protocol now.&rdquo;</p>
            </div>
          </div>
          <div className="p-2.5 rounded bg-zinc-900/80 border border-white/5 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center text-[10px] shrink-0">A2</span>
            <div>
              <span className="text-emerald-300 font-semibold">Aoede (Specialist):</span>
              <p className="text-zinc-300 mt-0.5">&ldquo;Frequencies locked. All 8 audio buffers ready for export.&rdquo;</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. AI Script Generation & Dramatization (4-col) */}
      <div className="md:col-span-4 bg-[#0C101A] border border-white/10 hover:border-amber-500/30 rounded-2xl p-6 sm:p-8 transition-all duration-300 flex flex-col justify-between">
        <div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mb-2">
            AI Script Dramatization
          </h3>
          <p className="text-zinc-300 text-sm leading-relaxed">
            Turn bullet points or raw transcripts into theatrical voiceover scripts with pacing, suspense, and acoustic direction automatically applied.
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-amber-400 font-mono">
          <span>Gemini 2.5 Flash Script Engine</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Instant Voice Cloning (4-col) */}
      <div className="md:col-span-4 bg-[#0C101A] border border-white/10 hover:border-amber-500/30 rounded-2xl p-6 sm:p-8 transition-all duration-300 flex flex-col justify-between">
        <div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
            <Mic2 className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mb-2">
            Zero-Shot Voice Cloning
          </h3>
          <p className="text-zinc-300 text-sm leading-relaxed">
            Upload or record 10 seconds of clear speech to replicate pitch, accent, and timbre instantly for consistent podcast or narrator branding.
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-amber-400 font-mono">
          <span>10s Neural Sample Capture</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* 4. Algorithmic BGM Generation & Sidechain (4-col) */}
      <div className="md:col-span-4 bg-[#0C101A] border border-white/10 hover:border-amber-500/30 rounded-2xl p-6 sm:p-8 transition-all duration-300 flex flex-col justify-between">
        <div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
            <Music className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mb-2">
            Dynamic BGM & Sidechain Ducking
          </h3>
          <p className="text-zinc-300 text-sm leading-relaxed">
            Generate custom ambient, cinematic, or electronic soundtracks. The master mixer automatically ducks BGM volume when characters speak.
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-amber-400 font-mono">
          <span>Smart Ducking Matrix</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* 5. Lossless Audio Export & Cloud Sync (4-col) */}
      <div className="md:col-span-4 bg-[#0C101A] border border-white/10 hover:border-amber-500/30 rounded-2xl p-6 sm:p-8 transition-all duration-300 flex flex-col justify-between">
        <div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
            <Download className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mb-2">
            Broadcast-Grade Lossless Export
          </h3>
          <p className="text-zinc-300 text-sm leading-relaxed">
            Export uncompressed 24-bit 48kHz WAV master files, separated stem packages, or web-optimized MP3 tracks with zero generation watermarks.
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-amber-400 font-mono">
          <span>24-bit 48kHz WAV &bull; Stems</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

    </div>
  );
};
