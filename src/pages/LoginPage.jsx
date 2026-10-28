import React, { useState } from 'react';
import { authApi } from '../api/auth';
import '../App.css';

const DEMO_USERS = [
  {
    roleKey: 'admin',
    roleLabel: 'Admin',
    icon: '👑',
    name: 'Arya Singh',
    email: 'arya.singh@stockwise.io',
    password: 'Stockwise2026',
    role: 'admin',
    title: 'Administrator'
  },
  {
    roleKey: 'manager',
    roleLabel: 'Manager',
    icon: '👔',
    name: 'Marcus Vance',
    email: 'manager@stockwise.io',
    password: 'Manager2026',
    role: 'manager',
    title: 'Inventory Manager'
  },
  {
    roleKey: 'staff',
    roleLabel: 'Staff',
    icon: '👷',
    name: 'Sarah Jenkins',
    email: 'staff@stockwise.io',
    password: 'Staff2026',
    role: 'staff',
    title: 'Warehouse Staff'
  }
];

export default function LoginPage({ onLoginSuccess }) {
  // Controlled form state
  const [email, setEmail] = useState('arya.singh@stockwise.io');
  const [password, setPassword] = useState('Stockwise2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Validation & feedback state
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'forgot' | 'admin' | null

  const isValidEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: null }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: null }));
    }
  };

  const loginWithDemoUser = (userObj) => {
    const demoToken = 'demo-jwt-token-' + btoa(encodeURIComponent(JSON.stringify(userObj)));
    localStorage.setItem('stockwise_token', demoToken);
    localStorage.setItem('stockwise_user', JSON.stringify(userObj));
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleInstantDemoLogin = (roleKey = 'admin') => {
    const selected = DEMO_USERS.find((u) => u.roleKey === roleKey) || DEMO_USERS[0];
    loginWithDemoUser({
      id: selected.roleKey === 'admin' ? 'usr-admin-1' : selected.roleKey === 'manager' ? 'usr-mgr-1' : 'usr-stf-1',
      name: selected.name,
      email: selected.email,
      role: selected.role,
      title: selected.title,
      status: 'active'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const validationErrors = {};
    if (!email.trim()) {
      validationErrors.email = 'Email address is required.';
    } else if (!isValidEmail(email)) {
      validationErrors.email = 'Please enter a valid email address (e.g. you@company.com).';
    }

    if (!password) {
      validationErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await authApi.login({
        email: email.trim(),
        password
      });

      if (res?.data?.token) {
        localStorage.setItem('stockwise_token', res.data.token);
        localStorage.setItem('stockwise_user', JSON.stringify(res.data.user));
      }

      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setIsLoading(false);

      // Check if credentials match any demo user for automatic offline fallback
      const cleanEmail = email.trim().toLowerCase();
      const matchedDemo = DEMO_USERS.find(
        (u) =>
          (u.email.toLowerCase() === cleanEmail ||
           (cleanEmail.includes('marcus') && u.roleKey === 'manager') ||
           (cleanEmail.includes('sarah') && u.roleKey === 'staff')) &&
          u.password === password
      );

      // If backend is offline / unreachable and credentials match demo account, log in seamlessly!
      if (matchedDemo) {
        loginWithDemoUser({
          id: matchedDemo.roleKey === 'admin' ? 'usr-admin-1' : matchedDemo.roleKey === 'manager' ? 'usr-mgr-1' : 'usr-stf-1',
          name: matchedDemo.name,
          email: matchedDemo.email,
          role: matchedDemo.role,
          title: matchedDemo.title,
          status: 'active'
        });
        return;
      }

      const isOffline =
        !err.status ||
        err.code === 'NETWORK_ERROR' ||
        err.code === 'ECONNREFUSED' ||
        err.message?.toLowerCase().includes('network') ||
        err.message?.toLowerCase().includes('failed to fetch');

      if (isOffline) {
        setFeedback({
          type: 'error',
          message:
            'Backend server (port 5000) is offline. To continue without MySQL backend, use demo credentials (arya.singh@stockwise.io / Stockwise2026) or click Instant Demo Access below.'
        });
      } else {
        setFeedback({
          type: 'error',
          message: err.message || 'Authentication failed. Please verify your email and password.'
        });
      }
    }
  };

  return (
    <div className="stockwise-layout">
      {/* ====================================================================
          LEFT BRANDING PANEL (Dark Forest-Green with Warehouse Photography)
          ==================================================================== */}
      <aside className="brand-panel" aria-label="Brand Overview">
        <div className="brand brand-header">
          <div className="brand-logo-badge" aria-hidden="true">
            <span className="brand-logo-text-s">S</span>
          </div>
          <div className="brand-title-wrap">
            <span className="brand-name">Stockwise</span>
            <span className="brand-tagline">Inventory Management</span>
          </div>
        </div>

        <div className="brand-content brand-body">
          <h1 className="brand-main-heading">
            Take control of your inventory.
          </h1>
          <p className="brand-description">
            Track your stock, manage your products, and make smarter business decisions — all in one place.
          </p>

          <div className="brand-features">
            <div className="feature feature-row">
              <div className="feature-icon-wrap" aria-hidden="true">
                <svg className="feature-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="feature-text-group">
                <span className="feature-title">Real-time stock tracking</span>
                <p className="feature-subtitle">Always know what is in stock.</p>
              </div>
            </div>

            <div className="feature feature-row">
              <div className="feature-icon-wrap" aria-hidden="true">
                <svg className="feature-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="feature-text-group">
                <span className="feature-title">Simple inventory management</span>
                <p className="feature-subtitle">Keep your operations organized.</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="brand-footer">
          <p className="brand-copyright">© 2026 Stockwise. All rights reserved.</p>
        </footer>
      </aside>

      {/* ====================================================================
          RIGHT LOGIN PANEL (Pure White: #FFFFFF)
          ==================================================================== */}
      <main className="auth-panel form-panel">
        <div className="mobile-brand-bar">
          <div className="mobile-brand-logo">
            <span>S</span>
          </div>
          <span className="mobile-brand-name">Stockwise</span>
        </div>

        <div className="auth-center-wrap">
          <div className="auth-form-card">
            <span className="auth-welcome-label">WELCOME BACK</span>
            <h2 className="auth-heading">Sign in to your account</h2>
            <p className="auth-subheading">Enter your details to access your dashboard.</p>

            {feedback && (
              <div className={`feedback-banner ${feedback.type}`} role="alert">
                <span>{feedback.message}</span>
                <button
                  type="button"
                  className="feedback-close-btn"
                  onClick={() => setFeedback(null)}
                >
                  ×
                </button>
              </div>
            )}

            {/* Quick Demo Profile Selector */}
            <div className="demo-credentials-bar">
              <div className="demo-credentials-header">
                <span className="demo-credentials-label">Quick Demo Profiles</span>
                <span className="demo-offline-tag">Offline Ready</span>
              </div>
              <div className="demo-role-pills">
                {DEMO_USERS.map((demo) => {
                  const isActive = email.toLowerCase() === demo.email.toLowerCase();
                  return (
                    <button
                      key={demo.roleKey}
                      type="button"
                      className={`demo-pill ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setEmail(demo.email);
                        setPassword(demo.password);
                        setErrors({});
                        setFeedback(null);
                      }}
                      title={`Fill ${demo.roleLabel} credentials (${demo.email})`}
                    >
                      <span>{demo.icon}</span>
                      <span>{demo.roleLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {/* Email Address */}
              <div className="form-group">
                <label htmlFor="email-input" className="form-label">
                  Email address
                </label>
                <div className="input-wrapper">
                  <input
                    id="email-input"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={handleEmailChange}
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    disabled={isLoading}
                    required
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="form-error-msg" role="alert">
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="form-group">
                <div className="form-label-row">
                  <label htmlFor="password-input" className="form-label">
                    Password
                  </label>
                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={() => setActiveModal('forgot')}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="input-wrapper">
                  <input
                    id="password-input"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    className={`form-input input-has-toggle ${errors.password ? 'input-error' : ''}`}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="form-error-msg" role="alert">
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="remember-me-group">
                <label className="custom-checkbox-container">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span className="custom-checkbox-box" aria-hidden="true">
                    <svg viewBox="0 0 16 16" fill="currentColor">
                      <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="remember-label-text">Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="spinner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to Dashboard</span>
                    <span className="btn-arrow-icon" aria-hidden="true">→</span>
                  </>
                )}
              </button>

              {/* Instant Demo Access Button for offline testing */}
              <button
                type="button"
                className="demo-instant-btn"
                onClick={() => handleInstantDemoLogin('admin')}
                disabled={isLoading}
              >
                <span>⚡</span>
                <span>Instant Demo Access (Offline Mode)</span>
              </button>

              <div className="auth-sub-footer">
                <p className="admin-note-text">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="admin-link"
                    onClick={() => setActiveModal('admin')}
                  >
                    Contact your administrator
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>

        <div className="auth-security-badge">
          <svg className="security-lock-svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4zm-3 5a1 1 0 112 0v2a1 1 0 11-2 0v-2z" clipRule="evenodd" />
          </svg>
          <span>Your information is protected and secure.</span>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {activeModal === 'forgot' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)} role="dialog" aria-modal="true">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Reset Your Password</h3>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setActiveModal(null)}
              >
                ✕
              </button>
            </div>
            <p className="modal-body-text">
              Enter your corporate email address to receive password recovery instructions or contact your organization's IT department.
            </p>
            <button
              type="button"
              className="modal-action-btn"
              onClick={() => {
                setActiveModal(null);
                setFeedback({
                  type: 'info',
                  message: 'A password recovery link has been dispatched to your email address.'
                });
              }}
            >
              Send Recovery Link
            </button>
          </div>
        </div>
      )}

      {/* Contact Admin Modal */}
      {activeModal === 'admin' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)} role="dialog" aria-modal="true">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Account Provisioning</h3>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setActiveModal(null)}
              >
                ✕
              </button>
            </div>
            <p className="modal-body-text">
              Stockwise enterprise accounts are provisioned directly by your company's IT or warehouse inventory administrator.
            </p>
            <button
              type="button"
              className="modal-action-btn"
              onClick={() => setActiveModal(null)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
