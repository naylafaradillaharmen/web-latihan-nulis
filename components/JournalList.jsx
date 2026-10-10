"use client";

import { useState, useMemo } from "react";
import { Trash2 } from "lucide-react";

export default function JournalList({
  entries = [],
  isLoading = false,
  activeEntryId = null,
  onSelectEntry,
  onDeleteEntry,
  onNewWriting,
  onOpenAuth,
  user,
}) {
  const [filter, setFilter] = useState("all"); // "all" | "id" | "en" | "reviewed"
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Compute counts
  const idCount = useMemo(
    () => entries.filter((e) => e.language === "id").length,
    [entries]
  );
  const enCount = useMemo(
    () => entries.filter((e) => e.language === "en").length,
    [entries]
  );
  const reviewedCount = useMemo(
    () => entries.filter((e) => e.aiReviewed).length,
    [entries]
  );

  // Filtered entries
  const filteredEntries = useMemo(() => {
    if (filter === "id") return entries.filter((e) => e.language === "id");
    if (filter === "en") return entries.filter((e) => e.language === "en");
    if (filter === "reviewed") return entries.filter((e) => e.aiReviewed);
    return entries;
  }, [entries, filter]);

  const formatDate = (dateObj) => {
    if (!dateObj) return "May 14, 2026";
    try {
      const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(d);
    } catch {
      return "Quiet evening";
    }
  };

  const getWordCount = (entry) => {
    if (entry.wordCount) return entry.wordCount;
    const text = (entry.content || entry.text || "").trim();
    return text ? text.split(/\s+/).filter(Boolean).length : 0;
  };

  const userName = user?.displayName
    ? user.displayName.toLowerCase().split(" ")[0]
    : user?.email
    ? user.email.split("@")[0]
    : "sahabat";

  return (
    <div className="space-y-12">
      {/* Quiet Warm Editorial Hero */}
      <div className="pt-6 pb-2 text-center max-w-2xl mx-auto space-y-3">
        <p className="font-script text-2xl sm:text-3xl text-rose-deep">
          selamat datang, {userName} ♡
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-ink-deep tracking-tight leading-tight">
          your little space for words.
        </h1>
        <p className="text-sm sm:text-base text-ink-muted font-light leading-relaxed max-w-lg mx-auto">
          Write freely, keep your thoughts close, and learn to express yourself
          gently in Indonesian and English every day.
        </p>
        <div className="pt-3">
          <button
            type="button"
            onClick={onNewWriting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-ink-deep text-paper font-sans text-xs tracking-wider uppercase rounded-full hover:bg-rose-deep transition duration-200 shadow-xs"
          >
            <span>+ Start writing</span>
            <span className="text-xs text-paper-warm">✎</span>
          </button>
        </div>
      </div>

      {/* Journal Stream & Quiet Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
        {/* Left: Editorial Entry Stream (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Subtle Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#EBE3D8] text-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-full transition ${
                filter === "all"
                  ? "bg-paper-warm text-ink-deep border border-[#DFD5C6] font-medium"
                  : "text-ink-muted hover:text-ink-deep hover:bg-paper-warm/60"
              }`}
            >
              all entries ({entries.length})
            </button>

            <button
              type="button"
              onClick={() => setFilter("id")}
              className={`px-3 py-1 rounded-full transition ${
                filter === "id"
                  ? "bg-paper-warm text-ink-deep border border-[#DFD5C6] font-medium"
                  : "text-ink-muted hover:text-ink-deep hover:bg-paper-warm/60"
              }`}
            >
              in indonesian ({idCount})
            </button>

            <button
              type="button"
              onClick={() => setFilter("en")}
              className={`px-3 py-1 rounded-full transition ${
                filter === "en"
                  ? "bg-paper-warm text-ink-deep border border-[#DFD5C6] font-medium"
                  : "text-ink-muted hover:text-ink-deep hover:bg-paper-warm/60"
              }`}
            >
              in english ({enCount})
            </button>

            <button
              type="button"
              onClick={() => setFilter("reviewed")}
              className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition ${
                filter === "reviewed"
                  ? "bg-paper-warm text-ink-deep border border-[#DFD5C6] font-medium"
                  : "text-ink-muted hover:text-ink-deep hover:bg-paper-warm/60"
              }`}
            >
              <span>with tutor notes</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sage-accent" />
            </button>
          </div>

          {/* Loading Shimmer */}
          {isLoading && (
            <div className="space-y-6 py-6 divide-y divide-[#EDE5DA]">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-7 space-y-3 animate-pulse">
                  <div className="h-3 w-32 bg-[#EFE7DC] rounded" />
                  <div className="h-6 w-3/4 bg-[#EFE7DC] rounded" />
                  <div className="h-4 w-full bg-[#EFE7DC]/60 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Not logged in state */}
          {!user && (
            <div className="py-16 text-center delicate-border rounded-2xl bg-paper-card p-8 paper-shadow space-y-3">
              <span className="font-serif italic text-2xl text-ink-deep block">
                your private sanctuary ♡
              </span>
              <p className="text-xs sm:text-sm text-ink-muted max-w-sm mx-auto font-light leading-relaxed">
                Log in to view your preserved thoughts, bilingual notes, and
                personalized AI tutor suggestions.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth("login")}
                  className="px-6 py-2.5 rounded-full bg-ink-deep text-paper text-xs uppercase tracking-wider font-medium hover:bg-rose-deep transition"
                >
                  Enter Sanctuary
                </button>
              </div>
            </div>
          )}

          {/* Empty Entries */}
          {user && !isLoading && filteredEntries.length === 0 && (
            <div className="py-16 text-center delicate-border rounded-2xl bg-paper-card p-8 paper-shadow space-y-3">
              <span className="font-serif italic text-xl text-ink-deep block">
                {filter === "all"
                  ? "the page is quiet and waiting..."
                  : "no entries found in this filter."}
              </span>
              <p className="text-xs text-ink-muted font-light max-w-xs mx-auto">
                {filter === "all"
                  ? "Write your first little note today without any fear or pressure."
                  : "Try writing or choosing another category above."}
              </p>
              <button
                type="button"
                onClick={onNewWriting}
                className="mt-2 inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-rose-soft text-rose-deep text-xs font-medium hover:bg-rose-accent hover:text-white transition"
              >
                <span>+ Start writing</span>
              </button>
            </div>
          )}

          {/* Entry List: Pure Editorial Styling */}
          {user && !isLoading && filteredEntries.length > 0 && (
            <div className="divide-y divide-[#EDE5DA]">
              {filteredEntries.map((entry) => {
                const words = getWordCount(entry);
                const isSelected = activeEntryId === entry.id;
                const langLabel =
                  entry.language === "id" ? "Bahasa Indonesia" : "English";

                return (
                  <article
                    key={entry.id}
                    onClick={() => onSelectEntry(entry)}
                    className={`py-7 group cursor-pointer transition-colors ${
                      isSelected ? "bg-paper-warm/40 px-4 rounded-xl -mx-4" : ""
                    }`}
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-ink-faint">
                        <span className="font-serif italic">
                          {formatDate(entry.createdAt || entry.date)}
                        </span>
                        <span>·</span>
                        <span className="uppercase tracking-wider">
                          {langLabel}
                        </span>
                        <span>·</span>
                        <span>{words} words</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-script text-rose-deep text-base sm:text-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          baca catatan ↗
                        </span>
                        {onDeleteEntry && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEntry(entry);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-ink-faint hover:text-rose-deep transition-all"
                            title="Hapus catatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h2 className="font-serif text-2xl font-normal text-ink-deep group-hover:text-rose-deep transition mb-2">
                      {entry.title || "Untitled thoughts"}
                    </h2>

                    <p className="text-ink-muted text-sm leading-relaxed line-clamp-2 font-light">
                      {entry.content || entry.text || "Let your thoughts fall gently onto the page..."}
                    </p>

                    {entry.aiReviewed && (
                      <div className="mt-3 flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-rose-soft text-rose-deep font-medium">
                          tutor reflection added
                        </span>
                        {entry.aiReviewData?.tip && (
                          <span className="text-xs text-ink-faint italic font-serif line-clamp-1">
                            &ldquo;{entry.aiReviewData.tip}&rdquo;
                          </span>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Quiet Side Column (4 Cols) */}
        <aside className="lg:col-span-4 space-y-8 lg:pl-4">
          {/* Handmade Paper Note Card */}
          <div className="bg-[#F5EFE6] p-6 rounded-2xl delicate-border paper-shadow relative overflow-hidden">
            <div className="w-12 h-2 bg-[#E2D2BE]/60 rounded-sm mb-3 mx-auto" />
            <p className="font-script text-2xl sm:text-3xl text-rose-deep leading-relaxed text-center">
              &ldquo;remember: you are allowed to outgrow people, places, and old
              versions of yourself ♡&rdquo;
            </p>
            <p className="text-[11px] text-ink-faint uppercase tracking-wider text-center mt-3 font-serif italic">
              — written for quiet reassurance
            </p>
          </div>

          {/* Reading & Matcha 'Currently' Widget */}
          <div className="bg-paper-card p-6 rounded-2xl delicate-border space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0E8DC] pb-2.5">
              <h3 className="font-serif text-base italic text-ink-deep">
                currently ♡
              </h3>
              <span className="text-xs text-rose-accent">✿</span>
            </div>
            <ul className="text-xs space-y-2.5 text-ink-muted">
              <li className="flex items-start gap-2">
                <span className="text-rose-accent">♥</span>
                <span>
                  <strong>reading:</strong> Days at the Morisaki Bookshop
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-accent">♥</span>
                <span>
                  <strong>drinking:</strong> iced oat matcha latte
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-accent">♥</span>
                <span>
                  <strong>listening:</strong> The Marías &amp; Nadin Amizah
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-accent">♥</span>
                <span>
                  <strong>mood:</strong> contemplative, serene
                </span>
              </li>
            </ul>
          </div>

          {/* Peaceful Playlist Mini Player */}
          <div className="bg-paper-card p-5 rounded-2xl delicate-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isPlayingAudio ? "bg-rose-accent animate-ping" : "bg-sage-accent"}`} />
                <span className="text-xs uppercase tracking-widest text-ink-faint">
                  companion audio
                </span>
              </div>
              <span className="text-xs text-sage-deep font-serif italic">
                songs for rainy mornings
              </span>
            </div>
            <div className="bg-paper p-3 rounded-xl border border-[#EDE5DA] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-soft flex items-center justify-center text-rose-deep font-serif italic text-sm">
                ♪
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-xs font-medium text-ink-deep truncate">
                  letters written at midnight
                </p>
                <p className="text-[11px] text-ink-faint truncate">
                  acoustic piano &amp; rain ambiance
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="w-7 h-7 rounded-full bg-paper-warm flex items-center justify-center text-xs text-ink-deep hover:bg-rose-accent hover:text-white transition"
                title={isPlayingAudio ? "Jeda audio" : "Putar suara relaksasi"}
              >
                {isPlayingAudio ? "❚❚" : "▶"}
              </button>
            </div>
          </div>

          {/* Gentle Language Sanctuary Badge */}
          <div className="p-5 border border-dashed border-[#DFD3C3] rounded-2xl text-center space-y-2">
            <p className="font-serif italic text-sm text-ink-deep">
              Bilingual writing companion
            </p>
            <p className="text-xs text-ink-muted leading-relaxed">
              Tulis dalam bahasa ibumu atau asah kemampuan bahasamu secara
              alami tanpa rasa takut dihakimi.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
