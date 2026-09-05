/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { INTRO_STYLES } from '../constants';
import { getIcon, getColorClass } from './BauhausComponents';
import { IntroStyle } from '../types';

interface StyleSelectorProps {
  selectedStyle: IntroStyle;
  onSelect: (style: IntroStyle) => void;
  onCustomize: () => void;
}

interface StyleButtonProps {
  style: IntroStyle;
  isSelected: boolean;
  onClick: () => void;
  effectiveAvatarSrc?: string;
}

const StyleButton: React.FC<StyleButtonProps> = ({ 
  style, 
  isSelected, 
  onClick,
  effectiveAvatarSrc
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={onClick}
      className={`
        group relative flex items-center gap-4 p-6 text-left border-b border-zinc-800 transition-all
        ${isSelected ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-800 text-zinc-50'}
      `}
    >
      <div className={`
        w-12 h-12 flex-shrink-0 flex items-center justify-center border border-current overflow-hidden
        ${isSelected ? 'bg-zinc-900 text-white' : getColorClass(style.color, false)}
      `}>
        {effectiveAvatarSrc && !imgError ? (
          <img 
            src={effectiveAvatarSrc} 
            alt={style.name} 
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          getIcon(style.icon, "w-6 h-6")
        )}
      </div>
      <div className="min-w-0">
        <div className="font-light tracking-widest text-lg leading-tight mb-1">{style.name}</div>
      </div>
      {isSelected && (
        <div className="absolute right-4 w-4 h-4 bg-zinc-900 rounded-full animate-pulse flex-shrink-0"></div>
      )}
    </button>
  );
};

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect, onCustomize }) => {
  const [loadedAvatars, setLoadedAvatars] = useState<Record<string, string>>({});

  // Load thumbnails via fetch to bypass potential img tag static serving issues
  useEffect(() => {
    const createdUrls: string[] = [];
    const loadThumbnails = async () => {
      const loaded: Record<string, string> = {};
      await Promise.all(INTRO_STYLES.map(async (style) => {
        if (style.avatarSrc) {
          try {
            const response = await fetch(style.avatarSrc);
            if (response.ok) {
              const blob = await response.blob();
              const url = URL.createObjectURL(blob);
              createdUrls.push(url);
              loaded[style.id] = url;
            }
          } catch (e) {
            console.error("Failed to load avatar:", style.avatarSrc, e);
          }
        }
      }));
      setLoadedAvatars(loaded);
    };
    loadThumbnails();

    return () => {
        // Cleanup object URLs to avoid memory leaks
        createdUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      
      <div className="flex-1 overflow-y-auto bg-zinc-950 custom-scrollbar">
        <div className="flex flex-col">
          {INTRO_STYLES.map((style) => (
            <StyleButton 
              key={style.id}
              style={style}
              isSelected={selectedStyle.id === style.id}
              onClick={() => onSelect(style)}
              effectiveAvatarSrc={loadedAvatars[style.id] || style.avatarSrc}
            />
          ))}

          <button
            onClick={onCustomize}
            className={`
              group relative flex items-center gap-4 p-6 text-left border-b border-zinc-800 transition-all
              ${selectedStyle.id === 'custom' ? 'bg-amber-500 text-white' : 'hover:bg-zinc-800 text-zinc-50'}
            `}
          >
             <div className={`
                  w-12 h-12 flex-shrink-0 flex items-center justify-center border border-current
                  ${selectedStyle.id === 'custom' ? 'bg-white text-white' : 'bg-zinc-900 text-zinc-50'}
                `}>
                  {getIcon('plus', "w-6 h-6")}
                </div>
                <div className="min-w-0">
                  <div className="font-light tracking-widest text-lg leading-tight mb-1">Make Your Own</div>
                </div>
                {selectedStyle.id === 'custom' && (
                  <div className="absolute right-4 w-4 h-4 bg-white rounded-full animate-pulse flex-shrink-0"></div>
                )}
          </button>

        </div>
      </div>
      
    </div>
  );
};