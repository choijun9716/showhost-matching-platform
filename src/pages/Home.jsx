import React, { useState, useEffect } from 'react';
import { api } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import ShowhostCard from '../components/ShowhostCard';
import CampaignProposalModal from '../components/CampaignProposalModal';
import PortfolioView from '../components/PortfolioView';
import { Search, Filter, Sparkles, Star, Calendar, CircleDollarSign, Video, CheckCircle, AlertCircle, ArrowLeft, Lock, ShieldAlert } from 'lucide-react';

const CATEGORIES = ['전체', '식품', '뷰티', '가전', '테크', '패션', '건기식', '키즈', '여행', '리빙'];

const Home = ({ onNavigateToLogin, onNavigateToCampaignCreate }) => {
  const { user } = useAuth();
  const [hosts, setHosts] = useState([]);
  const [filteredHosts, setFilteredHosts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]); // 중복 선택을 위한 배열
  const [payRangeFilter, setPayRangeFilter] = useState('전체'); // 금액대 필터
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedHost, setSelectedHost] = useState(null);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [matchingSuccess, setMatchingSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHosts();
  }, []);


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

    // Pay Range Filter
    if (payRangeFilter !== '전체') {
      result = result.filter(h => {
        if (!h.pay) return false;
        const match = h.pay.match(/([0-9]+)만/);
        const minPay = match ? parseInt(match[1], 10) : 0;

        if (payRangeFilter === '10만원대') return minPay >= 10 && minPay < 20;
        if (payRangeFilter === '20만원대') return minPay >= 20 && minPay < 30;
        if (payRangeFilter === '30만원대') return minPay >= 30 && minPay < 40;
        if (payRangeFilter === '40만원대') return minPay >= 40 && minPay < 50;
        if (payRangeFilter === '50만원 이상') return minPay >= 50;
        return true;
      });
    }

    // Search Query Filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().replace(/\s+/g, '');
      result = result.filter(h => {
        if (!h.name) return false;
        const normalizedName = h.name.toLowerCase().replace(/\s+/g, '');
        return normalizedName.includes(query);
      });
    }

    // Sort Logic
    const sorted = [...result];
    sorted.sort((a, b) => {
      // 1. displayOrder 내림차순 정렬
      const orderA = a.displayOrder || 0;
      const orderB = b.displayOrder || 0;
      return orderB - orderA;
    });

    setFilteredHosts(sorted);
  }, [selectedCategories, payRangeFilter, searchQuery, hosts]);

  // 상세 포트폴리오(selectedHost) 진입 시 스크롤 최상단 이동
  useEffect(() => {
    if (selectedHost) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [selectedHost]);

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
    <>
      <div className="container animate-fade-in" style={{ paddingBottom: '80px' }}>

        {/* Main Layout (Split View when Showhost is Selected) */}
        {!selectedHost ? (
          <>
            {!user ? (
              <div className="landing-page animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '80px', marginTop: '20px' }}>
                {/* 1. Hero Section */}
                <section style={{ textAlign: 'center', margin: '60px 0 20px 0' }}>
                  <div className="badge" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.9rem' }}>
                    대한민국 No.1 라이브 커머스 매칭 플랫폼
                  </div>
                  <h1 style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    fontWeight: 900,
                    lineHeight: '1.2',
                    marginBottom: '24px',
                    letterSpacing: '-0.02em',
                    fontFamily: 'Outfit, sans-serif'
                  }}>
                    검증된 <span className="text-gradient-rainbow">전문 쇼호스트</span><br/>이제 원클릭으로 매칭하세요
                  </h1>
                  <p style={{
                    color: 'hsl(var(--foreground-muted))',
                    maxWidth: '650px',
                    margin: '0 auto 40px auto',
                    fontSize: '1.15rem',
                    lineHeight: '1.6'
                  }}>
                    복잡한 에이전시 절차와 수수료 없이, 검증된 탑클래스 쇼호스트의 
                    포트폴리오를 확인하고 원하는 조건으로 다이렉트 제안을 보내보세요.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <button onClick={onNavigateToLogin} className="btn btn-primary" style={{ padding: '18px 36px', fontSize: '1.1rem', borderRadius: '50px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 30px rgba(255,255,255,0.2)' }}>
                      무료로 시작하기 <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }}/>
                    </button>
                  </div>
                </section>

                {/* 2. Features Section */}
                <section>
                  <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '40px' }}>왜 SHOWLAB 인가요?</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                    <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Star size={28} color="#ffffff" />
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>검증된 전문가 풀</h3>
                      <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        철저한 자체 심사를 거친 라이브 커머스 전문 쇼호스트 네트워크를 독점 제공합니다.
                      </p>
                    </div>
                    <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Video size={28} color="#ffffff" />
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>다이렉트 매칭</h3>
                      <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        에이전시 중간 수수료 없이, 브랜드가 직접 원하는 호스트에게 투명하게 제안합니다.
                      </p>
                    </div>
                    <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircleDollarSign size={28} color="#ffffff" />
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>100% 안전 결제</h3>
                      <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        쇼호스트가 제안을 거절할 경우 소모된 크레딧(비용)은 시스템이 즉시 100% 환불해 드립니다.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 3. How it works Section */}
                <section style={{ padding: '40px 0' }}>
                  <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '40px' }}>단 3단계로 끝나는 매칭</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
                    {[
                      { step: 1, title: '캠페인 등록', desc: '방송할 상품의 일정과 예산을 간단히 설정합니다.', icon: <Calendar size={24} /> },
                      { step: 2, title: '쇼호스트 탐색 및 제안', desc: '카테고리와 금액대 필터로 최적의 호스트를 찾아 제안을 보냅니다.', icon: <Search size={24} /> },
                      { step: 3, title: '매칭 성공 및 방송 진행', desc: '호스트가 수락하면 연락처가 공유되며 성공적인 라이브를 준비합니다.', icon: <CheckCircle size={24} /> }
                    ].map((item, idx) => (
                      <div key={idx} className="glass-panel" style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: '24px', borderRadius: '20px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#ffffff', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', flexShrink: 0 }}>
                          {item.step}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>{item.title}</h3>
                          <p style={{ color: 'hsl(var(--foreground-muted))' }}>{item.desc}</p>
                        </div>
                        <div style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.2)' }}>
                          {item.icon}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 4. CTA Section */}
                <section style={{ textAlign: 'center', padding: '60px 0', marginBottom: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '16px' }}>라이브 커머스의 성공, 지금 시작하세요</h2>
                  <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '1.1rem', marginBottom: '32px' }}>
                    수많은 톱 브랜드와 프리미엄 쇼호스트들이 이미 함께하고 있습니다.
                  </p>
                  <button onClick={onNavigateToLogin} className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: '12px', fontWeight: 700 }}>
                    쇼호스트 리스트 보러가기
                  </button>
                </section>
              </div>
            ) : (
              <>
                {/* Hero Section for Logged in Users */}
                <section style={{ textAlign: 'center', margin: '40px 0 40px 0' }}>
                  <div className="badge" style={{ marginBottom: '16px' }}>
                    <Sparkles size={12} style={{ marginRight: '4px' }} />
                    Premium Live Commerce Matching
                  </div>
                  <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '10px' }}>
                    <span className="text-gradient-rainbow">전문 쇼호스트</span> 탐색
                  </h1>
                </section>
                {user.role === 'showhost' ? (
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
                    쇼호스트는 정보 보호를 위해 다른 쇼호스트의 리스트 열람 권한이 제한되어 있습니다. <br />
                    상단 메뉴의 '내 프로필 관리'및 '매칭 대시보드'에서 제안서를 관리해 보세요!
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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Search
                        size={18}
                        color="hsl(var(--foreground-muted))"
                        style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
                      />
                      <input
                        type="text"
                        placeholder="쇼호스트를 검색해보세요."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(searchInput)}
                        style={{ paddingLeft: '48px', height: '50px', borderRadius: '12px', width: '100%' }}
                      />
                    </div>
                    <button
                      onClick={() => setSearchQuery(searchInput)}
                      className="btn btn-primary"
                      style={{ height: '50px', borderRadius: '12px', padding: '0 24px', whiteSpace: 'nowrap' }}
                    >
                      검색
                    </button>
                    <button
                      onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                      className="btn btn-secondary"
                      style={{ height: '50px', borderRadius: '12px', padding: '0 16px', whiteSpace: 'nowrap' }}
                      title="검색 초기화"
                    >
                      초기화
                    </button>
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
                                ? '#ffffff'
                                : 'rgba(255, 255, 255, 0.05)',
                              color: isSelected ? '#000000' : 'hsl(var(--foreground-muted))',
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

                    {/* Advanced Filters (Min Pay Button Group, Sort Removed) */}
                    <div style={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      {/* Min Pay Filter Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--foreground-muted))', fontSize: '0.85rem' }}>
                          <Filter size={15} />
                          <span>금액대:</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {[
                            '전체',
                            '10만원대',
                            '20만원대',
                            '30만원대',
                            '40만원대',
                            '50만원 이상'
                          ].map(option => {
                            const isSelected = payRangeFilter === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => setPayRangeFilter(option)}
                                className="btn"
                                style={{
                                  background: isSelected
                                    ? '#ffffff'
                                    : 'rgba(255, 255, 255, 0.05)',
                                  color: isSelected ? '#000000' : 'hsl(var(--foreground-muted))',
                                  padding: '6px 14px',
                                  borderRadius: '20px',
                                  fontSize: '0.8rem',
                                  border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                  transition: 'all 0.2s ease',
                                  fontWeight: isSelected ? 700 : 500,
                                  cursor: 'pointer'
                                }}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
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
            )}
          </>
        ) : (
          <PortfolioView
            host={selectedHost}
            onClose={() => setSelectedHost(null)}
            onSendProposal={() => setShowMatchingModal(true)}
          />
        )}

      </div>

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
          <span>캠페인 제안이 성공적으로 발송되었습니다!</span>
        </div>
      )}

      {/* Matching Form Modal Overlay */}
      {showMatchingModal && selectedHost && (
        <CampaignProposalModal
          host={selectedHost}
          onClose={() => setShowMatchingModal(false)}
          onSuccess={handleMatchSuccess}
          onNavigateToLogin={onNavigateToLogin}
          onCreateCampaign={() => { setShowMatchingModal(false); if (onNavigateToCampaignCreate) onNavigateToCampaignCreate(); }}
        />
      )}
    </>
  );
};

export default Home;
