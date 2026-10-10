"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = "login",
  onAuthSuccess,
}) {
  const [tab, setTab] = useState(initialTab); // "login" | "register" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, resetPassword } = useAuth();

  if (!isOpen) return null;

  const resetFormState = () => {
    setError("");
    setMessage("");
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    resetFormState();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      if (tab === "login") {
        if (!email.trim() || !password) {
          setError("Silakan masukkan email dan password.");
          setIsSubmitting(false);
          return;
        }
        await login(email.trim(), password);
        onClose();
        if (onAuthSuccess) onAuthSuccess("login");
      } else if (tab === "register") {
        if (!email.trim() || !password) {
          setError("Silakan lengkapi semua isian.");
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError("Password minimal 6 karakter.");
          setIsSubmitting(false);
          return;
        }
        await register(email.trim(), password, displayName.trim());
        onClose();
        if (onAuthSuccess) onAuthSuccess("register");
      } else if (tab === "forgot") {
        if (!email.trim()) {
          setError("Masukkan alamat email terdaftar.");
          setIsSubmitting(false);
          return;
        }
        await resetPassword(email.trim());
        setMessage("Tautan reset password telah dikirim ke email kamu.");
      }
    } catch (err) {
      console.error("Auth error:", err);
      let errMsg = "Terjadi kendala. Silakan coba kembali.";
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        errMsg = "Email atau password kurang tepat.";
      } else if (err.code === "auth/email-already-in-use") {
        errMsg = "Email ini sudah terdaftar. Silakan login.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Format email tidak valid.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password terlalu singkat (minimal 6 karakter).";
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-deep/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-paper-card delicate-border rounded-3xl p-8 sm:p-10 paper-shadow space-y-6 text-center animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-ink-faint hover:text-ink-deep rounded-full transition"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5">
          <span className="font-serif italic text-2xl text-ink-deep block">
            {tab === "login" && "welcome back ♡"}
            {tab === "register" && "create your sanctuary ♡"}
            {tab === "forgot" && "reset passphrase ♡"}
          </span>
          <p className="font-script text-lg text-rose-deep">
            {tab === "login" && "your little space for words is waiting."}
            {tab === "register" && "a gentle home for your quiet reflections."}
            {tab === "forgot" && "we'll send instructions to your inbox."}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-soft/70 border border-rose-200 text-xs text-rose-deep text-left">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 rounded-xl bg-sage-soft/70 border border-sage-accent/40 text-xs text-sage-deep text-left">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {tab === "register" && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-faint mb-1">
                Preferred Name / Penulis
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="anahi"
                className="w-full text-xs rounded-xl border-[#E5DDD2] bg-[#FAF7F2] p-2.5 text-ink-deep focus:border-rose-deep focus:ring-0 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-faint mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full text-xs rounded-xl border-[#E5DDD2] bg-[#FAF7F2] p-2.5 text-ink-deep focus:border-rose-deep focus:ring-0 outline-none"
            />
          </div>

          {tab !== "forgot" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs uppercase tracking-wider text-ink-faint">
                  Passphrase
                </label>
                {tab === "login" && (
                  <button
                    type="button"
                    onClick={() => handleTabChange("forgot")}
                    className="text-[11px] text-ink-faint hover:text-ink-deep underline decoration-[#DFD3C3]"
                  >
                    forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full text-xs rounded-xl border-[#E5DDD2] bg-[#FAF7F2] p-2.5 text-ink-deep focus:border-rose-deep focus:ring-0 outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-full bg-ink-deep hover:bg-rose-deep text-paper text-xs uppercase tracking-wider font-medium transition shadow-xs mt-3 disabled:opacity-50"
          >
            {isSubmitting
              ? "Entering..."
              : tab === "login"
              ? "Enter Sanctuary"
              : tab === "register"
              ? "Create Writing Home"
              : "Send Reset Link"}
          </button>
        </form>

        <div className="vintage-rule my-6" />

        <div className="text-xs text-ink-muted">
          {tab === "login" ? (
            <p>
              New here?{" "}
              <button
                type="button"
                onClick={() => handleTabChange("register")}
                className="text-rose-deep font-medium hover:underline ml-1"
              >
                Create your writing home
              </button>
            </p>
          ) : (
            <p>
              Already have a space?{" "}
              <button
                type="button"
                onClick={() => handleTabChange("login")}
                className="text-rose-deep font-medium hover:underline ml-1"
              >
                Sign in to your sanctuary
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
