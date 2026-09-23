# Web Latihan Nulis ✍️

Website journaling dan latihan menulis harian digital bernuansa cozy & feminin, dibangun menggunakan **Next.js 14 (App Router)**, **Tailwind CSS**, dan **Firebase Firestore** sebagai basis data cloud.

Aplikasi ini siap digunakan dan dapat dideploy langsung ke **Vercel**.

---

## ✨ Fitur Utama

- **🎨 Palet Warna Dusty Rose & Mauve Lembut**:
  - `#E2D4D9` (Lavender Pucat — background & card)
  - `#DBB9B7` (Dusty Pink — aksen sekunder)
  - `#C8B0C0` (Mauve Terang — highlight & hover)
  - `#B19AA7` (Mauve Gelap — teks sekunder & border)
  - `#978792` (Plum Abu-abu — teks utama & tombol utama)
- **🖋️ Tipografi Premium**:
  - Judul: **Playfair Display** (Google Fonts) berspasi lebar (*letter-spacing*) elegan.
  - Body: **Poppins** (Google Fonts) bersih dan nyaman dibaca.
- **📅 Prompt Harian Dinamis**:
  - Otomatis menyesuaikan hari dalam seminggu (`Senin` s.d. `Minggu`).
  - Tombol **Ganti prompt** untuk merotasi variasi latihan khusus pada hari yang sama.
- **⏱️ Timer Menulis 10 Menit**:
  - Hitung mundur terintegrasi format `MM:SS` dengan tombol Mulai, Jeda, dan Reset.
- **📝 Editor Menulis Nyaman**:
  - Textarea auto-resize dengan border halus.
  - Penghitung kata (*word count*) dan karakter realtime.
  - Simpan tulisan langsung ke Firebase Firestore dengan toast notifikasi "Tersimpan!".
- **📜 Riwayat Tulisan Personal**:
  - Data diidentifikasi melalui `deviceId` anonim di `localStorage`.
  - Klik salah satu riwayat untuk memuat ulang isinya ke editor untuk diedit/dibaca kembali.
  - State loading skeleton shimmer halus dan state kosong ramah.
  - Tombol **Hapus semua** dengan dialog konfirmasi aman.
- **🛡️ Toleran & Siap Pakai**:
  - Mendukung fallback otomatis ke *Local Storage Mode* apabila kredensial Firebase belum dimasukkan, sehingga aplikasi tetap dapat dicoba secara lokal tanpa crash.

---

## 🚀 Cara Menjalankan Secara Lokal

### 1. Install Dependensi
```bash
npm install
```

### 2. Konfigurasi Lingkungan (.env.local)
Salin `.env.local.example` menjadi `.env.local`:
```bash
cp .env.local.example .env.local
```
Lalu masukkan nilai kredensial Firebase web app Anda ke dalam file `.env.local`.

### 3. Jalankan Server Development
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 🔥 Panduan Setup Firebase Firestore

1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat project baru.
2. Pada menu **Build** di sisi kiri, pilih **Firestore Database**, lalu klik **Create database**.
3. Pilih lokasi database terdekat (misal: `asia-southeast2` untuk Jakarta atau `asia-southeast1` untuk Singapura).
4. Pilih mode **Start in test mode** atau terapkan aturan keamanan dari file [`firestore.rules`](./firestore.rules) pada tab **Rules**.
5. Tambahkan Web App di Firebase Console:
   - Masuk ke **Project Settings** (ikon gerigi) -> tab **General**.
   - Di bagian *Your apps*, klik ikon Web `</>`.
   - Beri nama app (misal: `buku-latihan-nulis`).
   - Salin nilai konfigurasi objek Firebase (`apiKey`, `projectId`, dll.) ke dalam file `.env.local`.

### Indeks Komposit Firestore (Jika Diperlukan):
Query riwayat menggunakan filter `deviceId` dan urutan `date desc`. Firestore biasanya akan menampilkan link langsung di log console browser jika indeks komposit diperlukan, cukup klik link tersebut untuk membuatnya otomatis di console Firebase:
- **Collection ID**: `entries`
- **Fields indexed**:
  1. `deviceId` (Ascending)
  2. `date` (Descending)

---

## 🌐 Panduan Deploy ke Vercel

1. Push repository proyek ini ke akun GitHub / GitLab Anda.
2. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan klik **Add New...** -> **Project**.
3. Hubungkan repository GitHub proyek ini.
4. Pada bagian **Environment Variables**, tambahkan variabel berikut sesuai dengan `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. Klik **Deploy**. Selesai! Website Anda langsung aktif secara global.
