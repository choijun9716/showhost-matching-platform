import React from 'react';
import { Star, Award, Calendar, CircleDollarSign } from 'lucide-react';

const ShowhostCard = ({ host, onSelect }) => {
  return (
    <div 
      className="glass-card host-card animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
      onClick={() => onSelect(host)}
    >
      {/* Host Avatar Image Container */}
      <div className="host-card-img-wrapper" style={{ position: 'relative', width: '100%', paddingTop: '110%', overflow: 'hidden' }}>
        <img 
          src={host.profileImage} 
          alt={host.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          className="host-image-hover"
        />
        {/* Recommendation Badge */}
        {host.isRecommended && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: '#000',
            fontWeight: 800,
            fontSize: '0.75rem',
            padding: '4px 8px',
            borderRadius: '6px',
            boxShadow: '0 2px 10px rgba(255, 215, 0, 0.3)',
            zIndex: 2,
            letterSpacing: '0.05em'
          }}>
            ✨ 추천
          </div>
        )}
        {/* Category & Career Overlay Badges */}
        <div className="host-card-badges" style={{ 
          position: 'absolute', 
          bottom: '12px', 
          left: '12px', 
          display: 'flex', 
          gap: '6px',
          flexWrap: 'wrap'
        }}>
          <span className="badge" style={{ background: '#000000', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }}>{host.category}</span>
          <span className="badge" style={{ background: '#000000', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
            경력 {host.career}
          </span>
        </div>
      </div>

      {/* Details Section */}
      <div className="host-card-details" style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Name and Rating */}
        <div className="host-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{host.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={16} fill="hsl(45, 100%, 55%)" color="hsl(45, 100%, 55%)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{host.rating?.toFixed(1) || '5.0'}</span>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))' }}>({host.reviews || 0})</span>
          </div>
        </div>

        {/* Bio */}
        <p className="host-card-bio" style={{ 
          fontSize: '0.9rem', 
          color: 'hsl(var(--foreground-muted))',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          height: '40px'
        }}>
          {host.bio}
        </p>

        {/* Info Rows */}
        <div className="host-card-info" style={{ 
          marginTop: 'auto', 
          paddingTop: '12px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '0.8rem',
          color: 'hsl(var(--foreground-muted))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CircleDollarSign size={14} color="#ffffff" />
            <span>{host.pay}</span>
          </div>
        </div>
      </div>
      
      {/* Bottom Button Action */}
      <div className="host-card-action" style={{ padding: '0 20px 20px 20px' }}>
        <button 
          className="btn btn-premium-glass" 
          style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(host);
          }}
        >
          상세프로필 확인
        </button>
      </div>
    </div>
  );
};

export default ShowhostCard;
