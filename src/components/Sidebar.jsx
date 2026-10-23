import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  CreditCard,
  Receipt,
  Wallet,
  HelpCircle,
  LineChart,
  Activity,
  FileSpreadsheet,
  Users,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'overview', path: '/super-admin', label: 'Business Overview', icon: LayoutDashboard },
  { id: 'financial-analytics', path: '/super-admin/financial-analytics', label: 'Financial Analytics', icon: TrendingUp },
  { id: 'colleges', path: '/super-admin/colleges', label: 'Colleges & Customers', icon: Building2, hasBadge: 'pending' },
  { id: 'subscriptions', path: '/super-admin/subscriptions', label: 'Subscription Management', icon: CreditCard },
  { id: 'revenue-payments', path: '/super-admin/revenue-payments', label: 'Revenue & Payments', icon: Receipt },
  { id: 'expenses-profitability', path: '/super-admin/expenses-profitability', label: 'Expenses & Profitability', icon: Wallet },
  { id: 'complaints-support', path: '/super-admin/complaints-support', label: 'Complaints & Support', icon: HelpCircle, hasBadge: 'complaints' },
  { id: 'growth-forecasting', path: '/super-admin/growth-forecasting', label: 'Growth & Forecasting', icon: LineChart },
  { id: 'platform-analytics', path: '/super-admin/platform-analytics', label: 'Platform Analytics', icon: Activity },
  { id: 'reports-exports', path: '/super-admin/reports-exports', label: 'Reports & Exports', icon: FileSpreadsheet },
  { id: 'team-access', path: '/super-admin/team-access', label: 'Team & Access Control', icon: Users },
  { id: 'settings-audit', path: '/super-admin/settings-audit', label: 'Settings & Audit Logs', icon: Settings },
];

export default function Sidebar({
  currentPath,
  onNavigate,
  user,
  onLogout,
  pendingVerificationCount = 0,
  openComplaintsCount = 0,
  collapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile
}) {
  const isItemActive = (itemPath) => {
    if (itemPath === '/super-admin') {
      return currentPath === '/super-admin' || currentPath === '/super-admin/overview';
    }
    return currentPath.startsWith(itemPath);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`command-center-sidebar ${collapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-container">
          <div 
            className="sidebar-brand-logo-wrapper"
            onClick={() => onNavigate('/super-admin')}
            title="Yashtitva Super Admin Command Center"
          >
            <img 
              src="/yashtitva-logo.png" 
              alt="Yashtitva Logo" 
              className="sidebar-brand-logo" 
            />
            {!collapsed && (
              <div className="sidebar-brand-meta">
                <span className="sidebar-brand-title">YASHTITVA</span>
                <span className="sidebar-brand-subtitle">Business Command Center</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Platform Role Pill */}
        {!collapsed && (
          <div className="sidebar-role-pill-wrap">
            <div className="sidebar-role-pill">
              <ShieldCheck size={14} className="sidebar-role-icon" />
              <span>PLATFORM OWNER PORTAL</span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="sidebar-nav-container" aria-label="Main Navigation">
          <div className="sidebar-nav-section-label">
            {!collapsed ? 'COMMAND & INTELLIGENCE' : '•••'}
          </div>

          <ul className="sidebar-nav-list">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.path);

              let badgeContent = null;
              if (item.hasBadge === 'pending' && pendingVerificationCount > 0) {
                badgeContent = (
                  <span className="sidebar-nav-badge warning" title={`${pendingVerificationCount} pending verifications`}>
                    {pendingVerificationCount}
                  </span>
                );
              } else if (item.hasBadge === 'complaints' && openComplaintsCount > 0) {
                badgeContent = (
                  <span className="sidebar-nav-badge danger" title={`${openComplaintsCount} active complaints`}>
                    {openComplaintsCount}
                  </span>
                );
              }

              return (
                <li key={item.id} className="sidebar-nav-item">
                  <button
                    type="button"
                    className={`sidebar-nav-link ${active ? 'active' : ''}`}
                    onClick={() => {
                      onNavigate(item.path);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="sidebar-nav-icon" />
                    {!collapsed && (
                      <>
                        <span className="sidebar-nav-text">{item.label}</span>
                        {badgeContent}
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="sidebar-footer">
          {!collapsed ? (
            <div className="sidebar-user-card">
              <div className="sidebar-user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="sidebar-user-details">
                <span className="sidebar-user-name">{user?.name || 'Super Admin'}</span>
                <span className="sidebar-user-role">Founder & Platform Owner</span>
              </div>
              <button
                type="button"
                className="sidebar-logout-btn"
                onClick={onLogout}
                title="End Super Admin Session"
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="sidebar-logout-btn-collapsed"
              onClick={onLogout}
              title="End Super Admin Session"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
