import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import SuperAdminHomePage from './pages/SuperAdminHomePage';
import NewCollegeRegistrationPage from './pages/NewCollegeRegistrationPage';
import RegisteredCollegesPage from './pages/RegisteredCollegesPage';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('yashtitva_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('yashtitva_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/login');
  const [sessionMessage, setSessionMessage] = useState('');
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);

  // Sync browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Verify session on mount
  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        setIsVerifyingSession(false);
        if (currentPath !== '/login') {
          navigateTo('/login');
        }
        return;
      }

      try {
        const res = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const data = await res.json();
          handleLogout(data.message || 'Session expired. Please log in.');
          return;
        }

        const data = await res.json();
        setUser(data.user);
        // If logged in and at / or /login, redirect to /super-admin
        if (currentPath === '/login' || currentPath === '/') {
          navigateTo('/super-admin');
        }
      } catch (err) {
        console.error('Session verify error:', err);
      } finally {
        setIsVerifyingSession(false);
      }
    };

    verifyAuth();
  }, [token]);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('yashtitva_token', newToken);
    localStorage.setItem('yashtitva_user', JSON.stringify(newUser));
    setSessionMessage('');
    navigateTo('/super-admin');
  };

  const handleLogout = (msg = '') => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('yashtitva_token');
    localStorage.removeItem('yashtitva_user');
    setSessionMessage(msg);
    navigateTo('/login');
  };

  if (isVerifyingSession) {
    return (
      <div className="login-page-wrapper" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Initializing Yashtitva Super Admin Portal...
        </p>
      </div>
    );
  }

  // Route protection
  const isAuth = !!token && !!user;

  // Render Login page if not authenticated or path is /login
  if (!isAuth || currentPath === '/login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        sessionMessage={sessionMessage}
      />
    );
  }

  // Authenticated Pages with Yashtitva brand header
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        user={user}
        onLogout={() => handleLogout()}
        onNavigate={navigateTo}
        currentPath={currentPath}
      />

      <div style={{ flex: 1 }}>
        {currentPath === '/super-admin' && (
          <SuperAdminHomePage onNavigate={navigateTo} />
        )}

        {currentPath === '/super-admin/colleges/register' && (
          <NewCollegeRegistrationPage
            onNavigate={navigateTo}
            token={token}
          />
        )}

        {currentPath === '/super-admin/colleges' && (
          <RegisteredCollegesPage
            onNavigate={navigateTo}
            token={token}
          />
        )}

        {/* Fallback route */}
        {currentPath !== '/super-admin' &&
         currentPath !== '/super-admin/colleges/register' &&
         currentPath !== '/super-admin/colleges' && (
          <SuperAdminHomePage onNavigate={navigateTo} />
        )}
      </div>
    </div>
  );
}
