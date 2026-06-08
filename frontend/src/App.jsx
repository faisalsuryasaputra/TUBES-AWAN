import React, { useState, useEffect } from 'react';
import { getRooms, getReservations, createReservation, deleteReservation, updateReservation } from './services/api';

function App() {
  const [rooms, setRooms] = useState([
    { id: 1, name: 'Conference Room A', capacity: 12 },
    { id: 2, name: 'Meeting Room B', capacity: 6 },
    { id: 3, name: 'Executive Suite', capacity: 20 },
    { id: 4, name: 'Huddle Room 1', capacity: 4 },
    { id: 5, name: 'Training Room', capacity: 30 }
  ]);
  const [reservations, setReservations] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const roomsData = await getRooms();
      if (roomsData && roomsData.length > 0) {
        setRooms(roomsData);
      }
    } catch (error) {
      console.error("Gagal mengambil data ruangan:", error);
    }
    try {
      const reservationsData = await getReservations();
      setReservations(reservationsData || []);
    } catch (error) {
      console.error("Gagal mengambil data reservasi:", error);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedRoom || !date || !startTime || !endTime) {
      alert("Mohon lengkapi semua data!");
      return;
    }
    try {
      if (editingId) {
        await updateReservation(editingId, { roomId: selectedRoom, date, startTime, endTime });
        alert("Peminjaman berhasil diupdate!");
        setEditingId(null);
      } else {
        await createReservation({ roomId: selectedRoom, date, startTime, endTime });
        alert("Peminjaman berhasil!");
      }
      setSelectedRoom('');
      setDate('');
      setStartTime('');
      setEndTime('');
      fetchData();
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm("Yakin ingin membatalkan peminjaman ini?")) {
      try {
        await deleteReservation(id);
        fetchData();
      } catch (error) {
        alert("Gagal membatalkan peminjaman.");
      }
    }
  };

  const handleEdit = (res) => {
    setEditingId(res.id);
    setSelectedRoom(res.roomId);
    setDate(res.date);
    setStartTime(res.startTime);
    setEndTime(res.endTime);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-bold text-[#005C99]">CloudRoom</h1>
          <p className="text-slate-500">Sistem Peminjaman Ruangan Praktis</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bagian Kiri: Form Booking */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{editingId ? 'Edit Peminjaman' : 'Buat Peminjaman'}</h2>
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Pilih Ruangan</label>
                <select 
                  className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                >
                  <option value="">-- Silakan Pilih --</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} (Kapasitas: {room.capacity})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Tanggal</label>
                <input type="date" className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900" 
                  value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-slate-700">Waktu Mulai</label>
                  <input type="time" className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900" 
                    value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-slate-700">Waktu Selesai</label>
                  <input type="time" className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900" 
                    value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#005C99] text-white p-2 rounded-md hover:bg-blue-800 transition font-medium">
                {editingId ? 'Update Booking' : 'Book Room'}
              </button>
            </form>
          </div>

          {/* Bagian Kanan: Daftar Reservasi */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Riwayat Peminjaman Saya</h2>
            {reservations.length === 0 ? (
              <p className="text-slate-500 text-sm">Belum ada peminjaman aktif.</p>
            ) : (
              <ul className="space-y-4">
                {reservations.map(res => (
                  <li key={res.id} className="p-4 border border-slate-200 bg-slate-50 rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{res.roomName}</p>
                      <p className="text-sm text-slate-600">{res.date} | {res.startTime} - {res.endTime}</p>
                    </div>
                    <div className="flex">
                      <button 
                        onClick={() => handleEdit(res)}
                        className="text-[#005C99] text-sm hover:underline font-medium px-3 py-1 bg-blue-50 rounded-md mr-2"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleCancel(res.id)}
                        className="text-[#DC2626] text-sm hover:underline font-medium px-3 py-1 bg-red-50 rounded-md"
                      >
                        Batal
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;