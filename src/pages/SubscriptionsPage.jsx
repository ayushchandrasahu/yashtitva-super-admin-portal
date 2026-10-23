import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Users
} from 'lucide-react';

export default function SubscriptionsPage({ onNavigate, token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterPlan, setFilterPlan] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Fetch subscriptions error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [token]);

  const filteredSubs = (data?.subscriptions || []).filter((sub) => {
    const matchesPlan = filterPlan === 'ALL' || sub.planName.toLowerCase().includes(filterPlan.toLowerCase());
    const matchesSearch = !search || sub.collegeName.toLowerCase().includes(search.toLowerCase());
    return matchesPlan && matchesSearch;
  });

  return (
    <div className="subscriptions-page-wrapper">
      <div className="page-header-card">
        <div className="page-header-info">
          <div className="section-pill">
            <CreditCard size={14} />
            <span>SAAS RECURRING SUBSCRIPTIONS</span>
          </div>
          <h2 className="page-title">Campus Plan Portfolio & Renewals</h2>
          <p className="page-description">
            Track active multi-year and annual contracts, student seat allocations, upcoming renewal dates, and tier distribution.
          </p>
        </div>

        <div className="page-header-stats">
          <div className="header-stat-box">
            <span className="stat-label">Churn Rate</span>
            <span className="stat-value text-success">{data?.metrics?.churnRate || '0.8%'}</span>
          </div>
          <div className="header-stat-box">
            <span className="stat-label">Trial Conversion</span>
            <span className="stat-value">{data?.metrics?.trialConversionRate || '78.5%'}</span>
          </div>
          <div className="header-stat-box">
            <span className="stat-label">Avg Contract Value</span>
            <span className="stat-value">{data?.metrics?.avgContractValue || '₹2,55,000'}</span>
          </div>
        </div>
      </div>

      {/* Plan Tier Catalog Cards */}
      <div className="plans-catalog-grid">
        {data?.plans?.map((plan) => (
          <div key={plan.id} className="plan-tier-card">
            <div className="plan-card-header">
              <span className="plan-badge">{plan.activeCount} Active Campuses</span>
              <h3 className="plan-name">{plan.name}</h3>
              <div className="plan-pricing">
                <span className="plan-price">₹{plan.priceAnnual.toLocaleString('en-IN')}</span>
                <span className="plan-cycle">/ year + GST</span>
              </div>
            </div>

            <div className="plan-features-list">
              <div className="feature-item">
                <Users size={14} className="feature-icon" />
                <span>Student Capacity: <strong>{plan.studentsAllowed}</strong></span>
              </div>
              {plan.features.map((feat, i) => (
                <div key={i} className="feature-item">
                  <CheckCircle size={14} className="feature-icon" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Subscriptions Table */}
      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <div className="table-controls-strip">
          <div className="table-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Filter by college name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-filter-group">
            <select
              className="table-select-filter"
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
            >
              <option value="ALL">All Plans</option>
              <option value="Enterprise">Enterprise Campus Plan</option>
              <option value="Pro">Pro Campus Plan</option>
              <option value="Standard">Standard Campus Plan</option>
              <option value="Trial">Free Trial</option>
            </select>
          </div>
        </div>

        <div className="subscriptions-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>College / University</th>
                <th>Plan Name</th>
                <th>Annual Fee</th>
                <th>Enrolled Students</th>
                <th>Renewal Date</th>
                <th>Auto-Renew</th>
                <th>Contract Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No subscriptions found matching filters.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <strong>{sub.collegeName}</strong>
                      <div className="cell-sub">{sub.district}, {sub.state}</div>
                    </td>
                    <td>
                      <span className="badge-pill">{sub.planName}</span>
                    </td>
                    <td className="font-semibold">₹{Number(sub.amount).toLocaleString('en-IN')}</td>
                    <td>
                      {sub.studentsCount ? Number(sub.studentsCount).toLocaleString('en-IN') : '—'}
                    </td>
                    <td>
                      <span className="date-cell">
                        <Calendar size={13} />
                        <span>{sub.renewalDate}</span>
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${sub.autoRenew ? 'paid' : 'pending'}`}>
                        {sub.autoRenew ? 'Enabled' : 'Manual'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${sub.status.toLowerCase()}`}>
                        {sub.status}
                      </span>
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
