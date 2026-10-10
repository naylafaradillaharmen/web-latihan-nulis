"use client";

import { CheckCircle2, AlertCircle, X } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed bottom-16 md:bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-paper-card/95 backdrop-blur-md delicate-border paper-shadow transition-all animate-bounce-short">
      <div
        className={`p-1.5 rounded-full ${
          isSuccess ? "bg-sage-soft text-sage-deep" : "bg-rose-soft text-rose-deep"
        }`}
      >
        {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      </div>
      <p className="text-xs sm:text-sm font-medium text-ink-deep font-sans">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-ink-faint hover:text-ink-deep p-1 rounded-full transition-colors ml-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
