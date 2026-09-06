import React, { useState } from 'react';
import { 
  Minimize2, 
  Maximize2, 
  X, 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  Minus, 
  Square, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useTerminal } from './TerminalContext';

export interface TerminalWindowProps {
  id?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'blue' | 'red' | 'yellow' | 'green';
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  onClose?: () => void;
  defaultMinimized?: boolean;
  isMinimized?: boolean;
  onMinimizeChange?: (minimized: boolean) => void;
  canMaximize?: boolean;
  accentColor?: 'blue' | 'red' | 'yellow' | 'green';
}

export const TerminalWindow: React.FC<TerminalWindowProps> = ({
  id,
  title,
  subtitle,
  badge,
  badgeColor = 'green',
  children,
  className = '',
  headerActions,
  onClose,
  defaultMinimized = false,
  isMinimized: isMinimizedProp,
  onMinimizeChange,
  canMaximize = true,
  accentColor = 'blue'
}) => {
  const [internalMinimized, setInternalMinimized] = useState<boolean>(defaultMinimized);
  const isMinimized = isMinimizedProp !== undefined ? isMinimizedProp : internalMinimized;
  const { terminalTheme } = useTerminal();
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  const setIsMinimized = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isMinimized) : val;
    if (isMinimizedProp === undefined) {
      setInternalMinimized(nextVal);
    }
    if (onMinimizeChange) {
      onMinimizeChange(nextVal);
    }
  };

  const getGooglyBorderAndShadow = () => {
    if (terminalTheme !== 'googly') return 'border-[#30363D] shadow-2xl';
    switch (accentColor) {
      case 'red': return 'border-[#EA4335]/70 shadow-[0_0_20px_rgba(234,67,53,0.18)]';
      case 'yellow': return 'border-[#FBBC04]/70 shadow-[0_0_20px_rgba(251,188,4,0.18)]';
      case 'green': return 'border-[#34A853]/70 shadow-[0_0_20px_rgba(52,168,83,0.18)]';
      case 'blue':
      default:
        return 'border-[#4285F4]/70 shadow-[0_0_20px_rgba(66,133,244,0.18)]';
    }
  };

  const getGooglyLeftAccent = () => {
    if (terminalTheme !== 'googly') return '';
    switch (accentColor) {
      case 'red': return 'border-l-[5px] border-l-[#EA4335]';
      case 'yellow': return 'border-l-[5px] border-l-[#FBBC04]';
      case 'green': return 'border-l-[5px] border-l-[#34A853]';
      case 'blue':
      default:
        return 'border-l-[5px] border-l-[#4285F4]';
    }
  };

  const getAccentBorderClass = () => {
    switch (accentColor) {
      case 'red': return 'hover:border-[#EA4335] focus-within:border-[#EA4335]';
      case 'yellow': return 'hover:border-[#FBBC04] focus-within:border-[#FBBC04]';
      case 'green': return 'hover:border-[#34A853] focus-within:border-[#34A853]';
      case 'blue': 
      default:
        return 'hover:border-[#4285F4] focus-within:border-[#4285F4]';
    }
  };

  const getBadgeClass = () => {
    switch (badgeColor) {
      case 'red': return 'bg-[#EA4335]/15 text-[#EA4335] border-[#EA4335]/30';
      case 'yellow': return 'bg-[#FBBC04]/15 text-[#FBBC04] border-[#FBBC04]/30';
      case 'green': return 'bg-[#34A853]/15 text-[#34A853] border-[#34A853]/30';
      case 'blue':
      default:
        return 'bg-[#4285F4]/15 text-[#4285F4] border-[#4285F4]/30';
    }
  };

  const parsedClassName = isMinimized 
    ? className.replace(/\b(h-full|h-\[.*?\]|flex-1)\b/g, '') + ' h-auto flex-initial'
    : className;

  return (
    <div
      id={id}
      className={`relative rounded-xl border bg-[#161B22]/95 backdrop-blur-md transition-all duration-250 flex flex-col ${getGooglyBorderAndShadow()} ${getGooglyLeftAccent()} ${getAccentBorderClass()} ${
        isMaximized 
          ? 'fixed inset-4 z-50 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]' 
          : 'overflow-hidden'
      } ${parsedClassName}`}
    >
      {/* Terminal Title Bar */}
      <div className="px-3.5 py-2.5 bg-[#0D1117]/90 border-b border-[#30363D] flex items-center justify-between gap-3 select-none flex-shrink-0">
        
        {/* Left: Google 4-Color Tactile Window Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Red Control (Close / Reset) */}
          <button
            onClick={onClose ? onClose : () => setIsMinimized(true)}
            className="w-3 h-3 rounded-full bg-[#EA4335] hover:brightness-125 border border-[#EA4335]/40 flex items-center justify-center text-black/70 opacity-90 hover:opacity-100 transition-transform active:scale-90"
            title={onClose ? 'Close Window' : 'Collapse Window'}
            aria-label="Close"
          >
            <X className="w-2 h-2 opacity-0 hover:opacity-100 transition-opacity" />
          </button>

          {/* Yellow Control (Minimize / Fold) */}
          <button
            onClick={() => setIsMinimized(prev => !prev)}
            className="w-3 h-3 rounded-full bg-[#FBBC04] hover:brightness-125 border border-[#FBBC04]/40 flex items-center justify-center text-black/70 opacity-90 hover:opacity-100 transition-transform active:scale-90"
            title={isMinimized ? 'Expand Window' : 'Minimize Window'}
            aria-label="Minimize"
          >
            <Minus className="w-2 h-2 opacity-0 hover:opacity-100 transition-opacity" />
          </button>

          {/* Green Control (Maximize / Fullscreen Focus) */}
          {canMaximize && (
            <button
              onClick={() => setIsMaximized(prev => !prev)}
              className="w-3 h-3 rounded-full bg-[#34A853] hover:brightness-125 border border-[#34A853]/40 flex items-center justify-center text-black/70 opacity-90 hover:opacity-100 transition-transform active:scale-90"
              title={isMaximized ? 'Restore Size' : 'Maximize Window'}
              aria-label="Maximize"
            >
              {isMaximized ? (
                <Minimize2 className="w-2 h-2 opacity-0 hover:opacity-100 transition-opacity" />
              ) : (
                <Maximize2 className="w-2 h-2 opacity-0 hover:opacity-100 transition-opacity" />
              )}
            </button>
          )}

          {/* Terminal Prompt Prefix */}
          <span className="text-[11px] font-mono font-bold text-[#8B949E] flex items-center gap-1.5 ml-1.5">
            <span className="text-[#4285F4]">❯</span>
            <span className="text-[#8B949E] hidden sm:inline">G-TERM:</span>
          </span>
        </div>

        {/* Center: Window Title & Subtitle */}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-start">
          <span className="text-xs font-mono font-bold text-[#E6EDF3] tracking-wide truncate">
            {title}
          </span>
          {subtitle && (
            <span className="text-[10px] font-mono text-[#8B949E] hidden md:inline truncate">
              // {subtitle}
            </span>
          )}
        </div>

        {/* Right: Badge & Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {badge && (
            <span className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getBadgeClass()}`}>
              {badge}
            </span>
          )}

          {headerActions}

          {/* Collapse/Expand Chevron Toggle */}
          <button
            onClick={() => setIsMinimized(prev => !prev)}
            className="p-1 rounded text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors"
            title={isMinimized ? 'Expand' : 'Collapse'}
          >
            {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      {/* Window Body (Animated folding on minimize) */}
      {!isMinimized && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#161B22] text-[#C9D1D9] transition-all">
          {children}
        </div>
      )}

      {/* Minimized Placeholder Strip */}
      {isMinimized && (
        <div 
          onClick={() => setIsMinimized(false)}
          className="px-4 py-2 bg-[#0D1117]/60 text-center cursor-pointer text-[11px] font-mono text-[#8B949E] hover:text-[#4285F4] hover:bg-[#161B22] transition-colors flex items-center justify-center gap-2"
        >
          <span>[WINDOW COLLAPSED - CLICK TO RESTORE]</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#FBBC04]" />
        </div>
      )}
    </div>
  );
};
