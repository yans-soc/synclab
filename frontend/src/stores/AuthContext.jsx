import { createContext, useContext, useState } from 'react';
import { api, simpanSesi, hapusSesi, ambilPengguna, ambilToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [pengguna, setPengguna] = useState(() => (ambilToken() ? ambilPengguna() : null));

  async function masuk(surel, kata_sandi) {
    const r = await api.post('/otentikasi/masuk', { surel, kata_sandi });
    simpanSesi(r.data.token, r.data.pengguna);
    setPengguna(r.data.pengguna);
  }

  async function keluar() {
    try {
      await api.post('/otentikasi/keluar');
    } catch {
      // abaikan; sesi lokal tetap dihapus
    }
    hapusSesi();
    setPengguna(null);
  }

  return (
    <AuthContext.Provider value={{ pengguna, masuk, keluar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
