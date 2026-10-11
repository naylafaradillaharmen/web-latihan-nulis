import { NextResponse } from "next/server";
import { GROQ_MODELS } from "../../../../lib/ai";

// Curated quiet quotes as instant fallback if network/API is offline
const FALLBACK_QUOTES = [
  {
    quote: "remember: you are allowed to outgrow people, places, and old versions of yourself ♡",
    meaning: "Bertumbuh sering kali terasa sepi, tapi melepaskan adalah caramu memberi ruang bagi ketenangan baru.",
    prompt: "Ceritakan tentang satu hal yang perlahan mulai kamu relakan belakangan ini.",
    author: "quiet reassurance",
  },
  {
    quote: "some days are not meant for creating loud things, just for keeping your gentle heart alive.",
    meaning: "Hari-hari yang tenang dan biasa saja tetap berharga, bahkan ketika kamu merasa tidak melakukan banyak hal.",
    prompt: "Apa satu hal kecil dan sederhana yang membuatmu merasa damai hari ini?",
    author: "letters to a quiet hour",
  },
  {
    quote: "kamu tidak harus menulis hal yang luar biasa, cukup tulis apa yang sungguh-sungguh kamu rasakan.",
    meaning: "Kejujuran pada kata-kata sendiri selalu terdengar paling merdu dan menyembuhkan.",
    prompt: "Tuliskan apa yang paling riuh di dalam kepalamu saat ini tanpa takut salah.",
    author: "inkly sanctuary",
  },
  {
    quote: "in the quiet hours, words finally find their way back home to you ✿",
    meaning: "Saat malam hening, perasaan yang kita simpan sepanjang hari akhirnya berani bersuara.",
    prompt: "Tuliskan sepucuk surat untuk dirimu di penghujung hari ini.",
    author: "whispered thoughts",
  },
];

export async function GET(req) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    const randomFallback = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
    return NextResponse.json({ success: true, spark: randomFallback, source: "curated" });
  }

  const systemPrompt = `You are the gentle, poetic spirit behind Inkly, a serene bilingual writing journal sanctuary.
Generate ONE short, tender, contemplative quote or reflection for someone's daily writing ritual.
It should feel warm, honest, and comforting (like tea on a rainy afternoon). It can be in poetic Indonesian or English.

RESPONSE FORMAT (JSON ONLY):
{
  "quote": "A tender poetic quote or quiet reassurance (max 2 sentences)",
  "meaning": "One short reflective sentence explaining its warm sentiment",
  "prompt": "One thoughtful, gentle prompt to inspire writing today",
  "author": "A poetic signature like 'quiet morning letter' or 'catatan hening'"
}`;

  const userPrompt = "Generate a fresh, heartwarming daily writing spark for today's quiet journal.";

  let lastError = null;

  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.75,
          max_tokens: 450,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        lastError = await response.text();
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) continue;

      const parsed = JSON.parse(content);
      return NextResponse.json({
        success: true,
        spark: {
          quote: parsed.quote || FALLBACK_QUOTES[0].quote,
          meaning: parsed.meaning || FALLBACK_QUOTES[0].meaning,
          prompt: parsed.prompt || FALLBACK_QUOTES[0].prompt,
          author: parsed.author || "daily spark",
        },
        model,
        source: "ai",
      });
    } catch (err) {
      lastError = err.message;
    }
  }

  // Fallback to beautiful curated quote if all models fail
  const fallback = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  return NextResponse.json({ success: true, spark: fallback, source: "curated", note: lastError });
}
