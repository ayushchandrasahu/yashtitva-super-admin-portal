import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage({ onLoginSuccess, sessionMessage }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(sessionMessage || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!userId.trim()) {
      errs.userId = 'User ID is required.';
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

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId.trim(),
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.field) {
          setErrors({ [data.field]: data.message });
        } else {
          setServerError(data.message || 'Login failed. Please verify your credentials.');
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

  return (
    <div className="login-page-wrapper">
      <div className="login-top-corner">
        <img 
          src="/yashtitva-logo.png" 
          alt="Yashtitva Logo" 
          className="login-logo" 
        />
      </div>

      <div className="login-center-container">
        <div className="login-card">
          <h1 className="login-card-title">Super Admin Login</h1>

          {serverError && (
            <div className="banner-alert error" role="alert">
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="userId" className="form-label form-label-required">
                User ID
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
                  placeholder="Enter Super Admin User ID"
                  disabled={isSubmitting}
                />
              </div>
              {errors.userId && (
                <div className="field-error-msg">{errors.userId}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label form-label-required">
                Password
              </label>
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
                  placeholder="Enter Password"
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

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{ marginTop: '0.75rem' }}
            >
              {isSubmitting ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
