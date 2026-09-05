import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  Download, 
  RefreshCw, 
  Mic, 
  Layers, 
  Sliders, 
  Volume2, 
  Wand2, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2,
  FastForward,
  Info,
  Cloud,
  FolderOpen
} from 'lucide-react';
import { SceneSpeaker, DialogueLine, Voice, SavedAudioProject } from '../types';
import { ALL_VOICES } from '../voices';
import { 
  generateSpeech, 
  generateScript, 
  analyzeScriptContent, 
  stitchAudioBuffers, 
  audioBufferToWavBlob, 
  createWavBlob 
} from '../services/geminiService';
import { 
  getElevenLabsVoices, 
  generateSpeechElevenLabs, 
  isElevenLabsKeyAvailable,
  DEFAULT_ELEVENLABS_VOICES 
} from '../services/elevenLabsService';
import { BauhausButton } from './BauhausComponents';
import { useFirebase } from '../services/firebaseContext';

interface MultiSpeakerStudioProps {
  onBgmOverlay?: (buffer: AudioBuffer) => void;
  onOpenCloudModal?: () => void;
  loadedProject?: SavedAudioProject | null;
}

const SPEAKER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  yellow: { bg: 'bg-amber-400', text: 'text-zinc-950', border: 'border-amber-500' },
  blue: { bg: 'bg-sky-500', text: 'text-white', border: 'border-sky-600' },
  red: { bg: 'bg-rose-600', text: 'text-white', border: 'border-rose-700' },
  green: { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-600' },
  black: { bg: 'bg-zinc-900', text: 'text-zinc-50', border: 'border-zinc-700' },
};

export const MultiSpeakerStudio: React.FC<MultiSpeakerStudioProps> = ({
  onBgmOverlay,
  onOpenCloudModal,
  loadedProject,
}) => {
  const { savedProjects, saveProjectToCloud, isSaving } = useFirebase();
  const [justSaved, setJustSaved] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(undefined);

  // Studio State
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState('Podcast Dialogue');
  const [styleTone, setStyleTone] = useState('High Stakes & Dramatic');
  const [speakerCount, setSpeakerCount] = useState(2);
  const [isScriptGenerating, setIsScriptGenerating] = useState(false);

  // Content analysis state
  const [rawTextToAnalyze, setRawTextToAnalyze] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalyzeTab, setShowAnalyzeTab] = useState(false);

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
      if (loadedProject.summary) setProjectSummary(loadedProject.summary);
      if (loadedProject.format) setFormat(loadedProject.format);
      if (loadedProject.style) setStyleTone(loadedProject.style);
      if (loadedProject.speakers && loadedProject.speakers.length > 0) {
        setSpeakers(loadedProject.speakers);
        setSpeakerCount(loadedProject.speakers.length);
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

  // Audio Context management
  const getAudioContext = () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

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
          // Fallback gracefully to Gemini voice with notice
          const fallbackVoice = ALL_VOICES.find(v => v.ssmlGender.toUpperCase() === (speaker.gender || 'MALE'))?.name || 'Algieba';
          const instruction = `Speak in character as ${speaker.name}. Emotion: ${line.emotion || 'Natural'}.`;
          const res = await generateSpeech(line.text, fallbackVoice, instruction);
          buffer = res.buffer;
          const wavBlob = audioBufferToWavBlob(buffer);
          audioUrl = URL.createObjectURL(wavBlob);
          setErrorMessage(`Note: VITE_ELEVENLABS_API_KEY was not found, so we generated this voice using Gemini's ${fallbackVoice} neural voice!`);
        } else {
          const res = await generateSpeechElevenLabs(line.text, speaker.voice);
          buffer = res.buffer;
          const wavBlob = new Blob([res.rawData], { type: 'audio/mpeg' });
          audioUrl = URL.createObjectURL(wavBlob);
        }
      } else {
        // Gemini TTS
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
      
      // Update status
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
          // Gemini TTS
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

        // Brief delay between sequential generations
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
        // Small pause between dialogue turns
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
      setShowAnalyzeTab(false);
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
      scene: 'Scene 1',
      emotion: 'Natural',
      status: 'idle'
    };
    setLines([...lines, newLine]);
  };

  // Helper to remove a line
  const handleRemoveLine = (id: string) => {
    setLines(lines.filter(l => l.id !== id));
  };

  // Speaker voice change
  const handleSpeakerVoiceChange = (speakerName: string, newVoice: string, provider: 'gemini' | 'elevenlabs') => {
    setSpeakers(prev => prev.map(s => s.name === speakerName ? { ...s, voice: newVoice, provider } : s));
  };

  const readyCount = lines.filter(l => l.status === 'ready').length;

  return (
    <div className="flex flex-col h-full bg-[#F4F4F0] overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-8">
      
      {/* Top Banner: Multi-Speaker Audio Studio Header */}
      <div className="border-4 border-[#1A1A1A] bg-white p-6 shadow-hard flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-rose-600 text-white font-mono text-xs px-2 py-0.5 uppercase tracking-wider font-bold">
              Multi-Speaker Engine
            </span>
            <span className="bg-[#1A1A1A] text-white font-mono text-xs px-2 py-0.5 uppercase tracking-wider">
              Gemini + ElevenLabs
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1A1A1A] uppercase">
            {projectTitle}
          </h1>
          <p className="text-sm text-zinc-600 font-mono mt-1 max-w-2xl">
            {projectSummary}
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={handleSaveToCloud}
            disabled={isSaving || lines.length === 0}
            className={`border-2 border-[#1A1A1A] px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold transition-transform active:translate-x-0.5 active:translate-y-0.5 shadow-hard-xs flex items-center gap-2 ${
              justSaved ? 'bg-emerald-500 text-white' : 'bg-sky-500 hover:bg-sky-400 text-white'
            }`}
            title="Persist this scene to Firebase Firestore"
          >
            {justSaved ? <CheckCircle2 className="w-4 h-4" /> : <Cloud className="w-4 h-4" />}
            {isSaving ? 'Saving...' : justSaved ? 'Saved to Cloud!' : 'Save to Firebase'}
          </button>

          {onOpenCloudModal && (
            <button
              onClick={onOpenCloudModal}
              className="border-2 border-[#1A1A1A] bg-white hover:bg-zinc-100 text-[#1A1A1A] px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold transition-transform active:translate-x-0.5 active:translate-y-0.5 shadow-hard-xs flex items-center gap-2"
              title="Open saved projects from Firebase"
            >
              <FolderOpen className="w-4 h-4 text-sky-600" />
              Cloud Projects ({savedProjects.length})
            </button>
          )}

          <button
            onClick={() => setShowAnalyzeTab(!showAnalyzeTab)}
            className={`border-2 border-[#1A1A1A] px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold transition-transform active:translate-x-0.5 active:translate-y-0.5 shadow-hard-xs flex items-center gap-2 ${showAnalyzeTab ? 'bg-[#1A1A1A] text-white' : 'bg-amber-400 text-[#1A1A1A] hover:bg-amber-300'}`}
          >
            <Wand2 className="w-4 h-4" />
            {showAnalyzeTab ? 'Close Content Analyzer' : 'Auto-Detect / Paste Script'}
          </button>
        </div>
      </div>

      {/* Global Error/Notification Message */}
      {errorMessage && (
        <div className="border-2 border-rose-600 bg-rose-50 text-rose-800 p-4 font-mono text-xs flex items-center justify-between shadow-hard-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Raw Script & Content Auto-Detection Accordion */}
      {showAnalyzeTab && (
        <div className="border-4 border-[#1A1A1A] bg-amber-50 p-6 shadow-hard space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-black uppercase text-[#1A1A1A]">
                Auto-Detection & Speaker Parsing Engine
              </h2>
            </div>
            <span className="text-xs font-mono bg-[#1A1A1A] text-white px-2 py-1">
              Powered by Gemini 2.5 Flash
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-700">
            Paste any raw article, screenplay scene, interview transcript, or dialogue below. Gemini will automatically extract speakers, partition scenes, detect emotional directions, and configure voices.
          </p>
          <textarea
            value={rawTextToAnalyze}
            onChange={e => setRawTextToAnalyze(e.target.value)}
            placeholder="Paste your raw script, dialogue turns (e.g., 'Sam: What do you mean?'), or article text here..."
            className="w-full h-36 p-4 border-2 border-[#1A1A1A] font-mono text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner resize-y"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowAnalyzeTab(false)}
              className="border-2 border-[#1A1A1A] bg-white px-4 py-2 font-mono text-xs uppercase"
            >
              Cancel
            </button>
            <BauhausButton
              onClick={handleAnalyzeContent}
              disabled={isAnalyzing || !rawTextToAnalyze.trim()}
              variant="secondary"
              className="px-6 py-2 text-xs"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Script...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Analyze Content & Detect Speakers
                </span>
              )}
            </BauhausButton>
          </div>
        </div>
      )}

      {/* Script Generation Box (If user wants to create from a prompt) */}
      <div className="border-4 border-[#1A1A1A] bg-white p-6 shadow-hard space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-600" />
            AI Script Generator
          </h2>
          <span className="text-xs font-mono text-zinc-500">
            Generate customized multi-speaker dialogues from scratch
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-mono uppercase tracking-wider mb-1 text-zinc-700">
              Topic or Scene Scenario
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. A product manager and engineer debating release timelines..."
              className="w-full p-2.5 border-2 border-[#1A1A1A] font-mono text-xs bg-[#F4F4F0] focus:bg-white outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider mb-1 text-zinc-700">
              Format
            </label>
            <select
              value={format}
              onChange={e => setFormat(e.target.value)}
              className="w-full p-2.5 border-2 border-[#1A1A1A] font-mono text-xs bg-white outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="Podcast Dialogue">Podcast Dialogue</option>
              <option value="All-Hands Kickoff">All-Hands Kickoff</option>
              <option value="Movie Scene">Cinematic Movie Scene</option>
              <option value="Tech Debate">Tech Debate</option>
              <option value="Comedy Sketch">Comedy Sketch</option>
              <option value="News Interview">News Interview</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider mb-1 text-zinc-700">
              Style / Tone
            </label>
            <select
              value={styleTone}
              onChange={e => setStyleTone(e.target.value)}
              className="w-full p-2.5 border-2 border-[#1A1A1A] font-mono text-xs bg-white outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="High Stakes & Dramatic">High Stakes & Dramatic</option>
              <option value="Casual & Conversational">Casual & Conversational</option>
              <option value="Hyper Energized & Hype">Hyper Energized & Hype</option>
              <option value="Playful & Witty">Playful & Witty</option>
              <option value="Suspenseful & Mysterious">Suspenseful & Mysterious</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-600">Speakers:</span>
            {[2, 3, 4].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => setSpeakerCount(num)}
                className={`w-7 h-7 border-2 border-[#1A1A1A] font-mono text-xs font-bold ${speakerCount === num ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A]'}`}
              >
                {num}
              </button>
            ))}
          </div>

          <BauhausButton
            onClick={handleGenerateScriptWithAI}
            disabled={isScriptGenerating || !topic.trim()}
            variant="primary"
            className="px-6 py-2.5 text-xs uppercase tracking-wider font-mono font-bold"
          >
            {isScriptGenerating ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Writing Script...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Generate Script
              </span>
            )}
          </BauhausButton>
        </div>
      </div>

      {/* Speaker Voice Mapping Matrix */}
      <div className="border-4 border-[#1A1A1A] bg-white p-6 shadow-hard space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              Speaker & Voice Matrix
            </h2>
            <p className="text-xs font-mono text-zinc-500">
              Assign Gemini neural voices or ElevenLabs cloned/preset voices to each character
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono px-2 py-0.5 border ${hasElevenLabsKey ? 'bg-emerald-100 border-emerald-500 text-emerald-800' : 'bg-amber-100 border-amber-500 text-amber-800'}`}>
              ElevenLabs: {hasElevenLabsKey ? 'Active Key' : 'Preview Mode (Gemini fallback)'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {speakers.map((sp, idx) => {
            const colorTheme = SPEAKER_COLORS[sp.color || 'yellow'] || SPEAKER_COLORS.yellow;
            return (
              <div 
                key={idx} 
                className={`border-2 border-[#1A1A1A] p-4 bg-[#F4F4F0] shadow-hard-xs space-y-3 relative`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full border border-[#1A1A1A] ${colorTheme.bg}`} />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                      {sp.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-[#1A1A1A] text-white px-1.5 py-0.5">
                    {sp.gender || 'MALE'}
                  </span>
                </div>

                {/* Voice Provider Switcher */}
                <div className="flex border border-[#1A1A1A] text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => handleSpeakerVoiceChange(sp.name, 'Algieba', 'gemini')}
                    className={`flex-1 py-1 text-center font-bold ${sp.provider === 'gemini' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-zinc-700 hover:bg-zinc-100'}`}
                  >
                    Gemini TTS
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSpeakerVoiceChange(sp.name, '21m00Tcm4TlvDq8ikWAM', 'elevenlabs')}
                    className={`flex-1 py-1 text-center font-bold ${sp.provider === 'elevenlabs' ? 'bg-sky-600 text-white' : 'bg-white text-zinc-700 hover:bg-zinc-100'}`}
                  >
                    ElevenLabs
                  </button>
                </div>

                {/* Voice Selector Dropdown */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                    Assigned Voice
                  </label>
                  {sp.provider === 'gemini' ? (
                    <select
                      value={sp.voice}
                      onChange={e => handleSpeakerVoiceChange(sp.name, e.target.value, 'gemini')}
                      className="w-full p-2 border-2 border-[#1A1A1A] font-mono text-xs bg-white outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {ALL_VOICES.map(v => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.ssmlGender} - {v.style})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={sp.voice}
                      onChange={e => handleSpeakerVoiceChange(sp.name, e.target.value, 'elevenlabs')}
                      className="w-full p-2 border-2 border-[#1A1A1A] font-mono text-xs bg-white outline-none focus:ring-2 focus:ring-sky-500"
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
        </div>
      </div>

      {/* Scene & Dialogue Lines Grid */}
      <div className="border-4 border-[#1A1A1A] bg-white p-6 shadow-hard space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b-2 border-[#1A1A1A] pb-4">
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
              <Layers className="w-5 h-5 text-rose-600" />
              Scene-by-Scene Dialogue Tracks
            </h2>
            <p className="text-xs font-mono text-zinc-500">
              Generate voices one by one, edit scripts on the fly, or synthesize the entire scene combined.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs bg-zinc-100 border border-zinc-400 px-3 py-1 font-bold">
              Ready: {readyCount} / {lines.length}
            </span>
            <button
              onClick={handleAddLine}
              className="border-2 border-[#1A1A1A] bg-emerald-500 text-white hover:bg-emerald-600 px-3 py-1 text-xs font-mono font-bold flex items-center gap-1 shadow-hard-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Dialogue Line
            </button>
          </div>
        </div>

        {/* Lines Sequence */}
        <div className="space-y-4">
          {lines.map((line, idx) => {
            const sp = speakers.find(s => s.name === line.speaker) || speakers[0];
            const colorTheme = SPEAKER_COLORS[sp?.color || 'yellow'] || SPEAKER_COLORS.yellow;
            const isPlayingThis = playingLineId === line.id;
            const isGeneratingThis = line.status === 'generating';

            return (
              <div 
                key={line.id} 
                className={`border-2 border-[#1A1A1A] p-4 transition-all ${isPlayingThis ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-500' : 'bg-white hover:bg-[#FDFDFD]'} shadow-hard-xs space-y-3`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-zinc-400">
                      #{idx + 1}
                    </span>
                    
                    {/* Speaker selector */}
                    <select
                      value={line.speaker}
                      onChange={e => {
                        const newSp = e.target.value;
                        setLines(prev => prev.map(l => l.id === line.id ? { ...l, speaker: newSp } : l));
                      }}
                      className={`text-xs font-mono font-bold border-2 border-[#1A1A1A] px-2 py-1 ${colorTheme.bg} ${colorTheme.text} outline-none cursor-pointer`}
                    >
                      {speakers.map(s => (
                        <option key={s.name} value={s.name}>
                          {s.name} ({s.provider === 'gemini' ? `Gemini: ${s.voice}` : `ElevenLabs`})
                        </option>
                      ))}
                    </select>

                    {/* Emotion Tag */}
                    <input
                      type="text"
                      value={line.emotion || ''}
                      onChange={e => {
                        const newEm = e.target.value;
                        setLines(prev => prev.map(l => l.id === line.id ? { ...l, emotion: newEm } : l));
                      }}
                      placeholder="Emotion / Delivery (e.g. Whispering, Bold)"
                      className="text-[11px] font-mono border border-zinc-400 bg-zinc-50 px-2 py-0.5 max-w-[180px] outline-none"
                    />

                    <span className="text-[10px] font-mono text-zinc-400">
                      {line.scene || 'Scene 1'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Pill */}
                    {line.status === 'ready' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-500 px-2 py-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ready
                      </span>
                    )}
                    {line.status === 'generating' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-sky-100 text-sky-800 border border-sky-500 px-2 py-0.5 animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Synthesizing...
                      </span>
                    )}
                    {line.status === 'error' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-500 px-2 py-0.5">
                        <AlertCircle className="w-3 h-3 text-rose-600" /> Error
                      </span>
                    )}

                    {/* Delete Line Button */}
                    <button
                      onClick={() => handleRemoveLine(line.id)}
                      className="text-zinc-400 hover:text-rose-600 p-1 transition-colors"
                      title="Delete Line"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Spoken Text Area (Editable inline) */}
                <div>
                  <textarea
                    value={line.text}
                    onChange={e => {
                      const newText = e.target.value;
                      setLines(prev => prev.map(l => l.id === line.id ? { ...l, text: newText, status: 'idle', audioBuffer: null, audioUrl: null } : l));
                    }}
                    rows={2}
                    className="w-full p-2.5 border border-[#1A1A1A] font-mono text-xs bg-[#FAF9F5] focus:bg-white outline-none focus:ring-2 focus:ring-amber-500 resize-y"
                    placeholder="Enter spoken dialogue..."
                  />
                </div>

                {/* Line Control Toolbar (One by One Generation & Playback) */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    {/* Individual Generate Button */}
                    <button
                      onClick={() => handleGenerateLine(line.id)}
                      disabled={isGeneratingThis || isBatchGenerating || !line.text.trim()}
                      className="border-2 border-[#1A1A1A] bg-amber-400 hover:bg-amber-300 disabled:opacity-50 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-hard-xs transition-transform active:translate-x-0.5 active:translate-y-0.5"
                    >
                      {isGeneratingThis ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                      {line.status === 'ready' ? 'Regenerate Line' : 'Generate Voice'}
                    </button>

                    {/* Play Line Button */}
                    {line.audioBuffer && (
                      <button
                        onClick={() => {
                          if (isPlayingThis) {
                            stopCurrentPlayback();
                          } else {
                            playLineAudio(line.id, line.audioBuffer!);
                          }
                        }}
                        className={`border-2 border-[#1A1A1A] px-3 py-1 text-xs font-mono font-bold uppercase flex items-center gap-1.5 shadow-hard-xs ${isPlayingThis ? 'bg-rose-600 text-white' : 'bg-white text-[#1A1A1A] hover:bg-zinc-100'}`}
                      >
                        {isPlayingThis ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {isPlayingThis ? 'Pause' : 'Play Line'}
                      </button>
                    )}

                    {/* Download Line Audio */}
                    {line.audioUrl && (
                      <a
                        href={line.audioUrl}
                        download={`${line.speaker.toLowerCase().replace(/\s+/g, '_')}_line_${idx + 1}.wav`}
                        className="border-2 border-[#1A1A1A] bg-white hover:bg-zinc-100 px-2.5 py-1 text-xs font-mono font-bold uppercase flex items-center gap-1 shadow-hard-xs"
                        title="Download this line's audio"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {line.audioBuffer && (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5 items-center h-4">
                        {[4, 8, 14, 6, 12, 16, 10, 5, 12, 8, 15, 6].map((h, i) => (
                          <div 
                            key={i} 
                            style={{ height: `${h}px` }} 
                            className={`w-1 ${isPlayingThis ? 'bg-amber-500 animate-pulse' : 'bg-zinc-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {(line.audioBuffer.duration).toFixed(1)}s
                      </span>
                    </div>
                  )}
                </div>

                {line.errorMessage && (
                  <p className="text-[10px] font-mono text-rose-600 bg-rose-50 p-1.5 border border-rose-300">
                    {line.errorMessage}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Master Audio Bar (Batch / Combined Controls) */}
      <div className="sticky bottom-4 z-40 border-4 border-[#1A1A1A] bg-[#1A1A1A] text-white p-5 shadow-hard flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 bg-amber-400 text-zinc-950 border-2 border-white flex items-center justify-center font-black text-xl flex-shrink-0">
            {readyCount}/{lines.length}
          </div>
          <div>
            <div className="font-mono text-xs uppercase text-amber-400 font-bold tracking-wider">
              Combined Scene Orchestrator
            </div>
            <div className="text-sm font-bold truncate max-w-md">
              {projectTitle}
            </div>
            {isBatchGenerating && (
              <div className="text-[11px] font-mono text-sky-400 animate-pulse">
                Synthesizing line {batchProgress.current} of {batchProgress.total}...
              </div>
            )}
          </div>
        </div>

        {/* Master Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Generate All Lines Button */}
          <button
            onClick={handleGenerateAllLines}
            disabled={isBatchGenerating}
            className="border-2 border-white bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-mono text-xs font-bold uppercase tracking-wider px-4 py-2.5 flex items-center gap-2 shadow-hard-xs transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            {isBatchGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <FastForward className="w-4 h-4" />
            )}
            {readyCount === lines.length ? 'Regenerate All Lines' : 'Generate All Lines'}
          </button>

          {/* Play Full Scene Button */}
          <button
            onClick={() => {
              if (isPlayingFullSequence) {
                stopCurrentPlayback();
              } else {
                handlePlayFullScene();
              }
            }}
            disabled={readyCount === 0 || isBatchGenerating}
            className={`border-2 border-white font-mono text-xs font-bold uppercase tracking-wider px-4 py-2.5 flex items-center gap-2 shadow-hard-xs transition-transform active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 ${isPlayingFullSequence ? 'bg-rose-600 text-white' : 'bg-amber-400 text-zinc-950 hover:bg-amber-300'}`}
          >
            {isPlayingFullSequence ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlayingFullSequence ? 'Stop Scene' : 'Play Full Scene'}
          </button>

          {/* Stitch & Download Master WAV */}
          <button
            onClick={handleDownloadCombinedWav}
            disabled={readyCount === 0 || isBatchGenerating}
            className="border-2 border-white bg-white text-zinc-950 hover:bg-zinc-100 disabled:opacity-50 font-mono text-xs font-bold uppercase tracking-wider px-4 py-2.5 flex items-center gap-2 shadow-hard-xs transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <Download className="w-4 h-4" />
            Download Combined WAV
          </button>
        </div>
      </div>

    </div>
  );
};
