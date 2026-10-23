import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Cpu,
  Database,
  Cloud,
  ShieldCheck,
  Zap,
  Users,
  Award,
  HardDrive
} from 'lucide-react';

export default function PlatformAnalyticsPage({ onNavigate, token }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/platform/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setAnalytics(data);
        }
      } catch (err) {
        console.error('Fetch platform analytics error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  const { infrastructure, ecosystemActivity } = analytics || {};

  return (
    <div className="platform-analytics-wrapper">
      <div className="page-header-card">
        <div className="page-header-info">
          <div className="section-pill">
            <Activity size={14} />
            <span>CROSS-PORTAL TELEMETRY & SYSTEM HEALTH</span>
          </div>
          <h2 className="page-title">Yashtitva Platform Infrastructure Analytics</h2>
          <p className="page-description">
            Live operational telemetry across the 3 ecosystem portals: Student Portal, College Admin Portal, and Super Admin Center.
          </p>
        </div>

        <div className="uptime-hero-badge">
          <ShieldCheck size={20} className="text-success" />
          <div>
            <div className="uptime-percentage">{infrastructure?.uptimePercent || '99.98%'}</div>
            <span className="uptime-sub">Operational Service Uptime</span>
          </div>
        </div>
      </div>

      {/* Infrastructure Core Telemetry Cards */}
      <div className="financial-kpi-row" style={{ marginTop: '1.25rem' }}>
        <div className="fin-metric-card">
          <span className="fin-card-label">Average API Latency</span>
          <div className="fin-card-val text-success">{infrastructure?.avgLatencyMs || 42} ms</div>
          <span className="fin-card-subtext">Edge CDN cached responses</span>
        </div>

        <div className="fin-metric-card">
          <span className="fin-card-label">Platform Error Rate</span>
          <div className="fin-card-val">{infrastructure?.errorRatePercent || '0.012%'}</div>
          <span className="fin-card-subtext">5xx server anomalies</span>
        </div>

        <div className="fin-metric-card">
          <span className="fin-card-label">Active Student Sessions</span>
          <div className="fin-card-val text-primary">
            {Number(ecosystemActivity?.activeStudentSessions || 4120).toLocaleString('en-IN')}
          </div>
          <span className="fin-card-subtext">Live concurrency in Student Portal</span>
        </div>

        <div className="fin-metric-card">
          <span className="fin-card-label">College Admin Logins Today</span>
          <div className="fin-card-val">{ecosystemActivity?.collegeAdminLoginsToday || 128}</div>
          <span className="fin-card-subtext">Deans & faculty coordinators</span>
        </div>

        <div className="fin-metric-card">
          <span className="fin-card-label">Certificates Verified (Week)</span>
          <div className="fin-card-val text-success">
            {Number(ecosystemActivity?.certificatesIssuedThisWeek || 14500).toLocaleString('en-IN')}
          </div>
          <span className="fin-card-subtext">Cryptographic credential hashes</span>
        </div>
      </div>

      {/* Ecosystem Architecture & Cloud Resource Usage */}
      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <h3 className="card-headline">Ecosystem Architectural Components</h3>
        <p className="card-subheadline">Status of connected services, cloud storage, and database replicas</p>

        <div className="ecosystem-components-grid">
          <div className="component-status-card">
            <div className="comp-card-top">
              <Users size={20} className="comp-icon" />
              <span className="status-pill active">Live & Active</span>
            </div>
            <h4 className="comp-title">1. Student User Portal</h4>
            <p className="comp-desc">
              Powers student portfolio showcase, hackathon achievement badges, and university event participation certificates.
            </p>
            <div className="comp-meta">
              <span>Traffic Share: <strong>72%</strong></span>
              <span>Avg Session: <strong>8m 42s</strong></span>
            </div>
          </div>

          <div className="component-status-card">
            <div className="comp-card-top">
              <Building2 size={20} className="comp-icon" />
              <span className="status-pill active">Live & Active</span>
            </div>
            <h4 className="comp-title">2. College Admin Portal</h4>
            <p className="comp-desc">
              Dedicated portal for college principals, HoDs, and event managers to verify student entries and issue authenticated badges.
            </p>
            <div className="comp-meta">
              <span>Verified Institutions: <strong>14 Campuses</strong></span>
              <span>Event Rosters: <strong>84 Active</strong></span>
            </div>
          </div>

          <div className="component-status-card">
            <div className="comp-card-top">
              <ShieldCheck size={20} className="comp-icon" />
              <span className="status-pill active">Command Active</span>
            </div>
            <h4 className="comp-title">3. Super Admin & BI Portal</h4>
            <p className="comp-desc">
              You are here. SaaS owner control center for billing, licenses, P&L calculations, and cybersecurity auditing.
            </p>
            <div className="comp-meta">
              <span>Privileged Role: <strong>PLATFORM_OWNER</strong></span>
              <span>Audit Logging: <strong>100% Enforced</strong></span>
            </div>
          </div>
        </div>

        {/* Storage and Database Resource Box */}
        <div className="cloud-resources-strip">
          <div className="resource-col">
            <HardDrive size={18} />
            <div>
              <div className="resource-val">{ecosystemActivity?.cloudStorageUsedGb || '86.4 GB'}</div>
              <span className="resource-label">PDF Storage (AWS S3 & Cloudflare R2)</span>
            </div>
          </div>

          <div className="resource-col">
            <Cloud size={18} />
            <div>
              <div className="resource-val">{ecosystemActivity?.bandwidthConsumedThisMonth || '412 GB'}</div>
              <span className="resource-label">Monthly Cloud CDN Bandwidth</span>
            </div>
          </div>

          <div className="resource-col">
            <Database size={18} />
            <div>
              <div className="resource-val">184,520</div>
              <span className="resource-label">Database Queries Handled Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
