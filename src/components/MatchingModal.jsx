import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../supabaseClient';
import { X, Send, AlertCircle, Calendar, Star } from 'lucide-react';

const MatchingModal = ({ host, onClose, onSuccess, onNavigateToLogin }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }
    if (user.role === 'showhost') {
      setError('쇼호스트 계정으로는 매칭 신청이 불가합니다. 브랜드 계정으로 가입해 주세요.');
      return;
    }
    if (!message.trim()) {
      setError('제안 메시지를 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.matches.request(
        user.id,
        user.name || '브랜드 담당자',
        host.id,
        host.name,
        message
      );
      onSuccess();
    } catch (err) {
      console.error('Matching request error:', err);
      setError(err.message || '매칭 요청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 7, 13, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div 
        className="glass-panel animate-scale-in" 
        style={{
          width: '100%',
          maxWidth: '550px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>매칭 및 방송 제안</h2>
          <button 
            onClick={onClose}
            className="btn btn-secondary" 
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Host Mini Profile */}
          <div style={{
            display: 'flex',
            gap: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: '20px'
          }}>
            <img 
              src={host.profileImage} 
              alt={host.name} 
              style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{host.name} 쇼호스트</span>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{host.category}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))' }}>
                <span>경력 {host.career}</span>
                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Star size={12} fill="hsl(45, 100%, 55%)" color="hsl(45, 100%, 55%)" />
                  <span>{host.rating?.toFixed(1) || '5.0'}</span>
                </div>
              </div>
            </div>
          </div>

          {!user ? (
            /* Not logged in view */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <AlertCircle size={40} color="hsl(var(--primary))" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>로그인이 필요합니다</p>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground-muted))', marginBottom: '20px' }}>
                쇼호스트에게 매칭을 신청하려면 브랜드 담당자 계정으로 로그인해 주세요.
              </p>
              <button 
                type="button"
                className="btn btn-primary"
                onClick={onNavigateToLogin}
                style={{ width: '100%' }}
              >
                로그인 / 회원가입 하러가기
              </button>
            </div>
          ) : user.role === 'showhost' ? (
            /* Showhost account view */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <AlertCircle size={40} color="hsl(var(--accent))" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>신청 권한이 없습니다</p>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground-muted))' }}>
                쇼호스트 회원님은 다른 쇼호스트에게 매칭을 신청할 수 없습니다. 
                브랜드 담당자(클라이언트) 계정을 생성하여 진행해주세요.
              </p>
            </div>
          ) : (
            /* Brand account view - Form inputs */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="proposal-message">방송 제안 및 상세 안내</label>
                <textarea
                  id="proposal-message"
                  rows={6}
                  placeholder="예: 안녕하세요! 저희 브랜드의 신제품 런칭 방송을 제안드립니다. 일정은 6월 중순 평일 저녁 시간대이며, 예상 시간은 60분입니다. 관련 디테일 논의를 나누고 싶습니다."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

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

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '10px'
              }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={onClose}
                  style={{ flex: 1 }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={submitting}
                  style={{ flex: 2 }}
                >
                  {submitting ? '전송 중...' : (
                    <>
                      <Send size={16} />
                      <span>매칭 제안서 발송</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default MatchingModal;
