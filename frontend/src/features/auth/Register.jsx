import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ToastNotification } from '../../components/common/ToastNotification';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('USER');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters.';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errs.email = 'Please enter a valid email address (e.g. name@company.com).';
      }
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirmation password is required.';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (!agreedTerms) {
      errs.terms = 'Please accept the Terms of Service to proceed.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await register({ name: name.trim(), email: email.trim(), password, role });
      setToast({ message: 'Account created successfully! Redirecting to sign in...', type: 'success' });
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      if (err.response?.data && typeof err.response.data === 'object' && !err.response.data.message) {
        setErrors(err.response.data);
      }
      const msg = err.response?.data?.message || 
                  (err.response?.data && typeof err.response.data === 'object' ? Object.values(err.response.data)[0] : null) || 
                  'Registration failed. Please try again.';
      setToast({ message: msg, type: 'error' });
    }
  };

  const roleOptions = [
    {
      id: 'USER',
      title: 'Job Seeker',
      desc: 'Explore roles, apply & track applications'
    },
    {
      id: 'MANAGER',
      title: 'Hiring Manager',
      desc: 'Post openings & recruit top talent'
    },
    {
      id: 'EMPLOYEE',
      title: 'Employee',
      desc: 'Internal career development & referral'
    },
    {
      id: 'ADMIN',
      title: 'Administrator',
      desc: 'Full portal control & governance'
    }
  ];

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
            Start Your Journey <br /> & Accelerate Growth
          </h1>
          <p className="login-visual-subtitle">
            Join thousands of verified candidates and leading enterprise teams building the future of hiring today.
          </p>

          {/* Glassmorphism Stat Cards Grid */}
          <div className="stat-cards-grid">
            <div className="stat-glass-card">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Active Users</div>
              <div className="stat-subtext">Verified Profiles</div>
            </div>
            <div className="stat-glass-card">
              <div className="stat-number">4.9/5</div>
              <div className="stat-label">Platform Rating</div>
              <div className="stat-subtext">10K+ Client Reviews</div>
            </div>
          </div>

          <div className="trust-badge-card">
            <span className="trust-badge-text">Instant profile activation & encrypted candidate data</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
        </div>

        <div className="login-visual-footer">
          <span>© 2026 CareerConnect Platform. Enterprise Security Enabled.</span>
        </div>
      </div>

      {/* Right Register Form Area */}
      <div className="login-form-area">
        <div className="login-form-card" style={{ maxWidth: '480px' }}>
          <div className="login-form-header">
            <span className="login-welcome-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              GET STARTED TODAY
            </span>
            <h2 className="login-form-title">Create Your Account</h2>
            <p className="login-form-subtitle">Fill in your information to join CareerConnect.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name Field */}
            <div className="input-group">
              <label className="input-label">Full Name *</label>
              <div className="input-with-icon">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  type="text"
                  className={`form-control input-has-icon ${errors.name ? 'input-error' : ''}`}
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
                  placeholder="e.g. Alex Morgan"
                />
              </div>
              {errors.name && (
                <span style={{ color: '#EF4444', fontSize: '0.8rem', display: 'block', marginTop: '0.35rem', fontWeight: 500 }}>
                  {errors.name}
                </span>
              )}
            </div>

            {/* Email Address Field */}
            <div className="input-group">
              <label className="input-label">Email Address *</label>
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
                  placeholder="alex@company.com"
                />
              </div>
              {errors.email && (
                <span style={{ color: '#EF4444', fontSize: '0.8rem', display: 'block', marginTop: '0.35rem', fontWeight: 500 }}>
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password Field with Eye Toggle */}
            <div className="input-group">
              <label className="input-label">Password *</label>
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
                  placeholder="Minimum 6 characters"
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

            {/* Confirm Password Field */}
            <div className="input-group">
              <label className="input-label">Confirm Password *</label>
              <div className="input-with-icon">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-control input-has-icon ${errors.confirmPassword ? 'input-error' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
                  placeholder="Re-enter your password"
                />
              </div>
              {errors.confirmPassword && (
                <span style={{ color: '#EF4444', fontSize: '0.8rem', display: 'block', marginTop: '0.35rem', fontWeight: 500 }}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Account Role Card Selector */}
            <div className="input-group">
              <label className="input-label">Select Account Role *</label>
              <div className="role-cards-grid">
                {roleOptions.map((opt) => {
                  const isActive = role === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className={`role-card ${isActive ? 'active' : ''}`}
                      onClick={() => setRole(opt.id)}
                    >
                      <div className="role-card-header">
                        <span className="role-card-title">{opt.title}</span>
                        <div className="role-check-badge">
                          {isActive && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="role-card-desc">{opt.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Terms Agreement Checkbox */}
            <div style={{ marginTop: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedTerms}
                  onChange={(e) => { setAgreedTerms(e.target.checked); setErrors(prev => ({ ...prev, terms: '' })); }}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
                />
                <label htmlFor="terms" style={{ fontSize: '0.825rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  I agree to the <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Terms of Service</span> & <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Privacy Policy</span>
                </label>
              </div>
              {errors.terms && (
                <span style={{ color: '#EF4444', fontSize: '0.8rem', display: 'block', marginTop: '0.35rem', fontWeight: 500 }}>
                  {errors.terms}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="btn btn-primary login-submit-btn">
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner-sm"></span> Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer Navigation Links */}
          <div className="login-footer-links">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
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
