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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900">
                  Firebase Cloud Projects Vault
                </h2>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full border ${
                  isOnline 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {isOnline ? 'Firestore Live' : 'Offline'}
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-500">
                Persistent storage powered by Google Cloud Firestore
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Account / Auth Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-zinc-100 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <UserIcon className="w-3.5 h-3.5 text-zinc-600" />
            {authLoading ? (
              <span className="text-zinc-500 animate-pulse">Connecting to Firebase Auth...</span>
            ) : user ? (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-900">
                  {user.displayName || user.email || (user.isAnonymous ? 'Guest Creator' : 'Authenticated User')}
                </span>
                {user.isAnonymous && (
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-200">
                    Anonymous
                  </span>
                )}
              </div>
            ) : (
              <span className="text-zinc-600">Not signed in (Local state only)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={logout}
                className="px-2.5 py-1 rounded bg-white hover:bg-zinc-200 border border-zinc-300 text-zinc-800 flex items-center gap-1 font-mono text-[11px] font-bold transition-colors"
              >
                <LogOut className="w-3 h-3 text-zinc-600" />
                Sign Out
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={loginGuest}
                  className="px-2.5 py-1 rounded bg-white hover:bg-zinc-200 border border-zinc-300 text-zinc-800 font-mono text-[11px] font-bold transition-colors"
                >
                  Guest Mode
                </button>
                <button
                  onClick={loginGoogle}
                  className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 border border-amber-500 text-zinc-950 flex items-center gap-1 font-mono text-[11px] font-bold shadow-xs transition-colors"
                >
                  <LogIn className="w-3 h-3 text-zinc-950" />
                  Sign In with Google
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-200 bg-white px-4 sm:px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('scenes')}
            className={`pb-2.5 px-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'scenes'
                ? 'border-rose-600 text-rose-600'
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
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Intro & Monologues ({savedMonologues.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto bg-zinc-50/50">
          {activeTab === 'scenes' ? (
            <div className="space-y-2.5">
              {savedProjects.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-xl bg-white p-6">
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="font-mono font-bold text-sm text-zinc-800 uppercase tracking-wide">
                    No Saved Multi-Speaker Scenes Yet
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono mt-1 max-w-sm mx-auto">
                    Generate or edit a multi-speaker script in the Multi-Speaker Studio, then click "Save to Firebase" to store it permanently in the cloud.
                  </p>
                </div>
              ) : (
                savedProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => { onLoadProject(proj); onClose(); }}
                    className="p-3.5 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs">
                        {proj.lines?.length || 0}L
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-zinc-900 truncate group-hover:text-rose-600 transition-colors">
                          {proj.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 mt-0.5">
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
                        className="p-1.5 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { onLoadProject(proj); onClose(); }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 group-hover:bg-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
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
                <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-xl bg-white p-6">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                    <Radio className="w-6 h-6" />
                  </div>
                  <h3 className="font-mono font-bold text-sm text-zinc-800 uppercase tracking-wide">
                    No Saved Monologues Yet
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono mt-1 max-w-sm mx-auto">
                    Compose a monologue or meeting introduction, then click "Save" in the top action bar to store it in the cloud.
                  </p>
                </div>
              ) : (
                savedMonologues.map((mono) => (
                  <div
                    key={mono.id}
                    onClick={() => { onLoadMonologue(mono); onClose(); }}
                    className="p-3.5 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs">
                        🎙️
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-zinc-900 truncate group-hover:text-amber-600 transition-colors">
                          {mono.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 mt-0.5">
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
                        className="p-1.5 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete monologue"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { onLoadMonologue(mono); onClose(); }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 group-hover:bg-amber-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
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
        <div className="p-3.5 sm:px-6 bg-white border-t border-zinc-200 flex items-center justify-between text-xs font-mono text-zinc-500 flex-shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <Database className="w-3.5 h-3.5 text-zinc-400" />
            <span className="truncate">Project: ai-studio-socialnot-845fd311</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-800 font-bold uppercase transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
