import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, User, LayoutDashboard, Search, FileText } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  return (
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
            gap: '8px', 
            cursor: 'pointer' 
          }}
        >
          <div className="bg-gradient-primary" style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(110, 80, 250, 0.4)'
          }}>
            <Sparkles size={18} color="white" />
          </div>
          <span style={{ 
            fontSize: '1.25rem', 
            fontWeight: 800, 
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '-0.03em'
          }}>
            SHOW<span className="text-gradient-cyan">LINK</span>
          </span>
        </div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setActiveTab('home')}
            className="btn"
            style={{
              background: activeTab === 'home' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: activeTab === 'home' ? '#white' : 'hsl(var(--foreground-muted))',
              padding: '8px 16px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Search size={16} />
            <span>쇼호스트 탐색</span>
          </button>

          {user && (
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
              <span>매칭 대시보드</span>
            </button>
          )}

          {user && user.role === 'showhost' && (
            <button 
              onClick={() => setActiveTab('profile-edit')}
              className="btn"
              style={{
                background: activeTab === 'profile-edit' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: activeTab === 'profile-edit' ? '#white' : 'hsl(var(--foreground-muted))',
                padding: '8px 16px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <User size={16} />
              <span>내 프로필 관리</span>
            </button>
          )}

          {/* Divider */}
          <div style={{ height: '20px', width: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 8px' }} />

          {/* User Section / Login Button */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}님</span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: user.role === 'showhost' ? '#00f2fe' : 'hsl(var(--primary-hover))',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {user.role === 'showhost' ? '쇼호스트' : '브랜드 담당자'}
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
  );
};

export default Navbar;
