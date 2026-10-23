import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ShieldAlert,
  Building2,
  User,
  MessageSquare,
  X
} from 'lucide-react';

export default function ComplaintsSupportPage({ onNavigate, token }) {
  const [complaints, setComplaints] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [activeTicket, setActiveTicket] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updateStatus, setUpdateStatus] = useState('Resolved');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/complaints?status=${statusFilter}&priority=${priorityFilter}&search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(data.complaints || []);
        setMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error('Fetch complaints error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, priorityFilter, search, token]);

  const handleResolveTicket = async (e) => {
    e.preventDefault();
    if (!activeTicket) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/complaints/${activeTicket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: updateStatus,
          resolutionNotes: resolutionNotes.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setActionMsg(`Ticket ${activeTicket.ticketCode} marked as ${updateStatus}!`);
        setTimeout(() => {
          setActiveTicket(null);
          setActionMsg('');
          fetchComplaints();
        }, 1000);
      }
    } catch (err) {
      console.error('Update complaint error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="complaints-page-wrapper">
      <div className="page-header-card">
        <div className="page-header-info">
          <div className="section-pill">
            <HelpCircle size={14} />
            <span>INSTITUTIONAL SUPPORT & COMPLAINT DESK</span>
          </div>
          <h2 className="page-title">College Admin Complaints & SLA Resolution</h2>
          <p className="page-description">
            Monitor reported issues from college deans, faculty coordinators, and students. Enforce enterprise response SLAs.
          </p>
        </div>

        <div className="page-header-stats">
          <div className="header-stat-box">
            <span className="stat-label">Active Tickets</span>
            <span className="stat-value text-danger">{(metrics?.openCount || 0) + (metrics?.inProgressCount || 0)}</span>
          </div>
          <div className="header-stat-box">
            <span className="stat-label">Avg Resolution</span>
            <span className="stat-value">{metrics?.avgResolutionHours || 14.2}h</span>
          </div>
          <div className="header-stat-box">
            <span className="stat-label">CSAT Rating</span>
            <span className="stat-value text-success">{metrics?.csatScore || '96.8%'}</span>
          </div>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="financial-kpi-row" style={{ marginTop: '1.25rem' }}>
        <div className="fin-metric-card">
          <span className="fin-card-label">Open Unassigned</span>
          <div className="fin-card-val text-warning">{metrics?.openCount || 0}</div>
          <span className="fin-card-subtext">Awaiting initial triage</span>
        </div>
        <div className="fin-metric-card">
          <span className="fin-card-label">In Progress</span>
          <div className="fin-card-val">{metrics?.inProgressCount || 0}</div>
          <span className="fin-card-subtext">Assigned to engineering/support</span>
        </div>
        <div className="fin-metric-card">
          <span className="fin-card-label">Resolved Tickets</span>
          <div className="fin-card-val text-success">{metrics?.resolvedCount || 0}</div>
          <span className="fin-card-subtext">Successfully closed issues</span>
        </div>
        <div className="fin-metric-card">
          <span className="fin-card-label">Critical Active Alerts</span>
          <div className="fin-card-val text-danger">{metrics?.criticalActive || 0}</div>
          <span className="fin-card-subtext">Immediate SLA priority</span>
        </div>
      </div>

      {/* Complaints Table Card */}
      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <div className="table-controls-strip">
          <div className="table-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by ticket code, subject, or college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-filter-group">
            <select
              className="table-select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              className="table-select-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="complaints-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket Code</th>
                <th>College & Submitter</th>
                <th>Category</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Status</th>
                <th>SLA Target</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    No support tickets found matching criteria.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong className="invoice-code-text">{c.ticketCode}</strong>
                    </td>
                    <td>
                      <div><strong>{c.collegeName}</strong></div>
                      <div className="cell-sub">{c.submitterName} ({c.submitterRole})</div>
                    </td>
                    <td>
                      <span className="badge-pill">{c.category}</span>
                    </td>
                    <td>
                      <div className="ticket-subject-cell">{c.subject}</div>
                    </td>
                    <td>
                      <span className={`priority-tag ${c.priority.toLowerCase()}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${c.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <span className="date-cell">
                        <Clock size={13} />
                        <span>{c.slaHours}h SLA</span>
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-action-small"
                        onClick={() => {
                          setActiveTicket(c);
                          setResolutionNotes(c.resolutionNotes || '');
                          setUpdateStatus(c.status === 'Resolved' ? 'Resolved' : 'Resolved');
                        }}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Management Modal */}
      {activeTicket && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-container ticket-modal">
            <div className="modal-header">
              <div className="modal-title-wrap">
                <HelpCircle size={20} className="modal-title-icon" />
                <h2 className="modal-title">Ticket {activeTicket.ticketCode} — {activeTicket.subject}</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveTicket(null)}
              >
                <X size={18} />
              </button>
            </div>

            {actionMsg && (
              <div className="banner-alert success">
                <CheckCircle2 size={16} />
                <span>{actionMsg}</span>
              </div>
            )}

            <div className="ticket-details-box">
              <div className="ticket-meta-grid">
                <div><strong>College:</strong> {activeTicket.collegeName}</div>
                <div><strong>Submitter:</strong> {activeTicket.submitterName} ({activeTicket.submitterEmail || 'admin'})</div>
                <div><strong>Priority:</strong> <span className={`priority-tag ${activeTicket.priority.toLowerCase()}`}>{activeTicket.priority}</span></div>
                <div><strong>Reported:</strong> {new Date(activeTicket.createdAt).toLocaleString('en-IN')}</div>
              </div>

              <div className="ticket-desc-box">
                <label className="form-label">Issue Description:</label>
                <p className="ticket-desc-text">{activeTicket.description}</p>
              </div>
            </div>

            <form onSubmit={handleResolveTicket} className="modal-form">
              <div className="form-group">
                <label className="form-label form-label-required">Update Ticket Status</label>
                <select
                  className="form-select"
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="In Progress">In Progress (Engineering Investigating)</option>
                  <option value="Resolved">Resolved (Resolution Dispatched)</option>
                  <option value="Open">Open (Pending Triage)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Resolution Notes / Action Taken</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Detail changes made, fix applied, or email sent to the college..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setActiveTicket(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating Ticket...' : 'Save Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
