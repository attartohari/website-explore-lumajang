# Cara Akses Admin Panel

Secara default, pengguna yang mendaftar di website hanya memiliki akses sebagai **User Public** (Guest). Untuk mengakses Admin Panel, Anda harus memberikan role `admin` secara manual ke akun Anda melalui Database Supabase.

Berikut adalah langkah-langkahnya:

## 1. Daftar Akun Baru
1. Buka website di browser (Live Server).
2. Klik icon user di pojok kanan atas navbar -> Pilih **Daftar / Login**.
3. Buat akun baru di halaman Register.
4. Setelah berhasil, Anda akan diarahkan ke login, silakan login.

## 2. Dapatkan User ID (UUID) Anda
Anda butuh User ID unik Anda.
1. Buka halaman helper yang telah kami siapkan: `http://127.0.0.1:5500/auth/my-id.html` (Sesuaikan port Live Server Anda).
2. Pastikan Anda sudah login.
3. Salin **User ID** yang muncul di layar.

## 3. Jalankan SQL di Supabase
1. Buka Dashboard Supabase Project Anda.
2. Masuk ke menu **SQL Editor**.
3. Buat query baru dan paste kode berikut (Ganti `YOUR_UUID_HERE` dengan ID yang Anda salin):

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_UUID_HERE', 'admin');
```

4. Klik **Run**.

## 4. Akses Admin
1. Kembali ke website.
2. Refresh halaman.
3. Di Navbar, sekarang akan muncul tombol **Dashboard** (ikon Speedometer) di sebelah icon User.
4. Atau akses langsung ke `/admin/dashboard.html`.
