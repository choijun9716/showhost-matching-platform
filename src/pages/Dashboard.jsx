import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../supabaseClient';
import { Calendar, CheckCircle2, XCircle, Clock, MessageSquare, Send, Inbox, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      if (user.role === 'showhost') {
        const data = await api.matches.listForHost(user.id);
        setMatches(data);
      } else {
        const data = await api.matches.listForClient(user.id);
        setMatches(data);
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (matchId, status) => {
    setActionError('');
    try {
      await api.matches.respond(matchId, status);
      // 리스트 갱신
      fetchMatches();
    } catch (err) {
      console.error('Error responding to match:', err);
      setActionError('매칭 응답 처리에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.25)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} />
            수락됨
          </span>
        );
      case 'rejected':
        return (
          <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.25)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={12} />
            거절됨
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.25)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            검토중
          </span>
        );
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
          <AlertCircle size={48} color="hsl(var(--primary))" style={{ marginBottom: '16px' }} />
          <h3>로그인이 필요한 서비스입니다</h3>
          <p style={{ color: 'hsl(var(--foreground-muted))', marginTop: '8px' }}>
            매칭 대시보드를 이용하려면 먼저 로그인 또는 회원가입을 완료해 주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '80px' }}>
      
      {/* Title Header */}
      <div style={{ marginBottom: '45px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>매칭 대시보드</h1>
        <p style={{ color: 'hsl(var(--foreground-muted))' }}>
          {user.role === 'showhost' 
            ? '브랜드사로부터 제안받은 라이브 방송 요청 목록을 관리합니다.'
            : '쇼호스트에게 보낸 제안서의 진행 및 수락 상태를 트래킹합니다.'}
        </p>
      </div>

      {actionError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '24px',
          fontSize: '0.95rem'
        }}>
          <AlertCircle size={20} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Matches List Section */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ 
            border: '3px solid rgba(255, 255, 255, 0.1)',
            borderTop: '3px solid hsl(var(--primary))',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }} />
          <p style={{ color: 'hsl(var(--foreground-muted))' }}>매칭 내역을 불러오고 있습니다...</p>
        </div>
      ) : matches.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {matches.map(match => (
            <div 
              key={match.id}
              className="glass-panel"
              style={{
                padding: '24px 30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                borderLeft: match.status === 'accepted' 
                  ? '4px solid #10b981' 
                  : match.status === 'rejected' 
                    ? '4px solid #ef4444' 
                    : '4px solid #f59e0b'
              }}
            >
              {/* Top Row: Meta info & status */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {user.role === 'showhost' ? (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}>
                      B
                    </div>
                  ) : (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}>
                      S
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                      {user.role === 'showhost' ? `${match.clientName}의 방송 제안` : `${match.hostName} 쇼호스트에게 보낸 제안`}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Calendar size={12} />
                      {formatDate(match.createdAt)}
                    </span>
                  </div>
                </div>

                <div>
                  {getStatusBadge(match.status)}
                </div>
              </div>

              {/* Message Content */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '16px 20px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.03)',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                color: 'hsl(var(--foreground))',
                whiteSpace: 'pre-wrap',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <MessageSquare size={16} color="hsl(var(--foreground-muted))" style={{ marginTop: '4px', flexShrink: 0 }} />
                <p>{match.message}</p>
              </div>

              {/* Host Response Controls (If current user is showhost & state is pending) */}
              {user.role === 'showhost' && match.status === 'pending' && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  paddingTop: '16px',
                  marginTop: '4px'
                }}>
                  <button
                    onClick={() => handleRespond(match.id, 'rejected')}
                    className="btn btn-secondary"
                    style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                  >
                    거절하기
                  </button>
                  <button
                    onClick={() => handleRespond(match.id, 'accepted')}
                    className="btn btn-primary"
                    style={{ padding: '8px 24px', fontSize: '0.85rem' }}
                  >
                    제안 수락하기
                  </button>
                </div>
              )}

              {/* Show contact details on acceptance */}
              {match.status === 'accepted' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.15)'
                }}>
                  <CheckCircle2 size={14} />
                  <span>
                    {user.role === 'showhost' 
                      ? '매칭이 수락되었습니다! 브랜드 파트너에게 이메일로 곧 추가 상세 가이드가 전달됩니다.'
                      : '쇼호스트가 제안을 수락했습니다! 상세 협의를 위해 기입해주신 정보로 빠른 시일 내 연락 예정입니다.'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel" style={{ textAlign: 'center', padding: '100px 40px' }}>
          {user.role === 'showhost' ? (
            <>
              <Inbox size={48} color="hsl(var(--foreground-muted))" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>도착한 제안이 없습니다</h3>
              <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                프로필 정보를 매력적으로 작성하고 검색 상위에 노출되어 다양한 브랜드사의 요청을 받아보세요.
              </p>
            </>
          ) : (
            <>
              <Send size={48} color="hsl(var(--foreground-muted))" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>신청한 매칭이 없습니다</h3>
              <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto', marginBottom: '24px' }}>
                쇼호스트 탐색 탭으로 이동하여 마음에 드는 쇼호스트를 찾아 매칭을 신청해 보세요.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
