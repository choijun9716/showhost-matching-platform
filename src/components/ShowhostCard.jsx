import React from 'react';
import { Star, Award, Calendar, CircleDollarSign } from 'lucide-react';

const ShowhostCard = ({ host, onSelect }) => {
  return (
    <div 
      className="glass-card animate-fade-in"
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
      <div style={{ position: 'relative', width: '100%', paddingTop: '110%', overflow: 'hidden' }}>
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
        {/* Category & Career Overlay Badges */}
        <div style={{ 
          position: 'absolute', 
          bottom: '12px', 
          left: '12px', 
          display: 'flex', 
          gap: '6px',
          flexWrap: 'wrap'
        }}>
          <span className="badge badge-cyan">{host.category}</span>
          <span className="badge" style={{ background: 'rgba(0, 0, 0, 0.6)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            경력 {host.career}
          </span>
        </div>
      </div>

      {/* Details Section */}
      <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Name and Rating */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{host.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={16} fill="hsl(45, 100%, 55%)" color="hsl(45, 100%, 55%)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{host.rating?.toFixed(1) || '5.0'}</span>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))' }}>({host.reviews || 0})</span>
          </div>
        </div>

        {/* Bio */}
        <p style={{ 
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
        <div style={{ 
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
            <CircleDollarSign size={14} color="hsl(var(--secondary))" />
            <span>{host.pay}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="hsl(var(--primary-hover))" />
            <span>{host.time}</span>
          </div>
        </div>
      </div>
      
      {/* Bottom Button Action */}
      <div style={{ padding: '0 20px 20px 20px' }}>
        <button 
          className="btn btn-secondary" 
          style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(host);
          }}
        >
          상세 프로필 & 매칭
        </button>
      </div>
    </div>
  );
};

export default ShowhostCard;
