import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  Download, 
  RefreshCw, 
  Volume2, 
  Wand2, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2,
  FastForward,
  Cloud,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Users,
  Square,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { SceneSpeaker, DialogueLine, Voice, SavedAudioProject } from '../types';
import { ALL_VOICES } from '../voices';
import { 
  generateSpeech, 
  generateScript, 
  analyzeScriptContent, 
  stitchAudioBuffers, 
  audioBufferToWavBlob 
} from '../services/geminiService';
import { 
  getElevenLabsVoices, 
  generateSpeechElevenLabs, 
  isElevenLabsKeyAvailable,
  DEFAULT_ELEVENLABS_VOICES 
} from '../services/elevenLabsService';
import { BauhausButton } from './BauhausComponents';
import { useFirebase } from '../services/firebaseContext';
import { useLiveblocks } from '../services/liveblocksContext';
import { LivePresenceBar } from './LivePresenceBar';
import { QuotaExhaustedBanner } from './QuotaExhaustedBanner';

interface MultiSpeakerStudioProps {
  onBgmOverlay?: (buffer: AudioBuffer) => void;
  onOpenCloudModal?: () => void;
  loadedProject?: SavedAudioProject | null;
}

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

export const MultiSpeakerStudio: React.FC<MultiSpeakerStudioProps> = ({
  onBgmOverlay,
  onOpenCloudModal,
  loadedProject,
}) => {
  const { savedProjects, saveProjectToCloud, isSaving } = useFirebase();
  const { collaborators, broadcastAudioPlay, setActiveEditingLine } = useLiveblocks();
  const [justSaved, setJustSaved] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(undefined);

  // Layout & Responsive States
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<'script' | 'cast' | 'ai'>('script');
  const [activeTool, setActiveTool] = useState<'generator' | 'analyzer' | null>(null);
  const [collapsedLineIds, setCollapsedLineIds] = useState<Record<string, boolean>>({});

  // Studio Setup State
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState('Podcast Dialogue');
  const [styleTone, setStyleTone] = useState('High Stakes & Dramatic');
  const [speakerCount, setSpeakerCount] = useState(2);
  const [isScriptGenerating, setIsScriptGenerating] = useState(false);

  // Content analysis state
  const [rawTextToAnalyze, setRawTextToAnalyze] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Project state
  const [projectTitle, setProjectTitle] = useState('Multi-Speaker Audio Drama');
  const [projectSummary, setProjectSummary] = useState('An engaging conversation between multiple voices.');
  const [speakers, setSpeakers] = useState<SceneSpeaker[]>([
    { name: 'Alex (Host)', voice: 'Algieba', provider: 'gemini', gender: 'MALE', color: 'yellow' },
    { name: 'Dr. Jordan (Guest)', voice: 'Leda', provider: 'gemini', gender: 'FEMALE', color: 'blue' }
  ]);

  const [lines, setLines] = useState<DialogueLine[]>([
    {
      id: 'line-1',
      speaker: 'Alex (Host)',
      text: 'Welcome back everyone. Today we are diving into one of the most contentious topics in modern audio engineering.',
      scene: 'Scene 1: Introduction',
      emotion: 'Excited and Welcoming',
      status: 'idle'
    },
    {
      id: 'line-2',
      speaker: 'Dr. Jordan (Guest)',
      text: 'Thanks for having me, Alex. The breakthrough we made this week changes everything we thought was possible.',
      scene: 'Scene 1: Introduction',
      emotion: 'Confident and Authoritative',
      status: 'idle'
    },
    {
      id: 'line-3',
      speaker: 'Alex (Host)',
      text: 'Tell us straight: is artificial voice synthesis finally indistinguishable from human vocal timbre?',
      scene: 'Scene 2: The Core Question',
      emotion: 'Intrigued and Inquisitive',
      status: 'idle'
    },
    {
      id: 'line-4',
      speaker: 'Dr. Jordan (Guest)',
      text: 'Not only indistinguishable—it captures the subtle breaths, micro-hesitations, and raw emotion of real conversation.',
      scene: 'Scene 2: The Core Question',
      emotion: 'Passionate and Direct',
      status: 'idle'
    }
  ]);

  // ElevenLabs available voices
  const [elevenLabsVoices, setElevenLabsVoices] = useState<Voice[]>(DEFAULT_ELEVENLABS_VOICES);
  const hasElevenLabsKey = isElevenLabsKeyAvailable();

  // Audio Playback State
  const [playingLineId, setPlayingLineId] = useState<string | null>(null);
  const [isPlayingFullSequence, setIsPlayingFullSequence] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeAudioSource, setActiveAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Load ElevenLabs voices on mount
  useEffect(() => {
    getElevenLabsVoices().then(v => {
      if (v && v.length > 0) setElevenLabsVoices(v);
    });
  }, []);

  // Sync loaded project from Firebase Cloud
  useEffect(() => {
    if (loadedProject) {
      setCurrentProjectId(loadedProject.id);
      setProjectTitle(loadedProject.title);
      setProjectSummary(loadedProject.summary || '');
      if (loadedProject.format) setFormat(loadedProject.format);
      if (loadedProject.style) setStyleTone(loadedProject.style);
      if (loadedProject.speakers && loadedProject.speakers.length > 0) {
        setSpeakers(loadedProject.speakers);
      }
      if (loadedProject.lines && loadedProject.lines.length > 0) {
        setLines(loadedProject.lines.map(l => ({
          ...l,
          status: 'idle',
          audioBuffer: null,
          audioUrl: null
        })));
      }
    }
  }, [loadedProject]);

  const handleSaveToCloud = async () => {
    try {
      const savedId = await saveProjectToCloud({
        id: currentProjectId,
        title: projectTitle,
        summary: projectSummary,
        format,
        style: styleTone,
        speakerCount: speakers.length,
        speakers,
        lines: lines.map(l => ({
          id: l.id,
          speaker: l.speaker,
          text: l.text,
          scene: l.scene,
          emotion: l.emotion,
        })),
      });
      setCurrentProjectId(savedId);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 3000);
    } catch (err: any) {
      console.error("Save to cloud failed:", err);
      setErrorMessage(err.message || "Failed to save project to Firebase.");
    }
  };

  // Audio Context singleton
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    return audioContextRef.current;
  };

  // Stop currently active audio
  const stopCurrentPlayback = () => {
    if (activeAudioSource) {
      try {
        activeAudioSource.stop();
      } catch (e) {}
      setActiveAudioSource(null);
    }
    setPlayingLineId(null);
    setIsPlayingFullSequence(false);
  };

  // Play a single line's AudioBuffer
  const playLineAudio = (lineId: string, buffer: AudioBuffer, onEndedCallback?: () => void) => {
    stopCurrentPlayback();
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
      setPlayingLineId(null);
      if (onEndedCallback) {
        onEndedCallback();
      }
    };
    source.start(0);
    setActiveAudioSource(source);
    setPlayingLineId(lineId);

    // Broadcast live playing line to Liveblocks room
    const targetLineIndex = lines.findIndex(l => l.id === lineId);
    const targetLine = lines[targetLineIndex];
    if (targetLine) {
      broadcastAudioPlay(targetLine.speaker, targetLineIndex);
    }
  };

  // Generate audio for one line
  const handleGenerateLine = async (lineId: string) => {
    const line = lines.find(l => l.id === lineId);
    if (!line) return;

    setErrorMessage(null);
    setLines(prev => prev.map(l => l.id === lineId ? { ...l, status: 'generating', errorMessage: undefined } : l));

    const speaker = speakers.find(s => s.name === line.speaker) || speakers[0];

    try {
      let buffer: AudioBuffer;
      let audioUrl: string;

      if (speaker.provider === 'elevenlabs') {
        if (!hasElevenLabsKey) {
          const fallbackVoice = ALL_VOICES.find(v => v.ssmlGender.toUpperCase() === (speaker.gender || 'MALE'))?.name || 'Algieba';
          const instruction = `Speak in character as ${speaker.name}. Emotion: ${line.emotion || 'Natural'}.`;
          const res = await generateSpeech(line.text, fallbackVoice, instruction);
          buffer = res.buffer;
          const wavBlob = audioBufferToWavBlob(buffer);
          audioUrl = URL.createObjectURL(wavBlob);
          setErrorMessage(`ElevenLabs service is not active on server, so we generated this voice using Gemini's ${fallbackVoice} neural voice.`);
        } else {
          const res = await generateSpeechElevenLabs(line.text, speaker.voice);
          buffer = res.buffer;
          const wavBlob = new Blob([res.rawData], { type: 'audio/mpeg' });
          audioUrl = URL.createObjectURL(wavBlob);
        }
      } else {
        const instruction = `Speak in character as ${speaker.name}. Emotion: ${line.emotion || 'Natural'}. Scene: ${line.scene || 'Drama'}.`;
        const res = await generateSpeech(line.text, speaker.voice, instruction);
        buffer = res.buffer;
        const wavBlob = audioBufferToWavBlob(buffer);
        audioUrl = URL.createObjectURL(wavBlob);
      }

      setLines(prev => prev.map(l => l.id === lineId ? {
        ...l,
        status: 'ready',
        audioBuffer: buffer,
        audioUrl: audioUrl
      } : l));

    } catch (err: any) {
      console.error("Line audio generation failed:", err);
      const msg = err.message || "Failed to generate speech for line.";
      setLines(prev => prev.map(l => l.id === lineId ? {
        ...l,
        status: 'error',
        errorMessage: msg
      } : l));
      setErrorMessage(`Error on "${line.speaker}": ${msg}`);
    }
  };

  // Generate All lines (Combined sequence)
  const handleGenerateAllLines = async () => {
    stopCurrentPlayback();
    setIsBatchGenerating(true);
    setErrorMessage(null);
    const ungenerated = lines.filter(l => l.status !== 'ready' || !l.audioBuffer);
    setBatchProgress({ current: 0, total: ungenerated.length });

    let count = 0;
    for (const line of lines) {
      if (line.status === 'ready' && line.audioBuffer) continue;
      
      setLines(prev => prev.map(l => l.id === line.id ? { ...l, status: 'generating' } : l));
      const speaker = speakers.find(s => s.name === line.speaker) || speakers[0];

      try {
        let buffer: AudioBuffer;
        let audioUrl: string;

        if (speaker.provider === 'elevenlabs' && hasElevenLabsKey) {
          const res = await generateSpeechElevenLabs(line.text, speaker.voice);
          buffer = res.buffer;
          const wavBlob = new Blob([res.rawData], { type: 'audio/mpeg' });
          audioUrl = URL.createObjectURL(wavBlob);
        } else {
          const voiceToUse = speaker.provider === 'elevenlabs' 
            ? (ALL_VOICES.find(v => v.ssmlGender.toUpperCase() === (speaker.gender || 'MALE'))?.name || 'Algieba')
            : speaker.voice;
          const instruction = `Speak in character as ${speaker.name}. Emotion: ${line.emotion || 'Natural'}.`;
          const res = await generateSpeech(line.text, voiceToUse, instruction);
          buffer = res.buffer;
          const wavBlob = audioBufferToWavBlob(buffer);
          audioUrl = URL.createObjectURL(wavBlob);
        }

        setLines(prev => prev.map(l => l.id === line.id ? {
          ...l,
          status: 'ready',
          audioBuffer: buffer,
          audioUrl: audioUrl
        } : l));

        count++;
        setBatchProgress({ current: count, total: ungenerated.length });
        await new Promise(r => setTimeout(r, 400));
      } catch (err: any) {
        console.error("Batch line error:", err);
        setLines(prev => prev.map(l => l.id === line.id ? {
          ...l,
          status: 'error',
          errorMessage: err.message || 'Error'
        } : l));
      }
    }

    setIsBatchGenerating(false);
  };

  // Play full combined scene sequentially
  const handlePlayFullScene = () => {
    stopCurrentPlayback();
    const readyLines = lines.filter(l => l.audioBuffer != null);
    if (readyLines.length === 0) {
      setErrorMessage("No ready audio lines found. Please generate audio first!");
      return;
    }

    setIsPlayingFullSequence(true);
    let index = 0;

    const playNext = () => {
      if (index >= readyLines.length) {
        setIsPlayingFullSequence(false);
        setPlayingLineId(null);
        return;
      }
      const current = readyLines[index];
      index++;
      playLineAudio(current.id, current.audioBuffer!, () => {
        setTimeout(playNext, 300);
      });
    };

    playNext();
  };

  // Download stitched master WAV
  const handleDownloadCombinedWav = async () => {
    const buffers = lines.map(l => l.audioBuffer).filter((b): b is AudioBuffer => b != null);
    if (buffers.length === 0) {
      setErrorMessage("Generate at least one line before downloading combined audio.");
      return;
    }

    try {
      const { wavBlob } = await stitchAudioBuffers(buffers, 0.35);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectTitle.toLowerCase().replace(/\s+/g, '_')}_combined.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setErrorMessage(`Failed to stitch audio: ${err.message}`);
    }
  };

  // AI Script Generation
  const handleGenerateScriptWithAI = async () => {
    if (!topic.trim()) return;
    setIsScriptGenerating(true);
    setErrorMessage(null);
    try {
      const res = await generateScript({
        topic,
        format,
        style: styleTone,
        speakerCount
      });
      setProjectTitle(res.title);
      setProjectSummary(res.summary);
      setSpeakers(res.speakers);
      setLines(res.lines);
      setActiveTool(null);
    } catch (err: any) {
      setErrorMessage(`Failed to generate script: ${err.message}`);
    } finally {
      setIsScriptGenerating(false);
    }
  };

  // Auto-Detect & Analyze Script Content
  const handleAnalyzeContent = async () => {
    if (!rawTextToAnalyze.trim()) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const res = await analyzeScriptContent(rawTextToAnalyze);
      setProjectTitle(res.title);
      setProjectSummary(res.summary);
      if (res.speakers.length > 0) setSpeakers(res.speakers);
      if (res.lines.length > 0) setLines(res.lines);
      setActiveTool(null);
      setRawTextToAnalyze('');
    } catch (err: any) {
      setErrorMessage(`Failed to analyze content: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to add a manual line
  const handleAddLine = () => {
    const newLine: DialogueLine = {
      id: `line-${Date.now()}`,
      speaker: speakers[0]?.name || 'Speaker 1',
      text: 'Enter spoken dialogue here...',
      scene: `Scene ${Math.max(1, new Set(lines.map(l => l.scene)).size)}`,
      emotion: 'Natural',
      status: 'idle'
    };
    setLines([...lines, newLine]);
  };

  // Helper to remove a line
  const handleRemoveLine = (id: string) => {
    setLines(lines.filter(l => l.id !== id));
  };

  // Move line reordering
  const handleMoveLine = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lines.length) return;
    const reordered = [...lines];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setLines(reordered);
  };

  // Toggle collapse state for a line
  const toggleLineCollapse = (id: string) => {
    setCollapsedLineIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle collapse all
  const toggleCollapseAll = () => {
    const allCollapsed = lines.every(l => collapsedLineIds[l.id]);
    const newState: Record<string, boolean> = {};
    if (!allCollapsed) {
      lines.forEach(l => { newState[l.id] = true; });
    }
    setCollapsedLineIds(newState);
  };

  // Add a new speaker
  const handleAddSpeaker = () => {
    const colors = ['yellow', 'blue', 'red', 'green', 'black'];
    const usedColors = speakers.map(s => s.color);
    const availableColor = colors.find(c => !usedColors.includes(c)) || 'yellow';
    const num = speakers.length + 1;
    const newSp: SceneSpeaker = {
      name: `Speaker ${num}`,
      voice: 'Puck',
      provider: 'gemini',
      gender: 'MALE',
      color: availableColor
    };
    setSpeakers([...speakers, newSp]);
  };

  // Speaker voice change
  const handleSpeakerVoiceChange = (speakerName: string, newVoice: string, provider: 'gemini' | 'elevenlabs') => {
    setSpeakers(prev => prev.map(s => s.name === speakerName ? { ...s, voice: newVoice, provider } : s));
  };

  const readyCount = lines.filter(l => l.status === 'ready').length;
  const currentSpeakingLine = lines.find(l => l.id === playingLineId);

  return (
    <div className="flex flex-col h-full bg-[#F7F7F4] text-zinc-900 overflow-hidden select-none">
      
      {/* 1. TOP STUDIO SUB-HEADER (Clean & Precision-Engineered) */}
      <div className="border-b border-zinc-200 bg-white px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-md border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            title={isInspectorOpen ? "Collapse Cast Inspector" : "Expand Cast Inspector"}
          >
            {isInspectorOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                Multi-Speaker
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase text-zinc-600 bg-zinc-100 border border-zinc-200">
                {format}
              </span>
              <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono text-zinc-500">
                • {styleTone}
              </span>
            </div>
            <h1 className="text-sm md:text-base font-bold text-zinc-950 tracking-tight truncate mt-0.5">
              {projectTitle}
            </h1>
          </div>
        </div>

        {/* Studio Top Action Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Key Control on Top: Play Full Scene */}
          <button
            onClick={() => {
              if (isPlayingFullSequence) {
                stopCurrentPlayback();
              } else {
                handlePlayFullScene();
              }
            }}
            disabled={readyCount === 0 || isBatchGenerating}
            className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs ${
              isPlayingFullSequence 
                ? 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-700 animate-pulse' 
                : 'bg-zinc-950 hover:bg-zinc-800 text-white border border-zinc-950 disabled:opacity-50'
            }`}
            title={isPlayingFullSequence ? 'Stop Scene' : 'Play Full Scene'}
          >
            {isPlayingFullSequence ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Scene</span>
              </>
            )}
          </button>

          {/* Key Control on Top: Batch Synthesize */}
          {lines.length > readyCount && (
            <button
              onClick={handleGenerateAllLines}
              disabled={isBatchGenerating}
              className="px-2.5 py-1.5 rounded-md text-xs font-mono font-bold border border-amber-400 bg-amber-400 hover:bg-amber-300 text-zinc-950 flex items-center gap-1.5 shadow-xs"
              title={`Synthesize all ${lines.length - readyCount} remaining lines`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBatchGenerating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Synth All ({lines.length - readyCount})</span>
              <span className="sm:hidden">Synth ({lines.length - readyCount})</span>
            </button>
          )}

          {/* Key Control on Top: Export WAV */}
          <button
            onClick={handleDownloadCombinedWav}
            disabled={readyCount === 0 || isBatchGenerating}
            className="px-2.5 py-1.5 rounded-md text-xs font-mono font-bold border border-emerald-600 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center gap-1.5 shadow-xs"
            title="Export Master continuous WAV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export WAV</span>
            <span className="sm:hidden">WAV</span>
          </button>

          <div className="h-4 w-[1px] bg-zinc-200 hidden sm:block mx-0.5" />

          <button
            onClick={() => setActiveTool(activeTool === 'generator' ? null : 'generator')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-medium border flex items-center gap-1.5 transition-colors ${
              activeTool === 'generator' 
                ? 'bg-zinc-900 text-white border-zinc-950 shadow-sm' 
                : 'bg-white text-zinc-700 hover:bg-zinc-50 border-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">AI Generator</span>
            <span className="sm:hidden">AI</span>
          </button>

          <button
            onClick={() => setActiveTool(activeTool === 'analyzer' ? null : 'analyzer')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-medium border flex items-center gap-1.5 transition-colors ${
              activeTool === 'analyzer' 
                ? 'bg-zinc-900 text-white border-zinc-950 shadow-sm' 
                : 'bg-white text-zinc-700 hover:bg-zinc-50 border-zinc-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Auto-Detect</span>
            <span className="sm:hidden">Detect</span>
          </button>

          <div className="h-4 w-[1px] bg-zinc-200 hidden sm:block mx-0.5" />

          <button
            onClick={handleSaveToCloud}
            disabled={isSaving || lines.length === 0}
            className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-medium border flex items-center gap-1.5 transition-all shadow-sm ${
              justSaved 
                ? 'bg-emerald-600 text-white border-emerald-700' 
                : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-700'
            }`}
            title="Save this scene to Firebase Firestore"
          >
            {justSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
            <span>{isSaving ? 'Saving...' : justSaved ? 'Saved' : 'Save'}</span>
          </button>

          {onOpenCloudModal && (
            <button
              onClick={onOpenCloudModal}
              className="px-2.5 py-1.5 rounded-md text-xs font-mono font-medium border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 flex items-center gap-1.5"
              title="Open saved projects from Firebase"
            >
              <FolderOpen className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Projects</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-zinc-100 rounded-full font-bold">
                {savedProjects.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Liveblocks Collaborative Room Presence Bar */}
      <div className="px-3 sm:px-6 py-1.5 bg-zinc-100 border-b border-zinc-200 flex-shrink-0">
        <LivePresenceBar />
      </div>

      {/* Quota Exhaustion & Upgrade Prompt */}
      <div className="px-3 sm:px-6">
        <QuotaExhaustedBanner actionName="scene generation" />
      </div>

      {/* MOBILE SEGMENTED CONTROL TABS (< md) */}
      <div className="flex md:hidden border-b border-zinc-200 bg-zinc-100 p-1 gap-1">
        <button
          onClick={() => setMobileTab('script')}
          className={`flex-1 py-1.5 text-xs font-mono font-medium rounded text-center transition-colors ${
            mobileTab === 'script' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
          }`}
        >
          Dialogue ({lines.length})
        </button>
        <button
          onClick={() => setMobileTab('cast')}
          className={`flex-1 py-1.5 text-xs font-mono font-medium rounded text-center transition-colors ${
            mobileTab === 'cast' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
          }`}
        >
          Cast ({speakers.length})
        </button>
        <button
          onClick={() => setMobileTab('ai')}
          className={`flex-1 py-1.5 text-xs font-mono font-medium rounded text-center transition-colors ${
            mobileTab === 'ai' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
          }`}
        >
          AI Tools
        </button>
      </div>

      {/* ERROR NOTICE TOAST */}
      {errorMessage && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs font-mono text-rose-800 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-800 font-bold p-1">✕</button>
        </div>
      )}

      {/* COLLAPSIBLE ACCORDION 1: AI SCRIPT GENERATOR */}
      {activeTool === 'generator' && (
        <div className="border-b border-zinc-200 bg-white p-4 md:p-6 shadow-studio space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-zinc-900">
                AI Script Generator
              </h2>
            </div>
            <button 
              onClick={() => setActiveTool(null)}
              className="text-xs font-mono text-zinc-400 hover:text-zinc-700 p-1"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                Scene Prompt / Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. A founder pitching a skeptical venture capitalist..."
                className="w-full px-3 py-2 border border-zinc-200 rounded-md text-xs font-mono bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                Format
              </label>
              <select
                value={format}
                onChange={e => setFormat(e.target.value)}
                className="w-full px-2.5 py-2 border border-zinc-200 rounded-md text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
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
              <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                Style Tone
              </label>
              <select
                value={styleTone}
                onChange={e => setStyleTone(e.target.value)}
                className="w-full px-2.5 py-2 border border-zinc-200 rounded-md text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="High Stakes & Dramatic">High Stakes & Dramatic</option>
                <option value="Casual & Conversational">Casual & Conversational</option>
                <option value="Hyper Energized & Hype">Hyper Energized & Hype</option>
                <option value="Playful & Witty">Playful & Witty</option>
                <option value="Suspenseful & Mysterious">Suspenseful & Mysterious</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500">Speakers:</span>
              {[2, 3, 4].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSpeakerCount(num)}
                  className={`w-7 h-7 rounded border text-xs font-mono font-bold transition-colors ${
                    speakerCount === num ? 'bg-zinc-900 text-white border-zinc-950' : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <BauhausButton
              onClick={handleGenerateScriptWithAI}
              disabled={isScriptGenerating || !topic.trim()}
              variant="primary"
              className="px-4 py-2 text-xs"
            >
              {isScriptGenerating ? (
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Write Script with AI
                </span>
              )}
            </BauhausButton>
          </div>
        </div>
      )}

      {/* COLLAPSIBLE ACCORDION 2: CONTENT AUTO-DETECTION */}
      {activeTool === 'analyzer' && (
        <div className="border-b border-zinc-200 bg-amber-50/50 p-4 md:p-6 shadow-studio space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-amber-600" />
              <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-zinc-900">
                Auto-Detection & Speaker Extraction Engine
              </h2>
            </div>
            <button 
              onClick={() => setActiveTool(null)}
              className="text-xs font-mono text-zinc-400 hover:text-zinc-700 p-1"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-xs font-mono text-zinc-600">
            Paste any article excerpt, screenplay dialogue, or meeting transcript below. Gemini will automatically decompose the text into distinct speakers, emotions, and structured dialogue scenes.
          </p>
          <textarea
            value={rawTextToAnalyze}
            onChange={e => setRawTextToAnalyze(e.target.value)}
            placeholder="Paste your dialogue script (e.g. 'Sarah: Did you review the numbers?\nMark: Not yet, but I have the summary ready.') or article excerpt here..."
            className="w-full h-32 p-3 border border-zinc-300 rounded-md font-mono text-xs bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 resize-y"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setActiveTool(null)}
              className="px-3 py-1.5 rounded-md border border-zinc-200 text-xs font-mono bg-white hover:bg-zinc-50 text-zinc-700"
            >
              Cancel
            </button>
            <BauhausButton
              onClick={handleAnalyzeContent}
              disabled={isAnalyzing || !rawTextToAnalyze.trim()}
              variant="secondary"
              className="px-4 py-1.5 text-xs"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing Content...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5" /> Analyze & Parse Speakers
                </span>
              )}
            </BauhausButton>
          </div>
        </div>
      )}

      {/* 2. MAIN 3-ZONE WORKSPACE CONTAINER */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ZONE A: COLLAPSIBLE LEFT INSPECTOR (Cast, Voice Matrix, Scene Nav) */}
        <aside className={`
          ${isInspectorOpen ? 'w-72 lg:w-80' : 'w-14'}
          hidden md:flex flex-col border-r border-zinc-200 bg-white flex-shrink-0 transition-all duration-200 overflow-hidden
        `}>
          {isInspectorOpen ? (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-3.5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-600" />
                  <span className="text-xs font-mono uppercase font-bold tracking-wider text-zinc-800">
                    Cast & Voice Roster
                  </span>
                </div>
                <button
                  onClick={handleAddSpeaker}
                  className="text-[11px] font-mono font-bold text-sky-600 hover:text-sky-800 flex items-center gap-0.5"
                  title="Add another speaker"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {/* Speaker List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {speakers.map((sp, idx) => {
                  const theme = SPEAKER_COLOR_MAP[sp.color || 'yellow'] || SPEAKER_COLOR_MAP.yellow;
                  return (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 shadow-studio transition-all space-y-2.5`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-3 h-3 rounded-full ${theme.dot} flex-shrink-0`} />
                          <span className="font-mono text-xs font-bold text-zinc-900 truncate">
                            {sp.name}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                          {sp.gender || 'MALE'}
                        </span>
                      </div>

                      {/* Provider Switcher */}
                      <div className="flex rounded-md border border-zinc-200 p-0.5 bg-zinc-100 text-[10px] font-mono">
                        <button
                          type="button"
                          onClick={() => handleSpeakerVoiceChange(sp.name, 'Algieba', 'gemini')}
                          className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
                            sp.provider === 'gemini' ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'text-zinc-500 hover:text-zinc-800'
                          }`}
                        >
                          Gemini TTS
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSpeakerVoiceChange(sp.name, '21m00Tcm4TlvDq8ikWAM', 'elevenlabs')}
                          className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
                            sp.provider === 'elevenlabs' ? 'bg-sky-600 text-white shadow-xs font-bold' : 'text-zinc-500 hover:text-zinc-800'
                          }`}
                        >
                          ElevenLabs
                        </button>
                      </div>

                      {/* Voice Dropdown */}
                      <div>
                        {sp.provider === 'gemini' ? (
                          <select
                            value={sp.voice}
                            onChange={e => handleSpeakerVoiceChange(sp.name, e.target.value, 'gemini')}
                            className="w-full p-1.5 border border-zinc-200 rounded text-xs font-mono bg-zinc-50 hover:bg-white focus:bg-white outline-none focus:ring-1 focus:ring-sky-500"
                          >
                            {ALL_VOICES.map(v => (
                              <option key={v.name} value={v.name}>
                                {v.name} ({v.style})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={sp.voice}
                            onChange={e => handleSpeakerVoiceChange(sp.name, e.target.value, 'elevenlabs')}
                            className="w-full p-1.5 border border-zinc-200 rounded text-xs font-mono bg-zinc-50 hover:bg-white focus:bg-white outline-none focus:ring-1 focus:ring-sky-500"
                          >
                            {elevenLabsVoices.map(v => (
                              <option key={v.id} value={v.id}>
                                {v.name} ({v.gender})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Project Overview Card */}
                <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/70 space-y-2 mt-4 text-xs font-mono">
                  <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    Session Diagnostics
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Dialogue Turns:</span>
                    <span className="font-bold text-zinc-900">{lines.length}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Synthesized:</span>
                    <span className="font-bold text-emerald-600">{readyCount} / {lines.length}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>ElevenLabs Key:</span>
                    <span className={`font-bold ${hasElevenLabsKey ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {hasElevenLabsKey ? 'Detected' : 'Fallback'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* RAIL MODE (Collapsed Inspector) */
            <div className="flex flex-col items-center py-4 space-y-4">
              <button
                onClick={() => setIsInspectorOpen(true)}
                className="w-8 h-8 rounded-md border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                title="Expand Inspector"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="w-6 h-[1px] bg-zinc-200" />
              {speakers.map((sp, idx) => {
                const theme = SPEAKER_COLOR_MAP[sp.color || 'yellow'] || SPEAKER_COLOR_MAP.yellow;
                return (
                  <div
                    key={idx}
                    className={`w-7 h-7 rounded-full ${theme.bg} ${theme.text} flex items-center justify-center font-mono font-bold text-xs shadow-xs`}
                    title={`${sp.name} (${sp.voice})`}
                  >
                    {sp.name.charAt(0)}
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {/* ZONE B: MAIN ARRANGER / SCRIPT TIMELINE WORKSPACE */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#F7F7F4] overflow-hidden">
          
          {/* SCRIPT WORKSPACE ACTION BAR */}
          <div className="border-b border-zinc-200 bg-white/70 px-4 md:px-6 py-2 flex items-center justify-between text-xs font-mono text-zinc-600 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-bold text-zinc-900">Script Timeline</span>
              <span>•</span>
              <span>{lines.length} dialogue turns</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleCollapseAll}
                className="text-[11px] text-zinc-500 hover:text-zinc-900 flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-100 transition-colors"
                title="Toggle expand/collapse on all cards"
              >
                {lines.every(l => collapsedLineIds[l.id]) ? (
                  <>
                    <Maximize2 className="w-3 h-3" /> Expand All
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-3 h-3" /> Collapse All
                  </>
                )}
              </button>

              <button
                onClick={handleAddLine}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Turn
              </button>
            </div>
          </div>

          {/* SCRIPT CARDS SCROLLABLE CONTAINER */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 custom-scrollbar">
            {/* MOBILE ONLY VIEW FOR CAST TAB */}
            {mobileTab === 'cast' && (
              <div className="md:hidden space-y-3 pb-6">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                  <h3 className="font-mono text-xs font-bold uppercase text-zinc-800">Cast & Voice Settings</h3>
                  <button onClick={handleAddSpeaker} className="text-xs font-mono text-sky-600 font-bold">+ Add Speaker</button>
                </div>
                {speakers.map((sp, idx) => {
                  const theme = SPEAKER_COLOR_MAP[sp.color || 'yellow'] || SPEAKER_COLOR_MAP.yellow;
                  return (
                    <div key={idx} className="p-3 rounded-lg border border-zinc-200 bg-white space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${theme.dot}`} />
                        <span className="font-mono text-xs font-bold text-zinc-900">{sp.name}</span>
                      </div>
                      <div className="flex border border-zinc-200 rounded text-[10px] font-mono">
                        <button
                          onClick={() => handleSpeakerVoiceChange(sp.name, 'Algieba', 'gemini')}
                          className={`flex-1 py-1 text-center ${sp.provider === 'gemini' ? 'bg-zinc-900 text-white font-bold' : 'bg-white text-zinc-700'}`}
                        >
                          Gemini
                        </button>
                        <button
                          onClick={() => handleSpeakerVoiceChange(sp.name, '21m00Tcm4TlvDq8ikWAM', 'elevenlabs')}
                          className={`flex-1 py-1 text-center ${sp.provider === 'elevenlabs' ? 'bg-sky-600 text-white font-bold' : 'bg-white text-zinc-700'}`}
                        >
                          ElevenLabs
                        </button>
                      </div>
                      <select
                        value={sp.voice}
                        onChange={e => handleSpeakerVoiceChange(sp.name, e.target.value, sp.provider)}
                        className="w-full p-2 border border-zinc-200 rounded text-xs font-mono bg-zinc-50"
                      >
                        {sp.provider === 'gemini'
                          ? ALL_VOICES.map(v => <option key={v.name} value={v.name}>{v.name} ({v.style})</option>)
                          : elevenLabsVoices.map(v => <option key={v.id} value={v.id}>{v.name} ({v.gender})</option>)
                        }
                      </select>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DIALOGUE LINES (Always visible on desktop or when mobileTab === 'script') */}
            {(mobileTab === 'script' || window.innerWidth >= 768) && (
              <>
                {lines.map((line, idx) => {
                  const sp = speakers.find(s => s.name === line.speaker) || speakers[0];
                  const theme = SPEAKER_COLOR_MAP[sp?.color || 'yellow'] || SPEAKER_COLOR_MAP.yellow;
                  const isPlayingThis = playingLineId === line.id;
                  const isGeneratingThis = line.status === 'generating';
                  const isCollapsed = collapsedLineIds[line.id];

                  return (
                    <div 
                      key={line.id} 
                      className={`
                        rounded-lg border transition-all duration-150 overflow-hidden shadow-studio
                        ${isPlayingThis 
                          ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-400' 
                          : 'border-zinc-200 bg-white hover:border-zinc-300'
                        }
                      `}
                    >
                      {/* CARD HEADER BAR */}
                      <div className="px-3.5 py-2 border-b border-zinc-100 flex items-center justify-between gap-2 flex-wrap bg-zinc-50/60">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Reordering Up/Down */}
                          <div className="flex items-center text-zinc-400">
                            <button
                              onClick={() => handleMoveLine(idx, 'up')}
                              disabled={idx === 0}
                              className="p-0.5 hover:text-zinc-800 disabled:opacity-20 transition-colors"
                              title="Move Turn Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveLine(idx, 'down')}
                              disabled={idx === lines.length - 1}
                              className="p-0.5 hover:text-zinc-800 disabled:opacity-20 transition-colors"
                              title="Move Turn Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-[10px] font-mono font-bold text-zinc-400">
                            #{idx + 1}
                          </span>

                          {/* Speaker Selector Pill */}
                          <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-full px-2 py-0.5 shadow-xs">
                            <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                            <select
                              value={line.speaker}
                              onChange={e => {
                                const newSp = e.target.value;
                                setLines(prev => prev.map(l => l.id === line.id ? { ...l, speaker: newSp } : l));
                              }}
                              className="text-[11px] font-mono font-bold text-zinc-800 bg-transparent outline-none cursor-pointer pr-1"
                            >
                              {speakers.map(s => (
                                <option key={s.name} value={s.name}>
                                  {s.name} ({s.provider === 'gemini' ? s.voice : '11Labs'})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Emotion Tag */}
                          <input
                            type="text"
                            value={line.emotion || ''}
                            onChange={e => {
                              const newEm = e.target.value;
                              setLines(prev => prev.map(l => l.id === line.id ? { ...l, emotion: newEm } : l));
                            }}
                            placeholder="Emotion (e.g. Whispering, Bold)"
                            className="hidden sm:inline-block text-[10px] font-mono border border-zinc-200 rounded px-1.5 py-0.5 bg-white text-zinc-600 max-w-[140px] focus:border-zinc-400 outline-none"
                          />

                          <span className="hidden md:inline-block text-[10px] font-mono text-zinc-400">
                            {line.scene || 'Scene 1'}
                          </span>
                        </div>

                        {/* Status, Play micro-button, and Collapse */}
                        <div className="flex items-center gap-1.5">
                          {line.status === 'ready' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span className="hidden sm:inline">Ready</span>
                            </span>
                          )}
                          {line.status === 'generating' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded animate-pulse">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span className="hidden sm:inline">Synthesizing...</span>
                            </span>
                          )}

                          {/* Quick Play Line */}
                          {line.audioBuffer && (
                            <button
                              onClick={() => {
                                if (isPlayingThis) {
                                  stopCurrentPlayback();
                                } else {
                                  playLineAudio(line.id, line.audioBuffer!);
                                }
                              }}
                              className={`p-1 rounded border text-xs font-mono transition-colors ${
                                isPlayingThis 
                                  ? 'bg-rose-600 text-white border-rose-700' 
                                  : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                              }`}
                              title={isPlayingThis ? 'Pause' : 'Play Turn'}
                            >
                              {isPlayingThis ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                            </button>
                          )}

                          {/* Collapse Line Toggle */}
                          <button
                            onClick={() => toggleLineCollapse(line.id)}
                            className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors"
                            title={isCollapsed ? "Expand Dialogue" : "Collapse Dialogue"}
                          >
                            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete Turn */}
                          <button
                            onClick={() => handleRemoveLine(line.id)}
                            className="p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                            title="Delete Turn"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* CARD BODY (COLLAPSIBLE) */}
                      {!isCollapsed && (
                        <div className="p-3.5 space-y-3">
                          {/* Text Area */}
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
                            className="w-full p-2.5 rounded border border-zinc-200 font-mono text-xs text-zinc-900 bg-zinc-50/50 focus:bg-white outline-none focus:ring-1 focus:ring-sky-500 resize-y leading-relaxed"
                            placeholder="Enter character dialogue..."
                          />

                          {/* Emotion Quick Presets */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono text-zinc-400">Tone:</span>
                            {EMOTION_PRESETS.slice(0, 5).map(em => (
                              <button
                                key={em}
                                type="button"
                                onClick={() => {
                                  setLines(prev => prev.map(l => l.id === line.id ? { ...l, emotion: em } : l));
                                }}
                                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                                  line.emotion === em 
                                    ? 'bg-zinc-800 text-white border-zinc-900 font-bold' 
                                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                                }`}
                              >
                                {em}
                              </button>
                            ))}
                          </div>

                          {/* Action Toolbar for this line */}
                          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-zinc-100">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleGenerateLine(line.id)}
                                disabled={isGeneratingThis || isBatchGenerating || !line.text.trim()}
                                className="px-3 py-1 rounded border border-amber-500 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-[11px] font-mono font-bold text-zinc-950 flex items-center gap-1.5 transition-all shadow-xs"
                              >
                                {isGeneratingThis ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Volume2 className="w-3 h-3" />
                                )}
                                <span>{line.status === 'ready' ? 'Regenerate' : 'Synthesize Voice'}</span>
                              </button>

                              {line.audioUrl && (
                                <a
                                  href={line.audioUrl}
                                  download={`${line.speaker.toLowerCase().replace(/\s+/g, '_')}_line_${idx + 1}.wav`}
                                  className="px-2 py-1 rounded border border-zinc-200 bg-white hover:bg-zinc-50 text-[11px] font-mono text-zinc-700 flex items-center gap-1"
                                  title="Download line audio"
                                >
                                  <Download className="w-3 h-3" />
                                  <span className="hidden sm:inline">WAV</span>
                                </a>
                              )}
                            </div>

                            {/* Audio Duration & Equalizer wave bars */}
                            {line.audioBuffer && (
                              <div className="flex items-center gap-2">
                                <div className="flex gap-0.5 items-center h-3.5">
                                  {[4, 8, 12, 6, 14, 10, 6, 12].map((h, i) => (
                                    <div 
                                      key={i} 
                                      style={{ height: `${isPlayingThis ? h : 4}px` }} 
                                      className={`w-0.5 rounded-full transition-all ${isPlayingThis ? 'bg-amber-500 animate-pulse' : 'bg-zinc-300'}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[10px] font-mono text-zinc-500">
                                  {(line.audioBuffer.duration).toFixed(1)}s
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Bottom Add Turn trigger button */}
                <button
                  onClick={handleAddLine}
                  className="w-full py-3 rounded-lg border-2 border-dashed border-zinc-300 hover:border-zinc-400 hover:bg-white text-zinc-500 hover:text-zinc-800 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Next Dialogue Turn
                </button>
              </>
            )}
          </div>
        </main>
      </div>

      {/* 3. SLEEK BENTO TIMELINE RIBBON (Compact Scrubber) */}
      <footer className="border-t border-zinc-200 bg-white px-3 sm:px-6 py-2 flex-shrink-0 flex items-center justify-between gap-3 shadow-xs z-30">
        <div className="flex items-center gap-2 min-w-0">
          {isPlayingFullSequence && currentSpeakingLine ? (
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="truncate">Live: {currentSpeakingLine.speaker}</span>
            </div>
          ) : isBatchGenerating ? (
            <div className="flex items-center gap-1.5 text-xs font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              <RefreshCw className="w-3 h-3 animate-spin text-sky-600" />
              <span>Batch {batchProgress.current}/{batchProgress.total}</span>
            </div>
          ) : (
            <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
              Ready: <strong className="text-zinc-800">{readyCount}</strong>/{lines.length} turns
            </span>
          )}
        </div>

        {/* Center Interactive Timeline Scrubber */}
        <div className="flex-1 max-w-md flex flex-col gap-0.5">
          <div className="flex items-center gap-1 h-3.5 bg-zinc-100 rounded p-0.5 border border-zinc-200 overflow-hidden">
            {lines.map((line, i) => {
              const isPlaying = playingLineId === line.id;
              const isReady = line.status === 'ready';
              const isGen = line.status === 'generating';

              return (
                <button
                  key={line.id}
                  onClick={() => {
                    if (line.audioBuffer) playLineAudio(line.id, line.audioBuffer);
                  }}
                  className={`flex-1 h-full rounded-xs transition-all ${
                    isPlaying 
                      ? 'bg-amber-500 animate-pulse' 
                      : isReady 
                      ? 'bg-emerald-500 hover:bg-emerald-400' 
                      : isGen 
                      ? 'bg-sky-400 animate-pulse' 
                      : 'bg-zinc-300 hover:bg-zinc-400'
                  }`}
                  title={`#${i + 1} ${line.speaker} (${line.status})`}
                />
              );
            })}
          </div>
        </div>

        <div className="text-[11px] font-mono text-zinc-500 hidden sm:block">
          Audition bar
        </div>
      </footer>

    </div>
  );
};
