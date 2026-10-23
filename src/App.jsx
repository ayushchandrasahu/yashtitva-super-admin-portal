import React, { useState, useEffect } from 'react';
import AcademicBackground from './components/AcademicBackground';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import QuickActionModal from './components/QuickActionModal';

// Pages
import LoginPage from './pages/LoginPage';
import BusinessOverviewPage from './pages/BusinessOverviewPage';
import FinancialAnalyticsPage from './pages/FinancialAnalyticsPage';
import RegisteredCollegesPage from './pages/RegisteredCollegesPage';
import NewCollegeRegistrationPage from './pages/NewCollegeRegistrationPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import RevenuePaymentsPage from './pages/RevenuePaymentsPage';
import ExpensesProfitabilityPage from './pages/ExpensesProfitabilityPage';
import ComplaintsSupportPage from './pages/ComplaintsSupportPage';
import GrowthForecastingPage from './pages/GrowthForecastingPage';
import PlatformAnalyticsPage from './pages/PlatformAnalyticsPage';
import ReportsExportsPage from './pages/ReportsExportsPage';
import TeamAccessPage from './pages/TeamAccessPage';
import SettingsAuditPage from './pages/SettingsAuditPage';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('yashtitva_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('yashtitva_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/login');
  const [sessionMessage, setSessionMessage] = useState('');
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);

  // Layout states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [quickActionType, setQuickActionType] = useState(null); // 'expense', 'payment' or null

  // Badges count states
  const [pendingCount, setPendingCount] = useState(1);
  const [complaintsCount, setComplaintsCount] = useState(2);

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
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
          Initializing Yashtitva Super Admin & BI Command Center...
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

  return (
    <div className="command-center-shell">
      <AcademicBackground variant="dashboard" />
      
      {/* 12-Section Left Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={navigateTo}
        user={user}
        onLogout={() => handleLogout()}
        pendingVerificationCount={pendingCount}
        openComplaintsCount={complaintsCount}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className={`command-center-body ${isSidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
        <TopNavbar
          currentPath={currentPath}
          onNavigate={navigateTo}
          user={user}
          onLogout={() => handleLogout()}
          selectedPeriod={selectedPeriod}
          onSelectPeriod={setSelectedPeriod}
          onOpenQuickAction={(type) => setQuickActionType(type)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          token={token}
        />

        <main className="command-center-main-content">
          {/* 1. Business Overview Dashboard */}
          {(currentPath === '/super-admin' || currentPath === '/super-admin/overview') && (
            <BusinessOverviewPage
              onNavigate={navigateTo}
              token={token}
              selectedPeriod={selectedPeriod}
            />
          )}

          {/* 2. Financial Analytics — Profit or Loss */}
          {currentPath === '/super-admin/financial-analytics' && (
            <FinancialAnalyticsPage
              onNavigate={navigateTo}
              token={token}
              selectedPeriod={selectedPeriod}
              onOpenQuickAction={(type) => setQuickActionType(type)}
            />
          )}

          {/* 3. Colleges & Customers (Registered Colleges & Outstanding Licence Dues) */}
          {currentPath === '/super-admin/colleges' && (
            <RegisteredCollegesPage
              onNavigate={navigateTo}
              token={token}
            />
          )}

          {/* 3B. New College Registration Form */}
          {currentPath === '/super-admin/colleges/register' && (
            <NewCollegeRegistrationPage
              onNavigate={navigateTo}
              token={token}
            />
          )}

          {/* 4. Subscription Management */}
          {currentPath === '/super-admin/subscriptions' && (
            <SubscriptionsPage
              onNavigate={navigateTo}
              token={token}
            />
          )}

          {/* 5. Revenue & Payments */}
          {currentPath === '/super-admin/revenue-payments' && (
            <RevenuePaymentsPage
              onNavigate={navigateTo}
              token={token}
              onOpenQuickAction={(type) => setQuickActionType(type)}
            />
          )}

          {/* 6. Expenses & Profitability */}
          {currentPath === '/super-admin/expenses-profitability' && (
            <ExpensesProfitabilityPage
              onNavigate={navigateTo}
              token={token}
              onOpenQuickAction={(type) => setQuickActionType(type)}
            />
          )}

          {/* 7. Complaints & Support */}
          {currentPath === '/super-admin/complaints-support' && (
            <ComplaintsSupportPage
              onNavigate={navigateTo}
              token={token}
            />
          )}

          {/* 8. Growth & Forecasting */}
          {currentPath === '/super-admin/growth-forecasting' && (
            <GrowthForecastingPage
              onNavigate={navigateTo}
              token={token}
            />
          )}

          {/* 9. Platform Analytics */}
          {currentPath === '/super-admin/platform-analytics' && (
            <PlatformAnalyticsPage
              onNavigate={navigateTo}
              token={token}
            />
          )}

          {/* 10. Reports & Exports */}
          {currentPath === '/super-admin/reports-exports' && (
            <ReportsExportsPage
              onNavigate={navigateTo}
              token={token}
            />
          )}

          {/* 11. Team & Access Control */}
          {currentPath === '/super-admin/team-access' && (
            <TeamAccessPage
              onNavigate={navigateTo}
              token={token}
            />
          )}

          {/* 12. Settings & Audit Logs */}
          {currentPath === '/super-admin/settings-audit' && (
            <SettingsAuditPage
              onNavigate={navigateTo}
              token={token}
            />
          )}
        </main>
      </div>

      {/* Quick Action Modal (Add Expense / Record Payment) */}
      {quickActionType && (
        <QuickActionModal
          actionType={quickActionType}
          onClose={() => setQuickActionType(null)}
          token={token}
          onSuccess={() => {
            // Trigger state refresh if needed
          }}
        />
      )}
    </div>
  );
}
