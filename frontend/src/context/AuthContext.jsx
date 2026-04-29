// ============================================
//  src/context/AuthContext.jsx
//
//  WHY CONTEXT?
//  Instead of passing user/token as props
//  through every component, Context makes it
//  available to ANY component in the app.
//
//  Think of it like a global variable,
//  but done the React way.
// ============================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/client';
import toast from 'react-hot-toast';

// Step 1: Create the context (empty box)
const AuthContext = createContext(null);

// Step 2: Create the Provider (fills the box with data)
// Wrap your whole app with this so every child can read from it
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true while checking saved token

  // On app start — check if user was already logged in
  // (token saved in localStorage from previous session)
  useEffect(() => {
    const savedToken = localStorage.getItem('mindbloom_token');
    const savedUser  = localStorage.getItem('mindbloom_user');

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('mindbloom_user');
      }
    }
    setLoading(false);
  }, []);

  // REGISTER
  const register = useCallback(async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    localStorage.setItem('mindbloom_token', data.token);
    localStorage.setItem('mindbloom_user',  JSON.stringify(data.user));
    setUser(data.user);
    toast.success(`Welcome to MindBloom, ${data.user.name}! 🌸`);
    return data;
  }, []);

  // LOGIN
  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('mindbloom_token', data.token);
    localStorage.setItem('mindbloom_user',  JSON.stringify(data.user));
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}! 🌿`);
    return data;
  }, []);

  // LOGOUT
  const logout = useCallback(() => {
    localStorage.removeItem('mindbloom_token');
    localStorage.removeItem('mindbloom_user');
    setUser(null);
    toast.success('See you soon 💙');
  }, []);

  // UPDATE USER (after profile changes)
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('mindbloom_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Value exposed to all children
  const value = { user, loading, register, login, logout, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Step 3: Custom hook — makes using the context clean
// Usage: const { user, login, logout } = useAuth();
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
