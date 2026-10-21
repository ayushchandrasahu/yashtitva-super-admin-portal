import React, { useState, useRef } from 'react';
import { INSTITUTIONAL_CATEGORIES } from '../data/indiaLocations';

export default function NewCollegeRegistrationPage({ onNavigate, token }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    affiliatedUniversity: '',
    collegeCode: '',
    uniqueId: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileStatus, setFileStatus] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  const fileInputRef = useRef(null);
  const MAX_FILE_SIZE_MB = 10;

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Clear affiliatedUniversity if category changes away from 'Affiliated College'
      ...(field === 'category' && value !== 'Affiliated College' ? { affiliatedUniversity: '' } : {})
    }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrors(prev => ({ ...prev, document: 'Only PDF documents are accepted.' }));
      setSelectedFile(null);
      setFileStatus('');
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrors(prev => ({ ...prev, document: `File size exceeds the ${MAX_FILE_SIZE_MB}MB limit.` }));
      setSelectedFile(null);
      setFileStatus('');
      return;
    }

    setSelectedFile(file);
    setFileStatus(`${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB) — Ready to upload`);
    setErrors(prev => ({ ...prev, document: null }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name of College is required.';
    }

    if (!formData.category) {
      newErrors.category = 'Institutional Category is required.';
    }

    if (formData.category === 'Affiliated College' && !formData.affiliatedUniversity.trim()) {
      newErrors.affiliatedUniversity = 'Name of Affiliated University is required for Affiliated Colleges.';
    }

    if (!formData.collegeCode.trim()) {
      newErrors.collegeCode = 'College Code is required.';
    }

    if (!formData.uniqueId.trim()) {
      newErrors.uniqueId = 'Unique ID is required.';
    }

    if (!selectedFile) {
      newErrors.document = 'Government Approval Document (PDF) is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessInfo(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('category', formData.category);
      if (formData.category === 'Affiliated College') {
        data.append('affiliatedUniversity', formData.affiliatedUniversity.trim());
      }
      data.append('collegeCode', formData.collegeCode.trim());
      data.append('uniqueId', formData.uniqueId.trim());
      data.append('document', selectedFile);

      const response = await fetch('/api/colleges', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.field) {
          setErrors(prev => ({ ...prev, [result.field]: result.message }));
        } else {
          setServerError(result.message || 'Registration failed. Please check your submission.');
        }
        setIsSubmitting(false);
        return;
      }

      // Success
      setSuccessInfo(result);
      setIsSubmitting(false);
    } catch (err) {
      console.error('Registration submit error:', err);
      setServerError('Network error while processing registration. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      category: '',
      affiliatedUniversity: '',
      collegeCode: '',
      uniqueId: ''
    });
    setSelectedFile(null);
    setFileStatus('');
    setErrors({});
    setServerError('');
    setSuccessInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <main className="page-container" id="main-content">
      <h1 className="page-title">New College Registration</h1>

      {successInfo ? (
        <div className="registration-form-card">
          <div className="banner-alert success" style={{ marginBottom: '1.5rem' }}>
            <div>
              <strong>Registration Application Received:</strong> {successInfo.message}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem', lineHeight: '1.8', fontSize: '0.9rem' }}>
            <div><strong>College Name:</strong> {successInfo.college.name}</div>
            <div><strong>Institutional Category:</strong> {successInfo.college.category}</div>
            <div><strong>College Code:</strong> {successInfo.college.collegeCode}</div>
            <div><strong>Unique ID:</strong> {successInfo.college.uniqueId}</div>
            <div><strong>Verification Status:</strong> <span className="status-pill pending-verification">Pending Verification</span></div>
            <div><strong>Document Uploaded:</strong> {successInfo.college.documentName}</div>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.75rem' }}>
            Submitting this application does not automatically issue a licence. Yashtitva administrators must review and verify the official government approval document before issuing an active software licence.
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn-primary"
              style={{ width: 'auto' }}
              onClick={() => onNavigate('/super-admin/colleges')}
            >
              View in Registered Colleges
            </button>
            <button
              className="btn-secondary"
              onClick={handleResetForm}
            >
              Register Another College
            </button>
          </div>
        </div>
      ) : (
        <div className="registration-form-card">
          {serverError && (
            <div className="banner-alert error" role="alert">
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Field 1: Name of College */}
            <div className="form-group">
              <label htmlFor="collegeName" className="form-label form-label-required">
                Name of College
              </label>
              <input
                id="collegeName"
                type="text"
                className={`form-input ${errors.name ? 'has-error' : ''}`}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter complete legal name of college"
                disabled={isSubmitting}
              />
              {errors.name && <div className="field-error-msg">{errors.name}</div>}
            </div>

            {/* Field 2: Institutional Category */}
            <div className="form-group">
              <label htmlFor="category" className="form-label form-label-required">
                Institutional Category
              </label>
              <select
                id="category"
                className={`form-select ${errors.category ? 'has-error' : ''}`}
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">Select institutional category</option>
                {INSTITUTIONAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <div className="field-error-msg">{errors.category}</div>}
            </div>

            {/* Field 3: Name of Affiliated University (Conditional: visible and required ONLY if Affiliated College) */}
            {formData.category === 'Affiliated College' && (
              <div className="form-group">
                <label htmlFor="affiliatedUniversity" className="form-label form-label-required">
                  Name of Affiliated University
                </label>
                <input
                  id="affiliatedUniversity"
                  type="text"
                  className={`form-input ${errors.affiliatedUniversity ? 'has-error' : ''}`}
                  value={formData.affiliatedUniversity}
                  onChange={(e) => handleChange('affiliatedUniversity', e.target.value)}
                  placeholder="Enter name of the affiliated university"
                  disabled={isSubmitting}
                />
                {errors.affiliatedUniversity && (
                  <div className="field-error-msg">{errors.affiliatedUniversity}</div>
                )}
              </div>
            )}

            {/* Field 4: College Code */}
            <div className="form-group">
              <label htmlFor="collegeCode" className="form-label form-label-required">
                College Code
              </label>
              <input
                id="collegeCode"
                type="text"
                className={`form-input ${errors.collegeCode ? 'has-error' : ''}`}
                value={formData.collegeCode}
                onChange={(e) => handleChange('collegeCode', e.target.value)}
                placeholder="e.g. COEP-1854"
                disabled={isSubmitting}
              />
              {errors.collegeCode && <div className="field-error-msg">{errors.collegeCode}</div>}
            </div>

            {/* Field 5: Unique ID */}
            <div className="form-group">
              <label htmlFor="uniqueId" className="form-label form-label-required">
                Unique ID
              </label>
              <input
                id="uniqueId"
                type="text"
                className={`form-input ${errors.uniqueId ? 'has-error' : ''}`}
                value={formData.uniqueId}
                onChange={(e) => handleChange('uniqueId', e.target.value)}
                placeholder="e.g. UNQ-MH-COEP-01"
                disabled={isSubmitting}
              />
              {errors.uniqueId && <div className="field-error-msg">{errors.uniqueId}</div>}
            </div>

            {/* Field 6: Government Approval Document */}
            <div className="form-group">
              <label htmlFor="govtDocInput" className="form-label form-label-required">
                Government Approval Document
              </label>
              <input
                id="govtDocInput"
                type="file"
                ref={fileInputRef}
                accept="application/pdf"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
              <div className={`file-upload-box ${selectedFile ? 'has-file' : ''}`}>
                <div className="file-status-info">
                  {selectedFile ? (
                    <span><strong>Selected PDF:</strong> {fileStatus}</span>
                  ) : (
                    <span>PDF format only (Max {MAX_FILE_SIZE_MB}MB). No file chosen yet.</span>
                  )}
                </div>
                <button
                  type="button"
                  id="btn-choose-pdf"
                  className="choose-file-btn"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  disabled={isSubmitting}
                >
                  Choose PDF
                </button>
              </div>
              {errors.document && <div className="field-error-msg">{errors.document}</div>}
            </div>

            {/* Form actions: Submit for Verification, Cancel */}
            <div className="form-actions-row">
              <button
                type="submit"
                id="btn-submit-registration"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit for Verification'}
              </button>

              <button
                type="button"
                id="btn-cancel-registration"
                className="btn-secondary"
                onClick={() => onNavigate('/super-admin')}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
