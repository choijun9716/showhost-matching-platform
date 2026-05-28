import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Users, Award, Shield, CheckCircle, Clock, XCircle, Zap } from 'lucide-react';

const AdminStats = ({ allMatches = [], hosts = [], clients = [], campaigns = [] }) => {
  
  // 1. 상태별 매칭 요약
  const summary = useMemo(() => {
    return {
      total: allMatches.length,
      pending: allMatches.filter(m => m.status === 'pending').length,
      confirmed: allMatches.filter(m => m.status === 'confirmed').length,
      rejected: allMatches.filter(m => m.status === 'rejected' || m.status === 'closed').length,
    };
  }, [allMatches]);

  // 2. 최고 인기 쇼호스트 Top 5
  const topHosts = useMemo(() => {
    const counts = {};
    allMatches.forEach(m => {
      if (!counts[m.hostId]) counts[m.hostId] = 0;
      counts[m.hostId]++;
    });

    return Object.entries(counts)
      .map(([id, count]) => {
        const host = hosts.find(h => (h.id || h.email || h.name) === id);
        return {
          id,
          count,
          name: host ? host.name : (allMatches.find(match => match.hostId === id)?.hostName || '알 수 없음'),
          image: host ? host.profileImage : null,
          category: host ? host.category : '정보 없음'
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [allMatches, hosts]);

  // 3. 가장 활발한 파트너사 Top 5 (매칭 요청 기준)
  const topClients = useMemo(() => {
    const counts = {};
    allMatches.forEach(m => {
      if (!counts[m.clientId]) counts[m.clientId] = 0;
      counts[m.clientId]++;
    });

    return Object.entries(counts)
      .map(([id, count]) => {
        const client = clients.find(c => c.id === id);
        return {
          id,
          count,
          name: client ? client.name : (allMatches.find(m => m.clientId === id)?.clientName || '알 수 없음')
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [allMatches, clients]);

  // 4. 일별 매칭 추이 (최근 7일)
  const dailyStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = [];
    
    // 최근 7일 날짜 배열 생성
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
      dates.push({
        dateStr,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        count: 0
      });
    }

    allMatches.forEach(m => {
      if (m.createdAt) {
        const dStr = m.createdAt.split('T')[0];
        const matchDate = dates.find(d => d.dateStr === dStr);
        if (matchDate) {
          matchDate.count++;
        }
      }
    });

    const maxCount = Math.max(...dates.map(d => d.count), 5); // 최소 5를 max로 설정하여 그래프가 너무 가득 차 보이지 않게 함
    
    return dates.map(d => ({
      ...d,
      heightPercent: (d.count / maxCount) * 100
    }));
  }, [allMatches]);

  return (
    <div className="admin-stats-container animate-fade-in">
      
      {/* 1. 요약 카드 섹션 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-card glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(229, 229, 229, 0.1)', padding: '16px', borderRadius: '16px', color: '#e5e5e5' }}>
            <Zap size={28} />
          </div>
          <div>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', marginBottom: '4px' }}>총 누적 매칭</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{summary.total}건</h3>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '16px', borderRadius: '16px', color: '#eab308' }}>
            <Clock size={28} />
          </div>
          <div>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', marginBottom: '4px' }}>진행 중 (대기)</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{summary.pending}건</h3>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '16px', color: '#10b981' }}>
            <CheckCircle size={28} />
          </div>
          <div>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', marginBottom: '4px' }}>성사(확정) 완료</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{summary.confirmed}건</h3>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '16px', color: '#ef4444' }}>
            <XCircle size={28} />
          </div>
          <div>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', marginBottom: '4px' }}>거절 / 마감</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{summary.rejected}건</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        
        {/* 2. 일별 매칭 추이 그래프 */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <TrendingUp size={22} color="#ffffff" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>주간 매칭 요청 추이</h3>
          </div>
          
          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px', marginTop: '20px' }}>
            {dailyStats.map((stat, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, marginBottom: '8px' }}>{stat.count > 0 ? stat.count : ''}</div>
                <div style={{ 
                  width: '100%', 
                  background: stat.dateStr === new Date().toISOString().split('T')[0] ? 'linear-gradient(180deg, hsl(260 85% 65%), hsl(var(--primary)))' : 'rgba(255, 255, 255, 0.1)', 
                  height: `${Math.max(stat.heightPercent, 2)}%`, 
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
                <div style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))', marginTop: '12px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. 최고 인기 쇼호스트 Top 5 */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Award size={22} color="#f59e0b" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>인기 쇼호스트 Top 5</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {topHosts.length > 0 ? topHosts.map((host, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '12px' }}>
                <div style={{ 
                  width: '28px', height: '28px', borderRadius: '50%', 
                  background: idx === 0 ? '#f59e0b' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#b45309' : 'rgba(255,255,255,0.1)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontWeight: 800, fontSize: '0.9rem', color: idx < 3 ? '#000' : '#fff'
                }}>
                  {idx + 1}
                </div>
                {host.image ? (
                  <img src={host.image} alt={host.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={20} color="rgba(255,255,255,0.5)" />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>{host.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))' }}>{host.category} 전문가</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e5e5e5' }}>{host.count}건</div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))' }}>매칭수</div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'hsl(var(--foreground-muted))' }}>매칭 데이터가 없습니다.</div>
            )}
          </div>
        </div>

        {/* 4. 활발한 파트너사 Top 5 */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Users size={22} color="#10b981" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>우수 파트너사 Top 5</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {topClients.length > 0 ? topClients.map((client, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ 
                  width: '28px', height: '28px', borderRadius: '50%', 
                  background: idx === 0 ? '#10b981' : 'rgba(255,255,255,0.1)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontWeight: 800, fontSize: '0.9rem', color: idx === 0 ? '#000' : '#fff'
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{client.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>{client.count}건</div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))' }}>요청수</div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'hsl(var(--foreground-muted))' }}>매칭 데이터가 없습니다.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminStats;
