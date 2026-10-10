"use client";

export default function ReadingView({
  entry,
  onBackToSanctuary,
  onEditEntry,
  onOpenReview,
  user,
}) {
  if (!entry) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <p className="font-serif italic text-xl text-ink-deep">
          No entry selected to read.
        </p>
        <button
          type="button"
          onClick={onBackToSanctuary}
          className="text-xs uppercase tracking-wider text-rose-deep hover:underline"
        >
          ← back to journal
        </button>
      </div>
    );
  }

  const text = (entry.content || entry.text || "").trim();
  const paragraphs = text ? text.split(/\n\s*\n/) : [];
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const formatDate = (dateObj) => {
    if (!dateObj) return "Quiet moment";
    try {
      const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(d);
    } catch {
      return "Quiet moment";
    }
  };

  const authorName = user?.displayName
    ? user.displayName.toLowerCase().split(" ")[0]
    : user?.email
    ? user.email.split("@")[0]
    : "anahi";

  return (
    <section className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-150">
      {/* Reading Sanctuary Header */}
      <div className="flex items-center justify-between border-b border-[#EDE6DC] pb-4">
        <button
          type="button"
          onClick={onBackToSanctuary}
          className="text-xs uppercase tracking-widest text-ink-faint hover:text-ink-deep flex items-center gap-1.5 transition"
        >
          <span>←</span>
          <span>back to all entries</span>
        </button>
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <button
            type="button"
            onClick={onEditEntry}
            className="hover:text-ink-deep underline underline-offset-4 decoration-rose-accent transition"
          >
            edit entry
          </button>
          {entry.aiReviewed && (
            <>
              <span>·</span>
              <button
                type="button"
                onClick={onOpenReview}
                className="hover:text-ink-deep transition"
              >
                tutor view
              </button>
            </>
          )}
        </div>
      </div>

      {/* Essay Article */}
      <article className="space-y-8">
        {/* Title & Metadata */}
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-ink-faint uppercase tracking-widest">
            <span>{formatDate(entry.createdAt || entry.date)}</span>
            <span>•</span>
            <span>{entry.language === "id" ? "Bahasa Indonesia" : "English"}</span>
            <span>•</span>
            <span>{readTimeMin} min quiet read</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-ink-deep leading-tight">
            {entry.title || "Untitled"}
          </h1>

          <p className="font-script text-xl text-rose-deep pt-1">
            little letters for the moments I never want to forget
          </p>
        </div>

        <div className="vintage-rule my-8" />

        {/* Prose Body */}
        <div className="font-serif text-lg text-ink-deep leading-relaxed space-y-6 font-normal">
          {paragraphs.length > 0 ? (
            paragraphs.map((para, idx) => (
              <p key={idx} className="whitespace-pre-line">
                {para}
              </p>
            ))
          ) : (
            <p className="italic text-ink-faint">Nothing written yet...</p>
          )}
        </div>

        {/* Companion Tutor Note at Bottom (if reviewed) */}
        {entry.aiReviewed && entry.aiReviewData && (
          <div className="mt-12 p-6 rounded-2xl bg-paper-warm delicate-border space-y-2">
            <div className="flex items-center gap-2 text-xs text-rose-deep font-semibold uppercase tracking-wider">
              <span>✿</span>
              <span>Companion Note</span>
            </div>
            <p className="font-serif italic text-sm text-ink-muted leading-relaxed">
              &ldquo;{entry.aiReviewData.tip || entry.aiReviewData.explanation}&rdquo;
            </p>
          </div>
        )}

        {/* End-of-post gentle sign off */}
        <div className="text-center pt-8 space-y-2">
          <span className="text-rose-accent text-lg">♡</span>
          <p className="font-script text-lg text-ink-muted">{authorName}</p>
        </div>
      </article>
    </section>
  );
}
