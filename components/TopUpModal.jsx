"use client";

import { X, Sparkles, ExternalLink } from "lucide-react";

export default function TopUpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-deep/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-paper-card delicate-border rounded-3xl p-8 sm:p-10 paper-shadow space-y-6 text-center animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-ink-faint hover:text-ink-deep rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5">
          <div className="w-10 h-10 mx-auto rounded-full bg-rose-soft text-rose-deep flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5 text-rose-accent" />
          </div>
          <span className="font-serif italic text-2xl text-ink-deep block">
            kuota token habis ♡
          </span>
          <p className="font-script text-lg text-rose-deep">
            your writing tutor needs a little refill.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-3 text-xs sm:text-sm text-ink-muted leading-relaxed font-light">
          <p>
            Batas token atau kuota penggunaan gratis dari <strong>Groq API</strong> telah mencapai limit saat ini.
          </p>
          <div className="p-3.5 rounded-xl bg-paper-warm/80 delicate-border text-left space-y-2 text-xs">
            <p className="font-medium text-ink-deep flex items-center gap-1.5">
              <span>✦</span> Cara Top Up &amp; Melanjutkan:
            </p>
            <ul className="list-disc list-inside space-y-1 text-ink-muted pl-1">
              <li>Tunggu reset kuota menit/harian dari Groq (otomatis).</li>
              <li>Atau buat API Key baru secara gratis di konsol Groq.</li>
              <li>Perbarui nilai <code className="bg-paper px-1 rounded text-rose-deep font-mono">GROQ_API_KEY</code> di file <code className="bg-paper px-1 rounded font-mono">.env.local</code>.</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-ink-deep hover:bg-rose-deep text-paper text-xs uppercase tracking-wider font-medium transition shadow-xs"
          >
            <span>Buka Konsol Groq (Buat Key Baru)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-full text-xs text-ink-muted hover:text-ink-deep transition font-medium"
          >
            Tutup &amp; Lanjut Menulis
          </button>
        </div>
      </div>
    </div>
  );
}
