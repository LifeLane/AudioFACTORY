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

  // Derive a clean short description without markdown headers or bullet points
  const shortDesc = useMemo(() => {
    if (!style.description) return '';
    const lines = style.description
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#') && !l.startsWith('*') && !l.startsWith('-'));
    return lines[0] || style.description;
  }, [style.description]);

  const categoryLabel = useMemo(() => {
    if (!style.category) return '';
    return style.category.replace('_', ' ').toUpperCase();
  }, [style.category]);

  const languagesLabel = useMemo(() => {
    if (!style.languages || style.languages.length === 0) return 'English';
    return style.languages.join(', ');
  }, [style.languages]);

  return (
    <button
      onClick={onClick}
      className={`
        w-full group relative flex flex-col gap-2 p-3.5 text-left border-b border-zinc-200 transition-all
        ${isSelected 
          ? 'bg-zinc-100 text-zinc-950 border-zinc-300' 
          : 'bg-white hover:bg-zinc-50 text-zinc-800'
        }
      `}
    >
      <div className="flex items-start gap-3 w-full">
        <div className={`
          w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center border border-zinc-200 overflow-hidden shadow-xs
          ${getColorClass(style.color, true)}
        `}>
          {style.avatarSrc && !imgError ? (
            <img 
              src={style.avatarSrc} 
              alt={style.name} 
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            getIcon(style.icon, "w-5 h-5 text-white")
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className={`text-xs font-mono font-bold tracking-tight text-zinc-900 truncate ${isSelected ? 'underline decoration-2 decoration-amber-500 underline-offset-2' : ''}`}>
              {style.name}
            </span>
            {categoryLabel && (
              <span className="text-[8px] font-mono font-bold bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded tracking-wide shrink-0">
                {categoryLabel}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[9px] font-mono text-zinc-500">
            <span>Voice: <strong className="text-zinc-700">{style.defaultVoice}</strong></span>
            <span className="text-zinc-300">•</span>
            <span>Lang: <strong className="text-zinc-700">{languagesLabel}</strong></span>
          </div>
        </div>
      </div>

      <p className="text-[10px] font-mono text-zinc-500 line-clamp-2 leading-relaxed pl-[52px]">
        {shortDesc}
      </p>

      {isSelected && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-500" />
      )}
    </button>
  );
};

const CATEGORIES = ['ALL', 'CINEMATIC', 'CREATOR', 'STORY', 'BROADCAST', 'INDIAN', 'EDUCATION'] as const;
type CategoryType = typeof CATEGORIES[number];

const categoryMapping: Record<Exclude<CategoryType, 'ALL'>, string> = {
  CINEMATIC: 'cinematic',
  CREATOR: 'creator',
  STORY: 'storytelling',
  BROADCAST: 'broadcast',
  INDIAN: 'south_asian',
  EDUCATION: 'education'
};

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect, onCustomize }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('ALL');

  const filteredStyles = useMemo(() => {
    let result = INTRO_STYLES;

    // Filter by active category
    if (activeCategory !== 'ALL') {
      const targetCategory = categoryMapping[activeCategory];
      result = result.filter(s => s.category === targetCategory);
    }

    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase();
    
    return result.filter(s => {
      const nameMatch = s.name.toLowerCase().includes(q);
      const descMatch = s.description.toLowerCase().includes(q);
      const catMatch = s.category ? s.category.toLowerCase().includes(q) : false;
      const langMatch = s.languages ? s.languages.some(l => l.toLowerCase().includes(q)) : false;
      const useCaseMatch = s.useCases ? s.useCases.some(u => u.toLowerCase().includes(q)) : false;
      const tagMatch = s.tags ? s.tags.some(t => t.toLowerCase().includes(q)) : false;
      
      return nameMatch || descMatch || catMatch || langMatch || useCaseMatch || tagMatch;
    });
  }, [searchQuery, activeCategory]);

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
            placeholder="Search name, category, language, tag..."
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

      {/* Horizontally Scrollable Category Filters */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="flex gap-1 overflow-x-auto px-2.5 py-2 scrollbar-none whitespace-nowrap scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded border transition-all flex-shrink-0
                ${activeCategory === cat
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900'
                }
              `}
            >
              {cat}
            </button>
          ))}
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
