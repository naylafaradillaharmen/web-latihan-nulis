# Inkly 🌷
> *Write freely, learn naturally.*

**Inkly** adalah *personal writing space* yang tenang, bersih, dan nyaman untuk:
- Latihan menulis bahasa Indonesia dan bahasa Inggris,
- Menulis jurnal dan diary pribadi,
- Mendapatkan feedback alami dan hangat dari **AI Writing Tutor**,
- Menyimpan serta membaca kembali riwayat tulisan secara aman dan privat.

Aplikasi ini dibangun dengan mengutamakan **pengalaman menulis (writing experience)** yang lega, minimalis, dan bebas distraksi—bukan seperti dashboard SaaS yang rumit atau sekadar grammar checker kaku.

---

## 🌿 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS dengan palet warna soft muted lilac & canvas off-white
- **Database**: Cloud Firestore
- **Authentication**: Firebase Authentication (Email/Password)
- **AI Writing Tutor**: Groq API (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`)

---

## ✨ Fitur & Karakteristik Utama

### 1. Minimal & Clean Writing Space
- Layout luas dengan whitespace yang lega dan tipografi bernuansa tenang (*Playfair Display* & *Poppins*).
- Judul tanpa border kaku (*seamless*) dan kanvas editor lapang yang responsif.
- Pengalih bahasa tulisan: **🇮🇩 Bahasa Indonesia** & **🇬🇧 English**.
- Fitur pendukung opsional (dapat disembunyikan/dibuka):
  - **Timer menulis** (5, 10, 15, 25 menit) untuk sprint latihan fokus.
  - **Ide / Prompt Harian** sebagai inspirasi jika sedang mengalami *writer's block*.
  - Penghitung kata (*word count*) dan perkiraan waktu baca.

### 2. Privasi & Keamanan Penuh
- **100% Private by Default**: Tidak ada profil publik atau tulisan publik.
- **Firebase Auth**: User dapat Mendaftar (*Register*), Masuk (*Login*), Keluar (*Logout*), dan *Reset Password*.
- **Data Scoped ke UID**: Setiap tulisan dan riwayat penggunaan AI terikat langsung ke UID pengguna yang terautentikasi.
- **Firestore Security Rules**: Memvalidasi kepemilikan dokumen secara ketat di sisi server (`request.auth.uid == resource.data.userId`).

### 3. AI Writing Tutor (Groq API)
- Tombol **Review with AI** bertindak sebagai tutor penulisan yang ramah, bukan sekadar korektor tata bahasa yang kaku.
- **Mempertahankan Suara & Emosi Penulis**:
  - Untuk **Bahasa Indonesia**: Memahami bahasa santai, gaul, partikel informal, dan tidak memaksa tulisan santai menjadi bahasa baku kaku tanpa alasan.
  - Untuk **Bahasa Inggris**: Memahami bahasa percakapan sehari-hari dan menjelaskan kenapa struktur tertentu terasa lebih alami (*natural*).
- **Format Hasil Review Terstruktur**:
  - ✨ **A more natural version**: Versi tulisan yang lebih mengalir dan rapi.
  - 📝 **What changed?**: Penjelasan ringkas mengenai penyesuaian yang dilakukan.
  - 🌱 **Writing tip**: Satu tips praktis yang relevan dengan tulisan.
- Tombol **"Gunakan ke Tulisan"** untuk menerapkan versi revisi secara instan ke editor jika diinginkan.
- Hasil review otomatis disimpan ke dokumen tulisan di Firestore.

### 4. Batasan Review AI Harian (1x per Hari)
- User memiliki kuota **1 kali AI review per hari**, namun tetap bebas menulis dan menyimpan tulisan sebanyak apa pun.
- Divalidasi dan dicatat di **server-side** berdasarkan `userId` dan tanggal hari ini (`YYYY-MM-DD`).
- Tidak dapat dimanipulasi atau direset hanya dengan me-refresh browser.
- Menampilkan pesan ramah ketika limit tercapai:
  > *“You've used today's AI review. Keep writing, and come back tomorrow 🌷”*

### 5. Journal List
- Tampilan riwayat tulisan yang bersih dan teratur berdasarkan tanggal (misal: *October 5, 2026*).
- Menampilkan judul, cuplikan isi, badge bahasa, dan indikator tulisan yang sudah direview AI.
- Klik untuk membuka dan mengedit kembali tulisan di editor.

### 6. Settings Sederhana
- Informasi akun (Email, User ID, total tulisan).
- Status kuota AI Writing Tutor hari ini.
- Pengaturan bahasa utama penulisan.
- Tombol Keluar (*Logout*).

---

## 🚀 Setup & Menjalankan Lokal

### 1. Install Dependensi
```bash
npm install
```

### 2. Konfigurasi Lingkungan (`.env.local`)
Pastikan file `.env.local` memuat konfigurasi Firebase dan Groq API Key:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Groq API Key untuk AI Writing Tutor (Hanya di server-side, tidak pernah di-expose ke client)
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### 3. Deploy Firestore Security Rules
Salin aturan dari file [`firestore.rules`](./firestore.rules) ke Firebase Console -> Firestore Database -> **Rules**:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Inkly Writing Entries: Strict UID ownership
    match /entries/{entryId} {
      allow read, update, delete: if request.auth != null 
                                  && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.content is string;
    }

    // Daily AI usage tracking: Scoped to user's UID
    match /daily_ai_usage/{usageId} {
      allow read: if request.auth != null 
                  && resource.data.userId == request.auth.uid;
      allow create, update: if request.auth != null 
                            && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### 5. Build Produksi
```bash
npm run build
npm run start
```
