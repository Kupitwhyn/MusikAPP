# PLATFORM ARSIP MUSIK — PROMPT PENGEMBANGAN UTAMA

## 1. Gambaran Umum Proyek

Bangun platform arsip musik digital lintas platform yang berfokus pada **pengarsipan, pendokumentasian, penemuan, dan pemutaran karya musik yang telah selesai**.

Platform ini BUKAN dimaksudkan sebagai tiruan Spotify, DAW, platform produksi musik kolaboratif, ataupun marketplace musik.

Tujuan utamanya adalah:

> Menyediakan arsip digital terstruktur bagi musisi untuk menyimpan karya musik mereka yang telah selesai, termasuk audio, artwork, metadata, kredit, dan informasi proyek, sekaligus memungkinkan pendengar menemukan dan mendengarkan karya tersebut melalui aplikasi mobile.

Sistem ini memiliki 3 peran pengguna:

1. **Super Admin**
2. **Musisi**
3. **Audiens / Pendengar**

Ada 2 platform klien:

- **Aplikasi web** → Super Admin + Musisi
- **Aplikasi mobile** → Audiens

Semua klien berkomunikasi dengan API backend terpusat.

---

# 2. Konsep Produk Inti

Entitas utama platform ini adalah **Karya / Karya Musik**.

Satu Karya mewakili **satu lagu final yang telah selesai**.

Sebuah Karya terdiri dari:

- File audio
- Artwork / sampul
- Metadata dasar
- Kredit produksi
- Lirik (opsional)
- Asosiasi proyek/album (opsional)
- Label versi (opsional)

Sistem harus memperlakukan Karya sebagai objek utama pengarsipan.

JANGAN memperlakukan file audio itu sendiri sebagai entitas utama.

Contoh:

### Karya

Judul:  
"Pulang"

Artis:  
"Suara Senja"

Dibuat:  
12 Januari 2026

Dirilis:  
25 Januari 2026

Genre:  
Alternative Rock

Durasi:  
04:32

Komposer:  
A

Penulis lirik:  
B

Produser:  
C

Rekaman:  
Studio X

Versi:  
Final 3

Proyek:  
Album Rumah

---

# 3. Aturan Bisnis Penting

Terapkan aturan berikut secara tepat.

### Aturan Karya

- Sebuah Karya mewakili satu lagu final yang telah selesai.
- Musisi mengunggah karya yang telah selesai.
- Audiens hanya dapat melihat/mendengarkan karya final yang telah dipublikasikan.
- Semua karya yang dipublikasikan otomatis bersifat publik.
- Pada MVP, tidak ada mode karya privat.
- Satu Karya hanya dimiliki oleh satu akun Musisi.
- Sebuah Karya dapat menjadi bagian dari satu Proyek (opsional).
- Sebuah Proyek dapat berisi beberapa Karya.
- Karya dapat dibuat tanpa Proyek.
- Versi bersifat OPSIONAL.
- Versi terutama merupakan kolom metadata seperti "Final", "Final 2", atau "Final 3".
- JANGAN menerapkan riwayat versi multi-file yang kompleks pada MVP.
- Persetujuan Super Admin sebelum publikasi TIDAK diwajibkan.
- Super Admin dapat memoderasi/menghapus konten setelah dipublikasikan.

### Kredit

Musisi pemilik Karya adalah akun yang bertanggung jawab atas Karya yang diarsipkan tersebut.

Namun, Karya dapat memuat kredit untuk orang lain.

Contohnya:

Artis:
Suara Senja

Komposer:
A

Penulis lirik:
B

Produser:
C

Rekaman:
Studio X

Orang-orang yang dicantumkan dalam kredit tersebut TIDAK perlu memiliki akun platform.

Pada tahap awal, kredit dapat disimpan sebagai kolom teks.

---

# 4. Peran Pengguna

## 4.1 SUPER ADMIN

Super Admin hanya dapat menggunakan aplikasi WEB.

Tanggung jawab utama:

- Mengelola pengguna
- Mengelola musisi
- Mengelola karya
- Mengelola genre
- Memoderasi konten
- Menangani laporan
- Melihat statistik platform
- Mengelola pengaturan dasar platform

Dalam alur kerja normal, Super Admin sebaiknya TIDAK membuat karya musik atas nama musisi.

---

## 4.2 MUSISI

Musisi hanya dapat menggunakan aplikasi WEB.

Tanggung jawab utama:

- Mengelola profil
- Membuat karya
- Mengunggah audio
- Mengunggah artwork
- Mengisi metadata
- Mengisi kredit
- Menambahkan lirik
- Mengaitkan karya dengan proyek
- Mengedit karya yang sudah ada
- Menghapus karya milik sendiri
- Mengelola proyek
- Melihat arsip mereka sendiri

Musisi harus memiliki dashboard khusus.

---

## 4.3 AUDIENS

Pengguna Audiens hanya dapat menggunakan aplikasi MOBILE.

Tanggung jawab utama:

- Menemukan karya
- Mencari karya
- Menjelajahi genre
- Menjelajahi profil musisi
- Melihat detail karya
- Mendengarkan audio
- Menambahkan karya ke favorit
- Melihat profil musisi

Fitur opsional untuk versi selanjutnya:

- Mengikuti musisi
- Playlist
- Riwayat mendengarkan
- Komentar
- Notifikasi
- Berbagi

JANGAN memasukkan fitur opsional ini ke dalam MVP kecuali memang diperlukan.

---

# 5. APLIKASI WEB

Aplikasi web melayani pengguna Super Admin dan Musisi.

Gunakan kontrol akses berbasis peran untuk menampilkan dashboard yang berbeda.

## Navigasi Web Musisi

Saran navigasi:

- Dashboard
- Karya Saya
- Tambah Karya
- Proyek
- Profil

### Dashboard Musisi

Tampilkan:

- Jumlah karya
- Jumlah proyek
- Karya yang baru ditambahkan
- Karya yang baru diperbarui

Contoh:

```text
ARSIP SAYA

Jumlah Karya: 12
Proyek: 4

Karya Terbaru

Pulang
Alternative Rock
2026

Malam
Indie
2026

Jalan
Alternative
2025
```

---

# 6. ALUR PEMBUATAN KARYA

Buat formulir yang rapi untuk menambahkan Karya baru.

Kolom:

### Wajib

- Judul
- File audio
- Artis
- Genre
- Tanggal dibuat
- Tanggal dirilis

### Opsional

- Artwork
- Komposer
- Penulis lirik
- Produser
- Rekaman
- Versi
- Proyek
- Lirik

Contoh formulir:

```text
BUAT KARYA BARU

Judul
[________________________]

Audio
[ Unggah Audio ]

Artwork
[ Unggah Artwork ]

Artis
[________________________]

Genre
[ Pilih Genre ]

Tanggal Dibuat
[ HH/BB/TTTT ]

Tanggal Dirilis
[ HH/BB/TTTT ]

Komposer
[________________________]

Penulis Lirik
[________________________]

Produser
[________________________]

Rekaman
[________________________]

Versi
[________________________]

Proyek
[ Pilih Proyek ]

Lirik
[________________________]

[ SIMPAN & PUBLIKASIKAN ]
```

Setelah pengiriman berhasil:

1. Validasi data.
2. Unggah audio ke penyimpanan file/objek.
3. Unggah artwork jika disediakan.
4. Simpan metadata ke PostgreSQL.
5. Buat data Karya publik.
6. Segera sediakan Karya tersebut untuk aplikasi mobile Audiens.

---

# 7. HALAMAN DETAIL KARYA — WEB

Musisi harus dapat melihat Karya yang telah mereka arsipkan.

Tampilkan:

- Artwork
- Judul
- Artis
- Pemutar audio
- Genre
- Tanggal dibuat
- Tanggal dirilis
- Durasi
- Komposer
- Penulis lirik
- Produser
- Rekaman
- Versi
- Proyek
- Lirik

Sediakan:

- Edit
- Hapus

---

# 8. PROYEK / ALBUM

Proyek adalah kumpulan Karya.

Contoh:

```text
PROYEK
Album Rumah

1. Pulang
2. Rumah
3. Malam
4. Jalan
```

Kolom Proyek:

- Judul
- Deskripsi
- Artwork
- Tanggal dibuat
- Tanggal dirilis

Sebuah Karya dapat menjadi bagian dari nol atau satu Proyek.

Sebuah Proyek dapat berisi banyak Karya.

---

# 9. WEB SUPER ADMIN

Buat Dashboard Admin terpisah.

Navigasi:

- Dashboard
- Pengguna
- Musisi
- Karya
- Genre
- Laporan
- Pengaturan

Statistik dashboard:

```text
TOTAL PENGGUNA
TOTAL MUSISI
TOTAL AUDIENS
TOTAL KARYA
TOTAL PROYEK
TOTAL LAPORAN
```

Admin dapat:

### Pengguna

- Melihat pengguna
- Mencari pengguna
- Memfilter berdasarkan peran
- Menangguhkan pengguna
- Menghapus pengguna

### Karya

- Melihat semua karya
- Mencari karya
- Memfilter berdasarkan genre
- Melihat detail karya
- Menghapus karya yang tidak pantas

### Genre

- Membuat genre
- Mengedit genre
- Menghapus genre

### Laporan

- Melihat konten yang dilaporkan
- Meninjau laporan
- Mengambil tindakan moderasi

---

# 10. APLIKASI MOBILE

Aplikasi mobile dikhususkan untuk pengguna Audiens.

Rancang aplikasi mobile dengan alur:

> TEMUKAN → DENGARKAN → JELAJAHI

Saran navigasi bawah:

```text
Beranda
Cari
Koleksi
Profil
```

---

# 11. BERANDA MOBILE

Beranda harus berisi:

- Karya unggulan/terbaru
- Karya yang baru dirilis
- Karya populer
- Kategori genre
- Bagian rekomendasi untuk penemuan karya

Pada MVP, buat logika rekomendasi tetap sederhana.

JANGAN menerapkan algoritma rekomendasi AI yang kompleks.

---

# 12. PENCARIAN

Pengguna harus dapat mencari berdasarkan:

- Judul Karya
- Artis / Musisi
- Genre
- Proyek

Contoh:

```text
Cari

[ Pulang________________ ]

Hasil

Pulang
Suara Senja
Alternative Rock
```

Pencarian harus cepat dan mendukung pencocokan sebagian.

---

# 13. DETAIL KARYA — MOBILE

Contoh:

```text
[ ARTWORK SAMPUL ]

PULANG
Suara Senja

▶ ━━━━━━━━━━━━━━━

Alternative Rock

Dibuat
12 Januari 2026

Dirilis
25 Januari 2026

Proyek
Album Rumah

Kredit

Komposer
A

Penulis Lirik
B

Produser
C

Rekaman
Studio X

Lirik
...
```

Aksi:

- Putar
- Jeda
- Favorit

---

# 14. PROFIL MUSISI — MOBILE

Tampilkan:

- Gambar profil
- Nama musisi
- Bio
- Genre
- Karya yang dipublikasikan
- Proyek

Contoh:

```text
SUARA SENJA

Alternative Rock

Tentang
...

Karya

Pulang
Rumah
Jalan
```

Gunakan URL file yang aman atau signed URL jika sesuai.

---

# 15. MODEL DATA

Gunakan PostgreSQL sebagai basis data relasional utama.

Entitas yang disarankan:

```text
User
MusicianProfile
AudienceProfile
Work
Project
Genre
Favorite
Report
```

Relasi yang mungkin:

```text
User
 │
 ├── MusicianProfile
 │       │
 │       ├── Work
 │       │    │
 │       │    └── Project
 │       │
 │       └── Project
 │
 └── AudienceProfile
        │
        └── Favorite

Genre
 │
 └── Work

Work
 │
 └── Report
```

---

# 16. PRINSIP BASIS DATA PENTING

JANGAN menyimpan file audio berukuran besar secara langsung di dalam PostgreSQL.

PostgreSQL sebaiknya menyimpan:

- Metadata
- Informasi pengguna
- Relasi
- URL file / kunci penyimpanan

Audio dan artwork sebaiknya disimpan di penyimpanan file/objek.

Contoh:

```text
PostgreSQL

works
--------------------------------
id
musician_id
project_id
genre_id
title
artist
created_at
released_at
duration
composer
lyricist
producer
recording
version
audio_url
artwork_url
lyrics
created_timestamp
updated_timestamp

Penyimpanan objek

/music/
    /musician_id/
        /work_id/
            audio.ext
            artwork.ext
```

---

# 17. ARSITEKTUR API

Kedua klien harus berkomunikasi dengan backend melalui API.

Arsitektur:

```text
WEB
 │
 ├── Super Admin
 └── Musisi
       │
       ▼
     REST API
       │
       ▼
    BACKEND
       │
       ├── PostgreSQL
       │
       └── Penyimpanan Objek


MOBILE
 │
 └── Audiens
       │
       ▼
     REST API
       │
       ▼
    BACKEND
```

Jangan izinkan klien memanipulasi basis data PostgreSQL secara langsung.

Terapkan autentikasi dan otorisasi di backend.

---

# 18. AUTENTIKASI

Terapkan:

- Pendaftaran
- Login
- Logout
- Hashing kata sandi
- Pengaturan ulang kata sandi
- Autentikasi berbasis sesi/token

Peran:

```text
SUPER_ADMIN
MUSICIAN
AUDIENCE
```

Terapkan otorisasi berbasis peran.

Aturan:

```text
SUPER_ADMIN → WEB
MUSICIAN    → WEB
AUDIENCE    → MOBILE
```

Backend harus menegakkan izin, termasuk jika klien mencoba mengirim permintaan API yang tidak berwenang.

---

# 19. PENANGANAN AUDIO

Platform ini merupakan platform arsip dan pemutaran.

Dukung format audio umum, seperti:

- MP3
- WAV
- FLAC
- M4A

Jika diperlukan, normalisasi atau transkode audio agar dapat diputar di mobile.

Simpan metadata audio:

- Durasi
- Ukuran file
- Format
- Bitrate jika tersedia

Pemutar audio harus mendukung:

- Putar
- Jeda
- Lompat ke posisi tertentu
- Progres
- Durasi
- Volume

Di mobile, sediakan mini-player yang selalu terlihat jika memungkinkan.

---

# 20. ARAH DESAIN

Identitas visual sebaiknya terasa seperti perpaduan antara:

- Arsip musik digital
- Pustaka media modern
- Arsip editorial
- Platform musik kontemporer

Hindari tampilan seperti tiruan Spotify generik.

Desain harus menonjolkan:

- Artwork
- Tipografi
- Metadata
- Identitas musisi
- Struktur arsip

Gunakan antarmuka modern dan bersih dengan hierarki visual yang kuat.

### Web

Prioritaskan:

- Dashboard yang efisien
- Tabel
- Formulir
- Metadata
- Pengelolaan file
- Alur kerja desktop

### Mobile

Prioritaskan:

- Artwork
- Penemuan musik
- Target sentuh berukuran besar
- Navigasi sederhana
- Pemutaran audio
- Pengguliran yang mulus

Terapkan perilaku responsif yang sesuai untuk setiap platform.

---

# 21. CAKUPAN MVP

MVP WAJIB berfokus pada fitur-fitur berikut.

### Web Super Admin

- Login
- Dashboard
- Pengelolaan pengguna
- Pengelolaan musisi
- Pengelolaan karya
- Pengelolaan genre
- Moderasi konten
- Laporan

### Web Musisi

- Pendaftaran/login
- Profil
- Dashboard
- Membuat Karya
- Mengunggah audio
- Mengunggah artwork
- Metadata
- Kredit
- Proyek
- Mengedit Karya
- Menghapus Karya
- Melihat arsip sendiri

### Mobile Audiens

- Pendaftaran/login
- Beranda
- Pencarian
- Penjelajahan genre
- Penjelajahan musisi
- Detail Karya
- Pemutar audio
- Profil musisi
- Favorit

---

# 22. FITUR YANG TIDAK DIPERLUKAN UNTUK MVP

JANGAN menerapkan fitur-fitur berikut kecuali diminta secara khusus:

- Perangkat produksi musik
- DAW
- Penyuntingan kolaboratif
- Kolaborasi real-time
- Kontrol versi yang kompleks
- Lisensi musik
- Monetisasi
- Sistem royalti
- Langganan
- Marketplace
- Rekomendasi AI
- Pembuatan musik dengan AI
- Siaran langsung
- Chat
- Pesan
- Jejaring sosial tingkat lanjut
- Komentar yang kompleks
- Sistem pengelolaan hak cipta
- Kepemilikan Karya oleh beberapa musisi

Jaga agar cakupan MVP tetap terfokus.

---

# 23. PRINSIP PENGEMBANGAN

Bangun sistem secara bertahap.

Jangan membuat arsitektur yang terlalu kompleks.

Prioritaskan:

1. Model data yang benar
2. Autentikasi
3. Otorisasi berbasis peran
4. Pembuatan Karya
5. Unggah file
6. Penemuan Karya
7. Pemutaran audio
8. Pencarian
9. Moderasi

Pisahkan dengan jelas:

```text
Frontend
Backend
Basis Data
Penyimpanan File
Autentikasi
```

Gunakan komponen dan layanan yang dapat digunakan kembali.

Validasi semua masukan di frontend dan backend.

Tangani:

- Status pemuatan
- Status kosong
- Progres unggah
- Kesalahan unggah
- Kesalahan API
- Kesalahan autentikasi
- File tidak valid
- Metadata yang tidak lengkap

Berikan pesan kesalahan yang bermanfaat.

---

# 24. HASIL YANG DIHARAPKAN

Sebelum menulis implementasi lengkap, hasilkan:

1. Arsitektur sistem
2. Rincian fitur/modul
3. Alur pengguna untuk setiap peran
4. ERD basis data
5. Skema basis data
6. Spesifikasi endpoint API
7. Desain autentikasi/otorisasi
8. Arsitektur penyimpanan file
9. Arsitektur informasi web
10. Arsitektur informasi mobile
11. Rencana implementasi MVP

Setelah itu, implementasikan sistem secara bertahap.

Jangan melewati tahap arsitektur dan langsung membuat UI/kode secara acak.

Sistem akhir harus mudah dipelihara, dapat diskalakan, dan sesuai untuk proyek rekayasa perangkat lunak akademik, dengan cakupan MVP yang tetap terkendali.
