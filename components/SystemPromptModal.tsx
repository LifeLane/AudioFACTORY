import React, { useEffect, useState, useRef } from 'react';
import { Voice } from '../types';
import { Terminal, X, Check, FileCode, Sliders } from 'lucide-react';
import { useTerminal } from './terminal/TerminalContext';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  isEditable?: boolean;
  onSave?: (newPrompt: string, newVoice?: string) => void;
  currentVoice?: string;
  voices: Voice[];
}

export const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  isOpen,
  onClose,
  prompt,
  isEditable = false,
  onSave,
  currentVoice,
  voices
}) => {
  const { isTerminalMode } = useTerminal();
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const [localVoice, setLocalVoice] = useState(currentVoice || (voices[0] ? voices[0].id : ''));

  useEffect(() => {
    setLocalPrompt(prompt);
    if (currentVoice) {
      setLocalVoice(currentVoice);
    }
  }, [prompt, currentVoice]);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSave = () => {
    if (onSave) {
      onSave(localPrompt, localVoice);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-modal-title"
    >
      <div 
        id="system-prompt-modal"
        tabIndex={-1}
        className={`relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden border outline-none transition-all ${
          isTerminalMode 
            ? 'bg-[#161B22] border-[#30363D] text-[#E6EDF3]' 
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex justify-between items-center flex-shrink-0 ${
          isTerminalMode 
            ? 'bg-[#0D1117] border-[#30363D]' 
            : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-xs ${
              isTerminalMode 
                ? 'bg-[#161B22] border border-[#4285F4]/40 text-[#4285F4]' 
                : 'bg-zinc-900 text-white'
            }`}>
              <Terminal className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 id="prompt-modal-title" className={`text-base sm:text-lg font-bold flex items-center gap-2 ${
                isTerminalMode ? 'font-mono text-[#E6EDF3]' : 'text-zinc-900'
              }`}>
                {isEditable ? 'Configure Custom Persona Style' : isTerminalMode ? 'DIRECTIVES_PROMPT_TELEMETRY' : 'Persona Directives'}
              </h2>
              <p className={`text-xs font-mono ${isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-500'}`}>
                {isEditable ? 'Craft your custom prompt instructions and acoustic profile' : 'Underlying prompt directives dispatched to Gemini neural voice model'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${
              isTerminalMode 
                ? 'border-[#30363D] bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]' 
                : 'border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950'
            }`}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className={`p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4 custom-scrollbar ${
          isTerminalMode ? 'bg-[#0D1117]' : 'bg-white'
        }`}>
          
          {/* Voice Selector (Editable Mode Only) */}
          {isEditable && (
            <div className={`border rounded-lg p-4 ${
              isTerminalMode 
                ? 'border-[#30363D] bg-[#161B22]' 
                : 'border-zinc-200 bg-zinc-50'
            }`}>
              <label className={`block text-xs font-mono font-bold uppercase tracking-wider mb-2 ${
                isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-700'
              }`}>
                Assigned Voice Persona
              </label>
              <select
                value={localVoice}
                onChange={(e) => setLocalVoice(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm transition-all cursor-pointer focus:outline-none focus:ring-2 ${
                  isTerminalMode 
                    ? 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3] focus:ring-[#4285F4] focus:border-[#4285F4]' 
                    : 'bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-900'
                }`}
              >
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.gender}) - {v.provider === 'elevenlabs' ? 'ElevenLabs' : 'Gemini'}
                  </option>
                ))}
              </select>
              <p className={`mt-1.5 text-[11px] font-mono ${isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-500'}`}>
                Select the baseline voice model that best reflects your persona.
              </p>
            </div>
          )}

          {/* Prompt Instructions */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-1.5">
              <label className={`block text-xs font-mono font-bold uppercase tracking-wider ${
                isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-700'
              }`}>
                Directives & Acoustic Prompts
              </label>
              <span className={`text-[10px] font-mono ${isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-400'}`}>
                {localPrompt.length} characters
              </span>
            </div>

            {isEditable ? (
              <textarea
                value={localPrompt}
                onChange={(e) => setLocalPrompt(e.target.value)}
                className={`w-full flex-1 min-h-[220px] p-3.5 border rounded-lg font-mono text-xs sm:text-sm leading-relaxed resize-none shadow-inner focus:outline-none focus:ring-2 ${
                  isTerminalMode 
                    ? 'bg-[#090D12] border-[#30363D] text-[#34A853] placeholder:text-[#8B949E] focus:ring-[#4285F4]' 
                    : 'bg-zinc-50 focus:bg-white text-zinc-900 border-zinc-200 focus:ring-zinc-900'
                }`}
                placeholder="Instruct the model on pacing, tone, inflection, pauses, and emotional depth..."
              />
            ) : (
              <div className={`w-full flex-1 min-h-[220px] p-3.5 border rounded-lg font-mono text-xs sm:text-sm leading-relaxed overflow-y-auto whitespace-pre-wrap select-text ${
                isTerminalMode 
                  ? 'bg-[#090D12] border-[#30363D] text-[#34A853]' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-800'
              }`}>
                {prompt}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-end gap-2 pt-3 border-t ${
            isTerminalMode ? 'border-[#30363D]' : 'border-zinc-100'
          }`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg border font-mono text-xs font-bold uppercase transition-colors ${
                isTerminalMode 
                  ? 'border-[#30363D] bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3]' 
                  : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
              }`}
            >
              {isEditable ? 'Cancel' : 'Dismiss'}
            </button>
            {isEditable && (
              <button
                onClick={handleSave}
                className={`px-5 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-xs ${
                  isTerminalMode 
                    ? 'bg-[#4285F4] hover:bg-[#3367D6] text-white' 
                    : 'bg-zinc-950 hover:bg-zinc-800 text-white'
                }`}
              >
                Save Persona
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
