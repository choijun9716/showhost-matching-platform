import React, { useState, useEffect } from 'react';
import { api } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import ShowhostCard from '../components/ShowhostCard';
import MatchingModal from '../components/MatchingModal';
import PortfolioView from '../components/PortfolioView';
import { Search, Filter, Sparkles, Star, Calendar, CircleDollarSign, Video, CheckCircle, AlertCircle, ArrowLeft, Lock, ShieldAlert } from 'lucide-react';

const CATEGORIES = ['전체', '식품', '뷰티', '가전', '테크', '패션', '건기식', '키즈', '여행', '리빙'];

const Home = ({ onNavigateToLogin }) => {
  const { user, updateUserPaidStatus } = useAuth();
  const [hosts, setHosts] = useState([]);
  const [filteredHosts, setFilteredHosts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]); // 중복 선택을 위한 배열
  const [minPayFilter, setMinPayFilter] = useState(0); // 금액별 필터 (단위: 만원)
  const [searchQuery, setSearchQuery] = useState('');
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

  // URL Query 'hostId' Handler
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hostId = params.get('hostId');
    if (hostId && hosts.length > 0) {
      const target = hosts.find(h => h.id === hostId || h.email === hostId);
      if (target) {
        setSelectedHost(target);
      }
    }
  }, [hosts]);

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
    const payment = tossPayments.payment({ customerKey: user.id });
    
    payment.requestPayment({
      method: 'CARD',
      amount: {
        currency: 'KRW',
        value: 15000,
      },
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
      return orderB - orderA;
    });

    setFilteredHosts(sorted);
  }, [selectedCategories, minPayFilter, searchQuery, hosts]);

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

              {/* Advanced Filters (Min Pay Button Group, Sort Removed) */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                {/* Min Pay Filter Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--foreground-muted))', fontSize: '0.85rem' }}>
                    <Filter size={15} />
                    <span>최소 금액:</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { label: '전체', value: 0 },
                      { label: '10만+', value: 10 },
                      { label: '20만+', value: 20 },
                      { label: '30만+', value: 30 },
                      { label: '50만+', value: 50 }
                    ].map(option => {
                      const isSelected = minPayFilter === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setMinPayFilter(option.value)}
                          className="btn"
                          style={{
                            background: isSelected 
                              ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(260 85% 60%) 100%)' 
                              : 'rgba(255, 255, 255, 0.05)',
                            color: isSelected ? 'white' : 'hsl(var(--foreground-muted))',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.08)',
                            transition: 'all 0.2s ease',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer'
                          }}
                        >
                          {option.label}
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
      ) : (
        <PortfolioView 
          host={selectedHost} 
          onClose={() => setSelectedHost(null)} 
          onMatchRequest={() => setShowMatchingModal(true)} 
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
          <span>매칭 제안서가 성공적으로 발송되었습니다!</span>
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
    </>
  );
};

export default Home;
