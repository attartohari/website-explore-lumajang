# Dokumentasi Resmi Website Explore Lumajang

**Versi Dokumen:** 2.0  
**Tanggal Pembaruan:** Januari 2026  
**Status:** Live Development

---

## 1. Gambaran Umum Proyek

**Explore Lumajang** adalah platform digital berbasis web yang dirancang khusus untuk memperkenalkan, mempromosikan, dan memudahkan akses informasi pariwisata di Kabupaten Lumajang. Berbeda dengan portal berita atau blog wisata biasa, website ini dibangun dengan konsep **"User-Centric Exploration"**, di mana pengalaman pengguna dalam menemukan destinasi yang tepat menjadi prioritas utama.

### Tujuan Utama
1.  **Sentralisasi Informasi:** Menyediakan satu pintu informasi yang lengkap, valid, dan terkurasi mengenai destinasi wisata alam, budaya, dan kuliner di Lumajang.
2.  **Kemudahan Eksplorasi:** Membantu wisatawan (baik lokal maupun mancanegara) menemukan tempat wisata yang sesuai dengan preferensi, _mood_, dan kebutuhan logistik mereka.
3.  **Manajemen Konten Efisien:** Memberikan kendali penuh kepada pengelola (admin) untuk memperbarui konten secara _real-time_ tanpa ketergantungan pada tim teknis (developer).

### Target Pengguna
*   **Wisatawan Lokal & Backpacker:** Mencari informasi akses, biaya murah, dan rute alternatif.
*   **Keluarga & Grup:** Membutuhkan informasi fasilitas, keamanan, dan aksesibilitas untuk anak-anak atau lansia.
*   **Fotografer & Kreator Konten:** Mencari _hidden gems_ dan spot foto terbaik.

---

## 2. Struktur & Fitur Website (Area Publik)

Sisi publik website dirancang dengan antarmuka yang modern, responsif, dan mengedepankan visual. Setiap halaman memiliki peran spesifik dalam _customer journey_ wisatawan.

### A. Halaman Utama (Home)
Halaman ini berfungsi sebagai "etalase" yang memikat pengguna dalam 3 detik pertama kunjungan.

*   **Hero Section & Slider:**
    *   Menggunakan gambar resolusi tinggi dengan efek visual sinematik.
    *   Dilengkapi dengan **carousel destinasi unggulan** yang interaktif. User bisa melihat _highlight_ wisata populer langsung tanpa _scroll_.
    *   Navigasi cepat untuk langsung melompat ke bagian yang diminati.
*   **Peta Interaktif (Welcome Section):**
    *   Menampilkan sebaran lokasi wisata secara visual di peta.
    *   Memberikan gambaran geografis Lumajang kepada wisatawan luar kota.
*   **Kisah Mereka (Testimoni):**
    *   Menampilkan ulasan dan cerita pengalaman dari wisatawan lain untuk membangun kepercayaan (_domain authority_).
*   **Tips Singkat & Info Premium:**
    *   Cuplikan artikel panduan dan sorotan wisata premium untuk memberikan wawasan tambahan.
*   **Footer Informatif:**
    *   Akses cepat ke halaman legal (Kebijakan Privasi, Syarat & Ketentuan), kontak, dan formulir berlangganan _newsletter_.

### B. Halaman Destinasi (Pusat Eksplorasi)
Ini adalah jantung dari website, di mana pengguna mencari dan memilah tempat wisata. Fitur kuncinya meliputi:

*   **Filter Suasana Hati (_Mood Chips_):**
    *   Inovasi filter berbasis psikografis, bukan hanya geografis. Pengguna bisa memilih filter seperti "Healing", "Keluarga", "Adrenalin", atau "Air Terjun".
    *   Desain tombol yang _center-aligned_ dan mudah diakses di perangkat ponsel.
*   **Widget Tren & Musim:**
    *   **Trending Badge:** Menandai destinasi yang sedang populer minggu ini.
    *   **Season Badge:** Memberikan informasi krusial apakah destinasi tersebut cocok dikunjungi di "Musim Kemarau", "Musim Hujan", atau "All Season". Ini sangat penting untuk keselamatan wisata alam.
*   **Playlist Wisata:**
    *   Konsep kurasi mirip aplikasi musik (misalnya: "Mengejar Matahari Terbit", "Wisata Ramah Anak").
    *   Disajikan dalam bentuk _grid card_ yang rapi, membantu user yang bingung memilih satu per satu.
*   **Integrasi Peta Dinamis:**
    *   Daftar kartu destinasi terhubung langsung dengan peta di sisi layar (pada desktop). Saat user mengklik kartu, peta akan otomatis fokus ke lokasi tersebut.
*   **Manajemen Koleksi (Favorit):**
    *   User dapat menyimpan destinasi ke dalam daftar "Koleksi" pribadi dengan menekan tombol hati. Data ini tersimpan (via _localStorage_ atau akun) sehingga daftar keinginan tidak hilang.

### C. Halaman Detail Wisata
Halaman "landing" terakhir sebelum user memutuskan untuk berangkat. Dirancang sebagai _One-Stop Information Center_.

*   **Informasi Dasar & Logistik:** Jam operasional, harga tiket terbaru, tingkat kesulitan akses, dan estimasi waktu perjalanan.
*   **Deskripsi Naratif:** Penjelasan mendalam tentang daya tarik tempat tersebut.
*   **Spot Foto Terbaik:** Rekomendasi titik pengambilan gambar untuk kebutuhan media sosial.
*   **Fasilitas Sekitar:** Informasi warung makan, toilet, musholla, dan penginapan terdekat.
*   **Peta & Navigasi:** Tombol "Rute" yang terintegrasi langsung dengan Google Maps atau Waze untuk navigasi _turn-by-turn_.

### D. Halaman Tips & Artikel
*   **Panduan Perjalanan:** Artikel mendalam tentang persiapan fisik, perlengkapan, dan etika berwisata.
*   **Fitur Notepad/Checklist:** Fitur interaktif sederhana di mana user bisa mencentang barang bawaan atau membaca daftar periksa persiapan perjalanan agar tidak ada yang tertinggal.

---

## 3. Sistem Admin Panel (Backend & Manajemen)

Salah satu keunggulan teknis terbesar dari Explore Lumajang adalah sistem **Admin Panel** yang terintegrasi penuh dengan basis data **Supabase**. Ini memastikan website tidak statis dan bisa hidup dalam jangka panjang.

### Teknologi Backend
Website menggunakan **Supabase** sebagai _Backend-as-a-Service_ (BaaS), yang menangani:
*   Basis Data (PostgreSQL)
*   Autentikasi (Sistem Login Admin)
*   Penyimpanan File (Storage untuk foto wisata)

### Modul Pengelolaan
Admin Panel memiliki beberapa menu manajerial:

1.  **Home Manager:**
    *   Mengganti gambar dan teks di Hero Section.
    *   Mengatur urutan section di halaman depan.
2.  **Destination Manager (CRUD):**
    *   **Create/Add:** Menambah destinasi baru dengan formulir lengkap (nama, koordinat, harga, deskripsi).
    *   **Edit:** Memperbarui informasi jika ada perubahan harga tiket atau jam buka.
    *   **Delete/Archive:** Menyembunyikan destinasi yang tutup sementara.
    *   **Manage Photos:** Mengunggah dan menghapus galeri foto destinasi.
3.  **Detail Manager:**
    *   Menambahkan bagian khusus pada halaman detail (misalnya peringatan bahaya longsor atau promo musiman).
4.  **Tips & Artikel Manager:**
    *   Menulis dan menerbitkan artikel blog atau panduan wisata baru.
5.  **Inbox & Newsletter:**
    *   Melihat pesan masuk dari formulir "Kontak Kami".
    *   Mengelola daftar email pelanggan newsletter.

### Keunggulan Sistem Admin
*   **Real-time Updates:** Perubahan yang ditekan "Save" di admin akan langsung muncul di website publik detik itu juga (cukup _refresh_ halaman).
*   **Tanpa Edit Kode:** Admin tidak perlu menyentuh HTML/CSS sama sekali untuk operasional harian.
*   **Keamanan Data:** Sistem dilindungi login terenkripsi, memastikan hanya pihak berwenang yang bisa mengubah konten.

---

## 4. Keunggulan Kompetitif Website

Mengapa Explore Lumajang lebih unggul dibandingkan website profil wisata standar?

1.  **Desain Berbasis Pengalaman Pengguna (UX-First):**
    Tata letak tidak kaku. Penggunaan _mood chips_, _playlist_, dan _card_ interaktif membuat proses pencarian wisata terasa seperti menggunakan aplikasi modern, bukan sekadar membaca brosur digital.

2.  **Filter Cerdas & Kontekstual:**
    Sistem tidak hanya menawarkan pencarian nama, tetapi juga pencarian berdasarkan konteks (suasana hati, musim, dan tren). Ini menjawab pertanyaan pengguna yang seringkali masih abstrak ("Ke mana ya yang enak buat santai?").

3.  **Integrasi Data Terpusat:**
    Dengan Supabase, seluruh data (destinasi, artikel, galeri) terpusat. Hal ini memungkinkan skalabilitas – misalnya di masa depan ingin membuat aplikasi mobile (Android/iOS), aplikasi tersebut bisa mengambil data dari sumber database yang sama tanpa perlu input ulang.

4.  **Visual yang Menggugah:**
    Fokus pada aset gambar berkualitas tinggi, tipografi yang mudah dibaca (Outfit & Playfair Display), serta penggunaan ruang putih (_whitespace_) yang tepat menciptakan kesan premium dan profesional.

5.  **Kesiapan Ekspansi (Scalable):**
    Arsitektur kode yang modular memungkinkan penambahan fitur di masa depan seperti:
    *   _User Account & Community Review_ (Ulasan pengguna).
    *   _Direct Booking System_ (Pemesanan tiket masuk/paket wisata).
    *   _Analytics Dashboard_ (Memantau destinasi mana yang paling banyak dilihat).

---

## 5. Ringkasan & Arah Pengembangan

**Explore Lumajang** saat ini telah mencapai tahap **Website Informasi Wisata Interaktif (Web 2.0)**. Sistem sudah stabil untuk digunakan sebagai media promosi utama pariwisata daerah.

**Langkah Selanjutnya (Roadmap):**
Fase pengembangan berikutnya disarankan untuk berfokus pada **Interaksi Pengguna**, seperti membuka fitur pendaftaran akun bagi wisatawan agar mereka bisa menulis ulasan, mengunggah foto mereka sendiri (_User Generated Content_), dan berinteraksi dalam forum komunitas. Dengan fondasi teknis yang kuat saat ini, pengembangan fitur-fitur tersebut dapat dilakukan dengan efisien.

---
_Dokumen ini dibuat untuk kepentingan internal dan eksternal proyek Explore Lumajang._
