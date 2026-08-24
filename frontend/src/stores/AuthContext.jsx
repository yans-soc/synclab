import { createContext, useContext, useState } from 'react';
import { api, saveSession, clearSession, getUser, getToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (getToken() ? getUser() : null));

  async function signIn(email, password) {
    const r = await api.post('/auth/login', { email, password });
    saveSession(r.data.token, r.data.user);
    setUser(r.data.user);
  }

  async function signOut() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore; the local session is still cleared
    }
    clearSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
