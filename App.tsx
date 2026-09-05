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
import { MonologueBentoStudio } from './components/MonologueBentoStudio';
import { AudioProductionSuite } from './components/AudioProductionSuite';
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

            {/* Right Column: Studio Workspace as Bento Grid */}
            <MonologueBentoStudio
              text={text}
              onTextChange={(val) => {
                setText(val);
                setGeneratedAudio(null);
              }}
              selectedStyle={selectedStyle}
              selectedVoice={selectedVoice}
              onOpenPersonaSelect={() => {
                if (window.innerWidth < 768) {
                  setIsMobilePersonaDrawerOpen(true);
                } else {
                  setIsMonologueSidebarOpen(true);
                }
              }}
              onOpenVoiceConfig={() => setIsConfigOpen(true)}
              onOpenPromptModal={() => setIsPromptOpen(true)}
              isPlaying={isPlaying}
              isLoading={isGenerating}
              isDramatizing={isDramatizing}
              generatedAudio={generatedAudio}
              audioProgress={audioProgress}
              audioDuration={audioDuration}
              audioError={audioError}
              onDismissError={() => setAudioError(null)}
              onSynthesizeOrPlay={handleMainActionClick}
              onDramatize={handleDramatize}
              onSaveToCloud={handleSaveMonologueToCloud}
              isSaving={isSaving}
              justSaved={monologueJustSaved}
              onDownloadWav={handleDownload}
            />

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

        {/* MODE 3: AUDIO SUITE & CLONING (BENTO GRID) */}
        {activeMode === 'suite' && (
          <AudioProductionSuite
            onBgmBufferGenerated={(buf: AudioBuffer) => setBgmBuffer(buf)}
            activeBgmBuffer={bgmBuffer}
            onOpenVoiceCloning={() => setIsCloningOpen(true)}
          />
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
