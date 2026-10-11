"use client";

import { useState, useMemo, useEffect } from "react";
import { Trash2, RefreshCw, Pencil, Check, X, Volume2, VolumeX, Sparkles } from "lucide-react";
import { getAmbientSoundEngine } from "../lib/ambientAudio";

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

  // 1. Daily Poetic Spark (AI-Generated or Curated Daily Quote)
  const [dailySpark, setDailySpark] = useState({
    quote: "remember: you are allowed to outgrow people, places, and old versions of yourself ♡",
    meaning: "Bertumbuh sering kali terasa sepi, tapi melepaskan adalah caramu memberi ruang bagi ketenangan baru.",
    prompt: "Ceritakan tentang satu hal yang perlahan mulai kamu relakan belakangan ini.",
    author: "quiet reassurance",
  });
  const [isLoadingSpark, setIsLoadingSpark] = useState(false);

  // 2. Personal Mood & Habit Tracker ('currently ♡')
  const DEFAULT_CURRENTLY = {
    reading: "Days at the Morisaki Bookshop",
    drinking: "iced oat matcha latte",
    listening: "The Marías & Nadin Amizah",
    mood: "contemplative, serene",
  };
  const [currentlyData, setCurrentlyData] = useState(DEFAULT_CURRENTLY);
  const [isEditingCurrently, setIsEditingCurrently] = useState(false);
  const [currentlyForm, setCurrentlyForm] = useState(DEFAULT_CURRENTLY);

  // 3. Real Ambient Audio Synthesizer
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPreset, setAudioPreset] = useState("rain"); // "rain" | "waves" | "breeze"
  const [audioVolume, setAudioVolume] = useState(0.45);
  const [isMuted, setIsMuted] = useState(false);

  // Load saved 'currently' data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("inkly_currently_status");
      if (saved) {
        const parsed = JSON.parse(saved);
        setCurrentlyData((prev) => ({ ...prev, ...parsed }));
        setCurrentlyForm((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch or restore today's AI poetic quote
  const fetchSpark = async (force = false) => {
    const todayKey = new Date().toISOString().split("T")[0];
    const cacheKey = `inkly_daily_spark_${todayKey}`;

    if (!force) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.quote) {
            setDailySpark(parsed);
            return;
          }
        }
      } catch {
        // ignore
      }
    }

    setIsLoadingSpark(true);
    try {
      const res = await fetch("/api/ai/daily-quote");
      const data = await res.json();
      if (data?.spark?.quote) {
        setDailySpark(data.spark);
        localStorage.setItem(cacheKey, JSON.stringify(data.spark));
      }
    } catch (err) {
      console.warn("Could not fetch daily spark:", err);
    } finally {
      setIsLoadingSpark(false);
    }
  };

  useEffect(() => {
    fetchSpark(false);
  }, []);

  // Audio Engine Management
  const toggleAudio = (presetOverride) => {
    const engine = getAmbientSoundEngine();
    if (!engine) return;

    const presetToPlay = presetOverride || audioPreset;

    if (isPlayingAudio && !presetOverride) {
      engine.stop();
      setIsPlayingAudio(false);
    } else {
      engine.setVolume(isMuted ? 0 : audioVolume);
      engine.play(presetToPlay);
      setAudioPreset(presetToPlay);
      setIsPlayingAudio(true);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setAudioVolume(val);
    const engine = getAmbientSoundEngine();
    if (engine) engine.setVolume(val);
    if (val > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    const engine = getAmbientSoundEngine();
    if (!engine) return;
    if (isMuted) {
      setIsMuted(false);
      engine.setVolume(audioVolume);
    } else {
      setIsMuted(true);
      engine.setVolume(0);
    }
  };

  // Stop audio when component unmounts
  useEffect(() => {
    return () => {
      const engine = getAmbientSoundEngine();
      if (engine && engine.isPlaying) {
        engine.stop();
      }
    };
  }, []);

  // Save edited currently status
  const handleSaveCurrently = (e) => {
    e.preventDefault();
    setCurrentlyData(currentlyForm);
    localStorage.setItem("inkly_currently_status", JSON.stringify(currentlyForm));
    setIsEditingCurrently(false);
  };

  // Quick writing starters
  const handleWriteFromCurrently = () => {
    const starterText = `Catatan hening hari ini:\n\nSambil menikmati ${currentlyData.drinking} dan membaca ${currentlyData.reading}, alunan musik dari ${currentlyData.listening} menemani suasana hatiku yang ${currentlyData.mood}.\n\n`;
    onNewWriting(starterText, "Catatan Hari Ini");
  };

  const handleWriteFromSpark = () => {
    const starterText = `"${dailySpark.quote}"\n\n— ${dailySpark.author}\n\n${dailySpark.prompt}\n\n`;
    onNewWriting(starterText, "Refleksi Harian");
  };

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
          {/* Card 1: Daily AI Poetic Spark Note */}
          <div className="bg-[#F5EFE6] p-6 rounded-2xl delicate-border paper-shadow relative overflow-hidden group space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFC8]/60 pb-2">
              <span className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-rose-accent" />
                <span>Daily Writing Spark · AI</span>
              </span>
              <button
                type="button"
                onClick={() => fetchSpark(true)}
                disabled={isLoadingSpark}
                title="Dapatkan kutipan/inspirasi baru"
                className="w-6 h-6 rounded-full flex items-center justify-center text-ink-faint hover:text-ink-deep hover:bg-[#EBE2D5] transition disabled:opacity-40"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingSpark ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="w-12 h-1.5 bg-[#E2D2BE]/60 rounded-sm mx-auto" />

            <p className="font-script text-2xl sm:text-3xl text-rose-deep leading-relaxed text-center">
              &ldquo;{dailySpark.quote}&rdquo;
            </p>

            {dailySpark.meaning && (
              <p className="text-xs text-ink-muted leading-relaxed text-center font-light italic font-serif">
                {dailySpark.meaning}
              </p>
            )}

            <div className="pt-2 flex items-center justify-between text-[11px] border-t border-[#E8DFC8]/60">
              <span className="text-ink-faint italic font-serif truncate max-w-[150px]">
                — {dailySpark.author}
              </span>
              <button
                type="button"
                onClick={handleWriteFromSpark}
                className="inline-flex items-center gap-1 text-rose-deep hover:text-ink-deep font-medium transition"
              >
                <span>Jadikan ide nulis</span>
                <span>✎</span>
              </button>
            </div>
          </div>

          {/* Card 2: Personal Mood & Habit Tracker ('currently ♡') */}
          <div className="bg-paper-card p-6 rounded-2xl delicate-border space-y-4 paper-shadow">
            <div className="flex items-center justify-between border-b border-[#F0E8DC] pb-2.5">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base italic text-ink-deep">
                  currently ♡
                </h3>
                <span className="text-xs text-rose-accent">✿</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isEditingCurrently) {
                    setIsEditingCurrently(false);
                    setCurrentlyForm(currentlyData);
                  } else {
                    setCurrentlyForm(currentlyData);
                    setIsEditingCurrently(true);
                  }
                }}
                className="inline-flex items-center gap-1 text-[11px] text-ink-faint hover:text-rose-deep transition"
                title={isEditingCurrently ? "Batal edit" : "Edit status saat ini"}
              >
                {isEditingCurrently ? (
                  <>
                    <X className="w-3 h-3" />
                    <span>Batal</span>
                  </>
                ) : (
                  <>
                    <Pencil className="w-3 h-3" />
                    <span>Edit</span>
                  </>
                )}
              </button>
            </div>

            {isEditingCurrently ? (
              <form onSubmit={handleSaveCurrently} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-ink-faint mb-1">
                    📖 Reading
                  </label>
                  <input
                    type="text"
                    value={currentlyForm.reading}
                    onChange={(e) => setCurrentlyForm({ ...currentlyForm, reading: e.target.value })}
                    className="w-full text-xs rounded-xl border-[#E5DDD2] bg-[#FAF7F2] p-2 text-ink-deep focus:border-rose-deep outline-none"
                    placeholder="Buku yang sedang dibaca..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-ink-faint mb-1">
                    🍵 Drinking
                  </label>
                  <input
                    type="text"
                    value={currentlyForm.drinking}
                    onChange={(e) => setCurrentlyForm({ ...currentlyForm, drinking: e.target.value })}
                    className="w-full text-xs rounded-xl border-[#E5DDD2] bg-[#FAF7F2] p-2 text-ink-deep focus:border-rose-deep outline-none"
                    placeholder="Minuman favorit saat ini..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-ink-faint mb-1">
                    🎧 Listening
                  </label>
                  <input
                    type="text"
                    value={currentlyForm.listening}
                    onChange={(e) => setCurrentlyForm({ ...currentlyForm, listening: e.target.value })}
                    className="w-full text-xs rounded-xl border-[#E5DDD2] bg-[#FAF7F2] p-2 text-ink-deep focus:border-rose-deep outline-none"
                    placeholder="Lagu / musisi yang diputar..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-ink-faint mb-1">
                    ☁️ Mood
                  </label>
                  <input
                    type="text"
                    value={currentlyForm.mood}
                    onChange={(e) => setCurrentlyForm({ ...currentlyForm, mood: e.target.value })}
                    className="w-full text-xs rounded-xl border-[#E5DDD2] bg-[#FAF7F2] p-2 text-ink-deep focus:border-rose-deep outline-none"
                    placeholder="Suasana hati (misal: tenang, damai)..."
                  />
                </div>

                <div className="pt-1 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingCurrently(false);
                      setCurrentlyForm(currentlyData);
                    }}
                    className="px-3 py-1.5 rounded-lg text-[11px] text-ink-faint hover:text-ink-deep"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-ink-deep hover:bg-rose-deep text-paper text-[11px] font-medium transition"
                  >
                    <Check className="w-3 h-3" />
                    <span>Simpan status</span>
                  </button>
                </div>
              </form>
            ) : (
              <>
                <ul className="text-xs space-y-2.5 text-ink-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-accent">♥</span>
                    <span>
                      <strong>reading:</strong> {currentlyData.reading || "quiet pages"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-accent">♥</span>
                    <span>
                      <strong>drinking:</strong> {currentlyData.drinking || "warm tea"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-accent">♥</span>
                    <span>
                      <strong>listening:</strong> {currentlyData.listening || "soft raindrops"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-accent">♥</span>
                    <span>
                      <strong>mood:</strong> {currentlyData.mood || "serene"}
                    </span>
                  </li>
                </ul>

                <div className="pt-2 border-t border-[#F0E8DC] text-right">
                  <button
                    type="button"
                    onClick={handleWriteFromCurrently}
                    className="inline-flex items-center gap-1.5 text-[11px] text-rose-deep hover:text-ink-deep font-medium transition"
                  >
                    <span>Tulis tentang hari ini</span>
                    <span>✎</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Card 3: Real Ambient Sound Synthesizer */}
          <div className="bg-paper-card p-5 rounded-2xl delicate-border space-y-3.5 paper-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isPlayingAudio ? "bg-rose-accent animate-ping" : "bg-sage-accent"
                  }`}
                />
                <span className="text-xs uppercase tracking-widest text-ink-faint">
                  companion audio
                </span>
              </div>
              <span className="text-xs text-sage-deep font-serif italic">
                {audioPreset === "rain" && "gentle raindrops"}
                {audioPreset === "waves" && "soft ocean tides"}
                {audioPreset === "breeze" && "whispering wind"}
              </span>
            </div>

            {/* Ambient Sound Mode Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#F5EFE6] rounded-xl text-xs">
              <button
                type="button"
                onClick={() => toggleAudio("rain")}
                className={`py-1.5 px-2 rounded-lg transition text-[11px] flex items-center justify-center gap-1 font-medium ${
                  audioPreset === "rain"
                    ? "bg-white text-ink-deep shadow-xs"
                    : "text-ink-faint hover:text-ink-deep"
                }`}
              >
                <span>🌧️</span>
                <span>Rain</span>
              </button>
              <button
                type="button"
                onClick={() => toggleAudio("waves")}
                className={`py-1.5 px-2 rounded-lg transition text-[11px] flex items-center justify-center gap-1 font-medium ${
                  audioPreset === "waves"
                    ? "bg-white text-ink-deep shadow-xs"
                    : "text-ink-faint hover:text-ink-deep"
                }`}
              >
                <span>🌊</span>
                <span>Waves</span>
              </button>
              <button
                type="button"
                onClick={() => toggleAudio("breeze")}
                className={`py-1.5 px-2 rounded-lg transition text-[11px] flex items-center justify-center gap-1 font-medium ${
                  audioPreset === "breeze"
                    ? "bg-white text-ink-deep shadow-xs"
                    : "text-ink-faint hover:text-ink-deep"
                }`}
              >
                <span>🍃</span>
                <span>Breeze</span>
              </button>
            </div>

            {/* Audio Player Strip */}
            <div className="bg-paper p-3 rounded-xl border border-[#EDE5DA] flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-serif text-sm transition-colors duration-300 ${
                  isPlayingAudio
                    ? "bg-rose-deep text-white shadow-xs"
                    : "bg-rose-soft text-rose-deep"
                }`}
              >
                {isPlayingAudio ? (
                  <div className="flex items-center gap-0.5 h-3.5">
                    <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:0ms] h-full" />
                    <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:150ms] h-3" />
                    <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:300ms] h-full" />
                  </div>
                ) : (
                  "♪"
                )}
              </div>

              <div className="flex-grow min-w-0">
                <p className="text-xs font-medium text-ink-deep truncate">
                  {audioPreset === "rain" && "rain on windowpane"}
                  {audioPreset === "waves" && "calm shoreline waves"}
                  {audioPreset === "breeze" && "quiet autumn breeze"}
                </p>
                <p className="text-[11px] text-ink-faint truncate">
                  {isPlayingAudio ? "playing live soundscape" : "tap play to listen"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleAudio()}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition shadow-xs ${
                  isPlayingAudio
                    ? "bg-rose-deep text-white hover:bg-rose-accent"
                    : "bg-paper-warm text-ink-deep hover:bg-rose-accent hover:text-white"
                }`}
                title={isPlayingAudio ? "Jeda audio" : "Putar suara ambient"}
              >
                {isPlayingAudio ? "❚❚" : "▶"}
              </button>
            </div>

            {/* Volume Control Slider */}
            {isPlayingAudio && (
              <div className="flex items-center gap-2 pt-1 px-1 text-xs text-ink-faint animate-in fade-in duration-200">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="hover:text-ink-deep transition"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || audioVolume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-rose-deep" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : audioVolume}
                  onChange={handleVolumeChange}
                  className="w-full accent-rose-deep h-1 bg-[#E5DDD2] rounded-lg cursor-pointer"
                />
                <span className="text-[10px] w-6 text-right font-mono">
                  {isMuted ? "0%" : `${Math.round(audioVolume * 100)}%`}
                </span>
              </div>
            )}
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
