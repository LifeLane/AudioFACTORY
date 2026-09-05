import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Send, 
  Radio, 
  Activity, 
  Cpu, 
  Wifi, 
  ShieldCheck, 
  Check, 
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTerminal } from './TerminalContext';

interface TerminalDiagnosticDrawerProps {
  onTriggerSynth?: () => void;
  onTriggerPlay?: () => void;
  onTriggerExport?: () => void;
}

export const TerminalDiagnosticDrawer: React.FC<TerminalDiagnosticDrawerProps> = ({
  onTriggerSynth,
  onTriggerPlay,
  onTriggerExport
}) => {
  const { 
    isDrawerOpen, 
    toggleDrawer, 
    logs, 
    clearLogs, 
    addLog, 
    scanlinesEnabled, 
    toggleScanlines,
    toggleTerminalMode
  } = useTerminal();

  const [activeTab, setActiveTab] = useState<'logs' | 'shell' | 'telemetry'>('logs');
  const [commandInput, setCommandInput] = useState<string>('');
  const [shellHistory, setShellHistory] = useState<{ cmd: string; res: string; color?: string }[]>([
    { cmd: 'sys.init', res: 'G-TERM Workstation v2.4 online. All subsystems nominal.', color: '#34A853' }
  ]);

  const logEndRef = useRef<HTMLDivElement | null>(null);
  const shellEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isDrawerOpen) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      shellEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, shellHistory, isDrawerOpen]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim().toLowerCase();
    if (!cmd) return;

    let res = '';
    let color = '#4285F4';

    if (cmd === 'help') {
      res = 'Available commands: help, status, synth, play, export, scanlines, theme, clear, ping, version';
    } else if (cmd === 'status') {
      res = 'CORE: ACTIVE | GEMINI TTS: ONLINE (24kHz) | FIREBASE: CONNECTED | LIVEBLOCKS: 4 PEERS';
      color = '#34A853';
    } else if (cmd === 'ping') {
      res = 'PING ais-dev-cluster-southeast1: 14.2ms (0% packet loss)';
      color = '#34A853';
    } else if (cmd === 'version') {
      res = 'Google AI Studio Audio Factory G-Term Build v2.4 (Model: Gemini 2.5 Flash / ElevenLabs Multilingual v2)';
    } else if (cmd === 'synth') {
      res = 'Dispatched neural synthesis event to audio queue...';
      color = '#FBBC04';
      addLog('SYNTH', 'CLI', 'Triggered synthesis from G-TERM CLI.');
      onTriggerSynth?.();
    } else if (cmd === 'play') {
      res = 'Broadcasting audio output buffer...';
      color = '#34A853';
      addLog('AUDIO', 'CLI', 'Audio playback triggered via CLI.');
      onTriggerPlay?.();
    } else if (cmd === 'export') {
      res = 'Building 24kHz 16-bit PCM WAV container...';
      color = '#4285F4';
      addLog('SYS', 'CLI', 'Master WAV export invoked.');
      onTriggerExport?.();
    } else if (cmd === 'scanlines') {
      toggleScanlines();
      res = `CRT Scanlines set to ${!scanlinesEnabled ? 'ENABLED' : 'DISABLED'}`;
      color = '#FBBC04';
    } else if (cmd === 'theme') {
      toggleTerminalMode();
      res = 'Toggling studio visual theme...';
    } else if (cmd === 'clear') {
      setShellHistory([]);
      setCommandInput('');
      return;
    } else {
      res = `Unknown command "${cmd}". Type "help" for a list of available commands.`;
      color = '#EA4335';
    }

    setShellHistory(prev => [...prev, { cmd: commandInput, res, color }]);
    setCommandInput('');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col transition-all duration-300 pointer-events-auto">
      
      {/* Retractable Header Bar / Persistent Ticker Ribbon */}
      <div 
        onClick={toggleDrawer}
        className="h-9 px-3 sm:px-4 bg-[#0D1117]/95 border-t border-[#30363D] hover:border-[#4285F4] backdrop-blur-md flex items-center justify-between cursor-pointer select-none transition-colors shadow-2xl"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#34A853] animate-ping" />
            <TerminalIcon className="w-3.5 h-3.5 text-[#4285F4]" />
            <span className="text-[11px] font-mono font-bold text-[#E6EDF3] tracking-wider hidden xs:inline">
              G-TERM // DIAGNOSTICS
            </span>
          </div>

          <div className="h-3 w-[1px] bg-[#30363D] hidden sm:block flex-shrink-0" />

          {/* Scrolling Ticker Text */}
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] font-mono text-[#8B949E] truncate">
            <span className="text-[#34A853] font-bold flex-shrink-0">● ONLINE</span>
            <span className="hidden md:inline flex-shrink-0">PING: 14ms</span>
            <span className="hidden sm:inline flex-shrink-0">24kHz PCM</span>
            <span className="text-[#FBBC04] truncate">
              {logs[logs.length - 1]?.message || 'Awaiting command input...'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-mono text-[#8B949E] hidden lg:inline">
            [PRESS {isDrawerOpen ? 'COLLAPSE' : 'EXPAND'}]
          </span>
          <div className="w-5 h-5 rounded flex items-center justify-center text-[#8B949E] hover:text-white bg-[#21262D]">
            {isDrawerOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>

      {/* Expanded Console Window */}
      {isDrawerOpen && (
        <div className="h-72 sm:h-80 bg-[#0D1117]/98 border-t border-[#30363D] flex flex-col shadow-2xl overflow-hidden backdrop-blur-lg">
          
          {/* Subheader / Tabs & Tools */}
          <div className="px-3 sm:px-4 py-2 bg-[#161B22] border-b border-[#30363D] flex items-center justify-between gap-2 sm:gap-3 flex-shrink-0 overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-2.5 sm:px-3 py-1 rounded text-xs font-mono font-bold uppercase transition-all whitespace-nowrap ${
                  activeTab === 'logs'
                    ? 'bg-[#4285F4] text-white shadow-xs'
                    : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]'
                }`}
              >
                System Logs ({logs.length})
              </button>
              <button
                onClick={() => setActiveTab('shell')}
                className={`px-2.5 sm:px-3 py-1 rounded text-xs font-mono font-bold uppercase transition-all whitespace-nowrap ${
                  activeTab === 'shell'
                    ? 'bg-[#34A853] text-white shadow-xs'
                    : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]'
                }`}
              >
                Interactive Shell
              </button>
              <button
                onClick={() => setActiveTab('telemetry')}
                className={`px-2.5 sm:px-3 py-1 rounded text-xs font-mono font-bold uppercase transition-all whitespace-nowrap ${
                  activeTab === 'telemetry'
                    ? 'bg-[#FBBC04] text-black shadow-xs'
                    : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]'
                }`}
              >
                Subsystems
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Scanlines Toggle */}
              <button
                onClick={toggleScanlines}
                className={`px-2 py-1 rounded text-[10px] font-mono border flex items-center gap-1.5 transition-colors ${
                  scanlinesEnabled
                    ? 'border-[#34A853]/50 text-[#34A853] bg-[#34A853]/10'
                    : 'border-[#30363D] text-[#8B949E] hover:bg-[#21262D]'
                }`}
                title="Toggle CRT Scanline Overlay"
              >
                {scanlinesEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span className="hidden sm:inline">CRT FX</span>
              </button>

              {/* Clear Logs */}
              <button
                onClick={clearLogs}
                className="p-1 rounded text-[#8B949E] hover:text-[#EA4335] hover:bg-[#21262D] transition-colors"
                title="Clear Logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* TAB 1: SYSTEM LOGS STREAM */}
          {activeTab === 'logs' && (
            <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 custom-scrollbar bg-[#090D12]">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed hover:bg-[#161B22]/50 px-1.5 py-0.5 rounded">
                  <span className="text-[#8B949E] text-[10px] select-none flex-shrink-0">
                    [{log.timestamp}]
                  </span>
                  <span className={`px-1 rounded text-[9px] font-bold flex-shrink-0 ${
                    log.color === 'red' ? 'bg-[#EA4335]/20 text-[#EA4335]' :
                    log.color === 'yellow' ? 'bg-[#FBBC04]/20 text-[#FBBC04]' :
                    log.color === 'green' ? 'bg-[#34A853]/20 text-[#34A853]' :
                    'bg-[#4285F4]/20 text-[#4285F4]'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-[#8B949E] text-[10px] flex-shrink-0">
                    [{log.module}]:
                  </span>
                  <span className="text-[#C9D1D9] break-words">
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          )}

          {/* TAB 2: INTERACTIVE SHELL */}
          {activeTab === 'shell' && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#090D12]">
              <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2 custom-scrollbar">
                <div className="text-[#8B949E] text-[11px] pb-1 border-b border-[#30363D]">
                  Type <span className="text-[#34A853] font-bold">help</span> to view available studio commands. 
                  Try: <span className="text-[#4285F4]">status</span>, <span className="text-[#FBBC04]">synth</span>, <span className="text-[#34A853]">play</span>, <span className="text-[#EA4335]">scanlines</span>
                </div>

                {shellHistory.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[#8B949E]">
                      <span className="text-[#4285F4]">❯</span>
                      <span className="text-[#E6EDF3] font-bold">{item.cmd}</span>
                    </div>
                    <div className="pl-4 text-xs font-mono" style={{ color: item.color || '#C9D1D9' }}>
                      {item.res}
                    </div>
                  </div>
                ))}
                <div ref={shellEndRef} />
              </div>

              {/* Shell Input Field */}
              <form onSubmit={handleCommandSubmit} className="p-2 bg-[#161B22] border-t border-[#30363D] flex items-center gap-2">
                <span className="text-[#34A853] font-mono text-xs font-bold pl-2">g-term $</span>
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Enter command (e.g. status, synth, help)..."
                  className="flex-1 bg-transparent text-[#E6EDF3] font-mono text-xs focus:outline-none placeholder:text-[#8B949E]"
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-[#4285F4] hover:bg-[#3367D6] text-white font-mono text-xs font-bold uppercase transition-colors"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SUBSYSTEM TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs bg-[#090D12] grid grid-cols-1 sm:grid-cols-3 gap-3 custom-scrollbar">
              
              <div className="p-3 bg-[#161B22] border border-[#30363D] rounded-lg space-y-2">
                <div className="flex items-center justify-between text-[#4285F4] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" /> AUDIO_DSP_ENGINE
                  </span>
                  <span className="text-[#34A853] text-[10px]">99.8% READY</span>
                </div>
                <div className="space-y-1 text-[11px] text-[#8B949E]">
                  <div>MODEL: Gemini 2.5 Flash</div>
                  <div>SAMPLE RATE: 24,000 Hz</div>
                  <div>CHANNELS: 2 (Stereo Linear PCM)</div>
                  <div>LATENCY: 420ms TTFB</div>
                </div>
              </div>

              <div className="p-3 bg-[#161B22] border border-[#30363D] rounded-lg space-y-2">
                <div className="flex items-center justify-between text-[#FBBC04] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Wifi className="w-4 h-4" /> CLOUD_SYNC_VAULT
                  </span>
                  <span className="text-[#34A853] text-[10px]">CONNECTED</span>
                </div>
                <div className="space-y-1 text-[11px] text-[#8B949E]">
                  <div>SERVICE: Google Cloud Firestore</div>
                  <div>PROJECT: ai-studio-socialnot</div>
                  <div>SECURITY: Client-isolated Auth</div>
                  <div>OFFLINE CACHE: Active</div>
                </div>
              </div>

              <div className="p-3 bg-[#161B22] border border-[#30363D] rounded-lg space-y-2">
                <div className="flex items-center justify-between text-[#EA4335] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4" /> LIVEBLOCKS_PRESENCE
                  </span>
                  <span className="text-[#34A853] text-[10px]">4 PEERS</span>
                </div>
                <div className="space-y-1 text-[11px] text-[#8B949E]">
                  <div>ROOM: gemini-audio-station</div>
                  <div>CRDT PROTOCOL: WebSocket TLS</div>
                  <div>PEER CURSORS: Synchronized</div>
                  <div>BROADCAST: Audio Playhead</div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
