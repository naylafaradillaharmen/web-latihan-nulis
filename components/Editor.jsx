"use client";

import { useEffect, useRef, useState } from "react";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Lightbulb,
  Sparkles,
  Save,
  Check,
  CheckCheck,
  Copy,
} from "lucide-react";
import { getPromptForDay } from "../lib/prompts";

export default function Editor({
  title,
  setTitle,
  content,
  setContent,
  language,
  setLanguage,
  onSave,
  isSaving,
  activeEntryId,
  onNewWriting,
  onReviewWithAi,
  isAiReviewing,
  aiReviewData,
  dailyAiUsed,
  onApplyRevisedText,
  onBackToSanctuary,
  user,
  onOpenAuth,
}) {
  const textareaRef = useRef(null);
  const [fontFamily, setFontFamily] = useState("serif"); // "serif" | "sans"
  const [showPromptDrawer, setShowPromptDrawer] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [copiedRevised, setCopiedRevised] = useState(false);

  // Timer states
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Prompt state
  const [promptData, setPromptData] = useState(null);
  const [promptVariation, setPromptVariation] = useState(0);

  // Initialize today's prompt
  useEffect(() => {
    const today = new Date().getDay();
    setPromptData(getPromptForDay(today, promptVariation));
  }, [promptVariation]);

  // Auto-resize textarea to fit content naturally
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(280, textareaRef.current.scrollHeight)}px`;
    }
  }, [content]);

  // Timer countdown logic
  useEffect(() => {
    let interval = null;
    if (isTimerActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, secondsLeft]);

  const toggleTimer = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(timerMinutes * 60);
      setIsTimerActive(true);
    } else {
      setIsTimerActive(!isTimerActive);
    }
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setSecondsLeft(timerMinutes * 60);
  };

  const handleSelectMinutes = (m) => {
    setTimerMinutes(m);
    setSecondsLeft(m * 60);
    setIsTimerActive(false);
  };

  const formatTimer = () => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Word count & read time
  const trimmed = (content || "").trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  // Current formatted date & time
  const [dateTimeString, setDateTimeString] = useState("");
  useEffect(() => {
    const now = new Date();
    const dateFormatted = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(now);
    const timeFormatted = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(now);
    setDateTimeString(`${dateFormatted} — ${timeFormatted}`);
  }, []);

  const handleCopyRevised = () => {
    if (aiReviewData?.revised) {
      navigator.clipboard.writeText(aiReviewData.revised);
      setCopiedRevised(true);
      setTimeout(() => setCopiedRevised(false), 2000);
    }
  };

  const handleClear = () => {
    if (confirm("Clear writing canvas for a fresh quiet sheet?")) {
      onNewWriting();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Editor Top Toolbar */}
      <div className="flex items-center justify-between border-b border-[#EDE6DC] pb-4">
        <button
          type="button"
          onClick={onBackToSanctuary}
          className="text-xs uppercase tracking-widest text-ink-faint hover:text-ink-deep flex items-center gap-1.5 transition"
        >
          <span>←</span>
          <span>back to sanctuary</span>
        </button>

        {/* Language Pill Switcher & Autosave */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#EFE7DC] p-0.5 rounded-full text-xs">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 rounded-full transition ${
                language === "en"
                  ? "bg-paper-card font-medium text-ink-deep shadow-xs"
                  : "text-ink-muted hover:text-ink-deep"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage("id")}
              className={`px-3 py-1 rounded-full transition ${
                language === "id"
                  ? "bg-paper-card font-medium text-ink-deep shadow-xs"
                  : "text-ink-muted hover:text-ink-deep"
              }`}
            >
              Bahasa Indonesia
            </button>
          </div>
          <span className="hidden sm:inline text-xs text-ink-faint font-serif italic">
            {activeEntryId ? "Editing entry" : "Fresh canvas"} · {wordCount} words
          </span>
        </div>
      </div>

      {/* Accessories Bar: Prompts & Timer */}
      <div className="flex items-center justify-between text-xs text-ink-muted px-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPromptDrawer(!showPromptDrawer)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-paper-warm/80 hover:bg-paper-warm border border-[#E8DFC8] text-ink-deep transition"
          >
            <Lightbulb className="w-3.5 h-3.5 text-rose-accent" />
            <span>{showPromptDrawer ? "Close inspiration" : "Quiet prompt"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTimer(!showTimer)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#E8DFC8] transition ${
              showTimer
                ? "bg-paper-warm text-ink-deep font-medium"
                : "bg-paper-warm/50 hover:bg-paper-warm text-ink-muted"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-sage-accent" />
            <span>{isTimerActive ? formatTimer() : "Focus timer"}</span>
          </button>
        </div>
      </div>

      {/* Inspiration Drawer */}
      {showPromptDrawer && promptData && (
        <div className="p-4 rounded-2xl bg-paper-warm delicate-border paper-shadow animate-in fade-in duration-150 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-deep uppercase tracking-wider">
              {promptData.kind}
            </span>
            <button
              type="button"
              onClick={() => setPromptVariation((prev) => prev + 1)}
              className="text-[11px] text-ink-muted hover:text-ink-deep transition"
            >
              Another prompt &rarr;
            </button>
          </div>
          <p className="text-xs sm:text-sm text-ink-deep leading-relaxed font-serif italic">
            &ldquo;{promptData.text}&rdquo;
          </p>
        </div>
      )}

      {/* Focus Timer Drawer */}
      {showTimer && (
        <div className="p-3.5 rounded-2xl bg-paper-card delicate-border paper-shadow flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-semibold text-ink-deep bg-paper-warm px-3 py-1 rounded-xl">
              {formatTimer()}
            </span>
            <div className="flex items-center gap-1 text-[11px]">
              {[5, 10, 15, 25].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelectMinutes(m)}
                  className={`px-2 py-0.5 rounded-lg transition ${
                    timerMinutes === m
                      ? "bg-rose-accent text-white font-medium"
                      : "text-ink-muted hover:bg-paper-warm"
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetTimer}
              className="p-1.5 text-ink-faint hover:text-ink-deep rounded-lg"
              title="Reset timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleTimer}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-ink-deep text-paper text-xs font-medium hover:bg-rose-deep transition"
            >
              {isTimerActive ? (
                <Pause className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3 fill-current" />
              )}
              <span>{isTimerActive ? "Pause" : "Start"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Journal Page Container (Notebook feel) */}
      <div className="bg-paper-card delicate-border rounded-3xl p-6 sm:p-12 paper-shadow space-y-6">
        {/* Metadata Header: Date & Quiet Atmosphere */}
        <div className="flex flex-wrap items-center justify-between text-xs text-ink-faint pb-4 border-b border-[#F6EFE6]">
          <div className="flex items-center gap-2">
            <span className="text-rose-accent">✿</span>
            <span className="font-serif italic text-sm text-ink-deep">
              {dateTimeString || "Quiet moment"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setFontFamily(fontFamily === "serif" ? "sans" : "serif")
              }
              className="text-xs text-ink-muted hover:text-ink-deep px-2.5 py-0.5 border border-[#EDE5DA] rounded-md transition"
              title="Toggle Serif / Sans"
            >
              {fontFamily === "serif" ? "Serif" : "Sans"}
            </button>
          </div>
        </div>

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title of this quiet thought..."
          className={`w-full bg-transparent border-0 p-0 text-3xl sm:text-4xl text-ink-deep focus:ring-0 focus:outline-none placeholder:text-ink-faint/50 font-normal ${
            fontFamily === "serif" ? "font-serif" : "font-sans"
          }`}
        />

        {/* Writing Canvas / Textarea */}
        <div className="pt-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              language === "id"
                ? "Biarkan pikiranmu mengalir tenang ke atas lembaran kertas ini..."
                : "Let your thoughts fall gently onto the page..."
            }
            className={`w-full min-h-[280px] bg-transparent border-0 p-0 text-base sm:text-lg text-ink-deep leading-relaxed focus:ring-0 focus:outline-none placeholder:text-ink-faint/50 resize-none font-normal ${
              fontFamily === "serif" ? "font-serif" : "font-sans"
            }`}
          />
        </div>

        {/* Margin Handwritten Note Accent */}
        <div className="pt-6 border-t border-[#F5EFE6] flex flex-wrap items-center justify-between gap-2">
          <span className="font-script text-lg text-rose-deep">
            &ldquo;be gentle with the prose of your own heart.&rdquo;
          </span>
          <span className="text-xs text-ink-faint font-mono">
            {wordCount} words · ~{readTimeMin} min read
          </span>
        </div>
      </div>

      {/* Floating Bottom Action Dock */}
      <div className="sticky bottom-6 flex items-center justify-between bg-[#FAF7F2]/95 backdrop-blur-md p-3 px-5 rounded-2xl delicate-border shadow-md max-w-xl mx-auto z-30">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !trimmed}
            className="px-4 py-2 rounded-xl text-xs uppercase tracking-wider text-ink-muted hover:text-ink-deep hover:bg-paper-warm transition font-medium disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 rounded-xl text-xs text-ink-faint hover:text-rose-deep transition"
          >
            Clear
          </button>
        </div>

        <button
          type="button"
          onClick={onReviewWithAi}
          disabled={isAiReviewing || !trimmed}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs tracking-wider uppercase font-medium transition shadow-xs ${
            dailyAiUsed
              ? "bg-paper-warm text-ink-muted border border-[#DFD5C6] cursor-pointer"
              : "bg-rose-deep text-white hover:bg-rose-accent active:scale-95"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={
            dailyAiUsed
              ? "Kamu telah menggunakan kuota 1 AI review hari ini."
              : "Review with AI Tutor"
          }
        >
          {isAiReviewing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              <span>Reviewing...</span>
            </>
          ) : (
            <>
              <span>Review with AI Tutor</span>
              <span>✎</span>
            </>
          )}
        </button>
      </div>

      {/* AI Writing Tutor Feedback Card (when review is present) */}
      {aiReviewData && (
        <div className="bg-paper-card delicate-border rounded-3xl p-6 sm:p-8 paper-shadow space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#F0E8DC] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-accent" />
              <h3 className="font-serif text-lg text-ink-deep">
                Tutor Feedback &amp; Resonance
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyRevised}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-ink-muted hover:text-ink-deep rounded-lg hover:bg-paper-warm transition"
              >
                {copiedRevised ? (
                  <Check className="w-3.5 h-3.5 text-sage-deep" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedRevised ? "Copied" : "Copy"}</span>
              </button>
              {onApplyRevisedText && (
                <button
                  type="button"
                  onClick={() => onApplyRevisedText(aiReviewData.revised)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-soft text-rose-deep hover:bg-rose-accent hover:text-white text-xs font-medium transition"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Accept Nuance</span>
                </button>
              )}
            </div>
          </div>

          {/* Side by side / Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm leading-relaxed">
            <div className="p-4 rounded-2xl bg-paper delicate-border space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-ink-faint font-medium block">
                Original Draft
              </span>
              <p className="font-serif text-ink-muted">{content}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F8F4EE] border border-rose-200/60 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-rose-deep font-semibold block">
                More Natural Flow &amp; Cadence
              </span>
              <p className="font-serif text-ink-deep">{aiReviewData.revised}</p>
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-1.5">
            <h4 className="text-xs uppercase tracking-wider text-ink-deep font-semibold">
              Why this flows more warmly
            </h4>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-light">
              {aiReviewData.explanation}
            </p>
          </div>

          {/* Gentle Habit Tip */}
          <div className="p-4 rounded-xl bg-paper-warm/70 border border-[#E8DFC8] flex items-start gap-3">
            <span className="text-rose-accent text-sm mt-0.5">✦</span>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-deep">
                A little practice for tomorrow&apos;s entry
              </p>
              <p className="text-xs text-ink-muted leading-relaxed">
                {aiReviewData.tip}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
