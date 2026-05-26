import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Briefcase, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

const Login = ({ onAuthSuccess }) => {
  const { login, signup } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [role, setRole] = useState('client'); // 'client' or 'showhost'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleToggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLoginView && !name)) {
      setError('모든 필드를 입력해 주세요.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isLoginView) {
        // 로그인 처리
        await login(email, password);
        setSuccessMsg('로그인에 성공했습니다! 잠시 후 이동합니다.');
        setTimeout(() => {
          onAuthSuccess();
        }, 1000);
      } else {
        // 회원가입 처리
        await signup(email, password, name, role);
        setSuccessMsg('회원가입 및 프로필 생성이 완료되었습니다!');
        setTimeout(() => {
          onAuthSuccess();
        }, 1500);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || '인증 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 150px)',
      paddingTop: '20px',
      paddingBottom: '50px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '40px 30px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Background decorative glowing circles */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-60px',
          left: '-60px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsl(var(--secondary) / 0.15) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        {/* Content Wrapper */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div className="bg-gradient-primary" style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(110, 80, 250, 0.4)',
              marginBottom: '16px'
            }}>
              <Sparkles size={22} color="white" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
              {isLoginView ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem' }}>
              {isLoginView 
                ? '쇼링크에 로그인하여 매칭을 이어가세요' 
                : '쇼링크 크루가 되어 더 많은 기회를 연결해보세요'}
            </p>
          </div>

          {/* Toggle Tab */}
          <div style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '30px',
            border: '1px solid rgba(255, 255, 255, 0.03)'
          }}>
            <button
              onClick={() => isLoginView || handleToggleView()}
              className="btn"
              style={{
                flex: 1,
                background: isLoginView ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: isLoginView ? 'white' : 'hsl(var(--foreground-muted))',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '0.85rem'
              }}
            >
              로그인
            </button>
            <button
              onClick={() => !isLoginView || handleToggleView()}
              className="btn"
              style={{
                flex: 1,
                background: !isLoginView ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: !isLoginView ? 'white' : 'hsl(var(--foreground-muted))',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '0.85rem'
              }}
            >
              회원가입
            </button>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Name Input (Register View Only) */}
            {!isLoginView && (
              <div>
                <label htmlFor="name-input">이름 / 기업명</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    id="name-input"
                    type="text"
                    placeholder="홍길동 또는 회사명"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email-input">이메일 주소</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="email-input"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password-input">비밀번호</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'hsl(var(--foreground-muted))',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Role Toggle Selector (Register View Only) */}
            {!isLoginView && (
              <div>
                <label>회원 구분</label>
                <div style={{
                  display: 'flex',
                  gap: '12px'
                }}>
                  {/* Client Selector */}
                  <div 
                    onClick={() => setRole('client')}
                    style={{
                      flex: 1,
                      padding: '16px',
                      borderRadius: '10px',
                      border: `1px solid ${role === 'client' ? 'hsl(var(--primary))' : 'rgba(255, 255, 255, 0.05)'}`,
                      background: role === 'client' ? 'rgba(110, 80, 250, 0.08)' : 'rgba(13, 17, 28, 0.4)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Briefcase size={20} color={role === 'client' ? 'hsl(var(--primary-hover))' : 'hsl(var(--foreground-muted))'} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>브랜드 담당자</span>
                  </div>

                  {/* Showhost Selector */}
                  <div 
                    onClick={() => setRole('showhost')}
                    style={{
                      flex: 1,
                      padding: '16px',
                      borderRadius: '10px',
                      border: `1px solid ${role === 'showhost' ? 'hsl(var(--secondary))' : 'rgba(255, 255, 255, 0.05)'}`,
                      background: role === 'showhost' ? 'rgba(0, 242, 254, 0.08)' : 'rgba(13, 17, 28, 0.4)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <User size={20} color={role === 'showhost' ? '#00f2fe' : 'hsl(var(--foreground-muted))'} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>쇼호스트</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}>
                <CheckCircle size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                marginTop: '10px'
              }}
            >
              {loading ? '처리 중...' : (isLoginView ? '로그인하기' : '가입 완료')}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
