"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthView({ onAuthSuccess }) {
  const [tab, setTab] = useState("login"); // "login" | "register" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, resetPassword } = useAuth();

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
          setError("Silakan masukkan email dan passphrase.");
          setIsSubmitting(false);
          return;
        }
        await login(email.trim(), password, rememberDevice);
        if (rememberDevice) {
          localStorage.setItem("inkly_remember_device", "true");
        } else {
          localStorage.removeItem("inkly_remember_device");
        }
        if (onAuthSuccess) onAuthSuccess("login");
      } else if (tab === "register") {
        if (!email.trim() || !password) {
          setError("Silakan lengkapi semua isian.");
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError("Passphrase minimal 6 karakter.");
          setIsSubmitting(false);
          return;
        }
        await register(email.trim(), password, displayName.trim());
        if (rememberDevice) {
          localStorage.setItem("inkly_remember_device", "true");
        }
        if (onAuthSuccess) onAuthSuccess("register");
      } else if (tab === "forgot") {
        if (!email.trim()) {
          setError("Masukkan alamat email terdaftar.");
          setIsSubmitting(false);
          return;
        }
        await resetPassword(email.trim());
        setMessage("Tautan reset passphrase telah dikirim ke email kamu.");
      }
    } catch (err) {
      console.error("Auth error:", err);
      let errMsg = "Terjadi kendala. Silakan coba kembali.";
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        errMsg = "Email atau passphrase kurang tepat.";
      } else if (err.code === "auth/email-already-in-use") {
        errMsg = "Email ini sudah terdaftar. Silakan login.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Format email tidak valid.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Passphrase terlalu singkat (minimal 6 karakter).";
      } else if (
        err.code === "auth/configuration-not-found" ||
        (err.message && err.message.includes("configuration-not-found"))
      ) {
        errMsg =
          "Layanan Auth belum diaktifkan di Firebase Console. Buka Firebase Console > Authentication > Sign-in method > aktifkan 'Email/Password'.";
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="max-w-md w-full mx-auto">
      <div className="bg-paper-card delicate-border rounded-3xl p-8 sm:p-10 paper-shadow space-y-6 text-center">
        {/* Brand Logo Header (Inkly Logo Wordmark) */}
        <div className="space-y-2 pb-1">
          <div className="inline-flex items-center justify-center gap-1.5 focus:outline-none">
            <span className="font-serif text-3xl sm:text-4xl tracking-tight text-ink-deep font-normal italic">
              inkly
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-accent" />
          </div>

          <p className="font-script text-xl sm:text-2xl text-rose-deep">
            little notes for the quiet hours ♡
          </p>

          <p className="text-xs text-ink-muted font-light pt-0.5">
            {tab === "login" && "welcome back to your writing sanctuary."}
            {tab === "register" && "your little space for words is waiting."}
            {tab === "forgot" && "we'll send instructions to your inbox."}
          </p>
        </div>

        {/* Feedback message / error */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-soft/80 border border-rose-200 text-xs text-rose-deep text-left font-light leading-relaxed">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3.5 rounded-xl bg-sage-soft/80 border border-sage-accent/40 text-xs text-sage-deep text-left font-light leading-relaxed">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {tab === "register" && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-faint mb-1">
                Name / Penulis
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

          {tab === "login" && (
            <div className="flex items-center justify-between text-xs text-ink-faint pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="rounded text-rose-deep focus:ring-0 border-[#D8CABE]"
                />
                <span className="text-ink-muted">always remember this device</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-full bg-ink-deep hover:bg-rose-deep text-paper text-xs uppercase tracking-wider font-medium transition shadow-xs mt-2 disabled:opacity-50"
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
              Already have a home?{" "}
              <button
                type="button"
                onClick={() => handleTabChange("login")}
                className="text-rose-deep font-medium hover:underline ml-1"
              >
                Enter your sanctuary
              </button>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
