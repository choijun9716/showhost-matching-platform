import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../supabaseClient';
import { Megaphone, Calendar, MapPin, Tag, FileText, ArrowLeft, CheckCircle, Users } from 'lucide-react';

const CATEGORIES = ['식품', '뷰티', '가전', '테크', '패션', '건기식', '키즈', '여행', '리빙', '기타'];

const CampaignCreate = ({ onBack, onCreated }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    brandName: '',
    schedule: '',
    endDate: '',
    location: '',
    category: '전체',
    recruitCount: 1,
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.brandName || !form.schedule || !form.location || !form.endDate) {
      setError('필수 항목(브랜드명, 방송 일정, 마감일, 방송 장소)을 모두 입력해 주세요.');
      return;
    }
    if (!form.category) { setError('카테고리를 선택해 주세요.'); return; }

    setSubmitting(true);
    try {
      const campaign = await api.campaigns.create(user.id, user.name, form);
      onCreated(campaign);
    } catch (err) {
      setError(err.message || '캠페인 생성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '680px', padding: '20px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <button onClick={onBack} className="btn btn-secondary" style={{ padding: '8px', borderRadius: '8px' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>캠페인 생성</h1>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground-muted))', marginTop: '2px' }}>
            방송 정보를 입력하고 쇼호스트에게 제안을 보내세요
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* 라이브 브랜드명 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 600 }}>
              <Megaphone size={15} color="#818cf8" />
              라이브 브랜드명 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="예: 뷰티 브랜드 A, 패션 스타트업 B"
              value={form.brandName}
              onChange={e => handleChange('brandName', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* 방송 일정 */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 600 }}>
                <Calendar size={15} color="#818cf8" />
                방송 일정 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="datetime-local"
                value={form.schedule}
                onChange={e => handleChange('schedule', e.target.value)}
                style={{ width: '100%', colorScheme: 'dark' }}
              />
            </div>

            {/* 모집 마감일 */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 600 }}>
                <Calendar size={15} color="#ef4444" />
                모집 마감일 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={e => handleChange('endDate', e.target.value)}
                style={{ width: '100%', colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* 방송 장소 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 600 }}>
              <MapPin size={15} color="#818cf8" />
              방송 장소 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="예: 서울 강남구 스튜디오, 자택 스튜디오, 온라인"
              value={form.location}
              onChange={e => handleChange('location', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', fontWeight: 600 }}>
              <Tag size={15} color="#818cf8" />
              카테고리 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleChange('category', cat)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: form.category === cat ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    background: form.category === cat ? '#818cf8' : 'rgba(255,255,255,0.05)',
                    color: form.category === cat ? 'white' : 'hsl(var(--foreground-muted))',
                    fontWeight: form.category === cat ? 700 : 400,
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 모집 인원 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', fontWeight: 600 }}>
              <Users size={15} color="#818cf8" />
              모집 인원 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[1, 2].map(count => (
                <label key={count} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: form.recruitCount === count ? '2px solid #818cf8' : '1px solid rgba(255,255,255,0.12)',
                  background: form.recruitCount === count ? 'rgba(129,140,248,0.1)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: form.recruitCount === count ? 700 : 400
                }}>
                  <input
                    type="radio"
                    name="recruitCount"
                    value={count}
                    checked={form.recruitCount === count}
                    onChange={() => handleChange('recruitCount', count)}
                    style={{ margin: 0, accentColor: '#818cf8' }}
                  />
                  {count}명
                </label>
              ))}
            </div>
          </div>

          {/* 상세 안내 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 600 }}>
              <FileText size={15} color="#818cf8" />
              캠페인 상세 안내 <span style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))', fontWeight: 400 }}>(선택)</span>
            </label>
            <textarea
              rows={5}
              placeholder="예: 신제품 런칭 라이브 방송입니다. 진행 시간 약 60분, 의상 협의 가능합니다. 경험 있는 패션 전문 쇼호스트를 찾습니다."
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* 에러 */}
          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.88rem'
            }}>
              {error}
            </div>
          )}

          {/* 버튼 */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onBack} className="btn btn-secondary" style={{ flex: 1 }}>
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {submitting ? '생성 중...' : (
                <>
                  <CheckCircle size={16} />
                  캠페인 생성 (무료)
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CampaignCreate;
