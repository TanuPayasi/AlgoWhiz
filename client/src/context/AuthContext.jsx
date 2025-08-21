import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        if (parsed?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
        }
      }
    } catch (err) {
      console.warn('Could not load stored user', err);
      localStorage.removeItem('user');
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      if (data?.token) api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      throw new Error(message);
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      if (data?.token) api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    console.warn('useAuth(): AuthProvider missing. Wrap your app with <AuthProvider>.');
    return {
      user: null,
      login: async () => { throw new Error('AuthProvider missing: cannot call login()'); },
      register: async () => { throw new Error('AuthProvider missing: cannot call register()'); },
      logout: () => { /* no-op */ },
    };
  }
  return ctx;
};
