# ☁️ CloudRoom

CloudRoom adalah sistem peminjaman ruangan berbasis web (Fullstack) yang dirancang untuk menyederhanakan proses reservasi ruangan. Aplikasi ini memungkinkan pengguna untuk melihat daftar ruangan, melakukan pemesanan (*booking*) berdasarkan waktu, dan mengelola riwayat peminjaman.

Proyek ini dibangun untuk memenuhi Tugas Besar (TUBES) mata kuliah terkait.

## 🚀 Fitur Utama
- **Katalog Ruangan:** Melihat daftar ruangan yang tersedia beserta informasi kapasitasnya.
- **Reservasi Cepat:** Melakukan peminjaman ruangan dengan menentukan tanggal, waktu mulai, dan waktu selesai.
- **Manajemen Riwayat:** Melihat daftar ruangan yang sedang dipesan dan fitur untuk membatalkan (*cancel*) reservasi.
- **Real-time Update:** Pembaruan antarmuka secara instan setelah data berhasil disimpan ke *database*.

## 🛠️ Teknologi yang Digunakan
- **Front-end:** React.js, Vite, Tailwind CSS
- **Back-end:** Node.js, Express.js
- **Database:** Local JSON File (`database.json`)

## 💻 Cara Menjalankan Proyek (Instalasi Lokal)

Pastikan kamu sudah menginstal [Node.js](https://nodejs.org/) di komputermu. Proyek ini membutuhkan dua terminal yang berjalan secara bersamaan (satu untuk Back-end, satu untuk Front-end).

### 1. Menjalankan Back-end (Server)
Buka terminal dan arahkan ke folder `backend`:
```bash
cd backend
npm install
npm start
```

TUBES-AWAN/
├── backend/
│   ├── data/
│   │   └── database.json    # Tempat penyimpanan data reservasi & ruangan
│   ├── server.js            # Entry point REST API (Express)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js       # Fungsi untuk memanggil API endpoint
│   │   ├── App.jsx          # Antarmuka utama aplikasi
│   │   └── index.css        # Konfigurasi Tailwind CSS
│   ├── tailwind.config.js
│   └── package.json
└── README.md
