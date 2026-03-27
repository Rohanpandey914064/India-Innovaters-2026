import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiHealth, apiJson, getStoredToken, setStoredToken, clearAuthStorage } from '@/lib/api';
import { signInWithGoogle } from '@/lib/firebase';

const AuthContext = createContext();

function mockLoginUser(email) {
  return {
    id: 1,
    email,
    name: email.split('@')[0],
    role: email.includes('admin') ? 'admin' : 'user',
  };
}

function persistSession(user, token) {
  localStorage.setItem('cityspark_user', JSON.stringify(user));
  setStoredToken(token);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cityspark_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const up = await apiHealth();
      if (cancelled) return;

      if (up && localStorage.getItem('cityspark_user') && !getStoredToken()) {
        localStorage.removeItem('cityspark_user');
        setUser(null);
      }

      const token = getStoredToken();
      if (!up || !token) {
        setSessionChecked(true);
        return;
      }
      try {
        const data = await apiJson('/api/auth/me');
        if (cancelled) return;
        setUser(data.user);
        localStorage.setItem('cityspark_user', JSON.stringify(data.user));
      } catch {
        if (!cancelled) {
          clearAuthStorage();
          setUser(null);
        }
      } finally {
        if (!cancelled) setSessionChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    const serverUp = await apiHealth();
    if (serverUp) {
      const data = await apiJson('/api/auth/login', {
        method: 'POST',
        body: { email, password },
        skipAuth: true,
      });
      setUser(data.user);
      persistSession(data.user, data.token);
      return;
    }
    const mockUser = mockLoginUser(email);
    setUser(mockUser);
    localStorage.setItem('cityspark_user', JSON.stringify(mockUser));
    setStoredToken(null);
  };

  const signup = async (name, email, password, phone, address, zip, lat, lng) => {
    const serverUp = await apiHealth();
    if (serverUp) {
      const data = await apiJson('/api/auth/signup', {
        method: 'POST',
        body: { name, email, password, phone, address, zip, lat, lng },
        skipAuth: true,
      });
      setUser(data.user);
      persistSession(data.user, data.token);
      return;
    }
    const mockUser = { id: Date.now(), email, name, role: 'user', phone, address, zip, lat, lng, isVerified: false };
    setUser(mockUser);
    localStorage.setItem('cityspark_user', JSON.stringify(mockUser));
    setStoredToken(null);
  };

  const sendOtp = async () => {
    try {
      await apiJson('/api/auth/send-otp', { method: 'POST' });
      return true;
    } catch (e) {
      console.error('sendOtp', e);
      return false;
    }
  };

  const verifyOtp = async (code) => {
    try {
      const data = await apiJson('/api/auth/verify-otp', { method: 'POST', body: { code } });
      setUser(data.user);
      localStorage.setItem('cityspark_user', JSON.stringify(data.user));
      return true;
    } catch (e) {
      console.error('verifyOtp', e);
      return false;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    clearAuthStorage();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      if (result && result.user) {
        return result.user; // return the firebase user
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, sessionChecked, sendOtp, verifyOtp, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
