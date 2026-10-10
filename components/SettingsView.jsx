"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { checkDailyAiUsage } from "../lib/firebase";

export default function SettingsView({
  totalEntries = 0,
  preferredLanguage,
  onChangePreferredLanguage,
  onOpenAuth,
}) {
  const { user, logout } = useAuth();
  const [dailyStatus, setDailyStatus] = useState({ used: false, loading: true });
  const [tutorTone, setTutorTone] = useState("gentle");

  useEffect(() => {
    async function loadStatus() {
      if (user) {
        setDailyStatus({ used: false, loading: true });
        const res = await checkDailyAiUsage(user.uid);
        setDailyStatus({ used: res.used, reviewedAt: res.reviewedAt, loading: false });
      } else {
        setDailyStatus({ used: false, loading: false });
      }
    }
    loadStatus();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center delicate-border rounded-3xl bg-paper-card p-8 paper-shadow space-y-4">
        <h2 className="font-serif text-3xl font-normal text-ink-deep">
          Sanctuary Settings
        </h2>
        <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
          Log in to configure your quiet space, bilingual preferences, and view
          your daily AI tutor quota.
        </p>
        <button
          type="button"
          onClick={() => onOpenAuth("login")}
          className="px-6 py-2.5 rounded-full bg-ink-deep text-paper text-xs uppercase tracking-wider font-medium hover:bg-rose-deep transition"
        >
          Enter Sanctuary
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-150">
      <div className="space-y-1 border-b border-[#EDE6DC] pb-4">
        <h2 className="font-serif text-3xl font-normal text-ink-deep">
          Sanctuary Settings
        </h2>
        <p className="text-xs text-ink-muted">
          Configure your quiet space, bilingual preferences, and reflection routines.
        </p>
      </div>

      <div className="space-y-8 divide-y divide-[#EFE7DC]">
        {/* Writing Languages */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-ink-deep font-semibold">
            Languages &amp; Practice
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => onChangePreferredLanguage("en")}
              className={`p-4 rounded-xl delicate-border text-left transition ${
                preferredLanguage === "en"
                  ? "bg-rose-soft/50 border-rose-accent/70"
                  : "bg-paper-card hover:bg-paper-warm/50"
              }`}
            >
              <span className="text-[11px] text-ink-faint uppercase font-medium">
                Primary Journaling
              </span>
              <p className="font-serif text-base text-ink-deep font-medium mt-0.5">
                English
              </p>
              <p className="text-xs text-ink-muted mt-1">
                Everyday thoughts &amp; poetic reflections
              </p>
            </button>

            <button
              type="button"
              onClick={() => onChangePreferredLanguage("id")}
              className={`p-4 rounded-xl delicate-border text-left transition ${
                preferredLanguage === "id"
                  ? "bg-rose-soft/50 border-rose-accent/70"
                  : "bg-paper-card hover:bg-paper-warm/50"
              }`}
            >
              <span className="text-[11px] text-rose-deep uppercase font-medium">
                Practice / Heritage
              </span>
              <p className="font-serif text-base text-ink-deep font-medium mt-0.5">
                Bahasa Indonesia
              </p>
              <p className="text-xs text-ink-muted mt-1">
                Gentle nuance &amp; vocabulary exploration
              </p>
            </button>
          </div>
        </div>

        {/* AI Tutor Companion Tone */}
        <div className="pt-6 space-y-4">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-ink-deep font-semibold">
              Tutor Persona &amp; Tone
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              How your bilingual writing companion provides feedback.
            </p>
          </div>
          <div className="space-y-2.5">
            <label
              onClick={() => setTutorTone("gentle")}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                tutorTone === "gentle"
                  ? "border-rose-200 bg-rose-soft/40"
                  : "border-[#EDE5DA] bg-paper-card hover:bg-paper-warm/40"
              }`}
            >
              <input
                type="radio"
                name="tone"
                checked={tutorTone === "gentle"}
                onChange={() => setTutorTone("gentle")}
                className="mt-1 text-rose-deep focus:ring-rose-deep"
              />
              <div>
                <span className="text-xs font-semibold text-ink-deep block">
                  Gentle &amp; Encouraging (Recommended)
                </span>
                <span className="text-xs text-ink-muted leading-relaxed">
                  Acts like a supportive literature penpal. Emphasizes mood, honesty, and emotional resonance.
                </span>
              </div>
            </label>

            <label
              onClick={() => setTutorTone("precision")}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                tutorTone === "precision"
                  ? "border-rose-200 bg-rose-soft/40"
                  : "border-[#EDE5DA] bg-paper-card hover:bg-paper-warm/40"
              }`}
            >
              <input
                type="radio"
                name="tone"
                checked={tutorTone === "precision"}
                onChange={() => setTutorTone("precision")}
                className="mt-1 text-rose-deep focus:ring-rose-deep"
              />
              <div>
                <span className="text-xs font-semibold text-ink-deep block">
                  Grammar &amp; Phrasing Precision
                </span>
                <span className="text-xs text-ink-muted leading-relaxed">
                  Focuses on natural collocations, formal accuracy, and vocabulary alternatives.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Daily Quota Status */}
        <div className="pt-6 space-y-2">
          <h3 className="text-xs uppercase tracking-widest text-ink-deep font-semibold">
            Daily AI Writing Review Quota
          </h3>
          <div className="p-4 rounded-xl bg-paper-warm/70 delicate-border space-y-1 text-xs">
            <p className="font-serif italic text-sm text-ink-deep">
              {dailyStatus.loading
                ? "Checking quota..."
                : dailyStatus.used
                ? "You've used today's AI review 🌷"
                : "1 AI Review Available Today ✨"}
            </p>
            <p className="text-ink-muted leading-relaxed">
              {dailyStatus.used
                ? "Keep writing freely as much as you like! Your AI review quota refreshes tomorrow."
                : "Click 'Review with AI Tutor' in the editor to receive delicate and natural feedback."}
            </p>
          </div>
        </div>

        {/* Account Info */}
        <div className="pt-6 space-y-3">
          <h3 className="text-xs uppercase tracking-widest text-ink-deep font-semibold">
            Account Sanctuary
          </h3>
          <div className="p-4 rounded-xl bg-paper-card delicate-border space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-ink-faint">Email</span>
              <span className="text-ink-deep font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-faint">Preserved Entries</span>
              <span className="text-ink-deep font-medium">{totalEntries} writings</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-faint">User ID</span>
              <span className="text-ink-muted font-mono truncate max-w-[200px]">
                {user.uid}
              </span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="pt-6">
          <button
            type="button"
            onClick={logout}
            className="px-5 py-2.5 rounded-full border border-rose-300 text-rose-deep hover:bg-rose-soft/60 text-xs font-medium uppercase tracking-wider transition"
          >
            Leave Sanctuary (Log Out)
          </button>
        </div>
      </div>
    </div>
  );
}
