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
  ExternalLink
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#F4F4F0] border-4 border-[#1A1A1A] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-hard animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 md:p-6 bg-white border-b-4 border-[#1A1A1A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500 border-2 border-[#1A1A1A] flex items-center justify-center text-white shadow-hard-xs">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-black uppercase text-[#1A1A1A] tracking-tight">
                  Firebase Cloud Projects
                </h2>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-[#1A1A1A] ${isOnline ? 'bg-emerald-400 text-emerald-950' : 'bg-rose-400 text-rose-950'}`}>
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
            className="p-1.5 border-2 border-[#1A1A1A] bg-white hover:bg-zinc-200 text-[#1A1A1A] transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account / Auth Bar */}
        <div className="px-6 py-3 bg-[#EAEAE2] border-b-2 border-[#1A1A1A] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-zinc-700" />
            {authLoading ? (
              <span className="text-zinc-500 animate-pulse">Connecting to Firebase Auth...</span>
            ) : user ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1A1A1A]">
                  {user.displayName || user.email || (user.isAnonymous ? 'Guest Creator' : 'Authenticated User')}
                </span>
                {user.isAnonymous && (
                  <span className="bg-amber-300 text-amber-950 text-[10px] px-1.5 py-0.5 border border-[#1A1A1A] font-bold">
                    Guest Mode
                  </span>
                )}
              </div>
            ) : (
              <span className="text-zinc-600">Not signed in (Local state only)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <button
                  onClick={loginGuest}
                  className="px-3 py-1 bg-white border-2 border-[#1A1A1A] hover:bg-zinc-100 font-bold uppercase text-[11px] shadow-hard-xs"
                >
                  Guest Mode
                </button>
                <button
                  onClick={loginGoogle}
                  className="px-3 py-1 bg-amber-400 border-2 border-[#1A1A1A] hover:bg-amber-300 font-bold uppercase text-[11px] shadow-hard-xs flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In with Google
                </button>
              </>
            ) : (
              <>
                {user.isAnonymous && (
                  <button
                    onClick={loginGoogle}
                    className="px-3 py-1 bg-amber-400 border-2 border-[#1A1A1A] hover:bg-amber-300 font-bold uppercase text-[11px] shadow-hard-xs flex items-center gap-1"
                  >
                    Link Google Account
                  </button>
                )}
                <button
                  onClick={logout}
                  className="px-2.5 py-1 bg-white border-2 border-[#1A1A1A] hover:bg-rose-100 text-rose-700 font-bold uppercase text-[11px] shadow-hard-xs flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b-2 border-[#1A1A1A] bg-white px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('scenes')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 border-[#1A1A1A] transition-colors ${
              activeTab === 'scenes'
                ? 'bg-rose-600 text-white -mb-[2px] pb-[10px]'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Multi-Speaker Scenes ({savedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('monologues')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 border-[#1A1A1A] transition-colors ${
              activeTab === 'monologues'
                ? 'bg-[#1A1A1A] text-white -mb-[2px] pb-[10px]'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Intro & Monologues ({savedMonologues.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar min-h-[260px]">
          {activeTab === 'scenes' && (
            <div>
              {savedProjects.length === 0 ? (
                <div className="border-2 border-dashed border-zinc-400 p-8 text-center bg-white space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="font-mono font-bold uppercase text-sm text-[#1A1A1A]">
                    No Saved Multi-Speaker Scenes Yet
                  </h3>
                  <p className="text-xs font-mono text-zinc-500 max-w-md mx-auto">
                    Generate or analyze a multi-speaker script in the Multi-Speaker Studio, then click "Save to Firebase" to store it permanently in the cloud.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedProjects.map((p) => (
                    <div
                      key={p.id}
                      className="border-2 border-[#1A1A1A] bg-white p-4 shadow-hard-xs hover:border-rose-600 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono uppercase bg-zinc-200 px-1.5 py-0.5 font-bold">
                            {p.format || 'Dialogue'}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {new Date(p.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#1A1A1A] uppercase tracking-tight line-clamp-1">
                          {p.title}
                        </h4>
                        <p className="text-xs font-mono text-zinc-500 mt-1 line-clamp-2">
                          {p.summary || `${p.lines?.length || 0} lines across ${p.speakers?.length || 0} speakers.`}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-1">
                          {p.speakers?.slice(0, 4).map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono bg-zinc-100 border border-zinc-300 px-1.5 py-0.2 rounded-xs"
                            >
                              {s.name} ({s.voice})
                            </span>
                          ))}
                          {p.speakers && p.speakers.length > 4 && (
                            <span className="text-[10px] font-mono text-zinc-400">+{p.speakers.length - 4}</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between">
                        <button
                          onClick={() => {
                            onLoadProject(p);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 border border-[#1A1A1A] shadow-hard-xs"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          Open Project
                        </button>
                        <button
                          onClick={(e) => handleDeleteProject(p.id, e)}
                          disabled={deletingId === p.id}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-300 transition-colors"
                          title="Delete from Firebase"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'monologues' && (
            <div>
              {savedMonologues.length === 0 ? (
                <div className="border-2 border-dashed border-zinc-400 p-8 text-center bg-white space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <Radio className="w-6 h-6" />
                  </div>
                  <h3 className="font-mono font-bold uppercase text-sm text-[#1A1A1A]">
                    No Saved Monologues Yet
                  </h3>
                  <p className="text-xs font-mono text-zinc-500 max-w-md mx-auto">
                    Customize your intro script or monologue in the Intro Studio, then click "Save Script to Firebase".
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedMonologues.map((m) => (
                    <div
                      key={m.id}
                      className="border-2 border-[#1A1A1A] bg-white p-4 shadow-hard-xs hover:border-amber-500 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 font-bold">
                            Voice: {m.voice || 'Gemini'}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {new Date(m.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#1A1A1A] uppercase tracking-tight line-clamp-1">
                          {m.title}
                        </h4>
                        <p className="text-xs font-mono text-zinc-600 mt-1 line-clamp-3 bg-zinc-50 p-2 border border-zinc-200 italic">
                          "{m.text}"
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between">
                        <button
                          onClick={() => {
                            onLoadMonologue(m);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 border border-[#1A1A1A] shadow-hard-xs"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          Load Script
                        </button>
                        <button
                          onClick={(e) => handleDeleteMonologue(m.id, e)}
                          disabled={deletingId === m.id}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-300 transition-colors"
                          title="Delete from Firebase"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-white border-t-2 border-[#1A1A1A] flex items-center justify-between text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Project ID: <code className="bg-zinc-100 px-1 py-0.5 border border-zinc-300 font-bold text-zinc-800">gen-lang-client-0637573997</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-[#1A1A1A] font-bold uppercase border border-[#1A1A1A]"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
