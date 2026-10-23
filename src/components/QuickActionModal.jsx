import React, { useState } from 'react';
import { X, CreditCard, Receipt, Users, CheckCircle2, AlertCircle } from 'lucide-react';

export default function QuickActionModal({ actionType, onClose, token, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states for Expense
  const [expenseCategory, setExpenseCategory] = useState('Hosting & Cloud Infrastructure');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseVendor, setExpenseVendor] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [expenseNotes, setExpenseNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Corporate Card');

  // Form states for Payment Recording
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Bank Transfer (NEFT/RTGS)');
  const [referenceNo, setReferenceNo] = useState('');

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setError('');
    if (!expenseAmount || isNaN(expenseAmount) || Number(expenseAmount) <= 0) {
      setError('Please provide a valid positive expense amount.');
      return;
    }
    if (!expenseVendor.trim()) {
      setError('Vendor name is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          category: expenseCategory,
          amount: parseFloat(expenseAmount),
          expenseDate,
          vendor: expenseVendor.trim(),
          notes: expenseNotes.trim(),
          isRecurring,
          paymentStatus: 'Paid',
          paymentMethod,
          receiptName: 'Receipt_Upload.pdf'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to record expense.');
        return;
      }

      setSuccessMsg('Operating expense recorded successfully in general ledger.');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setError('Network communication error with server.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setError('');
    if (!invoiceNumber.trim()) {
      setError('Please specify an Invoice Number (e.g. INV-YASH-202602).');
      return;
    }
    if (!paidAmount || isNaN(paidAmount) || Number(paidAmount) <= 0) {
      setError('Please provide a valid positive payment amount.');
      return;
    }

    setLoading(true);
    try {
      // Find invoice first
      const invRes = await fetch(`/api/payments/invoices?search=${encodeURIComponent(invoiceNumber.trim())}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const invData = await invRes.json();
      const invoice = invData.invoices?.find(
        (i) => i.invoiceNumber.toLowerCase() === invoiceNumber.trim().toLowerCase()
      );

      if (!invoice) {
        setError(`No invoice found matching "${invoiceNumber}". Please verify invoice number.`);
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/payments/${invoice.id}/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          paidAmount: parseFloat(paidAmount),
          paymentMethod: payMethod,
          referenceNumber: referenceNo
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to record payment.');
        return;
      }

      setSuccessMsg(data.message);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setError('Server communication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-container quick-action-modal-card">
        <div className="modal-header">
          <div className="modal-title-wrap">
            {actionType === 'expense' ? (
              <>
                <CreditCard size={20} className="modal-title-icon" />
                <h2 className="modal-title">Record Operating Expense</h2>
              </>
            ) : (
              <>
                <Receipt size={20} className="modal-title-icon" />
                <h2 className="modal-title">Record Offline College Payment</h2>
              </>
            )}
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="banner-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="banner-alert success">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {actionType === 'expense' ? (
          <form onSubmit={handleAddExpense} className="modal-form">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label form-label-required">Category</label>
                <select
                  className="form-select"
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  disabled={loading}
                >
                  <option value="Hosting & Cloud Infrastructure">Hosting & Cloud Infrastructure</option>
                  <option value="Database Services">Database Services</option>
                  <option value="AI API Usage">AI API Usage (LLM & OCR)</option>
                  <option value="SMS & Email Services">SMS & Email Services</option>
                  <option value="Storage & Bandwidth">Storage & Bandwidth</option>
                  <option value="Development & Engineering">Development & Engineering</option>
                  <option value="Marketing & Advertising">Marketing & Advertising</option>
                  <option value="Payment Gateway Fees">Payment Gateway Fees</option>
                  <option value="Software Subscriptions & SaaS">Software Subscriptions & SaaS</option>
                  <option value="Customer Support & Success">Customer Support & Success</option>
                  <option value="Other Operating Expenses">Other Operating Expenses</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Amount (INR ₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="e.g. 48500"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label form-label-required">Vendor / Provider</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Amazon Web Services (AWS)"
                  value={expenseVendor}
                  onChange={(e) => setExpenseVendor(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Expense Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={loading}
                >
                  <option value="Corporate Card">Corporate Credit Card</option>
                  <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT / RTGS)</option>
                  <option value="Automated Deduction">Automated Deduction</option>
                  <option value="UPI / Net Banking">UPI / Corporate Net Banking</option>
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.8rem' }}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    disabled={loading}
                  />
                  <span>Mark as Recurring Monthly Expense</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes & Description</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Details of infrastructure, seats, or campaign..."
                value={expenseNotes}
                onChange={(e) => setExpenseNotes(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Recording...' : 'Save Expense to Ledger'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRecordPayment} className="modal-form">
            <div className="form-group">
              <label className="form-label form-label-required">Invoice Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. INV-YASH-202602 or INV-YASH-202605"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                disabled={loading}
                required
              />
              <span className="form-help">Enter the invoice code assigned to the college</span>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label form-label-required">Amount Received (INR ₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="e.g. 120000"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select
                  className="form-select"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  disabled={loading}
                >
                  <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
                  <option value="Demand Draft / Cheque">Demand Draft / Cheque</option>
                  <option value="Direct UPI / Corporate Wire">Direct UPI / Corporate Wire</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bank Reference / UTR Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. UTR20261023998241"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Recording...' : 'Confirm Payment Receipt'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
