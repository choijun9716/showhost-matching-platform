import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../supabaseClient';
import { LogOut, User, LayoutDashboard, Shield, Zap, Megaphone, Bell } from 'lucide-react';
import CreditTopUpModal from './CreditTopUpModal';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  useEffect(() => {
    if (user && user.role === 'showhost') {
      const fetchMatches = async () => {
        try {
          const matches = await api.matches.listForHost(user.id);
          const count = matches.filter(m => m.status === 'pending').length;
          setPendingCount(count);
        } catch (e) {
          console.error(e);
        }
      };
      fetchMatches();
      const interval = setInterval(fetchMatches, 5000);
      return () => clearInterval(interval);
    }
  }, [user, activeTab]);

  return (
    <>
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderRadius: '0 0 16px 16px',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      marginBottom: '30px'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px'
      }}>
        {/* Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer' 
          }}
        >
          <span style={{ 
            fontSize: '1.25rem', 
            fontWeight: 800, 
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '-0.03em'
          }}>
            SHOW<span className="text-gradient-primary">LAB</span>
          </span>
        </div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user && !(user.role === 'client' && user.isApproved === 'false') && (
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="btn"
              style={{
                background: activeTab === 'dashboard' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: activeTab === 'dashboard' ? '#white' : 'hsl(var(--foreground-muted))',
                padding: '8px 16px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LayoutDashboard size={16} />
              <span className="nav-text-hide">
                {user.role === 'client' ? '캠페인 관리' : '매칭 대시보드'}
              </span>
              {user.role === 'showhost' && pendingCount > 0 && (
                <div style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '10px',
                  marginLeft: '4px'
                }}>
                  {pendingCount}
                </div>
              )}
            </button>
          )}

          {user && user.role === 'showhost' && (
            <button 
              onClick={() => setActiveTab('my-profile')}
              className="btn"
              style={{
                background: activeTab === 'my-profile' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: activeTab === 'my-profile' ? '#white' : 'hsl(var(--foreground-muted))',
                padding: '8px 16px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <User size={16} />
              <span className="nav-text-hide">내 프로필</span>
            </button>
          )}

          {user && (user.role === 'admin' || user.role === 'subadmin') && (
            <button 
              onClick={() => setActiveTab('admin')}
              className="btn"
              style={{
                background: activeTab === 'admin' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: activeTab === 'admin' ? '#white' : 'hsl(var(--foreground-muted))',
                padding: '8px 16px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Shield size={16} />
              <span className="nav-text-hide">관리자 패널</span>
            </button>
          )}

          {/* Divider */}
          <div style={{ height: '20px', width: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 8px' }} />

          {/* User Section / Login Button */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* 크레딧 배지 - 브랜드 계정만 (승인 완료된 경우만 표시) */}
              {user.role === 'client' && user.isApproved !== 'false' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 11px',
                    borderRadius: '8px',
                    background: (parseInt(user.points) || 0) > 0
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${
                      (parseInt(user.points) || 0) > 0
                        ? 'rgba(255, 255, 255, 0.3)'
                        : 'rgba(239, 68, 68, 0.3)'
                    }`,
                    whiteSpace: 'nowrap'
                  }}>
                    <Zap size={13} color={(parseInt(user.points) || 0) > 0 ? '#ffffff' : '#ef4444'} />
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: (parseInt(user.points) || 0) > 0 ? '#ffffff' : '#ef4444'
                    }}>
                      {(parseInt(user.points) || 0).toLocaleString()} C
                    </span>
                  </div>
                  <button
                    onClick={() => setIsTopUpOpen(true)}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    충전하기
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}님</span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: user.role === 'showhost' ? '#ffffff' : ((user.role === 'admin' || user.role === 'subadmin') ? '#f59e0b' : 'hsl(var(--primary-hover))'),
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {user.role === 'showhost' ? '쇼호스트' : (user.role === 'admin' ? '관리자' : (user.role === 'subadmin' ? '중간 관리자' : '브랜드 담당자'))}
                </span>
              </div>
              <button 
                onClick={logout}
                className="btn btn-secondary" 
                style={{ 
                  padding: '8px 12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="로그아웃"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setActiveTab('login')}
              className="btn btn-primary"
              style={{
                padding: '8px 20px',
                borderRadius: '8px'
              }}
            >
              로그인 / 가입
            </button>
          )}
          </nav>
        </div>
      </header>
      {isTopUpOpen && (
        <CreditTopUpModal 
          onClose={() => setIsTopUpOpen(false)}
          onSuccess={() => {}}
        />
      )}
    </>
  );
};

export default Navbar;
