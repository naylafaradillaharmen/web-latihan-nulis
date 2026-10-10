import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { getUserFromRequest } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

function getTodayDateKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET(req) {
  try {
    const authData = getUserFromRequest(req);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dateKey = getTodayDateKey();
    const docId = `${authData.uid}_${dateKey}`;
    const db = getDb();
    const usage = db.prepare("SELECT * FROM daily_ai_usage WHERE id = ?").get(docId);

    if (usage) {
      return NextResponse.json({
        used: true,
        date: dateKey,
        reviewedAt: usage.reviewed_at,
      });
    }

    return NextResponse.json({ used: false, date: dateKey, reviewedAt: null });
  } catch (error) {
    console.error("GET daily AI usage error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const authData = getUserFromRequest(req);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { entryId = null, model = "" } = body;
    const dateKey = getTodayDateKey();
    const docId = `${authData.uid}_${dateKey}`;
    const now = new Date().toISOString();

    const db = getDb();
    db.prepare(`
      INSERT OR REPLACE INTO daily_ai_usage (id, user_id, date_key, reviewed_at, entry_id, model)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(docId, authData.uid, dateKey, now, entryId, model);

    return NextResponse.json({ success: true, date: dateKey });
  } catch (error) {
    console.error("POST daily AI usage error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
