import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously as firebaseSignInAnonymously, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  getDocFromServer,
  query,
  orderBy 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { SavedAudioProject, SavedMonologue, ProjectInput, MonologueInput } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId as second argument
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate connection to Firestore on boot
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    // Attempt to test server reachability
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorCode = error?.code || '';
    if (
      errorCode === 'unavailable' ||
      errorMsg.includes('the client is offline') || 
      errorMsg.includes('unavailable') ||
      errorMsg.includes('Could not reach Cloud Firestore backend')
    ) {
      console.warn("Firestore connection check: Operating in offline / local cache mode until server connection is established.");
      return false;
    }
    // Expected to get a permission-denied or not-found on 'test/connection' when rules are restrictive and backend is healthy
    return true;
  }
}

/**
 * Google Sign In with Popup
 */
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

/**
 * Anonymous Sign In for instant access without credentials
 */
export async function signInAnonymously(): Promise<User> {
  const credential = await firebaseSignInAnonymously(auth);
  return credential.user;
}

/**
 * Sign out
 */
export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Listen to auth state changes
 */
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Save an Audio Factory multi-speaker project to Firestore
 */
export async function saveAudioProject(
  projectData: ProjectInput
): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required to save projects.");

  const projectId = projectData.id && projectData.id.trim() ? projectData.id : `proj_${Date.now()}`;
  const now = new Date().toISOString();
  const path = `users/${user.uid}/projects/${projectId}`;

  // Strip transient audio buffers / binary data before storing in Firestore
  const cleanLines = (projectData.lines || []).map(line => ({
    id: line.id,
    speaker: line.speaker,
    text: line.text,
    scene: line.scene || 'Scene 1',
    emotion: line.emotion || 'Natural',
  }));

  const cleanSpeakers = (projectData.speakers || []).map(s => ({
    name: s.name,
    voice: s.voice,
    provider: s.provider,
    gender: s.gender || 'MALE',
    color: s.color || 'yellow',
  }));

  const payload: SavedAudioProject = {
    id: projectId,
    title: projectData.title || 'Untitled Audio Project',
    summary: projectData.summary || '',
    format: projectData.format || 'Podcast Dialogue',
    style: projectData.style || 'High Stakes & Dramatic',
    speakerCount: projectData.speakerCount || cleanSpeakers.length,
    speakers: cleanSpeakers,
    lines: cleanLines,
    userId: user.uid,
    createdAt: projectData.createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, path), payload);
    return projectId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribe to the current user's audio projects in real-time
 */
export function subscribeToUserProjects(callback: (projects: SavedAudioProject[]) => void): () => void {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {};
  }

  const collPath = `users/${user.uid}/projects`;
  const q = query(collection(db, collPath), orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: SavedAudioProject[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as SavedAudioProject);
      });
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, collPath);
    }
  );
}

/**
 * Delete an audio project
 */
export async function deleteAudioProject(projectId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");

  const path = `users/${user.uid}/projects/${projectId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save a single-speaker monologue/script
 */
export async function saveMonologue(
  monologueData: MonologueInput
): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");

  const monoId = monologueData.id && monologueData.id.trim() ? monologueData.id : `mono_${Date.now()}`;
  const now = new Date().toISOString();
  const path = `users/${user.uid}/monologues/${monoId}`;

  const payload: SavedMonologue = {
    id: monoId,
    title: monologueData.title || 'Untitled Monologue',
    styleId: monologueData.styleId || 'custom',
    voice: monologueData.voice || 'Algieba',
    text: monologueData.text,
    userId: user.uid,
    createdAt: monologueData.createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, path), payload);
    return monoId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribe to saved monologues
 */
export function subscribeToUserMonologues(callback: (monologues: SavedMonologue[]) => void): () => void {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {};
  }

  const collPath = `users/${user.uid}/monologues`;
  const q = query(collection(db, collPath), orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: SavedMonologue[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as SavedMonologue);
      });
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, collPath);
    }
  );
}

/**
 * Delete a monologue
 */
export async function deleteMonologue(monologueId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");

  const path = `users/${user.uid}/monologues/${monologueId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
