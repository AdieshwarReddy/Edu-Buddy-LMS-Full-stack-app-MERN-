import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Check current session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data?.success && res.data?.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        setUser(res.data.user);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        return res.data.user;
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data?.success) {
        setUser(res.data.user);
        toast.success('Registration successful! Welcome to EduBuddy.');
        return res.data.user;
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      toast.info('You have been logged out.');
    } catch (err) {
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.patch('/auth/profile', profileData);
      if (res.data?.success) {
        setUser(res.data.user);
        toast.success('Profile updated successfully.');
        return res.data.user;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.patch('/auth/change-password', { currentPassword, newPassword });
      if (res.data?.success) {
        toast.success('Password updated successfully.');
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isStudent: user?.role === 'student',
    isInstructor: user?.role === 'instructor',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
