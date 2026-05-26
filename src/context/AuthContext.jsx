import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, initMockDatabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 앱 초기화 시 Mock DB 초기 세팅
    initMockDatabase();

    // 기존 세션 복원 (로컬 스토리지에 저장된 현재 유저)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.auth.signIn(email, password);
      setUser(response.user);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email, password, name, role) => {
    try {
      const response = await api.auth.signUp(email, password, name, role);
      setUser(response.user);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.auth.signOut();
      setUser(null);
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateCurrentUserProfile = (updatedProfile) => {
    if (user && user.id === updatedProfile.id) {
      const updatedUser = { ...user, name: updatedProfile.name };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const updateUserPaidStatus = (isPaidStatus) => {
    if (user) {
      const updatedUser = { ...user, isPaid: isPaidStatus };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateCurrentUserProfile, updateUserPaidStatus }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
