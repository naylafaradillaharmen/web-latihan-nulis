import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== "your-api-key"
);

let app = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error("Gagal inisialisasi Firebase Firestore:", error);
  }
}

const LOCAL_STORAGE_ENTRIES_KEY = "buku_latihan_nulis_local_entries";

export async function saveWritingEntry({ deviceId, text, wordCount, promptCategory }) {
  if (db && isFirebaseConfigured) {
    const docRef = await addDoc(collection(db, "entries"), {
      deviceId,
      text,
      wordCount,
      promptCategory,
      date: serverTimestamp(),
    });
    return { id: docRef.id, isLocalFallback: false };
  }

  const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ENTRIES_KEY) || "[]");
  const newEntry = {
    id: "local-" + Date.now(),
    deviceId,
    text,
    wordCount,
    promptCategory,
    date: new Date().toISOString(),
  };
  localStorage.setItem(LOCAL_STORAGE_ENTRIES_KEY, JSON.stringify([newEntry, ...existing]));
  return { id: newEntry.id, isLocalFallback: true };
}

export async function getWritingEntries(deviceId) {
  if (!deviceId) return [];

  if (db && isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, "entries"),
        where("deviceId", "==", deviceId),
        orderBy("date", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => {
        const data = d.data();
        let formattedDate = new Date();
        if (data.date instanceof Timestamp) {
          formattedDate = data.date.toDate();
        } else if (data.date) {
          formattedDate = new Date(data.date);
        }
        return {
          id: d.id,
          ...data,
          date: formattedDate,
        };
      });
    } catch (error) {
      console.warn("Firestore query fallback:", error);
      try {
        const fallbackQ = query(collection(db, "entries"), where("deviceId", "==", deviceId));
        const snapshot = await getDocs(fallbackQ);
        const docs = snapshot.docs.map((d) => {
          const data = d.data();
          let formattedDate = new Date();
          if (data.date instanceof Timestamp) {
            formattedDate = data.date.toDate();
          } else if (data.date) {
            formattedDate = new Date(data.date);
          }
          return { id: d.id, ...data, date: formattedDate };
        });
        return docs.sort((a, b) => b.date - a.date);
      } catch (err2) {
        console.error("Gagal mengambil data dari Firestore:", err2);
        throw err2;
      }
    }
  }

  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(LOCAL_STORAGE_ENTRIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed
      .filter((e) => e.deviceId === deviceId)
      .map((e) => ({
        ...e,
        date: new Date(e.date),
      }));
  }

  return [];
}

export async function deleteWritingEntry(id) {
  if (db && isFirebaseConfigured && !id.startsWith("local-")) {
    await deleteDoc(doc(db, "entries", id));
    return true;
  }

  if (typeof window !== "undefined") {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ENTRIES_KEY) || "[]");
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(LOCAL_STORAGE_ENTRIES_KEY, JSON.stringify(updated));
    return true;
  }
  return false;
}

export async function deleteAllWritingEntries(deviceId) {
  if (!deviceId) return false;

  if (db && isFirebaseConfigured) {
    const q = query(collection(db, "entries"), where("deviceId", "==", deviceId));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
    return true;
  }

  if (typeof window !== "undefined") {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ENTRIES_KEY) || "[]");
    const updated = existing.filter((item) => item.deviceId !== deviceId);
    localStorage.setItem(LOCAL_STORAGE_ENTRIES_KEY, JSON.stringify(updated));
    return true;
  }
  return false;
}

export { app, db };
