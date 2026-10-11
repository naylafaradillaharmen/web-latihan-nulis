/**
 * Inkly AI Writing Tutor Service (Groq API)
 */

export const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];
export const GROQ_MODEL = GROQ_MODELS[0];
export const GROQ_FALLBACK_MODEL = GROQ_MODELS[1];

/**
 * Generate AI Writing Tutor feedback using Groq API
 * @param {Object} params
 * @param {string} params.text - The writing content
 * @param {string} params.title - Title of entry (optional)
 * @param {string} params.language - 'id' or 'en'
 * @returns {Promise<{revised: string, explanation: string, tip: string, model: string}>}
 */
export async function getAiWritingReview({ text, title = "", language = "id" }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not configured on the server. Please add GROQ_API_KEY to .env.local."
    );
  }

  const isIndonesian = language === "id";

  const systemPrompt = `You are Inkly's gentle, encouraging, and perceptive AI Writing Tutor.
Inkly is a personal writing and journaling sanctuary where people write to express themselves, practice Indonesian and English, and develop their natural voice.

Your core mission:
1. Act as a friendly writing tutor and companion, NOT a cold, rigid corporate grammar checker.
2. Honor and preserve the writer's authentic voice, tone, emotion, and personality.
3. UNDERSTAND CASUAL & COLLOQUIAL LANGUAGE:
   - For Indonesian: embrace informal tones, colloquial phrases, slang, relaxed particles ("deh", "nih", "ya", "sih", "gatau", "ngerasa", "bgt", "keren-keren"). DO NOT turn casual personal reflections into robotic formal Indonesian ("baku") unless the writer was specifically writing an academic/formal essay. Focus on rhythm, flow, punctuation, clarity, and word choice.
   - For English: embrace conversational, natural phrasing. Explain nuances and why a certain idiom or phrasing sounds more organic.
4. Provide structured, actionable feedback in 3 distinct parts:
   - "revised": A refined, more natural version of the text that flows beautifully while keeping the exact same feeling and message.
   - "explanation": Brief, kind explanation of what changed and why it makes the writing breathe better (e.g. punctuation, flow, rhythm, natural wording).
   - "tip": ONE practical, memorable writing tip tailored directly to this piece.

RESPONSE FORMAT:
You MUST respond with valid JSON only. Do not wrap in markdown backticks or commentary outside JSON.
{
  "revised": "The refined, natural version of the text",
  "explanation": "Short, clear explanation of the key enhancements",
  "tip": "One friendly, practical writing tip"
}

Language of explanation and tip:
- If the writing language is "id", write the explanation and tip in friendly Indonesian.
- If the writing language is "en", write the explanation and tip in friendly English.`;

  const userPrompt = `Title: ${title || "Untitled"}\nLanguage: ${language}\n\nUser's writing:\n"""\n${text}\n"""`;

  let response = null;
  let selectedModel = GROQ_MODEL;
  let lastErrorData = null;

  for (const modelCandidate of GROQ_MODELS) {
    selectedModel = modelCandidate;
    try {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.6,
          max_tokens: 1500,
          response_format: { type: "json_object" },
        }),
      });

      if (response.ok) {
        break;
      }

      // If unauthorized, don't keep trying models
      if (response.status === 401) {
        break;
      }

      lastErrorData = await response.json().catch(() => ({}));
      console.warn(`Groq model ${selectedModel} failed (${response.status}):`, lastErrorData?.error?.message || "Unknown error");
    } catch (networkErr) {
      console.warn(`Groq network attempt failed for ${selectedModel}:`, networkErr.message);
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Groq API error (${response.status})`;
    const error = new Error(message);
    if (
      response.status === 429 ||
      message.toLowerCase().includes("rate limit") ||
      message.toLowerCase().includes("quota") ||
      message.toLowerCase().includes("token")
    ) {
      error.isTokenExhausted = true;
    }
    throw error;
  }

  const result = await response.json();
  const rawContent = result.choices?.[0]?.message?.content || "{}";

  try {
    const parsed = JSON.parse(rawContent);
    return {
      revised: parsed.revised || text,
      explanation:
        parsed.explanation ||
        (isIndonesian
          ? "Tulisanmu sudah memiliki alur yang baik."
          : "Your writing has good natural flow."),
      tip:
        parsed.tip ||
        (isIndonesian
          ? "Teruslah menulis dengan santai dan jujur pada suaramu."
          : "Keep writing freely and stay true to your natural voice."),
      model: selectedModel,
    };
  } catch (parseErr) {
    console.error("Failed to parse Groq response as JSON:", rawContent);
    return {
      revised: text,
      explanation: rawContent,
      tip: isIndonesian
        ? "Perhatikan transisi antar kalimat."
        : "Pay attention to sentence flow.",
      model: selectedModel,
    };
  }
}
