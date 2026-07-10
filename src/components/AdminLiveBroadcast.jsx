import React, { useState } from 'react';
import { Video, Users, Radio, Tv, Activity, Wifi, AlertTriangle, StopCircle, RefreshCw } from 'lucide-react';

const INITIAL_STREAMS = [
  {
    id: 'stream-1',
    hostName: '김서현',
    title: '🔥 대기업 완판 앵콜! 패션 썸머 룩 특별 할인 라이브',
    platform: '네이버 쇼핑라이브',
    category: '패션',
    viewers: 1245,
    duration: '28분째 송출 중',
    resolution: '1080p @ 60fps',
    bitrate: '6.2 Mbps',
    latency: '1.1s',
    status: 'ON AIR',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150&auto=format&fit=crop'
  },
  {
    id: 'stream-2',
    hostName: '박지수',
    title: '🖥️ IT 가전의 끝판왕, LG 오브제 가상 쇼룸 최초 공개',
    platform: '유튜브 라이브',
    category: 'IT/가전',
    viewers: 3540,
    duration: '5분째 송출 중',
    resolution: '1080p @ 60fps',
    bitrate: '5.8 Mbps',
    latency: '1.3s',
    status: 'ON AIR',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop'
  }
];

const AdminLiveBroadcast = () => {
  const [streams, setStreams] = useState(INITIAL_STREAMS);
  const [logs, setLogs] = useState([
    { id: 1, time: '12:45:10', text: '김서현 쇼호스트 - 네이버 쇼핑라이브 송출이 시작되었습니다.' },
    { id: 2, time: '12:51:30', text: '박지수 쇼호스트 - 유튜브 라이브 송출이 시작되었습니다.' },
  ]);

  const addLog = (text) => {
    const time = new Date().toTimeString().split(' ')[0];
    setLogs(prev => [{ id: Date.now(), time, text }, ...prev]);
  };

  const handleWarnStream = (hostName) => {
    alert(`📢 [경고 전송] ${hostName} 쇼호스트의 스트림에 품질 개선 권고 경고를 전송했습니다.`);
    addLog(`시스템 - ${hostName} 쇼호스트에게 비트레이트 조정 권고 경고를 전송했습니다.`);
  };

  const handleStopStream = (id, hostName) => {
    if (window.confirm(`⚠️ 정말로 ${hostName} 쇼호스트의 라이브 송출을 강제 종료하시겠습니까?`)) {
      setStreams(prev => prev.map(s => s.id === id ? { ...s, status: 'OFFLINE', viewers: 0 } : s));
      addLog(`경고 - 관리자가 ${hostName} 쇼호스트의 송출을 강제 차단하였습니다.`);
    }
  };

  const handleRestartStream = (id, hostName) => {
    setStreams(prev => prev.map(s => s.id === id ? { ...s, status: 'ON AIR', viewers: Math.floor(Math.random() * 2000) + 500 } : s));
    addLog(`시스템 - ${hostName} 쇼호스트의 가상 스트림이 재연결되었습니다.`);
  };

  const activeStreams = streams.filter(s => s.status === 'ON AIR');
  const totalViewers = activeStreams.reduce((acc, curr) => acc + curr.viewers, 0);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* 1. 요약 카드 섹션 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        <div className="stat-card glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '16px', color: '#ef4444' }}>
            <Radio size={28} className="animate-pulse" />
          </div>
          <div>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', marginBottom: '4px' }}>활성화된 라이브</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{activeStreams.length}개 송출 중</h3>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '16px', color: '#10b981' }}>
            <Users size={28} />
          </div>
          <div>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', marginBottom: '4px' }}>실시간 시청자 수</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{totalViewers.toLocaleString()}명</h3>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: '16px', color: '#6366f1' }}>
            <Activity size={28} />
          </div>
          <div>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', marginBottom: '4px' }}>평균 대기시간(Latency)</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>1.2s <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>우수</span></h3>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: '16px', color: '#f59e0b' }}>
            <Wifi size={28} />
          </div>
          <div>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', marginBottom: '4px' }}>네트워크 인입 상태</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>100% 정상</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '30px', alignItems: 'start', flexWrap: 'wrap' }}>
        
        {/* 2. 라이브 스트림 리스트 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tv size={20} color="#ef4444" />
              실시간 송출 채널 모니터링
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px' }}>
              자동 갱신 중 (5초 간격)
            </span>
          </div>

          {streams.map(stream => {
            const isOnAir = stream.status === 'ON AIR';
            return (
              <div 
                key={stream.id} 
                className="glass-panel" 
                style={{ 
                  padding: '24px', 
                  borderLeft: isOnAir ? '4px solid #ef4444' : '4px solid hsl(var(--foreground-muted))',
                  background: isOnAir ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.005)',
                  opacity: isOnAir ? 1 : 0.6
                }}
              >
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  {/* 스트리머 프로필/화면 썸네일 대용 */}
                  <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={stream.image} alt={stream.hostName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {isOnAir && (
                      <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', display: 'inline-block' }} className="animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </div>

                  {/* 세부 정보 */}
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ background: 'rgba(255,255,255,0.08)', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {stream.platform}
                      </span>
                      <span style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.85rem' }}>{stream.duration}</span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', color: isOnAir ? '#fff' : 'hsl(var(--foreground-muted))' }}>
                      {stream.title}
                    </h3>

                    {/* 세부 스트림 스펙 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px 20px', fontSize: '0.82rem', color: 'hsl(var(--foreground-muted))' }}>
                      <div>호스트: <strong style={{ color: '#fff' }}>{stream.hostName}</strong> ({stream.category})</div>
                      <div>시청자: <strong style={{ color: isOnAir ? '#ef4444' : 'inherit' }}>{stream.viewers.toLocaleString()}명</strong></div>
                      <div>해상도: <strong>{stream.resolution}</strong></div>
                      <div>비트레이트: <strong>{stream.bitrate}</strong></div>
                      <div>네트워크 지연: <strong style={{ color: '#10b981' }}>{stream.latency}</strong></div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', minWidth: '120px' }}>
                    {isOnAir ? (
                      <>
                        <button 
                          onClick={() => handleWarnStream(stream.hostName)}
                          className="btn btn-secondary" 
                          style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderColor: 'rgba(245,158,11,0.3)', color: '#f59e0b' }}
                        >
                          <AlertTriangle size={14} />
                          경고 전송
                        </button>
                        <button 
                          onClick={() => handleStopStream(stream.id, stream.hostName)}
                          className="btn btn-primary" 
                          style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#ef4444' }}
                        >
                          <StopCircle size={14} />
                          송출 종료
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleRestartStream(stream.id, stream.hostName)}
                        className="btn btn-secondary" 
                        style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <RefreshCw size={14} />
                        송출 테스트 시작
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. 실시간 송출 시스템 로그 */}
        <div className="glass-panel" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#6366f1" />
            실시간 송출 이벤트 로그
          </h3>

          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: '16px', 
            borderRadius: '12px', 
            minHeight: '260px', 
            maxHeight: '340px',
            overflowY: 'auto',
            fontFamily: 'Courier New, monospace',
            fontSize: '0.82rem',
            lineHeight: '1.6',
            color: '#a1a1aa'
          }}>
            {logs.map(log => (
              <div key={log.id} style={{ marginBottom: '10px', display: 'flex', gap: '8px' }}>
                <span style={{ color: '#6366f1', fontWeight: 700 }}>[{log.time}]</span>
                <span style={{ 
                  color: log.text.includes('경고') ? '#ef4444' : log.text.includes('시스템') ? '#eab308' : '#e5e5e5'
                }}>
                  {log.text}
                </span>
              </div>
            ))}
          </div>
          
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--foreground-muted))', textAlign: 'center' }}>
            * 테스트용 로그 콘솔입니다. 모든 이벤트는 브라우저 메모리에 일시 저장됩니다.
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLiveBroadcast;
