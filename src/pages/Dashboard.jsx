import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../supabaseClient';
import { Calendar, CheckCircle2, XCircle, Clock, MessageSquare, Inbox, AlertCircle, Megaphone, MapPin, Tag, Award } from 'lucide-react';

const Dashboard = ({ onNavigateToCampaign }) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [campaignMap, setCampaignMap] = useState({}); // { campaignId: campaign }
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (user) fetchMatches();
  }, [user]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      // 쇼호스트만 이 대시보드 사용 (파트너사는 캠페인 대시보드로)
      const data = await api.matches.listForHost(user.id);
      setMatches(data);

      // 캠페인 정보 병렬 조회
      const campaignIds = [...new Set(data.map(m => m.campaignId).filter(Boolean))];
      const campResults = await Promise.all(campaignIds.map(id => api.campaigns.get(id)));
      const campMap = {};
      campResults.forEach((c, i) => { if (c) campMap[campaignIds[i]] = c; });
      setCampaignMap(campMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (matchId, status) => {
    setActionError('');
    try {
      await api.matches.respond(matchId, status);
      fetchMatches();
    } catch (err) {
      setActionError('응답 처리에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  const formatSchedule = (schedule) => {
    try {
      return new Date(schedule).toLocaleString('ko-KR', {
        month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch { return schedule; }
  };

  const getStatusBadge = (status) => {
    const map = {
      accepted: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', icon: <CheckCircle2 size={12} />, text: '수락됨' },
      rejected: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', icon: <XCircle size={12} />, text: '거절됨' },
      confirmed: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', icon: <Award size={12} />, text: '최종확정' },
      closed: { bg: 'rgba(255,255,255,0.07)', color: 'hsl(var(--foreground-muted))', icon: <XCircle size={12} />, text: '마감' },
      pending: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', icon: <Clock size={12} />, text: '검토중' },
    };
    const s = map[status] || map.pending;
    return (
      <span className="badge" style={{ background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {s.icon} {s.text}
      </span>
    );
  };

  const getBorderColor = (status) => {
    if (status === 'accepted' || status === 'confirmed') return '#10b981';
    if (status === 'rejected' || status === 'closed') return '#ef4444';
    return '#f59e0b';
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
          <AlertCircle size={48} color="hsl(var(--primary))" style={{ marginBottom: '16px' }} />
          <h3>로그인이 필요한 서비스입니다</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '80px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>매칭 대시보드</h1>
        <p style={{ color: 'hsl(var(--foreground-muted))' }}>
          브랜드사로부터 받은 캠페인 제안을 확인하고 수락 또는 거절하세요.
        </p>
      </div>

      {actionError && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#ef4444', padding: '16px', borderRadius: '12px', marginBottom: '24px'
        }}>
          <AlertCircle size={20} /> <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="loading-spinner" />
          <p style={{ marginTop: '16px', color: 'hsl(var(--foreground-muted))' }}>불러오는 중...</p>
        </div>
      ) : matches.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {matches.map(match => {
            const campaign = match.campaignId ? campaignMap[match.campaignId] : null;
            return (
              <div
                key={match.id}
                className="glass-panel"
                style={{
                  padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px',
                  borderLeft: `4px solid ${getBorderColor(match.status)}`
                }}
              >
                {/* 상단: 브랜드명 + 상태 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Megaphone size={16} color="#818cf8" />
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                        {campaign ? campaign.brandName : match.clientName} 의 캠페인 제안
                      </h3>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))' }}>
                      제안일: {formatDate(match.createdAt)}
                    </span>
                  </div>
                  {getStatusBadge(match.status)}
                </div>

                {/* 캠페인 정보 박스 */}
                {campaign && (
                  <div style={{
                    padding: '14px 16px',
                    background: 'rgba(99,102,241,0.05)',
                    border: '1px solid rgba(99,102,241,0.15)',
                    borderRadius: '10px',
                    display: 'flex', flexWrap: 'wrap', gap: '14px',
                    fontSize: '0.85rem'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'hsl(var(--foreground-muted))' }}>
                      <Calendar size={13} color="#818cf8" />
                      {formatSchedule(campaign.schedule)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'hsl(var(--foreground-muted))' }}>
                      <MapPin size={13} color="#818cf8" />
                      {campaign.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'hsl(var(--foreground-muted))' }}>
                      <Tag size={13} color="#818cf8" />
                      {campaign.category}
                    </span>
                  </div>
                )}

                {/* 메시지 */}
                {match.message && (
                  <div style={{
                    background: 'rgba(0,0,0,0.2)', padding: '14px 18px', borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.04)',
                    fontSize: '0.9rem', lineHeight: '1.6', display: 'flex', gap: '10px', alignItems: 'flex-start'
                  }}>
                    <MessageSquare size={15} color="hsl(var(--foreground-muted))" style={{ marginTop: '3px', flexShrink: 0 }} />
                    <p style={{ margin: 0 }}>{match.message}</p>
                  </div>
                )}

                {/* 캠페인 상세 */}
                {campaign?.description && (
                  <div style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground-muted))', lineHeight: '1.6' }}>
                    {campaign.description}
                  </div>
                )}

                {/* 수락/거절 버튼 (pending 상태에서만) */}
                {match.status === 'pending' && (
                  <div style={{
                    display: 'flex', justifyContent: 'flex-end', gap: '10px',
                    borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px'
                  }}>
                    <button
                      onClick={() => handleRespond(match.id, 'rejected')}
                      className="btn btn-secondary"
                      style={{ padding: '8px 20px', fontSize: '0.88rem' }}
                    >
                      거절하기
                    </button>
                    <button
                      onClick={() => handleRespond(match.id, 'accepted')}
                      className="btn btn-primary"
                      style={{ padding: '8px 24px', fontSize: '0.88rem' }}
                    >
                      제안 수락하기
                    </button>
                  </div>
                )}

                {/* 수락 후 안내 */}
                {(match.status === 'accepted' || match.status === 'confirmed') && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(16,185,129,0.08)', padding: '12px 16px', borderRadius: '8px',
                    fontSize: '0.85rem', color: '#10b981', border: '1px solid rgba(16,185,129,0.15)'
                  }}>
                    <CheckCircle2 size={14} />
                    <span>
                      {match.status === 'confirmed'
                        ? '🎉 브랜드사가 최종 확정했습니다! 곧 상세 일정이 공유됩니다.'
                        : '수락하셨습니다. 브랜드사의 최종 확정을 기다리고 있습니다.'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '100px 40px' }}>
          <Inbox size={48} color="hsl(var(--foreground-muted))" style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>도착한 캠페인 제안이 없습니다</h3>
          <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            프로필을 매력적으로 작성하면 브랜드사의 캠페인 제안을 받을 수 있어요!
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
