"use client";

import { CheckCircle2, AlertCircle, X } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed bottom-16 md:bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-md border border-palette-slate/30 shadow-cardHover transition-all animate-bounce-short">
      <div
        className={`p-1.5 rounded-full ${
          isSuccess ? "bg-palette-sky/40 text-palette-deep" : "bg-red-100 text-red-600"
        }`}
      >
        {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      </div>
      <p className="text-xs sm:text-sm font-medium text-palette-deep">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-palette-slate hover:text-palette-deep p-1 rounded-full transition-colors ml-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
