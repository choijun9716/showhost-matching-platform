import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../supabaseClient';
import { Save, User, Award, CircleDollarSign, Video, Sparkles, CheckCircle, AlertCircle, Calendar, Tag, Ruler, Scale, X, Plus, FileText } from 'lucide-react';

const CATEGORIES = ['패션', '뷰티', '푸드', 'IT/가전', '기타'];

const ProfileEdit = () => {
  const { user, updateCurrentUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  
  // Form States
  const [name, setName] = useState('');
  const [category, setCategory] = useState('기타');
  const [gender, setGender] = useState('여성');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bio, setBio] = useState('');
  const [pay, setPay] = useState('');
  const [birth, setBirth] = useState('');
  
  // New States for Keywords & References
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [references, setReferences] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user && user.role === 'showhost') {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await api.profiles.get(user.id);
      if (data) {
        setProfile(data);
        setName(data.name || '');
        setCategory(data.category || '기타');
        setGender(data.gender || '여성');
        setHeight(data.height || '');
        setWeight(data.weight || '');
        setBio(data.bio || '');
        setPay(data.pay || '');
        setBirth(data.birth || '');
        setKeywords(data.keywords || []);
        setReferences(data.references || []);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('프로필 정보를 로드하지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && keywords.length < 3 && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleRemoveKeyword = (kw) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const handleAddReference = () => {
    setReferences([...references, { title: '', url: '' }]);
  };

  const handleUpdateReference = (index, field, value) => {
    const updated = [...references];
    updated[index][field] = value;
    setReferences(updated);
  };

  const handleRemoveReference = (index) => {
    setReferences(references.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('이름은 필수 입력 항목입니다.');
      return;
    }
    if (!bio.trim()) {
      setError('한 줄 소개를 입력해 주세요.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const updatedData = {
        name,
        category,
        gender,
        height,
        weight,
        bio,
        pay,
        birth,
        keywords,
        references
      };
      const updatedProfile = await api.profiles.update(user.id, updatedData);
      setProfile(updatedProfile);
      
      updateCurrentUserProfile(updatedProfile);

      setSuccessMsg('프로필이 성공적으로 저장되었습니다!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'showhost') {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
          <AlertCircle size={48} color="red" style={{ marginBottom: '16px' }} />
          <h3>접근 권한이 없습니다</h3>
          <p style={{ color: 'hsl(var(--foreground-muted))', marginTop: '8px' }}>
            쇼호스트 계정으로 로그인한 경우에만 프로필 관리가 가능합니다.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ 
          border: '3px solid rgba(255, 255, 255, 0.1)',
          borderTop: '3px solid hsl(var(--primary))',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px auto'
        }} />
        <p style={{ color: 'hsl(var(--foreground-muted))' }}>프로필 정보를 로드하고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '100px', maxWidth: '800px' }}>
      
      {/* Header Area */}
      <div style={{ marginBottom: '30px' }}>
        <div className="badge" style={{ marginBottom: '12px' }}>
          <Sparkles size={12} style={{ marginRight: '4px' }} />
          Showhost Management
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>내 쇼호스트 프로필 관리</h1>
        <p style={{ color: 'hsl(var(--foreground-muted))', marginTop: '6px', fontSize: '0.95rem' }}>
          브랜드사에게 매력적으로 보일 수 있도록 프로필 사진과 정보를 꼼꼼하게 작성해 주세요.
        </p>
      </div>

      {/* 알림 메시지 */}
      {successMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
          color: '#10b981', padding: '16px', borderRadius: '12px',
          fontSize: '0.95rem', fontWeight: 600, marginBottom: '24px'
        }}>
          <CheckCircle size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444', padding: '16px', borderRadius: '12px',
          fontSize: '0.95rem', fontWeight: 600, marginBottom: '24px'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Section 1: 프로필 사진 및 기본 정보 */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="#ffffff" />
            기본 정보
          </h2>
          <div className="edit-section-grid">
            {/* Left: Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                position: 'relative', width: '140px', height: '140px', 
                borderRadius: '50%', overflow: 'hidden', 
                border: '3px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
              }}>
                {profile?.profileImage ? (
                  <img src={profile.profileImage} alt="Profile preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', color: 'hsl(var(--foreground-muted))' }}>
                    <User size={32} />
                  </div>
                )}
              </div>
              <div style={{ width: '100%', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))', marginTop: '8px' }}>
                  프로필 사진은<br/>변경할 수 없습니다.
                </div>
              </div>
            </div>

            {/* Right: Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>활동명 (이름) <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" className="input-field" placeholder="예: 쇼호스트 김현우" value={name} onChange={(e) => setName(e.target.value)} style={{ paddingLeft: '44px' }} />
                </div>
              </div>
              
              <div className="input-grid-2">
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={15} color="#ffffff" /> 전문 분야
                  </label>
                  <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>생년월일</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" className="input-field" placeholder="예: 1995-05-12" value={birth} onChange={(e) => setBirth(e.target.value)} style={{ paddingLeft: '44px' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: 신체 스펙 */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#ffffff" />
            신체 스펙 정보
          </h2>
          <div className="input-grid-2">
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>키 (cm)</label>
              <div style={{ position: 'relative' }}>
                <Ruler size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" className="input-field" placeholder="예: 168" value={height} onChange={(e) => setHeight(e.target.value)} style={{ paddingLeft: '44px' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>몸무게 (kg)</label>
              <div style={{ position: 'relative' }}>
                <Scale size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" className="input-field" placeholder="예: 50" value={weight} onChange={(e) => setWeight(e.target.value)} style={{ paddingLeft: '44px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: 상세 조건 및 소개 */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="#ffffff" />
            상세 소개 및 조건
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>한 줄 소개 <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <FileText size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" className="input-field" placeholder="예: 신뢰감을 주는 탄탄한 화법의 만능 쇼호스트!" value={bio} onChange={(e) => setBio(e.target.value)} style={{ paddingLeft: '44px' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>키워드 (최대 3개)</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                {keywords.map(kw => (
                  <span key={kw} style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    #{kw}
                    <button type="button" onClick={() => handleRemoveKeyword(kw)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={14} /></button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" className="input-field" placeholder="키워드 입력 후 Enter 또는 추가 버튼 클릭" value={keywordInput} onChange={e => setKeywordInput(e.target.value)} onKeyDown={handleKeywordKeyDown} disabled={keywords.length >= 3} />
                <button type="button" className="btn btn-secondary" onClick={handleAddKeyword} disabled={keywords.length >= 3} style={{ padding: '0 20px', whiteSpace: 'nowrap' }}>추가</button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>희망 페이 (조건)</label>
              <div style={{ position: 'relative' }}>
                <CircleDollarSign size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" className="input-field" placeholder="예: 시간당 20만~30만원 (협의 가능)" value={pay} onChange={(e) => setPay(e.target.value)} style={{ paddingLeft: '44px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: 방송 레퍼런스 리스트 */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Video size={18} color="#ffffff" />
            방송 레퍼런스 리스트
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {references.map((ref, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" className="input-field" placeholder="방송 제목 (예: 라이브커머스 다이슨 판매)" value={ref.title} onChange={e => handleUpdateReference(idx, 'title', e.target.value)} />
                  <input type="text" className="input-field" placeholder="방송 영상 URL 또는 관련 내용 입력" value={ref.url} onChange={e => handleUpdateReference(idx, 'url', e.target.value)} />
                </div>
                <button type="button" onClick={() => handleRemoveReference(idx)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={20} />
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddReference} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', borderStyle: 'dashed' }}>
              <Plus size={18} />
              <span>레퍼런스 항목 추가하기</span>
            </button>
          </div>
        </div>

        {/* Fixed Bottom Save Bar */}
        <div className="glass-panel" style={{ 
          position: 'sticky', 
          bottom: '20px', 
          padding: '16px 24px', 
          display: 'flex', 
          justifyContent: 'flex-end',
          alignItems: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          zIndex: 50,
          background: 'rgba(15,23,42,0.85)'
        }}>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '12px 32px', fontSize: '1.05rem', minWidth: '200px' }}>
            {saving ? '저장 중...' : (
              <>
                <Save size={18} />
                <span>프로필 저장하기</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Media Queries for responsive styling */}
      <style>{`
        .input-field {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.2);
          color: #fff;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: #ffffff;
          background: rgba(255, 255, 255,0.05);
          outline: none;
        }
        
        .edit-section-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 30px;
        }
        .input-grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        .input-grid-3 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        /* Tablet & Desktop */
        @media (min-width: 640px) {
          .edit-section-grid {
            grid-template-columns: 160px 1fr;
            gap: 40px;
          }
          .input-grid-2 {
            grid-template-columns: 1fr 1fr;
          }
          .input-grid-3 {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileEdit;
