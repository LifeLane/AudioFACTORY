import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db, auth } from '../config/firebaseConfig';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { 
  Users, 
  Database, 
  Settings, 
  ShieldAlert, 
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
  LogOut
} from 'lucide-react';
import { Toast } from '../../components/Toast';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'database'>('requests');
  
  const [requests, setRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Check if currently logged in as admin
    const checkAdmin = async () => {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid.startsWith('admin_user_')) {
        setIsAdminLoggedIn(true);
        fetchData();
      } else if (currentUser) {
        // Logged in as normal user, we shouldn't be here
        await signOut(auth);
      }
    };
    checkAdmin();
    
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user && user.uid.startsWith('admin_user_')) {
        setIsAdminLoggedIn(true);
        fetchData();
      } else {
        setIsAdminLoggedIn(false);
      }
    });
    return unsubscribe;
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const reqSnapshot = await getDocs(query(collection(db, 'earlyAccessRequests'), orderBy('createdAt', 'desc')));
      const reqData = reqSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(reqData);
      
      const userSnapshot = await getDocs(collection(db, 'users'));
      const userData = await Promise.all(userSnapshot.docs.map(async userDoc => {
         const profileDoc = await getDoc(doc(db, `users/${userDoc.id}/profile/main`));
         return { id: userDoc.id, profile: profileDoc.exists() ? profileDoc.data() : null };
      }));
      setUsers(userData);
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || 'Failed to fetch data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      await signInWithCustomToken(auth, data.token);
      setToast({ message: 'Admin login successful', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleRequestAction = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'earlyAccessRequests', id), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      setToast({ message: `Request ${newStatus}`, type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Action failed', type: 'error' });
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-white mb-2">System Admin</h1>
          <p className="text-zinc-400 text-center mb-8 text-sm">Restricted access area.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">USERNAME</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">PASSWORD</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={loginLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
              Authorize Access
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Admin Header */}
      <header className="bg-zinc-900 text-white border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <h1 className="font-bold text-lg tracking-tight">AudioFACTORY Admin</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'requests' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:bg-zinc-200'}`}
            >
              <Activity className="w-5 h-5" />
              Early Access Requests
              {requests.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {requests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:bg-zinc-200'}`}
            >
              <Users className="w-5 h-5" />
              Users Database
            </button>
            <button 
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'database' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:bg-zinc-200'}`}
            >
              <Database className="w-5 h-5" />
              System Settings
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
          ) : (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden"
            >
              {activeTab === 'requests' && (
                <div>
                  <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                    <h2 className="font-semibold text-lg">Early Access Waitlist</h2>
                    <button onClick={fetchData} className="text-sm text-blue-600 font-medium">Refresh</button>
                  </div>
                  <div className="divide-y divide-zinc-100">
                    {requests.length === 0 ? (
                      <div className="p-8 text-center text-zinc-500 text-sm">No requests found.</div>
                    ) : (
                      requests.map(req => (
                        <div key={req.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-medium text-zinc-900">{req.email}</span>
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {req.status}
                              </span>
                            </div>
                            <div className="text-sm text-zinc-500 font-mono text-xs flex items-center gap-2">
                              <span>UID: {req.userId}</span>
                              <span>•</span>
                              <span>Plan: <span className="font-semibold text-zinc-700">{req.planId}</span></span>
                              <span>•</span>
                              <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {req.status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => handleRequestAction(req.id, 'approved')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleRequestAction(req.id, 'rejected')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50/50">
                    <h2 className="font-semibold text-lg">Registered Users</h2>
                  </div>
                  <div className="divide-y divide-zinc-100">
                    {users.map(u => (
                      <div key={u.id} className="p-6 hover:bg-zinc-50 transition-colors">
                        <div className="font-medium text-zinc-900 mb-1">{u.profile?.email || 'No email profile'}</div>
                        <div className="text-sm text-zinc-500 font-mono text-xs">
                          UID: {u.id} | Display Name: {u.profile?.displayName || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'database' && (
                <div className="p-8 text-center text-zinc-500">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-medium text-zinc-900 mb-2">System Database Metrics</p>
                  <p className="text-sm max-w-sm mx-auto">Database tuning and logs are managed directly via the Google Cloud Console for security reasons.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
