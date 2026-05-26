import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, User, LayoutDashboard, FileText, Shield, Zap } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const handleNavbarTossPayment = () => {
    if (typeof window.TossPayments !== 'function') {
      alert('토스페이먼츠 라이브러리가 아직 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    
    const tossPayments = window.TossPayments("test_ck_D53n977G19Mdf5oGM08j3k6B1xvl");
    const payment = tossPayments.payment({ customerKey: user ? user.id : 'anonymous' });
    
    payment.requestPayment({
      method: 'CARD',
      amount: {
        currency: 'KRW',
        value: 15000,
      },
      orderId: 'order-' + Date.now(),
      orderName: 'SHOWLAB 프리미엄 멤버십 (포트폴리오 무제한 열람)',
      customerName: user ? user.name : '브랜드 담당자',
      successUrl: window.location.origin + window.location.pathname + '?payment=success',
      failUrl: window.location.origin + window.location.pathname + '?payment=fail',
    }).catch((error) => {
      if (error.code === 'USER_CANCEL') {
        console.log('사용자가 결제를 취소했습니다.');
      } else {
        alert('결제 요청 중 오류가 발생했습니다: ' + error.message);
      }
    });
  };

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
            cursor: 'pointer' 
          }}
        >
          <span style={{ 
            fontSize: '1.25rem', 
            fontWeight: 800, 
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '-0.03em'
          }}>
            SHOW<span className="text-gradient-cyan">LAB</span>
          </span>
        </div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
              <span className="nav-text-hide">매칭 대시보드</span>
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
              <span className="nav-text-hide">내 프로필 관리</span>
            </button>
          )}

          {user && user.role === 'admin' && (
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
              {/* 크레딧 배지 - 브랜드 계정만 */}
              {user.role === 'client' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 11px',
                  borderRadius: '8px',
                  background: (parseInt(user.points) || 0) > 0
                    ? 'rgba(99, 102, 241, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${
                    (parseInt(user.points) || 0) > 0
                      ? 'rgba(99, 102, 241, 0.3)'
                      : 'rgba(239, 68, 68, 0.3)'
                  }`,
                  whiteSpace: 'nowrap'
                }}>
                  <Zap size={13} color={(parseInt(user.points) || 0) > 0 ? '#818cf8' : '#ef4444'} />
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: (parseInt(user.points) || 0) > 0 ? '#818cf8' : '#ef4444'
                  }}>
                    {(parseInt(user.points) || 0).toLocaleString()} C
                  </span>
                </div>
              )}
              {/* Premium Membership Button for Unpaid Clients */}
              {user.role === 'client' && user.isPaid !== 'true' && (
                <button
                  onClick={handleNavbarTossPayment}
                  className="btn"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: '1px solid rgba(110, 80, 250, 0.4)',
                    background: 'linear-gradient(135deg, rgba(110, 80, 250, 0.15) 0%, rgba(0, 242, 254, 0.15) 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={12} color="#ffffff" />
                  <span>멤버십 결제 (1.5만)</span>
                </button>
              )}

              {/* Premium Badge for Paid Clients */}
              {user.role === 'client' && user.isPaid === 'true' && (
                <div
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
                    color: '#0d0d0d',
                    letterSpacing: '0.05em'
                  }}
                >
                  PREMIUM
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}님</span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: user.role === 'showhost' ? '#ffffff' : (user.role === 'admin' ? '#f59e0b' : 'hsl(var(--primary-hover))'),
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {user.role === 'showhost' ? '쇼호스트' : (user.role === 'admin' ? '관리자' : '브랜드 담당자')}
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
