import React, { useState, useEffect } from 'react';
import { getRooms, getReservations, createReservation, deleteReservation, updateReservation, loginUser, registerUser } from './services/api';

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

  // Authentication State
  const [token, setToken] = useState(localStorage.getItem('cloudroom_token') || null);
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('cloudroom_user');
    return u ? JSON.parse(u) : null;
  });
  
  // Auth Form State
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

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

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail || !authPassword || (authMode === 'register' && !authName)) {
      setAuthError('Mohon lengkapi semua input form.');
      return;
    }
    setAuthLoading(true);
    try {
      let data;
      if (authMode === 'login') {
        data = await loginUser(authEmail, authPassword);
      } else {
        data = await registerUser(authName, authEmail, authPassword);
      }
      
      // Save details
      localStorage.setItem('cloudroom_token', data.token);
      localStorage.setItem('cloudroom_user', JSON.stringify(data.user));
      
      // Update states
      setToken(data.token);
      setUser(data.user);
      
      // Reset forms
      setAuthName('');
      setAuthEmail('');
      setAuthPassword('');
    } catch (error) {
      setAuthError(error.message || 'Terjadi kesalahan saat masuk/mendaftar.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cloudroom_token');
    localStorage.removeItem('cloudroom_user');
    setToken(null);
    setUser(null);
    setReservations([]);
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
      alert(error.message || "Terjadi kesalahan saat menyimpan data.");
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm("Yakin ingin membatalkan peminjaman ini?")) {
      try {
        await deleteReservation(id);
        fetchData();
      } catch (error) {
        alert(error.message || "Gagal membatalkan peminjaman.");
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

  // Render Login/Register Screen
  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-slate-100 p-6 font-sans relative overflow-hidden">
        {/* Dynamic Neon Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600 rounded-full filter blur-[120px] opacity-25 animate-blob"></div>
          <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-500 rounded-full filter blur-[120px] opacity-25 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-500 rounded-full filter blur-[120px] opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full max-w-md glass-card p-8 rounded-2xl relative z-10 transition-all duration-300 border border-white/10 shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)]">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 tracking-tight select-none">
              CloudRoom
            </h1>
            <p className="text-slate-400 text-sm">Sistem Peminjaman Ruangan Praktis & Modern</p>
          </div>

          {/* Tab buttons */}
          <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-white/5 mb-6">
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthError('');
              }}
              className={`w-1/2 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                authMode === 'login' 
                  ? 'bg-gradient-to-r from-purple-600/30 to-cyan-500/30 text-cyan-300 border border-cyan-500/30 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setAuthError('');
              }}
              className={`w-1/2 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                authMode === 'register' 
                  ? 'bg-gradient-to-r from-purple-600/30 to-cyan-500/30 text-cyan-300 border border-cyan-500/30 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daftar (Sign Up)
            </button>
          </div>

          {authError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs font-semibold mb-6 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Masukkan Nama Lengkap"
                  className="w-full p-3 bg-slate-900/60 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Alamat Email</label>
              <input
                type="email"
                placeholder="nama@email.com"
                className="w-full p-3 bg-slate-900/60 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Kata Sandi (Password)</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-3 bg-slate-900/60 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white py-3.5 rounded-xl font-bold hover:opacity-95 transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] active:scale-[0.98] disabled:opacity-50 mt-6"
            >
              {authLoading ? 'Memproses Sesi...' : authMode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-6 md:p-8 font-sans relative overflow-hidden">
      {/* Dynamic Neon Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600 rounded-full filter blur-[120px] opacity-20 animate-blob"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-500 rounded-full filter blur-[120px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-500 rounded-full filter blur-[120px] opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Dynamic Glass Navbar */}
        <header className="glass-card px-6 py-4 rounded-2xl flex justify-between items-center border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center font-black text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-float">
              C
            </div>
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-tight">
                CloudRoom
              </h1>
              <p className="text-slate-400 text-xs hidden sm:block">Modern Booking Hub</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 hover:border-purple-500/30 p-2 rounded-xl transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left pr-2">
                <p className="text-xs font-bold text-slate-200 leading-none">{user.name}</p>
                <span className="text-[10px] text-purple-400 font-semibold tracking-wider uppercase mt-1 inline-block">MEMBER</span>
              </div>
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 font-bold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98]"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Bagian Kiri: Form Booking */}
          <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-white/10 hover:border-cyan-500/20 neon-border-glow-cyan transition-all duration-300">
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
              <h2 className="text-lg font-bold text-slate-100">{editingId ? 'Edit Peminjaman' : 'Buat Peminjaman'}</h2>
            </div>
            
            <form onSubmit={handleBooking} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pilih Ruangan</label>
                <select 
                  className="w-full p-3 bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                >
                  <option value="" className="bg-[#0B0F19]">-- Silakan Pilih --</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id} className="bg-[#0B0F19]">
                      {room.name} (Kapasitas: {room.capacity})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tanggal</label>
                <input 
                  type="date" 
                  className="w-full p-3 bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mulai</label>
                  <input 
                    type="time" 
                    className="w-full p-3 bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Selesai</label>
                  <input 
                    type="time" 
                    className="w-full p-3 bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)} 
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white py-3.5 rounded-xl font-bold hover:opacity-95 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-[0.98] transition-all duration-300"
              >
                {editingId ? 'Simpan Perubahan' : 'Book Room Now'}
              </button>
            </form>
          </div>

          {/* Bagian Kanan: Daftar Reservasi */}
          <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/10 hover:border-purple-500/20 neon-border-glow-purple transition-all duration-300">
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
              <svg className="w-5 h-5 text-purple-400 animate-float" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>
              <h2 className="text-lg font-bold text-slate-100">Riwayat Peminjaman Saya</h2>
            </div>
            
            {reservations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-900/50 flex items-center justify-center border border-white/5 text-slate-500">
                  ✕
                </div>
                <p className="text-slate-400 text-sm">Belum ada peminjaman aktif yang terdaftar.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {reservations.map(res => (
                  <li 
                    key={res.id} 
                    className="p-4 bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-purple-500/20 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all duration-300"
                  >
                    <div className="space-y-1.5">
                      <span className="inline-block bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {res.roomName}
                      </span>
                      <div className="flex items-center gap-2 text-slate-300 text-sm">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"/></svg>
                        <span>{res.date}</span>
                        <span className="text-slate-600">|</span>
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
                        <span>{res.startTime} - {res.endTime}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => handleEdit(res)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400 font-bold text-xs px-3.5 py-2 rounded-xl transition-all duration-200"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleCancel(res.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-bold text-xs px-3.5 py-2 rounded-xl transition-all duration-200"
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

      {/* Cyberpunk Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl max-w-sm w-full border border-white/10 p-6 space-y-6 relative animate-in fade-in zoom-in-95 duration-200 shadow-[0_0_50px_-5px_rgba(139,92,246,0.4)]">
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition"
            >
              ✕
            </button>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-white flex items-center justify-center font-black text-3xl mx-auto shadow-lg shadow-purple-500/35 relative">
                {user.name.charAt(0).toUpperCase()}
                <div className="absolute -inset-1 rounded-full border border-cyan-400/40 animate-ping opacity-45 pointer-events-none"></div>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-100">{user.name}</h3>
                <p className="text-slate-400 text-xs mt-1">{user.email}</p>
              </div>
            </div>
            
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">ID Pengguna</span>
                <span className="font-mono font-bold text-slate-300">{user.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Peminjaman Aktif</span>
                <span className="font-bold text-cyan-400">{reservations.length} Ruangan</span>
              </div>
            </div>

            <button 
              onClick={() => setShowProfileModal(false)}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white py-3 rounded-xl font-bold hover:opacity-95 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-300"
            >
              Tutup Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;