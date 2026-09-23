"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";

export default function Timer({ defaultMinutes = 10, onTimeUp }) {
  const DEFAULT_SECONDS = defaultMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SECONDS);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      if (typeof onTimeUp === "function") {
        onTimeUp();
      }
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, onTimeUp]);

  const toggleTimer = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(DEFAULT_SECONDS);
      setIsActive(true);
    } else {
      setIsActive(!isActive);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(DEFAULT_SECONDS);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isLowTime = secondsLeft < 60 && secondsLeft > 0;
  const isFinished = secondsLeft === 0;

  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-mauve-dark/20 shadow-soft">
      <div className="flex items-center gap-1.5 text-mauve-plum">
        <Clock className={`w-4 h-4 ${isActive ? "animate-pulse text-mauve-plum" : "text-mauve-dark"}`} />
        <span
          className={`font-mono font-medium text-sm sm:text-base tracking-wider ${
            isFinished
              ? "text-red-500 font-semibold"
              : isLowTime
              ? "text-amber-700 animate-pulse font-semibold"
              : "text-mauve-plum"
          }`}
        >
          {formattedTime}
        </span>
      </div>

      <div className="h-4 w-px bg-mauve-dark/25" />

      {/* Tombol Mulai / Jeda */}
      <button
        type="button"
        onClick={toggleTimer}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 ${
          isActive
            ? "bg-mauve-light/50 text-mauve-plum hover:bg-mauve-light hover:text-white"
            : "bg-mauve-plum text-white hover:bg-mauve-light"
        }`}
        title={isActive ? "Jeda timer" : "Mulai timer"}
      >
        {isActive ? (
          <>
            <Pause className="w-3 h-3" />
            <span className="hidden sm:inline">Jeda</span>
          </>
        ) : (
          <>
            <Play className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">{secondsLeft === 0 ? "Ulang" : "Mulai"}</span>
          </>
        )}
      </button>

      {/* Tombol Reset */}
      <button
        type="button"
        onClick={resetTimer}
        className="p-1 rounded-full text-mauve-dark hover:text-mauve-plum hover:bg-mauve-lavender/50 transition-colors"
        title="Reset ke 10 menit"
      >
        <RotateCcw className="w-3 h-3" />
      </button>
    </div>
  );
}
