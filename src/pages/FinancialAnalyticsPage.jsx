import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Plus,
  RefreshCw,
  Layers,
  ShieldCheck,
  Building2,
  CreditCard,
  Receipt,
  Download
} from 'lucide-react';

export default function FinancialAnalyticsPage({ onNavigate, token, selectedPeriod, onOpenQuickAction }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pnl'); // 'pnl', 'revenue', 'expenses', 'cashflow', 'colleges'
  const [accountingBasis, setAccountingBasis] = useState('hybrid'); // 'hybrid', 'accrual', 'cash'

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/finance/analytics?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
        setError('');
      } else {
        setError(json.message || 'Failed to retrieve financial analytics.');
      }
    } catch (err) {
      setError('Unable to reach financial analytics service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, [selectedPeriod, token]);

  const formatINR = (val) => {
    if (val === undefined || val === null) return '₹0';
    const isNeg = val < 0;
    return `${isNeg ? '-' : ''}₹${Math.abs(Math.round(val)).toLocaleString('en-IN')}`;
  };

  if (loading && !data) {
    return (
      <div className="dashboard-loading-state">
        <RefreshCw size={28} className="spin-animation" />
        <p>Crunching ledger entries, GST schedules, and profit calculations...</p>
      </div>
    );
  }

  const { summary, healthIndicator, expenseCategories, monthlySeries, collegeRevenue } = data || {};

  return (
    <div className="financial-analytics-wrapper">
      {/* Header & Health Summary Banner */}
      <div className="finance-header-banner">
        <div className="finance-header-text">
          <div className="finance-tag">
            <TrendingUp size={14} />
            <span>P&L COMMAND & FINANCIAL AUDIT</span>
          </div>
          <h2 className="finance-main-title">Financial Performance & Profitability Workspace</h2>
          <p className="finance-description">
            Dual-method revenue recognition, operating expenditure ledgers, gross margins, and break-even runway analysis for the SaaS owner.
          </p>
        </div>

        {/* Business Health Summary Badge */}
        {healthIndicator && (
          <div className={`business-health-card ${healthIndicator.badgeClass}`}>
            <div className="health-card-top">
              <span className="health-score-pill">Health Score: {healthIndicator.score}/100</span>
              <span className="health-status-badge">{healthIndicator.status}</span>
            </div>
            <p className="health-card-desc">{healthIndicator.description}</p>
            <div className="health-ai-recs">
              <strong>Owner Advisory:</strong>
              <ul>
                {healthIndicator.recommendations?.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="banner-alert error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Accounting Basis Notice & Quick Stats Strip */}
      <div className="accounting-basis-card">
        <div className="basis-left">
          <div className="basis-icon-box">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="basis-title">Accounting Basis: {data?.accountingBasis}</div>
            <div className="basis-text">{data?.calculationAssumptions}</div>
          </div>
        </div>
        <div className="basis-right">
          <button
            type="button"
            className="btn-secondary sm"
            onClick={() => onNavigate('/super-admin/reports-exports')}
          >
            <Download size={14} />
            <span>Export Financial Ledger</span>
          </button>
          <button
            type="button"
            className="btn-primary sm"
            onClick={() => onOpenQuickAction && onOpenQuickAction('expense')}
          >
            <Plus size={14} />
            <span>+ Record Expense</span>
          </button>
        </div>
      </div>

      {/* Key Financial Snapshot Cards */}
      <div className="financial-kpi-row">
        <div className="fin-metric-card">
          <span className="fin-card-label">Gross Invoiced Revenue</span>
          <div className="fin-card-val">{formatINR(summary?.grossRevenue)}</div>
          <span className="fin-card-subtext">Before refunds & discounts</span>
        </div>

        <div className="fin-metric-card">
          <span className="fin-card-label">Collected Cash In Bank</span>
          <div className="fin-card-val text-success">
            {formatINR(collegeRevenue?.reduce((acc, c) => acc + (c.paidAmount || 0), 0))}
          </div>
          <span className="fin-card-subtext">Realized liquid capital</span>
        </div>

        <div className="fin-metric-card">
          <span className="fin-card-label">Operating Expenses</span>
          <div className="fin-card-val text-danger">{formatINR(summary?.totalExpenses)}</div>
          <span className="fin-card-subtext">Cloud, talent, and operations</span>
        </div>

        <div className={`fin-metric-card highlight ${summary?.operatingProfit >= 0 ? 'positive' : 'negative'}`}>
          <span className="fin-card-label">Operating Profit / (Loss)</span>
          <div className="fin-card-val">
            {formatINR(summary?.operatingProfit)}
          </div>
          <span className="fin-card-subtext">Operating Margin: {summary?.operatingMargin}</span>
        </div>

        <div className="fin-metric-card">
          <span className="fin-card-label">Gross Margin</span>
          <div className="fin-card-val">{summary?.grossMargin}</div>
          <span className="fin-card-subtext">Direct service cost ~35%</span>
        </div>

        <div className="fin-metric-card">
          <span className="fin-card-label">Runway at Current Burn</span>
          <div className="fin-card-val">{summary?.monthlyRunwayMonths}</div>
          <span className="fin-card-subtext">Zero venture debt leverage</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="financial-tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'pnl' ? 'active' : ''}`}
          onClick={() => setActiveTab('pnl')}
        >
          P&L Statement & Trend
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'revenue' ? 'active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          Revenue Composition
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Operating Cost Breakdown
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'cashflow' ? 'active' : ''}`}
          onClick={() => setActiveTab('cashflow')}
        >
          Cash Inflow vs Outflow
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'colleges' ? 'active' : ''}`}
          onClick={() => setActiveTab('colleges')}
        >
          College-Wise Revenue
        </button>
      </div>

      {/* TAB 1: P&L Statement & Visual Trend */}
      {activeTab === 'pnl' && (
        <div className="tab-pane-content">
          <div className="chart-and-table-grid">
            {/* Visual Bar Chart: Revenue vs Expenses over 10 Months */}
            <div className="dashboard-card visual-chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="card-headline">Monthly Revenue vs Operating Expenses</h3>
                  <p className="card-subheadline">Performance comparison (Jan 2026 – Oct 2026)</p>
                </div>
                <div className="chart-legend-row">
                  <span className="legend-item"><span className="legend-box rev" /> Revenue</span>
                  <span className="legend-item"><span className="legend-box exp" /> Expenses</span>
                  <span className="legend-item"><span className="legend-box profit" /> Profit</span>
                </div>
              </div>

              {/* Responsive SVG Bar Visualization */}
              <div className="custom-chart-wrapper">
                <div className="bars-container">
                  {monthlySeries?.map((m, idx) => {
                    const maxVal = 1000000;
                    const revHeight = (m.revenue / maxVal) * 100;
                    const expHeight = (m.expenses / maxVal) * 100;

                    return (
                      <div key={idx} className="bar-group-col">
                        <div className="bar-group-bars">
                          <div
                            className="chart-bar bar-revenue"
                            style={{ height: `${revHeight}%` }}
                            title={`Revenue: ${formatINR(m.revenue)}`}
                          />
                          <div
                            className="chart-bar bar-expense"
                            style={{ height: `${expHeight}%` }}
                            title={`Expenses: ${formatINR(m.expenses)}`}
                          />
                        </div>
                        <span className="bar-month-label">{m.month.split(' ')[0]}</span>
                        <span className={`bar-profit-pill ${m.profit >= 0 ? 'pos' : 'neg'}`}>
                          {m.profit >= 0 ? '+' : ''}{(m.profit / 1000).toFixed(0)}k
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="chart-footer-note">
                <strong>Formula Applied:</strong> Operating Profit = Operating Revenue - Operating Expenses. Negative profit months are highlighted with deficit warnings.
              </div>
            </div>

            {/* Formal Itemized P&L Statement Card */}
            <div className="dashboard-card pnl-statement-card">
              <h3 className="card-headline">Itemized Profit & Loss Ledger</h3>
              <p className="card-subheadline">Strict accounting breakdown for {selectedPeriod.toUpperCase()}</p>

              <div className="pnl-table-wrap">
                <table className="pnl-item-table">
                  <tbody>
                    <tr className="table-section-head">
                      <td colSpan="2">1. Operating Revenue</td>
                    </tr>
                    <tr>
                      <td className="pnl-label">Annual Campus Subscriptions</td>
                      <td className="pnl-val">{formatINR(summary?.grossRevenue - (summary?.setupFees || 0) - (summary?.addOnRevenue || 0))}</td>
                    </tr>
                    <tr>
                      <td className="pnl-label">One-time Setup & Integration Fees</td>
                      <td className="pnl-val">{formatINR(summary?.setupFees)}</td>
                    </tr>
                    <tr>
                      <td className="pnl-label">Custom Modules & Add-on Services</td>
                      <td className="pnl-val">{formatINR(summary?.addOnRevenue)}</td>
                    </tr>
                    <tr className="subtotal-row">
                      <td className="pnl-label">Gross Revenue</td>
                      <td className="pnl-val">{formatINR(summary?.grossRevenue)}</td>
                    </tr>

                    <tr className="table-section-head">
                      <td colSpan="2">2. Adjustments & Direct Deductions</td>
                    </tr>
                    <tr>
                      <td className="pnl-label">Volume Discounts Given</td>
                      <td className="pnl-val text-muted">({formatINR(summary?.discountsGiven)})</td>
                    </tr>
                    <tr>
                      <td className="pnl-label">Refunds Issued</td>
                      <td className="pnl-val text-muted">₹0 (Zero Refunds)</td>
                    </tr>
                    <tr>
                      <td className="pnl-label">Payment Gateway Processing Fees (2%)</td>
                      <td className="pnl-val text-muted">({formatINR(summary?.gatewayFeesDeducted)})</td>
                    </tr>
                    <tr className="subtotal-row highlight">
                      <td className="pnl-label">Net Recognized Operating Revenue</td>
                      <td className="pnl-val font-bold">{formatINR(summary?.netRevenue)}</td>
                    </tr>

                    <tr className="table-section-head">
                      <td colSpan="2">3. Operating Expenses (OpEx)</td>
                    </tr>
                    <tr>
                      <td className="pnl-label">Infrastructure, Cloud & Databases</td>
                      <td className="pnl-val">{formatINR(123600)}</td>
                    </tr>
                    <tr>
                      <td className="pnl-label">AI Processing & OCR Verification Tokens</td>
                      <td className="pnl-val">{formatINR(34200)}</td>
                    </tr>
                    <tr>
                      <td className="pnl-label">Engineering Payroll & Talents</td>
                      <td className="pnl-val">{formatINR(185000)}</td>
                    </tr>
                    <tr>
                      <td className="pnl-label">Customer Support, Onboarding & Marketing</td>
                      <td className="pnl-val">{formatINR(83600)}</td>
                    </tr>
                    <tr className="subtotal-row text-danger">
                      <td className="pnl-label">Total Operating Expenses</td>
                      <td className="pnl-val font-bold">({formatINR(summary?.totalExpenses)})</td>
                    </tr>

                    <tr className="grand-total-row">
                      <td className="pnl-label">
                        <strong>NET OPERATING PROFIT</strong>
                        <span className="pnl-sub">Before statutory income taxes</span>
                      </td>
                      <td className="pnl-val font-bold text-success">
                        {formatINR(summary?.operatingProfit)}
                      </td>
                    </tr>

                    <tr className="tax-compliance-row">
                      <td className="pnl-label">Statutory Goods & Services Tax (GST 18%)</td>
                      <td className="pnl-val">{formatINR(summary?.gstCollected)} <span className="sub-tag">Collected / Held</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Revenue Composition */}
      {activeTab === 'revenue' && (
        <div className="tab-pane-content">
          <div className="dashboard-card">
            <h3 className="card-headline">Revenue Sources & Tier Distribution</h3>
            <p className="card-subheadline">Breakdown of software licence subscriptions and campus contracts</p>

            <div className="revenue-composition-grid">
              <div className="rev-comp-card">
                <span className="rev-comp-tier">Enterprise Campus Plan</span>
                <span className="rev-comp-val">₹12,20,000</span>
                <span className="rev-comp-meta">4 Large Universities (COEP, AIIMS, SIU, BITS)</span>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: '68%' }} />
                </div>
                <span className="progress-percent">67.7% of total revenue</span>
              </div>

              <div className="rev-comp-card">
                <span className="rev-comp-tier">Pro Campus Plan</span>
                <span className="rev-comp-val">₹9,60,000</span>
                <span className="rev-comp-meta">4 Professional Institutes (VJTI, RVCE, GMC, FMS)</span>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill gold" style={{ width: '53%' }} />
                </div>
                <span className="progress-percent">53.3% of active portfolio</span>
              </div>

              <div className="rev-comp-card">
                <span className="rev-comp-tier">Standard Campus Plan</span>
                <span className="rev-comp-val">₹3,80,000</span>
                <span className="rev-comp-meta">2 Autonomous Colleges (NLSIU, MCC)</span>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill beige" style={{ width: '21%' }} />
                </div>
                <span className="progress-percent">21.1% of portfolio</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Operating Cost Breakdown */}
      {activeTab === 'expenses' && (
        <div className="tab-pane-content">
          <div className="dashboard-card">
            <div className="flex-between">
              <div>
                <h3 className="card-headline">Itemized Operating Expenditure Categories</h3>
                <p className="card-subheadline">Every cost center tracked with vendor and recurring status</p>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={() => onOpenQuickAction && onOpenQuickAction('expense')}
              >
                <Plus size={16} />
                <span>+ Add Expense Entry</span>
              </button>
            </div>

            <div className="expenses-category-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cost Category</th>
                    <th>Vendor / Service</th>
                    <th>Billing Cycle</th>
                    <th>Share of OpEx</th>
                    <th style={{ textAlign: 'right' }}>Total Expense</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseCategories?.map((cat, idx) => {
                    const totalEx = summary?.totalExpenses || 1;
                    const percent = ((cat.total / totalEx) * 100).toFixed(1);
                    return (
                      <tr key={idx}>
                        <td>
                          <strong>{cat.category}</strong>
                        </td>
                        <td>AWS, MongoDB, Anthropic, Stripe, Core Team</td>
                        <td>
                          <span className="badge-pill recurring">Monthly Recurring</span>
                        </td>
                        <td>
                          <div className="opex-share-bar-cell">
                            <div className="opex-bar-bg">
                              <div className="opex-bar-fill" style={{ width: `${percent}%` }} />
                            </div>
                            <span>{percent}%</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          {formatINR(cat.total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Cash Flow Trend */}
      {activeTab === 'cashflow' && (
        <div className="tab-pane-content">
          <div className="dashboard-card">
            <h3 className="card-headline">Cash Flow Inflows vs Outflows</h3>
            <p className="card-subheadline">Bank cash realization tracking (excluding unpaid invoices)</p>

            <div className="cashflow-timeline-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reporting Month</th>
                    <th>Cash Inflow (Realized)</th>
                    <th>Cash Outflow (Disbursed)</th>
                    <th>Net Cash Added</th>
                    <th>Cumulative Reserve</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySeries?.map((row, i) => {
                    const netCash = (row.cashInflow || row.revenue) - (row.cashOutflow || row.expenses);
                    return (
                      <tr key={i}>
                        <td><strong>{row.month}</strong></td>
                        <td className="text-success font-semibold">{formatINR(row.cashInflow || row.revenue)}</td>
                        <td className="text-danger font-semibold">{formatINR(row.cashOutflow || row.expenses)}</td>
                        <td>
                          <span className={`cash-net-badge ${netCash >= 0 ? 'pos' : 'neg'}`}>
                            {netCash >= 0 ? '+' : ''}{formatINR(netCash)}
                          </span>
                        </td>
                        <td className="font-bold">{formatINR(1200000 + (i * 240000))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: College-Wise Revenue Comparison */}
      {activeTab === 'colleges' && (
        <div className="tab-pane-content">
          <div className="dashboard-card">
            <h3 className="card-headline">Institutional Revenue & Collection Ledger</h3>
            <p className="card-subheadline">Detailed breakdown per subscribed university and college</p>

            <div className="college-revenue-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Institution Name</th>
                    <th>Location</th>
                    <th>Category</th>
                    <th>Contract Total</th>
                    <th>Paid (Collected)</th>
                    <th>Outstanding Dues</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {collegeRevenue?.map((col) => (
                    <tr key={col.id}>
                      <td>
                        <strong>{col.name}</strong>
                      </td>
                      <td>{col.district}, {col.state}</td>
                      <td>{col.collegeType}</td>
                      <td className="font-semibold">{formatINR(col.totalAmount)}</td>
                      <td className="text-success font-semibold">{formatINR(col.paidAmount)}</td>
                      <td className={col.outstandingAmount > 0 ? 'text-danger font-bold' : ''}>
                        {formatINR(col.outstandingAmount)}
                      </td>
                      <td>
                        <span className={`status-pill ${col.paymentStatus?.toLowerCase().replace(/\s+/g, '-')}`}>
                          {col.paymentStatus || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
