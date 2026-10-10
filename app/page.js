"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import Editor from "../components/Editor";
import JournalList from "../components/JournalList";
import ReadingView from "../components/ReadingView";
import TutorReviewView from "../components/TutorReviewView";
import SettingsView from "../components/SettingsView";
import AuthView from "../components/AuthView";
import TopUpModal from "../components/TopUpModal";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import {
  saveWritingEntry,
  getWritingEntries,
  deleteWritingEntry,
} from "../lib/firebase";

export default function Home() {
  const { user, loading: authLoading, getIdToken } = useAuth();

  // Active view: "journal" | "editor" | "reading" | "review" | "settings" | "login"
  const [activeTab, setActiveTab] = useState("journal");

  // Writing state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("id");
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [aiReviewData, setAiReviewData] = useState(null);
  const [activeEntryObj, setActiveEntryObj] = useState(null);

  // Journal entries state
  const [entries, setEntries] = useState([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiReviewing, setIsAiReviewing] = useState(false);

  // Top Up / Token Exhausted Modal state
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  // Modals & feedback
  const [toast, setToast] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch entries for authenticated user
  const fetchUserEntries = useCallback(async (uid) => {
    if (!uid) {
      setEntries([]);
      return;
    }
    setIsLoadingEntries(true);
    try {
      const data = await getWritingEntries(uid);
      setEntries(data || []);
    } catch (err) {
      console.error("Gagal memuat catatan:", err);
      showToast("Gagal memuat arsip tulisan.", "error");
    } finally {
      setIsLoadingEntries(false);
    }
  }, []);

  // When user changes or logs in
  useEffect(() => {
    if (user?.uid) {
      fetchUserEntries(user.uid);
      if (activeTab === "login") {
        setActiveTab("journal");
      }
    } else {
      setEntries([]);
    }
  }, [user, fetchUserEntries, activeTab]);

  // Load language preference from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("inkly_preferred_lang");
    if (savedLang === "en" || savedLang === "id") {
      setLanguage(savedLang);
    }
  }, []);

  const handleChangePreferredLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("inkly_preferred_lang", lang);
    showToast(
      `Bahasa penulisan diubah ke ${
        lang === "id" ? "Bahasa Indonesia" : "English"
      }.`,
      "success"
    );
  };

  const handleTabChange = (tab, forceNew = false) => {
    if (tab === "editor" && forceNew) {
      handleNewWriting();
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Start a fresh, clean writing sheet
  const handleNewWriting = () => {
    setActiveEntryId(null);
    setActiveEntryObj(null);
    setTitle("");
    setContent("");
    setAiReviewData(null);
    setActiveTab("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Select an existing entry to read in Reading Sanctuary
  const handleSelectEntry = (entry) => {
    setActiveEntryId(entry.id);
    setActiveEntryObj(entry);
    setTitle(entry.title || "");
    setContent(entry.content || entry.text || "");
    setLanguage(entry.language || "id");
    setAiReviewData(entry.aiReviewData || null);
    setActiveTab("reading");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Save writing entry
  const handleSave = async () => {
    if (!user) {
      setActiveTab("login");
      return;
    }

    if (!content.trim()) {
      showToast("Tulis sesuatu sebelum menyimpan.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveWritingEntry({
        id: activeEntryId,
        userId: user.uid,
        title: title.trim() || "Untitled thoughts",
        content: content.trim(),
        language,
        aiReviewed: Boolean(aiReviewData),
        aiReviewedAt: aiReviewData?.reviewedAt
          ? new Date(aiReviewData.reviewedAt)
          : null,
        aiReviewData: aiReviewData || null,
      });

      const updatedObj = {
        id: activeEntryId || res.id,
        userId: user.uid,
        title: title.trim() || "Untitled thoughts",
        content: content.trim(),
        language,
        aiReviewed: Boolean(aiReviewData),
        aiReviewData: aiReviewData || null,
        createdAt: activeEntryObj?.createdAt || new Date(),
      };

      if (!activeEntryId) {
        setActiveEntryId(res.id);
      }
      setActiveEntryObj(updatedObj);

      await fetchUserEntries(user.uid);
      showToast("Tersimpan dengan rapi di jurnalmu 🌷", "success");
    } catch (err) {
      console.error("Gagal menyimpan tulisan:", err);
      showToast("Gagal menyimpan. Silakan coba lagi.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Request review from AI Writing Tutor (Groq)
  const handleReviewWithAi = async () => {
    if (!user) {
      setActiveTab("login");
      return;
    }

    if (!content.trim()) {
      showToast("Tulis sesuatu terlebih dahulu untuk direview.", "error");
      return;
    }

    setIsAiReviewing(true);
    try {
      const idToken = await getIdToken(true);
      if (!idToken) {
        showToast("Sesi login berakhir. Silakan masuk kembali.", "error");
        setIsAiReviewing(false);
        return;
      }

      const res = await fetch("/api/ai/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          entryId: activeEntryId,
          text: content.trim(),
          title: title.trim(),
          language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 || data.tokenExhausted) {
          setIsTopUpOpen(true);
        } else {
          showToast(data.error || "Gagal mendapatkan review dari AI.", "error");
        }
        setIsAiReviewing(false);
        return;
      }

      // Review generated successfully!
      const reviewPayload = data.review;
      setAiReviewData(reviewPayload);

      // Auto-save the review to Firestore
      try {
        const savedRes = await saveWritingEntry({
          id: activeEntryId,
          userId: user.uid,
          title: title.trim() || "Untitled thoughts",
          content: content.trim(),
          language,
          aiReviewed: true,
          aiReviewedAt: new Date(),
          aiReviewData: reviewPayload,
        });

        if (!activeEntryId) {
          setActiveEntryId(savedRes.id);
        }
        setActiveEntryObj((prev) => ({
          ...(prev || {}),
          id: activeEntryId || savedRes.id,
          title: title.trim() || "Untitled thoughts",
          content: content.trim(),
          language,
          aiReviewed: true,
          aiReviewData: reviewPayload,
        }));
        await fetchUserEntries(user.uid);
      } catch (saveErr) {
        console.warn("Could not auto-save review to Firestore:", saveErr);
      }

      showToast("Tutor review selesai! Buka review untuk melihat saran ✨", "success");
      setActiveTab("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("AI review error:", err);
      showToast("Terjadi kendala saat menghubungi AI tutor.", "error");
    } finally {
      setIsAiReviewing(false);
    }
  };

  // Apply revised text directly to editor
  const handleApplyRevisedText = (revisedText) => {
    if (!revisedText) return;
    setContent(revisedText);
    setActiveTab("editor");
    showToast("Versi revisi diterapkan ke lembar tulisanmu ✨", "success");
  };

  // Delete an entry
  const handleDeleteEntry = (entry) => {
    setEntryToDelete(entry);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete || !user) return;
    setIsDeleting(true);
    try {
      await deleteWritingEntry(entryToDelete.id, user.uid);
      setEntries((prev) => prev.filter((item) => item.id !== entryToDelete.id));

      if (activeEntryId === entryToDelete.id) {
        handleNewWriting();
      }

      setIsConfirmOpen(false);
      setEntryToDelete(null);
      showToast("Tulisan telah dihapus dari jurnalmu.", "success");
    } catch (err) {
      console.error("Gagal menghapus tulisan:", err);
      showToast("Gagal menghapus tulisan.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Initial loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-ink-muted">
        <div className="text-center space-y-2">
          <span className="font-serif italic text-2xl text-ink-deep">inkly</span>
          <p className="font-script text-base text-rose-deep animate-pulse">
            preparing your writing sanctuary...
          </p>
        </div>
      </div>
    );
  }

  // AUTH FIRST FLOW: If user is NOT logged in, show Auth Page without navbar!
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 py-12">
        <AuthView
          onAuthSuccess={() => {
            showToast("Selamat datang di sanctuary Inkly ♡", "success");
            setActiveTab("journal");
          }}
        />
        <footer className="mt-8 text-center text-xs text-ink-faint space-y-1">
          <p className="font-serif italic text-sm text-ink-muted">
            © 2026 inkly — made with delicate care, tea, and too many feelings ✿
          </p>
          <p className="text-[11px] font-light">
            an intimate bilingual journal sanctuary
          </p>
        </footer>
      </div>
    );
  }

  // Main Sanctuary for Logged In User
  return (
    <div className="min-h-full flex flex-col">
      {/* Site Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenAuth={() => setActiveTab("login")}
      />

      {/* Main Content Stage */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-8">
        {/* VIEW 1: JOURNAL HOME */}
        {activeTab === "journal" && (
          <JournalList
            entries={entries}
            isLoading={isLoadingEntries}
            activeEntryId={activeEntryId}
            onSelectEntry={handleSelectEntry}
            onDeleteEntry={handleDeleteEntry}
            onNewWriting={handleNewWriting}
            onOpenAuth={() => setActiveTab("login")}
            user={user}
          />
        )}

        {/* VIEW 2: WRITING EDITOR */}
        {activeTab === "editor" && (
          <Editor
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            language={language}
            setLanguage={setLanguage}
            onSave={handleSave}
            isSaving={isSaving}
            activeEntryId={activeEntryId}
            onNewWriting={handleNewWriting}
            onReviewWithAi={handleReviewWithAi}
            isAiReviewing={isAiReviewing}
            aiReviewData={aiReviewData}
            dailyAiUsed={false}
            onApplyRevisedText={handleApplyRevisedText}
            onBackToSanctuary={() => setActiveTab("journal")}
            user={user}
            onOpenAuth={() => setActiveTab("login")}
          />
        )}

        {/* VIEW 3: AI TUTOR REVIEW */}
        {activeTab === "review" && (
          <TutorReviewView
            originalText={content}
            aiReviewData={aiReviewData}
            onBackToEditor={() => setActiveTab("editor")}
            onApplySuggestion={handleApplyRevisedText}
          />
        )}

        {/* VIEW 4: READING SANCTUARY */}
        {activeTab === "reading" && (
          <ReadingView
            entry={
              activeEntryObj || {
                title,
                content,
                language,
                aiReviewed: Boolean(aiReviewData),
                aiReviewData,
                createdAt: new Date(),
              }
            }
            onBackToSanctuary={() => setActiveTab("journal")}
            onEditEntry={() => setActiveTab("editor")}
            onOpenReview={() => setActiveTab("review")}
            user={user}
          />
        )}

        {/* VIEW 5: SETTINGS */}
        {activeTab === "settings" && (
          <SettingsView
            totalEntries={entries.length}
            preferredLanguage={language}
            onChangePreferredLanguage={handleChangePreferredLanguage}
            onOpenAuth={() => setActiveTab("login")}
          />
        )}
      </main>

      {/* Site Footer */}
      <footer className="mt-16 border-t border-[#EDE6DC] py-8 text-center text-xs text-ink-faint space-y-2">
        <p className="font-serif italic text-sm text-ink-muted">
          © 2026 inkly — made with delicate care, tea, and too many feelings ✿
        </p>
        <p className="text-[11px] font-light">
          an intimate bilingual journal sanctuary · Jakarta &amp; London
        </p>
      </footer>

      {/* Top Up / Token Exhausted Pop Out Modal */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Hapus catatan ini?"
        message={`"${
          entryToDelete?.title || "Untitled"
        }" akan dihapus permanen dari ruang jurnalmu.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setEntryToDelete(null);
        }}
        isDeleting={isDeleting}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
