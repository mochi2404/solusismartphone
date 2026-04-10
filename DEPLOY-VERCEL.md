# Deploy ke Vercel

## 1. Install dependency

```bash
npm install
```

## 2. Buat database Postgres

Rekomendasi untuk Vercel:

1. Buka project di Vercel
2. Tambahkan integrasi `Neon`
3. Ambil `DATABASE_URL`
4. Masukkan ke Environment Variables project Vercel

Untuk lokal, isi `.env.local`:

```bash
DATABASE_URL=postgres://USER:PASSWORD@HOST/DBNAME?sslmode=require
```

## 3. Struktur yang dipakai

- Website publik tetap HTML statis
- Backend booking ada di:
  - `/api/bookings`
  - `/api/stats`
- Dashboard admin baca data dari API yang sama

## 4. Deploy

```bash
vercel
```

Atau hubungkan repo ke dashboard Vercel lalu deploy biasa.

## 5. Flow data

1. Customer isi form di `track.html`
2. Data dikirim ke `/api/bookings`
3. Data tersimpan ke Postgres
4. `admin/index.html` dan `admin/bookings.html` ambil data dari API
