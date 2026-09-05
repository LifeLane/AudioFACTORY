/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { INTRO_STYLES } from '../constants';
import { getIcon, getColorClass } from './BauhausComponents';
import { IntroStyle } from '../types';
import { Search, Sparkles } from 'lucide-react';

interface StyleSelectorProps {
  selectedStyle: IntroStyle;
  onSelect: (style: IntroStyle) => void;
  onCustomize: () => void;
}

interface StyleButtonProps {
  style: IntroStyle;
  isSelected: boolean;
  onClick: () => void;
}

const StyleButton: React.FC<StyleButtonProps> = ({ 
  style, 
  isSelected, 
  onClick
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={onClick}
      className={`
        w-full group relative flex items-center gap-3 px-3.5 py-3 text-left border-b border-zinc-200 transition-all
        ${isSelected 
          ? 'bg-zinc-100 text-zinc-950 font-bold border-zinc-300' 
          : 'bg-white hover:bg-zinc-50 text-zinc-800'
        }
      `}
    >
      <div className={`
        w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center border border-zinc-200 overflow-hidden shadow-xs
        ${getColorClass(style.color, true)}
      `}>
        {style.avatarSrc && !imgError ? (
          <img 
            src={style.avatarSrc} 
            alt={style.name} 
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          getIcon(style.icon, "w-4 h-4 text-white")
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-mono font-bold tracking-tight text-zinc-900 truncate">
          {style.name}
        </div>
        <div className="text-[10px] font-mono text-zinc-500 truncate">
          Voice: {style.defaultVoice}
        </div>
      </div>
      {isSelected && (
        <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
      )}
    </button>
  );
};

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect, onCustomize }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStyles = useMemo(() => {
    if (!searchQuery.trim()) return INTRO_STYLES;
    const q = searchQuery.toLowerCase();
    return INTRO_STYLES.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.defaultVoice.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Search Bar */}
      <div className="p-2.5 border-b border-zinc-200 bg-zinc-50">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search personas..."
            className="w-full pl-8 pr-2.5 py-1.5 text-xs font-mono bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900 placeholder:text-zinc-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-xs font-mono text-zinc-400 hover:text-zinc-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Preset List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col">
          {filteredStyles.map((style) => (
            <StyleButton 
              key={style.id}
              style={style}
              isSelected={selectedStyle.id === style.id}
              onClick={() => onSelect(style)}
            />
          ))}

          {filteredStyles.length === 0 && (
            <div className="p-4 text-center text-xs font-mono text-zinc-400">
              No matching personas found.
            </div>
          )}

          {/* Custom Persona Builder Button */}
          <button
            onClick={onCustomize}
            className={`
              w-full group relative flex items-center gap-3 px-3.5 py-3 text-left border-b border-zinc-200 transition-all
              ${selectedStyle.id === 'custom' 
                ? 'bg-amber-50 text-zinc-950 font-bold border-amber-300' 
                : 'bg-white hover:bg-zinc-50 text-zinc-800'
              }
            `}
          >
            <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center border border-zinc-300 bg-zinc-100 text-zinc-700 shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-mono font-bold tracking-tight text-zinc-900">
                Make Your Own
              </div>
              <div className="text-[10px] font-mono text-zinc-500 truncate">
                Custom voice prompt
              </div>
            </div>
            {selectedStyle.id === 'custom' && (
              <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
