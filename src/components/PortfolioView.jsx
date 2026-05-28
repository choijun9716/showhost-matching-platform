import React from 'react';
import { ArrowLeft, Printer, Sparkles, Link as LinkIcon, ExternalLink } from 'lucide-react';

const PortfolioView = ({ host, onClose, onSendProposal, isOwnProfile = false }) => {
  const birth = host.birth || '정보없음';
  const company = '소속사 없음';
  const education = '정보없음';
  const shoeSize = '정보없음';
  let keywords = host.keywords || [];
  let references = host.references || [];

  // QR코드 생성 API 링크 (현재 웹 링크 연동)
  const currentUrl = window.location.origin + window.location.pathname + `?hostId=${host.id || host.email}`;
  const qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(currentUrl)}`;

  // 오늘 날짜 (업데이트일 포맷)
  const todayString = new Date().toISOString().split('T')[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="portfolio-wrapper">
      
      {/* no-print: 상단 컨트롤 바 */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.05)',
        marginBottom: '30px'
      }}>
        <button 
          onClick={onClose}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={16} />
          <span>목록으로 돌아가기</span>
        </button>
        
        <button 
          onClick={handlePrint}
          className="btn btn-primary"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
            color: '#000000',
            fontWeight: 700
          }}
        >
          <Printer size={16} />
          <span>PDF 다운로드 (인쇄)</span>
        </button>
      </div>

      {/* 포트폴리오 인쇄용 컨테이너 */}
      <div className="portfolio-print-container">
        
        {/* ============================================================ */}
        {/* PAGE 1: 메인 프로필 정보 카드 */}
        {/* ============================================================ */}
        <section className="print-page page-1">
          <div className="grid-layout">
            
            {/* 왼쪽: 프로필 메인 대형 이미지 */}
            <div className="profile-image-column">
              <img 
                src={host.profileImage} 
                alt={host.name} 
                className="main-profile-img"
              />
            </div>
            
            {/* 오른쪽: 상세 사항 및 키워드 */}
            <div className="profile-info-column">
              
              {/* 타이틀 및 QR코드 영역 */}
              <div className="header-meta-row">
                <div className="name-wrapper">
                  <h1 className="host-title">
                    {host.name}
                    <span className="gender-badge">{host.gender || '쇼호스트'}</span>
                  </h1>
                  <p className="english-name">SHOWHOST</p>
                </div>
                
                {/* QR코드 이미지 */}
                <div className="qr-wrapper">
                  <img src={qrCodeSrc} alt="QR Code Link" className="qr-img" />
                  <span className="qr-text">{todayString} 업데이트됨</span>
                </div>
              </div>

              {/* 한줄 소개 */}
              <div className="bio-block">
                <p className="bio-text">"{host.bio || '안녕하세요! 진정성 있는 방송으로 보답하겠습니다.'}"</p>
              </div>

              {/* 대표 정보 테이블 그리드 */}
              <div className="stats-table">
                <h3 className="section-subtitle">대표정보</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">생년월일</span>
                    <span className="stat-value">{birth}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">희망 페이</span>
                    <span className="stat-value">{host.pay || '정보없음'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">키</span>
                    <span className="stat-value">{host.height || '정보없음'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">몸무게</span>
                    <span className="stat-value">{host.weight || '정보없음'}</span>
                  </div>
                </div>
              </div>

              {/* 키워드 태그들 */}
              <div className="keyword-section">
                <h3 className="section-subtitle">키워드</h3>
                <div className="keyword-tags-container">
                  {keywords.length > 0 ? keywords.map((kw, i) => (
                    <span key={i} className="keyword-tag">#{kw}</span>
                  )) : (
                    <>
                      <span className="keyword-tag">#{host.category || '전문가'}</span>
                      <span className="keyword-tag">#신뢰감있는</span>
                      <span className="keyword-tag">#원활한소통</span>
                    </>
                  )}
                </div>
              </div>

              {/* 캠페인 제안 버튼 (웹 전용) */}
              <div className="no-print" style={{ marginTop: '10px' }}>
                <button 
                  onClick={onSendProposal}
                  className="btn btn-primary"
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    fontSize: '1.05rem', 
                    fontWeight: 700,
                    background: '#ffffff',
                    color: '#0d0d0d',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isOwnProfile ? '프로필 수정' : '제안요청'}
                </button>
              </div>

              {/* 하단 브랜딩 로고 */}
              <div className="branding-logo-row" style={{ marginTop: 'auto' }}>
                <span className="branding-logo">SHOW<span className="text-gradient-primary">LAB</span></span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PAGE 2: 방송 레퍼런스 리스트 */}
        {/* ============================================================ */}
        <section className="print-page page-2">
          <div className="page-header-row">
            <h2 className="page-section-title">방송 레퍼런스 리스트</h2>
            <div className="page-header-line" />
          </div>

          <div className="filmography-container">
            <table className="filmo-table">
              <thead>
                <tr>
                  <th style={{ width: '60%' }}>방송 제목</th>
                  <th style={{ width: '40%' }}>링크</th>
                </tr>
              </thead>
              <tbody>
                {references.length > 0 ? references.map((item, idx) => (
                  <tr key={idx}>
                    <td className="brand-text bold-text">{item.title}</td>
                    <td className="link-cell">
                      {item.url ? (
                        (item.url.startsWith('http') || (item.url.includes('.') && !item.url.includes(' '))) ? (
                          <a 
                            href={item.url.startsWith('http') ? item.url : `https://${item.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn"
                            style={{
                              background: 'rgba(229, 229, 229, 0.1)',
                              border: '1px solid rgba(229, 229, 229, 0.2)',
                              color: '#e5e5e5',
                              textDecoration: 'none',
                              fontSize: '0.85rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              fontWeight: 600
                            }}
                            title="방송 보기"
                          >
                            <span>방송보기</span>
                            <ExternalLink size={14} style={{ flexShrink: 0 }} />
                          </a>
                        ) : (
                          <span style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', wordBreak: 'break-all' }}>{item.url}</span>
                        )
                      ) : (
                        <span className="no-link-text">-</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>
                      등록된 방송 레퍼런스가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="branding-logo-row" style={{ marginTop: 'auto' }}>
            <span className="branding-logo">SHOW<span className="text-gradient-primary">LAB</span></span>
          </div>
        </section>
      </div>

      {/* 인쇄 및 모던 포트폴리오 스타일링 */}
      <style>{`
        /* 웹 뷰용 기본 스타일 (다크 테마 준수) */
        .portfolio-wrapper {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          color: #ffffff;
        }

        .portfolio-print-container {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .print-page {
          background: #050505; /* Deep black */
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.8);
          box-sizing: border-box;
          min-height: 800px;
          display: flex;
          flex-direction: column;
        }

        /* 1페이지 Grid */
        .grid-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          align-items: start;
        }
        @media (min-width: 768px) {
          .grid-layout {
            grid-template-columns: 1.1fr 1.9fr;
          }
        }

        .profile-image-column {
          width: 100%;
        }

        .main-profile-img {
          width: 100%;
          border-radius: 16px;
          object-fit: cover;
          max-height: 480px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .profile-info-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .header-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1.5px solid rgba(255,255,255,0.1);
          padding-bottom: 16px;
        }

        .host-title {
          font-size: 2.2rem;
          font-weight: 800;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          letter-spacing: -0.02em;
        }

        .gender-badge {
          font-size: 0.8rem;
          background: rgba(110, 80, 250, 0.2);
          border: 1px solid rgba(110, 80, 250, 0.4);
          color: #a78bfa;
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 700;
        }

        .english-name {
          margin: 4px 0 0 0;
          font-size: 1rem;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .qr-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        .qr-img {
          width: 80px;
          height: 80px;
          border-radius: 6px;
          padding: 4px;
          background: white;
        }

        .qr-text {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.4);
        }

        .bio-block {
          background: #0a0a0a;
          border-left: 4px solid #00f2fe;
          padding: 18px 20px;
          border-radius: 0 12px 12px 0;
          border: 1px solid rgba(255,255,255,0.05);
          border-left: 4px solid #00f2fe;
        }

        .bio-text {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 500;
          line-height: 1.5;
          color: #ffffff;
        }

        .section-subtitle {
          font-size: 0.95rem;
          font-weight: 700;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 12px 0;
          border-left: 2.5px solid rgba(255,255,255,0.3);
          padding-left: 8px;
        }

        /* 대표정보 그리드 */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .stat-item {
          background: #0a0a0a;
          border: 1px solid rgba(255,255,255,0.06);
          padding: 14px 10px;
          border-radius: 12px;
          text-align: center;
          transition: transform 0.2s ease;
        }
        .stat-item:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.15);
        }

        .stat-label {
          display: block;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.4);
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 0.9rem;
          font-weight: 700;
          color: #ffffff;
        }

        /* 키워드 태그 */
        .keyword-tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .keyword-tag {
          font-size: 0.8rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #ffffff;
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: 600;
        }

        .rep-works-text {
          margin: 0;
          font-size: 0.95rem;
          color: rgba(255,255,255,0.8);
          font-weight: 500;
        }

        .branding-logo-row {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .branding-logo {
          font-size: 1.1rem;
          font-weight: 800;
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.02em;
        }

        /* 2페이지: 갤러리 */
        .page-header-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 30px;
        }

        .page-section-title {
          font-size: 1.4rem;
          font-weight: 800;
          margin: 0;
          white-space: nowrap;
        }

        .page-header-line {
          flex-grow: 1;
          height: 1px;
          background: rgba(255,255,255,0.1);
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .gallery-img-card {
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.1);
          aspect-ratio: 2 / 3;
        }

        .gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .gallery-img-card:hover .gallery-img {
          transform: scale(1.03);
        }

        /* 3페이지: 필모그래피 테이블 */
        .filmo-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .filmo-table th {
          background: rgba(255,255,255,0.05);
          padding: 14px 16px;
          font-size: 0.85rem;
          font-weight: 700;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
        }

        .filmo-table td {
          padding: 16px;
          font-size: 0.9rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.8);
        }

        .filmo-table tbody tr:hover {
          background: rgba(255,255,255,0.01);
        }

        .bold-text {
          font-weight: 700;
          color: #ffffff !important;
        }

        .brand-text {
          font-weight: 600;
          color: #ffffff !important;
        }

        .filmo-link-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.2s ease;
        }

        .filmo-link-btn:hover {
          background: #ffffff;
          color: #000000;
          transform: translateY(-2px);
        }

        .no-link-text {
          color: rgba(255,255,255,0.2);
        }


        /* ============================================================ */
        /* PRINT STYLING (A4 인쇄 최적화) */
        {/* ============================================================ */}
        @media print {
          /* 웹 브라우저 UI와 스크롤 숨김 */
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 11pt !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          #root, .portfolio-wrapper {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .no-print {
            display: none !important;
          }

          .no-print-col {
            display: none !important;
          }

          .portfolio-print-container {
            gap: 0 !important;
            display: block !important;
          }

          /* 각 섹션(페이지)을 인쇄 1페이지씩 강제 고정 */
          .print-page {
            page-break-after: always !important;
            break-after: page !important;
            height: 297mm !important; /* A4 세로 높이 */
            width: 210mm !important;  /* A4 가로 너비 */
            background: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20mm 15mm !important; /* 인쇄 여백 */
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
          }

          /* 마지막 페이지는 break 없앰 */
          .print-page.page-3 {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          /* 1페이지 Grid 인쇄용 조정 */
          .grid-layout {
            grid-template-columns: 75mm 105mm !important;
            gap: 10mm !important;
          }

          .main-profile-img {
            max-height: 110mm !important;
            border: 1px solid #dddddd !important;
            box-shadow: none !important;
          }

          .host-title {
            color: #000000 !important;
            font-size: 26pt !important;
          }

          .english-name {
            color: #666666 !important;
          }

          .gender-badge {
            background: #f3f4f6 !important;
            border: 1px solid #cccccc !important;
            color: #374151 !important;
          }

          .qr-img {
            border: 1px solid #cccccc !important;
          }

          .qr-text {
            color: #666666 !important;
          }

          .bio-block {
            background: #f9fafb !important;
            border-left: 4px solid #000000 !important;
            color: #111111 !important;
          }

          .bio-text {
            color: #000000 !important;
            font-size: 11pt !important;
          }

          .section-subtitle {
            color: #444444 !important;
            border-left: 2.5px solid #000000 !important;
          }

          .stat-item {
            background: #fafafa !important;
            border: 1px solid #eeeeee !important;
          }

          .stat-label {
            color: #666666 !important;
          }

          .stat-value {
            color: #000000 !important;
          }

          .keyword-tag {
            background: #f3f4f6 !important;
            border: 1px solid #e5e7eb !important;
            color: #374151 !important;
          }

          .rep-works-text {
            color: #111111 !important;
          }

          /* 2페이지 인쇄용 조정 */
          .page-section-title {
            color: #000000 !important;
            font-size: 18pt !important;
          }

          .page-header-line {
            background: #dddddd !important;
          }

          .gallery-img-card {
            border: 1px solid #dddddd !important;
            box-shadow: none !important;
          }

          /* 3페이지 인쇄용 조정 */
          .filmo-table th {
            background: #f3f4f6 !important;
            color: #374151 !important;
            border-bottom: 2px solid #374151 !important;
          }

          .filmo-table td {
            color: #111111 !important;
            border-bottom: 1px solid #e5e7eb !important;
          }

          .bold-text, .brand-text {
            color: #000000 !important;
          }

          .link-cell a {
            color: #0284c7 !important;
            text-decoration: underline !important;
          }

          .branding-logo-row {
            border-top: 1px solid #dddddd !important;
            margin-top: auto !important;
            padding-top: 8mm !important;
          }

          .branding-logo {
            color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PortfolioView;
