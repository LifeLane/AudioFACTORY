import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db, auth } from '../config/firebaseConfig';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, query, orderBy, getDocs, setDoc, doc } from 'firebase/firestore';
import { UserCircle, LogOut, Clock, Play, History, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Toast } from '../../components/Toast';

export const ProfileDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      setUser(u);
      if (u && !u.uid.startsWith('admin_user_')) {
        fetchHistory(u.uid);
      }
    });
    return unsubscribe;
  }, []);

  const fetchHistory = async (uid: string) => {
    setLoading(true);
    try {
      const projSnap = await getDocs(query(collection(db, `users/${uid}/projects`), orderBy('createdAt', 'desc')));
      const monoSnap = await getDocs(query(collection(db, `users/${uid}/monologues`), orderBy('createdAt', 'desc')));
      
      const projs = projSnap.docs.map(d => ({ id: d.id, type: 'project', ...d.data() }));
      const monos = monoSnap.docs.map(d => ({ id: d.id, type: 'monologue', ...d.data() }));
      
      const combined = [...projs, ...monos].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setHistory(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestEarlyAccess = async () => {
    if (!user) return;
    
    try {
      const requestId = `${user.uid}_pro`;
      await setDoc(doc(db, 'earlyAccessRequests', requestId), {
        userId: user.uid,
        email: user.email,
        planId: 'pro',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setToast({ message: 'Early access request submitted successfully! We will contact you soon.', type: 'success' });
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || 'Failed to submit request.', type: 'error' });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-zinc-200 p-8 rounded-2xl w-full max-w-md shadow-xl text-center"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Welcome Back</h1>
          <p className="text-zinc-500 mb-8">Sign in to manage your AudioFACTORY profile, view generation history, and access premium features.</p>
          
          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-zinc-200" />
            ) : (
              <UserCircle className="w-10 h-10 text-zinc-400" />
            )}
            <div>
              <h1 className="font-bold text-lg leading-tight">{user.displayName || 'Creator'}</h1>
              <p className="text-xs text-zinc-500 font-mono">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/app')}
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              Go to Studio
            </button>
            <button 
              onClick={() => signOut(auth)}
              className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation */}
        <div className="flex gap-2 mb-8 p-1 bg-zinc-100 rounded-xl inline-flex">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            Generation History
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">Current Plan: Free Tier</h2>
                    <p className="text-sm text-zinc-500">Standard generation limits apply.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-zinc-400" />
                  Recent Activity
                </h3>
                {history.length > 0 ? (
                  <div className="space-y-4">
                    {history.slice(0, 3).map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-zinc-500 capitalize">{item.type} • {new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => navigate('/app')} className="text-blue-600 hover:text-blue-700 p-2">
                          <Play className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">No recent activity found. Head to the studio to generate something!</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-zinc-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Wand2 className="w-24 h-24" />
                </div>
                <h3 className="font-semibold text-lg mb-2 relative z-10">AudioFACTORY Pro</h3>
                <p className="text-zinc-400 text-sm mb-6 relative z-10">Unlock unlimited generations, ElevenLabs premium voices, and priority queueing. Coming soon!</p>
                <button 
                  onClick={handleRequestEarlyAccess}
                  className="w-full bg-white text-zinc-900 py-3 rounded-xl font-medium text-sm relative z-10 hover:bg-zinc-100 transition-colors"
                >
                  Request Early Access
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-200">
              <h2 className="font-semibold text-lg">All Generations</h2>
            </div>
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
              </div>
            ) : history.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <h3 className="font-medium text-zinc-900 mb-1">No history yet</h3>
                <p className="text-sm text-zinc-500">Your generated audio projects will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {history.map(item => (
                  <div key={item.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                    <div>
                      <h4 className="font-medium text-zinc-900 mb-1">{item.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                        <span className="capitalize bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-full font-sans font-medium">{item.type}</span>
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/app')}
                      className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Open
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
