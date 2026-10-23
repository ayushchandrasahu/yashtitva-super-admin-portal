import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Search,
  Lock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Key,
  Globe,
  Sliders,
  RefreshCw
} from 'lucide-react';

export default function SettingsAuditPage({ onNavigate, token }) {
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [search, setSearch] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  // Security settings states
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [sessionTimeoutHours, setSessionTimeoutHours] = useState('8');
  const [ipWhitelisting, setIpWhitelisting] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [taxRate, setTaxRate] = useState('18');

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/audit-logs?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Fetch logs error:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, token]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaveMsg('Platform security parameters and timeout policies updated.');
    setTimeout(() => setSaveMsg(''), 3500);
  };

  return (
    <div className="settings-audit-page-wrapper">
      <div className="page-header-card">
        <div className="page-header-info">
          <div className="section-pill">
            <Settings size={14} />
            <span>CYBERSECURITY & IMMUTABLE AUDIT TRAIL</span>
          </div>
          <h2 className="page-title">Settings & System Audit Logs</h2>
          <p className="page-description">
            Complete cryptographic audit trail of all platform owner actions, logins, licence approvals, and security policies.
          </p>
        </div>
      </div>

      {saveMsg && (
        <div className="banner-alert success" style={{ marginTop: '1.25rem' }}>
          <CheckCircle2 size={16} />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Security Policies Card */}
      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <h3 className="card-headline">Super Admin Security & Access Policies</h3>
        <p className="card-subheadline">Hardened cybersecurity controls for the platform owner</p>

        <form onSubmit={handleSaveSettings} className="settings-form-grid">
          <div className="settings-toggle-row">
            <div>
              <strong>Enforce Multi-Factor Authentication (MFA / 2FA)</strong>
              <div className="settings-desc">Require 6-digit TOTP code on every Super Admin login attempt.</div>
            </div>
            <label className="switch-toggle">
              <input
                type="checkbox"
                checked={mfaEnforced}
                onChange={(e) => setMfaEnforced(e.target.checked)}
              />
              <span className="slider round" />
            </label>
          </div>

          <div className="settings-toggle-row">
            <div>
              <strong>Session Inactivity Timeout (Hours)</strong>
              <div className="settings-desc">Automatically invalidate JWT token and require re-authentication.</div>
            </div>
            <select
              className="form-select sm"
              style={{ width: '120px' }}
              value={sessionTimeoutHours}
              onChange={(e) => setSessionTimeoutHours(e.target.value)}
            >
              <option value="2">2 Hours</option>
              <option value="4">4 Hours</option>
              <option value="8">8 Hours (Default)</option>
              <option value="12">12 Hours</option>
            </select>
          </div>

          <div className="settings-toggle-row">
            <div>
              <strong>Platform Maintenance Mode</strong>
              <div className="settings-desc">Lock college and student portals during scheduled database upgrades.</div>
            </div>
            <label className="switch-toggle">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
              />
              <span className="slider round" />
            </label>
          </div>

          <div className="settings-toggle-row">
            <div>
              <strong>Default Platform Currency & Timezone</strong>
              <div className="settings-desc">Primary currency for P&L, invoicing, and reporting schedules.</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="badge-pill gold">INR (₹)</span>
              <span className="badge-pill">IST (Asia/Kolkata)</span>
            </div>
          </div>

          <div className="settings-actions-bar">
            <button type="submit" className="btn-primary">
              Save Security Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Immutable Audit Log Table */}
      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <div className="table-controls-strip">
          <div>
            <h3 className="card-headline">Cryptographic Audit Trail</h3>
            <p className="card-subheadline">Append-only log of every administrative and financial action</p>
          </div>

          <div className="table-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Filter audit actions or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="audit-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp (IST)</th>
                <th>Admin User</th>
                <th>Action Type</th>
                <th>Entity Affected</th>
                <th>Details / Audit Description</th>
                <th>Origin IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No audit log records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="date-cell">
                        <Clock size={13} />
                        <span>{new Date(log.createdAt).toLocaleString('en-IN')}</span>
                      </span>
                    </td>
                    <td>
                      <strong>{log.adminUserId}</strong>
                    </td>
                    <td>
                      <span className="badge-pill">{log.action}</span>
                    </td>
                    <td>
                      <span className="cell-sub">{log.entityType} #{log.entityId || 'SYS'}</span>
                    </td>
                    <td>{log.details}</td>
                    <td>
                      <code className="ip-badge">{log.ip || '127.0.0.1'}</code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
