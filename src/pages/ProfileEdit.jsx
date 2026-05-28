import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../supabaseClient';
import { Save, User, Award, CircleDollarSign, FileText, Video, Sparkles, Image, CheckCircle, AlertCircle, Calendar, Tag, Ruler, Scale, Briefcase } from 'lucide-react';

const CATEGORIES = ['패션', '뷰티', '푸드', 'IT/가전', '기타'];
const CAREER_OPTIONS = ['신입', '1년', '2년', '3년', '4년', '5년', '7년 이상', '10년 이상'];

const ProfileEdit = () => {
  const { user, updateCurrentUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  
  // Form States
  const [name, setName] = useState('');
  const [category, setCategory] = useState('기타');
  const [career, setCareer] = useState('신입');
  const [gender, setGender] = useState('여성');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [detail, setDetail] = useState('');
  const [pay, setPay] = useState('');
  const [time, setTime] = useState('');
  const [broadcastLink, setBroadcastLink] = useState('');
  const [portfolio, setPortfolio] = useState('');

  const [birth, setBirth] = useState('');

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
        setCareer(data.career || '신입');
        setGender(data.gender || '여성');
        setHeight(data.height || '');
        setWeight(data.weight || '');
        setAvatar(data.profileImage || '');
        setBio(data.bio || '');
        setDetail(data.detail || '');
        setPay(data.pay || '');
        setTime(data.time || '');
        setBroadcastLink(data.broadcastLink || '');
        setPortfolio(data.portfolio || '');
        setBirth(data.birth || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('프로필 정보를 로드하지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // HTML5 Canvas 기반 이미지 압축 및 리사이징 유틸리티
  const compressImage = (file, maxWidth = 250, maxHeight = 250, quality = 0.5) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // 종횡비 유지하면서 최대 가로/세로 한도에 맞춰 스케일 축소
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // JPEG 압축 품질 지정하여 Base64 인코딩
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Handle Image File to Compressed Base64
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // 이미지 용량이 커도 압축 후 저장되므로 한도 완화(10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('이미지 크기는 10MB 이하여야 합니다.');
        return;
      }
      
      setLoading(true);
      setError('');
      try {
        const compressedBase64 = await compressImage(file, 250, 250, 0.5);
        setAvatar(compressedBase64);
      } catch (err) {
        console.error('Image compression error:', err);
        setError('이미지 압축 처리 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
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
        career,
        gender,
        height,
        weight,
        profileImage: avatar,
        bio,
        detail,
        pay,
        time,
        portfolio,
        birth
      };
      const updatedProfile = await api.profiles.update(user.id, updatedData);
      setProfile(updatedProfile);
      
      // AuthContext 전역 세션의 네임 정보도 즉각 동기화
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
            <User size={18} color="#818cf8" />
            기본 정보
          </h2>
          
          <div className="edit-section-grid">
            {/* Left: Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                position: 'relative', width: '140px', height: '140px', 
                borderRadius: '50%', overflow: 'hidden', 
                border: '3px solid rgba(129, 140, 248, 0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
              }}>
                {avatar ? (
                  <img src={avatar} alt="Profile preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', color: 'hsl(var(--foreground-muted))' }}>
                    <Image size={32} />
                  </div>
                )}
              </div>
              <div style={{ width: '100%', textAlign: 'center' }}>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="avatar-upload" />
                <label htmlFor="avatar-upload" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer', margin: 0, display: 'inline-block' }}>
                  프로필 사진 변경
                </label>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', marginTop: '8px' }}>최대 10MB 이미지 지원</div>
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
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>전문 분야</label>
                  <div style={{ position: 'relative' }}>
                    <Tag size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)} style={{ paddingLeft: '44px' }}>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>활동 경력</label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <select className="input-field" value={career} onChange={(e) => setCareer(e.target.value)} style={{ paddingLeft: '44px' }}>
                      {CAREER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
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

        {/* Section 2: 신체 스펙 */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#818cf8" />
            신체 스펙 정보
          </h2>
          <div className="input-grid-3">
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>성별</label>
              <select className="input-field" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="여성">여성</option>
                <option value="남성">남성</option>
                <option value="기타">기타</option>
              </select>
            </div>
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
            <Award size={18} color="#818cf8" />
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
              <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>희망 페이 (조건)</label>
              <div style={{ position: 'relative' }}>
                <CircleDollarSign size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" className="input-field" placeholder="예: 시간당 20만~30만원 (협의 가능)" value={pay} onChange={(e) => setPay(e.target.value)} style={{ paddingLeft: '44px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: 포트폴리오 */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Video size={18} color="#818cf8" />
            포트폴리오
          </h2>
          <div className="input-grid-2">
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>대표 방송 영상 링크</label>
              <div style={{ position: 'relative' }}>
                <Video size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="url" className="input-field" placeholder="https://youtube.com/..." value={broadcastLink} onChange={(e) => setBroadcastLink(e.target.value)} style={{ paddingLeft: '44px' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>포트폴리오 문서/웹사이트</label>
              <div style={{ position: 'relative' }}>
                <FileText size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="url" className="input-field" placeholder="https://notion.so/..." value={portfolio} onChange={(e) => setPortfolio(e.target.value)} style={{ paddingLeft: '44px' }} />
              </div>
            </div>
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
          border-color: #818cf8;
          background: rgba(129,140,248,0.05);
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
