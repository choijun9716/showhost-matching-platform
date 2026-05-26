import React, { useState, useEffect } from 'react';
import { api } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import ShowhostCard from '../components/ShowhostCard';
import MatchingModal from '../components/MatchingModal';
import { Search, Filter, Sparkles, Star, Calendar, CircleDollarSign, Video, CheckCircle, AlertCircle, ArrowLeft, Lock, ShieldAlert } from 'lucide-react';

const CATEGORIES = ['전체', '식품', '뷰티', '가전', '테크', '패션', '건기식', '키즈', '여행', '리빙'];

const Home = ({ onNavigateToLogin }) => {
  const { user, updateUserPaidStatus } = useAuth();
  const [hosts, setHosts] = useState([]);
  const [filteredHosts, setFilteredHosts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]); // 중복 선택을 위한 배열
  const [minPayFilter, setMinPayFilter] = useState(0); // 금액별 필터 (단위: 만원)
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('pay_high');
  const [selectedHost, setSelectedHost] = useState(null);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [matchingSuccess, setMatchingSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHosts();
  }, []);

  // Toss Payments Callback URL Handler
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');

    if (paymentStatus === 'success') {
      const updatePayment = async () => {
        if (user && user.id) {
          setLoading(true);
          try {
            await api.auth.updatePaidStatus(user.id, "true");
            updateUserPaidStatus("true");
            alert('🎉 멤버십 결제가 성공적으로 완료되었습니다! 이제 모든 포트폴리오를 자유롭게 열람하실 수 있습니다.');
          } catch (error) {
            console.error('결제 상태 갱신 실패:', error);
            alert('결제 처리는 완료되었으나 회원 정보 갱신 중 오류가 발생했습니다. 고객센터에 문의해 주세요.');
          } finally {
            setLoading(false);
          }
        } else {
          alert('로그인 세션이 만료되었습니다. 다시 로그인하시면 결제 권한이 활성화됩니다.');
        }
        // Clear URL parameters
        window.history.replaceState(null, '', window.location.pathname);
      };
      updatePayment();
    } else if (paymentStatus === 'fail') {
      alert('❌ 결제에 실패하였습니다. 다시 시도해 주시기 바랍니다.');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [user]);

  // Handle Toss Payments Popup Call
  const handleTossPayment = () => {
    if (!user) {
      alert('로그인이 필요한 서비스입니다.');
      onNavigateToLogin();
      return;
    }
    if (typeof window.TossPayments !== 'function') {
      alert('토스페이먼츠 라이브러리가 아직 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    
    const tossPayments = window.TossPayments("test_ck_D53n977G19Mdf5oGM08j3k6B1xvl");
    tossPayments.requestPayment('카드', {
      amount: 15000,
      orderId: 'order-' + Date.now(),
      orderName: 'SHOWLAB 프리미엄 멤버십 (포트폴리오 무제한 열람)',
      customerName: user.name || '브랜드 담당자',
      successUrl: window.location.origin + window.location.pathname + '?payment=success',
      failUrl: window.location.origin + window.location.pathname + '?payment=fail',
    }).catch((error) => {
      if (error.code === 'USER_CANCEL') {
        console.log('사용자가 결제를 취소했습니다.');
      } else {
        alert('결제 요청 중 오류가 발생했습니다: ' + error.message);
      }
    });
  };

  useEffect(() => {
    let result = hosts.filter(h => !h.isHidden);

    // Category Filter (Multi-select)
    if (selectedCategories.length > 0) {
      result = result.filter(h => {
        if (!h.category) return false;
        const hostCats = h.category.split(',').map(c => c.trim());
        return selectedCategories.some(selected => hostCats.includes(selected));
      });
    }

    // Min Pay Filter
    if (minPayFilter > 0) {
      result = result.filter(h => {
        if (!h.pay) return false;
        const match = h.pay.match(/([0-9]+)만/);
        const minPay = match ? parseInt(match[1], 10) : 0;
        return minPay >= minPayFilter;
      });
    }

    // Search Query Filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(h => 
        h.name.toLowerCase().includes(query) || 
        h.bio.toLowerCase().includes(query) || 
        h.category.toLowerCase().includes(query)
      );
    }

    // Sort Logic
    const sorted = [...result];
    sorted.sort((a, b) => {
      // 1. displayOrder 내림차순 정렬
      const orderA = a.displayOrder || 0;
      const orderB = b.displayOrder || 0;
      if (orderA !== orderB) {
        return orderB - orderA;
      }

      // 2. 금액 정렬
      const getMinPay = (payStr) => {
        if (!payStr) return 0;
        const match = payStr.match(/([0-9]+)만/);
        return match ? parseInt(match[1], 10) : 0;
      };

      if (sortBy === 'pay_high') {
        return getMinPay(b.pay) - getMinPay(a.pay);
      }
      if (sortBy === 'pay_low') {
        return getMinPay(a.pay) - getMinPay(b.pay);
      }
      return 0;
    });

    setFilteredHosts(sorted);
  }, [selectedCategories, minPayFilter, searchQuery, sortBy, hosts]);

  const fetchHosts = async () => {
    setLoading(true);
    try {
      const data = await api.profiles.list();
      // 기존 목업 데이터의 카테고리를 새 카테고리 명칭으로 매핑 (콤마 포함 다중 카테고리 지원)
      const mappedData = data.map(h => {
        if (!h.category) return h;
        const newCat = h.category.split(',').map(c => {
          let cat = c.trim();
          if (cat === '푸드') return '식품';
          if (cat === 'IT/가전') return '가전';
          return cat;
        }).join(', ');
        return { ...h, category: newCat };
      });
      setHosts(mappedData);
      setFilteredHosts(mappedData);
    } catch (error) {
      console.error('Error fetching hosts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSuccess = () => {
    setShowMatchingModal(false);
    setMatchingSuccess(true);
    setTimeout(() => {
      setMatchingSuccess(false);
      setSelectedHost(null);
    }, 3000);
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '80px' }}>
      
      {/* Success Notification for Matching */}
      {matchingSuccess && (
        <div style={{
          position: 'fixed',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ffffff',
          color: '#0d0d0d',
          padding: '16px 28px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: 700,
          animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          <CheckCircle size={20} />
          <span>매칭 제안서가 성공적으로 발송되었습니다!</span>
        </div>
      )}

      {/* Main Layout (Split View when Showhost is Selected) */}
      {!selectedHost ? (
        <>
          {/* Hero Section */}
          <section style={{ textAlign: 'center', margin: '40px 0 60px 0' }}>
            <div className="badge" style={{ marginBottom: '16px' }}>
              <Sparkles size={12} style={{ marginRight: '4px' }} />
              Premium Live Commerce Matching
            </div>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: 800, 
              lineHeight: '1.2', 
              marginBottom: '20px',
              fontFamily: 'Outfit, sans-serif'
            }}>
              브랜드의 가치를 높일 <br />
              <span className="text-gradient-rainbow">최고의 쇼호스트</span>를 만나보세요
            </h1>
            <p style={{ 
              color: 'hsl(var(--foreground-muted))', 
              maxWidth: '600px', 
              margin: '0 auto',
              fontSize: '1.05rem',
              lineHeight: '1.6'
            }}>
              카테고리별 전문 검증된 쇼호스트들의 프로필을 살펴보고, <br />
              원하는 일정과 제안으로 직접 매칭을 요청할 수 있습니다.
            </p>
          </section>

          {!user ? (
            /* 1. 로그인 전 비공개 유도 화면 */
            <div className="glass-panel animate-scale-in" style={{
              maxWidth: '550px',
              margin: '0 auto 40px auto',
              padding: '45px 35px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px'
            }}>
              <div className="bg-gradient-primary" style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(110, 80, 250, 0.4)'
              }}>
                <Lock size={26} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '10px' }}>
                  쇼호스트 리스트 비공개 안내
                </h3>
                <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '400px', margin: '0 auto' }}>
                  본 매칭 플랫폼은 등록된 쇼호스트의 개인정보 및 매칭 현황 유출 방지를 위해 비공개로 운영됩니다. 
                  가입 후 로그인하여 검증된 프리미엄 쇼호스트 군단을 탐색해 보세요!
                </p>
              </div>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={onNavigateToLogin}
                style={{ width: '100%', padding: '14px', fontWeight: 700, borderRadius: '10px' }}
              >
                로그인 / 회원가입 하러가기
              </button>
            </div>
          ) : user.role === 'showhost' ? (
            /* 2. 쇼호스트 로그인 시 경쟁자 리스트 차단 */
            <div className="glass-panel animate-scale-in" style={{
              maxWidth: '580px',
              margin: '0 auto 40px auto',
              padding: '45px 35px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}>
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '10px' }}>
                  브랜드 전용 탐색 공간입니다
                </h3>
                <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '440px', margin: '0 auto' }}>
                  쇼호스트 회원님은 정보 보호 및 공정 매칭을 위해 다른 쇼호스트의 리스트 열람 권한이 제한되어 있습니다. <br />
                  상단 메뉴의 **'내 프로필 관리'** 및 **'매칭 대시보드'**에서 제안서를 관리해 보세요!
                </p>
              </div>
            </div>
          ) : (
            /* 3. 브랜드 담당자 로그인 시 기존 뷰 정상 노출 */
            <>
              {/* Filter & Search Bar */}
              <div className="glass-panel" style={{
            padding: '20px',
            marginBottom: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search 
                size={18} 
                color="hsl(var(--foreground-muted))" 
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} 
              />
              <input 
                type="text" 
                placeholder="쇼호스트 이름, 전문 키워드 등을 검색해 보세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '48px', height: '50px', borderRadius: '12px' }}
              />
            </div>

            {/* Category Tabs & Filters */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '16px' 
            }}>
              {/* Category Multi-select */}
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                overflowX: 'auto', 
                paddingBottom: '5px',
                scrollbarWidth: 'none',
              }}>
                {CATEGORIES.map(category => {
                  const isSelected = category === '전체' 
                    ? selectedCategories.length === 0 
                    : selectedCategories.includes(category);
                  
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        if (category === '전체') {
                          setSelectedCategories([]);
                        } else {
                          setSelectedCategories(prev => 
                            isSelected
                              ? prev.filter(c => c !== category)
                              : [...prev, category]
                          );
                        }
                      }}
                      className="btn"
                      style={{
                        background: isSelected 
                          ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(260 85% 60%) 100%)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        color: isSelected ? 'white' : 'hsl(var(--foreground-muted))',
                        padding: '8px 20px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        whiteSpace: 'nowrap',
                        border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>

              {/* Advanced Filters & Sort */}
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                {/* Min Pay Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={16} color="hsl(var(--foreground-muted))" />
                  <span style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground-muted))' }}>최소 금액:</span>
                  <select
                    value={minPayFilter}
                    onChange={(e) => setMinPayFilter(Number(e.target.value))}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value={0} style={{ background: '#0f172a' }}>전체 금액</option>
                    <option value={10} style={{ background: '#0f172a' }}>10만원 이상</option>
                    <option value={20} style={{ background: '#0f172a' }}>20만원 이상</option>
                    <option value={30} style={{ background: '#0f172a' }}>30만원 이상</option>
                    <option value={50} style={{ background: '#0f172a' }}>50만원 이상</option>
                  </select>
                </div>

                {/* Sort Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground-muted))' }}>금액 정렬:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="pay_high" style={{ background: '#0f172a' }}>금액 높은 순</option>
                    <option value="pay_low" style={{ background: '#0f172a' }}>금액 낮은 순</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Showhost Grid List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ 
                border: '3px solid rgba(255, 255, 255, 0.1)',
                borderTop: '3px solid hsl(var(--primary))',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px auto'
              }} />
              <p style={{ color: 'hsl(var(--foreground-muted))' }}>쇼호스트 목록을 로드하고 있습니다...</p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : filteredHosts.length > 0 ? (
            <div className="showhost-grid">
              {filteredHosts.map(host => (
                <ShowhostCard 
                  key={host.id} 
                  host={host} 
                  onSelect={setSelectedHost} 
                />
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '80px 40px' }}>
              <AlertCircle size={48} color="hsl(var(--foreground-muted))" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>검색 결과가 없습니다</h3>
              <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem' }}>
                다른 검색어를 입력하거나 다른 카테고리를 탐색해보세요.
              </p>
            </div>
          )}
          </>
          )}
        </>
      ) : (
        /* Detailed Profile View */
        <div className="animate-fade-in" style={{ marginTop: '20px' }}>
          {/* Back Button */}
          <button 
            onClick={() => setSelectedHost(null)}
            className="btn btn-secondary"
            style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} />
            <span>목록으로 돌아가기</span>
          </button>

          {/* Profile Container */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '30px',
            alignItems: 'start'
          }}>
            {/* Responsive grid for tablet/desktop */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'window.innerWidth > 768 ? "1fr 2fr" : "1fr"',
              gap: '30px',
              // Custom CSS Media Query Simulation in React Inline Style
            }} className="profile-grid-desktop">
              {/* Left Column: Image Card */}
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                <img 
                  src={selectedHost.profileImage} 
                  alt={selectedHost.name}
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    maxHeight: '380px',
                    marginBottom: '20px'
                  }}
                />
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>{selectedHost.name}</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: '#000000', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }}>{selectedHost.category}</span>
                  <span className="badge" style={{ background: '#000000', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }}>경력 {selectedHost.career}</span>
                  {selectedHost.gender && <span className="badge" style={{ background: '#000000', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }}>{selectedHost.gender}</span>}
                  {selectedHost.height && <span className="badge" style={{ background: '#000000', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }}>{selectedHost.height}</span>}
                  {selectedHost.weight && <span className="badge" style={{ background: '#000000', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }}>{selectedHost.weight}</span>}
                </div>
                
                {/* Rating Banner */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <Star size={18} fill="hsl(45, 100%, 55%)" color="hsl(45, 100%, 55%)" />
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedHost.rating?.toFixed(1) || '5.0'}</span>
                  <span style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground-muted))' }}>({selectedHost.reviews || 0}개의 평가)</span>
                </div>

                {/* Primary CTA */}
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowMatchingModal(true)}
                  style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
                >
                  매칭 신청하기
                </button>
              </div>

              {/* Right Column: Detailed Bio & Info */}
              <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {/* About Me Section */}
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="hsl(var(--primary-hover))" />
                    <span>한 줄 소개</span>
                  </h3>
                  <p style={{ 
                    fontSize: '1.15rem', 
                    fontWeight: 500, 
                    lineHeight: '1.6', 
                    color: 'white',
                    borderLeft: '4px solid hsl(var(--primary))',
                    paddingLeft: '16px'
                  }}>
                    "{selectedHost.bio}"
                  </p>
                </div>

                {/* Detailed Description */}
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '14px' }}>상세 프로필 정보</h3>
                  <p style={{ 
                    fontSize: '0.95rem', 
                    color: 'hsl(var(--foreground-muted))',
                    lineHeight: '1.7',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedHost.detail || '상세 소개 내용이 아직 작성되지 않았습니다.'}
                  </p>
                </div>

                {/* Quick Stats Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.04)'
                }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="bg-gradient-primary" style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center', display: 'inline-flex', justifyContent: 'center' }}>
                      <CircleDollarSign size={18} color="white" style={{ alignSelf: 'center' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', display: 'block' }}>희망 페이</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedHost.pay}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="bg-gradient-primary" style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center', display: 'inline-flex', justifyContent: 'center' }}>
                      <Calendar size={18} color="white" style={{ alignSelf: 'center' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', display: 'block' }}>진행 가능 시간</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedHost.time}</span>
                    </div>
                  </div>
                </div>

                {/* 방송 및 포트폴리오 섹션 */}
                {(selectedHost.broadcastLink || selectedHost.portfolio) && (
                   <div>
                     <h3 style={{ fontSize: '1.25rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <Video size={18} color="#ffffff" />
                       <span>대표 방송 & 포트폴리오</span>
                     </h3>
                     
                     {user && user.isPaid === 'true' ? (
                       /* 결제 완료 유저 */
                       <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                         {selectedHost.broadcastLink && (
                           <a 
                             href={selectedHost.broadcastLink} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="btn btn-accent"
                             style={{
                               padding: '12px 20px',
                               fontSize: '0.9rem',
                               display: 'inline-flex',
                               alignItems: 'center',
                               gap: '8px'
                             }}
                           >
                             <Sparkles size={16} />
                             <span>대표 방송 보러가기</span>
                           </a>
                         )}
                         {selectedHost.portfolio && (
                           <a 
                             href={selectedHost.portfolio} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="btn btn-secondary"
                             style={{
                               padding: '12px 20px',
                               fontSize: '0.9rem',
                               display: 'inline-flex',
                               alignItems: 'center',
                               gap: '8px'
                             }}
                           >
                             <Video size={16} />
                             <span>포트폴리오 보러가기</span>
                           </a>
                         )}
                       </div>
                     ) : (
                       /* 미결제 유저: 블러 처리 및 결제 유도 */
                       <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', minHeight: '80px' }}>
                         {/* 블러링된 더미 버튼 */}
                         <div style={{
                           display: 'flex',
                           gap: '12px',
                           flexWrap: 'wrap',
                           filter: 'blur(5px)',
                           pointerEvents: 'none',
                           userSelect: 'none',
                           opacity: 0.3
                         }}>
                           <button className="btn btn-accent" style={{ padding: '12px 20px', fontSize: '0.9rem' }}>대표 방송 보러가기</button>
                           <button className="btn btn-secondary" style={{ padding: '12px 20px', fontSize: '0.9rem' }}>포트폴리오 보러가기</button>
                         </div>
                         
                         {/* 잠금 해제 안내 오버레이 */}
                         <div style={{
                           position: 'absolute',
                           top: 0,
                           left: 0,
                           width: '100%',
                           height: '100%',
                           display: 'flex',
                           flexDirection: 'column',
                           alignItems: 'center',
                           justifyContent: 'center',
                           background: 'rgba(15, 23, 42, 0.65)',
                           borderRadius: '8px',
                           padding: '16px',
                           textAlign: 'center',
                           border: '1px solid rgba(255, 255, 255, 0.05)',
                           boxSizing: 'border-box'
                         }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                             <Lock size={16} color="hsl(var(--primary-hover))" />
                             <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                               포트폴리오 및 방송 링크는 멤버십 결제 후 열람 가능합니다.
                             </span>
                           </div>
                           <button 
                             onClick={handleTossPayment}
                             className="btn btn-primary"
                             style={{ 
                               padding: '8px 18px', 
                               fontSize: '0.8rem',
                               fontWeight: 700,
                               boxShadow: '0 4px 14px rgba(110, 80, 250, 0.4)' 
                             }}
                           >
                             멤버십 결제하고 잠금 해제 (15,000원)
                           </button>
                         </div>
                       </div>
                     )}
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Matching Form Modal Overlay */}
      {showMatchingModal && selectedHost && (
        <MatchingModal 
          host={selectedHost} 
          onClose={() => setShowMatchingModal(false)}
          onSuccess={handleMatchSuccess}
          onNavigateToLogin={onNavigateToLogin}
        />
      )}

      {/* Simulated Desktop Media Query Styling */}
      <style>{`
        .profile-grid-desktop {
          display: grid;
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .profile-grid-desktop {
            grid-template-columns: 1fr 2fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
