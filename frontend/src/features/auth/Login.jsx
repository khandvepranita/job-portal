import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ToastNotification } from '../../components/common/ToastNotification';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errs.email = 'Please enter a valid email address.';
      }
    }
    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login({ email: email.trim(), password });
      setToast({ message: 'Authentication successful. Redirecting...', type: 'success' });
      setTimeout(() => navigate('/jobs'), 800);
    } catch (err) {
      if (err.response?.data && typeof err.response.data === 'object' && !err.response.data.message) {
        setErrors(err.response.data);
      }
      const msg = err.response?.data?.message || 
                  (err.response?.data && typeof err.response.data === 'object' ? Object.values(err.response.data)[0] : null) || 
                  'Invalid email or password. Please try again.';
      setToast({ message: msg, type: 'error' });
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Left Visual Panel (~46% Desktop Width) */}
      <div className="login-visual-panel">
        <div className="login-brand-header">
          <div className="login-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <span>CareerConnect</span>
        </div>

        <div className="login-visual-content">
          <h1 className="login-visual-headline">
            Empowering Professionals <br /> & Top Tech Teams
          </h1>
          <p className="login-visual-subtitle">
            Find your perfect role or recruit top talent effortlessly with automated matching and verified credentials.
          </p>

          {/* Glassmorphism Stat Cards Grid */}
          <div className="stat-cards-grid">
            <div className="stat-glass-card">
              <div className="stat-number">98.4%</div>
              <div className="stat-label">Match Rate</div>
              <div className="stat-subtext">Matches Today</div>
            </div>
            <div className="stat-glass-card">
              <div className="stat-number">12.4k+</div>
              <div className="stat-label">Positions</div>
              <div className="stat-subtext">Open Roles Now</div>
            </div>
          </div>

          <div className="trust-badge-card">
            <span className="trust-badge-text">Trusted by 500+ Tech Companies & Enterprise Teams</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
        </div>

        <div className="login-visual-footer">
          <span>© 2026 CareerConnect Platform. Enterprise Security Enabled.</span>
        </div>
      </div>

      {/* Right Login Area */}
      <div className="login-form-area">
        <div className="login-form-card">
          <div className="login-form-header">
            <span className="login-welcome-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              SECURE ACCESS
            </span>
            <h2 className="login-form-title">Sign In to Your Account</h2>
            <p className="login-form-subtitle">Welcome back! Enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email Field with Inline Icon */}
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-with-icon">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  type="email"
                  className={`form-control input-has-icon ${errors.email ? 'input-error' : ''}`}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && (
                <span style={{ color: '#EF4444', fontSize: '0.8rem', display: 'block', marginTop: '0.35rem', fontWeight: 500 }}>
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password Field with Lock Icon & Toggle */}
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot password?
                </Link>
              </div>
              <div className="input-with-icon">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-control input-has-icon input-has-toggle ${errors.password ? 'input-error' : ''}`}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span style={{ color: '#EF4444', fontSize: '0.8rem', display: 'block', marginTop: '0.35rem', fontWeight: 500 }}>
                  {errors.password}
                </span>
              )}
            </div>

            {/* Action Submit */}
            <button type="submit" disabled={loading} className="btn btn-primary login-submit-btn">
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner-sm"></span> Authenticating...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer Navigation Links */}
          <div className="login-footer-links">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Create an account</Link>
            </p>
            <div style={{ marginTop: '0.75rem' }}>
              <Link to="/" className="back-home-link">
                ← Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
