"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { BotanicalBranch } from "./FloralArt";

export default function Header() {
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setCurrentDate(formatter.format(now));
  }, []);

  return (
    <header className="relative w-full pt-4 pb-4">
      {/* Soft watercolor splash in top-right corner */}
      <div className="absolute top-0 right-0 w-44 h-24 bg-gradient-to-bl from-palette-sky/35 via-palette-mist/40 to-transparent rounded-bl-[4rem] pointer-events-none blur-sm" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Logo Pensil & Brand Title "WEB LATIHAN NULIS" */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-card border border-palette-slate/30 bg-white flex items-center justify-center p-1 flex-shrink-0 group hover:scale-105 transition-transform duration-200">
            <img
              src="/logo.jpg"
              alt="Logo Web Latihan Nulis"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl tracking-[0.24em] font-semibold text-palette-deep uppercase">
              Web Latihan Nulis
            </h1>
            <p className="text-[11px] sm:text-xs tracking-[0.3em] font-medium text-palette-periwinkle uppercase mt-0.5">
              Tulis &bull; Pikir &bull; Tumbuh
            </p>
          </div>
        </div>

        {/* Center / Right: Date & Quote */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-start lg:self-auto">
          {/* Tanggal Hari Ini */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-palette-slate/30 shadow-card text-xs sm:text-sm text-palette-deep font-medium backdrop-blur-sm">
            <Calendar className="w-3.5 h-3.5 text-palette-periwinkle" />
            <span>{currentDate || "Memuat tanggal..."}</span>
          </div>

          {/* Inspirational Quote with Floral illustration */}
          <div className="hidden sm:flex items-center gap-2 pr-2">
            <BotanicalBranch className="w-8 h-10 flex-shrink-0" />
            <p className="font-hand text-base sm:text-lg text-palette-deep/80 leading-tight max-w-[200px]">
              Tulisan kecil hari ini, bisa jadi perubahan besar nanti.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
