import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TerminalLogEntry {
  id: string;
  timestamp: string;
  level: 'SYS' | 'AUDIO' | 'SYNTH' | 'NET' | 'WARN' | 'ERR';
  color: 'blue' | 'red' | 'yellow' | 'green' | 'zinc';
  module: string;
  message: string;
}

interface TerminalContextValue {
  isTerminalMode: boolean;
  setIsTerminalMode: (val: boolean) => void;
  toggleTerminalMode: () => void;
  scanlinesEnabled: boolean;
  setScanlinesEnabled: (val: boolean) => void;
  toggleScanlines: () => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (val: boolean) => void;
  toggleDrawer: () => void;
  logs: TerminalLogEntry[];
  addLog: (level: TerminalLogEntry['level'], module: string, message: string) => void;
  clearLogs: () => void;
  isAudioActive: boolean;
  setIsAudioActive: (val: boolean) => void;
  terminalTheme: 'classic' | 'googly';
  setTerminalTheme: (val: 'classic' | 'googly') => void;
}

const TerminalContext = createContext<TerminalContextValue | undefined>(undefined);

const INITIAL_LOGS: TerminalLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '00:00:01',
    level: 'SYS',
    color: 'blue',
    module: 'CORE',
    message: 'G-TERM Workstation Kernel v2.4 initialized on Cloud Run.'
  },
  {
    id: 'log-2',
    timestamp: '00:00:02',
    level: 'NET',
    color: 'green',
    module: 'FIREBASE',
    message: 'Firestore security rules & real-time telemetry socket linked.'
  },
  {
    id: 'log-3',
    timestamp: '00:00:03',
    level: 'SYNTH',
    color: 'yellow',
    module: 'GEMINI',
    message: 'Gemini 2.5 Flash TTS voice pipeline armed: 24kHz linear PCM.'
  },
  {
    id: 'log-4',
    timestamp: '00:00:04',
    level: 'AUDIO',
    color: 'blue',
    module: 'ELEVENLABS',
    message: 'Audio stems & ElevenLabs soundscape engine synchronized.'
  }
];

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTerminalMode, setIsTerminalMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('g_terminal_mode');
    return saved !== null ? saved === 'true' : true; // Default to terminal mode per user request!
  });

  const [scanlinesEnabled, setScanlinesEnabled] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [logs, setLogs] = useState<TerminalLogEntry[]>(INITIAL_LOGS);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [terminalTheme, setTerminalTheme] = useState<'classic' | 'googly'>(() => {
    const saved = localStorage.getItem('g_terminal_theme');
    return (saved === 'classic' || saved === 'googly') ? saved : 'classic';
  });

  useEffect(() => {
    localStorage.setItem('g_terminal_theme', terminalTheme);
  }, [terminalTheme]);

  useEffect(() => {
    localStorage.setItem('g_terminal_mode', String(isTerminalMode));
    if (isTerminalMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isTerminalMode]);

  const toggleTerminalMode = () => setIsTerminalMode(prev => !prev);
  const toggleScanlines = () => setScanlinesEnabled(prev => !prev);
  const toggleDrawer = () => setIsDrawerOpen(prev => !prev);

  const addLog = (level: TerminalLogEntry['level'], module: string, message: string) => {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    
    let color: TerminalLogEntry['color'] = 'blue';
    if (level === 'ERR') color = 'red';
    else if (level === 'WARN') color = 'yellow';
    else if (level === 'SYNTH') color = 'yellow';
    else if (level === 'NET' || level === 'AUDIO') color = 'green';

    setLogs(prev => [
      ...prev.slice(-99), // Keep latest 100 logs
      {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        timestamp,
        level,
        color,
        module,
        message
      }
    ]);
  };

  const clearLogs = () => setLogs([]);

  return (
    <TerminalContext.Provider
      value={{
        isTerminalMode,
        setIsTerminalMode,
        toggleTerminalMode,
        scanlinesEnabled,
        setScanlinesEnabled,
        toggleScanlines,
        isDrawerOpen,
        setIsDrawerOpen,
        toggleDrawer,
        logs,
        addLog,
        clearLogs,
        isAudioActive,
        setIsAudioActive,
        terminalTheme,
        setTerminalTheme
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminal = () => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }
  return context;
};
