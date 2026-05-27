import React, { useState, useEffect } from 'react';
import { api } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, Trash2, Star, Zap, Plus, Users, UserCheck } from 'lucide-react';

const Admin = ({ onNavigateToCampaignCreate }) => {
  const { user } = useAuth();
  const [hosts, setHosts] = useState([]);
  const [clients, setClients] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hosts'); // 'hosts' | 'clients' | 'matches'
  const [chargeAmounts, setChargeAmounts] = useState({}); // { userId: amount }
  const [chargingId, setChargingId] = useState(null);

  // 권한 체크 로직
  if (!user || user.role !== 'admin') {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <Shield size={48} color="#ef4444" style={{ margin: '0 auto 20px auto' }} />
        <h2>접근 권한이 없습니다</h2>
        <p style={{ color: 'hsl(var(--foreground-muted))' }}>관리자 계정으로 로그인해 주세요.</p>
      </div>
    );
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileData, allUsers, matchesData] = await Promise.all([
        api.profiles.list(),
        api.users.list(),
        api.matches.listAll()
      ]);
      setHosts(profileData);
      const clientUsers = allUsers.filter(u => u.role === 'client');
      setClients(clientUsers);
      setAllMatches(matchesData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleVisibility = async (host) => {
    try {
      const newStatus = !host.isHidden;
      const targetId = host.id || host.email || host.name;
      await api.profiles.update(targetId, { isHidden: newStatus });
      setHosts(prev => prev.map(h => (h.id || h.email || h.name) === targetId ? { ...h, isHidden: newStatus } : h));
    } catch (error) {
      alert('상태 업데이트 실패: ' + error.message);
    }
  };

  const handleToggleRecommended = async (host) => {
    try {
      const newStatus = !host.isRecommended;
      const targetId = host.id || host.email || host.name;
      await api.profiles.update(targetId, { isRecommended: newStatus });
      setHosts(prev => prev.map(h => (h.id || h.email || h.name) === targetId ? { ...h, isRecommended: newStatus } : h));
    } catch (error) {
      alert('추천 상태 업데이트 실패: ' + error.message);
    }
  };

  const handleOrderChange = (host, newOrder) => {
    const targetId = host.id || host.email || host.name;
    const val = newOrder === '' ? '' : (parseInt(newOrder, 10) || 0);
    setHosts(prev => prev.map(h => (h.id || h.email || h.name) === targetId ? { ...h, displayOrder: val } : h));
  };

  const handleOrderBlur = async (host) => {
    try {
      const targetId = host.id || host.email || host.name;
      const finalOrder = parseInt(host.displayOrder, 10) || 0;
      await api.profiles.update(targetId, { displayOrder: finalOrder });
      if (host.displayOrder === '') {
        setHosts(prev => prev.map(h => (h.id || h.email || h.name) === targetId ? { ...h, displayOrder: 0 } : h));
      }
    } catch (error) {
      alert('순서 업데이트 실패: ' + error.message);
    }
  };

  const handleDelete = async (host) => {
    if (window.confirm(`정말로 ${host.name} 쇼호스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      try {
        const targetId = host.id || host.email || host.name;
        await api.profiles.delete(targetId);
        setHosts(prev => prev.filter(h => (h.id || h.email || h.name) !== targetId));
      } catch (error) {
        alert('삭제 실패: ' + error.message);
      }
    }
  };

  const handleChargeCredits = async (client) => {
    const amount = parseInt(chargeAmounts[client.id]) || 0;
    if (amount <= 0) {
      alert('충전할 크레딧 수량을 입력해 주세요. (1 이상)');
      return;
    }
    setChargingId(client.id);
    try {
      const newTotal = await api.users.chargePoints(client.id, amount, '관리자 수동 충전');
      setClients(prev => prev.map(c => c.id === client.id ? { ...c, points: newTotal } : c));
      setChargeAmounts(prev => ({ ...prev, [client.id]: '' }));
      alert(`✅ ${client.name}님에게 ${amount}크레딧을 충전했습니다. (현재 잔액: ${newTotal}C)`);
    } catch (error) {
      alert('충전 실패: ' + error.message);
    } finally {
      setChargingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '20px', color: 'hsl(var(--foreground-muted))' }}>관리자 데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Shield size={28} className="text-gradient-cyan" />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>관리자 패널</h1>
      </div>

      {/* 탭 버튼 및 액션 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('hosts')}
            className="btn"
            style={{
              padding: '10px 20px',
              display: 'flex', alignItems: 'center', gap: '6px',
              background: activeTab === 'hosts' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: activeTab === 'hosts' ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
              fontWeight: activeTab === 'hosts' ? 700 : 400
            }}
          >
            <UserCheck size={16} />
            쇼호스트 관리
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className="btn"
            style={{
              padding: '10px 20px',
              display: 'flex', alignItems: 'center', gap: '6px',
              background: activeTab === 'clients' ? 'rgba(99,102,241,0.15)' : 'transparent',
              border: activeTab === 'clients' ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              color: activeTab === 'clients' ? '#818cf8' : 'inherit',
              fontWeight: activeTab === 'clients' ? 700 : 400
            }}
          >
            <Users size={16} />
            파트너사(브랜드) 관리
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className="btn"
            style={{
              padding: '10px 20px',
              display: 'flex', alignItems: 'center', gap: '6px',
              background: activeTab === 'matches' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: activeTab === 'matches' ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
              fontWeight: activeTab === 'matches' ? 700 : 400
            }}
          >
            <Zap size={16} />
            총 매칭 현황
          </button>
        </div>
        <div>
          <button
            onClick={onNavigateToCampaignCreate}
            className="btn btn-primary"
            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            캠페인 생성
          </button>
        </div>
      </div>

      {activeTab === 'hosts' && (
        <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 700 }}>쇼호스트 관리</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'hsl(var(--foreground-muted))' }}>
                <th style={{ padding: '12px', fontWeight: 600 }}>프로필</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>이름 (아이디)</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>카테고리</th>
                <th style={{ padding: '12px', fontWeight: 600, textAlign: 'center' }}>노출 순서</th>
                <th style={{ padding: '12px', fontWeight: 600, textAlign: 'center' }}>추천 뱃지</th>
                <th style={{ padding: '12px', fontWeight: 600, textAlign: 'center' }}>숨김 처리</th>
                <th style={{ padding: '12px', fontWeight: 600, textAlign: 'center' }}>삭제</th>
              </tr>
            </thead>
            <tbody>
              {hosts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--foreground-muted))' }}>
                    등록된 쇼호스트가 없습니다.
                  </td>
                </tr>
              ) : (
                hosts.map((host, index) => (
                  <tr key={host.id || host.email || host.name || index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', opacity: host.isHidden ? 0.6 : 1 }}>
                    <td style={{ padding: '12px' }}>
                      <img 
                        src={host.profileImage} 
                        alt={host.name} 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{host.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))' }}>{host.email}</div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                      {host.category}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <input 
                        type="number" 
                        value={host.displayOrder ?? 0}
                        onChange={(e) => handleOrderChange(host, e.target.value)}
                        onBlur={() => handleOrderBlur(host)}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                        style={{ 
                          width: '60px',  
                          background: 'rgba(255, 255, 255, 0.1)', 
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          padding: '6px',
                          borderRadius: '6px',
                          textAlign: 'center'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleToggleRecommended(host)}
                        className={`btn ${host.isRecommended ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <Star size={14} style={{ marginRight: '4px', fill: host.isRecommended ? '#fff' : 'none' }} />
                        {host.isRecommended ? '추천됨' : '일반'}
                      </button>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleToggleVisibility(host)}
                        className="btn"
                        style={{ 
                          padding: '6px 12px', fontSize: '0.8rem',
                          background: host.isHidden ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                          color: host.isHidden ? '#ef4444' : 'white',
                          border: `1px solid ${host.isHidden ? '#ef4444' : 'rgba(255, 255, 255, 0.2)'}`
                        }}
                      >
                        {host.isHidden ? <EyeOff size={14} style={{ marginRight: '4px' }} /> : <Eye size={14} style={{ marginRight: '4px' }} />}
                        {host.isHidden ? '숨김됨' : '노출중'}
                      </button>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleDelete(host)}
                        className="btn"
                        style={{ padding: '6px', background: 'transparent', color: 'hsl(var(--foreground-muted))', border: 'none', cursor: 'pointer' }}
                        title="영구 삭제"
                      >
                        <Trash2 size={18} className="hover-danger" style={{ transition: 'color 0.2s ease' }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Zap size={20} color="#818cf8" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>브랜드 크레딧 관리</h2>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))' }}>
              매칭 1건 = 10크레딧 차감
            </span>
          </div>

          {clients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--foreground-muted))' }}>
              등록된 브랜드 계정이 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {clients.map(client => {
                const credits = parseInt(client.points) || 0;
                return (
                  <div
                    key={client.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '12px',
                      flexWrap: 'wrap'
                    }}
                  >
                    {/* 유저 정보 */}
                    <div style={{ flex: 1, minWidth: '160px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{client.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))' }}>{client.email}</div>
                    </div>

                    {/* 현재 크레딧 */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: credits > 0 ? 'rgba(99,102,241,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${credits > 0 ? 'rgba(99,102,241,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      minWidth: '100px',
                      justifyContent: 'center'
                    }}>
                      <Zap size={14} color={credits > 0 ? '#818cf8' : '#ef4444'} />
                      <span style={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: credits > 0 ? '#818cf8' : '#ef4444'
                      }}>
                        {credits.toLocaleString()} C
                      </span>
                    </div>

                    {/* 충전 입력 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        min="1"
                        placeholder="충전량"
                        value={chargeAmounts[client.id] || ''}
                        onChange={e => setChargeAmounts(prev => ({ ...prev, [client.id]: e.target.value }))}
                        style={{
                          width: '90px',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: 'white',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          textAlign: 'center'
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))' }}>C</span>
                      <button
                        onClick={() => handleChargeCredits(client)}
                        disabled={chargingId === client.id}
                        className="btn btn-primary"
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          opacity: chargingId === client.id ? 0.6 : 1
                        }}
                      >
                        <Plus size={14} />
                        {chargingId === client.id ? '충전 중...' : '충전'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {activeTab === 'matches' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>총 매칭 및 제안 현황 ({allMatches.length}건)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'hsl(var(--foreground-muted))', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>발송일시</th>
                  <th style={{ padding: '12px' }}>매칭 ID / 캠페인 ID</th>
                  <th style={{ padding: '12px' }}>브랜드(클라이언트)</th>
                  <th style={{ padding: '12px' }}>쇼호스트</th>
                  <th style={{ padding: '12px' }}>메시지</th>
                  <th style={{ padding: '12px' }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {allMatches.map((m, i) => {
                  const statusColors = {
                    pending: '#f59e0b',
                    accepted: '#22c55e',
                    rejected: '#ef4444',
                    confirmed: '#818cf8',
                    closed: 'gray'
                  };
                  const statusText = {
                    pending: '대기중',
                    accepted: '수락',
                    rejected: '거절',
                    confirmed: '확정',
                    closed: '마감'
                  };
                  return (
                    <tr key={m.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px' }}>{new Date(m.createdAt).toLocaleString('ko-KR')}</td>
                      <td style={{ padding: '12px', color: 'hsl(var(--foreground-muted))', fontSize: '0.8rem' }}>
                        <div>Match: {m.id}</div>
                        {m.campaignId && <div>Camp: {m.campaignId}</div>}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{m.clientName}</td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{m.hostName}</td>
                      <td style={{ padding: '12px', color: 'hsl(var(--foreground-muted))' }}>{m.message || '-'}</td>
                      <td style={{ padding: '12px', color: statusColors[m.status] || 'white', fontWeight: 700 }}>
                        {statusText[m.status] || m.status}
                      </td>
                    </tr>
                  )
                })}
                {allMatches.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--foreground-muted))' }}>
                      진행된 매칭 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        .hover-danger:hover { color: #ef4444 !important; }
      `}</style>
    </div>
  );
};

export default Admin;
