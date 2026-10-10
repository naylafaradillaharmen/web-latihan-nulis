import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { comparePassword, signToken } from "../../../../lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan passphrase wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = getDb();
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(cleanEmail);

    if (!user) {
      return NextResponse.json(
        { error: "Email atau passphrase salah." },
        { status: 401 }
      );
    }

    const isValid = comparePassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Email atau passphrase salah." },
        { status: 401 }
      );
    }

    const userObj = {
      id: user.id,
      uid: user.id,
      email: user.email,
      displayName: user.display_name,
    };

    const token = signToken(user);

    return NextResponse.json({
      success: true,
      user: userObj,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat masuk." },
      { status: 500 }
    );
  }
}
