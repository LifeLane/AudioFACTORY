import React, { useState, useMemo, useEffect } from 'react';
import { Voice } from '../types';
import { Settings, X, Search, Check, Sparkles, SlidersHorizontal, Volume2 } from 'lucide-react';

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  voices: Voice[];
}

export const ConfigurationModal: React.FC<ConfigurationModalProps> = ({
  isOpen,
  onClose,
  selectedVoice,
  onVoiceChange,
  voices
}) => {
  const [filterGender, setFilterGender] = useState('ALL');
  const [filterProvider, setFilterProvider] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter voices
  const filteredVoices = useMemo(() => {
    return voices.filter(voice => {
      const matchGender = filterGender === 'ALL' || (voice.gender && voice.gender.toUpperCase() === filterGender);
      const matchProvider = filterProvider === 'ALL' || 
        (filterProvider === 'gemini' && (!voice.provider || voice.provider === 'gemini')) ||
        (filterProvider === 'elevenlabs' && voice.provider === 'elevenlabs');
      const matchSearch = !searchQuery.trim() || voice.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGender && matchProvider && matchSearch;
    });
  }, [filterGender, filterProvider, searchQuery, voices]);

  // Focus Management
  useEffect(() => {
    if (!isOpen) return;
    const modalElement = document.getElementById('config-modal');
    if (modalElement) {
      const searchInput = modalElement.querySelector('input');
      if (searchInput) {
        searchInput.focus();
      }
    }
  }, [isOpen]);

  // Keyboard Event Trap
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="config-modal-title"
    >
      <div 
        id="config-modal"
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white border border-zinc-200 rounded-xl shadow-2xl overflow-hidden"
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 id="config-modal-title" className="text-base sm:text-lg font-bold text-zinc-900 flex items-center gap-2">
                Voice Configuration & Studio Cast
              </h2>
              <p className="text-xs text-zinc-500 font-mono">
                Multilingual neural voices from Gemini and ElevenLabs
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900"
            aria-label="Close configuration"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex flex-col min-h-0 bg-white space-y-4">
          
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="search-voice" className="block text-xs font-mono font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Search Voice
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="search-voice"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name or style..."
                  className="w-full pl-8 pr-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-sm text-zinc-900 placeholder:text-zinc-400 font-sans focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="provider-filter" className="block text-xs font-mono font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Provider Engine
              </label>
              <select 
                id="provider-filter"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-sm text-zinc-900 font-sans focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all cursor-pointer"
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
              >
                <option value="ALL">All Engines (Gemini & ElevenLabs)</option>
                <option value="gemini">Gemini Neural Voices</option>
                <option value="elevenlabs">ElevenLabs Voices</option>
              </select>
            </div>

            <div>
              <label htmlFor="gender-filter" className="block text-xs font-mono font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Vocal Gender
              </label>
              <select 
                id="gender-filter"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-sm text-zinc-900 font-sans focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all cursor-pointer"
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
              >
                <option value="ALL">All Genders</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>

          {/* Voice List in a Bento Tile Grid */}
          <div className="flex-1 overflow-y-auto max-h-[380px] border border-zinc-200 rounded-xl bg-zinc-50/50 p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup" aria-label="Voice Selection">
              {filteredVoices.map((voice) => {
                const isSelected = selectedVoice === voice.id;
                const isElevenLabs = voice.provider === 'elevenlabs';

                return (
                  <label 
                    key={voice.id}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                      ${isSelected 
                        ? 'bg-white border-zinc-950 ring-2 ring-zinc-950 shadow-xs' 
                        : 'bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/80 shadow-2xs'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold ${
                        isSelected 
                          ? 'bg-zinc-950 text-white' 
                          : isElevenLabs 
                          ? 'bg-amber-100 text-amber-900' 
                          : 'bg-sky-100 text-sky-900'
                      }`}>
                        <Volume2 className="w-4 h-4" />
                      </div>
                      
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-zinc-900 truncate">
                            {voice.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">
                            {voice.gender}
                          </span>
                          <span className="text-zinc-300">•</span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                            isElevenLabs 
                              ? 'bg-amber-50 text-amber-800 border-amber-200' 
                              : 'bg-sky-50 text-sky-800 border-sky-200'
                          }`}>
                            {isElevenLabs ? 'ElevenLabs' : 'Gemini 2.5'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center ml-2">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'border-zinc-950 bg-zinc-950 text-white' 
                          : 'border-zinc-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    
                    <input 
                      type="radio" 
                      name="voice" 
                      value={voice.id}
                      checked={isSelected}
                      onChange={(e) => onVoiceChange(e.target.value)}
                      className="sr-only" 
                    />
                  </label>
                );
              })}

              {filteredVoices.length === 0 && (
                <div className="col-span-full text-center py-10 text-zinc-500 font-mono text-xs">
                  No voices match your search criteria. Try a different query.
                </div>
              )}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs font-mono text-zinc-500">
            <span>{filteredVoices.length} voices available</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
            >
              Confirm Selection
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
