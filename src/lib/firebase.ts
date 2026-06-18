import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, setDoc, doc } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase with fallback guard
let app;
let db: any = null;
let auth: any = null;
let isFirebaseAvailable = false;

try {
  // Check if firebase configuration is valid
  if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    isFirebaseAvailable = true;
    console.log("Firebase initialized successfully with project:", firebaseConfig.projectId);
  } else {
    console.warn("Firebase configuration was incomplete. Running in Local Storage offline mode.");
  }
} catch (error) {
  console.error("Firebase failed to initialize:", error);
}

export { db, auth, isFirebaseAvailable };

// Local Database Fallback Layer using localStorage
const LOCAL_STORAGE_HISTORY_KEY = "ai_shield_history";
const LOCAL_STORAGE_ACTIVITIES_KEY = "ai_shield_activities";
const LOCAL_STORAGE_RECORDINGS_KEY = "ai_shield_recordings";
const LOCAL_STORAGE_SETTINGS_KEY = "ai_shield_settings";

export async function loginAnonymousUser(onUserLoaded: (user: User | { uid: string; isAnonymous: boolean }) => void) {
  if (isFirebaseAvailable && auth) {
    try {
      onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          onUserLoaded(currentUser);
        } else {
          try {
            const userCredential = await signInAnonymously(auth);
            onUserLoaded(userCredential.user);
          } catch (e) {
            console.error("signInAnonymously failed directly, falling back to local session:", e);
            onUserLoaded({ uid: "local-user-id", isAnonymous: true });
          }
        }
      });
    } catch (e) {
      console.error("Firebase auth listener setup failed, falling back to local session:", e);
      onUserLoaded({ uid: "local-user-id", isAnonymous: true });
    }
  } else {
    setTimeout(() => {
      onUserLoaded({ uid: "local-user-id", isAnonymous: true });
    }, 100);
  }
}

// Function to save an item to scan history
export async function saveToScanHistory(userId: string, item: any) {
  const timestamp = new Date().toISOString();
  const newItem = {
    ...item,
    userId,
    timestamp,
    id: item.id || `hist_${Math.random().toString(36).substr(2, 9)}`
  };

  if (isFirebaseAvailable && db) {
    try {
      await addDoc(collection(db, "scanHistory"), newItem);
    } catch (e) {
      console.error("Firebase saveToScanHistory error:", e);
      saveToLocalHistory(newItem);
    }
  } else {
    saveToLocalHistory(newItem);
  }
}

function saveToLocalHistory(item: any) {
  const list = getLocalHistory();
  list.unshift(item);
  localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(list));
}

export function getLocalHistory(): any[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Function to save recent activity
export async function saveRecentActivity(activity: any) {
  const timestamp = new Date().toISOString();
  const newActivity = {
    ...activity,
    timestamp,
    id: activity.id || `act_${Math.random().toString(36).substr(2, 9)}`
  };

  if (isFirebaseAvailable && db) {
    try {
      await addDoc(collection(db, "recentActivities"), newActivity);
    } catch (e) {
      console.error("Firebase saveRecentActivity error:", e);
      saveToLocalActivities(newActivity);
    }
  } else {
    saveToLocalActivities(newActivity);
  }
}

function saveToLocalActivities(activity: any) {
  const list = getLocalActivities();
  list.unshift(activity);
  localStorage.setItem(LOCAL_STORAGE_ACTIVITIES_KEY, JSON.stringify(list.slice(0, 50)));
}

export function getLocalActivities(): any[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACTIVITIES_KEY);
    return raw ? JSON.parse(raw) : getInitialActivities();
  } catch {
    return getInitialActivities();
  }
}

function getInitialActivities(): any[] {
  return [
    {
      id: "act_init_1",
      type: "web",
      title: "Web Check Complete",
      description: "amazon-refunds-india.com was flagged",
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      riskScore: 92
    },
    {
      id: "act_init_2",
      type: "shield",
      title: "Shield Updated",
      description: "Threat database v2.4.1 synced",
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    },
    {
      id: "act_init_3",
      type: "privacy",
      title: "Privacy Audit",
      description: "3 apps scanned for permissions",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    }
  ];
}

// Function to save recordings
export async function saveVoiceRecording(userId: string, recording: any) {
  const timestamp = new Date().toISOString();
  // Ensure we mark it as saved to cloud if firebase works
  const newRecording = {
    ...recording,
    userId,
    timestamp,
    id: recording.id || `rec_${Math.random().toString(36).substr(2, 9)}`,
    savedToCloud: isFirebaseAvailable
  };

  if (isFirebaseAvailable && db) {
    try {
      await addDoc(collection(db, "voiceRecordings"), newRecording);
      console.log("Successfully securely saved recording metadata to Firestore cloud!");
    } catch (e) {
      console.error("Firebase saveVoiceRecording error:", e);
      newRecording.savedToCloud = false;
      saveToLocalRecordings(newRecording);
    }
  } else {
    saveToLocalRecordings(newRecording);
  }
}

function saveToLocalRecordings(recording: any) {
  const list = getLocalRecordings();
  list.unshift(recording);
  localStorage.setItem(LOCAL_STORAGE_RECORDINGS_KEY, JSON.stringify(list));
}

export function getLocalRecordings(): any[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RECORDINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Custom reports
export async function reportScamIncident(incident: any) {
  const timestamp = new Date().toISOString();
  const newRef = {
    ...incident,
    timestamp,
    id: `incident_${Math.random().toString(36).substr(2, 9)}`
  };

  if (isFirebaseAvailable && db) {
    try {
      await addDoc(collection(db, "incidents"), newRef);
      console.log("Incident successfully filed to Cyber Crime division simulator!");
    } catch (e) {
      console.error("Failed to post incident to Firestore:", e);
    }
  }
}
