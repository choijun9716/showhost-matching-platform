import React, { useState } from 'react';
import { Megaphone, Send, Users, CheckCircle, Calendar, TrendingUp, Plus, Trash2 } from 'lucide-react';

const INITIAL_HISTORY = [
  {
    id: 'msg-1',
    title: '📢 쇼호스트 서현님의 패션 썸머 라이브가 10분 뒤 시작됩니다!',
    targetGroup: '패션/뷰티 선호 파트너사',
    sentCount: 1200,
    openRate: 88.5,
    clickRate: 45.2,
    status: '발송 완료',
    createdAt: '2026-07-09 14:00'
  },
  {
    id: 'msg-2',
    title: '🎁 IT/가전 완판 신화! 쇼호스트 지수님 섭외 수수료 20% 할인 쿠폰',
    targetGroup: 'IT/가전 관련 파트너사',
    sentCount: 450,
    openRate: 92.1,
    clickRate: 58.4,
    status: '발송 완료',
    createdAt: '2026-07-08 10:30'
  }
];

const TARGET_GROUPS = [
  { value: 'all', label: '전체 파트너사 (1,850개사)', count: 1850 },
  { value: 'fashion_beauty', label: '패션/뷰티 카테고리 파트너사 (850개사)', count: 850 },
  { value: 'food', label: '식품(푸드) 카테고리 파트너사 (420개사)', count: 420 },
  { value: 'it_home', label: 'IT/가전 카테고리 파트너사 (380개사)', count: 380 },
  { value: 'vip', label: 'VIP 우수 파트너사 (200개사)', count: 200 }
];

const AdminMarketingMessage = () => {
  const [history, setHistory] = useState(INITIAL_HISTORY);
  
  // Form States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetGroup, setTargetGroup] = useState('all');
  const [sendType, setSendType] = useState('immediate');
  const [reserveTime, setReserveTime] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('메시지 제목과 본문을 모두 작성해 주세요.');
      return;
    }

    const selectedGroup = TARGET_GROUPS.find(g => g.value === targetGroup) || TARGET_GROUPS[0];
    const isImmediate = sendType === 'immediate';

    const newMsg = {
      id: 'msg-' + Date.now(),
      title: title.trim(),
      targetGroup: selectedGroup.label.split(' (')[0],
      sentCount: selectedGroup.count,
      openRate: isImmediate ? parseFloat((Math.random() * 25 + 70).toFixed(1)) : 0.0, // 즉시 발송이면 70~95% 가상 수치, 예약이면 0%
      clickRate: isImmediate ? parseFloat((Math.random() * 30 + 30).toFixed(1)) : 0.0,
      status: isImmediate ? '발송 완료' : '예약 대기',
      createdAt: isImmediate 
        ? new Date().toISOString().replace('T', ' ').substring(0, 16)
        : reserveTime ? reserveTime.replace('T', ' ') : '예약일 지정 안됨'
    };

    setHistory(prev => [newMsg, ...prev]);
    
    if (isImmediate) {
      alert(`✅ [발송 완료] 마케팅 메시지가 발송되었습니다!\n- 발송 대상: ${selectedGroup.label.split(' (')[0]}\n- 발송 수량: ${selectedGroup.count}건`);
    } else {
      alert(`🕒 [예약 완료] 마케팅 메시지 발송이 예약되었습니다!\n- 예약 일시: ${newMsg.createdAt}`);
    }

    // Reset Form
    setTitle('');
    setContent('');
    setReserveTime('');
  };

  const handleDelete = (id) => {
    if (window.confirm('해당 메시지 발송 기록을 삭제하시겠습니까?')) {
      setHistory(prev => prev.filter(h => h.id !== id));
    }
  };

  // 통계 계산
  const sentMessages = history.filter(h => h.status === '발송 완료');
  const avgOpenRate = sentMessages.length > 0
    ? (sentMessages.reduce((acc, curr) => acc + curr.openRate, 0) / sentMessages.length).toFixed(1)
    : '0.0';
  const avgClickRate = sentMessages.length > 0
    ? (sentMessages.reduce((acc, curr) => acc + curr.clickRate, 0) / sentMessages.length).toFixed(1)
    : '0.0';

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* 1. 요약 카드 섹션 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        <div className="stat-card glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '16px', color: '#10b981' }}>
            <Send size={28} />
          </div>
          <div>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', marginBottom: '4px' }}>누적 발송 건수</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{sentMessages.length}건</h3>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: '16px', color: '#6366f1' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', marginBottom: '4px' }}>평균 오픈율</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{avgOpenRate}%</h3>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: '16px', color: '#f59e0b' }}>
            <Users size={28} />
          </div>
          <div>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', marginBottom: '4px' }}>평균 클릭률</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{avgClickRate}%</h3>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '16px', color: '#fff' }}>
            <Megaphone size={28} />
          </div>
          <div>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', marginBottom: '4px' }}>남은 무료 전송량</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>48,350건</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px', alignItems: 'start', flexWrap: 'wrap' }}>
        
        {/* 2. 신규 메시지 전송 폼 */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} color="#10b981" />
            신규 마케팅 메시지 작성
          </h3>

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>수신 대상 그룹</label>
              <select
                className="input-field"
                value={targetGroup}
                onChange={e => setTargetGroup(e.target.value)}
                style={{ width: '100%', height: '42px', background: 'rgba(255,255,255,0.06)' }}
              >
                {TARGET_GROUPS.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>발송 방식</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="sendType"
                    checked={sendType === 'immediate'}
                    onChange={() => setSendType('immediate')}
                    style={{ cursor: 'pointer' }}
                  />
                  즉시 발송
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="sendType"
                    checked={sendType === 'reserve'}
                    onChange={() => setSendType('reserve')}
                    style={{ cursor: 'pointer' }}
                  />
                  예약 발송
                </label>
              </div>
            </div>

            {sendType === 'reserve' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>예약 일시</label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={reserveTime}
                  onChange={e => setReserveTime(e.target.value)}
                  style={{ width: '100%', height: '42px', colorScheme: 'dark', background: 'rgba(255,255,255,0.06)' }}
                  required
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>메시지 제목</label>
              <input
                type="text"
                className="input-field"
                placeholder="브랜드 타겟 시선을 사로잡는 제목을 입력하세요."
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ width: '100%', height: '42px', background: 'rgba(255,255,255,0.06)' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>메시지 본문</label>
              <textarea
                className="input-field"
                placeholder="본문 내용을 입력해 주세요. 광고성 텍스트 및 섭외 제안 상세가 포함되면 좋습니다."
                value={content}
                onChange={e => setContent(e.target.value)}
                style={{ width: '100%', minHeight: '140px', background: 'rgba(255,255,255,0.06)', padding: '12px', resize: 'vertical' }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '46px',
                background: 'linear-gradient(90deg, #10b981, #059669)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px'
              }}
            >
              <Send size={16} />
              {sendType === 'immediate' ? '가상 발송 실행' : '가상 예약 예약등록'}
            </button>
          </form>
        </div>

        {/* 3. 메시지 발송 이력 테이블 */}
        <div className="glass-panel" style={{ padding: '28px', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="#10b981" />
            메시지 발송 내역
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'hsl(var(--foreground-muted))', fontSize: '0.88rem' }}>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>발송 정보</th>
                <th style={{ padding: '12px 8px', fontWeight: 600, textAlign: 'center' }}>발송 수량</th>
                <th style={{ padding: '12px 8px', fontWeight: 600, textAlign: 'center' }}>오픈율</th>
                <th style={{ padding: '12px 8px', fontWeight: 600, textAlign: 'center' }}>클릭률</th>
                <th style={{ padding: '12px 8px', fontWeight: 600, textAlign: 'center' }}>상태</th>
                <th style={{ padding: '12px 8px', fontWeight: 600, textAlign: 'center' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--foreground-muted))' }}>
                    발송한 메시지가 없습니다.
                  </td>
                </tr>
              ) : (
                history.map(msg => (
                  <tr key={msg.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.88rem' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={msg.title}>
                        {msg.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'hsl(var(--foreground-muted))' }}>
                        대상: {msg.targetGroup} | {msg.createdAt}
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 600 }}>
                      {msg.sentCount.toLocaleString()}건
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', color: msg.openRate > 0 ? '#10b981' : 'inherit' }}>
                      {msg.openRate > 0 ? `${msg.openRate}%` : '-'}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', color: msg.clickRate > 0 ? '#6366f1' : 'inherit' }}>
                      {msg.clickRate > 0 ? `${msg.clickRate}%` : '-'}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: msg.status === '발송 완료' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: msg.status === '발송 완료' ? '#10b981' : '#f59e0b'
                      }}>
                        {msg.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(msg.id)}
                        style={{ background: 'transparent', border: 'none', color: 'hsl(var(--foreground-muted))', cursor: 'pointer', padding: '4px' }}
                        title="기록 삭제"
                      >
                        <Trash2 size={16} className="hover-danger" style={{ transition: 'color 0.2s' }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <style>{`
            .hover-danger:hover { color: #ef4444 !important; }
          `}</style>
        </div>

      </div>
    </div>
  );
};

export default AdminMarketingMessage;
