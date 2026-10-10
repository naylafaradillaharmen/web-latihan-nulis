"use client";

import { useAuth } from "../context/AuthContext";

export default function Header({ activeTab, onTabChange, onOpenAuth }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EDE6DC]">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo / Wordmark */}
        <div className="flex items-center space-x-6">
          <button
            type="button"
            onClick={() => onTabChange("journal")}
            className="group flex items-center gap-1.5 focus:outline-none"
          >
            <span className="font-serif text-2xl tracking-tight text-ink-deep font-normal italic">
              inkly
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-accent group-hover:scale-125 transition-transform" />
          </button>
          <span className="hidden sm:inline-block font-script text-lg text-ink-faint">
            little notes for the quiet hours ♡
          </span>
        </div>

        {/* 4 Navigation Links */}
        <nav className="flex items-center space-x-5 sm:space-x-7 text-xs uppercase tracking-widest text-ink-muted">
          <button
            type="button"
            onClick={() => onTabChange("journal")}
            className={`nav-link hover:text-ink-deep transition font-medium ${
              activeTab === "journal"
                ? "text-ink-deep underline underline-offset-8 decoration-rose-accent"
                : "text-ink-muted"
            }`}
          >
            journal
          </button>

          <button
            type="button"
            onClick={() => onTabChange("editor")}
            className={`nav-link hover:text-ink-deep transition font-medium ${
              activeTab === "editor"
                ? "text-ink-deep underline underline-offset-8 decoration-rose-accent"
                : "text-ink-muted"
            }`}
          >
            write
          </button>

          <button
            type="button"
            onClick={() => onTabChange("reading")}
            className={`nav-link hover:text-ink-deep transition font-medium ${
              activeTab === "reading"
                ? "text-ink-deep underline underline-offset-8 decoration-rose-accent"
                : "text-ink-muted"
            }`}
          >
            reading
          </button>

          <button
            type="button"
            onClick={() => onTabChange("settings")}
            className={`nav-link hover:text-ink-deep transition font-medium ${
              activeTab === "settings"
                ? "text-ink-deep underline underline-offset-8 decoration-rose-accent"
                : "text-ink-muted"
            }`}
          >
            settings
          </button>
        </nav>

        {/* Quick Actions */}
        <div className="flex items-center text-ink-muted">
          <button
            type="button"
            onClick={() => onTabChange("editor", true)}
            className="flex items-center gap-1.5 text-xs font-medium tracking-wide bg-rose-soft text-rose-deep hover:bg-rose-accent hover:text-white px-3 py-1.5 rounded-full transition shadow-xs"
          >
            <span>+</span>
            <span>write</span>
          </button>
        </div>
      </div>
    </header>
  );
}
