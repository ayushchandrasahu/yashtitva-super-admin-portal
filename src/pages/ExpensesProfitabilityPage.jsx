import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Calendar,
  CreditCard,
  Building,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function ExpensesProfitabilityPage({ onNavigate, token, onOpenQuickAction }) {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/expenses?category=${categoryFilter}&search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setExpenses(data.expenses || []);
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.error('Fetch expenses error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter, search, token]);

  return (
    <div className="expenses-page-wrapper">
      <div className="page-header-card">
        <div className="page-header-info">
          <div className="section-pill">
            <Wallet size={14} />
            <span>OPERATING EXPENDITURE & COST LEDGER</span>
          </div>
          <h2 className="page-title">Operating Expenses & Profitability Center</h2>
          <p className="page-description">
            Audit cloud hosting (AWS), database clusters, AI OCR tokens, payroll, marketing, and SaaS subscriptions.
          </p>
        </div>

        <div className="page-header-actions-group">
          <button
            type="button"
            className="btn-primary"
            onClick={() => onOpenQuickAction && onOpenQuickAction('expense')}
          >
            <Plus size={16} />
            <span>+ Add New Expense</span>
          </button>
        </div>
      </div>

      {/* Expense Stats */}
      <div className="financial-kpi-row" style={{ marginTop: '1.25rem' }}>
        <div className="fin-metric-card">
          <span className="fin-card-label">Total Recorded Expenses</span>
          <div className="fin-card-val text-danger">
            ₹{Number(summary?.totalAmount || 0).toLocaleString('en-IN')}
          </div>
          <span className="fin-card-subtext">{summary?.totalEntries || 0} ledger items</span>
        </div>

        <div className="fin-metric-card">
          <span className="fin-card-label">Monthly Recurring OpEx</span>
          <div className="fin-card-val">
            ₹{Number(summary?.recurringTotal || 0).toLocaleString('en-IN')}
          </div>
          <span className="fin-card-subtext">Fixed monthly commitments</span>
        </div>

        <div className="fin-metric-card">
          <span className="fin-card-label">AI Processing Spend</span>
          <div className="fin-card-val">₹62,700</div>
          <span className="fin-card-subtext">Anthropic & Gemini tokens</span>
        </div>

        <div className="fin-metric-card">
          <span className="fin-card-label">Cloud Hosting & Edge</span>
          <div className="fin-card-val">₹94,700</div>
          <span className="fin-card-subtext">AWS & Cloudflare CDN</span>
        </div>
      </div>

      {/* Expense Table Card */}
      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <div className="table-controls-strip">
          <div className="table-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by vendor, provider, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-filter-group">
            <select
              className="table-select-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="Hosting & Cloud Infrastructure">Hosting & Cloud</option>
              <option value="Database Services">Database Services</option>
              <option value="AI API Usage">AI API Usage</option>
              <option value="Development & Engineering">Development & Payroll</option>
              <option value="Marketing & Advertising">Marketing</option>
              <option value="Payment Gateway Fees">Gateway Fees</option>
              <option value="Software Subscriptions & SaaS">SaaS Tooling</option>
            </select>
          </div>
        </div>

        <div className="expenses-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Expense Date</th>
                <th>Category</th>
                <th>Vendor / Service</th>
                <th>Notes / Purpose</th>
                <th>Payment Mode</th>
                <th>Recurring</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No expense records found.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>
                      <span className="date-cell">
                        <Calendar size={13} />
                        <span>{exp.expenseDate}</span>
                      </span>
                    </td>
                    <td>
                      <span className="badge-pill">{exp.category}</span>
                    </td>
                    <td>
                      <strong>{exp.vendor}</strong>
                    </td>
                    <td className="cell-sub">{exp.notes || '—'}</td>
                    <td>{exp.paymentMethod || 'Corporate Card'}</td>
                    <td>
                      <span className={`status-pill ${exp.isRecurring ? 'paid' : 'trial'}`}>
                        {exp.isRecurring ? 'Recurring' : 'One-time'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }} className="text-danger">
                      ₹{Number(exp.amount).toLocaleString('en-IN')}
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
