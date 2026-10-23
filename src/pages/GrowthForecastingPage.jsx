import React, { useState, useEffect } from 'react';
import {
  LineChart,
  TrendingUp,
  Target,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  Zap,
  BarChart2
} from 'lucide-react';

export default function GrowthForecastingPage({ onNavigate, token }) {
  const [forecasts, setForecasts] = useState([]);
  const [unitEconomics, setUnitEconomics] = useState(null);
  const [scenario, setScenario] = useState('expected'); // 'conservative', 'expected', 'aggressive'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecasting = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/growth/forecasting', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setForecasts(data.forecasts || []);
          setUnitEconomics(data.unitEconomics || null);
        }
      } catch (err) {
        console.error('Fetch forecasting error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForecasting();
  }, [token]);

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="growth-page-wrapper">
      <div className="page-header-card">
        <div className="page-header-info">
          <div className="section-pill">
            <LineChart size={14} />
            <span>SAAS UNIT ECONOMICS & ARR FORECASTING</span>
          </div>
          <h2 className="page-title">Growth Projections & SaaS Unit Economics</h2>
          <p className="page-description">
            12-month forward predictive revenue models, Customer Acquisition Cost (CAC), Lifetime Value (LTV), and expansion trajectory.
          </p>
        </div>

        <div className="scenario-switcher">
          <button
            type="button"
            className={`scenario-btn ${scenario === 'conservative' ? 'active' : ''}`}
            onClick={() => setScenario('conservative')}
          >
            Conservative (15% MoM)
          </button>
          <button
            type="button"
            className={`scenario-btn ${scenario === 'expected' ? 'active' : ''}`}
            onClick={() => setScenario('expected')}
          >
            Expected Baseline (22% MoM)
          </button>
          <button
            type="button"
            className={`scenario-btn ${scenario === 'aggressive' ? 'active' : ''}`}
            onClick={() => setScenario('aggressive')}
          >
            Aggressive Scale (35% MoM)
          </button>
        </div>
      </div>

      {/* Unit Economics Master Grid */}
      <div className="financial-kpi-row" style={{ marginTop: '1.25rem' }}>
        <div className="fin-metric-card">
          <span className="fin-card-label">Customer Acquisition Cost (CAC)</span>
          <div className="fin-card-val text-primary">₹28,500</div>
          <span className="fin-card-subtext">Sales & EdTech marketing cost per college</span>
        </div>

        <div className="fin-metric-card">
          <span className="fin-card-label">Customer Lifetime Value (LTV)</span>
          <div className="fin-card-val text-success">₹7,80,000</div>
          <span className="fin-card-subtext">3.2-year average contract retention</span>
        </div>

        <div className="fin-metric-card highlight positive">
          <span className="fin-card-label">LTV to CAC Ratio</span>
          <div className="fin-card-val">27.4x</div>
          <span className="fin-card-subtext">Top decile enterprise SaaS (&gt; 3.0x target)</span>
        </div>

        <div className="fin-metric-card">
          <span className="fin-card-label">CAC Payback Period</span>
          <div className="fin-card-val text-success">1.4 Months</div>
          <span className="fin-card-subtext">Capital efficiency index</span>
        </div>

        <div className="fin-metric-card">
          <span className="fin-card-label">Net Revenue Retention (NRR)</span>
          <div className="fin-card-val text-success">118%</div>
          <span className="fin-card-subtext">Expansion via campus module add-ons</span>
        </div>
      </div>

      {/* 12-Month ARR / MRR Scenario Forecast Table */}
      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <div className="flex-between">
          <div>
            <h3 className="card-headline">Forward ARR Projection Horizon</h3>
            <p className="card-subheadline">
              Projected Monthly Recurring Revenue and Annual Run Rate under the <strong>{scenario.toUpperCase()}</strong> thesis
            </p>
          </div>
          <span className="badge-pill gold">
            <Sparkles size={13} />
            <span>AI Predictive Model</span>
          </span>
        </div>

        <div className="forecast-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Forecast Month</th>
                <th>Selected Scenario MRR</th>
                <th>Estimated ARR Run Rate</th>
                <th>Cumulative Projected Revenue</th>
                <th>Expected New Campus Onboardings</th>
              </tr>
            </thead>
            <tbody>
              {forecasts.map((f, i) => {
                const activeMRR = f[scenario];
                const arr = activeMRR * 12;
                const newColleges = scenario === 'conservative' ? 2 : scenario === 'expected' ? 3 : 5;
                const cumulative = activeMRR * (i + 1);

                return (
                  <tr key={f.month}>
                    <td>
                      <strong>{f.month}</strong>
                    </td>
                    <td className="text-success font-semibold">{formatINR(activeMRR)}</td>
                    <td className="font-bold">{formatINR(arr)}</td>
                    <td className="text-muted">{formatINR(cumulative)}</td>
                    <td>
                      <span className="badge-pill">+{newColleges} Campuses</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
