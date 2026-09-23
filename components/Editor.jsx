"use client";

import { useEffect, useRef, useState } from "react";
import { PenTool, Save, Play, Pause, RotateCcw, Clock, ChevronDown, Check } from "lucide-react";

const DURATION_OPTIONS = [
  { label: "3 Menit", minutes: 3, desc: "Latihan Kilat" },
  { label: "5 Menit", minutes: 5, desc: "Sesi Ringkas" },
  { label: "10 Menit", minutes: 10, desc: "Default / Rekomendasi" },
  { label: "15 Menit", minutes: 15, desc: "Eksplorasi Paragraf" },
  { label: "20 Menit", minutes: 20, desc: "Free Writing Panjang" },
  { label: "30 Menit", minutes: 30, desc: "Sesi Mendalam" },
];

export default function Editor({
  text,
  setText,
  promptCategory,
  onSave,
  isSaving,
  activeEntryId,
  onNewWriting,
}) {
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  // Timer state
  const [selectedMinutes, setSelectedMinutes] = useState(10);
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(180, textareaRef.current.scrollHeight)}px`;
    }
  }, [text]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Timer countdown logic
  useEffect(() => {
    let interval = null;
    if (isTimerActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, secondsLeft]);

  // Handle pergantian durasi timer
  const handleSelectDuration = (minutes) => {
    setSelectedMinutes(minutes);
    setSecondsLeft(minutes * 60);
    setIsTimerActive(false);
    setIsDropdownOpen(false);
  };

  const toggleTimer = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(selectedMinutes * 60);
      setIsTimerActive(true);
    } else {
      setIsTimerActive(!isTimerActive);
    }
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setSecondsLeft(selectedMinutes * 60);
  };

  // Otomatis jalankan timer jika pengguna mulai mengetik
  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);

    // Jika mulai mengetik dan timer belum aktif serta waktu belum habis, jalankan otomatis!
    if (!isTimerActive && secondsLeft > 0 && val.trim().length > 0) {
      setIsTimerActive(true);
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Word count
  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;

  const handleSave = (e) => {
    e.preventDefault();
    if (!text.trim() || isSaving) return;
    onSave({
      text,
      wordCount,
      promptCategory: promptCategory || "Latihan Bebas",
    });
  };

  return (
    <div className="w-full rounded-2xl bg-white/80 backdrop-blur-md border border-palette-slate/30 p-5 sm:p-6 shadow-card hover:shadow-cardHover transition-all duration-300">
      {/* Top Bar Editor: Pencil Icon (Left) & Timer Controls with Duration Dropdown (Right) */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-palette-slate/20">
        <div className="flex items-center gap-2 text-palette-periwinkle">
          <PenTool className="w-4 h-4 text-palette-periwinkle" />
          {activeEntryId ? (
            <span className="text-xs text-palette-deep font-medium bg-palette-mist/60 px-2.5 py-0.5 rounded-full">
              Mode Edit / Baca
            </span>
          ) : (
            <span className="text-xs text-palette-slate hidden sm:inline">
              {isTimerActive ? "Timer sedang berjalan..." : "Mulai mengetik untuk menjalankan timer"}
            </span>
          )}
        </div>

        {/* Timer Controls: Duration Picker Pill & Mulai Button */}
        <div className="flex items-center gap-2">
          {activeEntryId && (
            <button
              type="button"
              onClick={onNewWriting}
              className="text-xs text-palette-periwinkle hover:text-palette-deep mr-1 font-medium"
            >
              + Lembar Baru
            </button>
          )}

          {/* Time Display Pill dengan Dropdown Durasi (Persis '10:00 ∨' pada Gambar 1) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-palette-mist/50 hover:bg-palette-mist border border-palette-slate/30 text-xs sm:text-sm font-mono text-palette-deep font-medium transition-all shadow-sm active:scale-95"
              title="Klik untuk memilih durasi timer"
            >
              <Clock
                className={`w-3.5 h-3.5 ${
                  isTimerActive ? "animate-pulse text-palette-deep" : "text-palette-slate"
                }`}
              />
              <span>{formattedTime}</span>
              <ChevronDown className="w-3 h-3 text-palette-slate opacity-80" />
            </button>

            {/* Menu Pilihan Durasi Timer */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-white/95 backdrop-blur-md border border-palette-slate/30 shadow-cardHover p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[11px] font-semibold text-palette-periwinkle uppercase tracking-wider border-b border-palette-slate/15 mb-1">
                  Atur Durasi Menulis
                </div>
                {DURATION_OPTIONS.map((opt) => {
                  const isSelected = selectedMinutes === opt.minutes;
                  return (
                    <button
                      key={opt.minutes}
                      type="button"
                      onClick={() => handleSelectDuration(opt.minutes)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                        isSelected
                          ? "bg-palette-mist text-palette-deep font-semibold"
                          : "text-palette-deep/80 hover:bg-palette-canvas hover:text-palette-deep"
                      }`}
                    >
                      <div>
                        <div>{opt.label}</div>
                        <div className="text-[10px] text-palette-slate font-normal">{opt.desc}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-palette-deep shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={resetTimer}
            className="p-1.5 rounded-full text-palette-slate hover:text-palette-deep hover:bg-palette-mist/40 transition-colors"
            title={`Reset ke ${selectedMinutes} menit`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Tombol Mulai / Jeda */}
          <button
            type="button"
            onClick={toggleTimer}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-white bg-palette-deep hover:bg-palette-deepHover active:scale-95 shadow-soft transition-all"
          >
            {isTimerActive ? (
              <>
                <Pause className="w-3 h-3" />
                <span>Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Mulai</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Textarea Tulisan: "Tulis di sini..." (Auto-start timer saat diketik) */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          placeholder="Tulis di sini..."
          className="w-full min-h-[170px] p-2 sm:p-3 bg-transparent text-palette-deep placeholder:text-palette-slate/60 text-sm sm:text-base leading-relaxed focus:outline-none transition-all resize-none font-sans"
        />
      </div>

      {/* Bottom Bar Editor: "X kata" (Left) & "Simpan tulisan" (Right) */}
      <div className="flex items-center justify-between gap-4 pt-3 mt-2 border-t border-palette-slate/20">
        <div className="flex items-center gap-1.5 text-xs text-palette-slate font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>{wordCount} kata</span>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!text.trim() || isSaving}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-medium text-white bg-palette-deep hover:bg-palette-deepHover active:scale-95 shadow-soft transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Simpan tulisan</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
