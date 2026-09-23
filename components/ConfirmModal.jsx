"use client";

import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-palette-deep/30 backdrop-blur-sm transition-all">
      <div className="relative w-full max-w-sm rounded-2xl bg-white/95 p-6 shadow-cardHover border border-palette-slate/30 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-full text-palette-slate hover:text-palette-deep hover:bg-palette-mist/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon (Persis Card Gambar 1) */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="p-2 rounded-full bg-amber-50 text-amber-600 border border-amber-200/60">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-base sm:text-lg font-semibold text-palette-deep">
            {title || "Hapus semua tulisan?"}
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-palette-deep/70 leading-relaxed mb-5">
          {message || "Tindakan ini tidak bisa dibatalkan. Semua tulisanmu akan dihapus dari database."}
        </p>

        {/* Action Buttons: Batal & Hapus semua (Persis Gambar 1) */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-palette-deep bg-palette-mist/60 hover:bg-palette-mist border border-palette-slate/20 transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white bg-palette-deep hover:bg-palette-deepHover active:scale-95 transition-all shadow-soft disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isDeleting ? "Menghapus..." : "Hapus semua"}
          </button>
        </div>
      </div>
    </div>
  );
}
