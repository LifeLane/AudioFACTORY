/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState, useRef } from 'react';
import { BauhausButton } from './BauhausComponents';
import { Voice } from '../types';

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
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const [localVoice, setLocalVoice] = useState(currentVoice || (voices[0] ? voices[0].id : ''));

  // Sync local state when props change
  useEffect(() => {
    setLocalPrompt(prompt);
    if (currentVoice) {
        setLocalVoice(currentVoice);
    }
  }, [prompt, currentVoice]);

  // Use a ref for onClose to avoid re-triggering the effect when the parent re-renders (e.g. flag cycling)
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Focus Trap and Management
  useEffect(() => {
    if (!isOpen) return;

    const modalElement = document.getElementById('system-prompt-modal');
    // Capture the element that had focus before the modal opened
    const previousActiveElement = document.activeElement as HTMLElement;

    // Set Initial Focus
    if (modalElement) {
        // Prioritize textarea in editable mode
        const textarea = modalElement.querySelector('textarea');
        if (isEditable && textarea) {
            textarea.focus();
        } 
        // If focus is not already inside the modal (e.g. via autoFocus or manual set above), force it.
        else if (!modalElement.contains(document.activeElement)) {
            const focusableElements = modalElement.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
                (focusableElements[0] as HTMLElement).focus();
            } else {
                modalElement.focus();
            }
        }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!modalElement) return;

        if (e.key === 'Escape') {
            onCloseRef.current();
            return;
        }

        if (e.key === 'Tab') {
            const focusableElements = modalElement.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length === 0) {
                e.preventDefault();
                return;
            }

            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement || document.activeElement === modalElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        // Restore focus when modal closes
        previousActiveElement?.focus();
    };
    // Exclude onClose from dependencies to prevent re-running on parent re-renders
  }, [isOpen, isEditable]);

  const handleSave = () => {
    if (onSave) {
      onSave(localPrompt, localVoice);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-modal-title"
    >
      <div 
        id="system-prompt-modal"
        tabIndex={-1}
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800 shadow-lg shadow-black/50 outline-none"
      >
        
        {/* Header */}
        <div className="bg-amber-500 border-b border-zinc-800 p-4 md:p-6 flex justify-between items-center flex-shrink-0">
          <h2 id="prompt-modal-title" className="text-xl md:text-2xl font-light tracking-widest flex items-center gap-3">
             {isEditable ? 'Configure Custom Style' : 'System Prompt'}
          </h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-zinc-900 border border-zinc-700 hover:bg-white hover:text-white transition-colors text-xl font-light focus:outline-none focus:ring-4 focus:ring-rose-600"
            aria-label="Close"
          >
            X
          </button>
        </div>

        {/* Content */}
        <div className="p-0 flex-1 overflow-y-auto custom-scrollbar bg-zinc-900 flex flex-col min-h-0">
          <div className="p-4 md:p-8 flex-1 flex flex-col gap-6">
            
            {/* Voice Selector (Editable Mode Only) */}
            {isEditable && (
              <div className="bg-zinc-950 border border-zinc-800 p-4 md:p-6">
                 <label className="block text-sm font-light tracking-widest mb-2">Voice Persona</label>
                 <div className="relative">
                    <select
                        value={localVoice}
                        onChange={(e) => setLocalVoice(e.target.value)}
                        className="w-full appearance-none p-3 border border-zinc-800 font-light text-sm bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-amber-500 cursor-pointer"
                    >
                        {voices.map((v) => (
                            <option key={v.id} value={v.id}>
                                {v.name} ({v.gender})
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none font-light text-xs">▼</div>
                 </div>
                 <p className="mt-2 text-xs text-zinc-400 font-light tracking-widest">Select the voice that best matches your prompt persona.</p>
              </div>
            )}

            <div className="flex-1 flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                     <span className="text-sm font-light tracking-widest">
                        {isEditable ? 'System Instructions' : 'System Instructions Preview'}
                     </span>
                </div>
                
                {isEditable ? (
                    <div className="flex-1 flex flex-col">
                        <textarea 
                            value={localPrompt}
                            onChange={(e) => setLocalPrompt(e.target.value)}
                            className="w-full flex-1 min-h-[300px] p-4 bg-zinc-900 border border-zinc-800 font-mono text-sm leading-relaxed focus:outline-none focus:ring-4 focus:ring-amber-500 resize-none"
                            placeholder="Enter your system instructions here. Define the persona, tone, pacing, and rules..."
                            // Removed autoFocus to rely on the useEffect focus management and prevent conflicts
                        />
                        <p className="mt-2 text-xs text-zinc-400 font-light tracking-widest">
                            Define the persona, style, and rules for your introducer.
                        </p>
                    </div>
                ) : (
                    <pre className="whitespace-pre-wrap font-mono text-xs md:text-sm leading-relaxed p-4 bg-zinc-900 border border-zinc-700 text-zinc-50">
                        {prompt}
                    </pre>
                )}
            </div>
          </div>
        </div>

        {/* Footer for Editable Mode */}
        {isEditable && (
            <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-end gap-4 flex-shrink-0">
                <button 
                    onClick={onClose}
                    className="font-light tracking-widest text-sm px-6 py-3 border border-transparent hover:underline"
                >
                    Cancel
                </button>
                <BauhausButton onClick={handleSave} className="py-2 px-6 text-sm">
                    Save Configuration
                </BauhausButton>
            </div>
        )}
      </div>
    </div>
  );
};