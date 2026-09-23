export const PROMPTS = {
  1: { // Senin
    kind: "Senin — Bedah Tulisan",
    items: [
      "Ambil satu paragraf dari tulisan yang kamu suka. Tulis ulang topik lain pakai struktur kalimat yang sama persis.",
      "Cari satu kalimat pembuka yang menurutmu kuat. Tiru polanya untuk membuka tulisan tentang harimu."
    ]
  },
  2: { // Selasa
    kind: "Selasa — Free Writing",
    items: [
      "Tulis 150-200 kata tentang sesuatu yang bikin kamu kesel minggu ini. Jangan berhenti buat mikir bagus atau nggak.",
      "Ceritain satu momen random hari ini, sedetail mungkin, tanpa mikirin susunan kalimat."
    ]
  },
  3: { // Rabu
    kind: "Rabu — Revisi",
    items: [
      "Buka tulisan kemarin. Potong kalimat yang muter-muter, ganti kata yang lemah jadi lebih spesifik.",
      "Baca keras-keras tulisan terakhirmu. Tulis ulang bagian yang kedengaran kaku pas diucapin."
    ]
  },
  4: { // Kamis
    kind: "Kamis — Bedah Tulisan",
    items: [
      "Cari satu analogi bagus dari bacaan minggu ini. Bikin analogi serupa buat topik yang beda.",
      "Perhatikan transisi antar paragraf di tulisan favoritmu. Coba pakai transisi yang sama."
    ]
  },
  5: { // Jumat
    kind: "Jumat — Free Writing",
    items: [
      "Tulis pendapatmu soal satu hal yang lagi ramai dibahas, tanpa filter, 150 kata.",
      "Tulis surat pendek ke diri kamu setahun lalu."
    ]
  },
  6: { // Sabtu
    kind: "Sabtu — Koleksi Frasa",
    items: [
      "Tulis 5 kalimat pembuka favoritmu dari bacaan minggu ini, lalu buat 1 kalimat baru pakai tiap pola itu.",
      "Kumpulin kata-kata baru yang kamu temu minggu ini, pakai masing-masing dalam satu kalimat."
    ]
  },
  0: { // Minggu
    kind: "Minggu — Review",
    items: [
      "Baca ulang semua tulisan minggu ini. Tulis satu hal yang kerasa membaik.",
      "Tulis rencana kecil buat latihan minggu depan."
    ]
  }
};

/**
 * Mendapatkan data prompt untuk hari tertentu (0 = Minggu, 1 = Senin, ..., 6 = Sabtu)
 */
export function getPromptForDay(dayIndex = new Date().getDay(), variationIndex = 0) {
  const dayData = PROMPTS[dayIndex] || PROMPTS[0];
  const items = dayData.items;
  const safeIndex = variationIndex % items.length;
  return {
    kind: dayData.kind,
    text: items[safeIndex],
    totalVariations: items.length,
    currentIndex: safeIndex,
  };
}
