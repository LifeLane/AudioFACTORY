import React, { useState } from 'react';
import { 
  Cloud, 
  Trash2, 
  FolderOpen, 
  Clock, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Layers,
  Radio,
  ExternalLink,
  Database
} from 'lucide-react';
import { useFirebase } from '../services/firebaseContext';
import { SavedAudioProject, SavedMonologue } from '../types';
import { useTerminal } from './terminal/TerminalContext';

interface FirebaseProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProject: (project: SavedAudioProject) => void;
  onLoadMonologue: (monologue: SavedMonologue) => void;
}

export const FirebaseProjectsModal: React.FC<FirebaseProjectsModalProps> = ({
  isOpen,
  onClose,
  onLoadProject,
  onLoadMonologue,
}) => {
  const { isTerminalMode } = useTerminal();
  const { 
    user, 
    authLoading, 
    isOnline, 
    loginGoogle, 
    loginGuest, 
    logout, 
    savedProjects, 
    savedMonologues, 
    removeProjectFromCloud, 
    removeMonologueFromCloud 
  } = useFirebase();

  const [activeTab, setActiveTab] = useState<'scenes' | 'monologues'>('scenes');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this scene from Firebase?")) {
      setDeletingId(id);
      try {
        await removeProjectFromCloud(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleDeleteMonologue = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this monologue from Firebase?")) {
      setDeletingId(id);
      try {
        await removeMonologueFromCloud(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className={`w-full max-w-2xl max-h-[88vh] flex flex-col rounded-xl shadow-2xl overflow-hidden border transition-all ${
        isTerminalMode 
          ? 'bg-[#161B22] border-[#30363D] text-[#E6EDF3]' 
          : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between flex-shrink-0 ${
          isTerminalMode 
            ? 'bg-[#0D1117] border-[#30363D]' 
            : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-xs ${
              isTerminalMode 
                ? 'bg-[#161B22] border border-[#4285F4]/40 text-[#4285F4]' 
                : 'bg-sky-600 text-white'
            }`}>
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base sm:text-lg font-bold ${
                  isTerminalMode ? 'font-mono text-[#E6EDF3]' : 'text-zinc-900'
                }`}>
                  {isTerminalMode ? 'FIREBASE_CLOUD_VAULT' : 'Firebase Cloud Projects Vault'}
                </h2>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full border ${
                  isOnline 
                    ? isTerminalMode 
                      ? 'bg-[#34A853]/15 text-[#34A853] border-[#34A853]/40'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#34A853]' : 'bg-rose-500'}`} />
                  {isOnline ? 'Firestore Live' : 'Offline'}
                </span>
              </div>
              <p className={`text-xs font-mono ${isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-500'}`}>
                Persistent storage powered by Google Cloud Firestore
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
              isTerminalMode 
                ? 'border-[#30363D] bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]' 
                : 'border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Account / Auth Bar */}
        <div className={`px-4 sm:px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${
          isTerminalMode 
            ? 'bg-[#0D1117]/80 border-[#30363D] text-[#8B949E]' 
            : 'bg-zinc-100 border-zinc-200 text-zinc-700'
        }`}>
          <div className="flex items-center gap-2">
            <UserIcon className="w-3.5 h-3.5 text-[#4285F4]" />
            {authLoading ? (
              <span className="text-[#8B949E] animate-pulse">Connecting to Firebase Auth...</span>
            ) : user ? (
              <div className="flex items-center gap-1.5">
                <span className={`font-bold ${isTerminalMode ? 'text-[#E6EDF3]' : 'text-zinc-900'}`}>
                  {user.displayName || user.email || (user.isAnonymous ? 'Guest Creator' : 'Authenticated User')}
                </span>
                {user.isAnonymous && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded border ${
                    isTerminalMode 
                      ? 'bg-[#FBBC04]/20 text-[#FBBC04] border-[#FBBC04]/30'
                      : 'bg-amber-100 text-amber-900 border-amber-200'
                  }`}>
                    Anonymous
                  </span>
                )}
              </div>
            ) : (
              <span className={isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-600'}>
                Not signed in (Local state only)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user && !user.isAnonymous ? (
              <button
                onClick={logout}
                className={`px-2.5 py-1 rounded border flex items-center gap-1 font-mono text-[11px] font-bold transition-colors ${
                  isTerminalMode 
                    ? 'bg-[#21262D] hover:bg-[#30363D] border-[#30363D] text-[#E6EDF3]' 
                    : 'bg-white hover:bg-zinc-200 border-zinc-300 text-zinc-800'
                }`}
              >
                <LogOut className="w-3 h-3 text-[#EA4335]" />
                Sign Out
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {user?.isAnonymous && (
                  <button
                    onClick={logout}
                    className={`px-2.5 py-1 rounded border flex items-center gap-1 font-mono text-[11px] font-bold transition-colors ${
                      isTerminalMode 
                        ? 'bg-[#21262D] hover:bg-[#30363D] border-[#30363D] text-[#E6EDF3]' 
                        : 'bg-white hover:bg-zinc-200 border-zinc-300 text-zinc-800'
                    }`}
                    title="Reset guest session to start fresh"
                  >
                    Reset Guest
                  </button>
                )}
                <button
                  onClick={loginGoogle}
                  className={`px-2.5 py-1 rounded border flex items-center gap-1 font-mono text-[11px] font-bold shadow-xs transition-colors ${
                    isTerminalMode 
                      ? 'bg-[#FBBC04] hover:bg-[#F29900] border-[#FBBC04] text-black font-bold' 
                      : 'bg-amber-400 hover:bg-amber-300 border-amber-500 text-zinc-950'
                  }`}
                >
                  <LogIn className="w-3 h-3 text-zinc-950" />
                  Sign In with Google
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className={`flex border-b px-4 sm:px-6 pt-3 gap-2 ${
          isTerminalMode 
            ? 'bg-[#0D1117] border-[#30363D]' 
            : 'bg-white border-zinc-200'
        }`}>
          <button
            onClick={() => setActiveTab('scenes')}
            className={`pb-2.5 px-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'scenes'
                ? isTerminalMode 
                  ? 'border-[#EA4335] text-[#EA4335]' 
                  : 'border-rose-600 text-rose-600'
                : isTerminalMode 
                  ? 'border-transparent text-[#8B949E] hover:text-[#E6EDF3]' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Multi-Speaker Scenes ({savedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('monologues')}
            className={`pb-2.5 px-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'monologues'
                ? isTerminalMode 
                  ? 'border-[#FBBC04] text-[#FBBC04]' 
                  : 'border-amber-500 text-amber-600'
                : isTerminalMode 
                  ? 'border-transparent text-[#8B949E] hover:text-[#E6EDF3]' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Intro & Monologues ({savedMonologues.length})
          </button>
        </div>

        {/* Content Area */}
        <div className={`p-4 sm:p-6 flex-1 overflow-y-auto custom-scrollbar ${
          isTerminalMode ? 'bg-[#090D12]' : 'bg-zinc-50/50'
        }`}>
          {activeTab === 'scenes' ? (
            <div className="space-y-2.5">
              {savedProjects.length === 0 ? (
                <div className={`text-center py-12 border-2 border-dashed rounded-xl p-6 ${
                  isTerminalMode 
                    ? 'border-[#30363D] bg-[#0D1117]' 
                    : 'border-zinc-200 bg-white'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    isTerminalMode ? 'bg-[#EA4335]/20 text-[#EA4335]' : 'bg-rose-50 text-rose-600'
                  }`}>
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className={`font-mono font-bold text-sm uppercase tracking-wide ${
                    isTerminalMode ? 'text-[#E6EDF3]' : 'text-zinc-800'
                  }`}>
                    No Saved Multi-Speaker Scenes Yet
                  </h3>
                  <p className={`text-xs font-mono mt-1 max-w-sm mx-auto ${
                    isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-500'
                  }`}>
                    Generate or edit a multi-speaker script in the Multi-Speaker Studio, then click "Save to Firebase" to store it permanently in the cloud.
                  </p>
                </div>
              ) : (
                savedProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => { onLoadProject(proj); onClose(); }}
                    className={`p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all border group ${
                      isTerminalMode 
                        ? 'bg-[#161B22] hover:bg-[#21262D] border-[#30363D] hover:border-[#EA4335]' 
                        : 'bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs ${
                        isTerminalMode 
                          ? 'bg-[#EA4335]/20 text-[#EA4335] border border-[#EA4335]/40' 
                          : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {proj.lines?.length || 0}L
                      </div>
                      <div className="min-w-0">
                        <div className={`font-bold text-sm truncate transition-colors ${
                          isTerminalMode 
                            ? 'text-[#E6EDF3] group-hover:text-[#EA4335]' 
                            : 'text-zinc-900 group-hover:text-rose-600'
                        }`}>
                          {proj.title}
                        </div>
                        <div className={`flex items-center gap-2 text-[11px] font-mono mt-0.5 ${
                          isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-500'
                        }`}>
                          <span>{proj.speakers?.length || 0} actors</span>
                          <span>•</span>
                          <span>{proj.updatedAt ? new Date(proj.updatedAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => handleDeleteProject(proj.id, e)}
                        disabled={deletingId === proj.id}
                        className={`p-1.5 rounded transition-colors ${
                          isTerminalMode 
                            ? 'text-[#8B949E] hover:text-[#EA4335] hover:bg-[#EA4335]/10' 
                            : 'text-zinc-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { onLoadProject(proj); onClose(); }}
                        className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs ${
                          isTerminalMode 
                            ? 'bg-[#4285F4] group-hover:bg-[#EA4335] text-white' 
                            : 'bg-zinc-900 group-hover:bg-rose-600 text-white'
                        }`}
                      >
                        Load
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {savedMonologues.length === 0 ? (
                <div className={`text-center py-12 border-2 border-dashed rounded-xl p-6 ${
                  isTerminalMode 
                    ? 'border-[#30363D] bg-[#0D1117]' 
                    : 'border-zinc-200 bg-white'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    isTerminalMode ? 'bg-[#FBBC04]/20 text-[#FBBC04]' : 'bg-amber-50 text-amber-600'
                  }`}>
                    <Radio className="w-6 h-6" />
                  </div>
                  <h3 className={`font-mono font-bold text-sm uppercase tracking-wide ${
                    isTerminalMode ? 'text-[#E6EDF3]' : 'text-zinc-800'
                  }`}>
                    No Saved Monologues Yet
                  </h3>
                  <p className={`text-xs font-mono mt-1 max-w-sm mx-auto ${
                    isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-500'
                  }`}>
                    Compose a monologue or meeting introduction, then click "Save" in the top action bar to store it in the cloud.
                  </p>
                </div>
              ) : (
                savedMonologues.map((mono) => (
                  <div
                    key={mono.id}
                    onClick={() => { onLoadMonologue(mono); onClose(); }}
                    className={`p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all border group ${
                      isTerminalMode 
                        ? 'bg-[#161B22] hover:bg-[#21262D] border-[#30363D] hover:border-[#FBBC04]' 
                        : 'bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs ${
                        isTerminalMode 
                          ? 'bg-[#FBBC04]/20 text-[#FBBC04] border border-[#FBBC04]/40' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        🎙️
                      </div>
                      <div className="min-w-0">
                        <div className={`font-bold text-sm truncate transition-colors ${
                          isTerminalMode 
                            ? 'text-[#E6EDF3] group-hover:text-[#FBBC04]' 
                            : 'text-zinc-900 group-hover:text-amber-600'
                        }`}>
                          {mono.title}
                        </div>
                        <div className={`flex items-center gap-2 text-[11px] font-mono mt-0.5 ${
                          isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-500'
                        }`}>
                          <span>{mono.voice}</span>
                          <span>•</span>
                          <span>{mono.text?.length || 0} chars</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => handleDeleteMonologue(mono.id, e)}
                        disabled={deletingId === mono.id}
                        className={`p-1.5 rounded transition-colors ${
                          isTerminalMode 
                            ? 'text-[#8B949E] hover:text-[#EA4335] hover:bg-[#EA4335]/10' 
                            : 'text-zinc-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="Delete monologue"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { onLoadMonologue(mono); onClose(); }}
                        className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs ${
                          isTerminalMode 
                            ? 'bg-[#4285F4] group-hover:bg-[#FBBC04] text-white group-hover:text-black' 
                            : 'bg-zinc-900 group-hover:bg-amber-500 text-white'
                        }`}
                      >
                        Load
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-3.5 sm:px-6 border-t flex items-center justify-between text-xs font-mono flex-shrink-0 ${
          isTerminalMode 
            ? 'bg-[#0D1117] border-[#30363D] text-[#8B949E]' 
            : 'bg-white border-zinc-200 text-zinc-500'
        }`}>
          <div className="flex items-center gap-1.5 truncate">
            <Database className="w-3.5 h-3.5 text-[#4285F4]" />
            <span className="truncate">Project: ai-studio-socialnot-845fd311</span>
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg border font-bold uppercase transition-colors ${
              isTerminalMode 
                ? 'border-[#30363D] bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3]' 
                : 'border-zinc-200 hover:bg-zinc-100 text-zinc-800'
            }`}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
