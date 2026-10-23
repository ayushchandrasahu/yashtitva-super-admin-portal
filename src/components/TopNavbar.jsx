import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Calendar,
  Plus,
  ChevronDown,
  User,
  ShieldAlert,
  CheckCircle,
  FileText,
  Clock,
  Menu,
  X,
  CreditCard,
  Building2,
  Receipt,
  HelpCircle
} from 'lucide-react';

export const PERIOD_OPTIONS = [
  { id: '30d', label: 'Last 30 Days' },
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 Days' },
  { id: 'this_month', label: 'Current Month (Oct 2026)' },
  { id: 'last_month', label: 'Previous Month (Sep 2026)' },
  { id: 'fy26_27', label: 'Financial Year 2026-27' },
  { id: 'custom', label: 'Custom Date Range' }
];

export default function TopNavbar({
  currentPath,
  onNavigate,
  user,
  onLogout,
  selectedPeriod,
  onSelectPeriod,
  onOpenQuickAction,
  onToggleMobileSidebar,
  token
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const periodRef = useRef(null);
  const profileRef = useRef(null);
  const quickRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setIsSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotificationsOpen(false);
      if (periodRef.current && !periodRef.current.contains(e.target)) setIsPeriodOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
      if (quickRef.current && !quickRef.current.contains(e.target)) setIsQuickActionOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.results || []);
          setIsSearchOpen(true);
        }
      } catch (err) {
        console.error('Omnisearch error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, token]);

  // Derive page title and breadcrumbs
  const getPageInfo = () => {
    if (currentPath.includes('/financial-analytics')) return { title: 'Financial Analytics & Profit/Loss', section: 'Finance' };
    if (currentPath.includes('/colleges/register')) return { title: 'Register New College Application', section: 'Colleges' };
    if (currentPath.includes('/colleges')) return { title: 'Colleges & Institutional Customers', section: 'Directory' };
    if (currentPath.includes('/subscriptions')) return { title: 'Campus Subscription Management', section: 'Subscriptions' };
    if (currentPath.includes('/revenue-payments')) return { title: 'Revenue, Payments & GST Invoices', section: 'Billing' };
    if (currentPath.includes('/expenses-profitability')) return { title: 'Operating Expenses & Profitability', section: 'Finance' };
    if (currentPath.includes('/complaints-support')) return { title: 'Institutional Complaints & Support SLA', section: 'Support Desk' };
    if (currentPath.includes('/growth-forecasting')) return { title: 'ARR Growth & SaaS Unit Economics', section: 'Intelligence' };
    if (currentPath.includes('/platform-analytics')) return { title: 'Platform Telemetry & Infrastructure', section: 'System' };
    if (currentPath.includes('/reports-exports')) return { title: 'Financial Reports & Master Data Exports', section: 'Compliance' };
    if (currentPath.includes('/team-access')) return { title: 'Super Admin Team & Role Access Control', section: 'Administration' };
    if (currentPath.includes('/settings-audit')) return { title: 'Audit Trail & Platform Security Settings', section: 'Security' };
    return { title: 'Business Overview & Executive Command', section: 'Overview' };
  };

  const { title, section } = getPageInfo();

  const handleSearchResultClick = (result) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (result.type === 'college') onNavigate('/super-admin/colleges');
    else if (result.type === 'invoice') onNavigate('/super-admin/revenue-payments');
    else if (result.type === 'complaint') onNavigate('/super-admin/complaints-support');
    else if (result.type === 'expense') onNavigate('/super-admin/expenses-profitability');
  };

  return (
    <header className="command-center-topbar">
      {/* Mobile Menu Toggle & Title */}
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-mobile-hamburger"
          onClick={onToggleMobileSidebar}
          aria-label="Open Navigation"
        >
          <Menu size={20} />
        </button>

        <div className="topbar-breadcrumb-wrap">
          <div className="topbar-breadcrumb">
            <span className="breadcrumb-root">YASHTITVA</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-section">{section}</span>
          </div>
          <h1 className="topbar-page-title">{title}</h1>
        </div>
      </div>

      {/* Center: Global Omnisearch */}
      <div className="topbar-center" ref={searchRef}>
        <div className="topbar-search-input-box">
          <Search size={16} className="topbar-search-icon" />
          <input
            type="text"
            className="topbar-search-input"
            placeholder="Search colleges, invoices, tickets, expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setIsSearchOpen(true); }}
          />
          {searchQuery && (
            <button
              type="button"
              className="topbar-search-clear"
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchOpen && (
          <div className="topbar-search-dropdown">
            {isSearching ? (
              <div className="topbar-search-empty">Searching Yashtitva platform database...</div>
            ) : searchResults.length === 0 ? (
              <div className="topbar-search-empty">No results found for "{searchQuery}"</div>
            ) : (
              <div className="topbar-search-results-list">
                {searchResults.map((item, idx) => (
                  <div
                    key={`${item.type}-${item.id || idx}`}
                    className="topbar-search-result-row"
                    onClick={() => handleSearchResultClick(item)}
                  >
                    <div className="search-result-icon">
                      {item.type === 'college' && <Building2 size={16} />}
                      {item.type === 'invoice' && <Receipt size={16} />}
                      {item.type === 'complaint' && <HelpCircle size={16} />}
                      {item.type === 'expense' && <CreditCard size={16} />}
                    </div>
                    <div className="search-result-info">
                      <div className="search-result-title">
                        {item.name || item.invoiceNumber || item.subject || item.vendor}
                      </div>
                      <div className="search-result-meta">
                        <span className={`search-type-badge ${item.type}`}>
                          {item.type.toUpperCase()}
                        </span>
                        {item.collegeCode && <span>Code: {item.collegeCode}</span>}
                        {item.state && <span>{item.district}, {item.state}</span>}
                        {item.totalAmount && <span>Total: ₹{Number(item.totalAmount).toLocaleString()}</span>}
                        {item.amount && <span>₹{Number(item.amount).toLocaleString()}</span>}
                        {item.status && <span className="status-subtle">({item.status})</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions: Period Filter, Notifications, Quick Actions, Profile */}
      <div className="topbar-right">
        {/* Reporting Period Selector */}
        <div className="topbar-dropdown-anchor" ref={periodRef}>
          <button
            type="button"
            className="topbar-action-btn period-btn"
            onClick={() => setIsPeriodOpen(!isPeriodOpen)}
            title="Filter reporting period"
          >
            <Calendar size={15} />
            <span className="period-label">
              {PERIOD_OPTIONS.find((p) => p.id === selectedPeriod)?.label || 'Last 30 Days'}
            </span>
            <ChevronDown size={14} />
          </button>

          {isPeriodOpen && (
            <div className="topbar-menu-dropdown period-dropdown">
              <div className="dropdown-header">REPORTING PERIOD (IST)</div>
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`dropdown-menu-item ${selectedPeriod === opt.id ? 'active' : ''}`}
                  onClick={() => {
                    onSelectPeriod(opt.id);
                    setIsPeriodOpen(false);
                  }}
                >
                  <span>{opt.label}</span>
                  {selectedPeriod === opt.id && <CheckCircle size={14} className="dropdown-check-icon" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action Button */}
        <div className="topbar-dropdown-anchor" ref={quickRef}>
          <button
            type="button"
            className="topbar-action-btn quick-action-btn"
            onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
            title="Quick Creation Actions"
          >
            <Plus size={16} />
            <span>Create</span>
            <ChevronDown size={14} />
          </button>

          {isQuickActionOpen && (
            <div className="topbar-menu-dropdown quick-action-dropdown">
              <div className="dropdown-header">QUICK SAAS ACTIONS</div>
              <button
                type="button"
                className="dropdown-menu-item"
                onClick={() => {
                  setIsQuickActionOpen(false);
                  if (onOpenQuickAction) onOpenQuickAction('expense');
                }}
              >
                <CreditCard size={15} />
                <span>+ Add Operating Expense</span>
              </button>
              <button
                type="button"
                className="dropdown-menu-item"
                onClick={() => {
                  setIsQuickActionOpen(false);
                  onNavigate('/super-admin/colleges/register');
                }}
              >
                <Building2 size={15} />
                <span>+ Register New College</span>
              </button>
              <button
                type="button"
                className="dropdown-menu-item"
                onClick={() => {
                  setIsQuickActionOpen(false);
                  if (onOpenQuickAction) onOpenQuickAction('payment');
                }}
              >
                <Receipt size={15} />
                <span>+ Record College Payment</span>
              </button>
              <button
                type="button"
                className="dropdown-menu-item"
                onClick={() => {
                  setIsQuickActionOpen(false);
                  onNavigate('/super-admin/reports-exports');
                }}
              >
                <FileText size={15} />
                <span>Download P&L Statement</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="topbar-dropdown-anchor" ref={notifRef}>
          <button
            type="button"
            className="topbar-icon-btn notification-btn"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            title="Live System Notifications"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="notification-bubble">2</span>
          </button>

          {isNotificationsOpen && (
            <div className="topbar-menu-dropdown notifications-dropdown">
              <div className="dropdown-header flex-between">
                <span>SYSTEM ALERTS</span>
                <span className="notif-count-label">2 Unresolved</span>
              </div>
              <div className="notif-items-list">
                <div 
                  className="notif-item unread warning"
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    onNavigate('/super-admin/complaints-support');
                  }}
                >
                  <ShieldAlert size={16} className="notif-item-icon warning" />
                  <div className="notif-item-content">
                    <div className="notif-title">Invoice GST Clarification</div>
                    <div className="notif-desc">VJTI requested split CGST/SGST invoice breakdown to release ₹1.20L balance.</div>
                    <div className="notif-time">2 hours ago • Ticket TCK-2026-881</div>
                  </div>
                </div>

                <div 
                  className="notif-item unread info"
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    onNavigate('/super-admin/colleges');
                  }}
                >
                  <Building2 size={16} className="notif-item-icon info" />
                  <div className="notif-item-content">
                    <div className="notif-title">College Verification Pending</div>
                    <div className="notif-desc">MIT-WPU submitted AICTE government order document for platform access approval.</div>
                    <div className="notif-time">Yesterday • Legal Review Needed</div>
                  </div>
                </div>
              </div>
              <div className="dropdown-footer">
                <button
                  type="button"
                  className="dropdown-footer-link"
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    onNavigate('/super-admin/settings-audit');
                  }}
                >
                  View Full Audit Log →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Super Admin Profile Menu */}
        <div className="topbar-dropdown-anchor" ref={profileRef}>
          <button
            type="button"
            className="topbar-profile-btn"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            title="Super Admin Profile"
          >
            <div className="profile-btn-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="profile-btn-text">
              <span className="profile-name">{user?.name || 'Super Admin'}</span>
              <span className="profile-badge">PLATFORM OWNER</span>
            </div>
            <ChevronDown size={14} className="profile-chevron" />
          </button>

          {isProfileOpen && (
            <div className="topbar-menu-dropdown profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-name">{user?.name || 'Super Admin'}</div>
                <div className="profile-dropdown-user-id">{user?.userId || 'admin'} • Super Admin</div>
                <div className="profile-dropdown-timezone">IST (UTC+05:30) • INR (₹)</div>
              </div>
              <div className="profile-menu-links">
                <button
                  type="button"
                  className="dropdown-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate('/super-admin/settings-audit');
                  }}
                >
                  <Clock size={15} />
                  <span>Security & Audit Trail</span>
                </button>
                <button
                  type="button"
                  className="dropdown-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate('/super-admin/team-access');
                  }}
                >
                  <User size={15} />
                  <span>Team & Permissions</span>
                </button>
                <div className="dropdown-divider" />
                <button
                  type="button"
                  className="dropdown-menu-item danger"
                  onClick={onLogout}
                >
                  <span>Sign Out of Command Center</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
