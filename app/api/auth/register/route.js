import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "../../../../lib/db";
import { hashPassword, signToken } from "../../../../lib/auth";

export async function POST(req) {
  try {
    const { email, password, displayName } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan passphrase wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Passphrase minimal 6 karakter." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (displayName || cleanEmail.split("@")[0] || "Writer").trim();

    const db = getDb();
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: "Email ini sudah terdaftar. Silakan login." },
        { status: 400 }
      );
    }

    const userId = "u_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, cleanEmail, passwordHash, cleanName, now, now);

    const userObj = {
      id: userId,
      uid: userId,
      email: cleanEmail,
      displayName: cleanName,
    };

    const token = signToken({ id: userId, email: cleanEmail, display_name: cleanName });

    return NextResponse.json({
      success: true,
      user: userObj,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat pendaftaran." },
      { status: 500 }
    );
  }
}
