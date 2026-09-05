/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { INTRO_STYLES, CUSTOM_STYLE, SUPPORTED_LANGUAGES } from './constants';
import { IntroStyle, Voice } from './types';
import { ALL_VOICES } from './voices';
import { generateSpeech, dramatizeText, createWavBlob, audioBufferToWavBlob } from './services/geminiService';
import { 
  getElevenLabsVoices, 
  generateSpeechElevenLabs, 
  isElevenLabsKeyAvailable, 
  DEFAULT_ELEVENLABS_VOICES 
} from './services/elevenLabsService';
import { StyleSelector } from './components/StyleSelector';
import { ConfigurationModal } from './components/ConfigurationModal';
import { SystemPromptModal } from './components/SystemPromptModal';
import { MultiSpeakerStudio } from './components/MultiSpeakerStudio';
import { BgmGenerator } from './components/BgmGenerator';
import { VoiceCloningModal } from './components/VoiceCloningModal';
import { FirebaseProjectsModal } from './components/FirebaseProjectsModal';
import { BauhausButton, getIcon, getColorClass, DownloadIcon } from './components/BauhausComponents';
import { useFirebase } from './services/firebaseContext';
import { SavedAudioProject } from './types';
import { 
  Play, 
  Pause, 
  Sparkles, 
  Settings, 
  Mic, 
  Music, 
  Layers, 
  Volume2, 
  RotateCcw, 
  Sliders, 
  Globe, 
  Check, 
  Info,
  Radio,
  Download,
  Cloud,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X
} from 'lucide-react';

type StudioMode = 'intro' | 'multispeaker' | 'suite';

const App: React.FC = () => {
  // Firebase State
  const { 
    user, 
    isOnline, 
    savedProjects, 
    savedMonologues, 
    saveMonologueToCloud, 
    isSaving, 
    statusMessage, 
    clearStatusMessage 
  } = useFirebase();
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [loadedMultiSpeakerProject, setLoadedMultiSpeakerProject] = useState<SavedAudioProject | null>(null);
  const [monologueJustSaved, setMonologueJustSaved] = useState(false);

  // Navigation / Mode
  const [activeMode, setActiveMode] = useState<StudioMode>('intro');
  const [isMonologueSidebarOpen, setIsMonologueSidebarOpen] = useState<boolean>(true);
  const [isMobilePersonaDrawerOpen, setIsMobilePersonaDrawerOpen] = useState<boolean>(false);

  // Voice and Style States
  const [selectedStyle, setSelectedStyle] = useState<IntroStyle>(INTRO_STYLES[0]);
  const [customStyle, setCustomStyle] = useState<IntroStyle>(CUSTOM_STYLE);
  const [selectedVoice, setSelectedVoice] = useState<string>(INTRO_STYLES[0].defaultVoice);
  const [text, setText] = useState<string>(INTRO_STYLES[0].templateText);

  // Audio Generation & Playback States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDramatizing, setIsDramatizing] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Audio buffer and context refs
  const [generatedAudio, setGeneratedAudio] = useState<{ buffer: AudioBuffer; rawData: Uint8Array } | null>(null);
  const [bgmBuffer, setBgmBuffer] = useState<AudioBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Pre-generated HTML audio element ref
  const pregenAudioRef = useRef<HTMLAudioElement | null>(null);

  // Modal States
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isPromptOpen, setIsPromptOpen] = useState<boolean>(false);
  const [isCloningOpen, setIsCloningOpen] = useState<boolean>(false);

  // Available Voices: Combine Gemini and ElevenLabs
  const [elevenLabsVoicesList, setElevenLabsVoicesList] = useState<Voice[]>(DEFAULT_ELEVENLABS_VOICES);
  const hasElevenLabsKey = isElevenLabsKeyAvailable();

  useEffect(() => {
    getElevenLabsVoices().then(v => {
      if (v && v.length > 0) setElevenLabsVoicesList(v);
    });
  }, []);

  const allAvailableVoices = useMemo<Voice[]>(() => {
    const geminiVoices: Voice[] = ALL_VOICES.map(v => ({
      id: v.name,
      name: `${v.name} (${v.style})`,
      gender: v.ssmlGender === 'FEMALE' ? 'Female' : 'Male',
      languageCode: 'en-US',
      languageName: 'English (Gemini)',
      provider: 'gemini' as const
    }));
    return [...geminiVoices, ...elevenLabsVoicesList];
  }, [elevenLabsVoicesList]);

  // Language flag ticker in header
  const [currentLangIndex, setCurrentLangIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLangIndex(prev => (prev + 1) % SUPPORTED_LANGUAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Web Audio Context setup
  const getAudioContext = () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // Stop playback cleanly
  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {}
      sourceNodeRef.current = null;
    }
    if (pregenAudioRef.current) {
      pregenAudioRef.current.pause();
      pregenAudioRef.current.currentTime = 0;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsPlaying(false);
    setAudioProgress(0);
  };

  // Style change handler
  const handleSelectStyle = (style: IntroStyle) => {
    stopPlayback();
    setSelectedStyle(style);
    setSelectedVoice(style.defaultVoice);
    setText(style.templateText);
    setGeneratedAudio(null);
    setAudioError(null);
  };

  // Switch to custom style
  const handleSelectCustom = () => {
    stopPlayback();
    setSelectedStyle(customStyle);
    setSelectedVoice(customStyle.defaultVoice);
    setText(customStyle.templateText);
    setGeneratedAudio(null);
    setAudioError(null);
    setIsPromptOpen(true);
  };

  // Save custom persona from modal
  const handleSaveCustom = (newPrompt: string, newVoice?: string) => {
    const updated = {
      ...customStyle,
      description: newPrompt,
      defaultVoice: newVoice || customStyle.defaultVoice
    };
    setCustomStyle(updated);
    if (selectedStyle.id === 'custom') {
      setSelectedStyle(updated);
      if (newVoice) setSelectedVoice(newVoice);
    }
  };

  // Dramatize Text via Gemini AI
  const handleDramatize = async () => {
    if (!text.trim() || isDramatizing) return;
    setIsDramatizing(true);
    setAudioError(null);
    try {
      const dramatized = await dramatizeText(text, selectedStyle.description);
      setText(dramatized);
    } catch (err: any) {
      console.error("Dramatization failed:", err);
      setAudioError("Dramatization failed. Please try again.");
    } finally {
      setIsDramatizing(false);
    }
  };

  // Generate Speech Audio
  const handleGenerateSpeech = async () => {
    if (!text.trim() || isGenerating) return;
    stopPlayback();
    setIsGenerating(true);
    setAudioError(null);

    const isEleven = elevenLabsVoicesList.some(v => v.id === selectedVoice);

    try {
      if (isEleven) {
        if (!hasElevenLabsKey) {
          // Graceful fallback to corresponding Gemini voice
          const fallbackVoice = selectedStyle.defaultVoice || 'Algieba';
          const res = await generateSpeech(text, fallbackVoice, selectedStyle.description);
          setGeneratedAudio({ buffer: res.buffer, rawData: res.rawData });
          setAudioDuration(res.buffer.duration);
          setAudioError("Notice: ElevenLabs API Key is not set in environment. Generated using high-fidelity Gemini voice instead!");
          playGeneratedBuffer(res.buffer);
        } else {
          const res = await generateSpeechElevenLabs(text, selectedVoice);
          const rawBytes = new Uint8Array(res.rawData);
          setGeneratedAudio({ buffer: res.buffer, rawData: rawBytes });
          setAudioDuration(res.buffer.duration);
          playGeneratedBuffer(res.buffer);
        }
      } else {
        // Gemini TTS
        const res = await generateSpeech(text, selectedVoice, selectedStyle.description);
        setGeneratedAudio({ buffer: res.buffer, rawData: res.rawData });
        setAudioDuration(res.buffer.duration);
        playGeneratedBuffer(res.buffer);
      }
    } catch (err: any) {
      console.error("Speech generation error:", err);
      setAudioError(err.message || "Failed to generate speech.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Play a generated AudioBuffer
  const playGeneratedBuffer = (buffer: AudioBuffer) => {
    stopPlayback();
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    startTimeRef.current = ctx.currentTime;
    setAudioDuration(buffer.duration);
    setIsPlaying(true);

    source.onended = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };

    source.start(0);
    sourceNodeRef.current = source;

    // Progress animation ticker
    const updateProgress = () => {
      if (sourceNodeRef.current && buffer.duration > 0) {
        const elapsed = ctx.currentTime - startTimeRef.current;
        const progress = Math.min(1, elapsed / buffer.duration);
        setAudioProgress(progress);
        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(updateProgress);
        }
      }
    };
    animFrameRef.current = requestAnimationFrame(updateProgress);
  };

  // Play pre-generated audio file
  const playPregenAudio = () => {
    if (!selectedStyle.audioSrc) return;
    stopPlayback();

    if (!pregenAudioRef.current) {
      pregenAudioRef.current = new Audio(selectedStyle.audioSrc);
    } else {
      pregenAudioRef.current.src = selectedStyle.audioSrc;
    }

    pregenAudioRef.current.onended = () => {
      setIsPlaying(false);
      setAudioProgress(0);
    };
    pregenAudioRef.current.ontimeupdate = () => {
      if (pregenAudioRef.current && pregenAudioRef.current.duration > 0) {
        setAudioProgress(pregenAudioRef.current.currentTime / pregenAudioRef.current.duration);
        setAudioDuration(pregenAudioRef.current.duration);
      }
    };

    pregenAudioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(err => {
      console.warn("Autoplay blocked or audio load error:", err);
    });
  };

  // Main Action Play / Pause handler
  const handleMainActionClick = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    if (generatedAudio) {
      playGeneratedBuffer(generatedAudio.buffer);
    } else if (selectedStyle.audioSrc) {
      playPregenAudio();
    } else {
      handleGenerateSpeech();
    }
  };

  // Download WAV file
  const handleDownload = () => {
    if (!generatedAudio) return;
    const blob = generatedAudio.rawData 
      ? createWavBlob(generatedAudio.rawData, 24000)
      : audioBufferToWavBlob(generatedAudio.buffer);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedStyle.name.toLowerCase().replace(/\s+/g, '_')}_speech.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Save Monologue/Intro to Firebase Firestore
  const handleSaveMonologueToCloud = async () => {
    if (!text.trim()) return;
    try {
      await saveMonologueToCloud({
        title: `${selectedStyle.name} (${selectedVoice})`,
        styleId: selectedStyle.id,
        voice: selectedVoice,
        text: text,
      });
      setMonologueJustSaved(true);
      setTimeout(() => setMonologueJustSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save monologue:", err);
    }
  };

  const currentLang = SUPPORTED_LANGUAGES[currentLangIndex];

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-[#F4F4F0] text-[#1A1A1A] overflow-hidden select-none font-sans">
      
      {/* Top Universal Header & Responsive Navigation Module */}
      <header className="border-b border-zinc-200 bg-white flex-shrink-0 z-30 shadow-studio">
        
        {/* Tier 1: Brand & Utilities Bar */}
        <div className="h-12 md:h-14 px-3 md:px-6 flex items-center justify-between">
          
          {/* Brand & Bauhaus Geometry */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-rose-600 shadow-xs" />
              <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-xs bg-amber-400 shadow-xs" />
              <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-xs bg-sky-500 shadow-xs" />
            </div>
            <span className="font-extrabold text-sm md:text-lg tracking-tight uppercase text-zinc-950">
              AUDIO FACTORY
            </span>
            <span className="hidden sm:inline-block text-[9px] font-mono font-bold uppercase bg-zinc-900 text-white px-1.5 py-0.5 rounded-xs tracking-wider">
              Studio Lab
            </span>
          </div>

          {/* Desktop Segmented Mode Navigator (Centered on md+) */}
          <nav className="hidden md:flex items-center rounded-lg border border-zinc-200 bg-zinc-100 p-1 gap-1">
            <button
              onClick={() => { stopPlayback(); setActiveMode('intro'); }}
              className={`px-3.5 py-1 text-xs font-mono font-bold rounded-md flex items-center gap-1.5 transition-all ${
                activeMode === 'intro' 
                  ? 'bg-white text-zinc-950 shadow-xs' 
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-zinc-800" />
              <span>Monologue</span>
            </button>
            <button
              onClick={() => { stopPlayback(); setActiveMode('multispeaker'); }}
              className={`px-3.5 py-1 text-xs font-mono font-bold rounded-md flex items-center gap-1.5 transition-all ${
                activeMode === 'multispeaker' 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Multi-Speaker</span>
            </button>
            <button
              onClick={() => { stopPlayback(); setActiveMode('suite'); }}
              className={`px-3.5 py-1 text-xs font-mono font-bold rounded-md flex items-center gap-1.5 transition-all ${
                activeMode === 'suite' 
                  ? 'bg-amber-400 text-zinc-950 shadow-xs' 
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-zinc-900" />
              <span>BGM & Tools</span>
            </button>
          </nav>

          {/* Header Utilities & Firebase Controls */}
          <div className="flex items-center gap-1.5 md:gap-2">
            
            {/* Firebase Cloud Projects Drawer Trigger */}
            <button
              onClick={() => setIsCloudModalOpen(true)}
              className="flex items-center gap-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 px-2.5 py-1.5 rounded-md text-xs font-mono font-medium shadow-xs transition-colors"
              title="Open Firebase Cloud Database & Saved Projects"
            >
              <Cloud className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Cloud</span>
              {(savedProjects.length > 0 || savedMonologues.length > 0) && (
                <span className="bg-sky-100 text-sky-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {savedProjects.length + savedMonologues.length}
                </span>
              )}
            </button>

            {/* User Account / Auth Indicator */}
            <button
              onClick={() => setIsCloudModalOpen(true)}
              className="border border-zinc-200 bg-white hover:bg-zinc-50 px-2 py-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 shadow-xs transition-colors"
              title={user ? (user.displayName || user.email || 'Guest Creator (Cloud Active)') : 'Sign In to Firebase'}
            >
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="text-[11px] font-bold text-zinc-800 hidden lg:inline">
                {user ? (user.displayName?.split(' ')[0] || (user.isAnonymous ? 'Guest' : 'Creator')) : 'Online'}
              </span>
            </button>

            {/* Voice Configuration Trigger */}
            <button
              onClick={() => setIsConfigOpen(true)}
              className="border border-zinc-200 bg-white hover:bg-zinc-50 p-1.5 rounded-md shadow-xs transition-colors text-zinc-700 hover:text-zinc-950"
              title="Configure Voices (Gemini & ElevenLabs)"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Voice Cloning Trigger */}
            <button
              onClick={() => setIsCloningOpen(true)}
              className="hidden xl:flex items-center gap-1.5 border border-rose-700 bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1.5 rounded-md text-xs font-mono font-bold shadow-xs transition-colors"
            >
              <Mic className="w-3.5 h-3.5" />
              Clone
            </button>
          </div>

        </div>

        {/* Tier 2: Sticky Navigation Module on Mobile (< md) */}
        <nav className="md:hidden flex border-t border-zinc-200 bg-zinc-100 p-1 gap-1">
          <button
            onClick={() => { stopPlayback(); setActiveMode('intro'); }}
            className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'intro'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-zinc-800" />
            <span>Monologue</span>
          </button>
          <button
            onClick={() => { stopPlayback(); setActiveMode('multispeaker'); }}
            className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'multispeaker'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Multi-Speaker</span>
          </button>
          <button
            onClick={() => { stopPlayback(); setActiveMode('suite'); }}
            className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'suite'
                ? 'bg-amber-400 text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-zinc-900" />
            <span>Suite</span>
          </button>
        </nav>

      </header>

      {/* Cloud Notification Toast */}
      {statusMessage && (
        <div className={`px-4 py-2 text-xs font-mono flex items-center justify-between border-b border-zinc-200 ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
          statusMessage.type === 'error' ? 'bg-rose-50 text-rose-900 border-rose-200' : 'bg-sky-50 text-sky-900 border-sky-200'
        }`}>
          <div className="flex items-center gap-2">
            <Cloud className="w-3.5 h-3.5" />
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={clearStatusMessage} className="font-bold ml-4">✕</button>
        </div>
      )}

      {/* Main Studio Viewport */}
      <main className="flex-1 min-h-0 overflow-hidden">
        
        {/* MODE 1: INTRO & MONOLOGUE STUDIO */}
        {/* MODE 1: MONOLOGUE STUDIO */}
        {activeMode === 'intro' && (
          <div className="flex flex-col md:flex-row h-full overflow-hidden">
            
            {/* Desktop Smart Sidebar (Hidden on mobile) */}
            <aside className={`
              hidden md:flex flex-col flex-shrink-0 border-r border-zinc-200 bg-white transition-all duration-200 overflow-hidden z-10
              ${isMonologueSidebarOpen ? 'w-72 lg:w-80' : 'w-14'}
            `}>
              {isMonologueSidebarOpen ? (
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="p-3 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs uppercase tracking-wider text-zinc-800">
                        Speaker Personas
                      </span>
                      <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold border border-amber-200">
                        {INTRO_STYLES.length + 1} Presets
                      </span>
                    </div>
                    <button
                      onClick={() => setIsMonologueSidebarOpen(false)}
                      className="p-1 rounded hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 transition-colors"
                      title="Collapse Sidebar into Icon Rail"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <StyleSelector 
                      selectedStyle={selectedStyle}
                      onSelect={handleSelectStyle}
                      onCustomize={handleSelectCustom}
                    />
                  </div>
                </div>
              ) : (
                /* Collapsed Tactile Icon Rail on Desktop */
                <div className="flex flex-col items-center py-3 space-y-3 h-full">
                  <button
                    onClick={() => setIsMonologueSidebarOpen(true)}
                    className="w-8 h-8 rounded-md border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors shadow-2xs"
                    title="Expand Persona Sidebar"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="w-6 h-[1px] bg-zinc-200" />

                  {/* Mini Persona Icons for Quick-Switching */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center gap-2 py-1">
                    {INTRO_STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => handleSelectStyle(style)}
                        className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
                          selectedStyle.id === style.id
                            ? 'border-zinc-900 ring-2 ring-amber-400 shadow-xs scale-105'
                            : 'border-zinc-200 hover:border-zinc-400 opacity-70 hover:opacity-100'
                        } ${getColorClass(style.color, true)}`}
                        title={`${style.name} (${style.defaultVoice})`}
                      >
                        {getIcon(style.icon, "w-4 h-4 text-white")}
                      </button>
                    ))}
                  </div>

                  <div className="p-1 rounded bg-zinc-100 text-zinc-400 text-[9px] font-mono uppercase [writing-mode:vertical-lr] tracking-widest font-bold">
                    PERSONAS
                  </div>
                </div>
              )}
            </aside>

            {/* Right Column: Studio Workspace with KEY CONTROLS ON TOP */}
            <div className="flex-1 flex flex-col bg-[#F7F7F4] min-w-0 overflow-hidden">
              
              {/* KEY CONTROL COMMAND STATION (STICKY ON TOP) */}
              <div className="border-b border-zinc-200 bg-white shadow-studio flex-shrink-0 z-20">
                
                {/* Row 1: Primary Controls & Key Actions */}
                <div className="p-3 sm:p-4 md:px-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  
                  {/* Left: Tactical Primary Synthesis / Play Button + Status Telemetry */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleMainActionClick}
                      disabled={isGenerating || !text.trim()}
                      className={`h-11 sm:h-12 px-4 sm:px-5 rounded-lg font-mono text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-tactile active:scale-98 flex-shrink-0 ${
                        isGenerating
                          ? 'bg-amber-400 border border-amber-500 text-zinc-950 cursor-wait'
                          : isPlaying
                          ? 'bg-rose-600 hover:bg-rose-500 border border-rose-700 text-white animate-pulse'
                          : generatedAudio
                          ? 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-700 text-white'
                          : 'bg-zinc-950 hover:bg-zinc-800 border border-zinc-950 text-white disabled:opacity-50'
                      }`}
                      aria-label={isPlaying ? 'Pause Audio' : isGenerating ? 'Synthesizing...' : 'Generate and Play'}
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                          <span>SYNTHESIZING</span>
                        </>
                      ) : isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>PAUSE</span>
                        </>
                      ) : generatedAudio ? (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>REPLAY</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>SYNTHESIZE</span>
                        </>
                      )}
                    </button>

                    {/* Telemetry Status & Duration */}
                    <div className="flex flex-col justify-center min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          isGenerating 
                            ? 'bg-amber-500 animate-ping' 
                            : isPlaying 
                            ? 'bg-rose-500 animate-pulse' 
                            : generatedAudio 
                            ? 'bg-emerald-500' 
                            : 'bg-zinc-400'
                        }`} />
                        <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-zinc-600 truncate">
                          {isGenerating ? 'Neural Processing' : isPlaying ? 'On Air' : generatedAudio ? 'Audio Ready' : 'Standby'}
                        </span>
                      </div>
                      <div className="text-xs font-mono font-bold text-zinc-800 truncate">
                        {audioDuration > 0 ? `${audioDuration.toFixed(1)}s audio` : `${text.length} chars`}
                        {generatedAudio && (
                          <span className="text-[10px] font-medium text-emerald-600 ml-1.5">
                            ✓ 24kHz
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Persona Quick-Select, AI Dramatize, Cloud & WAV Export */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-between sm:justify-end">
                    
                    {/* Active Persona Chip (Opens sheet on mobile, reveals sidebar on desktop) */}
                    <button
                      onClick={() => {
                        if (window.innerWidth < 768) {
                          setIsMobilePersonaDrawerOpen(true);
                        } else {
                          setIsMonologueSidebarOpen(true);
                        }
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 transition-colors shadow-2xs"
                      title="Switch Speaker Persona"
                    >
                      <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${getColorClass(selectedStyle.color, true)}`}>
                        {getIcon(selectedStyle.icon, "w-3 h-3 text-white")}
                      </div>
                      <div className="text-left">
                        <div className="text-[11px] font-mono font-bold truncate max-w-[100px] sm:max-w-[130px]">
                          {selectedStyle.name}
                        </div>
                        <div className="text-[9px] font-mono text-zinc-500 truncate">
                          {selectedVoice}
                        </div>
                      </div>
                      <ChevronDown className="w-3 h-3 text-zinc-400" />
                    </button>

                    {/* Voice Config trigger */}
                    <button
                      onClick={() => setIsConfigOpen(true)}
                      className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-950 shadow-2xs transition-colors"
                      title="Change Voice Profile"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>

                    {/* AI Dramatize Button */}
                    <button
                      onClick={handleDramatize}
                      disabled={isDramatizing || !text.trim()}
                      className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xs ${
                        isDramatizing 
                          ? 'bg-amber-100 text-amber-900 border-amber-300' 
                          : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-300'
                      }`}
                      title="Dramatize script with Gemini AI"
                    >
                      <Sparkles className={`w-3.5 h-3.5 text-amber-600 ${isDramatizing ? 'animate-spin' : ''}`} />
                      <span className="hidden xs:inline">Dramatize</span>
                      <span className="xs:hidden">AI</span>
                    </button>

                    {/* Save Script to Cloud */}
                    <button
                      onClick={handleSaveMonologueToCloud}
                      disabled={isSaving || !text.trim()}
                      className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-all shadow-2xs ${
                        monologueJustSaved 
                          ? 'bg-emerald-600 text-white border-emerald-700' 
                          : 'bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200'
                      }`}
                      title="Save monologue script to Firebase"
                    >
                      {monologueJustSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5 text-sky-600" />}
                      <span className="hidden sm:inline">{monologueJustSaved ? 'Saved' : 'Save'}</span>
                    </button>

                    {/* Download WAV Button */}
                    <button
                      onClick={handleDownload}
                      disabled={!generatedAudio}
                      className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-sky-600 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xs"
                      title="Download 24kHz broadcast WAV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WAV</span>
                    </button>

                  </div>

                </div>

                {/* Row 2: Live Waveform Visualizer & Playhead Scrubber */}
                <div className="px-3 py-2 sm:px-4 md:px-6 bg-zinc-50 border-t border-zinc-200 flex items-center gap-3">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase font-bold flex-shrink-0">
                    Waveform: {(audioProgress * 100).toFixed(0)}%
                  </div>
                  <div className="flex-1 flex items-end gap-0.5 sm:gap-1 h-5 bg-white border border-zinc-200 rounded px-1.5 py-0.5 overflow-hidden">
                    {[14, 28, 20, 36, 24, 18, 32, 26, 18, 30, 16, 22, 28, 20, 26, 36, 18, 24, 32, 20, 28, 34, 22, 16, 30, 24, 18, 28].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${Math.min(100, Math.max(15, h * (isPlaying ? 1.2 : 0.6)))}%` }}
                        className={`flex-1 rounded-2xs transition-all ${
                          audioProgress > (i / 28) ? 'bg-rose-600' : 'bg-zinc-200'
                        }`}
                      />
                    ))}
                  </div>
                  {audioDuration > 0 && (
                    <div className="text-[10px] font-mono text-zinc-500 flex-shrink-0">
                      {(audioProgress * audioDuration).toFixed(1)}s / {audioDuration.toFixed(1)}s
                    </div>
                  )}
                </div>

              </div>

              {/* Error Notice */}
              {audioError && (
                <div className="m-3 md:m-4 p-3 rounded-md border border-rose-200 bg-rose-50 text-rose-800 font-mono text-xs flex justify-between items-center z-10 flex-shrink-0">
                  <span>{audioError}</span>
                  <button onClick={() => setAudioError(null)} className="font-bold text-rose-700 ml-4">✕</button>
                </div>
              )}

              {/* Script Editor Canvas (Directly below Key Controls) */}
              <div className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 min-h-0 overflow-hidden">
                
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <label className="font-mono text-xs uppercase tracking-wider font-bold text-zinc-800">
                      Spoken Script / Introduction
                    </label>
                    <button 
                      onClick={() => setIsPromptOpen(true)}
                      className="text-zinc-400 hover:text-zinc-700 transition-colors"
                      title="View prompt instructions"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setText(selectedStyle.templateText);
                        setGeneratedAudio(null);
                      }}
                      className="text-[11px] font-mono text-zinc-500 hover:text-zinc-900 transition-colors"
                      title="Reset to persona default script"
                    >
                      Reset Template
                    </button>
                    <span className="text-zinc-300">|</span>
                    <button
                      onClick={() => {
                        setText('');
                        setGeneratedAudio(null);
                      }}
                      className="text-[11px] font-mono text-zinc-500 hover:text-rose-600 transition-colors"
                      title="Clear script"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setGeneratedAudio(null);
                  }}
                  className="w-full flex-1 p-3.5 sm:p-5 md:p-6 rounded-lg border border-zinc-200 font-mono text-xs sm:text-sm md:text-base leading-relaxed bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-studio resize-none overflow-y-auto custom-scrollbar"
                  placeholder="Type or paste your meeting intro or speech here..."
                />

                <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500 flex-shrink-0">
                  <span>💡 Tip: Add commas or ellipses (...) for natural speech pauses.</span>
                  <span>{text.length} characters</span>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* MODE 2: MULTI-SPEAKER SCENE STUDIO */}
        {activeMode === 'multispeaker' && (
          <MultiSpeakerStudio 
            onBgmOverlay={(buf) => setBgmBuffer(buf)} 
            loadedProject={loadedMultiSpeakerProject}
            onOpenCloudModal={() => setIsCloudModalOpen(true)}
          />
        )}

        {/* MODE 3: AUDIO SUITE & CLONING */}
        {activeMode === 'suite' && (
          <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-6 bg-[#F7F7F4]">
            <div className="border border-zinc-200 bg-white p-6 rounded-lg shadow-studio">
              <h1 className="text-2xl font-bold uppercase text-zinc-900 mb-1">
                Audio Production Suite
              </h1>
              <p className="text-xs font-mono text-zinc-600">
                Generate background music tracks, synthesize custom voice clones, and manage studio assets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* BGM Generator */}
              <div className="border border-zinc-200 bg-white p-6 rounded-lg shadow-studio space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                  <Music className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-bold uppercase text-zinc-900">
                    Background Music (BGM) Generator
                  </h2>
                </div>
                <p className="text-xs font-mono text-zinc-600">
                  Generate cinematic loops, ambient synth beds, and corporate podcast stingers using ElevenLabs audio soundscapes.
                </p>
                <BgmGenerator onBgmGenerated={(buf) => {
                  const ctx = getAudioContext();
                  ctx.decodeAudioData(buf.slice(0)).then(decoded => {
                    setBgmBuffer(decoded);
                  });
                }} />
              </div>

              {/* Voice Cloning Studio */}
              <div className="border border-zinc-200 bg-white p-6 rounded-lg shadow-studio space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                  <Mic className="w-5 h-5 text-rose-600" />
                  <h2 className="text-base font-bold uppercase text-zinc-900">
                    Instant Voice Cloning Studio
                  </h2>
                </div>
                <p className="text-xs font-mono text-zinc-600">
                  Clone your own voice by recording a 30-second audio snippet or uploading an audio file. Cloned voices can be assigned to characters in the Multi-Speaker studio.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsCloningOpen(true)}
                    className="w-full border border-rose-700 bg-rose-600 hover:bg-rose-500 text-white p-3.5 rounded-lg font-mono font-bold uppercase tracking-wider text-xs shadow-tactile flex items-center justify-center gap-2.5 transition-colors"
                  >
                    <Mic className="w-4 h-4" /> Launch Voice Cloning Wizard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Configuration Modal (Voice Selector) */}
      <ConfigurationModal 
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        selectedVoice={selectedVoice}
        onVoiceChange={(v) => {
          setSelectedVoice(v);
          setIsConfigOpen(false);
        }}
        voices={allAvailableVoices}
      />

      {/* System Prompt / Persona Modal */}
      <SystemPromptModal 
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        prompt={selectedStyle.description}
        isEditable={selectedStyle.id === 'custom'}
        onSave={handleSaveCustom}
        currentVoice={selectedVoice}
        voices={allAvailableVoices}
      />

      {/* Voice Cloning Modal */}
      <VoiceCloningModal 
        isOpen={isCloningOpen}
        onClose={() => setIsCloningOpen(false)}
        onSuccess={() => {
          getElevenLabsVoices().then(v => {
            if (v && v.length > 0) setElevenLabsVoicesList(v);
          });
        }}
      />

      {/* Firebase Cloud Projects Modal */}
      <FirebaseProjectsModal 
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        onLoadProject={(proj) => {
          setLoadedMultiSpeakerProject(proj);
          setActiveMode('multispeaker');
        }}
        onLoadMonologue={(mono) => {
          setText(mono.text);
          if (mono.voice) setSelectedVoice(mono.voice);
          setActiveMode('intro');
        }}
      />

      {/* Mobile Persona Sheet Drawer (< md) */}
      {isMobilePersonaDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="absolute inset-0"
            onClick={() => setIsMobilePersonaDrawerOpen(false)}
          />
          <div className="relative bg-white rounded-t-2xl shadow-2xl border-t border-zinc-200 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            
            {/* Drawer Handle & Header */}
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs uppercase tracking-wider text-zinc-900">
                  Select Speaker Persona
                </span>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                  {INTRO_STYLES.length + 1} Presets
                </span>
              </div>
              <button
                onClick={() => setIsMobilePersonaDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Style Selector inside Mobile Sheet */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <StyleSelector 
                selectedStyle={selectedStyle}
                onSelect={(style) => {
                  handleSelectStyle(style);
                  setIsMobilePersonaDrawerOpen(false);
                }}
                onCustomize={() => {
                  handleSelectCustom();
                  setIsMobilePersonaDrawerOpen(false);
                }}
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default App;
