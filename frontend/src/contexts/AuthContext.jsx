import { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('studiea_token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('studiea_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem('studiea_token', token);
    else localStorage.removeItem('studiea_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('studiea_user', JSON.stringify(user));
    else localStorage.removeItem('studiea_user');
  }, [user]);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    // TODO: shape depends on backend response { token, user }
    if (res.token) setToken(res.token);
    if (res.user) setUser(res.user);
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, role: user?.role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
