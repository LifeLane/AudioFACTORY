import React, { useState } from 'react';
import { Music, Loader2, Sparkles, Play, Pause, Volume2, CheckCircle2 } from 'lucide-react';
import { generateBGM } from '../services/elevenLabsService';
import { decodeBase64ToBytes } from '../services/geminiService';

import { useFirebase } from '../services/firebaseContext';

interface BgmGeneratorProps {
  onBgmGenerated: (audioBuffer: ArrayBuffer) => void;
  onRequireAuth?: () => void;
}

const PRESET_STYLES = [
  { label: 'Cyberpunk Lo-Fi', prompt: 'Chill lo-fi synthwave beat with soft vinyl crackle and electric keys' },
  { label: 'Cinematic Orchestral', prompt: 'Epic cinematic strings building tension with deep brass swell' },
  { label: 'Corporate Podcast Stinger', prompt: 'Upbeat modern clean tech podcast acoustic intro stinger' },
  { label: 'Ambient Drone', prompt: 'Deep meditative ambient drone pad with gentle resonant echoes' }
];

export const BgmGenerator: React.FC<BgmGeneratorProps> = ({ onBgmGenerated, onRequireAuth }) => {
  const { user } = useFirebase();
  const [prompt, setPrompt] = useState('Chill lo-fi synthwave beat with soft vinyl crackle and electric keys');
  const [duration, setDuration] = useState<number>(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneratedUrl, setLastGeneratedUrl] = useState<string | null>(null);

  const handleGenerate = async (skipAuthCheck = false) => {
    if (!user && !skipAuthCheck) {
      if (onRequireAuth) onRequireAuth(() => handleGenerate(true));
      return;
    }
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateBGM(prompt, duration);
      const audioBytes = decodeBase64ToBytes(result.audioBase64);
      // Create preview url
      const blob = new Blob([audioBytes as any], { type: result.contentType || 'audio/mpeg' });
      setLastGeneratedUrl(URL.createObjectURL(blob));
      onBgmGenerated(audioBytes.buffer as ArrayBuffer);
    } catch (err: any) {
      setError(err.message || "Failed to generate BGM. Please verify your ElevenLabs API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-3.5 bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 shadow-2xs">
      
      {/* Preset Vibe Chips */}
      <div>
        <label className="block text-xs font-mono font-bold text-zinc-600 uppercase tracking-wider mb-2">
          Preset Moods & Soundscapes
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_STYLES.map((style) => (
            <button
              key={style.label}
              type="button"
              onClick={() => setPrompt(style.prompt)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
                prompt === style.prompt
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-2xs'
                  : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Prompt Box */}
      <div>
        <label className="block text-xs font-mono font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
          Soundscape Prompt Directives
        </label>
        <div className="relative">
          <input 
            type="text" 
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe your desired mood, instrumentation, and tempo..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white text-zinc-900 placeholder:text-zinc-400 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Duration and Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-zinc-600 uppercase">Duration:</span>
          {[10, 15, 30].map(sec => (
            <button
              key={sec}
              type="button"
              onClick={() => setDuration(sec)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border transition-colors ${
                duration === sec
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                  : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border-zinc-200'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt.trim()}
          className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-mono text-xs font-bold uppercase tracking-wider border border-amber-500 flex items-center gap-2 shadow-xs transition-all active:scale-95"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
              <span>Synthesizing Bed...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
              <span>Generate Soundscape</span>
            </>
          )}
        </button>
      </div>

      {/* Audio Sample Player if generated */}
      {lastGeneratedUrl && (
        <div className="mt-1 pt-3 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-2 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Soundscape Ready ({duration}s stem)</span>
          </div>
          <audio controls src={lastGeneratedUrl} className="w-full sm:w-60 h-7" />
        </div>
      )}

      {error && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-mono text-xs">
          {error}
        </div>
      )}

    </div>
  );
};
