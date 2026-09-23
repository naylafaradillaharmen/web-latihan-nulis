"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Calendar } from "lucide-react";
import { PROMPTS, getPromptForDay } from "../lib/prompts";
import { BotanicalBranch } from "./FloralArt";

export default function PromptCard({ onSelectVariation }) {
  const [dayIndex, setDayIndex] = useState(1);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    const today = new Date().getDay();
    setDayIndex(today);
  }, []);

  const dayData = PROMPTS[dayIndex] || PROMPTS[0];
  const items = dayData.items;

  const handleNextPrompt = () => {
    setIsRotating(true);
    setTimeout(() => {
      const nextIdx = (activeItemIndex + 1) % items.length;
      setActiveItemIndex(nextIdx);
      if (typeof onSelectVariation === "function") {
        onSelectVariation(dayData.kind, items[nextIdx]);
      }
      setIsRotating(false);
    }, 180);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-md border border-palette-slate/30 p-5 sm:p-6 shadow-card hover:shadow-cardHover transition-all duration-300">
      {/* Background delicate watercolor glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-palette-sky/20 rounded-full blur-2xl pointer-events-none" />

      {/* Floral illustration in the right corner (Image 1 style) */}
      <div className="absolute right-3 bottom-2 pointer-events-none opacity-85 hidden sm:block">
        <BotanicalBranch className="w-16 h-20" />
      </div>

      {/* Header bar: "PROMPT HARI INI" & "Ganti prompt" */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-1.5 text-palette-periwinkle text-xs font-semibold tracking-wider uppercase mb-1">
            <Calendar className="w-3.5 h-3.5 text-palette-periwinkle" />
            <span>Prompt Hari Ini</span>
          </div>

          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl text-palette-deep font-semibold tracking-wide">
            {dayData.kind}
          </h2>
        </div>

        {/* Tombol Ganti prompt */}
        <button
          type="button"
          onClick={handleNextPrompt}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-white bg-palette-deep hover:bg-palette-deepHover active:scale-95 shadow-soft transition-all duration-200 shrink-0"
          title="Ganti ke variasi prompt lainnya untuk hari ini"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 transition-transform duration-300 ${
              isRotating ? "rotate-180" : ""
            }`}
          />
          <span>Ganti prompt</span>
        </button>
      </div>

      {/* List Prompt Berbutir 1 dan 2 (Persis Gambar 1) */}
      <div className="mt-4 space-y-2.5 relative z-10 max-w-[85%]">
        {items.map((promptText, idx) => {
          const isActive = idx === activeItemIndex;
          return (
            <div
              key={idx}
              onClick={() => {
                setActiveItemIndex(idx);
                if (typeof onSelectVariation === "function") {
                  onSelectVariation(dayData.kind, promptText);
                }
              }}
              className={`flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed p-2.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "bg-palette-mist/60 text-palette-deep font-medium border border-palette-sky/50"
                  : "text-palette-deep/75 hover:bg-palette-canvas/80 hover:text-palette-deep"
              }`}
            >
              <span
                className={`font-semibold shrink-0 text-xs px-1.5 py-0.5 rounded-md ${
                  isActive
                    ? "bg-palette-sky text-palette-deep"
                    : "bg-palette-slate/20 text-palette-periwinkle"
                }`}
              >
                {idx + 1}.
              </span>
              <p>{promptText}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
