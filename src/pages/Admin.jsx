import React, { useState, useEffect } from 'react';
import { api } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, Trash2, Star, Save } from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 권한 체크 로직 (실제 서비스에서는 라우터 레벨에서 방어해야 함)
  if (!user || user.role !== 'admin') {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <Shield size={48} color="#ef4444" style={{ margin: '0 auto 20px auto' }} />
        <h2>접근 권한이 없습니다</h2>
        <p style={{ color: 'hsl(var(--foreground-muted))' }}>관리자 계정으로 로그인해 주세요.</p>
      </div>
    );
  }

  const fetchHosts = async () => {
    setLoading(true);
    try {
      const data = await api.profiles.list();
      // Admin은 모든 유저를 보며, 삭제나 숨김처리 등 관리 위주이므로 최신 가입자 혹은 기본 정렬 상태로 둡니다.
      setHosts(data);
    } catch (error) {
      console.error('Error fetching hosts for admin:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  const handleToggleVisibility = async (host) => {
    try {
      const newStatus = !host.isHidden;
      await api.profiles.update(host.id, { isHidden: newStatus });
      setHosts(prev => prev.map(h => h.id === host.id ? { ...h, isHidden: newStatus } : h));
    } catch (error) {
      alert('상태 업데이트 실패: ' + error.message);
    }
  };

  const handleToggleRecommended = async (host) => {
    try {
      const newStatus = !host.isRecommended;
      await api.profiles.update(host.id, { isRecommended: newStatus });
      setHosts(prev => prev.map(h => h.id === host.id ? { ...h, isRecommended: newStatus } : h));
    } catch (error) {
      alert('추천 상태 업데이트 실패: ' + error.message);
    }
  };

  const handleOrderChange = async (hostId, newOrder) => {
    try {
      await api.profiles.update(hostId, { displayOrder: parseInt(newOrder, 10) || 0 });
      setHosts(prev => prev.map(h => h.id === hostId ? { ...h, displayOrder: parseInt(newOrder, 10) || 0 } : h));
    } catch (error) {
      alert('순서 업데이트 실패: ' + error.message);
    }
  };

  const handleDelete = async (host) => {
    if (window.confirm(`정말로 ${host.name} 쇼호스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      try {
        await api.profiles.delete(host.id);
        setHosts(prev => prev.filter(h => h.id !== host.id));
      } catch (error) {
        alert('삭제 실패: ' + error.message);
      }
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
        <Shield size={28} className="text-gradient-cyan" />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>관리자 패널</h1>
      </div>

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
              hosts.map(host => (
                <tr key={host.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', opacity: host.isHidden ? 0.6 : 1 }}>
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
                      value={host.displayOrder || 0}
                      onChange={(e) => handleOrderChange(host.id, e.target.value)}
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
                        padding: '6px 12px', 
                        fontSize: '0.8rem',
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
                      style={{ 
                        padding: '6px', 
                        background: 'transparent',
                        color: 'hsl(var(--foreground-muted))',
                        border: 'none',
                        cursor: 'pointer'
                      }}
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
      <style>{`
        .hover-danger:hover {
          color: #ef4444 !important;
        }
      `}</style>
    </div>
  );
};

export default Admin;
