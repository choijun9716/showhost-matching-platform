import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import ProfileEdit from './pages/ProfileEdit';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');

  const handleNavigateToLogin = () => {
    setActiveTab('login');
  };

  const handleAuthSuccess = () => {
    setActiveTab('home');
  };

  // Render Page based on active tab
  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile-edit':
        return <ProfileEdit />;
      case 'login':
        return <Login onAuthSuccess={handleAuthSuccess} />;
      case 'home':
      default:
        return <Home onNavigateToLogin={handleNavigateToLogin} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Page Area */}
      <main style={{ flex: 1, padding: '10px 0' }}>
        {renderPage()}
      </main>

      {/* Footer */}
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
          <p>© {new Date().getFullYear()} SHOWLINK. All rights reserved. Premium Showhost Live Commerce Matchmaking Hub.</p>
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
