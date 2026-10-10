import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { getUserFromRequest } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const authData = getUserFromRequest(req);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const user = db.prepare("SELECT id, email, display_name FROM users WHERE id = ?").get(authData.uid);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        uid: user.id,
        email: user.email,
        displayName: user.display_name,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
