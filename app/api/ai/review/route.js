import { NextResponse } from "next/server";
import { getAiWritingReview } from "../../../../lib/ai";
import { getUserFromRequest } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    // 1. Check Authentication via JWT
    const authUser = getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to Inkly." },
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

    // 4. Generate AI Review via Groq
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
