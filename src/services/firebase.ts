import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  Firestore,
  getDocs,
  deleteDoc,
  doc,
  getDocFromServer,
} from 'firebase/firestore';
import { MissionRecord, BroadcastMessage } from '../types';

// Helper to sanitize env values (strip wrapping quotes or whitespace)
const cleanEnv = (val?: string): string => {
  if (!val) return '';
  const trimmed = val.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
};

// Check if Firebase credentials are provided in .env / import.meta.env
export const firebaseConfig = {
  apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID),
  firestoreDatabaseId: cleanEnv(import.meta.env.VITE_FIREBASE_DATABASE_ID),
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('MY_') &&
  firebaseConfig.apiKey.length > 5
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
    console.log(
      'Firebase Cloud Firestore successfully initialized with project:',
      firebaseConfig.projectId,
      'database:',
      firebaseConfig.firestoreDatabaseId || '(default)'
    );

    // Validate connection to Firestore as recommended in the Firebase skill
    getDocFromServer(doc(db, '_connection_test', 'status')).catch((error) => {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('Firebase client is offline or network is unreachable:', error);
      }
    });
  } catch (err) {
    console.warn('Firebase initialization failed, falling back to local sync:', err);
  }
}

// -------------------------------------------------------------
// Local Mock / Fallback Sync Engine (BroadcastChannel + LocalStorage)
// -------------------------------------------------------------
const LOCAL_STORAGE_MISSIONS_KEY = 'sparkle_expedition_missions_v1';
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('sparkle_expedition_channel')
  : null;

// Initial sample data for demonstration so teachers have visible cards right away
const INITIAL_DEMO_MISSIONS: MissionRecord[] = [
  {
    id: 'demo-1',
    studentId: 'rabbit',
    studentNickname: '씩씩한 토끼',
    studentAnimal: '🐰',
    missionType: 'barista',
    missionTitle: '바리스타 미션 (사진 찍기)',
    status: 'completed',
    feedback: '우와! 컵과 냅킨을 가지런히 놓았네요! 정말 멋진 바리스타예요! ⭐',
    timestamp: Date.now() - 1000 * 60 * 15,
  },
  {
    id: 'demo-2',
    studentId: 'bear',
    studentNickname: '다정한 곰돌이',
    studentAnimal: '🐻',
    missionType: 'greeting',
    missionTitle: '마트 인사 미션 (말하기)',
    status: 'completed',
    feedback: '밝고 씩씩하게 "안녕하세요!" 인사해주어 최고예요! ⭐',
    timestamp: Date.now() - 1000 * 60 * 8,
  },
];

function getStoredLocalMissions(): MissionRecord[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_MISSIONS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MISSIONS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_MISSIONS_KEY, JSON.stringify(INITIAL_DEMO_MISSIONS));
      return INITIAL_DEMO_MISSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_MISSIONS;
  }
}

function saveLocalMissions(missions: MissionRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_MISSIONS_KEY, JSON.stringify(missions));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'MISSIONS_UPDATED', payload: missions });
    }
  } catch (e) {
    console.error('Failed to save missions locally', e);
  }
}

// -------------------------------------------------------------
// Unified Service Interface
// -------------------------------------------------------------

/**
 * Subscribe to completed missions in real time
 */
export function subscribeToMissions(callback: (missions: MissionRecord[]) => void): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'missions'), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const records: MissionRecord[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            records.push({
              id: docSnap.id,
              studentId: data.studentId || '',
              studentNickname: data.studentNickname || '학생',
              studentAnimal: data.studentAnimal || '⭐',
              missionType: data.missionType || 'barista',
              missionTitle: data.missionTitle || '미션',
              status: 'completed',
              feedback: data.feedback || '',
              photoUrl: data.photoUrl,
              timestamp: typeof data.timestamp === 'number' ? data.timestamp : (data.timestamp?.toMillis ? data.timestamp.toMillis() : Date.now()),
            });
          });
          callback(records);
        },
        (error) => {
          console.warn('Firestore subscription error, using local fallback:', error);
          callback(getStoredLocalMissions());
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn('Error setting up Firestore listener:', e);
    }
  }

  // Local fallback listener
  callback(getStoredLocalMissions());

  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_MISSIONS_KEY && e.newValue) {
      try {
        callback(JSON.parse(e.newValue));
      } catch {
        // ignore
      }
    }
  };

  const handleBroadcast = (e: MessageEvent) => {
    if (e.data?.type === 'MISSIONS_UPDATED') {
      callback(e.data.payload);
    }
  };

  window.addEventListener('storage', handleStorage);
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    window.removeEventListener('storage', handleStorage);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
  };
}

/**
 * Add a completed mission record
 */
export async function addMissionRecord(record: Omit<MissionRecord, 'id' | 'timestamp'>): Promise<string> {
  const timestamp = Date.now();

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'missions'), {
        ...record,
        timestamp,
      });
      return docRef.id;
    } catch (err) {
      console.warn('Firestore addDoc failed, storing locally:', err);
    }
  }

  // Local fallback
  const current = getStoredLocalMissions();
  const newRecord: MissionRecord = {
    ...record,
    id: 'local-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp,
  };
  const updated = [newRecord, ...current];
  saveLocalMissions(updated);

  // Notify listeners in same window
  window.dispatchEvent(new CustomEvent('sparkle_mission_added', { detail: newRecord }));

  return newRecord.id;
}

/**
 * Subscribe to broadcast teacher praise events
 */
export function subscribeToBroadcasts(callback: (msg: BroadcastMessage) => void): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'broadcasts'), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            // Only fire if recent (within 10 seconds)
            const time = typeof data.timestamp === 'number' ? data.timestamp : (data.timestamp?.toMillis ? data.timestamp.toMillis() : Date.now());
            if (Date.now() - time < 15000) {
              callback({
                id: change.doc.id,
                type: data.type || 'praise_all',
                message: data.message || '참 잘했어요!',
                teacherName: data.teacherName,
                timestamp: time,
              });
            }
          }
        });
      });
      return unsubscribe;
    } catch (e) {
      console.warn('Firestore broadcast listener error:', e);
    }
  }

  // Local BroadcastChannel listener
  const handleBroadcast = (e: MessageEvent) => {
    if (e.data?.type === 'TEACHER_PRAISE_BROADCAST') {
      callback(e.data.payload);
    }
  };

  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<BroadcastMessage>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('sparkle_teacher_praise', handleCustomEvent);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('sparkle_teacher_praise', handleCustomEvent);
  };
}

/**
 * Send a broadcast praise to all student screens
 */
export async function sendBroadcast(message: string, teacherName = '선생님'): Promise<void> {
  const payload: BroadcastMessage = {
    id: 'broadcast-' + Date.now(),
    type: 'praise_all',
    message,
    teacherName,
    timestamp: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, 'broadcasts'), payload);
    } catch (e) {
      console.warn('Firebase broadcast send failed, using local channel:', e);
    }
  }

  // Always emit locally as well for immediate tab response
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'TEACHER_PRAISE_BROADCAST', payload });
  }
  window.dispatchEvent(new CustomEvent('sparkle_teacher_praise', { detail: payload }));
}

/**
 * Reset / Clear all missions (useful for teachers starting a new session)
 */
export async function resetMissions(): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'missions'));
      const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(doc(db!, 'missions', docSnap.id)));
      await Promise.all(deletePromises);
    } catch (e) {
      console.warn('Firestore clear error:', e);
    }
  }

  saveLocalMissions([]);
}
