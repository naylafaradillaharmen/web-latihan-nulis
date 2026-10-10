"use client";

import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isDeleting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-deep/30 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-3xl bg-paper-card p-6 delicate-border paper-shadow animate-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-full text-ink-faint hover:text-ink-deep transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="p-2 rounded-full bg-rose-soft text-rose-deep border border-rose-200">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-lg font-normal text-ink-deep">
            {title || "Hapus catatan ini?"}
          </h3>
        </div>

        <p className="text-xs text-ink-muted leading-relaxed mb-6 font-light">
          {message || "Tindakan ini tidak bisa dibatalkan."}
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-medium text-ink-muted hover:text-ink-deep bg-paper-warm border border-[#E8DFC8] transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-medium text-white bg-rose-deep hover:bg-rose-accent transition shadow-xs disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isDeleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
