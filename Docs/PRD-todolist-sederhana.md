# PRD: Aplikasi Web To Do List (Versi Sederhana)

**Versi dokumen:** 1.0
**Tanggal:** 30 Oktober 2026
**Teknologi:** Laravel, Blade, MySQL (React direncanakan untuk versi berikutnya)

---

## 1. Ringkasan Produk

Aplikasi web to do list sederhana yang memungkinkan pengguna menulis tugas, melihatnya dalam daftar, dan menandainya sebagai selesai. Versi ini merupakan MVP (Minimum Viable Product) dan menjadi fondasi untuk fitur yang lebih lengkap.

## 2. Tujuan

- Pengguna dapat mencatat tugas dengan cepat tanpa harus login.
- Pengguna dapat menandai tugas yang sudah selesai.
- Menjadi dasar pengembangan fitur lanjutan, seperti catatan ide.

## 3. Target Pengguna

Pengguna umum yang ingin mencatat tugas harian secara sederhana melalui browser.

## 4. Ruang Lingkup

### 4.1 Termasuk (Versi Pertama)

- Landing page dengan judul dan tagline singkat.
- Kolom input untuk menulis tugas baru.
- Tombol Simpan dan dukungan tombol Enter untuk menyimpan tugas.
- Daftar tugas yang tampil di bawah kolom input, diurutkan dari yang terbaru.
- Checkbox untuk menandai tugas selesai dan membatalkannya kembali.
- Penyimpanan data ke database MySQL agar tidak hilang saat halaman di-refresh.

### 4.2 Tidak Termasuk (Versi Berikutnya)

- Login dan registrasi pengguna.
- Edit dan hapus tugas.
- Kategori, prioritas, atau tanggal tenggat.
- Fitur catatan ide.

## 5. Kebutuhan Fungsional

| ID | Kebutuhan | Keterangan |
|----|-----------|------------|
| F1 | Menampilkan landing page | Halaman utama berisi judul dan tagline. |
| F2 | Menambah tugas | Pengguna mengetik tugas lalu klik Simpan atau tekan Enter. |
| F3 | Validasi input | Tugas kosong atau hanya berisi spasi tidak boleh disimpan. Panjang maksimal 255 karakter. |
| F4 | Menampilkan daftar tugas | Tugas baru langsung muncul di bawah kolom input. |
| F5 | Menandai selesai | Klik checkbox mengubah status tugas menjadi selesai (teks dicoret). |
| F6 | Membatalkan selesai | Klik checkbox lagi mengembalikan status menjadi belum selesai. |
| F7 | Menyimpan status | Status selesai tersimpan di database. |
| F8 | Ringkasan tugas | Menampilkan jumlah tugas yang belum selesai (opsional). |

## 6. Alur Pengguna

1. Pengguna membuka halaman utama.
2. Pengguna mengetik tugas di kolom input.
3. Pengguna klik Simpan atau menekan Enter.
4. Tugas muncul di daftar di bawah kolom input.
5. Saat tugas selesai, pengguna mencentang checkbox dan tampilannya berubah.

## 7. Kebutuhan Desain Antarmuka

- Tata letak satu halaman, berpusat secara vertikal.
- Urutan elemen: judul, tagline, kolom input dengan tombol Simpan, lalu daftar tugas.
- Tugas yang sudah selesai ditampilkan dengan teks dicoret dan warna abu-abu.
- Satu warna aksen untuk tombol Simpan dan checkbox.
- Saat belum ada tugas, tampilkan pesan "Belum ada tugas, mulai tulis di atas".
- Di layar kecil (HP), kolom input dan tombol tersusun ke bawah.

## 8. Kebutuhan Non-Fungsional

- **Teknologi:** Laravel (versi terbaru), Blade untuk tampilan, dan MySQL untuk database. JavaScript sederhana atau AJAX dapat dipakai agar halaman tidak perlu reload.
- **Responsif:** Tampilan berfungsi dengan baik di desktop dan HP.
- **Kinerja:** Menambah atau mencentang tugas selesai dalam waktu kurang dari 1 detik.
- **Keamanan dasar:** Menggunakan proteksi CSRF bawaan Laravel dan validasi input di sisi server.

## 9. Model Data

Tabel: `tasks`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint, auto increment | Primary key |
| title | string (255) | Isi tugas |
| is_completed | boolean, default `false` | Status selesai |
| created_at | timestamp | Otomatis dari Laravel |
| updated_at | timestamp | Otomatis dari Laravel |

## 10. Rute dan Endpoint (Rencana)

| Metode | URL | Fungsi |
|--------|-----|--------|
| GET | `/` | Menampilkan landing page dan daftar tugas |
| POST | `/tasks` | Menyimpan tugas baru |
| PATCH | `/tasks/{id}/toggle` | Mengubah status selesai tugas |

## 11. Kriteria Keberhasilan

- Pengguna dapat menambah tugas dan melihatnya langsung di daftar.
- Status centang tetap tersimpan setelah halaman di-refresh.
- Tidak ada tugas kosong yang tersimpan.

## 12. Pertanyaan Terbuka

- Apakah tugas yang sudah selesai tetap ditampilkan di daftar, atau disembunyikan?
- Apakah daftar tugas cukup disimpan secara global, atau perlu dipisah per pengguna di versi berikutnya?
