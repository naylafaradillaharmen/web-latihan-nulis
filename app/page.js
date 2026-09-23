"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import PromptCard from "../components/PromptCard";
import Editor from "../components/Editor";
import HistoryList from "../components/HistoryList";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import { getOrCreateDeviceId } from "../lib/deviceId";
import {
  saveWritingEntry,
  getWritingEntries,
  deleteWritingEntry,
  deleteAllWritingEntries,
  isFirebaseConfigured,
} from "../lib/firebase";
import { getPromptForDay } from "../lib/prompts";

export default function Home() {
  const [deviceId, setDeviceId] = useState("");
  const [text, setText] = useState("");
  const [promptCategory, setPromptCategory] = useState("");
  const [entries, setEntries] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [toast, setToast] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [activeTab, setActiveTab] = useState("beranda");

  const historyRef = useRef(null);
  const editorRef = useRef(null);

  // Inisialisasi kategori prompt hari ini
  useEffect(() => {
    const today = new Date().getDay();
    const todayPrompt = getPromptForDay(today, 0);
    setPromptCategory(todayPrompt.kind);
  }, []);

  // Ambil deviceId dan riwayat tulisan saat awal mount
  const fetchEntries = useCallback(async (devId) => {
    if (!devId) return;
    setIsLoadingHistory(true);
    try {
      const data = await getWritingEntries(devId);
      setEntries(data || []);
    } catch (err) {
      console.error("Gagal mengambil riwayat tulisan:", err);
      showToast("Gagal memuat riwayat tulisan", "error");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    const id = getOrCreateDeviceId();
    setDeviceId(id);
    fetchEntries(id);
  }, [fetchEntries]);

  // Helper toast
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Simpan tulisan ke Firestore
  const handleSave = async ({ text: content, wordCount, promptCategory: category }) => {
    if (!deviceId) return;
    setIsSaving(true);
    try {
      const res = await saveWritingEntry({
        deviceId,
        text: content,
        wordCount,
        promptCategory: category,
      });

      showToast("Tersimpan! Tulisanmu berhasil dicatat.", "success");
      setActiveEntryId(res.id);
      await fetchEntries(deviceId);
    } catch (err) {
      console.error("Gagal menyimpan tulisan:", err);
      showToast("Gagal menyimpan tulisan. Silakan coba lagi.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Buka tulisan dari riwayat ke editor
  const handleSelectEntry = (entry) => {
    setActiveEntryId(entry.id);
    setText(entry.text || "");
    if (entry.promptCategory) {
      setPromptCategory(entry.promptCategory);
    }
    setActiveTab("beranda");
    if (editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Mulai lembar baru
  const handleNewWriting = () => {
    setActiveEntryId(null);
    setText("");
    const today = new Date().getDay();
    const todayPrompt = getPromptForDay(today, 0);
    setPromptCategory(todayPrompt.kind);
  };

  // Hapus satu entri
  const handleDeleteSingle = async (entryId) => {
    try {
      await deleteWritingEntry(entryId);
      setEntries((prev) => prev.filter((item) => item.id !== entryId));
      if (activeEntryId === entryId) {
        handleNewWriting();
      }
      showToast("Satu catatan telah dihapus.", "success");
    } catch (err) {
      console.error("Gagal menghapus catatan:", err);
      showToast("Gagal menghapus catatan.", "error");
    }
  };

  // Hapus semua entri pengguna
  const handleConfirmDeleteAll = async () => {
    if (!deviceId) return;
    setIsDeletingAll(true);
    try {
      await deleteAllWritingEntries(deviceId);
      setEntries([]);
      handleNewWriting();
      setIsConfirmOpen(false);
      showToast("Semua riwayat tulisan telah dibersihkan.", "success");
    } catch (err) {
      console.error("Gagal menghapus semua data:", err);
      showToast("Gagal menghapus data dari database.", "error");
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Navigasi tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "riwayat" && historyRef.current) {
      historyRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (tab === "beranda" && editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-12 pt-3 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col gap-5">
      {/* Header Utama (Gambar 1) */}
      <Header />



      {/* Layout Dua Kolom: Sidebar Navigasi (Kiri) + Konten Jurnal (Kanan) - Persis Gambar 1 */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar Navigasi Kiri */}
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Konten Utama Kanan */}
        <main className="flex-1 w-full flex flex-col gap-6">
          {/* Card Prompt Harian */}
          <PromptCard
            onSelectVariation={(kind) => setPromptCategory(kind)}
          />

          {/* Area Editor Menulis */}
          <div ref={editorRef}>
            <Editor
              text={text}
              setText={setText}
              promptCategory={promptCategory}
              onSave={handleSave}
              isSaving={isSaving}
              activeEntryId={activeEntryId}
              onNewWriting={handleNewWriting}
            />
          </div>

          {/* Riwayat Tulisan */}
          <div ref={historyRef}>
            <HistoryList
              entries={entries}
              isLoading={isLoadingHistory}
              activeEntryId={activeEntryId}
              onSelectEntry={handleSelectEntry}
              onDeleteSingle={handleDeleteSingle}
              onRequestDeleteAll={() => setIsConfirmOpen(true)}
            />
          </div>
        </main>
      </div>

      {/* Modal Konfirmasi Hapus Semua */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Hapus semua tulisan?"
        message="Tindakan ini tidak bisa dibatalkan. Semua tulisanmu akan dihapus dari database."
        onConfirm={handleConfirmDeleteAll}
        onCancel={() => setIsConfirmOpen(false)}
        isDeleting={isDeletingAll}
      />

      {/* Toast Feedback */}
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
