import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Plus,
  Mail,
  Clock,
  CheckCircle2,
  Lock,
  UserCheck,
  X,
  AlertCircle
} from 'lucide-react';

export default function TeamAccessPage({ onNavigate, token }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('FINANCIAL_AUDITOR');
  const [inviteMsg, setInviteMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/team', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error('Fetch team error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [token]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setErrorMsg('Name and email are required.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: inviteName.trim(),
          email: inviteEmail.trim(),
          role: inviteRole,
          permissions: inviteRole === 'FINANCIAL_AUDITOR' ? 'FINANCE_READ_WRITE,INVOICE_MANAGE' : 'SUPPORT_DESK,VERIFICATION_REVIEW'
        })
      });

      const data = await res.json();
      if (data.success) {
        setInviteMsg(data.message);
        setTimeout(() => {
          setIsInviteOpen(false);
          setInviteMsg('');
          setInviteName('');
          setInviteEmail('');
          fetchTeam();
        }, 1200);
      } else {
        setErrorMsg(data.message || 'Invitation failed.');
      }
    } catch (err) {
      setErrorMsg('Failed to dispatch invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="team-page-wrapper">
      <div className="page-header-card">
        <div className="page-header-info">
          <div className="section-pill">
            <Users size={14} />
            <span>ROLE-BASED ACCESS CONTROL (RBAC)</span>
          </div>
          <h2 className="page-title">Super Admin Team & Delegated Privileges</h2>
          <p className="page-description">
            Platform owners, financial auditors, and operations leads authorized to access sensitive business intelligence and campus records.
          </p>
        </div>

        <div className="page-header-actions-group">
          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsInviteOpen(true)}
          >
            <Plus size={16} />
            <span>+ Invite Administrator</span>
          </button>
        </div>
      </div>

      {/* Team Members Table Card */}
      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <h3 className="card-headline">Authorized Platform Administrators</h3>
        <p className="card-subheadline">Every account requires hardware 2FA and has session IP binding</p>

        <div className="team-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Assigned Role</th>
                <th>Permissions Scope</th>
                <th>Account Status</th>
                <th>Last Active (IST)</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="team-admin-cell">
                      <div className="team-avatar">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{m.name}</strong>
                        <div className="cell-sub">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge-pill gold">{m.role.replace(/_/g, ' ')}</span>
                  </td>
                  <td>
                    <div className="perms-text">{m.permissions.replace(/_/g, ' ')}</div>
                  </td>
                  <td>
                    <span className={`status-pill ${m.status === 'Active' ? 'paid' : 'trial'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td>
                    <span className="date-cell">
                      <Clock size={13} />
                      <span>{m.lastActive ? new Date(m.lastActive).toLocaleString('en-IN') : 'Invited'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Privilege Matrix */}
      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <h3 className="card-headline">Role-Based Permission Matrix</h3>
        <p className="card-subheadline">Access governance preventing unauthorized financial or operational modifications</p>

        <div className="matrix-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Role Tier</th>
                <th>Financial Analytics & P&L</th>
                <th>College Verification</th>
                <th>Expense Entry</th>
                <th>Audit Logs & Security</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>PLATFORM OWNER (Founder)</strong></td>
                <td className="text-success font-semibold">Full Access (Read/Write)</td>
                <td className="text-success font-semibold">Full Access (Approve/Reject)</td>
                <td className="text-success font-semibold">Full Access</td>
                <td className="text-success font-semibold">Full Governance</td>
              </tr>
              <tr>
                <td><strong>FINANCIAL AUDITOR</strong></td>
                <td className="text-success font-semibold">Full Access (Read/Export)</td>
                <td className="text-muted">Read Only</td>
                <td className="text-success font-semibold">Full Access</td>
                <td className="text-muted">Read Only</td>
              </tr>
              <tr>
                <td><strong>COLLEGE OPERATIONS LEAD</strong></td>
                <td className="text-muted">Hidden / Restricted</td>
                <td className="text-success font-semibold">Full Access (Approve/Reject)</td>
                <td className="text-muted">Restricted</td>
                <td className="text-muted">Restricted</td>
              </tr>
              <tr>
                <td><strong>SUPPORT SPECIALIST</strong></td>
                <td className="text-muted">Hidden / Restricted</td>
                <td className="text-muted">Read Only</td>
                <td className="text-muted">Restricted</td>
                <td className="text-muted">Restricted</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-container invite-modal">
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Users size={20} className="modal-title-icon" />
                <h2 className="modal-title">Invite Platform Administrator</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsInviteOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {inviteMsg && (
              <div className="banner-alert success">
                <CheckCircle2 size={16} />
                <span>{inviteMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="banner-alert error">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleInvite} className="modal-form">
              <div className="form-group">
                <label className="form-label form-label-required">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Vikram Mehta, CA"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Official Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. vikram.auditor@yashtitva.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Administrator Role Tier</label>
                <select
                  className="form-select"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  disabled={submitting}
                >
                  <option value="FINANCIAL_AUDITOR">Financial Auditor (P&L, Invoices, GST reports)</option>
                  <option value="COLLEGE_OPERATIONS_LEAD">College Operations Lead (Verification & Onboarding)</option>
                  <option value="SUPPORT_SPECIALIST">Support Specialist (Ticket Resolution & Student Queries)</option>
                  <option value="PLATFORM_OWNER">Platform Co-Owner (Full Unrestricted Access)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsInviteOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Dispatching Invite...' : 'Send Secure Access Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
