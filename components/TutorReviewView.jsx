"use client";

import { CheckCheck } from "lucide-react";

export default function TutorReviewView({
  originalText,
  aiReviewData,
  onBackToEditor,
  onApplySuggestion,
}) {
  if (!aiReviewData) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <p className="font-serif italic text-xl text-ink-deep">
          No tutor review available for this entry yet.
        </p>
        <button
          type="button"
          onClick={onBackToEditor}
          className="text-xs uppercase tracking-wider text-rose-deep hover:underline"
        >
          ← back to writing canvas
        </button>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Back Bar */}
      <div className="flex items-center justify-between border-b border-[#EDE6DC] pb-4">
        <button
          type="button"
          onClick={onBackToEditor}
          className="text-xs uppercase tracking-widest text-ink-faint hover:text-ink-deep flex items-center gap-1.5 transition"
        >
          <span>←</span>
          <span>back to writing canvas</span>
        </button>
        <span className="font-script text-base text-sage-deep">
          gentle language companion ♡
        </span>
      </div>

      {/* Hero explanation */}
      <div className="space-y-2">
        <span className="text-[11px] uppercase tracking-widest text-rose-accent font-semibold">
          Tutor Feedback &amp; Resonance
        </span>
        <h2 className="font-serif text-3xl font-normal text-ink-deep">
          A warm companion for your natural voice.
        </h2>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-2xl font-light">
          Here is a supportive look at your entry. We don&apos;t want to make
          your voice sound sterile or robotic—just helping you discover natural
          cadence and richer bilingual nuance.
        </p>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Writing */}
        <div className="bg-paper-card p-6 sm:p-7 rounded-2xl delicate-border space-y-4 paper-shadow">
          <div className="flex items-center justify-between border-b border-[#F0E8DC] pb-3">
            <span className="text-xs uppercase tracking-wider text-ink-faint font-medium">
              Your Original Words
            </span>
            <span className="text-xs text-ink-faint font-mono">Draft</span>
          </div>
          <div className="font-serif text-sm sm:text-base text-ink-muted leading-relaxed whitespace-pre-line">
            {originalText}
          </div>
        </div>

        {/* Refined Natural Version */}
        <div className="bg-[#F8F4EE] p-6 sm:p-7 rounded-2xl border border-rose-200/60 space-y-4 relative paper-shadow">
          <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-accent" />
              <span className="text-xs uppercase tracking-wider text-rose-deep font-semibold">
                More Natural Flow &amp; Cadence
              </span>
            </div>
            <span className="text-xs font-script text-rose-accent text-sm">
              tender suggestion
            </span>
          </div>
          <div className="font-serif text-sm sm:text-base text-ink-deep leading-relaxed whitespace-pre-line">
            {aiReviewData.revised}
          </div>
        </div>
      </div>

      {/* Conversational Tutor Insights */}
      <div className="bg-paper-card delicate-border rounded-2xl p-6 sm:p-8 space-y-6 paper-shadow">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sage-soft text-sage-deep flex items-center justify-center font-serif italic text-sm">
            i
          </div>
          <div>
            <h4 className="font-serif text-lg text-ink-deep">
              Why this flows more warmly
            </h4>
            <p className="text-xs text-ink-faint">
              Observations on tone and natural bilingual emotion
            </p>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-ink-muted leading-relaxed pl-1">
          <p>{aiReviewData.explanation}</p>
        </div>

        {/* Gentle Habit Tip */}
        {aiReviewData.tip && (
          <div className="p-4 rounded-xl bg-paper-warm/70 border border-[#E8DFC8] flex items-start gap-3">
            <span className="text-rose-accent text-sm mt-0.5">✦</span>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-deep">
                A little practice for tomorrow&apos;s entry
              </p>
              <p className="text-xs text-ink-muted leading-relaxed">
                {aiReviewData.tip}
              </p>
            </div>
          </div>
        )}

        {/* Decision Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-end gap-3 border-t border-[#F0E8DC]">
          <button
            type="button"
            onClick={onBackToEditor}
            className="px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider text-ink-muted hover:text-ink-deep transition font-medium"
          >
            Keep My Original
          </button>
          <button
            type="button"
            onClick={() => onApplySuggestion(aiReviewData.revised)}
            className="px-6 py-2.5 rounded-xl bg-ink-deep hover:bg-rose-deep text-paper text-xs uppercase tracking-wider font-medium transition shadow-sm flex items-center gap-2"
          >
            <span>Accept Nuance &amp; Return to Edit</span>
            <span>✓</span>
          </button>
        </div>
      </div>
    </section>
  );
}
