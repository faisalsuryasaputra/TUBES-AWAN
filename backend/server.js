const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;
const DATA_FILE = path.join(__dirname, 'data', 'database.json');

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Set CORS_ORIGIN di .env untuk production
}));
app.use(express.json());

const crypto = require('crypto');

// Helper untuk membaca file JSON
const readData = () => {
  if (!fs.existsSync(DATA_FILE)) return { rooms: [], reservations: [], users: [] };
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  if (!data.users) data.users = [];
  if (!data.reservations) data.reservations = [];
  return data;
};

// Helper untuk menulis ke file JSON
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// Hash password menggunakan SHA256
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Middleware Autentikasi menggunakan mock token
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Otorisasi ditolak. Silakan login terlebih dahulu." });
  }
  const token = authHeader.split(' ')[1];
  const parts = token.split('-');
  
  if (parts.length < 3 || parts[0] !== 'mock' || parts[1] !== 'token') {
    return res.status(401).json({ message: "Token tidak valid." });
  }
  
  const userId = parseInt(parts[2]);
  const data = readData();
  const user = data.users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(401).json({ message: "User tidak ditemukan." });
  }
  
  req.user = user;
  next();
};

// API: Ambil daftar ruangan
app.get('/api/rooms', (req, res) => {
  res.json(readData().rooms);
});

// ==================== AUTH API ====================

// API: Register User Baru
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Nama, email, dan password wajib diisi." });
  }

  const data = readData();
  const emailLower = email.toLowerCase();
  
  if (data.users.some(u => u.email === emailLower)) {
    return res.status(400).json({ message: "Email sudah terdaftar." });
  }

  const newUser = {
    id: Date.now(),
    name,
    email: emailLower,
    password: hashPassword(password)
  };

  data.users.push(newUser);
  writeData(data);

  const token = `mock-token-${newUser.id}-${Date.now()}`;
  res.status(201).json({
    message: "Registrasi berhasil.",
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email }
  });
});

// API: Login User
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi." });
  }

  const data = readData();
  const user = data.users.find(u => u.email === email.toLowerCase());

  if (!user || user.password !== hashPassword(password)) {
    return res.status(401).json({ message: "Email atau password salah." });
  }

  const token = `mock-token-${user.id}-${Date.now()}`;
  res.json({
    message: "Login berhasil.",
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

// API: Ambil Profil User
app.get('/api/auth/profile', authenticate, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  });
});

// ==================== RESERVATIONS API ====================

// API: Ambil daftar reservasi milik user yang sedang login
app.get('/api/reservations', authenticate, (req, res) => {
  const data = readData();
  const userReservations = data.reservations.filter(r => r.userId === req.user.id);
  res.json(userReservations);
});

// API: Buat reservasi baru
app.post('/api/reservations', authenticate, (req, res) => {
  const data = readData();
  const room = data.rooms.find(r => r.id === parseInt(req.body.roomId));
  
  if (!room) return res.status(404).json({ message: "Ruangan tidak ditemukan" });

  const newReservation = {
    id: Date.now(),
    roomId: room.id,
    roomName: room.name,
    userId: req.user.id,
    userName: req.user.name,
    date: req.body.date,
    startTime: req.body.startTime,
    endTime: req.body.endTime
  };

  data.reservations.push(newReservation);
  writeData(data);
  res.status(201).json({ message: "Berhasil", data: newReservation });
});

// API: Update reservasi
app.put('/api/reservations/:id', authenticate, (req, res) => {
  const data = readData();
  const index = data.reservations.findIndex(r => r.id === parseInt(req.params.id));
  
  if (index === -1) return res.status(404).json({ message: "Reservasi tidak ditemukan" });
  if (data.reservations[index].userId !== req.user.id) {
    return res.status(403).json({ message: "Anda tidak memiliki hak untuk mengedit reservasi ini." });
  }

  const room = data.rooms.find(r => r.id === parseInt(req.body.roomId));
  if (!room) return res.status(404).json({ message: "Ruangan tidak ditemukan" });

  data.reservations[index] = {
    ...data.reservations[index],
    roomId: room.id,
    roomName: room.name,
    date: req.body.date,
    startTime: req.body.startTime,
    endTime: req.body.endTime
  };

  writeData(data);
  res.json({ message: "Berhasil diupdate", data: data.reservations[index] });
});

// API: Hapus reservasi
app.delete('/api/reservations/:id', authenticate, (req, res) => {
  const data = readData();
  const index = data.reservations.findIndex(r => r.id === parseInt(req.params.id));
  
  if (index === -1) return res.status(404).json({ message: "Reservasi tidak ditemukan" });
  if (data.reservations[index].userId !== req.user.id) {
    return res.status(403).json({ message: "Anda tidak memiliki hak untuk membatalkan reservasi ini." });
  }

  data.reservations = data.reservations.filter(r => r.id !== parseInt(req.params.id));
  writeData(data);
  res.json({ message: "Dibatalkan" });
});

// Menyalakan Server
app.listen(PORT, () => {
  console.log(`Backend CloudRoom berjalan di http://localhost:${PORT}`);
});