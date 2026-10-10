import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "../../../lib/db";
import { getUserFromRequest } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const authData = getUserFromRequest(req);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const rows = db.prepare(`
      SELECT * FROM entries 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(authData.uid);

    const entries = rows.map((row) => {
      let aiReviewData = null;
      if (row.ai_review_data) {
        try {
          aiReviewData = JSON.parse(row.ai_review_data);
        } catch (e) {
          aiReviewData = null;
        }
      }

      return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        content: row.content,
        language: row.language,
        wordCount: row.word_count,
        aiReviewed: Boolean(row.ai_reviewed),
        aiReviewedAt: row.ai_reviewed_at ? new Date(row.ai_reviewed_at) : null,
        aiReviewData,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    });

    return NextResponse.json({ success: true, entries });
  } catch (error) {
    console.error("GET entries error:", error);
    return NextResponse.json(
      { error: "Gagal memuat catatan dari database lokal." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const authData = getUserFromRequest(req);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id = null,
      title = "",
      content = "",
      language = "id",
      wordCount = 0,
      aiReviewed = false,
      aiReviewedAt = null,
      aiReviewData = null,
    } = body;

    const db = getDb();
    const now = new Date().toISOString();
    const parsedWordCount = wordCount || (content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0);
    const reviewDataStr = aiReviewData ? JSON.stringify(aiReviewData) : null;
    const reviewAtStr = aiReviewedAt ? new Date(aiReviewedAt).toISOString() : null;

    if (id && !id.startsWith("local-")) {
      // Check ownership
      const existing = db.prepare("SELECT user_id FROM entries WHERE id = ?").get(id);
      if (!existing || existing.user_id !== authData.uid) {
        return NextResponse.json({ error: "Catatan tidak ditemukan atau akses ditolak." }, { status: 404 });
      }

      db.prepare(`
        UPDATE entries 
        SET title = ?, content = ?, language = ?, word_count = ?,
            ai_reviewed = ?, ai_reviewed_at = ?, ai_review_data = ?, updated_at = ?
        WHERE id = ? AND user_id = ?
      `).run(
        title.trim() || "Untitled",
        content.trim(),
        language === "en" ? "en" : "id",
        parsedWordCount,
        aiReviewed ? 1 : 0,
        reviewAtStr,
        reviewDataStr,
        now,
        id,
        authData.uid
      );

      return NextResponse.json({ success: true, id, isNew: false });
    } else {
      const newId = "entry_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);

      db.prepare(`
        INSERT INTO entries (
          id, user_id, title, content, language, word_count,
          ai_reviewed, ai_reviewed_at, ai_review_data, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newId,
        authData.uid,
        title.trim() || "Untitled",
        content.trim(),
        language === "en" ? "en" : "id",
        parsedWordCount,
        aiReviewed ? 1 : 0,
        reviewAtStr,
        reviewDataStr,
        now,
        now
      );

      return NextResponse.json({ success: true, id: newId, isNew: true });
    }
  } catch (error) {
    console.error("POST entries error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan tulisan ke database lokal." },
      { status: 500 }
    );
  }
}
