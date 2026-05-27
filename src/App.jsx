import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import ProfileEdit from './pages/ProfileEdit';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import CampaignCreate from './pages/CampaignCreate';
import CampaignDashboard from './pages/CampaignDashboard';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const { user } = useAuth();

  const handleNavigateToLogin = () => setActiveTab('login');
  const handleAuthSuccess = () => setActiveTab('home');

  const renderPage = () => {
    switch (activeTab) {
      case 'admin':
        return <Admin onNavigateToCampaignCreate={() => setActiveTab('campaign-create')} />;
      case 'dashboard':
        // 파트너사(client)는 캠페인 대시보드로
        if (user?.role === 'client') {
          return (
            <div className="container animate-fade-in" style={{ paddingBottom: '80px' }}>
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>캠페인 관리</h1>
                <p style={{ color: 'hsl(var(--foreground-muted))' }}>
                  캠페인을 생성하고 쇼호스트에게 제안을 보내세요.
                </p>
              </div>
              <CampaignDashboard onCreateCampaign={() => setActiveTab('campaign-create')} />
            </div>
          );
        }
        return <Dashboard />;
      case 'campaign-create':
        return (
          <CampaignCreate
            onBack={() => setActiveTab('dashboard')}
            onCreated={() => setActiveTab('dashboard')}
          />
        );
      case 'profile-edit':
        return <ProfileEdit />;
      case 'login':
        return <Login onAuthSuccess={handleAuthSuccess} />;
      case 'home':
      default:
        return (
          <Home
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateToCampaignCreate={() => setActiveTab('campaign-create')}
          />
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ flex: 1, padding: '10px 0' }}>
        {renderPage()}
      </main>
      <footer style={{
        padding: '30px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'hsl(var(--foreground-muted))',
        background: 'rgba(5, 7, 13, 0.4)',
        marginTop: 'auto'
      }}>
        <div className="container">
          <p>© {new Date().getFullYear()} SHOWLAB. All rights reserved. Premium Showhost Live Commerce Matchmaking Hub.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
