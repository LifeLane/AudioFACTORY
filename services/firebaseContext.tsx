/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Firebase Authentication & Data Context
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  auth,
  linkOrSignInWithGoogle, 
  signInAnonymously, 
  signOutUser, 
  subscribeToAuth, 
  subscribeToUserProjects,
  subscribeToUserMonologues,
  subscribeToDailyUsage,
  saveAudioProject,
  deleteAudioProject,
  saveMonologue,
  deleteMonologue,
  testFirestoreConnection
} from './firebaseService';
import { SavedAudioProject, SavedMonologue, ProjectInput, MonologueInput, UsageRecord } from '../types';

interface FirebaseContextType {
  user: User | null;
  isGuest: boolean;
  authLoading: boolean;
  isOnline: boolean;
  loginGoogle: () => Promise<void>;
  loginGuest: () => Promise<void>;
  logout: () => Promise<void>;
  savedProjects: SavedAudioProject[];
  savedMonologues: SavedMonologue[];
  liveUsage: UsageRecord | null;
  saveProjectToCloud: (project: ProjectInput) => Promise<string>;
  removeProjectFromCloud: (id: string) => Promise<void>;
  saveMonologueToCloud: (monologue: MonologueInput) => Promise<string>;
  removeMonologueFromCloud: (id: string) => Promise<void>;
  isSaving: boolean;
  statusMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  clearStatusMessage: () => void;
  deleteAccountData: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [savedProjects, setSavedProjects] = useState<SavedAudioProject[]>([]);
  const [savedMonologues, setSavedMonologues] = useState<SavedMonologue[]>([]);
  const [liveUsage, setLiveUsage] = useState<UsageRecord | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // 1. Test Firestore connectivity
  useEffect(() => {
    testFirestoreConnection().then(online => {
      setIsOnline(online);
    });
  }, []);

  // 2. Explicit Session Initialization on Boot:
  // - Restore existing Firebase session (Google or Anonymous)
  // - If no session exists, establish guest mode via signInAnonymously()
  useEffect(() => {
    let isMounted = true;
    let isSigningIn = false;

    const unsubscribe = subscribeToAuth(async (currentUser) => {
      if (!isMounted) return;

      if (currentUser) {
        setUser(currentUser);
        setAuthLoading(false);
      } else {
        if (isSigningIn) return;
        isSigningIn = true;
        setAuthLoading(true);
        // No active session -> establish or restore anonymous guest session
        try {
          const guest = await signInAnonymously();
          if (isMounted) {
            setUser(guest);
          }
        } catch (err) {
          console.warn("Could not establish anonymous guest session:", err);
        } finally {
          isSigningIn = false;
          if (isMounted) {
            setAuthLoading(false);
          }
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // 3. Real-time subscription to user's projects, monologues, and usage records
  useEffect(() => {
    if (!user) {
      setSavedProjects([]);
      setSavedMonologues([]);
      setLiveUsage(null);
      return;
    }

    const unsubProjects = subscribeToUserProjects((projects) => {
      setSavedProjects(projects);
    });

    const unsubMonologues = subscribeToUserMonologues((monologues) => {
      setSavedMonologues(monologues);
    });

    const unsubUsage = subscribeToDailyUsage((usage) => {
      setLiveUsage(usage);
    });

    return () => {
      unsubProjects();
      unsubMonologues();
      unsubUsage();
    };
  }, [user]);

  /**
   * Google Sign In with Account Linking:
   * Upgrades the current anonymous guest session to Google-authenticated,
   * keeping the same UID so all existing projects & usage are preserved!
   */
  const loginGoogle = useCallback(async () => {
    try {
      setAuthLoading(true);
      const result = await linkOrSignInWithGoogle();
      setUser(result.user);
      
      if (result.linked) {
        setStatusMessage({ 
          text: `Success! Linked your Google account (${result.user.email}). All projects & quota upgraded to 10 daily generations!`, 
          type: 'success' 
        });
      } else {
        setStatusMessage({ 
          text: `Signed in as ${result.user.displayName || result.user.email || 'Creator'}. Projects and quota synced.`, 
          type: 'success' 
        });
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setStatusMessage({ 
        text: `Google Sign In failed: ${err.message || 'Please try again'}`, 
        type: 'error' 
      });
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /**
   * Guest Login explicitly
   */
  const loginGuest = useCallback(async () => {
    try {
      setAuthLoading(true);
      const guest = await signInAnonymously();
      setUser(guest);
      setStatusMessage({ text: 'Guest session active (3 daily generations).', type: 'info' });
    } catch (err: any) {
      console.error("Guest sign in error:", err);
      setStatusMessage({ text: `Guest sign in failed: ${err.message || 'Please try again'}`, type: 'error' });
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /**
   * Sign Out:
   * Clears state and immediately establishes a fresh guest session
   */
  const logout = useCallback(async () => {
    try {
      setAuthLoading(true);
      setSavedProjects([]);
      setSavedMonologues([]);
      setLiveUsage(null);
      await signOutUser();
      
      // Re-establish guest mode
      const newGuest = await signInAnonymously();
      setUser(newGuest);
      setStatusMessage({ text: 'Signed out. Started a fresh guest session.', type: 'info' });
    } catch (err: any) {
      console.error("Sign out error:", err);
      setStatusMessage({ text: `Sign out failed: ${err.message}`, type: 'error' });
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const saveProjectToCloud = async (project: ProjectInput): Promise<string> => {
    if (!user) {
      throw new Error("Cannot save: No active authentication session.");
    }

    setIsSaving(true);
    try {
      const id = await saveAudioProject(project);
      setStatusMessage({ text: `Saved "${project.title}" to cloud!`, type: 'success' });
      return id;
    } catch (err: any) {
      console.error("Save project error:", err);
      setStatusMessage({ text: `Failed to save project: ${err.message || 'Error occurred'}`, type: 'error' });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const removeProjectFromCloud = async (id: string): Promise<void> => {
    try {
      await deleteAudioProject(id);
      setStatusMessage({ text: 'Project deleted from cloud.', type: 'info' });
    } catch (err: any) {
      console.error("Delete project error:", err);
      setStatusMessage({ text: `Failed to delete: ${err.message}`, type: 'error' });
      throw err;
    }
  };

  const saveMonologueToCloud = async (monologue: MonologueInput): Promise<string> => {
    if (!user) {
      throw new Error("Cannot save: No active authentication session.");
    }

    setIsSaving(true);
    try {
      const id = await saveMonologue(monologue);
      setStatusMessage({ text: `Saved monologue "${monologue.title}" to cloud!`, type: 'success' });
      return id;
    } catch (err: any) {
      console.error("Save monologue error:", err);
      setStatusMessage({ text: `Failed to save monologue: ${err.message || 'Error occurred'}`, type: 'error' });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const removeMonologueFromCloud = async (id: string): Promise<void> => {
    try {
      await deleteMonologue(id);
      setStatusMessage({ text: 'Monologue removed from cloud.', type: 'info' });
    } catch (err: any) {
      console.error("Delete monologue error:", err);
      setStatusMessage({ text: `Failed to delete: ${err.message}`, type: 'error' });
      throw err;
    }
  };

  const clearStatusMessage = () => setStatusMessage(null);

  const deleteAccountData = async (): Promise<void> => {
    try {
      // Clear user local and cloud documents
      if (user) {
        for (const p of savedProjects) {
          try { await deleteAudioProject(p.id); } catch (e) {}
        }
        for (const m of savedMonologues) {
          try { await deleteMonologue(m.id); } catch (e) {}
        }
        try {
          await user.delete();
        } catch (authErr) {
          // If requires recent login, sign out
          await signOutUser();
        }
      }
      setSavedProjects([]);
      setSavedMonologues([]);
      setStatusMessage({ text: 'Account data deleted successfully.', type: 'info' });
    } catch (err: any) {
      console.error('Error deleting account:', err);
      throw err;
    }
  };

  const isGuest = !user || user.isAnonymous;

  return (
    <FirebaseContext.Provider
      value={{
        user,
        isGuest,
        authLoading,
        isOnline,
        loginGoogle,
        loginGuest,
        logout,
        savedProjects,
        savedMonologues,
        liveUsage,
        saveProjectToCloud,
        removeProjectFromCloud,
        saveMonologueToCloud,
        removeMonologueFromCloud,
        isSaving,
        statusMessage,
        clearStatusMessage,
        deleteAccountData,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
