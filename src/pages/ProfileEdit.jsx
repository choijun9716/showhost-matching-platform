import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../supabaseClient';
import { Save, User, Award, CircleDollarSign, Calendar, FileText, Video, Sparkles, Image, CheckCircle, AlertCircle } from 'lucide-react';

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
        broadcastLink,
        portfolio
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
    <div className="container animate-fade-in" style={{ paddingBottom: '80px', maxWidth: '800px' }}>
      
      <div style={{ marginBottom: '30px' }}>
        <div className="badge" style={{ marginBottom: '12px' }}>
          <Sparkles size={12} style={{ marginRight: '4px' }} />
          Showhost Management
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>내 쇼호스트 프로필 관리</h1>
        <p style={{ color: 'hsl(var(--foreground-muted))' }}>
          브랜드(클라이언트)사에게 노출되는 프로필 정보를 작성하고 정기적으로 업데이트해보세요.
        </p>
      </div>

      {successMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          color: '#10b981',
          padding: '16px',
          borderRadius: '12px',
          fontSize: '0.95rem',
          fontWeight: 600,
          marginBottom: '30px'
        }}>
          <CheckCircle size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          padding: '16px',
          borderRadius: '12px',
          fontSize: '0.95rem',
          fontWeight: 600,
          marginBottom: '30px'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Profile Image & Basic Info Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '30px',
        }} className="profile-edit-grid">
          
          {/* Avatar Upload Column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <label style={{ alignSelf: 'flex-start' }}>프로필 사진</label>
            <div style={{ position: 'relative', width: '150px', height: '150px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
              {avatar ? (
                <img src={avatar} alt="Profile preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', color: 'hsl(var(--foreground-muted))' }}>
                  <Image size={32} />
                </div>
              )}
            </div>
            
            <div style={{ width: '100%', textAlign: 'center' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="avatar-upload"
              />
              <label 
                htmlFor="avatar-upload" 
                className="btn btn-secondary"
                style={{ 
                  display: 'inline-flex',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  margin: 0
                }}
              >
                사진 선택
              </label>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', marginTop: '6px' }}>
                최대 2MB 이미지 지원
              </span>
            </div>
          </div>

          {/* Basic Fields Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1 }}>
            <div>
              <label htmlFor="edit-name">활동명 / 이름</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="edit-name"
                  type="text"
                  placeholder="활동명을 입력해 주세요"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label htmlFor="edit-category">전문 분야</label>
                <select
                  id="edit-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-career">활동 경력</label>
                <select
                  id="edit-career"
                  value={career}
                  onChange={(e) => setCareer(e.target.value)}
                >
                  {CAREER_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 성별, 키, 몸무게 입력 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label htmlFor="edit-gender">성별</label>
                <select
                  id="edit-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="여성">여성</option>
                  <option value="남성">남성</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit-height">키</label>
                <input
                  id="edit-height"
                  type="text"
                  placeholder="예: 168cm"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="edit-weight">몸무게</label>
                <input
                  id="edit-weight"
                  type="text"
                  placeholder="예: 50kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Bio & Details */}
        <div>
          <label htmlFor="edit-bio">한 줄 소개</label>
          <div style={{ position: 'relative' }}>
            <Sparkles size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              id="edit-bio"
              type="text"
              placeholder="예: 트렌디한 화법과 탄탄한 경력의 푸드 완판 쇼호스트"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ paddingLeft: '44px' }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="edit-detail">상세 자기소개 및 경력 사항</label>
          <textarea
            id="edit-detail"
            rows={8}
            placeholder="자신의 매력 포인트, 방송 이력, 전문 분야 및 특이점 등을 상세하게 기술해 주세요."
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            style={{ resize: 'none' }}
          />
        </div>

        {/* Financial & Time Specs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }} className="specs-grid-mobile">
          <div>
            <label htmlFor="edit-pay">희망 페이 (단가)</label>
            <div style={{ position: 'relative' }}>
              <CircleDollarSign size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="edit-pay"
                type="text"
                placeholder="예: 시간당 20만 - 35만원 (협의)"
                value={pay}
                onChange={(e) => setPay(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-time">진행 가능 시간대</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="edit-time"
                type="text"
                placeholder="예: 평일 야간, 주말 상시 가능"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>
        </div>

        {/* 방송 링크 & 포트폴리오 링크 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="specs-grid-mobile">
          <div>
            <label htmlFor="edit-broadcast">대표방송 링크</label>
            <div style={{ position: 'relative' }}>
              <Video size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="edit-broadcast"
                type="url"
                placeholder="https://shoppinglive.naver.com/..."
                value={broadcastLink}
                onChange={(e) => setBroadcastLink(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-portfolio">포트폴리오 링크</label>
            <div style={{ position: 'relative' }}>
              <FileText size={16} color="hsl(var(--foreground-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="edit-portfolio"
                type="url"
                placeholder="https://youtube.com/... 또는 포트폴리오 URL"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
          style={{
            padding: '16px',
            fontSize: '1.05rem',
            marginTop: '10px'
          }}
        >
          {saving ? '프로필 저장 중...' : (
            <>
              <Save size={18} />
              <span>프로필 변경사항 저장</span>
            </>
          )}
        </button>

      </form>

      {/* Media Queries Simulation */}
      <style>{`
        .profile-edit-grid {
          display: grid;
          grid-template-columns: 1fr;
        }
        .specs-grid-mobile {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 640px) {
          .profile-edit-grid {
            grid-template-columns: 180px 1fr;
          }
          .specs-grid-mobile {
            grid-template-columns: 1.2fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileEdit;
