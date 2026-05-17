const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5001;
const DATA_FILE = path.join(__dirname, 'data', 'database.json');

app.use(cors());
app.use(express.json());

// Helper untuk membaca file JSON
const readData = () => {
  if (!fs.existsSync(DATA_FILE)) return { rooms: [], reservations: [] };
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
};

// Helper untuk menulis ke file JSON
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// API: Ambil daftar ruangan
app.get('/api/rooms', (req, res) => {
  res.json(readData().rooms);
});

// API: Ambil daftar reservasi
app.get('/api/reservations', (req, res) => {
  res.json(readData().reservations);
});

// API: Buat reservasi baru
app.post('/api/reservations', (req, res) => {
  const data = readData();
  const room = data.rooms.find(r => r.id === parseInt(req.body.roomId));
  
  if (!room) return res.status(404).json({ message: "Ruangan tidak ditemukan" });

  const newReservation = {
    id: Date.now(),
    roomId: room.id,
    roomName: room.name,
    date: req.body.date,
    startTime: req.body.startTime,
    endTime: req.body.endTime
  };

  data.reservations.push(newReservation);
  writeData(data);
  res.status(201).json({ message: "Berhasil", data: newReservation });
});

// API: Hapus reservasi
app.delete('/api/reservations/:id', (req, res) => {
  const data = readData();
  data.reservations = data.reservations.filter(r => r.id !== parseInt(req.params.id));
  writeData(data);
  res.json({ message: "Dibatalkan" });
});

// Menyalakan Server
app.listen(PORT, () => {
  console.log(`Backend CloudRoom berjalan di http://localhost:${PORT}`);
});