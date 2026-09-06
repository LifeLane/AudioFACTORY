import React from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  Download, 
  RefreshCw, 
  Volume2, 
  Wand2, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Cloud, 
  FolderOpen, 
  ChevronUp, 
  ChevronDown, 
  Users, 
  Square 
} from 'lucide-react';
import { SceneSpeaker, DialogueLine } from '../../types';
import { ALL_VOICES } from '../../voices';
import { TerminalWindow } from './TerminalWindow';
import { LivePresenceBar } from '../LivePresenceBar';
import { QuotaExhaustedBanner } from '../QuotaExhaustedBanner';

const SPEAKER_COLOR_MAP: Record<string, { bg: string; text: string; dot: string; ring: string; lightBg: string }> = {
  yellow: { 
    bg: 'bg-amber-400', 
    text: 'text-zinc-950', 
    dot: 'bg-amber-500', 
    ring: 'ring-amber-400',
    lightBg: 'bg-amber-50/70'
  },
  blue: { 
    bg: 'bg-sky-600', 
    text: 'text-white', 
    dot: 'bg-sky-500', 
    ring: 'ring-sky-500',
    lightBg: 'bg-sky-50/70'
  },
  red: { 
    bg: 'bg-rose-600', 
    text: 'text-white', 
    dot: 'bg-rose-500', 
    ring: 'ring-rose-500',
    lightBg: 'bg-rose-50/70'
  },
  green: { 
    bg: 'bg-emerald-600', 
    text: 'text-white', 
    dot: 'bg-emerald-500', 
    ring: 'ring-emerald-500',
    lightBg: 'bg-emerald-50/70'
  },
  black: { 
    bg: 'bg-zinc-800', 
    text: 'text-white', 
    dot: 'bg-zinc-700', 
    ring: 'ring-zinc-600',
    lightBg: 'bg-zinc-50'
  },
};

const EMOTION_PRESETS = [
  'Natural',
  'Excited',
  'Confident',
  'Intrigued',
  'Dramatic',
  'Whispering',
  'Skeptical',
  'Humorous'
];

interface TerminalMultiSpeakerViewProps {
  projectTitle: string;
  format: string;
  setFormat: (v: string) => void;
  styleTone: string;
  setStyleTone: (v: string) => void;
  speakerCount: number;
  setSpeakerCount: (v: number) => void;
  topic: string;
  setTopic: (v: string) => void;
  speakers: SceneSpeaker[];
  setSpeakers: React.Dispatch<React.SetStateAction<SceneSpeaker[]>>;
  lines: DialogueLine[];
  setLines: React.Dispatch<React.SetStateAction<DialogueLine[]>>;
  readyCount: number;
  isPlayingFullSequence: boolean;
  isBatchGenerating: boolean;
  isSaving: boolean;
  justSaved: boolean;
  activeTool: 'generator' | 'analyzer' | null;
  setActiveTool: (v: 'generator' | 'analyzer' | null) => void;
  rawTextToAnalyze: string;
  setRawTextToAnalyze: (v: string) => void;
  isAnalyzing: boolean;
  isScriptGenerating: boolean;
  collapsedLineIds: Record<string, boolean>;
  toggleLineCollapse: (id: string) => void;
  toggleCollapseAll: () => void;
  handleMoveLine: (idx: number, dir: 'up' | 'down') => void;
  handleRemoveLine: (id: string) => void;
  handleAddLine: () => void;
  handleAddSpeaker: () => void;
  handleSpeakerVoiceChange: (name: string, voice: string, provider: 'gemini' | 'elevenlabs') => void;
  handlePlayFullScene: () => void;
  stopCurrentPlayback: () => void;
  handleGenerateAllLines: () => void;
  handleDownloadCombinedWav: () => void;
  handleSaveToCloud: () => void;
  onOpenCloudModal?: () => void;
  savedProjects: any[];
  elevenLabsVoices: any[];
  hasElevenLabsKey: boolean;
  batchProgress: { current: number; total: number };
  playLineAudio: (id: string, buf: AudioBuffer) => void;
  playingLineId: string | null;
  handleGenerateLine: (id: string) => void;
  handleAnalyzeContent: () => void;
  handleGenerateScriptWithAI: () => void;
}

export const TerminalMultiSpeakerView: React.FC<TerminalMultiSpeakerViewProps> = ({
  projectTitle,
  format,
  setFormat,
  styleTone,
  setStyleTone,
  speakerCount,
  setSpeakerCount,
  topic,
  setTopic,
  speakers,
  setSpeakers,
  lines,
  setLines,
  readyCount,
  isPlayingFullSequence,
  isBatchGenerating,
  isSaving,
  justSaved,
  activeTool,
  setActiveTool,
  rawTextToAnalyze,
  setRawTextToAnalyze,
  isAnalyzing,
  isScriptGenerating,
  collapsedLineIds,
  toggleLineCollapse,
  toggleCollapseAll,
  handleMoveLine,
  handleRemoveLine,
  handleAddLine,
  handleAddSpeaker,
  handleSpeakerVoiceChange,
  handlePlayFullScene,
  stopCurrentPlayback,
  handleGenerateAllLines,
  handleDownloadCombinedWav,
  handleSaveToCloud,
  onOpenCloudModal,
  savedProjects,
  elevenLabsVoices,
  hasElevenLabsKey,
  batchProgress,
  playLineAudio,
  playingLineId,
  handleGenerateLine,
  handleAnalyzeContent,
  handleGenerateScriptWithAI,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-3 sm:p-5 md:p-6 space-y-4 font-mono text-[#E1E4E8]">
      {/* 1. HEADER CONTROL STRIP */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3 mb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EA4335]/20 text-[#F28B82] border border-[#EA4335]/40 uppercase tracking-wider">
              G-TERM // MULTI_SPEAKER
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#30363D] text-[#8B949E] uppercase">
              {format}
            </span>
            <span className="text-[10px] text-[#8B949E] hidden lg:inline">
              • {styleTone}
            </span>
          </div>
          <h1 className="text-base font-bold text-[#E6EDF3] mt-1 uppercase tracking-tight">
            {projectTitle}
          </h1>
        </div>
        
        {/* Collaborative Presence */}
        <div className="flex items-center gap-2 scale-90 origin-right">
          <LivePresenceBar />
        </div>
      </div>

      {/* Quota Exhaustion Prompt */}
      <QuotaExhaustedBanner actionName="scene generation" />

      {/* 2. COLLAPSIBLE ACTIVE TOOLS (RENDERED AS FLOATING WINDOWS) */}
      {activeTool === 'generator' && (
        <TerminalWindow
          title="AI_SCRIPT_GENERATOR.sh"
          badge="Generative AI"
          accentColor="blue"
          onMinimizeChange={() => setActiveTool(null)}
        >
          <div className="p-4 space-y-4 bg-[#0D1117]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase text-[#8B949E] mb-1.5 font-bold tracking-wider">
                  Scene Prompt / Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. A founder pitching a skeptical venture capitalist..."
                  className="w-full px-3 py-2 border border-[#30363D] rounded-lg text-xs font-mono bg-[#161B22] text-[#E6EDF3] placeholder:text-[#8B949E] focus:border-[#4285F4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#8B949E] mb-1.5 font-bold tracking-wider">
                  Format
                </label>
                <select
                  value={format}
                  onChange={e => setFormat(e.target.value)}
                  className="w-full px-2.5 py-2 border border-[#30363D] rounded-lg text-xs font-mono bg-[#161B22] text-[#E6EDF3] focus:border-[#4285F4] focus:outline-none cursor-pointer"
                >
                  <option value="Podcast Dialogue">Podcast Dialogue</option>
                  <option value="All-Hands Kickoff">All-Hands Kickoff</option>
                  <option value="Movie Scene">Cinematic Scene</option>
                  <option value="Tech Debate">Tech Debate</option>
                  <option value="Comedy Sketch">Comedy Sketch</option>
                  <option value="News Interview">News Interview</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#8B949E] mb-1.5 font-bold tracking-wider">
                  Style Tone
                </label>
                <select
                  value={styleTone}
                  onChange={e => setStyleTone(e.target.value)}
                  className="w-full px-2.5 py-2 border border-[#30363D] rounded-lg text-xs font-mono bg-[#161B22] text-[#E6EDF3] focus:border-[#4285F4] focus:outline-none cursor-pointer"
                >
                  <option value="High Stakes & Dramatic">High Stakes & Dramatic</option>
                  <option value="Casual & Conversational">Casual & Conversational</option>
                  <option value="Hyper Energized & Hype">Hyper Energized & Hype</option>
                  <option value="Playful & Witty">Playful & Witty</option>
                  <option value="Suspenseful & Mysterious">Suspenseful & Mysterious</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8B949E]">Speakers:</span>
                {[2, 3, 4].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSpeakerCount(num)}
                    className={`w-7 h-7 rounded border text-xs font-bold transition-all ${
                      speakerCount === num 
                        ? 'bg-[#E6EDF3] text-[#0D1117] border-[#E6EDF3]' 
                        : 'bg-[#161B22] text-[#8B949E] border-[#30363D] hover:bg-[#21262D]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateScriptWithAI}
                disabled={isScriptGenerating || !topic.trim()}
                className="px-4 py-2 rounded-lg border border-[#4285F4] bg-[#4285F4]/15 hover:bg-[#4285F4]/25 text-[#8AB4F8] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs"
              >
                {isScriptGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Write Script with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </TerminalWindow>
      )}

      {activeTool === 'analyzer' && (
        <TerminalWindow
          title="AUTO_DETECTION_ENGINE.sh"
          badge="Speaker Extract"
          accentColor="yellow"
          onMinimizeChange={() => setActiveTool(null)}
        >
          <div className="p-4 space-y-3.5 bg-[#0D1117]">
            <p className="text-xs text-[#8B949E] leading-relaxed">
              Paste any article excerpt, screenplay dialogue, or meeting transcript below. Gemini will automatically decompose the text into distinct speakers, emotions, and structured dialogue scenes.
            </p>
            <textarea
              value={rawTextToAnalyze}
              onChange={e => setRawTextToAnalyze(e.target.value)}
              placeholder="Paste your dialogue script here (e.g. 'Sarah: Did you review the numbers?\nMark: Not yet.')"
              className="w-full h-32 p-3 border border-[#30363D] rounded-lg text-xs font-mono bg-[#161B22] text-[#E6EDF3] placeholder:text-[#8B949E] focus:border-[#FBBC04] focus:outline-none resize-y"
            />
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setActiveTool(null)}
                className="px-3.5 py-1.5 rounded-lg border border-[#30363D] bg-[#161B22] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] text-xs uppercase font-bold tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleAnalyzeContent}
                disabled={isAnalyzing || !rawTextToAnalyze.trim()}
                className="px-4 py-1.5 rounded-lg border border-[#FBBC04] bg-[#FBBC04]/15 hover:bg-[#FBBC04]/25 text-[#FDD663] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Content...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Analyze & Parse Speakers</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </TerminalWindow>
      )}

      {/* 3. BENTO 2-COLUMN GRID WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden">
        {/* COLUMN A: CAST ROSTER (4 cols) */}
        <div className="lg:col-span-4 flex flex-col min-h-0 overflow-hidden">
          <TerminalWindow
            title="CAST_VOICE_ROSTER.conf"
            badge={`Speakers: ${speakers.length}`}
            accentColor="yellow"
          >
            <div className="flex-1 flex flex-col min-h-0 bg-[#0D1117] text-xs">
              <div className="p-3 border-b border-[#30363D] flex items-center justify-between bg-[#161B22]/40">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FBBC04]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E6EDF3]">
                    Cast & Voice Roster
                  </span>
                </div>
                <button
                  onClick={handleAddSpeaker}
                  className="text-[10px] font-bold text-[#8AB4F8] hover:text-[#ADCCFF] flex items-center gap-0.5 uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {/* Scrollable list of cast speakers */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar">
                {speakers.map((sp, idx) => {
                  const theme = SPEAKER_COLOR_MAP[sp.color || 'yellow'] || SPEAKER_COLOR_MAP.yellow;
                  return (
                    <div 
                      key={idx} 
                      className="p-3 rounded-lg border border-[#30363D] bg-[#161B22] hover:border-[#8B949E]/40 transition-all space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2.5 h-2.5 rounded-full ${theme.dot} flex-shrink-0 shadow-[0_0_8px_currentColor]`} />
                          <span className="font-bold text-[#E6EDF3] truncate">
                            {sp.name}
                          </span>
                        </div>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#30363D] text-[#8B949E] border border-[#30363D]">
                          {sp.gender || 'MALE'}
                        </span>
                      </div>

                      {/* Provider selects */}
                      <div className="flex rounded-lg border border-[#30363D] p-0.5 bg-[#0D1117] text-[10px]">
                        <button
                          type="button"
                          onClick={() => handleSpeakerVoiceChange(sp.name, 'Algieba', 'gemini')}
                          className={`flex-1 py-1 rounded-md text-center font-bold uppercase tracking-wider transition-all ${
                            sp.provider === 'gemini' 
                              ? 'bg-[#30363D] text-[#E6EDF3] shadow-xs' 
                              : 'text-[#8B949E] hover:text-[#E6EDF3]'
                          }`}
                        >
                          Gemini
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSpeakerVoiceChange(sp.name, '21m00Tcm4TlvDq8ikWAM', 'elevenlabs')}
                          className={`flex-1 py-1 rounded-md text-center font-bold uppercase tracking-wider transition-all ${
                            sp.provider === 'elevenlabs' 
                              ? 'bg-[#4285F4]/20 text-[#8AB4F8] border border-[#4285F4]/30 shadow-xs' 
                              : 'text-[#8B949E] hover:text-[#E6EDF3]'
                          }`}
                        >
                          ElevenLabs
                        </button>
                      </div>

                      {/* Voice Model Dropdowns */}
                      <div>
                        {sp.provider === 'gemini' ? (
                          <select
                            value={sp.voice}
                            onChange={e => handleSpeakerVoiceChange(sp.name, e.target.value, 'gemini')}
                            className="w-full p-1.5 border border-[#30363D] rounded-lg text-xs font-mono bg-[#0D1117] text-[#E6EDF3] focus:border-[#4285F4] focus:ring-0 cursor-pointer"
                          >
                            {ALL_VOICES.map(v => (
                              <option key={v.name} value={v.name} className="bg-[#161B22] text-[#E6EDF3]">
                                {v.name} ({v.style})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={sp.voice}
                            onChange={e => handleSpeakerVoiceChange(sp.name, e.target.value, 'elevenlabs')}
                            className="w-full p-1.5 border border-[#30363D] rounded-lg text-xs font-mono bg-[#0D1117] text-[#E6EDF3] focus:border-[#4285F4] focus:ring-0 cursor-pointer"
                          >
                            {elevenLabsVoices.map(v => (
                              <option key={v.id} value={v.id} className="bg-[#161B22] text-[#E6EDF3]">
                                {v.name} ({v.gender})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Session diagnostics block */}
                <div className="p-3 rounded-lg border border-[#30363D] bg-[#161B22]/40 space-y-2 text-[11px] text-[#8B949E]">
                  <div className="text-[10px] uppercase font-bold text-[#E6EDF3] tracking-wider mb-1">
                    Session Diagnostics
                  </div>
                  <div className="flex justify-between">
                    <span>Dialogue Turns:</span>
                    <span className="font-bold text-[#E6EDF3]">{lines.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Synthesized:</span>
                    <span className="font-bold text-[#34A853]">{readyCount} / {lines.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ElevenLabs Key:</span>
                    <span className={`font-bold ${hasElevenLabsKey ? 'text-[#34A853]' : 'text-[#FBBC04]'}`}>
                      {hasElevenLabsKey ? 'DET_SECURE' : 'FALLBACK'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TerminalWindow>
        </div>

        {/* COLUMN B: SCRIPT WORKSPACE (8 cols) */}
        <div className="lg:col-span-8 flex flex-col min-h-0 overflow-hidden">
          <TerminalWindow
            title="SCRIPT_TIMELINE_BUFFER.json"
            badge={`Turns: ${lines.length}`}
            accentColor="green"
            headerActions={
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleCollapseAll}
                  className="px-2 py-0.5 rounded border border-[#30363D] bg-[#161B22] text-[#8B949E] hover:text-[#E6EDF3] text-[10px] font-bold uppercase tracking-wider"
                >
                  Collapse All
                </button>
                <button
                  onClick={handleAddLine}
                  className="px-2 py-0.5 rounded border border-[#34A853]/50 bg-[#34A853]/15 text-[#81C995] hover:bg-[#34A853]/25 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Turn
                </button>
              </div>
            }
          >
            <div className="flex-1 flex flex-col min-h-0 bg-[#0D1117] p-3.5 space-y-3.5 overflow-y-auto custom-scrollbar">
              {lines.map((line, idx) => {
                const sp = speakers.find(s => s.name === line.speaker) || speakers[0];
                const theme = SPEAKER_COLOR_MAP[sp?.color || 'yellow'] || SPEAKER_COLOR_MAP.yellow;
                const isPlayingThis = playingLineId === line.id;
                const isGeneratingThis = line.status === 'generating';
                const isCollapsed = collapsedLineIds[line.id];

                return (
                  <div
                    key={line.id}
                    className={`rounded-lg border transition-all duration-150 overflow-hidden ${
                      isPlayingThis
                        ? 'border-[#FBBC04] bg-[#FBBC04]/5 shadow-[0_0_15px_rgba(251,188,4,0.15)]'
                        : 'border-[#30363D] bg-[#161B22] hover:border-[#8B949E]/40'
                    }`}
                  >
                    {/* TURN HEADER */}
                    <div className="px-3 py-2 border-b border-[#30363D] flex items-center justify-between gap-2 bg-[#161B22]/50 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Ordering controls */}
                        <div className="flex items-center text-[#8B949E]">
                          <button
                            onClick={() => handleMoveLine(idx, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 hover:text-[#E6EDF3] disabled:opacity-20"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveLine(idx, 'down')}
                            disabled={idx === lines.length - 1}
                            className="p-0.5 hover:text-[#E6EDF3] disabled:opacity-20"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-[10px] font-bold text-[#8B949E]">
                          #{idx + 1}
                        </span>

                        {/* Assign Speaker */}
                        <div className="flex items-center gap-1.5 bg-[#0D1117] border border-[#30363D] rounded-full px-2 py-0.5">
                          <span className={`w-2 h-2 rounded-full ${theme.dot} shadow-[0_0_6px_currentColor]`} />
                          <select
                            value={line.speaker}
                            onChange={e => {
                              const newSp = e.target.value;
                              setLines(prev => prev.map(l => l.id === line.id ? { ...l, speaker: newSp } : l));
                            }}
                            className="text-[10px] font-bold text-[#E6EDF3] bg-transparent outline-none cursor-pointer pr-1"
                          >
                            {speakers.map(s => (
                              <option key={s.name} value={s.name} className="bg-[#161B22] text-[#E6EDF3]">
                                {s.name} ({s.provider === 'gemini' ? s.voice : '11Labs'})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quick Emotion Editor */}
                        <input
                          type="text"
                          value={line.emotion || ''}
                          onChange={e => {
                            const newEm = e.target.value;
                            setLines(prev => prev.map(l => l.id === line.id ? { ...l, emotion: newEm } : l));
                          }}
                          placeholder="Emotion..."
                          className="hidden sm:inline-block text-[10px] border border-[#30363D] rounded px-1.5 py-0.5 bg-[#0D1117] text-[#8B949E] max-w-[120px] focus:border-[#4285F4] outline-none font-mono"
                        />
                      </div>

                      {/* Right hand turn actions */}
                      <div className="flex items-center gap-1.5">
                        {line.status === 'ready' && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#81C995] bg-[#34A853]/10 border border-[#34A853]/30 px-1.5 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-[#34A853]" />
                            <span className="hidden sm:inline">Ready</span>
                          </span>
                        )}
                        {line.status === 'generating' && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#8AB4F8] bg-[#4285F4]/10 border border-[#4285F4]/30 px-1.5 py-0.5 rounded animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span className="hidden sm:inline">Synthesizing...</span>
                          </span>
                        )}

                        {line.audioBuffer && (
                          <button
                            onClick={() => {
                              if (isPlayingThis) {
                                stopCurrentPlayback();
                              } else {
                                playLineAudio(line.id, line.audioBuffer!);
                              }
                            }}
                            className={`p-1 rounded border text-xs font-bold transition-all ${
                              isPlayingThis
                                ? 'bg-[#EA4335] text-white border-[#EA4335]'
                                : 'bg-[#161B22] text-[#8B949E] border-[#30363D] hover:bg-[#21262D] hover:text-[#E6EDF3]'
                            }`}
                          >
                            {isPlayingThis ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                          </button>
                        )}

                        <button
                          onClick={() => toggleLineCollapse(line.id)}
                          className="p-1 text-[#8B949E] hover:text-[#E6EDF3]"
                        >
                          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleRemoveLine(line.id)}
                          className="p-1 text-[#8B949E] hover:text-[#F28B82]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* TURN BODY (COLLAPSIBLE) */}
                    {!isCollapsed && (
                      <div className="p-3.5 space-y-3 bg-[#0D1117]">
                        <textarea
                          value={line.text}
                          onChange={e => {
                            const newText = e.target.value;
                            setLines(prev => prev.map(l => l.id === line.id ? {
                              ...l,
                              text: newText,
                              status: 'idle',
                              audioBuffer: null,
                              audioUrl: null
                            } : l));
                          }}
                          rows={2}
                          className="w-full p-2.5 rounded-lg border border-[#30363D] text-xs font-mono bg-[#161B22] text-[#E6EDF3] placeholder:text-[#8B949E] focus:border-[#4285F4] outline-none resize-y leading-relaxed"
                          placeholder="Enter character dialogue..."
                        />

                        {/* Quick Emotion Preset click futtons */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-[#8B949E]">Tone:</span>
                          {EMOTION_PRESETS.slice(0, 5).map(em => (
                            <button
                              key={em}
                              type="button"
                              onClick={() => {
                                setLines(prev => prev.map(l => l.id === line.id ? { ...l, emotion: em } : l));
                              }}
                              className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                                line.emotion === em
                                  ? 'bg-[#E6EDF3] text-[#0D1117] border-[#E6EDF3] font-bold'
                                  : 'bg-[#161B22] text-[#8B949E] border-[#30363D] hover:bg-[#21262D]'
                              }`}
                            >
                              {em}
                            </button>
                          ))}
                        </div>

                        {/* Action Tools for individual line */}
                        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#30363D]">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleGenerateLine(line.id)}
                              disabled={isGeneratingThis || isBatchGenerating || !line.text.trim()}
                              className="px-3 py-1 rounded-lg border border-[#FBBC04]/50 bg-[#FBBC04]/10 hover:bg-[#FBBC04]/20 disabled:opacity-50 text-[11px] font-bold text-[#FDD663] flex items-center gap-1.5 transition-colors"
                            >
                              {isGeneratingThis ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
                              <span>{line.status === 'ready' ? 'Regenerate' : 'Synthesize Voice'}</span>
                            </button>

                            {line.audioUrl && (
                              <a
                                href={line.audioUrl}
                                download={`${line.speaker.toLowerCase().replace(/\s+/g, '_')}_line_${idx + 1}.wav`}
                                className="px-2.5 py-1 rounded-lg border border-[#30363D] bg-[#161B22] hover:bg-[#21262D] text-[11px] text-[#E6EDF3] flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                <span>WAV</span>
                              </a>
                            )}
                          </div>

                          {line.audioBuffer && (
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5 items-center h-3">
                                {[4, 8, 12, 6, 14, 10, 6, 12].map((h, i) => (
                                  <div
                                    key={i}
                                    style={{ height: `${isPlayingThis ? h : 3}px` }}
                                    className={`w-0.5 rounded-full transition-all ${isPlayingThis ? 'bg-[#FBBC04] animate-pulse' : 'bg-[#30363D]'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] text-[#8B949E]">
                                {line.audioBuffer.duration.toFixed(1)}s
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                onClick={handleAddLine}
                className="w-full py-3 rounded-lg border border-dashed border-[#30363D] hover:border-[#8B949E]/40 text-[#8B949E] hover:text-[#E6EDF3] text-xs font-bold flex items-center justify-center gap-1.5 bg-[#161B22]/10 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Next Dialogue Turn
              </button>
            </div>
          </TerminalWindow>
        </div>
      </div>

      {/* 4. MASTER COMMAND DECK AT THE BOTTOM */}
      <div className="mt-auto">
        <TerminalWindow
          title="SCENE_SEQUENCE_CONTROLLER.exec"
          badge="Bus: Stereo Master"
          accentColor="blue"
        >
          <div className="p-4 bg-[#0D1117] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (isPlayingFullSequence) {
                    stopCurrentPlayback();
                  } else {
                    handlePlayFullScene();
                  }
                }}
                disabled={readyCount === 0 || isBatchGenerating}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs ${
                  isPlayingFullSequence
                    ? 'bg-[#EA4335] border border-[#EA4335] text-white animate-pulse'
                    : 'bg-[#E6EDF3] border border-[#E6EDF3] text-[#0D1117] disabled:opacity-40'
                }`}
              >
                {isPlayingFullSequence ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop Scene</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play Full Scene</span>
                  </>
                )}
              </button>

              {lines.length > readyCount && (
                <button
                  onClick={handleGenerateAllLines}
                  disabled={isBatchGenerating}
                  className="px-3 py-2 rounded-lg border border-[#FBBC04]/50 bg-[#FBBC04]/10 hover:bg-[#FBBC04]/20 text-[#FDD663] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isBatchGenerating ? 'animate-spin' : ''}`} />
                  <span>Synth All ({lines.length - readyCount})</span>
                </button>
              )}

              <button
                onClick={handleDownloadCombinedWav}
                disabled={readyCount === 0 || isBatchGenerating}
                className="px-3 py-2 rounded-lg border border-[#34A853]/50 bg-[#34A853]/10 hover:bg-[#34A853]/20 disabled:opacity-40 text-[#81C995] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export WAV</span>
              </button>
            </div>

            {/* AI Generator / Detect Tools Switcher & Projects */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button
                onClick={() => setActiveTool(activeTool === 'generator' ? null : 'generator')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeTool === 'generator'
                    ? 'border-[#4285F4] bg-[#4285F4]/20 text-[#8AB4F8]'
                    : 'border-[#30363D] bg-[#161B22] text-[#8B949E] hover:text-[#E6EDF3]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#4285F4]" />
                <span>AI Generator</span>
              </button>

              <button
                onClick={() => setActiveTool(activeTool === 'analyzer' ? null : 'analyzer')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeTool === 'analyzer'
                    ? 'border-[#FBBC04] bg-[#FBBC04]/20 text-[#FDD663]'
                    : 'border-[#30363D] bg-[#161B22] text-[#8B949E] hover:text-[#E6EDF3]'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-[#FBBC04]" />
                <span>Auto-Detect</span>
              </button>

              <button
                onClick={handleSaveToCloud}
                disabled={isSaving || lines.length === 0}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  justSaved
                    ? 'border-[#34A853] bg-[#34A853]/20 text-[#81C995]'
                    : 'border-[#4285F4] bg-[#4285F4]/10 hover:bg-[#4285F4]/20 text-[#8AB4F8]'
                }`}
              >
                {justSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
                <span>{isSaving ? 'Saving...' : justSaved ? 'Saved' : 'Save'}</span>
              </button>

              {onOpenCloudModal && (
                <button
                  onClick={onOpenCloudModal}
                  className="px-3 py-1.5 rounded-lg border border-[#30363D] bg-[#161B22] hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-[#8AB4F8]" />
                  <span>Projects</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-[#30363D] rounded-full text-[#E6EDF3]">
                    {savedProjects.length}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Collaborative playback & scrubber status bar */}
          <div className="px-4 py-2 border-t border-[#30363D] bg-[#161B22]/20 flex items-center justify-between text-xs text-[#8B949E] rounded-b-lg">
            <div>
              {isPlayingFullSequence && lines.find(l => l.id === playingLineId) ? (
                <span className="flex items-center gap-2 font-bold text-[#FDD663]">
                  <span className="w-2 h-2 rounded-full bg-[#FBBC04] animate-ping" />
                  <span>LIVE_SEQUENCE: PLAYING TURN {lines.find(l => l.id === playingLineId)?.speaker}</span>
                </span>
              ) : isBatchGenerating ? (
                <span className="flex items-center gap-2 text-[#8AB4F8]">
                  <RefreshCw className="w-3 h-3 animate-spin animate-infinite duration-1000" />
                  <span>BATCH_SYNTHESIS: PROGRESS {batchProgress.current}/{batchProgress.total}</span>
                </span>
              ) : (
                <span>SYSTEM_READY // AUDIO_TIMELINE LINKED</span>
              )}
            </div>

            <div className="flex items-center gap-1 w-48">
              <div className="flex-1 h-2 bg-[#161B22] rounded overflow-hidden flex p-0.5 border border-[#30363D]">
                {lines.map((line) => {
                  const isPlaying = playingLineId === line.id;
                  const isReady = line.status === 'ready';
                  return (
                    <div
                      key={line.id}
                      className={`flex-1 h-full rounded-xs mx-0.5 transition-all ${
                        isPlaying ? 'bg-[#FBBC04]' : isReady ? 'bg-[#34A853]' : 'bg-[#30363D]'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </TerminalWindow>
      </div>
    </div>
  );
};
