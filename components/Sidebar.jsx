"use client";

import { Home, Clock, BookOpen } from "lucide-react";
import { LittleFlower } from "./FloralArt";

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-48 lg:w-56 shrink-0 py-2 pr-4">
        {/* Navigation Tabs */}
        <nav className="flex flex-col gap-2">
          {/* Tab Beranda */}
          <button
            type="button"
            onClick={() => onTabChange("beranda")}
            className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
              activeTab === "beranda"
                ? "text-palette-deep font-semibold"
                : "text-palette-deep/70 hover:text-palette-deep hover:bg-white/40"
            }`}
          >
            {/* Watercolor brush effect behind active tab */}
            {activeTab === "beranda" && (
              <span className="absolute inset-0 bg-gradient-to-r from-palette-mist/90 via-palette-sky/50 to-transparent rounded-xl -z-10 shadow-sm" />
            )}
            <Home
              className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                activeTab === "beranda" ? "text-palette-deep fill-palette-sky/30" : "text-palette-slate"
              }`}
            />
            <span>Beranda</span>
          </button>

          {/* Tab Riwayat */}
          <button
            type="button"
            onClick={() => onTabChange("riwayat")}
            className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
              activeTab === "riwayat"
                ? "text-palette-deep font-semibold"
                : "text-palette-deep/70 hover:text-palette-deep hover:bg-white/40"
            }`}
          >
            {activeTab === "riwayat" && (
              <span className="absolute inset-0 bg-gradient-to-r from-palette-mist/90 via-palette-sky/50 to-transparent rounded-xl -z-10 shadow-sm" />
            )}
            <Clock
              className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                activeTab === "riwayat" ? "text-palette-deep" : "text-palette-slate"
              }`}
            />
            <span>Riwayat</span>
          </button>
        </nav>

        {/* Motivational Handwritten Note at the bottom left (Image 1 style) */}
        <div className="pt-8 pb-4 pl-2 flex flex-col gap-1.5 opacity-90">
          <p className="font-hand text-base lg:text-lg text-palette-deep/80 leading-snug">
            Tidak harus sempurna, yang penting terus menulis &hearts;
          </p>
          <div className="pt-1">
            <LittleFlower className="w-9 h-12 text-palette-periwinkle" />
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Matching Image 1 Mobile Mockup) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-palette-slate/25 py-2 px-6 flex items-center justify-around shadow-soft">
        <button
          type="button"
          onClick={() => onTabChange("beranda")}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-colors ${
            activeTab === "beranda"
              ? "text-palette-deep font-semibold"
              : "text-palette-slate hover:text-palette-deep"
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === "beranda" ? "text-palette-deep fill-palette-sky/30" : ""}`} />
          <span className="text-[11px]">Beranda</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("riwayat")}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-colors ${
            activeTab === "riwayat"
              ? "text-palette-deep font-semibold"
              : "text-palette-slate hover:text-palette-deep"
          }`}
        >
          <Clock className={`w-5 h-5 ${activeTab === "riwayat" ? "text-palette-deep" : ""}`} />
          <span className="text-[11px]">Riwayat</span>
        </button>
      </div>
    </>
  );
}
