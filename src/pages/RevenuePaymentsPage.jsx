import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Download,
  CreditCard,
  Building2,
  Clock,
  Printer
} from 'lucide-react';

export default function RevenuePaymentsPage({ onNavigate, token, onOpenQuickAction }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payments/invoices?status=${statusFilter}&search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error('Fetch invoices error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, search, token]);

  const totalInvoiced = invoices.reduce((acc, i) => acc + (i.totalAmount || 0), 0);
  const totalCollected = invoices.reduce((acc, i) => acc + (i.paidAmount || 0), 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + (i.outstandingAmount || 0), 0);
  const totalGst = invoices.reduce((acc, i) => acc + (i.taxGst || 0), 0);

  return (
    <div className="revenue-payments-page-wrapper">
      <div className="page-header-card">
        <div className="page-header-info">
          <div className="section-pill">
            <Receipt size={14} />
            <span>INVOICING & PAYMENT GATEWAY LEDGER</span>
          </div>
          <h2 className="page-title">Campus Invoices & Payment Collections</h2>
          <p className="page-description">
            Complete transaction history across Razorpay, NEFT/RTGS wire transfers, overdue invoice tracking, and 18% GST statutory records.
          </p>
        </div>

        <div className="page-header-actions-group">
          <button
            type="button"
            className="btn-primary"
            onClick={() => onOpenQuickAction && onOpenQuickAction('payment')}
          >
            <Plus size={16} />
            <span>+ Record Offline Payment</span>
          </button>
        </div>
      </div>

      {/* Snapshot Counters */}
      <div className="financial-kpi-row" style={{ marginTop: '1.25rem' }}>
        <div className="fin-metric-card">
          <span className="fin-card-label">Total Invoiced Amount</span>
          <div className="fin-card-val">₹{totalInvoiced.toLocaleString('en-IN')}</div>
          <span className="fin-card-subtext">{invoices.length} invoices generated</span>
        </div>

        <div className="fin-metric-card">
          <span className="fin-card-label">Collected Payments</span>
          <div className="fin-card-val text-success">₹{totalCollected.toLocaleString('en-IN')}</div>
          <span className="fin-card-subtext">Realized bank cash</span>
        </div>

        <div className="fin-metric-card">
          <span className="fin-card-label">Outstanding Receivables</span>
          <div className="fin-card-val text-danger">₹{totalOutstanding.toLocaleString('en-IN')}</div>
          <span className="fin-card-subtext">Pending collection</span>
        </div>

        <div className="fin-metric-card">
          <span className="fin-card-label">Applicable GST (18%)</span>
          <div className="fin-card-val">₹{totalGst.toLocaleString('en-IN')}</div>
          <span className="fin-card-subtext">Statutory tax provision</span>
        </div>
      </div>

      {/* Invoices Ledger Table */}
      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <div className="table-controls-strip">
          <div className="table-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by invoice code or college name..."
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
              <option value="Paid">Paid Only</option>
              <option value="Overdue">Overdue Only</option>
              <option value="Pending Payment">Pending Payment</option>
            </select>
          </div>
        </div>

        <div className="invoices-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice Code</th>
                <th>College Name</th>
                <th>Total Fee</th>
                <th>Amount Paid</th>
                <th>Outstanding</th>
                <th>Due Date</th>
                <th>GST (18%)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                    No invoice records found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <strong className="invoice-code-text">{inv.invoiceNumber}</strong>
                    </td>
                    <td>
                      <div>{inv.collegeName}</div>
                      <div className="cell-sub">{inv.district}, {inv.state}</div>
                    </td>
                    <td className="font-semibold">₹{Number(inv.totalAmount).toLocaleString('en-IN')}</td>
                    <td className="text-success font-semibold">₹{Number(inv.paidAmount).toLocaleString('en-IN')}</td>
                    <td className={inv.outstandingAmount > 0 ? 'text-danger font-bold' : ''}>
                      ₹{Number(inv.outstandingAmount).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className="date-cell">
                        <Clock size={13} />
                        <span>{inv.dueDate}</span>
                      </span>
                    </td>
                    <td>₹{Number(inv.taxGst || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`status-pill ${inv.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-action-small"
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-container invoice-details-modal">
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Receipt size={20} className="modal-title-icon" />
                <h2 className="modal-title">Tax Invoice — {selectedInvoice.invoiceNumber}</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedInvoice(null)}
              >
                ✕
              </button>
            </div>

            <div className="invoice-modal-body">
              <div className="invoice-preview-card">
                <div className="inv-prev-header">
                  <div>
                    <h3 className="inv-prev-issuer">YASHTITVA SAAS PLATFORM</h3>
                    <div className="inv-prev-address">
                      GSTIN: 27AABCT9982Q1ZN • Maharashtra, India
                    </div>
                  </div>
                  <div className="inv-prev-meta">
                    <div><strong>Date:</strong> {selectedInvoice.dueDate}</div>
                    <div><strong>Status:</strong> {selectedInvoice.status}</div>
                  </div>
                </div>

                <div className="inv-prev-client">
                  <strong>Billed To:</strong>
                  <div>{selectedInvoice.collegeName}</div>
                  <div>District: {selectedInvoice.district}, {selectedInvoice.state}</div>
                </div>

                <table className="inv-prev-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Base Amount</th>
                      <th>GST (18%)</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Annual Campus SaaS Licence & Verification System</td>
                      <td>₹{(selectedInvoice.totalAmount * 0.82).toFixed(0)}</td>
                      <td>₹{(selectedInvoice.totalAmount * 0.18).toFixed(0)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        ₹{Number(selectedInvoice.totalAmount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="inv-prev-footer-split">
                  <div>
                    <strong>Payment Mode:</strong> {selectedInvoice.paymentMethod || 'Online Gateway (Razorpay)'}
                    <div><strong>Last Payment:</strong> {selectedInvoice.lastPaymentDate || 'Pending'}</div>
                  </div>
                  <div className="inv-prev-totals">
                    <div>Total Invoiced: ₹{Number(selectedInvoice.totalAmount).toLocaleString('en-IN')}</div>
                    <div className="text-success">Amount Paid: ₹{Number(selectedInvoice.paidAmount).toLocaleString('en-IN')}</div>
                    <div className="font-bold text-danger">Balance Due: ₹{Number(selectedInvoice.outstandingAmount).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedInvoice(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => window.print()}
              >
                <Printer size={15} />
                <span>Print Tax Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
