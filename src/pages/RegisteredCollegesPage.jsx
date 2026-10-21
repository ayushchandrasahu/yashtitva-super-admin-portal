import React, { useState, useEffect } from 'react';
import { INDIA_LOCATIONS, COLLEGE_TYPES } from '../data/indiaLocations';

export default function RegisteredCollegesPage({ onNavigate, token }) {
  // Filters state
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Colleges list & pagination
  const [colleges, setColleges] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoadingColleges, setIsLoadingColleges] = useState(true);
  const [collegeError, setCollegeError] = useState('');

  // Outstanding dues state
  const [outstandingDues, setOutstandingDues] = useState([]);
  const [isLoadingDues, setIsLoadingDues] = useState(true);
  const [duesError, setDuesError] = useState('');

  // Detail Modal state
  const [selectedCollegeDetail, setSelectedCollegeDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Available districts based on selected state
  const availableDistricts = selectedState !== 'ALL' && INDIA_LOCATIONS[selectedState]
    ? INDIA_LOCATIONS[selectedState]
    : [];

  // Reset district if state changes
  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedDistrict('ALL');
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedState('ALL');
    setSelectedDistrict('ALL');
    setSelectedType('ALL');
    setSearchQuery('');
  };

  // Fetch registered colleges from backend
  const fetchColleges = async (page = 1) => {
    setIsLoadingColleges(true);
    setCollegeError('');

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (selectedState !== 'ALL') queryParams.append('state', selectedState);
      if (selectedDistrict !== 'ALL') queryParams.append('district', selectedDistrict);
      if (selectedType !== 'ALL') queryParams.append('collegeType', selectedType);
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());

      const res = await fetch(`/api/colleges?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to load registered colleges.');
      }

      const data = await res.json();
      setColleges(data.colleges || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Fetch colleges error:', err);
      setCollegeError('Unable to load colleges from backend.');
    } finally {
      setIsLoadingColleges(false);
    }
  };

  // Fetch outstanding dues from backend
  const fetchOutstandingDues = async () => {
    setIsLoadingDues(true);
    setDuesError('');

    try {
      const res = await fetch('/api/licence-dues/outstanding', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to load outstanding dues.');
      }

      const data = await res.json();
      setOutstandingDues(data.dues || []);
    } catch (err) {
      console.error('Fetch dues error:', err);
      setDuesError('Unable to load outstanding licence dues.');
    } finally {
      setIsLoadingDues(false);
    }
  };

  // Load college detail modal
  const handleViewCollegeDetails = async (collegeId) => {
    setIsLoadingDetail(true);
    setVerificationFeedback(null);
    try {
      const res = await fetch(`/api/colleges/${collegeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedCollegeDetail(data.college);
      }
    } catch (err) {
      console.error('Error fetching college detail:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Action: Super Admin reviews and verifies / issues licence
  const handleVerifyApplication = async (collegeId, action) => {
    setIsVerifying(true);
    setVerificationFeedback(null);
    try {
      const res = await fetch(`/api/colleges/${collegeId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          notes: action === 'APPROVE' ? 'Official government approval document verified by Super Admin.' : 'Document verification rejected.',
          licenceFee: 200000
        })
      });

      const data = await res.json();
      if (res.ok) {
        setVerificationFeedback({ type: 'success', message: data.message });
        // Refresh details & lists
        handleViewCollegeDetails(collegeId);
        fetchColleges(pagination.page);
        fetchOutstandingDues();
      } else {
        setVerificationFeedback({ type: 'error', message: data.message });
      }
    } catch (err) {
      console.error('Verification error:', err);
      setVerificationFeedback({ type: 'error', message: 'Failed to process verification.' });
    } finally {
      setIsVerifying(false);
    }
  };

  // Re-fetch colleges whenever filters change
  useEffect(() => {
    fetchColleges(1);
  }, [selectedState, selectedDistrict, selectedType, searchQuery]);

  // Initial load of dues
  useEffect(() => {
    fetchOutstandingDues();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <main className="page-container" id="main-content">
      <h1 className="page-title">Registered Colleges</h1>

      {/* A. College Filters */}
      <section className="filter-bar-card" aria-label="College Filters">
        <div className="filter-grid">
          {/* Filter 1: State */}
          <div className="filter-item">
            <label htmlFor="filter-state" className="form-label">
              State
            </label>
            <select
              id="filter-state"
              className="form-select"
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
            >
              <option value="ALL">All States</option>
              {Object.keys(INDIA_LOCATIONS).sort().map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 2: District (Dynamically filtered by selected State) */}
          <div className="filter-item">
            <label htmlFor="filter-district" className="form-label">
              District
            </label>
            <select
              id="filter-district"
              className="form-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={selectedState === 'ALL'}
            >
              <option value="ALL">All Districts</option>
              {availableDistricts.map((dst) => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 3: College Type */}
          <div className="filter-item">
            <label htmlFor="filter-type" className="form-label">
              College Type
            </label>
            <select
              id="filter-type"
              className="form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="ALL">All College Types</option>
              {COLLEGE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Search field */}
          <div className="filter-item">
            <label htmlFor="filter-search" className="form-label">
              Search
            </label>
            <input
              id="filter-search"
              type="text"
              className="form-input"
              placeholder="Name, Code, or Unique ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Clear Filters Action */}
          <div className="filter-actions">
            <button
              id="btn-clear-filters"
              type="button"
              className="btn-clear-filters"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {/* B. Registered Colleges Table */}
      <section className="table-container-card" aria-label="Registered Colleges Table">
        {collegeError && (
          <div className="banner-alert error" style={{ margin: '1rem' }}>
            <span>{collegeError}</span>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>College Name</th>
                <th>State</th>
                <th>District</th>
                <th>College Type</th>
                <th>College Code</th>
                <th>Unique ID</th>
                <th>Licence Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingColleges ? (
                <tr>
                  <td colSpan="7" className="empty-state-text">
                    Loading registered colleges...
                  </td>
                </tr>
              ) : colleges.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state-text">
                    No colleges found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                colleges.map((college) => {
                  const statusClass = 
                    college.licenceStatus === 'Active' ? 'active' :
                    college.licenceStatus === 'Pending Verification' ? 'pending-verification' :
                    college.licenceStatus === 'Overdue' ? 'overdue' : 'pending-payment';

                  return (
                    <tr 
                      key={college.id} 
                      onClick={() => handleViewCollegeDetails(college.id)}
                      title="Click to view college registration details and licence status"
                    >
                      <td className="col-name">{college.name}</td>
                      <td>{college.state}</td>
                      <td>{college.district}</td>
                      <td>{college.collegeType}</td>
                      <td><code>{college.collegeCode}</code></td>
                      <td><code>{college.uniqueId}</code></td>
                      <td>
                        <span className={`status-pill ${statusClass}`}>
                          {college.licenceStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination-bar">
          <div>
            Showing {colleges.length} of {pagination.total} registered colleges
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={pagination.page <= 1 || isLoadingColleges}
              onClick={() => fetchColleges(pagination.page - 1)}
            >
              Previous
            </button>
            <span style={{ alignSelf: 'center', margin: '0 0.5rem', fontWeight: 600 }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className="pagination-btn"
              disabled={pagination.page >= pagination.totalPages || isLoadingColleges}
              onClick={() => fetchColleges(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* C. Separate Outstanding Licence Dues Box */}
      <section className="outstanding-dues-card" aria-labelledby="outstanding-title">
        <div className="outstanding-header">
          <h2 id="outstanding-title" className="outstanding-title">
            Outstanding Licence Dues
          </h2>
          <p className="outstanding-desc">
            Colleges with unpaid or overdue software licence payments.
          </p>
        </div>

        {duesError && (
          <div className="banner-alert error">
            <span>{duesError}</span>
          </div>
        )}

        {isLoadingDues ? (
          <div className="empty-state-text">
            Calculating outstanding licence dues from backend records...
          </div>
        ) : outstandingDues.length === 0 ? (
          <div className="empty-state-text">
            No outstanding licence dues.
          </div>
        ) : (
          <div className="outstanding-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>College Name</th>
                  <th>District</th>
                  <th>Outstanding Amount</th>
                  <th>Payment Due Date</th>
                  <th>Payment Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {outstandingDues.map((due) => {
                  const statusClass = 
                    due.paymentStatus === 'Overdue' ? 'overdue' : 'pending-payment';

                  return (
                    <tr key={due.invoiceNumber}>
                      <td className="col-name">{due.collegeName}</td>
                      <td>{due.district}</td>
                      <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {formatCurrency(due.outstandingAmount)}
                      </td>
                      <td>{due.dueDate}</td>
                      <td>
                        <span className={`status-pill ${statusClass}`}>
                          {due.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => handleViewCollegeDetails(due.collegeId)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* College Detail View Modal */}
      {selectedCollegeDetail && (
        <div className="modal-overlay" onClick={() => setSelectedCollegeDetail(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selectedCollegeDetail.name}</h3>
                <span className="modal-label">Registration Record #{selectedCollegeDetail.id}</span>
              </div>
              <button 
                className="modal-close-btn" 
                onClick={() => setSelectedCollegeDetail(null)}
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            {verificationFeedback && (
              <div className={`banner-alert ${verificationFeedback.type}`} style={{ marginBottom: '1rem' }}>
                <span>{verificationFeedback.message}</span>
              </div>
            )}

            <div className="modal-grid">
              <div>
                <div className="modal-label">Institutional Category</div>
                <div className="modal-val">{selectedCollegeDetail.category}</div>
              </div>

              {selectedCollegeDetail.affiliatedUniversity && (
                <div>
                  <div className="modal-label">Affiliated University</div>
                  <div className="modal-val">{selectedCollegeDetail.affiliatedUniversity}</div>
                </div>
              )}

              <div>
                <div className="modal-label">College Code</div>
                <div className="modal-val"><code>{selectedCollegeDetail.collegeCode}</code></div>
              </div>

              <div>
                <div className="modal-label">Unique ID</div>
                <div className="modal-val"><code>{selectedCollegeDetail.uniqueId}</code></div>
              </div>

              <div>
                <div className="modal-label">Location</div>
                <div className="modal-val">{selectedCollegeDetail.district}, {selectedCollegeDetail.state}</div>
              </div>

              <div>
                <div className="modal-label">College Type</div>
                <div className="modal-val">{selectedCollegeDetail.collegeType}</div>
              </div>

              <div>
                <div className="modal-label">Current Licence Status</div>
                <div className="modal-val">
                  <span className={`status-pill ${selectedCollegeDetail.licenceStatus === 'Active' ? 'active' : 'pending-verification'}`}>
                    {selectedCollegeDetail.licenceStatus}
                  </span>
                </div>
              </div>

              <div>
                <div className="modal-label">Registration Date</div>
                <div className="modal-val">
                  {new Date(selectedCollegeDetail.registeredAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>

              {/* Uploaded Approval Document */}
              <div className="modal-grid-full">
                <div className="modal-label">Government Approval Document</div>
                <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.875rem' }}>
                    {selectedCollegeDetail.documentOriginalName || 'approval_doc.pdf'}
                  </span>
                  <a
                    href={`/api/colleges/${selectedCollegeDetail.id}/document`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-table-action"
                    style={{ textDecoration: 'none' }}
                  >
                    View Official Document
                  </a>
                </div>
              </div>

              {/* Licence / Payment info if available */}
              {selectedCollegeDetail.licence && (
                <div className="modal-grid-full" style={{ background: '#FAF6F0', padding: '0.75rem', borderRadius: '4px' }}>
                  <div className="modal-label">Active Software Licence</div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong>Licence No:</strong> {selectedCollegeDetail.licence.licenceNumber} | 
                    <strong> Valid Until:</strong> {selectedCollegeDetail.licence.expiryDate}
                  </div>
                </div>
              )}

              {selectedCollegeDetail.payment && selectedCollegeDetail.payment.outstandingAmount > 0 && (
                <div className="modal-grid-full" style={{ background: '#FCF4F4', padding: '0.75rem', borderRadius: '4px' }}>
                  <div className="modal-label" style={{ color: 'var(--color-danger)' }}>Outstanding Licence Payment</div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong>Amount Due:</strong> {formatCurrency(selectedCollegeDetail.payment.outstandingAmount)} | 
                    <strong> Due Date:</strong> {selectedCollegeDetail.payment.dueDate} ({selectedCollegeDetail.payment.status})
                  </div>
                </div>
              )}
            </div>

            {/* Document Verification Actions (Only if application is Pending Verification) */}
            {selectedCollegeDetail.licenceStatus === 'Pending Verification' && (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', marginTop: '1rem' }}>
                <div className="modal-label" style={{ marginBottom: '0.5rem' }}>Super Admin Document Verification Review</div>
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                  Verify that the government approval document matches legal regulatory records. Approving will issue a legitimate software licence.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ width: 'auto', fontSize: '0.825rem' }}
                    onClick={() => handleVerifyApplication(selectedCollegeDetail.id, 'APPROVE')}
                    disabled={isVerifying}
                  >
                    {isVerifying ? 'Processing...' : 'Approve & Issue Software Licence'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.825rem' }}
                    onClick={() => handleVerifyApplication(selectedCollegeDetail.id, 'REJECT')}
                    disabled={isVerifying}
                  >
                    Reject Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
