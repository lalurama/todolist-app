# Aplikasi Web To-Do List Sederhana

Aplikasi to-do list modern dan responsif yang dibangun menggunakan **Laravel 13**, **Inertia.js (React 19 + TypeScript)**, **Tailwind CSS v4**, dan **MySQL**.

---

## Fitur Utama

- **Pencatatan Tugas Cepat**: Tambah tugas baru secara instan tanpa perlu login.
- **Tandai Selesai**: Centang checkbox untuk menandai tugas telah selesai dengan efek teks dicoret dan status tersimpan di database.
- **Penyusunan Posisi Tugas**: Komponen tugas dapat dipindahkan urutannya menggunakan *drag and drop* atau tombol navigasi atas/bawah yang ramah aksesibilitas.
- **Hapus Tugas**: Hapus tugas dengan aman melalui dialog konfirmasi pencegah klik tidak sengaja.
- **Dukungan Tema**: Mode tampilan Gelap (Dark) dan Terang (Light) yang persisten.
- **Responsif**: Tampilan optimal untuk layar desktop maupun ponsel pintar (smartphone).

---

## Kebutuhan Sistem Server (Production)

Sebelum memulai instalasi di server production (seperti Ubuntu 22.04 / 24.04 LTS), pastikan perangkat lunak berikut telah terpasang:

- **PHP**: Versi >= 8.3
  - Ekstensi PHP yang dibutuhkan: `php8.3-fpm`, `php8.3-mysql`, `php8.3-mbstring`, `php8.3-xml`, `php8.3-bcmath`, `php8.3-curl`, `php8.3-zip`, `php8.3-intl`
- **Database Server**: MySQL >= 8.0 atau MariaDB >= 10.5
- **Web Server**: Nginx (sangat disarankan) atau Apache
- **Composer**: Versi >= 2.x
- **Node.js**: Versi >= 20.x (disertai `npm`)
- **Git**

---

## Panduan Instalasi di Server Production

Berikut adalah langkah lengkap untuk mendistribusikan (*deploy*) aplikasi ini ke server Linux Ubuntu:

### 1. Kloning Repositori

Letakkan kode proyek di direktori web server (misalnya di `/var/www/todolist-app`):

```bash
cd /var/www
git clone <URL_REPOSITORY_ANDA> todolist-app
cd todolist-app
```

### 2. Atur Kepemilikan dan Izin Direktori (*File Permissions*)

Web server (Nginx/Apache) memerlukan hak akses tulis pada folder `storage` dan `bootstrap/cache`:

```bash
# Ubah kepemilikan ke pengguna web server (biasanya www-data)
sudo chown -R www-data:www-data /var/www/todolist-app

# Berikan izin tulis yang tepat
sudo chmod -R 775 /var/www/todolist-app/storage
sudo chmod -R 775 /var/www/todolist-app/bootstrap/cache
```

### 3. Konfigurasi Environment (`.env`)

Salin berkas template environment:

```bash
cp .env.example .env
```

Buka dan sesuaikan berkas `.env`:

```bash
nano .env
```

Pastikan variabel berikut disesuaikan untuk mode production:

```dotenv
APP_NAME="To-Do List"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://domainanda.com

# Konfigurasi Database MySQL
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=todolist_app
DB_USERNAME=nama_pengguna_mysql
DB_PASSWORD=kata_sandi_rahasia_mysql
```

> **Catatan:** Pastikan database `todolist_app` telah dibuat di MySQL sebelum melanjutkan ke langkah migrasi.

### 4. Pasang Dependensi PHP (Composer)

Jalankan instalasi Composer dengan flag khusus production untuk mengabaikan paket dev dan mengoptimalkan autoloader:

```bash
composer install --no-dev --optimize-autoloader
```

### 5. Generate Application Key

Buat kunci enkripsi aplikasi:

```bash
php artisan key:generate --force
```

### 6. Jalankan Migrasi Database

Jalankan migrasi tabel ke database MySQL:

```bash
php artisan migrate --force
```

Perintah di atas akan membuat tabel `tasks`, `users`, `cache`, dan tabel pendukung lainnya.

### 7. Pasang Dependensi Node.js dan Bangun Aset Frontend (*Build*)

Lakukan kompilasi aset React, TypeScript, dan Tailwind CSS:

```bash
npm ci
npm run build
```

Setelah kompilasi selesai, direktori `public/build` akan terisi berkas bundle produksi (CSS dan JS yang telah diminifikasi).

### 8. Optimasi Cache Laravel

Aktifkan *caching* konfigurasi, rute, dan tampilan untuk performa optimal di production:

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Konfigurasi Web Server

### Contoh Konfigurasi Nginx

Buat berkas konfigurasi virtual host baru di `/etc/nginx/sites-available/todolist-app`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name domainanda.com;
    root /var/www/todolist-app/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Aktifkan konfigurasi dan muat ulang Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/todolist-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Konfigurasi SSL Gratis (HTTPS) dengan Certbot

Amankan domain Anda menggunakan sertifikat Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d domainanda.com
```

---

## Alur Pembaruan Aplikasi (*Update Deployment*)

Saat melakukan pembaruan kode di masa mendatang, jalankan langkah rutin berikut:

```bash
cd /var/www/todolist-app

# 1. Aktifkan mode maintenance (opsional, agar pengguna mendapat halaman informasi saat update)
php artisan down

# 2. Tarik kode terbaru
git pull origin main

# 3. Update dependensi jika ada perubahan
composer install --no-dev --optimize-autoloader
npm ci

# 4. Bangun ulang aset frontend
npm run build

# 5. Jalankan migrasi database baru jika ada
php artisan migrate --force

# 6. Bersihkan dan segarkan cache
php artisan optimize:clear
php artisan optimize

# 7. Matikan mode maintenance
php artisan up
```

---

## Pemecahan Masalah (*Troubleshooting*)

1. **Error 500 (Internal Server Error)**:
   - Periksa log aplikasi di `storage/logs/laravel.log`.
   - Pastikan izin folder `storage` dan `bootstrap/cache` sudah benar (`chown -R www-data:www-data`).
   - Pastikan variabel `APP_KEY` di berkas `.env` sudah terisi.
2. **Koneksi Database Gagal**:
   - Pastikan layanan MySQL sedang berjalan (`sudo systemctl status mysql`).
   - Verifikasi kembali kecocokan username, password, dan nama database di `.env`.
3. **Aset CSS/JS Tidak Terbaca (Tampilan Rusak)**:
   - Pastikan perintah `npm run build` berhasil dijalankan.
   - Pastikan nilai `APP_URL` di berkas `.env` sesuai dengan domain yang sedang diakses (misal `https://domainanda.com`).
