# Design Direction: To-Do List Sederhana

Dokumen ini mendefinisikan identitas dan arahan visual antarmuka aplikasi To-Do List berdasarkan pilihan arahan pengguna dan kebutuhan PRD.

## 1. Identitas & Karakter (Personality & Mood)
- **Karakter:** Minimalis & Fokus.
- **Suasana:** Bersih, bebas gangguan (*distraction-free*), tenang, dan lugas untuk membantu pengguna menyelesaikan tugas harian tanpa distraksi visual.
- **Filosofi:** Setiap elemen memiliki tujuan fungsional (*purpose-driven*). Menghindari ornamen yang tidak perlu (*anti-slop*).

## 2. Palet Warna (Palette)
- **Tema Aksen:** Monochrome / Neutral Slate (hitam pekat, abu-abu terukur, tanpa warna jenuh yang menyolok).
- **Mode:** Mendukung Light & Dark mode dengan kontras tinggi (memenuhi standar WCAG AA minimum 4.5:1).

### Light Mode
- Background: `#f8fafc` (Slate 50) / `#ffffff`
- Surface / Card: `#ffffff`
- Text Primary: `#0f172a` (Slate 900)
- Text Secondary / Completed: `#64748b` (Slate 500)
- Border: `#e2e8f0` (Slate 200)
- Action Button / Checkbox Checked: `#0f172a` (Slate 900) dengan teks `#ffffff`

### Dark Mode
- Background: `#020617` (Slate 950) / `#0f172a` (Slate 900)
- Surface / Card: `#0f172a` (Slate 900) / `#1e293b` (Slate 800)
- Text Primary: `#f8fafc` (Slate 50)
- Text Secondary / Completed: `#94a3b8` (Slate 400)
- Border: `#1e293b` (Slate 800) / `#334155` (Slate 700)
- Action Button / Checkbox Checked: `#f8fafc` (Slate 50) dengan teks `#0f172a`

## 3. Tipografi
- **Family:** System Sans-Serif / Inter / Geist Sans (mudah dibaca di semua ukuran).
- **Hirarki:**
  - Judul Aplikasi: Bold / Semibold, proporsional dan tidak berlebihan.
  - Tagline: Regular, Slate-500 / Slate-400, ringkas.
  - Teks Tugas: Regular, ukuran 15-16px agar nyaman dibaca dan target sentuh cukup (min. 44px).
  - Teks Selesai: Line-through, muted color.

## 4. Dials Antislop
- **ENERGY:** 2 (Kalem, terkontrol, tanpa efek neon/glow berlebih)
- **RHYTHM:** 2 (Spasi konsisten, hierarki vertikal teratur)
- **MOTION:** 2 (Mikrointeraksi halus pada saat centang selesai dan toggle tema, mematuhi prefers-reduced-motion)

## 5. Tata Letak (Layout)
- Satu halaman terpusat vertikal (*centered single-column container* max-w-xl).
- Di layar seluler (HP), form input dan tombol simpan tersusun ke bawah (*flex-col* di mobile, *flex-row* di desktop).
- State kosong (*empty state*): teks terarah *"Belum ada tugas, mulai tulis di atas"*.
