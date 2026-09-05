/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Studio Application Shell
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { INTRO_STYLES, CUSTOM_STYLE, SUPPORTED_LANGUAGES } from '../../constants';
import { IntroStyle, Voice, SavedAudioProject } from '../../types';
import { ALL_VOICES } from '../../voices';
import { generateSpeech, dramatizeText, audioBufferToWavBlob } from '../../services/geminiService';
import { 
  getElevenLabsVoices, 
  generateSpeechElevenLabs, 
  isElevenLabsKeyAvailable, 
  DEFAULT_ELEVENLABS_VOICES 
} from '../../services/elevenLabsService';
import { StyleSelector } from '../../components/StyleSelector';
import { ConfigurationModal } from '../../components/ConfigurationModal';
import { SystemPromptModal } from '../../components/SystemPromptModal';
import { MultiSpeakerStudio } from '../../components/MultiSpeakerStudio';
import { BgmGenerator } from '../../components/BgmGenerator';
import { VoiceCloningModal } from '../../components/VoiceCloningModal';
import { FirebaseProjectsModal } from '../../components/FirebaseProjectsModal';
import { MonologueBentoStudio } from '../../components/MonologueBentoStudio';
import { AudioProductionSuite } from '../../components/AudioProductionSuite';
import { useTerminal } from '../../components/terminal/TerminalContext';
import { TerminalBackgroundCanvas } from '../../components/terminal/TerminalBackgroundCanvas';
import { TerminalHeader } from '../../components/terminal/TerminalHeader';
import { TerminalMonologueView } from '../../components/terminal/TerminalMonologueView';
import { TerminalDiagnosticDrawer } from '../../components/terminal/TerminalDiagnosticDrawer';
import { PlanUpgradeModal } from '../../components/PlanUpgradeModal';
import { GenerationQuotaBadge } from '../../components/GenerationQuotaBadge';
import { AccountDrawer } from '../../components/AccountDrawer';
import { DailyQuotaExhaustedModal } from '../../components/DailyQuotaExhaustedModal';
import { useGenerationQuota } from '../hooks/useGenerationQuota';
import { useEntitlementStore } from '../store/useEntitlementStore';
import { useDeepLinks } from '../hooks';
import { BauhausButton, getIcon, getColorClass, DownloadIcon } from '../../components/BauhausComponents';
import { useFirebase } from '../../services/firebaseContext';
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
  X,
  Monitor,
  User,
  ExternalLink
} from 'lucide-react';

type StudioMode = 'intro' | 'multispeaker' | 'suite';

export const StudioApp: React.FC = () => {
  const location = useLocation();

  // Terminal System Context
  const { isTerminalMode, toggleTerminalMode, setIsAudioActive, addLog } = useTerminal();

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

  // Entitlement store & quota
  const { refreshEntitlement, setUpgradeModalOpen } = useEntitlementStore();
  const { isExhausted, isUnlimited } = useGenerationQuota();

  // Modal States
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isPromptOpen, setIsPromptOpen] = useState<boolean>(false);
  const [isCloningOpen, setIsCloningOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [isQuotaExhaustedModalOpen, setIsQuotaExhaustedModalOpen] = useState<boolean>(false);

  // Deep Link & Native Android Lifecycle Handler
  useDeepLinks({
    onOpenProjects: () => setIsCloudModalOpen(true),
    onOpenCloning: () => setIsCloningOpen(true),
    onSetMode: (m) => {
      stopPlayback();
      setActiveMode(m);
    },
  });

  // Handle URL route params (e.g. /app/projects, /app/billing, /app/account)
  useEffect(() => {
    if (location.pathname.includes('/projects')) {
      setIsCloudModalOpen(true);
    } else if (location.pathname.includes('/billing')) {
      setUpgradeModalOpen(true);
    } else if (location.pathname.includes('/account')) {
      setIsAccountOpen(true);
    }
  }, [location.pathname]);

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

  // Available Voices: Combine Gemini and ElevenLabs
  const [elevenLabsVoicesList, setElevenLabsVoicesList] = useState<Voice[]>(DEFAULT_ELEVENLABS_VOICES);
  const hasElevenLabsKey = isElevenLabsKeyAvailable();

  useEffect(() => {
    refreshEntitlement(user);
    getElevenLabsVoices().then(v => {
      if (v && v.length > 0) setElevenLabsVoicesList(v);
    });
  }, [user]);

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

    // Check quota before initiating generation
    if (!isUnlimited && isExhausted) {
      setIsQuotaExhaustedModalOpen(true);
      return;
    }

    stopPlayback();
    setIsGenerating(true);
    setAudioError(null);

    const isEleven = elevenLabsVoicesList.some(v => v.id === selectedVoice);

    try {
      if (isEleven) {
        const result = await generateSpeechElevenLabs(text, selectedVoice);
        const rawData = new Uint8Array(result.rawData);
        setGeneratedAudio({ buffer: result.buffer, rawData });
        setAudioDuration(result.buffer.duration);
        playGeneratedAudio(result.buffer);
      } else {
        const result = await generateSpeech(text, selectedVoice, selectedStyle.description);
        setGeneratedAudio({ buffer: result.buffer, rawData: result.rawData });
        setAudioDuration(result.buffer.duration);
        playGeneratedAudio(result.buffer);
      }
    } catch (err: any) {
      console.error("Generation failed:", err);
      if (err.message && (err.message.includes('QUOTA_EXHAUSTED') || err.message.includes('daily generation limit'))) {
        setIsQuotaExhaustedModalOpen(true);
      } else {
        setAudioError(err.message || "Failed to generate audio.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const playGeneratedAudio = (buffer: AudioBuffer) => {
    stopPlayback();
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    source.onended = () => {
      stopPlayback();
    };

    source.start(0);
    sourceNodeRef.current = source;
    startTimeRef.current = ctx.currentTime;
    setIsPlaying(true);

    const updateProgress = () => {
      if (!audioContextRef.current || !sourceNodeRef.current) return;
      const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
      const progress = Math.min(100, (elapsed / buffer.duration) * 100);
      setAudioProgress(progress);
      if (progress < 100) {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };
    animFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const handleMainActionClick = () => {
    if (isPlaying) {
      stopPlayback();
    } else if (generatedAudio) {
      playGeneratedAudio(generatedAudio.buffer);
    } else {
      handleGenerateSpeech();
    }
  };

  const handleDownload = () => {
    if (!generatedAudio) return;
    const wavBlob = audioBufferToWavBlob(generatedAudio.buffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audiofactory-${selectedStyle.id}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-[#F4F4F0] text-[#1A1A1A] overflow-hidden select-none font-sans">
      
      {/* Top Universal Header & Responsive Navigation Module */}
      <header className="border-b border-zinc-200 bg-white flex-shrink-0 z-30 shadow-sm">
        
        {/* Tier 1: Brand & Utilities Bar */}
        <div className="h-12 md:h-14 px-3 md:px-6 flex items-center justify-between">
          
          {/* Brand & Home Navigation */}
          <div className="flex items-center gap-2.5">
            <Link 
              to="/"
              className="group flex items-center gap-2 p-1 -ml-1 rounded-lg hover:bg-zinc-100 transition-colors focus:outline-none"
              title="Return to AudioFACTORY Website"
            >
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-rose-600 shadow-xs group-hover:scale-105 transition-transform" />
                <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-xs bg-amber-400 shadow-xs group-hover:scale-105 transition-transform" />
                <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-xs bg-sky-500 shadow-xs group-hover:scale-105 transition-transform" />
              </div>
              <span className="font-extrabold text-sm md:text-lg tracking-tight uppercase text-zinc-950">
                AUDIO FACTORY
              </span>
            </Link>
            
            <Link
              to="/"
              className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono text-zinc-500 hover:text-amber-600 px-2 py-0.5 rounded border border-zinc-200 hover:border-amber-400 transition-colors"
            >
              <span>Website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

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
            
            {/* Unified Generation Quota Badge */}
            <GenerationQuotaBadge />

            {/* Account & Monetization Center Trigger */}
            <button
              onClick={() => setIsAccountOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 transition-colors"
              title="Account & Subscription"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[8px] font-bold">
                {user?.displayName ? user.displayName.slice(0, 1).toUpperCase() : <User className="w-2.5 h-2.5" />}
              </div>
              <span className="hidden sm:inline">Account</span>
            </button>

            {/* Firebase Cloud Projects Drawer Trigger */}
            <button
              onClick={() => setIsCloudModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 transition-colors"
            >
              <Cloud className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Projects</span>
            </button>

            {/* Voice Cloning Studio Trigger */}
            <button
              onClick={() => setIsCloningOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 transition-colors"
            >
              <Mic className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Clone Voice</span>
            </button>

            {/* Terminal Diagnostic Mode Toggle */}
            <button
              onClick={toggleTerminalMode}
              className={`p-1.5 rounded-md border transition-colors ${
                isTerminalMode 
                  ? 'bg-amber-400 text-black border-amber-500 shadow-xs' 
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
              }`}
              title="Toggle Terminal Diagnostic Mode"
            >
              <Monitor className="w-4 h-4" />
            </button>

            {/* Studio Settings */}
            <button
              onClick={() => setIsConfigOpen(true)}
              className="p-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors"
              title="Voice Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tier 2: Mobile Mode Segment Bar (< md) */}
        <div className="md:hidden flex items-center justify-around border-t border-zinc-200 bg-zinc-50 py-1.5 px-2">
          <button
            onClick={() => { stopPlayback(); setActiveMode('intro'); }}
            className={`flex-1 py-1 text-center text-xs font-mono font-bold rounded ${
              activeMode === 'intro' ? 'bg-zinc-900 text-white' : 'text-zinc-600'
            }`}
          >
            Monologue
          </button>
          <button
            onClick={() => { stopPlayback(); setActiveMode('multispeaker'); }}
            className={`flex-1 py-1 text-center text-xs font-mono font-bold rounded ${
              activeMode === 'multispeaker' ? 'bg-rose-600 text-white' : 'text-zinc-600'
            }`}
          >
            Multi-Speaker
          </button>
          <button
            onClick={() => { stopPlayback(); setActiveMode('suite'); }}
            className={`flex-1 py-1 text-center text-xs font-mono font-bold rounded ${
              activeMode === 'suite' ? 'bg-amber-400 text-black' : 'text-zinc-600'
            }`}
          >
            BGM & Tools
          </button>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeMode === 'intro' && (
          <div className="flex-1 flex h-full overflow-hidden">
            {/* Desktop Left Sidebar: Personas & Presets */}
            <div className={`hidden md:block w-72 border-r border-zinc-200 bg-white h-full overflow-y-auto custom-scrollbar flex-shrink-0 transition-all ${
              isMonologueSidebarOpen ? '' : '-ml-72'
            }`}>
              <StyleSelector 
                selectedStyle={selectedStyle}
                onSelect={(style) => handleSelectStyle(style)}
                onCustomize={handleSelectCustom}
              />
            </div>

            {/* Center Monologue Canvas */}
            <div className="flex-1 flex flex-col h-full bg-[#F4F4F0] overflow-hidden">
              <MonologueBentoStudio 
                text={text}
                onTextChange={setText}
                selectedStyle={selectedStyle}
                selectedVoice={selectedVoice}
                onOpenPersonaSelect={() => setIsMobilePersonaDrawerOpen(true)}
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
                onSaveToCloud={async () => {
                  if (saveMonologueToCloud) {
                    await saveMonologueToCloud({ 
                      title: text.slice(0, 30) || 'Untitled Monologue', 
                      text, 
                      voice: selectedVoice, 
                      styleId: selectedStyle.id 
                    });
                    setMonologueJustSaved(true);
                    setTimeout(() => setMonologueJustSaved(false), 3000);
                  }
                }}
                isSaving={isSaving}
                justSaved={monologueJustSaved}
                onDownloadWav={handleDownload}
              />
            </div>
          </div>
        )}

        {activeMode === 'multispeaker' && (
          <div className="flex-1 flex flex-col h-full bg-[#F4F4F0] overflow-hidden">
            <MultiSpeakerStudio 
              onBgmOverlay={(buf) => setBgmBuffer(buf)} 
              loadedProject={loadedMultiSpeakerProject}
              onOpenCloudModal={() => setIsCloudModalOpen(true)}
            />
          </div>
        )}

        {activeMode === 'suite' && (
          <div className="flex-1 flex flex-col h-full bg-[#F4F4F0] overflow-hidden">
            <AudioProductionSuite
              onBgmBufferGenerated={(buf: AudioBuffer) => setBgmBuffer(buf)}
              activeBgmBuffer={bgmBuffer}
              onOpenVoiceCloning={() => setIsCloningOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Modals */}
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

      <SystemPromptModal 
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        prompt={selectedStyle.description}
        isEditable={selectedStyle.id === 'custom'}
        onSave={handleSaveCustom}
        currentVoice={selectedVoice}
        voices={allAvailableVoices}
      />

      <VoiceCloningModal 
        isOpen={isCloningOpen}
        onClose={() => setIsCloningOpen(false)}
        onSuccess={() => {
          getElevenLabsVoices().then(v => {
            if (v && v.length > 0) setElevenLabsVoicesList(v);
          });
        }}
      />

      <PlanUpgradeModal />

      {/* AudioFACTORY Account & Monetization Center Drawer */}
      <AccountDrawer 
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenPricing={() => {
          setIsAccountOpen(false);
          setUpgradeModalOpen(true);
        }}
      />

      {/* Polite Daily Quota Exhausted Modal */}
      <DailyQuotaExhaustedModal 
        isOpen={isQuotaExhaustedModalOpen}
        onClose={() => setIsQuotaExhaustedModalOpen(false)}
        onUpgrade={() => {
          setIsQuotaExhaustedModalOpen(false);
          setUpgradeModalOpen(true);
        }}
      />

      <FirebaseProjectsModal 
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        onLoadProject={(proj) => {
          setLoadedMultiSpeakerProject(proj);
          setActiveMode('multispeaker');
          setIsCloudModalOpen(false);
        }}
        onLoadMonologue={(mono) => {
          setText(mono.text);
          if (mono.voice) setSelectedVoice(mono.voice);
          setActiveMode('intro');
          setIsCloudModalOpen(false);
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
export default StudioApp;
