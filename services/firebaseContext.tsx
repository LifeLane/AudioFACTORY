import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { 
  auth,
  signInWithGoogle, 
  signInAnonymously, 
  signOutUser, 
  subscribeToAuth, 
  subscribeToUserProjects,
  subscribeToUserMonologues,
  saveAudioProject,
  deleteAudioProject,
  saveMonologue,
  deleteMonologue,
  testFirestoreConnection
} from './firebaseService';
import { SavedAudioProject, SavedMonologue, ProjectInput, MonologueInput } from '../types';

interface FirebaseContextType {
  user: User | null;
  authLoading: boolean;
  isOnline: boolean;
  loginGoogle: () => Promise<void>;
  loginGuest: () => Promise<void>;
  logout: () => Promise<void>;
  savedProjects: SavedAudioProject[];
  savedMonologues: SavedMonologue[];
  saveProjectToCloud: (project: ProjectInput) => Promise<string>;
  removeProjectFromCloud: (id: string) => Promise<void>;
  saveMonologueToCloud: (monologue: MonologueInput) => Promise<string>;
  removeMonologueFromCloud: (id: string) => Promise<void>;
  isSaving: boolean;
  statusMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  clearStatusMessage: () => void;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [savedProjects, setSavedProjects] = useState<SavedAudioProject[]>([]);
  const [savedMonologues, setSavedMonologues] = useState<SavedMonologue[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Validate Firestore connection on boot
  useEffect(() => {
    testFirestoreConnection().then(online => {
      setIsOnline(online);
    });
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time collections when user is authenticated
  useEffect(() => {
    if (!user) {
      setSavedProjects([]);
      setSavedMonologues([]);
      return;
    }

    const unsubProjects = subscribeToUserProjects((projects) => {
      setSavedProjects(projects);
    });

    const unsubMonologues = subscribeToUserMonologues((monologues) => {
      setSavedMonologues(monologues);
    });

    return () => {
      unsubProjects();
      unsubMonologues();
    };
  }, [user]);

  const loginGoogle = async () => {
    try {
      setAuthLoading(true);
      const u = await signInWithGoogle();
      setStatusMessage({ text: `Welcome, ${u.displayName || u.email || 'Creator'}! Synced with Firebase.`, type: 'success' });
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setStatusMessage({ text: `Google Sign In failed: ${err.message || 'Please try again'}`, type: 'error' });
    } finally {
      setAuthLoading(false);
    }
  };

  const loginGuest = async () => {
    try {
      setAuthLoading(true);
      await signInAnonymously();
      setStatusMessage({ text: 'Signed in as Guest with Cloud Sync enabled!', type: 'success' });
    } catch (err: any) {
      console.error("Guest sign in error:", err);
      setStatusMessage({ text: `Guest sign in failed: ${err.message || 'Please try again'}`, type: 'error' });
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
      setStatusMessage({ text: 'Signed out from Firebase.', type: 'info' });
    } catch (err: any) {
      console.error("Sign out error:", err);
    }
  };

  const saveProjectToCloud = async (project: ProjectInput): Promise<string> => {
    // If user is not yet logged in, auto-login as guest so save succeeds immediately
    let activeUser = user;
    if (!activeUser) {
      activeUser = await signInAnonymously();
      setUser(activeUser);
    }

    setIsSaving(true);
    try {
      const id = await saveAudioProject(project);
      setStatusMessage({ text: `Saved "${project.title}" to Firebase Firestore!`, type: 'success' });
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
      setStatusMessage({ text: 'Project deleted from Firebase.', type: 'info' });
    } catch (err: any) {
      console.error("Delete project error:", err);
      setStatusMessage({ text: `Failed to delete: ${err.message}`, type: 'error' });
      throw err;
    }
  };

  const saveMonologueToCloud = async (monologue: MonologueInput): Promise<string> => {
    let activeUser = user;
    if (!activeUser) {
      activeUser = await signInAnonymously();
      setUser(activeUser);
    }

    setIsSaving(true);
    try {
      const id = await saveMonologue(monologue);
      setStatusMessage({ text: `Saved monologue "${monologue.title}" to Firebase!`, type: 'success' });
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
      setStatusMessage({ text: 'Monologue removed from Firebase.', type: 'info' });
    } catch (err: any) {
      console.error("Delete monologue error:", err);
      setStatusMessage({ text: `Failed to delete: ${err.message}`, type: 'error' });
      throw err;
    }
  };

  const clearStatusMessage = () => setStatusMessage(null);

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authLoading,
        isOnline,
        loginGoogle,
        loginGuest,
        logout,
        savedProjects,
        savedMonologues,
        saveProjectToCloud,
        removeProjectFromCloud,
        saveMonologueToCloud,
        removeMonologueFromCloud,
        isSaving,
        statusMessage,
        clearStatusMessage,
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
