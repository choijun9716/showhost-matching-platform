import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../supabaseClient';
import { X, Megaphone, Calendar, MapPin, Tag, Send, Zap, AlertCircle, Plus } from 'lucide-react';

const MATCH_COST = 10;

const CampaignProposalModal = ({ host, onClose, onSuccess, onNavigateToLogin, onCreateCampaign }) => {
  const { user, updateCredits } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const backdropRef = useRef(null);

  const credits = parseInt(user?.points) || 0;
  const hasEnoughCredits = credits >= MATCH_COST;

  useEffect(() => {
    if (user?.role === 'client') fetchCampaigns();
    else setLoading(false);
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const data = await api.campaigns.listForClient(user.id);
      // 아직 확정되지 않은 캠페인만 (open 상태)
      const openCampaigns = data.filter(c => c.status === 'open');
      setCampaigns(openCampaigns);
      if (openCampaigns.length === 1) setSelectedCampaign(openCampaigns[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCampaign) { setError('캠페인을 선택해 주세요.'); return; }
    if (!hasEnoughCredits) { setError(`크레딧이 부족합니다. (보유: ${credits}C, 필요: ${MATCH_COST}C)`); return; }

    setSubmitting(true);
    setError('');
    try {
      await api.matches.request(
        user.id, user.name, host.id, host.name,
        message || `[${selectedCampaign.brandName}] 캠페인 제안입니다.`,
        selectedCampaign.id
      );
      updateCredits(credits - MATCH_COST);
      onSuccess();
    } catch (err) {
      setError(err.message || '제안 발송 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSchedule = (schedule) => {
    try {
      return new Date(schedule).toLocaleString('ko-KR', {
        month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch { return schedule; }
  };

  return (
    <div
      ref={backdropRef}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(5,7,13,0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000, overflowY: 'auto', padding: '20px'
      }}
    >
      <div className="glass-panel animate-scale-in" style={{
        width: '100%', maxWidth: '580px',
        margin: '40px auto', overflow: 'hidden',
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>캠페인 제안 보내기</h2>
            <p style={{ fontSize: '0.82rem', color: 'hsl(var(--foreground-muted))', marginTop: '2px' }}>
              {host.name} 쇼호스트에게 캠페인 제안을 보냅니다
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {!user ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <AlertCircle size={40} color="hsl(var(--primary))" style={{ marginBottom: '12px' }} />
              <p style={{ fontWeight: 600, marginBottom: '6px' }}>로그인이 필요합니다</p>
              <button className="btn btn-primary" onClick={onNavigateToLogin} style={{ width: '100%', marginTop: '12px' }}>
                로그인 / 회원가입
              </button>
            </div>
          ) : user.role === 'showhost' ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <AlertCircle size={40} color="#f59e0b" style={{ marginBottom: '12px' }} />
              <p style={{ fontWeight: 600 }}>브랜드 담당자 계정으로만 제안이 가능합니다</p>
            </div>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="loading-spinner" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* 크레딧 배너 */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: '10px',
                background: hasEnoughCredits ? 'rgba(255, 255, 255,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${hasEnoughCredits ? 'rgba(255, 255, 255,0.25)' : 'rgba(239,68,68,0.25)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'hsl(var(--foreground-muted))' }}>
                  <Zap size={14} color={hasEnoughCredits ? '#ffffff' : '#ef4444'} />
                  보유 크레딧
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 700, color: hasEnoughCredits ? '#ffffff' : '#ef4444' }}>
                    {credits} C
                  </span>
                  <span style={{
                    fontSize: '0.78rem', padding: '2px 8px', borderRadius: '12px',
                    background: hasEnoughCredits ? 'rgba(255, 255, 255,0.15)' : 'rgba(239,68,68,0.15)',
                    color: hasEnoughCredits ? '#ffffff' : '#ef4444',
                    border: `1px solid ${hasEnoughCredits ? 'rgba(255, 255, 255,0.3)' : 'rgba(239,68,68,0.3)'}`
                  }}>-{MATCH_COST}C</span>
                </div>
              </div>

              {/* 캠페인 선택 */}
              <div>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '10px' }}>
                  어떤 캠페인으로 제안할까요?
                </label>

                {campaigns.length === 0 ? (
                  <div style={{
                    padding: '20px', textAlign: 'center',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px dashed rgba(255,255,255,0.15)',
                    borderRadius: '10px'
                  }}>
                    <Megaphone size={28} color="hsl(var(--foreground-muted))" style={{ marginBottom: '8px', opacity: 0.5 }} />
                    <p style={{ fontSize: '0.88rem', color: 'hsl(var(--foreground-muted))', marginBottom: '12px' }}>
                      진행 중인 캠페인이 없습니다
                    </p>
                    <button type="button" onClick={onCreateCampaign} className="btn btn-primary" style={{ fontSize: '0.85rem', display: 'inline-flex', gap: '6px' }}>
                      <Plus size={14} /> 캠페인 만들기
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {campaigns.map(camp => (
                      <div
                        key={camp.id}
                        onClick={() => setSelectedCampaign(camp)}
                        style={{
                          padding: '14px 16px', borderRadius: '10px', cursor: 'pointer',
                          border: selectedCampaign?.id === camp.id
                            ? '1px solid #ffffff'
                            : '1px solid rgba(255,255,255,0.08)',
                          background: selectedCampaign?.id === camp.id
                            ? 'rgba(255, 255, 255,0.1)'
                            : 'rgba(255,255,255,0.03)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Megaphone size={14} color="#ffffff" />
                          {camp.brandName}
                          <span style={{
                            fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px',
                            background: 'rgba(255, 255, 255,0.15)', color: '#ffffff'
                          }}>{camp.category}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={11} /> {formatSchedule(camp.schedule)}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={11} /> {camp.location}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 추가 메시지 */}
              {campaigns.length > 0 && (
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>
                    추가 메시지 <span style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))', fontWeight: 400 }}>(선택)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="쇼호스트에게 전하고 싶은 추가 내용을 입력해 주세요."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    disabled={!hasEnoughCredits}
                    style={{ width: '100%', resize: 'none' }}
                  />
                </div>
              )}

              {/* 크레딧 부족 경고 */}
              {!hasEnoughCredits && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px', borderRadius: '8px', fontSize: '0.85rem',
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444'
                }}>
                  <AlertCircle size={15} />
                  크레딧이 부족합니다. 관리자에게 충전을 요청해 주세요.
                </div>
              )}

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px', borderRadius: '8px', fontSize: '0.85rem',
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444'
                }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              {/* 버튼 */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                  취소
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !hasEnoughCredits || campaigns.length === 0}
                  style={{
                    flex: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    opacity: (!hasEnoughCredits || campaigns.length === 0) ? 0.5 : 1,
                    cursor: (!hasEnoughCredits || campaigns.length === 0) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? '발송 중...' : (
                    <>
                      <Send size={15} />
                      제안 발송 ({MATCH_COST}C)
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignProposalModal;
