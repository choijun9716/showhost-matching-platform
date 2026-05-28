import React, { useState, useEffect } from 'react';
import { api } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, Trash2, Star, Zap, Plus, Users, UserCheck, Search, Filter, ChevronDown, ChevronUp, Clock, Calendar, MapPin, Tag, Award, BarChart3, DollarSign } from 'lucide-react';
import AdminStats from '../components/AdminStats';
import AdminSettlement from '../components/AdminSettlement';

const Admin = ({ onNavigateToCampaignCreate }) => {
  const { user } = useAuth();
  const [hosts, setHosts] = useState([]);
  const [clients, setClients] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(user?.role === 'subadmin' ? 'matches' : 'hosts');
  const [chargeAmounts, setChargeAmounts] = useState({}); // { userId: amount }
  const [chargingId, setChargingId] = useState(null);

  // Filters for matches tab
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [hostSearchQuery, setHostSearchQuery] = useState('');
  const [expandedCampaigns, setExpandedCampaigns] = useState({});

  const toggleCampaign = (id) => {
    setExpandedCampaigns(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 권한 체크 로직
  if (!user || (user.role !== 'admin' && user.role !== 'subadmin')) {
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
      const [profileData, allUsers, matchesData, campaignsData] = await Promise.all([
        api.profiles.list(),
        api.users.list(),
        api.matches.listAll(),
        api.campaigns.listAll()
      ]);
      setHosts(profileData);
      const clientUsers = allUsers.filter(u => u.role === 'client');
      setClients(clientUsers);
      setAllMatches(matchesData);
      setAllCampaigns(campaignsData);
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

  useEffect(() => {
    if (user?.role === 'subadmin') {
      if (activeTab === 'hosts' || activeTab === 'stats' || activeTab === 'settlement') {
        setActiveTab('matches');
      }
    }
  }, [user, activeTab]);

  const handleUpdateMatch = async (matchId, updates) => {
    try {
      await api.matches.update(matchId, updates);
      setAllMatches(prev => prev.map(m => m.id === matchId ? { ...m, ...updates } : m));
    } catch (error) {
      console.error(error);
      alert('매칭 업데이트 실패: ' + error.message);
    }
  };

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
        <Shield size={28} className="text-gradient-primary" />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>관리자 패널</h1>
      </div>

      {/* 탭 버튼 및 액션 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {user.role === 'admin' && (
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
          )}
          <button
            onClick={() => setActiveTab('clients')}
            className="btn"
            style={{
              padding: '10px 20px',
              display: 'flex', alignItems: 'center', gap: '6px',
              background: activeTab === 'clients' ? 'rgba(255, 255, 255,0.15)' : 'transparent',
              border: activeTab === 'clients' ? '1px solid rgba(255, 255, 255,0.3)' : '1px solid transparent',
              color: activeTab === 'clients' ? '#ffffff' : 'inherit',
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
          {user.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('stats')}
            className="btn"
            style={{
              padding: '10px 20px',
              display: 'flex', alignItems: 'center', gap: '6px',
              background: activeTab === 'stats' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              border: activeTab === 'stats' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
              color: activeTab === 'stats' ? '#f59e0b' : 'inherit',
              fontWeight: activeTab === 'stats' ? 700 : 400
            }}
          >
            <BarChart3 size={16} />
            통계 및 리포트
          </button>
          <button
            onClick={() => setActiveTab('settlement')}
            className="btn"
            style={{
              padding: '10px 20px',
              display: 'flex', alignItems: 'center', gap: '6px',
              background: activeTab === 'settlement' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: activeTab === 'settlement' ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
              fontWeight: activeTab === 'settlement' ? 700 : 400
            }}
          >
            <DollarSign size={16} />
              정산 관리
              </button>
            </>
          )}
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

      {user.role === 'admin' && activeTab === 'stats' && (
        <AdminStats allMatches={allMatches} hosts={hosts} clients={clients} campaigns={allCampaigns} />
      )}

      {user.role === 'admin' && activeTab === 'settlement' && (
        <AdminSettlement allMatches={allMatches} campaigns={allCampaigns} hosts={hosts} onUpdateMatch={handleUpdateMatch} />
      )}

      {user.role === 'admin' && activeTab === 'hosts' && (
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
            <Zap size={20} color="#ffffff" />
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
                      background: credits > 0 ? 'rgba(255, 255, 255,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${credits > 0 ? 'rgba(255, 255, 255,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      minWidth: '100px',
                      justifyContent: 'center'
                    }}>
                      <Zap size={14} color={credits > 0 ? '#ffffff' : '#ef4444'} />
                      <span style={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: credits > 0 ? '#ffffff' : '#ef4444'
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
      {activeTab === 'matches' && (() => {
        // 호스트 맵 생성 (사진 표시용)
        const hostsMap = Object.fromEntries(hosts.map(h => [h.id || h.email || h.name, h]));

        // 매칭 검색 필터 적용
        const filteredMatches = allMatches.filter(m => {
          const matchCampaign = campaignFilter === 'all' || m.campaignId === campaignFilter;
          const matchHost = hostSearchQuery.trim() === '' || m.hostName?.toLowerCase().includes(hostSearchQuery.toLowerCase());
          return matchCampaign && matchHost;
        });

        // 캠페인별로 매칭 내역 그룹화
        const matchesByCampaign = {};
        const unassignedMatches = [];
        filteredMatches.forEach(m => {
          if (m.campaignId && allCampaigns.find(c => c.id === m.campaignId)) {
            if (!matchesByCampaign[m.campaignId]) matchesByCampaign[m.campaignId] = [];
            matchesByCampaign[m.campaignId].push(m);
          } else {
            unassignedMatches.push(m);
          }
        });

        // 보여줄 캠페인 리스트 (검색/필터에 의해 매칭 내역이 있는 캠페인만 표시)
        const visibleCampaigns = allCampaigns.filter(c => matchesByCampaign[c.id] && matchesByCampaign[c.id].length > 0);

        const statusColors = {
          pending: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: '대기중' },
          accepted: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: '수락함' },
          rejected: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: '거절함' },
          confirmed: { bg: 'rgba(255, 255, 255,0.15)', text: '#ffffff', label: '최종확정' },
          closed: { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af', label: '마감됨' }
        };

        const renderMatchItem = (m, showCampaignInfo = false) => {
          const badge = statusColors[m.status] || { bg: 'rgba(255,255,255,0.1)', text: 'white', label: m.status };
          const hostData = hostsMap[m.hostId] || hostsMap[m.hostName];
          return (
            <div key={m.id} style={{ 
              display: 'flex', alignItems: 'center', gap: '16px', 
              padding: '16px 24px', 
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.01)',
              transition: 'background 0.2s'
            }} className="hover-row">
              {/* 호스트 사진 */}
              <div style={{ flexShrink: 0 }}>
                {hostData?.profileImage ? (
                  <img src={hostData.profileImage} alt={m.hostName} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={24} color="#a1a1aa" />
                  </div>
                )}
              </div>
              {/* 호스트 정보 및 메시지 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>{m.hostName}</span>
                  <span style={{
                    padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                    background: badge.bg, color: badge.text
                  }}>{badge.label}</span>
                </div>
                <div style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {showCampaignInfo && m.clientName && <span style={{ color: '#ffffff', marginRight: '8px' }}>[{m.clientName}]</span>}
                  {m.message ? `"${m.message}"` : '메시지 없음'}
                </div>
              </div>
              {/* 추가 정보 (날짜 등) */}
              <div style={{ textAlign: 'right', flexShrink: 0, fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))' }}>
                <div>발송: {new Date(m.createdAt).toLocaleDateString('ko-KR')}</div>
                <div style={{ opacity: 0.5 }}>ID: {m.id}</div>
              </div>
            </div>
          );
        };

        return (
          <div className="animate-fade-in" style={{ padding: '0 0 40px 0' }}>
            {/* 상단 컨트롤 영역 */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>캠페인별 매칭 현황 ({filteredMatches.length}건)</h2>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Filter size={16} style={{ position: 'absolute', left: '12px', color: 'hsl(var(--foreground-muted))' }} />
                    <select
                      className="input-field"
                      value={campaignFilter}
                      onChange={(e) => setCampaignFilter(e.target.value)}
                      style={{ paddingLeft: '36px', minWidth: '180px', height: '40px' }}
                    >
                      <option value="all">전체 캠페인</option>
                      {allCampaigns.map(c => (
                        <option key={c.id} value={c.id}>{c.brandName ? `[${c.brandName}] 캠페인` : c.id}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', color: 'hsl(var(--foreground-muted))' }} />
                    <input
                      type="text"
                      className="input-field"
                      placeholder="쇼호스트 이름 검색..."
                      value={hostSearchQuery}
                      onChange={(e) => setHostSearchQuery(e.target.value)}
                      style={{ paddingLeft: '36px', height: '40px', width: '200px' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 캠페인 리스트 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {visibleCampaigns.length === 0 && unassignedMatches.length === 0 && (
                <div className="glass-panel" style={{ padding: '40px 24px', textAlign: 'center' }}>
                  <div style={{ color: 'hsl(var(--foreground-muted))', marginBottom: '8px' }}>검색 조건에 맞는 매칭 내역이 없습니다.</div>
                </div>
              )}

              {visibleCampaigns.map(campaign => {
                const isExpanded = expandedCampaigns[campaign.id];
                const campProposals = matchesByCampaign[campaign.id];
                const statusInfo = campaign.status === 'confirmed' 
                  ? { text: '매칭 확정', bg: 'rgba(34,197,94,0.15)', color: '#22c55e' } 
                  : campaign.status === 'closed'
                  ? { text: '모집 마감', bg: 'rgba(255,255,255,0.1)', color: 'gray' }
                  : { text: '모집 중', bg: 'rgba(255, 255, 255,0.15)', color: '#ffffff' };

                return (
                  <div key={campaign.id} className="glass-panel" style={{ overflow: 'hidden' }}>
                    {/* 캠페인 헤더 */}
                    <div 
                      style={{ padding: '20px 24px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', transition: 'background 0.2s' }} 
                      onClick={() => toggleCampaign(campaign.id)}
                      className="hover-row"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, background: statusInfo.bg, color: statusInfo.color }}>
                              {statusInfo.text}
                              {campaign.status === 'open' && typeof campaign.confirmedHostId === 'string' && campaign.confirmedHostId.length > 0 && ` (${campaign.confirmedHostId.split(',').length}/${campaign.recruitCount || 1}명 확정)`}
                            </span>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>[{campaign.clientName}] {campaign.brandName}</h3>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem', color: 'hsl(var(--foreground-muted))' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Calendar size={13} color="#ffffff" /> {campaign.schedule}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Tag size={13} color="#ffffff" /> {campaign.category}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Users size={13} color="#ffffff" /> 모집: {campaign.recruitCount || 1}명
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.4)' }}>
                              캠페인 ID: {campaign.id}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                          <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                            <div style={{ color: 'hsl(var(--foreground-muted))' }}>관련 제안 수</div>
                            <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1.1rem' }}>{campProposals.length}건</div>
                          </div>
                          <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 제안 목록 내용 */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        {campProposals.map(m => renderMatchItem(m, false))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 미지정/기타 제안들 (캠페인이 삭제되었거나 없는 경우) */}
              {unassignedMatches.length > 0 && (
                <div className="glass-panel" style={{ overflow: 'hidden', marginTop: '16px' }}>
                  <div 
                    style={{ padding: '20px 24px', cursor: 'pointer', background: 'rgba(239,68,68,0.05)' }} 
                    onClick={() => toggleCampaign('unassigned')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                          캠페인 미지정
                        </span>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>기타 매칭 내역</h3>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontWeight: 700, color: '#ef4444' }}>{unassignedMatches.length}건</div>
                        {expandedCampaigns['unassigned'] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>
                  {expandedCampaigns['unassigned'] && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {unassignedMatches.map(m => renderMatchItem(m, true))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <style>{`
        .hover-danger:hover { color: #ef4444 !important; }
        .hover-row:hover { background: rgba(255,255,255,0.03) !important; }
      `}</style>
    </div>
  );
};

export default Admin;
