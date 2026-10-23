import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  CreditCard,
  Receipt,
  Wallet,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Sparkles,
  BarChart3,
  Calendar
} from 'lucide-react';

export default function BusinessOverviewPage({ onNavigate, token, selectedPeriod }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOverview = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/dashboard/overview?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
        setError('');
      } else {
        setError(json.message || 'Failed to load business dashboard.');
      }
    } catch (err) {
      setError('Unable to connect to analytics server.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [selectedPeriod, token]);

  const formatValue = (val, format) => {
    if (val === undefined || val === null) return '—';
    if (format === 'currency') {
      const isNegative = val < 0;
      const absVal = Math.abs(val);
      const formatted = absVal.toLocaleString('en-IN');
      return `${isNegative ? '-' : ''}₹${formatted}`;
    }
    if (format === 'percent') {
      return `${val}%`;
    }
    return Number(val).toLocaleString('en-IN');
  };

  const getKPIIcon = (id) => {
    switch (id) {
      case 'total_colleges':
      case 'active_paying_colleges':
      case 'trial_colleges':
        return <Building2 size={18} />;
      case 'active_subscriptions':
        return <CreditCard size={18} />;
      case 'mrr':
      case 'arr_estimate':
        return <TrendingUp size={18} />;
      case 'total_collected':
      case 'outstanding_invoices':
        return <Receipt size={18} />;
      case 'monthly_expenses':
      case 'monthly_profit':
        return <Wallet size={18} />;
      case 'unresolved_complaints':
        return <HelpCircle size={18} />;
      case 'renewal_rate':
        return <Layers size={18} />;
      default:
        return <BarChart3 size={18} />;
    }
  };

  if (loading && !data) {
    return (
      <div className="dashboard-loading-state">
        <RefreshCw size={28} className="spin-animation" />
        <p>Synthesizing SaaS financial metrics and college intelligence...</p>
      </div>
    );
  }

  return (
    <div className="overview-page-wrapper">
      {/* Top Banner / Control Strip */}
      <div className="overview-header-strip">
        <div className="overview-header-left">
          <div className="executive-badge">
            <Sparkles size={14} className="sparkle-icon" />
            <span>SAAS EXECUTIVE COMMAND CENTER</span>
          </div>
          <h2 className="overview-headline">Platform Financial Health & Business Intelligence</h2>
          <p className="overview-subheadline">
            Centralized control center for Yashtitva SaaS ecosystem performance, recurring subscriptions, institution cash flows, and operating costs.
          </p>
        </div>

        <div className="overview-header-right">
          <div className="reporting-meta-badge">
            <span className="meta-dot live" />
            <span>IST Realtime Sync</span>
            <span className="meta-pipe">•</span>
            <span>Currency: INR (₹)</span>
          </div>
          <button
            type="button"
            className="btn-refresh"
            onClick={fetchOverview}
            disabled={isRefreshing}
            title="Refresh database metrics"
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin-animation' : ''} />
            <span>{isRefreshing ? 'Updating...' : 'Refresh Feed'}</span>
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="banner-alert error" role="alert">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Executive Alerts Carousel / Alert Banners */}
      {data?.executiveAlerts && data.executiveAlerts.length > 0 && (
        <div className="executive-alerts-container">
          {data.executiveAlerts.map((alert, idx) => (
            <div key={idx} className={`executive-alert-card ${alert.type}`}>
              <div className="alert-card-left">
                {alert.type === 'warning' && <AlertTriangle size={18} className="alert-card-icon warning" />}
                {alert.type === 'info' && <ShieldAlert size={18} className="alert-card-icon info" />}
                {alert.type === 'success' && <CheckCircle2 size={18} className="alert-card-icon success" />}
                <div className="alert-card-body">
                  <div className="alert-card-title">{alert.title}</div>
                  <div className="alert-card-msg">{alert.message}</div>
                </div>
              </div>
              {alert.actionLink && (
                <button
                  type="button"
                  className="alert-card-btn"
                  onClick={() => onNavigate(alert.actionLink)}
                >
                  <span>{alert.actionText}</span>
                  <ArrowUpRight size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 12 Master Business KPI Grid */}
      <div className="kpi-section-container">
        <div className="section-title-strip">
          <h3 className="kpi-grid-heading">Executive Key Performance Indicators</h3>
          <span className="kpi-filter-tag">
            <Calendar size={13} />
            <span>Filtered for: {selectedPeriod.toUpperCase()}</span>
          </span>
        </div>

        <div className="kpi-grid-12">
          {data?.kpis?.map((kpi) => {
            const isNegativeProfit = kpi.id === 'monthly_profit' && kpi.value < 0;
            const isPositiveProfit = kpi.id === 'monthly_profit' && kpi.value > 0;
            const isWarningCard = kpi.id === 'outstanding_invoices' || kpi.trend === 'warning';

            return (
              <div
                key={kpi.id}
                className={`kpi-card ${isNegativeProfit ? 'profit-negative' : ''} ${isPositiveProfit ? 'profit-positive' : ''}`}
                onClick={() => kpi.link && onNavigate(kpi.link)}
                role="button"
                tabIndex={0}
                title={`Click to open ${kpi.label}`}
              >
                <div className="kpi-card-header">
                  <div className="kpi-icon-wrapper">
                    {getKPIIcon(kpi.id)}
                  </div>
                  <div className="kpi-header-badges">
                    <span className="kpi-data-badge">{kpi.badge}</span>
                    <span className={`kpi-trend-pill ${kpi.trend}`}>
                      {kpi.trend === 'up' && <TrendingUp size={12} />}
                      {kpi.trend === 'down' && <TrendingDown size={12} />}
                      {kpi.trend === 'warning' && <AlertTriangle size={12} />}
                      <span>{kpi.percentChange}</span>
                    </span>
                  </div>
                </div>

                <div className="kpi-card-body">
                  <span className="kpi-label">{kpi.label}</span>
                  <div className={`kpi-value ${isNegativeProfit ? 'value-danger' : ''} ${isPositiveProfit ? 'value-success' : ''}`}>
                    {formatValue(kpi.value, kpi.format)}
                  </div>
                </div>

                <div className="kpi-card-footer">
                  <span className="kpi-subtext">{kpi.subtext}</span>
                  <span className="kpi-jump-icon">
                    <ArrowUpRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Business Command Intelligence Blocks */}
      <div className="overview-intelligence-grid">
        {/* Quick Insights & Performance Summary */}
        <div className="dashboard-card intel-card">
          <div className="intel-card-header">
            <div>
              <h3 className="card-headline">Business Operational Insights</h3>
              <p className="card-subheadline">Key drivers powering the Yashtitva SaaS platform in 2026</p>
            </div>
            <button
              type="button"
              className="card-action-link"
              onClick={() => onNavigate('/super-admin/financial-analytics')}
            >
              <span>Full P&L Analytics</span>
              <ExternalLink size={14} />
            </button>
          </div>

          <div className="intel-content-split">
            <div className="intel-metric-box">
              <span className="metric-box-label">Gross Recognized Cash Inflow</span>
              <span className="metric-box-val positive">₹18,00,000</span>
              <span className="metric-box-sub">Across 14 accredited colleges</span>
            </div>
            <div className="intel-metric-box">
              <span className="metric-box-label">Monthly Cloud Infrastructure</span>
              <span className="metric-box-val">₹70,500</span>
              <span className="metric-box-sub">AWS EC2, S3 & DB Clusters</span>
            </div>
            <div className="intel-metric-box">
              <span className="metric-box-label">AI Parsing Token Expenditure</span>
              <span className="metric-box-val">₹34,200</span>
              <span className="metric-box-sub">Document OCR & Verification</span>
            </div>
            <div className="intel-metric-box">
              <span className="metric-box-label">Customer Lifetime Value (LTV)</span>
              <span className="metric-box-val positive">₹7,80,000</span>
              <span className="metric-box-sub">Based on 94.2% renewal index</span>
            </div>
          </div>

          <div className="intel-summary-quote">
            <strong>Platform Owner Note:</strong> Yashtitva operates with zero external venture debt. Annual recurring contracts provide strong cash flow visibility. Immediate liquidity can be augmented by collecting ₹1,20,000 from VJTI following GST split invoice dispatch.
          </div>
        </div>

        {/* Action Center Card */}
        <div className="dashboard-card action-center-card">
          <div className="intel-card-header">
            <div>
              <h3 className="card-headline">Priority Control Actions</h3>
              <p className="card-subheadline">Required platform owner interventions</p>
            </div>
          </div>

          <div className="action-items-list">
            <div className="action-item-row" onClick={() => onNavigate('/super-admin/colleges')}>
              <div className="action-item-bullet warning" />
              <div className="action-item-desc">
                <strong>Review MIT-WPU Approval Order:</strong> Validate AICTE legal order PDF to authorize institutional campus license.
              </div>
              <span className="action-item-arrow">→</span>
            </div>

            <div className="action-item-row" onClick={() => onNavigate('/super-admin/complaints-support')}>
              <div className="action-item-bullet danger" />
              <div className="action-item-desc">
                <strong>Ticket TCK-2026-881 (VJTI):</strong> Finance department requires SGST/CGST invoice itemization to disburse overdue ₹1.20L.
              </div>
              <span className="action-item-arrow">→</span>
            </div>

            <div className="action-item-row" onClick={() => onNavigate('/super-admin/expenses-profitability')}>
              <div className="action-item-bullet info" />
              <div className="action-item-desc">
                <strong>AI OCR Cost Optimization:</strong> Evaluate prompt caching for institutional syllabi to trim ~15% monthly LLM spend.
              </div>
              <span className="action-item-arrow">→</span>
            </div>

            <div className="action-item-row" onClick={() => onNavigate('/super-admin/reports-exports')}>
              <div className="action-item-bullet success" />
              <div className="action-item-desc">
                <strong>Export Q3 Financial Ledger:</strong> Download reconciled P&L statement and GST breakdown for chartered accountant review.
              </div>
              <span className="action-item-arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
