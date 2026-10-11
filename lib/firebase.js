import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
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
let auth = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.error("Gagal inisialisasi Firebase:", error);
  }
} else if (typeof window !== "undefined") {
  console.warn(
    "Firebase belum terkonfigurasi. Pastikan NEXT_PUBLIC_FIREBASE_* sudah diset di .env.local (lokal) atau di Environment Variables (Vercel/hosting)."
  );
}

/**
 * Format today's date key in YYYY-MM-DD (local time)
 */
export function getTodayDateKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Save or update a writing entry
 */
export async function saveWritingEntry({
  id = null,
  userId,
  title = "",
  content = "",
  language = "id",
  wordCount = 0,
  aiReviewed = false,
  aiReviewedAt = null,
  aiReviewData = null,
}) {
  if (!userId) {
    throw new Error("User ID is required to save an entry.");
  }

  if (db) {
    const entryData = {
      userId,
      title: title.trim() || "Untitled",
      content: content.trim(),
      language: language === "en" ? "en" : "id",
      wordCount: wordCount || (content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0),
      updatedAt: serverTimestamp(),
    };

    if (aiReviewed !== undefined) entryData.aiReviewed = aiReviewed;
    if (aiReviewedAt !== undefined) entryData.aiReviewedAt = aiReviewedAt;
    if (aiReviewData !== undefined) entryData.aiReviewData = aiReviewData;

    if (id && !id.startsWith("local-")) {
      const docRef = doc(db, "entries", id);
      await updateDoc(docRef, entryData);
      return { id, isNew: false };
    } else {
      entryData.createdAt = serverTimestamp();
      entryData.aiReviewed = aiReviewed || false;
      entryData.aiReviewedAt = null;
      entryData.aiReviewData = null;
      const docRef = await addDoc(collection(db, "entries"), entryData);
      return { id: docRef.id, isNew: true };
    }
  }

  throw new Error("Database is not configured.");
}

/**
 * Get all writing entries for a specific user
 */
export async function getWritingEntries(userId) {
  if (!userId || !db) return [];

  try {
    const q = query(
      collection(db, "entries"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      let created = new Date();
      if (data.createdAt instanceof Timestamp) {
        created = data.createdAt.toDate();
      } else if (data.createdAt) {
        created = new Date(data.createdAt);
      }

      let updated = created;
      if (data.updatedAt instanceof Timestamp) {
        updated = data.updatedAt.toDate();
      } else if (data.updatedAt) {
        updated = new Date(data.updatedAt);
      }

      return {
        id: d.id,
        ...data,
        createdAt: created,
        updatedAt: updated,
      };
    });
  } catch (error) {
    console.warn("Firestore query fallback without index:", error);
    try {
      const fallbackQ = query(
        collection(db, "entries"),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(fallbackQ);
      const docs = snapshot.docs.map((d) => {
        const data = d.data();
        let created = new Date();
        if (data.createdAt instanceof Timestamp) {
          created = data.createdAt.toDate();
        } else if (data.createdAt) {
          created = new Date(data.createdAt);
        }
        return {
          id: d.id,
          ...data,
          createdAt: created,
          updatedAt: created,
        };
      });
      return docs.sort((a, b) => b.createdAt - a.createdAt);
    } catch (err2) {
      console.error("Gagal mengambil data dari Firestore:", err2);
      throw err2;
    }
  }
}

/**
 * Delete a specific writing entry
 */
export async function deleteWritingEntry(entryId, userId) {
  if (!entryId || !userId || !db) return false;
  const docRef = doc(db, "entries", entryId);
  await deleteDoc(docRef);
  return true;
}

/**
 * Check if the user has used their daily AI review
 */
export async function checkDailyAiUsage(userId) {
  if (!userId || !db) return { used: false, reviewedAt: null };
  const dateKey = getTodayDateKey();
  const usageDocId = `${userId}_${dateKey}`;
  try {
    const docRef = doc(db, "daily_ai_usage", usageDocId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        used: true,
        date: dateKey,
        reviewedAt: data.reviewedAt || null,
      };
    }
    return { used: false, date: dateKey };
  } catch (err) {
    console.warn("Error checking daily AI usage:", err);
    return { used: false, date: dateKey };
  }
}

/**
 * Record that user has used their daily AI review
 */
export async function recordDailyAiUsage(userId, { entryId = null, model = "" } = {}) {
  if (!userId || !db) return false;
  const dateKey = getTodayDateKey();
  const usageDocId = `${userId}_${dateKey}`;
  const docRef = doc(db, "daily_ai_usage", usageDocId);
  await setDoc(docRef, {
    userId,
    date: dateKey,
    reviewedAt: serverTimestamp(),
    entryId,
    model,
  });
  return true;
}

export { app, db, auth };
