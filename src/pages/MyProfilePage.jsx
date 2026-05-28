import React, { useState, useEffect } from 'react';
import PortfolioView from '../components/PortfolioView';
import { api } from '../supabaseClient';
import { Loader2 } from 'lucide-react';

const MyProfilePage = ({ user, setActiveTab }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.profiles.get(user.id);
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Loader2 className="animate-spin" size={32} color="#ffffff" />
      </div>
    );
  }

  if (!profile) return <div style={{textAlign: 'center', padding: '100px'}}>프로필을 찾을 수 없습니다.</div>;

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '80px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>내 프로필</h1>
        <p style={{ color: 'hsl(var(--foreground-muted))' }}>
          파트너사에게 보여지는 내 프로필 상세 화면입니다.
        </p>
      </div>
      <PortfolioView 
        host={profile} 
        onClose={() => setActiveTab('dashboard')} 
        onSendProposal={() => setActiveTab('profile-edit')} 
        isOwnProfile={true} 
      />
    </div>
  );
};

export default MyProfilePage;
