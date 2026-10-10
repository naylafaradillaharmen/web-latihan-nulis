import { NextResponse } from "next/server";
import { getAiWritingReview } from "../../../../lib/ai";

/**
 * Verify Firebase ID Token via Google Identity Toolkit
 */
async function verifyFirebaseToken(idToken) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not set.");
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || "Invalid or expired authentication session."
    );
  }

  const data = await res.json();
  const user = data?.users?.[0];
  if (!user || !user.localId) {
    throw new Error("No user found for the provided token.");
  }

  return {
    uid: user.localId,
    email: user.email,
  };
}

export async function POST(req) {
  try {
    // 1. Check Authentication Header
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to Inkly." },
        { status: 401 }
      );
    }

    const idToken = authHeader.replace("Bearer ", "").trim();
    let authUser;
    try {
      authUser = await verifyFirebaseToken(idToken);
    } catch (authErr) {
      return NextResponse.json(
        { error: authErr.message || "Invalid authentication session." },
        { status: 401 }
      );
    }

    // 2. Validate Request Body
    const body = await req.json().catch(() => ({}));
    const { text, title = "", language = "id", entryId = null } = body;

    if (!text || typeof text !== "string" || text.trim().length < 5) {
      return NextResponse.json(
        {
          error:
            "Tulisan terlalu singkat untuk direview oleh tutor AI (minimal 5 karakter).",
        },
        { status: 400 }
      );
    }

    // 3. Check GROQ API Key Configuration
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Kunci API Groq belum dikonfigurasi. Silakan periksa file .env.local.",
        },
        { status: 500 }
      );
    }

    // 4. Generate AI Review via Groq (unlimited reviews until token runs out)
    let reviewResult;
    try {
      reviewResult = await getAiWritingReview({
        text: text.trim(),
        title: title.trim(),
        language: language === "en" ? "en" : "id",
      });
    } catch (aiErr) {
      if (aiErr.isTokenExhausted) {
        return NextResponse.json(
          {
            error:
              "Token atau kuota AI saat ini telah habis. Silakan top up token atau perbarui API Key Groq kamu.",
            tokenExhausted: true,
          },
          { status: 429 }
        );
      }
      throw aiErr;
    }

    const reviewedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      review: {
        original: text.trim(),
        revised: reviewResult.revised,
        explanation: reviewResult.explanation,
        tip: reviewResult.tip,
        model: reviewResult.model,
        reviewedAt,
      },
    });
  } catch (err) {
    console.error("Error in /api/ai/review:", err);
    const isTokenLimit =
      err.isTokenExhausted ||
      (err.message &&
        (err.message.includes("429") ||
          err.message.toLowerCase().includes("rate limit") ||
          err.message.toLowerCase().includes("quota") ||
          err.message.toLowerCase().includes("tokens")));

    if (isTokenLimit) {
      return NextResponse.json(
        {
          error:
            "Token atau kuota AI saat ini telah habis. Silakan top up token atau perbarui API Key Groq kamu.",
          tokenExhausted: true,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error:
          err.message ||
          "Gagal memproses review tulisan dengan AI. Silakan coba kembali nanti.",
      },
      { status: 500 }
    );
  }
}
