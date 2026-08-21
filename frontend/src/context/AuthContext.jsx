import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Non-null while an admin is signed in as another user for support.
  const [impersonating, setImpersonating] = useState(null);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/status');
      if (response.data.authenticated) {
        setUser(response.data.user);
        setImpersonating(response.data.impersonating || null);
      } else {
        setUser(null);
        setImpersonating(null);
      }
    } catch (error) {
      setUser(null);
      setImpersonating(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      setUser(response.data.user);
      setImpersonating(null);
    }
    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      setUser(response.data.user);
      setImpersonating(null);
    }
    return response.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    setImpersonating(null);
  };

  // Admin → sign in as another user without their password.
  const impersonate = async (userId) => {
    const response = await api.post(`/admin/users/${userId}/impersonate`);
    if (response.data.success) {
      setUser(response.data.user);
      await checkAuthStatus();
    }
    return response.data;
  };

  const stopImpersonating = async () => {
    const response = await api.post('/auth/stop-impersonating');
    if (response.data.success) {
      setUser(response.data.user);
      setImpersonating(null);
    }
    return response.data;
  };

  return (
    <AuthContext.Provider value={{
      user, loading, impersonating,
      login, register, logout, checkAuthStatus,
      impersonate, stopImpersonating,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
