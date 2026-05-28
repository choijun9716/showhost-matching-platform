import React, { useState } from 'react';
import { X, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const PACKAGES = [
  { id: 'pkg1', credits: 100, price: 10000, label: '베이직', popular: false },
  { id: 'pkg2', credits: 200, price: 20000, label: '스탠다드', popular: false },
  { id: 'pkg3', credits: 300, price: 25000, label: '프리미엄', popular: true, discount: '5,000원 할인' },
];

const CreditTopUpModal = ({ onClose, onSuccess }) => {
  const { user, updateCredits } = useAuth();
  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[1]);
  const [loading, setLoading] = useState(false);
  const [successMode, setSuccessMode] = useState(false);

  const handleCharge = async () => {
    if (!selectedPkg || !user) return;
    
    setLoading(true);
    // 가상의 결제 딜레이 시뮬레이션
    setTimeout(async () => {
      try {
        const newTotal = await api.users.chargePoints(user.id, selectedPkg.credits, '클라이언트 직접 충전');
        updateCredits(newTotal); // AuthContext 최신화
        setSuccessMode(true);
        setTimeout(() => {
          onSuccess(newTotal);
          onClose();
        }, 2000);
      } catch (err) {
        alert('충전 중 오류가 발생했습니다: ' + err.message);
        setLoading(false);
      }
    }, 1500);
  };

  if (successMode) {
    return (
      <div className="animate-fade-in" style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(5,7,13,0.85)', backdropFilter: 'blur(8px)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '40px 20px', borderRadius: '16px' }}>
          <CheckCircle2 size={60} color="#ffffff" style={{ margin: '0 auto 20px auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '10px' }}>충전 완료!</h2>
          <p style={{ color: 'hsl(var(--foreground-muted))' }}>
            {selectedPkg.credits} 크레딧이 성공적으로 충전되었습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(5,7,13,0.85)', backdropFilter: 'blur(8px)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '30px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} color="#ffffff" />
            크레딧 충전
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'hsl(var(--foreground-muted))', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <p style={{ color: 'hsl(var(--foreground-muted))', marginBottom: '24px', fontSize: '0.95rem' }}>
          매칭 제안을 보내기 위해 크레딧이 필요합니다.<br/>
          (1건 제안 시 10 크레딧 차감 / 거절 시 100% 환불)
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
          {PACKAGES.map(pkg => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPkg(pkg)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                borderRadius: '12px',
                border: selectedPkg.id === pkg.id ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.1)',
                background: selectedPkg.id === pkg.id ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {pkg.popular && (
                <div style={{
                  position: 'absolute', top: '10px', right: '-30px', background: '#ffffff', color: '#000000',
                  fontSize: '0.7rem', fontWeight: 800, padding: '4px 30px', transform: 'rotate(45deg)'
                }}>
                  BEST
                </div>
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{pkg.credits} C</span>
                  {pkg.discount && (
                    <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', color: '#ffffff' }}>
                      {pkg.discount}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground-muted))' }}>{pkg.label} 패키지</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {pkg.price.toLocaleString()}원
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          onClick={handleCharge}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
              결제 진행 중...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              {selectedPkg.price.toLocaleString()}원 결제하기
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreditTopUpModal;
