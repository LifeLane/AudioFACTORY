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
  CheckCircle2
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
    <div className="flex flex-col h-screen w-screen bg-[#F4F4F0] text-[#1A1A1A] overflow-hidden select-none font-sans">
      
      {/* Top Universal Header */}
      <header className="h-16 border-b-4 border-[#1A1A1A] bg-white px-4 md:px-8 flex items-center justify-between flex-shrink-0 z-30 shadow-hard-xs">
        
        {/* Brand & Bauhaus Shapes */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-rose-600 border-2 border-[#1A1A1A]" />
            <div className="w-5 h-5 bg-amber-400 border-2 border-[#1A1A1A]" />
            <div className="w-5 h-5 bg-sky-500 border-2 border-[#1A1A1A]" />
          </div>
          <div>
            <span className="font-black text-xl md:text-2xl tracking-tighter uppercase text-[#1A1A1A]">
              AUDIO FACTORY
            </span>
            <span className="hidden md:inline-block ml-2 text-[10px] font-mono uppercase bg-[#1A1A1A] text-white px-1.5 py-0.5 tracking-wider">
              Studio
            </span>
          </div>
        </div>

        {/* Studio Mode Selector */}
        <div className="flex items-center border-2 border-[#1A1A1A] bg-[#F4F4F0] p-0.5">
          <button
            onClick={() => { stopPlayback(); setActiveMode('intro'); }}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${activeMode === 'intro' ? 'bg-[#1A1A1A] text-white' : 'text-zinc-700 hover:bg-zinc-200'}`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Intro & Monologue</span>
            <span className="sm:hidden">Intro</span>
          </button>
          <button
            onClick={() => { stopPlayback(); setActiveMode('multispeaker'); }}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${activeMode === 'multispeaker' ? 'bg-rose-600 text-white' : 'text-zinc-700 hover:bg-zinc-200'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Multi-Speaker Scenes</span>
            <span className="sm:hidden">Scenes</span>
          </button>
          <button
            onClick={() => { stopPlayback(); setActiveMode('suite'); }}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${activeMode === 'suite' ? 'bg-amber-400 text-zinc-950 font-black' : 'text-zinc-700 hover:bg-zinc-200'}`}
          >
            <Music className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BGM & Cloning</span>
            <span className="sm:hidden">Suite</span>
          </button>
        </div>

        {/* Header Utilities & Firebase Controls */}
        <div className="flex items-center gap-2">
          
          {/* Firebase Cloud Projects Drawer Trigger */}
          <button
            onClick={() => setIsCloudModalOpen(true)}
            className="flex items-center gap-1.5 border-2 border-[#1A1A1A] bg-sky-500 hover:bg-sky-400 text-white px-3 py-1.5 text-xs font-mono font-bold uppercase shadow-hard-xs transition-transform active:translate-x-0.5 active:translate-y-0.5"
            title="Open Firebase Cloud Database & Saved Projects"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Cloud Projects</span>
            {(savedProjects.length > 0 || savedMonologues.length > 0) && (
              <span className="bg-[#1A1A1A] text-white text-[10px] px-1.5 py-0.2 ml-0.5 rounded-full font-bold">
                {savedProjects.length + savedMonologues.length}
              </span>
            )}
          </button>

          {/* User Account / Auth Indicator */}
          <button
            onClick={() => setIsCloudModalOpen(true)}
            className="border-2 border-[#1A1A1A] bg-white hover:bg-zinc-100 px-2.5 py-1.5 text-xs font-mono flex items-center gap-1.5 shadow-hard-xs transition-transform active:translate-x-0.5 active:translate-y-0.5"
            title={user ? (user.displayName || user.email || 'Guest Creator (Cloud Active)') : 'Sign In to Firebase'}
          >
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-[11px] font-bold text-[#1A1A1A] hidden sm:inline">
              {user ? (user.displayName?.split(' ')[0] || (user.isAnonymous ? 'Guest' : 'Creator')) : 'Sign In'}
            </span>
          </button>

          {/* Animated Flag Ticker */}
          <div className="hidden xl:flex items-center gap-2 border-2 border-[#1A1A1A] bg-[#F4F4F0] px-2.5 py-1 text-xs font-mono">
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            <span className="font-bold text-[#1A1A1A]">{currentLang.code}</span>
            <span className="text-zinc-500 text-[11px] truncate max-w-[100px]">{currentLang.name}</span>
          </div>

          {/* Voice Configuration Trigger */}
          <button
            onClick={() => setIsConfigOpen(true)}
            className="border-2 border-[#1A1A1A] bg-white hover:bg-amber-400 p-2 shadow-hard-xs transition-transform active:translate-x-0.5 active:translate-y-0.5 text-[#1A1A1A]"
            title="Configure Voices (Gemini & ElevenLabs)"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Voice Cloning Trigger */}
          <button
            onClick={() => setIsCloningOpen(true)}
            className="hidden sm:flex items-center gap-1.5 border-2 border-[#1A1A1A] bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 text-xs font-mono font-bold uppercase shadow-hard-xs transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <Mic className="w-3.5 h-3.5" />
            Clone Voice
          </button>
        </div>
      </header>

      {/* Cloud Notification Toast */}
      {statusMessage && (
        <div className={`px-4 py-2 text-xs font-mono flex items-center justify-between border-b-2 border-[#1A1A1A] ${
          statusMessage.type === 'success' ? 'bg-emerald-100 text-emerald-900' :
          statusMessage.type === 'error' ? 'bg-rose-100 text-rose-900' : 'bg-sky-100 text-sky-900'
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
        
        {/* MODE 1: INTRO & MONOLOGUE STUDIO (The Classic Bauhaus App as it was) */}
        {activeMode === 'intro' && (
          <div className="flex flex-col md:flex-row h-full">
            
            {/* Left Column: Style Selector Sidebar */}
            <div className="w-full md:w-80 lg:w-96 border-b-4 md:border-b-0 md:border-r-4 border-[#1A1A1A] bg-[#F4F4F0] flex flex-col flex-shrink-0">
              <div className="p-4 border-b-2 border-[#1A1A1A] bg-white flex justify-between items-center">
                <span className="font-mono font-bold text-xs uppercase tracking-wider text-[#1A1A1A]">
                  Select Speaker Persona
                </span>
                <span className="text-[10px] font-mono bg-amber-400 px-1.5 py-0.5 font-bold border border-[#1A1A1A]">
                  {INTRO_STYLES.length + 1} Styles
                </span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <StyleSelector 
                  selectedStyle={selectedStyle}
                  onSelect={handleSelectStyle}
                  onCustomize={handleSelectCustom}
                />
              </div>
            </div>

            {/* Right Column: Interactive Monologue Studio */}
            <div className="flex-1 flex flex-col bg-[#F4F4F0] min-w-0 overflow-y-auto custom-scrollbar">
              
              {/* Persona Showcase Banner */}
              <div className="p-6 md:p-8 border-b-4 border-[#1A1A1A] bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 border-4 border-[#1A1A1A] flex-shrink-0 flex items-center justify-center overflow-hidden ${getColorClass(selectedStyle.color, true)} shadow-hard-xs`}>
                    {selectedStyle.avatarSrc ? (
                      <img src={selectedStyle.avatarSrc} alt={selectedStyle.name} className="w-full h-full object-cover" />
                    ) : (
                      getIcon(selectedStyle.icon, "w-8 h-8 text-white")
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl md:text-3xl font-black uppercase text-[#1A1A1A] tracking-tight">
                        {selectedStyle.name}
                      </h2>
                      <button 
                        onClick={() => setIsPromptOpen(true)}
                        className="text-zinc-500 hover:text-rose-600 transition-colors"
                        title="View system prompt instructions"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono bg-zinc-100 border border-zinc-400 px-2 py-0.5 text-zinc-700">
                        Voice: <strong className="text-[#1A1A1A]">{selectedVoice}</strong>
                      </span>
                      <button
                        onClick={() => setIsConfigOpen(true)}
                        className="text-[11px] font-mono text-sky-600 hover:underline uppercase font-bold"
                      >
                        Change Voice
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dramatize Button */}
                <BauhausButton
                  onClick={handleDramatize}
                  disabled={isDramatizing || !text.trim()}
                  variant="secondary"
                  className="px-5 py-2.5 text-xs font-mono uppercase font-bold tracking-wider"
                >
                  {isDramatizing ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin text-[#1A1A1A]" />
                      Dramatizing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#1A1A1A]" />
                      Dramatize This (AI Rewrite)
                    </span>
                  )}
                </BauhausButton>
              </div>

              {/* Error Notice */}
              {audioError && (
                <div className="m-6 p-4 border-2 border-rose-600 bg-rose-50 text-rose-800 font-mono text-xs flex justify-between items-center shadow-hard-xs">
                  <span>{audioError}</span>
                  <button onClick={() => setAudioError(null)} className="font-bold text-rose-700 ml-4">✕</button>
                </div>
              )}

              {/* Text Input Workspace */}
              <div className="p-6 md:p-8 flex-1 flex flex-col min-h-[220px]">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <label className="font-mono text-xs uppercase tracking-wider font-bold text-zinc-700">
                    Spoken Script / Introduction
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-zinc-400">
                      {text.length} characters
                    </span>
                    <button
                      onClick={handleSaveMonologueToCloud}
                      disabled={isSaving || !text.trim()}
                      className={`text-xs font-mono font-bold uppercase px-2.5 py-1 border border-[#1A1A1A] flex items-center gap-1.5 shadow-hard-xs transition-colors ${
                        monologueJustSaved ? 'bg-emerald-400 text-emerald-950' : 'bg-white hover:bg-zinc-100 text-[#1A1A1A]'
                      }`}
                      title="Save this script to Firebase Firestore"
                    >
                      {monologueJustSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5 text-sky-600" />}
                      {isSaving ? 'Saving...' : monologueJustSaved ? 'Saved to Cloud!' : 'Save Script to Cloud'}
                    </button>
                  </div>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setGeneratedAudio(null);
                  }}
                  className="w-full flex-1 min-h-[180px] p-4 border-4 border-[#1A1A1A] font-mono text-sm leading-relaxed bg-white focus:outline-none focus:ring-4 focus:ring-amber-400 shadow-hard-xs resize-none"
                  placeholder="Type or paste your meeting intro or speech here..."
                />
              </div>

              {/* Audio Controls & Playback Dock */}
              <div className="border-t-4 border-[#1A1A1A] bg-white p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-hard">
                
                {/* Big Bauhaus Play / Generate Button */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleMainActionClick}
                    disabled={isGenerating || !text.trim()}
                    className={`w-20 h-20 rounded-full border-4 border-[#1A1A1A] flex items-center justify-center transition-transform active:scale-95 shadow-hard hover:-translate-y-0.5 ${isGenerating ? 'bg-amber-400 animate-spin' : isPlaying ? 'bg-rose-600 text-white' : 'bg-sky-500 text-white'}`}
                    aria-label={isPlaying ? 'Pause' : 'Generate and Play'}
                  >
                    {isGenerating ? (
                      <div className="w-8 h-8 border-4 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-8 h-8 fill-current" />
                    ) : (
                      <Play className="w-8 h-8 fill-current ml-1" />
                    )}
                  </button>

                  <div>
                    <div className="font-mono text-xs uppercase font-bold text-zinc-500">
                      {isGenerating ? 'Generating Audio...' : isPlaying ? 'Playing Audio' : generatedAudio ? 'Audio Generated' : 'Ready to Speak'}
                    </div>
                    <div className="text-lg font-black uppercase text-[#1A1A1A]">
                      {isGenerating ? 'Synthesizing Voice' : isPlaying ? 'On Air' : generatedAudio ? 'Click to Replay' : 'Click to Generate'}
                    </div>
                    {audioDuration > 0 && (
                      <span className="text-xs font-mono text-zinc-500">
                        Duration: {audioDuration.toFixed(1)}s
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Wave Visualizer & Actions */}
                <div className="flex-1 w-full sm:w-auto flex flex-col gap-2 max-w-md">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                    <span>Waveform & Progress</span>
                    <span>{(audioProgress * 100).toFixed(0)}%</span>
                  </div>
                  {/* Visualizer bars */}
                  <div className="h-6 bg-[#F4F4F0] border-2 border-[#1A1A1A] p-1 flex items-end gap-1">
                    {[12, 24, 18, 30, 20, 15, 28, 22, 16, 26, 14, 20, 25, 18, 22, 30, 15, 20, 28].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${Math.min(100, Math.max(15, h * (isPlaying ? 1.2 : 0.6)))}%` }}
                        className={`flex-1 transition-all ${audioProgress > (i / 19) ? 'bg-rose-600' : 'bg-zinc-300'}`}
                      />
                    ))}
                  </div>

                  {/* Audio Actions: Regenerate & Download WAV */}
                  <div className="flex gap-2 justify-end mt-1">
                    {generatedAudio && (
                      <button
                        onClick={handleGenerateSpeech}
                        disabled={isGenerating}
                        className="border-2 border-[#1A1A1A] bg-[#F4F4F0] hover:bg-zinc-200 px-3 py-1 text-xs font-mono font-bold uppercase flex items-center gap-1 shadow-hard-xs"
                        title="Regenerate speech"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Regenerate
                      </button>
                    )}

                    <BauhausButton
                      onClick={handleDownload}
                      disabled={!generatedAudio}
                      variant="primary"
                      className="px-4 py-1 text-xs font-mono font-bold uppercase tracking-wider"
                    >
                      <span className="flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5" /> Download WAV
                      </span>
                    </BauhausButton>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* MODE 2: MULTI-SPEAKER SCENE STUDIO (The New Multi-Speaker Engine) */}
        {activeMode === 'multispeaker' && (
          <MultiSpeakerStudio 
            onBgmOverlay={(buf) => setBgmBuffer(buf)} 
            loadedProject={loadedMultiSpeakerProject}
            onOpenCloudModal={() => setIsCloudModalOpen(true)}
          />
        )}

        {/* MODE 3: AUDIO SUITE & CLONING */}
        {activeMode === 'suite' && (
          <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-8 bg-[#F4F4F0]">
            <div className="border-4 border-[#1A1A1A] bg-white p-6 shadow-hard">
              <h1 className="text-3xl font-black uppercase text-[#1A1A1A] mb-2">
                Audio Production Suite
              </h1>
              <p className="text-sm font-mono text-zinc-600">
                Generate background music tracks, synthesize custom voice clones, and manage studio assets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* BGM Generator */}
              <div className="border-4 border-[#1A1A1A] bg-white p-6 shadow-hard space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-[#1A1A1A] pb-3">
                  <Music className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-black uppercase text-[#1A1A1A]">
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
              <div className="border-4 border-[#1A1A1A] bg-white p-6 shadow-hard space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-[#1A1A1A] pb-3">
                  <Mic className="w-5 h-5 text-rose-600" />
                  <h2 className="text-lg font-black uppercase text-[#1A1A1A]">
                    Instant Voice Cloning Studio
                  </h2>
                </div>
                <p className="text-xs font-mono text-zinc-600">
                  Clone your own voice by recording a 30-second audio snippet or uploading an audio file. Cloned voices can be assigned to characters in the Multi-Speaker studio.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setIsCloningOpen(true)}
                    className="w-full border-4 border-[#1A1A1A] bg-rose-600 hover:bg-rose-500 text-white p-4 font-mono font-bold uppercase tracking-wider text-sm shadow-hard transition-transform active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-3"
                  >
                    <Mic className="w-5 h-5" /> Launch Voice Cloning Wizard
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

    </div>
  );
};

export default App;
