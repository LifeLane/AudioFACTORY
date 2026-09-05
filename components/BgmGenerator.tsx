import React, { useState } from 'react';
import { Music, Loader2 } from 'lucide-react';
import { BauhausButton } from './BauhausComponents';
import { generateBGM } from '../services/elevenLabsService';

interface BgmGeneratorProps {
  onBgmGenerated: (audioBuffer: ArrayBuffer) => void;
}

export const BgmGenerator: React.FC<BgmGeneratorProps> = ({ onBgmGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const buffer = await generateBGM(prompt, 15); // 15 seconds default
      onBgmGenerated(buffer);
    } catch (err: any) {
      setError(err.message || "Failed to generate BGM.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-2">
        <Music className="w-5 h-5 text-sky-500" />
        <h3 className="font-light tracking-widest tracking-tight text-sm">BGM Generator</h3>
      </div>
      
      <div className="flex gap-2">
        <input 
          type="text" 
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. Upbeat corporate lo-fi synth..."
          className="flex-1 border border-zinc-800 p-2 text-sm font-light outline-none focus:ring-2 focus:ring-amber-500"
        />
        <BauhausButton 
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt.trim()}
          variant="secondary"
          className="px-4 py-2 text-xs"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
        </BauhausButton>
      </div>
      
      {error && <p className="text-[10px] font-light text-rose-500 tracking-widest">{error}</p>}
    </div>
  );
};
