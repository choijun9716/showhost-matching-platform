import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, initMockDatabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoTimeLeft, setDemoTimeLeft] = useState(null);

  const isDemoUser = (u) => {
    return u && (u.email === 'subadmin@test.com' || u.email === 'client@test.com');
  };

  useEffect(() => {
    // 앱 초기화 시 Mock DB 초기 세팅
    initMockDatabase();

    // 기존 세션 복원 (로컬 스토리지에 저장된 현재 유저)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      // 최신 크레딧 정보 동기화
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const freshUser = users.find(u => u.id === parsed.id);
      if (freshUser) {
        parsed.points = parseInt(freshUser.points) || 0;
      }
      setUser(parsed);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user || !isDemoUser(user)) {
      setDemoTimeLeft(null);
      localStorage.removeItem('demoStartTime');
      return;
    }

    let startTime = localStorage.getItem('demoStartTime');
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem('demoStartTime', startTime);
    }

    const startTimestamp = parseInt(startTime, 10);
    const LIMIT = 30 * 60 * 1000; // 30분

    const updateTimer = () => {
      const elapsed = Date.now() - startTimestamp;
      const remaining = Math.max(0, Math.floor((LIMIT - elapsed) / 1000));
      
      setDemoTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(intervalId);
        logout();
        alert('⚠️ 데모 체험 시간(30분)이 만료되어 자동으로 로그아웃되었습니다.');
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [user]);

  const login = async (email, password) => {
    try {
      localStorage.removeItem('demoStartTime');
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
      localStorage.removeItem('demoStartTime');
      setDemoTimeLeft(null);
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

  const updateUserApprovalStatus = (isApprovedStatus) => {
    if (user) {
      const updatedUser = { ...user, isApproved: isApprovedStatus };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  // 크레딧 업데이트 (차감 또는 충전 후 호출)
  const updateCredits = (newCredits) => {
    if (user) {
      const updatedUser = { ...user, points: parseInt(newCredits) || 0 };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateCurrentUserProfile, updateUserPaidStatus, updateUserApprovalStatus, updateCredits, demoTimeLeft }}>
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
