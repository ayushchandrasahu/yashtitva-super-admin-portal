import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Key, Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import AcademicBackground from '../components/AcademicBackground';

export default function LoginPage({ onLoginSuccess, sessionMessage }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(sessionMessage || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Password reset modal states
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!userId.trim()) {
      errs.userId = 'Super Admin User ID or email is required.';
    }
    if (!password) {
      errs.password = 'Password is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    // If MFA code not requested yet, prompt for MFA verification step
    if (!showMfa) {
      setShowMfa(true);
      return;
    }

    if (!mfaCode.trim()) {
      setErrors({ mfaCode: 'Please enter the 6-digit 2FA security code.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId.trim(),
          password,
          mfaCode: mfaCode.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.field) {
          setErrors({ [data.field]: data.message });
        } else {
          setServerError(data.message || 'Login failed. Please verify your Super Admin credentials.');
        }
        setIsSubmitting(false);
        return;
      }

      // Authentication successful
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      console.error('Login error:', err);
      setServerError('Unable to connect to authentication server. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetError('');
    if (!resetEmail || !resetEmail.includes('@')) {
      setResetError('Please enter a valid registered Super Admin email address.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('/api/auth/reset-password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() })
      });
      const data = await res.json();
      setResetMsg(data.message);
    } catch (err) {
      setResetError('Error contacting authentication gateway.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <AcademicBackground variant="login" />
      
      <div className="login-top-corner">
        <img 
          src="/yashtitva-logo.png" 
          alt="Yashtitva Logo" 
          className="login-logo" 
        />
      </div>

      <div className="login-center-container">
        <div className="login-card">
          <div className="login-badge-strip">
            <ShieldCheck size={14} className="login-badge-icon" />
            <span>AUTHORITY RESTRICTED • SUPER ADMIN ONLY</span>
          </div>

          <h1 className="login-card-title">Business Command Center</h1>
          <p className="login-card-subtitle">
            Secure super admin portal for SaaS financial intelligence, campus licensing, and operations.
          </p>

          {serverError && (
            <div className="banner-alert error" role="alert">
              <AlertCircle size={16} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {!showMfa ? (
              <>
                <div className="form-group">
                  <label htmlFor="userId" className="form-label form-label-required">
                    Super Admin User ID / Email
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="userId"
                      type="text"
                      className={`form-input ${errors.userId ? 'has-error' : ''}`}
                      value={userId}
                      onChange={(e) => {
                        setUserId(e.target.value);
                        if (errors.userId) setErrors({ ...errors, userId: null });
                      }}
                      autoComplete="username"
                      autoFocus
                      placeholder="e.g. admin or owner@yashtitva.com"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.userId && (
                    <div className="field-error-msg">{errors.userId}</div>
                  )}
                </div>

                <div className="form-group">
                  <div className="flex-between">
                    <label htmlFor="password" className="form-label form-label-required">
                      Master Password
                    </label>
                    <button
                      type="button"
                      className="link-btn-text"
                      onClick={() => setIsResetOpen(true)}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="input-wrapper">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`form-input ${errors.password ? 'has-error' : ''}`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: null });
                      }}
                      autoComplete="current-password"
                      placeholder="Enter Super Admin Password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="field-error-msg">{errors.password}</div>
                  )}
                </div>
              </>
            ) : (
              <div className="mfa-step-container">
                <div className="mfa-info-box">
                  <Key size={20} className="mfa-icon" />
                  <div>
                    <strong>Two-Factor Security Authentication (2FA)</strong>
                    <div className="mfa-subtext">Enter the 6-digit TOTP code from your registered platform authenticator app (Demo: any 6 digits).</div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="mfaCode" className="form-label form-label-required">
                    6-Digit Security Code
                  </label>
                  <input
                    id="mfaCode"
                    type="text"
                    maxLength="6"
                    className={`form-input text-center text-lg ${errors.mfaCode ? 'has-error' : ''}`}
                    placeholder="• • • • • •"
                    value={mfaCode}
                    onChange={(e) => {
                      setMfaCode(e.target.value.replace(/\D/g, ''));
                      if (errors.mfaCode) setErrors({ ...errors, mfaCode: null });
                    }}
                    autoFocus
                    disabled={isSubmitting}
                  />
                  {errors.mfaCode && (
                    <div className="field-error-msg">{errors.mfaCode}</div>
                  )}
                </div>

                <button
                  type="button"
                  className="link-btn-text"
                  style={{ marginBottom: '1rem' }}
                  onClick={() => setShowMfa(false)}
                >
                  ← Back to Password Entry
                </button>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}
            >
              {isSubmitting
                ? 'Validating Authority...'
                : showMfa
                ? 'Verify 2FA & Access Command Center'
                : 'Continue with 2FA Verification →'}
            </button>
          </form>

          <div className="login-security-notice">
            <Lock size={12} />
            <span>Protected by brute-force rate-limiting and server-side role validation. Ordinary student or college admin logins will be rejected.</span>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {isResetOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-container reset-modal">
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Key size={18} className="modal-title-icon" />
                <h2 className="modal-title">Super Admin Password Recovery</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => { setIsResetOpen(false); setResetMsg(''); setResetError(''); }}
              >
                ✕
              </button>
            </div>

            {resetMsg && (
              <div className="banner-alert success">
                <CheckCircle2 size={16} />
                <span>{resetMsg}</span>
              </div>
            )}
            {resetError && (
              <div className="banner-alert error">
                <AlertCircle size={16} />
                <span>{resetError}</span>
              </div>
            )}

            {!resetMsg ? (
              <form onSubmit={handlePasswordReset} className="modal-form">
                <p className="reset-instruction">
                  Enter your official platform administrator email address. A cryptographic recovery token will be dispatched to your registered mailbox.
                </p>
                <div className="form-group">
                  <label className="form-label form-label-required">Registered Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. owner@yashtitva.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={isResetting}
                    required
                    autoFocus
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsResetOpen(false)}
                    disabled={isResetting}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={isResetting}>
                    {isResetting ? 'Verifying...' : 'Send Recovery Token'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="modal-actions" style={{ justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setIsResetOpen(false)}
                >
                  Return to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
