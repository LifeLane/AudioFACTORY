/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useEffect } from 'react';
import { Voice } from '../types';

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


  // Focus Management (Only runs when isOpen changes)
  // This prevents focus from jumping to the first element when the parent component re-renders
  // but the modal remains open (e.g., when the flag cycler updates in App.tsx).
  useEffect(() => {
    if (!isOpen) return;

    const previousActiveElement = document.activeElement as HTMLElement;
    const modalElement = document.getElementById('config-modal');

    if (modalElement) {
        // Find focusable elements
        const focusableElements = modalElement.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            (focusableElements[0] as HTMLElement).focus();
        }
    }

    return () => {
        previousActiveElement?.focus();
    };
  }, [isOpen]);

  // Keyboard Event Trap (Updates when dependencies like onClose change)
  useEffect(() => {
    if (!isOpen) return;

    const modalElement = document.getElementById('config-modal');

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!modalElement) return;

        const focusableElements = modalElement.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (e.key === 'Tab') {
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="config-modal-title"
    >
      <div 
        id="config-modal"
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800 shadow-lg shadow-black/50"
      >
        
        {/* Header */}
        <div className="bg-amber-500 border-b border-zinc-800 p-6 flex justify-between items-center flex-shrink-0">
          <h2 id="config-modal-title" className="text-2xl font-light tracking-widest flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">⚙</span> Configuration
          </h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-zinc-900 border border-zinc-700 hover:bg-white hover:text-white transition-colors text-xl font-light focus:outline-none focus:ring-4 focus:ring-rose-600"
            aria-label="Close configuration"
          >
            X
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 flex flex-col min-h-0">
          <div className="mb-4">
            <label className="block text-xl font-light tracking-widest mb-1">Select Speaker Voice</label>
            <p className="text-sm text-zinc-300 font-light tracking-widest">These voices are multilingual and adapt to your text.</p>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label htmlFor="search-voice" className="block text-xs font-light tracking-widest mb-2">Search</label>
              <input
                id="search-voice"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name..."
                className="w-full p-3 border border-zinc-800 font-light bg-zinc-900 text-sm text-white focus:outline-none focus:ring-4 focus:ring-amber-500"
              />
            </div>
            <div>
              <label htmlFor="provider-filter" className="block text-xs font-light tracking-widest mb-2">Provider</label>
              <select 
                id="provider-filter"
                className="w-full p-3 border border-zinc-800 font-light bg-zinc-900 text-sm text-white focus:outline-none focus:ring-4 focus:ring-amber-500"
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
              >
                <option value="ALL">All Providers (Gemini & ElevenLabs)</option>
                <option value="gemini">Gemini Neural Voices</option>
                <option value="elevenlabs">ElevenLabs Voices</option>
              </select>
            </div>
            <div>
              <label htmlFor="gender-filter" className="block text-xs font-light tracking-widest mb-2">Gender</label>
              <select 
                id="gender-filter"
                className="w-full p-3 border border-zinc-800 font-light bg-zinc-900 text-sm text-white focus:outline-none focus:ring-4 focus:ring-amber-500"
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
              >
                <option value="ALL">All Genders</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>

          {/* Voice List */}
          <div className="flex-1 overflow-y-auto min-h-[300px] border border-zinc-800 bg-zinc-900 p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="radiogroup" aria-label="Voice Selection">
              {filteredVoices.map((voice) => (
                <label 
                  key={voice.id}
                  className={`
                    flex items-center justify-between p-3 border border-zinc-800 cursor-pointer transition-colors
                    focus-within:ring-4 focus-within:ring-amber-500
                    ${selectedVoice === voice.id ? 'bg-zinc-900 text-white' : 'bg-zinc-900 hover:bg-amber-500 hover:text-zinc-50'}
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-5 h-5 flex-shrink-0 border border-current rounded-full flex items-center justify-center`}>
                      {selectedVoice === voice.id && <div className="w-2.5 h-2.5 bg-current rounded-full" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-light text-sm truncate">{voice.name}</span>
                      </div>
                      <span className="text-[10px] tracking-widest opacity-70">{voice.gender}</span>
                    </div>
                  </div>
                  
                  <input 
                    type="radio" 
                    name="voice" 
                    value={voice.id}
                    checked={selectedVoice === voice.id}
                    onChange={(e) => onVoiceChange(e.target.value)}
                    className="sr-only" 
                  />
                </label>
              ))}
              {filteredVoices.length === 0 && (
                <div className="col-span-2 text-center p-8 text-zinc-400 font-light">
                  No voices found for current filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};