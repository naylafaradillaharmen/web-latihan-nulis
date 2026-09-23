"use client";

import { FileText, Trash2, ChevronRight, BookOpen } from "lucide-react";
import { BotanicalBranch } from "./FloralArt";

export default function HistoryList({
  entries,
  isLoading,
  activeEntryId,
  onSelectEntry,
  onDeleteSingle,
  onRequestDeleteAll,
}) {
  const formatDate = (dateObj) => {
    if (!dateObj) return "";
    try {
      const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d);
    } catch {
      return "";
    }
  };

  return (
    <section className="w-full rounded-2xl bg-white/80 backdrop-blur-md border border-palette-slate/30 p-5 sm:p-6 shadow-card hover:shadow-cardHover transition-all duration-300">
      {/* Header Riwayat Tulisan (Persis Gambar 1) */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-palette-slate/20">
        <div className="flex items-center gap-2 text-palette-deep">
          <BookOpen className="w-4 h-4 text-palette-periwinkle" />
          <h2 className="font-serif text-lg sm:text-xl font-semibold text-palette-deep tracking-wide">
            Riwayat Tulisan
          </h2>
          {entries && entries.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-palette-mist/70 text-palette-deep font-medium">
              {entries.length}
            </span>
          )}
        </div>

        {/* Tombol Hapus semua */}
        {entries && entries.length > 0 && (
          <button
            type="button"
            onClick={onRequestDeleteAll}
            className="inline-flex items-center gap-1.5 text-xs text-palette-slate hover:text-red-500 transition-colors py-1 px-2 rounded-lg hover:bg-red-50"
            title="Hapus semua riwayat tulisan saya"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus semua</span>
          </button>
        )}
      </div>

      {/* State Loading (Persis Card 'Loading state' Gambar 1) */}
      {isLoading && (
        <div className="space-y-3 py-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-palette-slate/20 bg-white/40 animate-shimmer"
            >
              <div className="w-8 h-8 rounded-lg bg-palette-mist/60 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-36 bg-palette-mist/70 rounded-md" />
                <div className="h-3 w-full bg-palette-mist/40 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* State Kosong (Persis Card 'Empty state' Gambar 1) */}
      {!isLoading && entries.length === 0 && (
        <div className="py-10 px-4 text-center flex flex-col items-center">
          {/* Cute Notebook Sketch Illustration with Botanical Leaf */}
          <div className="relative mb-3 flex items-center justify-center">
            <div className="w-16 h-20 rounded-xl bg-white border-2 border-palette-slate/40 shadow-soft flex flex-col p-2.5 justify-between rotate-[-3deg]">
              <div className="space-y-1.5 pt-1">
                <div className="h-1.5 w-7 bg-palette-sky/60 rounded" />
                <div className="h-1 w-10 bg-palette-slate/30 rounded" />
                <div className="h-1 w-8 bg-palette-slate/30 rounded" />
              </div>
              <div className="flex justify-end">
                <div className="w-3 h-3 rounded-full bg-palette-mist" />
              </div>
            </div>
            <div className="absolute -right-3 -top-1 opacity-80">
              <BotanicalBranch className="w-10 h-12" />
            </div>
          </div>

          <h3 className="font-serif text-base sm:text-lg font-semibold text-palette-deep mb-1">
            Belum ada tulisan tersimpan.
          </h3>
          <p className="text-xs sm:text-sm text-palette-slate max-w-sm">
            Mulai menulis sekarang dan simpan hasilnya di sini.
          </p>
        </div>
      )}

      {/* List Item Riwayat Tulisan (Persis Layout Item Gambar 1) */}
      {!isLoading && entries.length > 0 && (
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {entries.map((entry) => {
            const isSelected = activeEntryId === entry.id;
            return (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className={`group relative flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-palette-mist/50 border-palette-deep shadow-soft"
                    : "bg-white/50 hover:bg-white border-palette-slate/20 hover:border-palette-sky shadow-sm"
                }`}
              >
                {/* Left: Document Icon */}
                <div className="p-2 rounded-lg bg-palette-mist/60 text-palette-deep group-hover:bg-palette-sky/50 transition-colors shrink-0">
                  <FileText className="w-4 h-4 text-palette-deep" />
                </div>

                {/* Center: Metadata & Text Snippet */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-palette-deep">
                      {formatDate(entry.date)}
                    </span>
                    <span className="text-palette-slate text-xs">&bull;</span>
                    <span className="text-xs text-palette-slate font-medium">
                      {entry.wordCount || 0} kata
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-palette-deep/75 line-clamp-1 leading-relaxed">
                    {entry.text}
                  </p>
                </div>

                {/* Right: Actions (Delete individual on hover & Chevron Arrow) */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSingle(entry.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-palette-slate hover:text-red-500 rounded transition-all"
                    title="Hapus catatan ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-palette-slate group-hover:text-palette-deep group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
