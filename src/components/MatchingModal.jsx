import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../supabaseClient';
import { X, Send, AlertCircle, Star, Zap } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import CreditTopUpModal from './CreditTopUpModal';

const MATCH_COST = 10; // 매칭 1건당 차감 크레딧

const MatchingModal = ({ host, onClose, onSuccess, onNavigateToLogin }) => {
  const { user, updateCredits } = useAuth();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [error, setError] = useState('');
  const backdropRef = useRef(null);

  const credits = parseInt(user?.points) || 0;
  const hasEnoughCredits = credits >= MATCH_COST;

  // 모달이 열릴 때 자동으로 모달 컨테이너 스크롤을 최상단으로 리셋
  useEffect(() => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = 0;
    }
  }, []);

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
    if (!hasEnoughCredits) {
      setError(`크레딧이 부족합니다. (보유: ${credits}크레딧, 필요: ${MATCH_COST}크레딧)`);
      return;
    }
    if (!message.trim()) {
      setError('제안 메시지를 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await api.matches.request(
        user.id,
        user.name || '브랜드 담당자',
        host.id,
        host.name,
        message
      );
      // 차감 후 남은 크레딧 업데이트
      const remaining = credits - MATCH_COST;
      updateCredits(remaining);
      onSuccess();
    } catch (err) {
      console.error('Matching request error:', err);
      setError(err.message || '매칭 요청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <div 
      ref={backdropRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 7, 13, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        overflowY: 'auto',
        padding: '20px'
      }}
    >
      <div 
        className="glass-panel animate-scale-in" 
        style={{
          width: '100%',
          maxWidth: '550px',
          margin: '50px auto',
          overflow: 'hidden',
          position: 'relative',
          background: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
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
          {/* Host Info Box */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px', 
            padding: '16px', 
            background: '#050505', 
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: '20px'
          }}>
            <img 
              src={getOptimizedImageUrl(host.profileImage, 120)} 
              alt={host.name} 
              loading="lazy"
              style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }}
            />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px 0' }}>{host.name}</h3>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: 'hsl(var(--foreground-muted))' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={12} color="hsl(45, 100%, 55%)" /> {host.rating?.toFixed(1) || '5.0'}
                </span>
                <span>•</span>
                <span>{host.category}</span>
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

              {/* 크레딧 표시 배너 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: hasEnoughCredits
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${hasEnoughCredits ? 'rgba(255, 255, 255, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                borderRadius: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} color={hasEnoughCredits ? '#ffffff' : '#ef4444'} />
                  <span style={{ fontSize: '0.9rem', color: 'hsl(var(--foreground-muted))' }}>
                    보유 크레딧
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: hasEnoughCredits ? '#ffffff' : '#ef4444'
                  }}>
                    {credits.toLocaleString()} C
                  </span>
                  <span style={{
                    fontSize: '0.8rem',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: hasEnoughCredits ? 'rgba(255, 255, 255,0.15)' : 'rgba(239,68,68,0.15)',
                    color: hasEnoughCredits ? '#ffffff' : '#ef4444',
                    border: `1px solid ${hasEnoughCredits ? 'rgba(255, 255, 255,0.3)' : 'rgba(239,68,68,0.3)'}`
                  }}>
                    -{MATCH_COST}C 차감
                  </span>
                </div>
              </div>

              {/* 크레딧 부족 경고 */}
              {!hasEnoughCredits && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem'
                }}>
                  <AlertCircle size={15} />
                  <span>
                    크레딧이 부족합니다.{' '}
                    <button 
                      type="button"
                      onClick={() => setIsTopUpOpen(true)}
                      style={{ background: 'none', border: 'none', color: '#ffffff', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                    >
                      충전하기
                    </button>
                  </span>
                </div>
              )}

              <div>
                <label htmlFor="proposal-message">방송 제안 및 상세 안내</label>
                <textarea
                  id="proposal-message"
                  rows={6}
                  placeholder="예: 안녕하세요! 저희 브랜드의 신제품 런칭 방송을 제안드립니다. 일정은 6월 중순 평일 저녁 시간대이며, 예상 시간은 60분입니다. 관련 디테일 논의를 나누고 싶습니다."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ resize: 'none' }}
                  disabled={!hasEnoughCredits}
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
                  disabled={submitting || !hasEnoughCredits}
                  style={{ 
                    flex: 2,
                    opacity: (!hasEnoughCredits) ? 0.5 : 1,
                    cursor: (!hasEnoughCredits) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? '전송 중...' : (
                    <>
                      <Send size={16} />
                      <span>매칭 제안서 발송 ({MATCH_COST}C)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
    {isTopUpOpen && (
      <CreditTopUpModal 
        onClose={() => setIsTopUpOpen(false)}
        onSuccess={() => {}}
      />
    )}
    </>
  );
};

export default MatchingModal;
