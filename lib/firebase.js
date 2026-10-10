/**
 * Client Storage & Database API Adapter (SQLite Local Backend)
 * Menghubungkan client UI dengan Next.js API Routes & SQLite lokal
 */

export const isFirebaseConfigured = true;

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("inkly_token");
}

export function getTodayDateKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Simpan atau perbarui catatan tulisan ke SQLite
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
  const token = getAuthToken();
  if (!token) {
    throw new Error("Sesi login tidak ditemukan. Silakan masuk terlebih dahulu.");
  }

  const res = await fetch("/api/entries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id,
      title,
      content,
      language,
      wordCount,
      aiReviewed,
      aiReviewedAt,
      aiReviewData,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Gagal menyimpan tulisan ke database lokal.");
  }

  return { id: data.id, isNew: data.isNew };
}

/**
 * Ambil semua catatan tulisan pengguna dari SQLite
 */
export async function getWritingEntries(userId) {
  const token = getAuthToken();
  if (!token) return [];

  try {
    const res = await fetch("/api/entries", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.warn("Gagal mengambil data catatan:", res.statusText);
      return [];
    }

    const data = await res.json();
    const list = data.entries || [];

    return list.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      aiReviewedAt: item.aiReviewedAt ? new Date(item.aiReviewedAt) : null,
    }));
  } catch (error) {
    console.error("Gagal mengambil catatan dari SQLite:", error);
    return [];
  }
}

/**
 * Hapus catatan tulisan dari SQLite
 */
export async function deleteWritingEntry(entryId, userId) {
  const token = getAuthToken();
  if (!token || !entryId) return false;

  const res = await fetch(`/api/entries/${encodeURIComponent(entryId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.ok;
}

/**
 * Cek pemakaian AI review harian
 */
export async function checkDailyAiUsage(userId) {
  const token = getAuthToken();
  const dateKey = getTodayDateKey();
  if (!token) return { used: false, date: dateKey, reviewedAt: null };

  try {
    const res = await fetch("/api/ai/usage", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return { used: false, date: dateKey, reviewedAt: null };
    const data = await res.json();
    return {
      used: Boolean(data.used),
      date: data.date || dateKey,
      reviewedAt: data.reviewedAt || null,
    };
  } catch (err) {
    console.warn("Error checkDailyAiUsage:", err);
    return { used: false, date: dateKey, reviewedAt: null };
  }
}

/**
 * Catat penggunaan AI review harian
 */
export async function recordDailyAiUsage(userId, { entryId = null, model = "" } = {}) {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const res = await fetch("/api/ai/usage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ entryId, model }),
    });

    return res.ok;
  } catch (err) {
    console.warn("Error recordDailyAiUsage:", err);
    return false;
  }
}

// Dummy export untuk backward compatibility jika ada file yang memanggil
export const app = null;
export const db = null;
export const auth = null;
