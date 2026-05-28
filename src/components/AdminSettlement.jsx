import React, { useState, useMemo } from 'react';
import { api } from '../supabaseClient';
import { DollarSign, CheckCircle, Clock, TrendingUp, AlertCircle, Search, Download } from 'lucide-react';

// 예산 문자열("50만원", "3,000,000")을 숫자로 변환하는 유틸리티
const parseBudget = (budgetStr) => {
  if (!budgetStr) return 0;
  let str = budgetStr.toString().replace(/,/g, '').trim();
  if (str.includes('만원')) {
    const num = parseFloat(str.replace('만원', '').trim());
    if (!isNaN(num)) return num * 10000;
  }
  const num = parseInt(str.replace(/[^0-9]/g, ''));
  return isNaN(num) ? 0 : num;
};

const formatCurrency = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num) + '원';
};

const AdminSettlement = ({ allMatches = [], campaigns = [], hosts = [], onUpdateMatch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unpaid' | 'paid'

  // 확정(confirmed)된 매칭만 필터링 및 정산 데이터 병합
  const confirmedMatches = useMemo(() => {
    return allMatches
      .filter(m => m.status === 'confirmed')
      .map(m => {
        const campaign = campaigns.find(c => c.id === m.campaignId);
        const host = hosts.find(h => (h.id || h.email || h.name) === m.hostId);
        const rawBudget = host && host.pay ? host.pay : '0';
        const budget = parseBudget(rawBudget);
        
        // 3.3% 원천징수 제외 금액 계산
        const taxRate = 0.033;
        const taxAmount = Math.floor(budget * taxRate);
        const settlementAmount = budget - taxAmount;

        // 플랫폼 순이익 (임시로 10% 가정)
        const platformMargin = 0.10;
        const platformProfit = Math.floor(budget * platformMargin);

        // 시트 DB에 isSettled가 문자열 "true"로 들어갈 수도 있으므로 변환
        const isSettled = m.isSettled === true || m.isSettled === 'TRUE' || m.isSettled === 'true';

        return {
          ...m,
          campaignName: campaign ? campaign.title : '직접 매칭',
          rawBudget,
          budget,
          settlementAmount,
          taxAmount,
          platformProfit,
          isSettled
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [allMatches, campaigns]);

  // 대시보드 통계 계산
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalSettlement = 0;
    let totalProfit = 0;
    let unpaidSettlement = 0;

    confirmedMatches.forEach(m => {
      totalRevenue += m.budget;
      totalSettlement += m.settlementAmount;
      totalProfit += m.platformProfit;
      if (!m.isSettled) {
        unpaidSettlement += m.settlementAmount;
      }
    });

    return { totalRevenue, totalSettlement, totalProfit, unpaidSettlement };
  }, [confirmedMatches]);

  // 화면에 보여줄 리스트 필터링
  const filteredMatches = useMemo(() => {
    return confirmedMatches.filter(m => {
      const matchesSearch = (m.hostName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (m.campaignName || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filter === 'all' ? true 
                          : filter === 'unpaid' ? !m.isSettled 
                          : m.isSettled;
      
      return matchesSearch && matchesFilter;
    });
  }, [confirmedMatches, searchTerm, filter]);

  // 정산 상태 토글 핸들러
  const handleToggleSettlement = async (matchId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      // SheetDB 업데이트를 위해 api.matches.update 호출 (만들어야 함) 또는 sheetdbPatch를 직접 사용해야 하지만,
      // 가장 좋은 것은 상위(Admin.jsx)에서 상태를 업데이트하고 DB에 패치하는 것.
      // 일단 onUpdateMatch props를 통해 처리
      if (onUpdateMatch) {
        await onUpdateMatch(matchId, { isSettled: newStatus });
      } else {
        // Fallback: 직접 api를 통한 호출이 필요할 수 있음
        // api.matches.update가 없는 경우를 대비
        alert('정산 상태 업데이트 기능이 부모 컴포넌트(Admin.jsx)에 연결되어야 합니다.');
      }
    } catch (error) {
      console.error(error);
      alert('정산 상태 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="admin-settlement-container animate-fade-in">
      
      {/* 1. 요약 카드 섹션 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-card glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #e5e5e5' }}>
          <div style={{ background: 'rgba(229, 229, 229, 0.1)', padding: '16px', borderRadius: '16px', color: '#e5e5e5' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', marginBottom: '4px' }}>누적 매출액 (예산 총합)</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{formatCurrency(stats.totalRevenue)}</h3>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #10b981' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '16px', color: '#10b981' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', marginBottom: '4px' }}>예상 순이익 (마진 10%)</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{formatCurrency(stats.totalProfit)}</h3>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #ffffff' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '16px', borderRadius: '16px', color: '#ffffff' }}>
            <CheckCircle size={28} />
          </div>
          <div>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', marginBottom: '4px' }}>누적 정산 지급 발생액</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{formatCurrency(stats.totalSettlement)}</h3>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '16px', color: '#ef4444' }}>
            <Clock size={28} />
          </div>
          <div>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', marginBottom: '4px' }}>미지급 정산 잔액</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: stats.unpaidSettlement > 0 ? '#ef4444' : 'inherit' }}>
              {formatCurrency(stats.unpaidSettlement)}
            </h3>
          </div>
        </div>
      </div>

      {/* 2. 정산 리스트 필터 및 테이블 */}
      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>매칭 별 정산 내역</h2>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Search size={16} color="rgba(255,255,255,0.5)" style={{ marginRight: '8px' }} />
              <input 
                type="text" 
                placeholder="쇼호스트명 또는 캠페인명 검색" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '200px' }}
              />
            </div>
            
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '8px', outline: 'none' }}
            >
              <option value="all" style={{ background: '#1e1e1e' }}>전체 보기</option>
              <option value="unpaid" style={{ background: '#1e1e1e' }}>미정산 건만 보기</option>
              <option value="paid" style={{ background: '#1e1e1e' }}>정산 완료 건 보기</option>
            </select>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'hsl(var(--foreground-muted))' }}>
              <th style={{ padding: '12px', fontWeight: 600 }}>매칭일자</th>
              <th style={{ padding: '12px', fontWeight: 600 }}>캠페인명</th>
              <th style={{ padding: '12px', fontWeight: 600 }}>쇼호스트</th>
              <th style={{ padding: '12px', fontWeight: 600, textAlign: 'right' }}>쇼호스트 페이 (원금)</th>
              <th style={{ padding: '12px', fontWeight: 600, textAlign: 'right', color: '#e5e5e5' }}>실지급액 (3.3%제외)</th>
              <th style={{ padding: '12px', fontWeight: 600, textAlign: 'center' }}>정산 상태</th>
              <th style={{ padding: '12px', fontWeight: 600, textAlign: 'center' }}>처리</th>
            </tr>
          </thead>
          <tbody>
            {filteredMatches.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--foreground-muted))' }}>
                  해당 조건에 맞는 확정 매칭 내역이 없습니다.
                </td>
              </tr>
            ) : (
              filteredMatches.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: m.isSettled ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
                  <td style={{ padding: '12px', color: 'hsl(var(--foreground-muted))' }}>{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{m.campaignName}</td>
                  <td style={{ padding: '12px' }}>{m.hostName}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(m.budget)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#e5e5e5' }}>
                    {formatCurrency(m.settlementAmount)}
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', fontWeight: 400, marginTop: '4px' }}>
                      원천징수 {formatCurrency(m.taxAmount)}
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {m.isSettled ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                        <CheckCircle size={14} /> 지급 완료
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Clock size={14} /> 미지급
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleToggleSettlement(m.id, m.isSettled)}
                      className="btn"
                      style={{
                        padding: '6px 12px',
                        background: m.isSettled ? 'rgba(255,255,255,0.1)' : '#10b981',
                        color: m.isSettled ? '#fff' : '#000',
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      {m.isSettled ? '지급 취소' : '입금 완료'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSettlement;
