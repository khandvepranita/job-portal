import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { ToastNotification } from '../../components/common/ToastNotification';

export const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [toast, setToast] = useState(null);

  // Check URL query parameters for ?token=... or fallback to sessionStorage
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      setIsAutoFilled(true);
    } else {
      const savedToken = sessionStorage.getItem('reset_token');
      if (savedToken) {
        setToken(savedToken);
        setIsAutoFilled(true);
      }
    }
  }, [location.search]);

  const validate = () => {
    const errs = {};
    if (!token.trim()) {
      errs.token = 'Reset token is required.';
    }
    if (!newPassword) {
      errs.newPassword = 'New password is required.';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters long.';
    }
    if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authApi.resetPassword(token.trim(), newPassword);
      sessionStorage.removeItem('reset_token');
      setToast({ message: res.message || 'Password reset successfully! Redirecting...', type: 'success' });
      setTimeout(() => {
        navigate('/login', { state: { message: 'Password updated! Please sign in with your new credentials.' } });
      }, 1500);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Invalid or expired password reset token.';
      setErrors({ form: msg });
      setToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="auth-card" style={{ maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#16A34A' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
            Set New Password
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Enter your reset token and your secure new password.
          </p>
        </div>

        {errors.form && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#991B1B', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="input-label" htmlFor="token">Reset Token</label>
            <input
              id="token"
              type="text"
              className={`form-control ${errors.token ? 'input-error' : ''}`}
              placeholder="e.g. 8A3F1B0C"
              value={token}
              onChange={(e) => { setToken(e.target.value); setErrors(prev => ({ ...prev, token: '' })); }}
              disabled={loading}
            />
            {errors.token && (
              <span style={{ color: '#EF4444', fontSize: '0.8rem', display: 'block', marginTop: '0.3rem' }}>
                {errors.token}
              </span>
            )}
            {isAutoFilled && token && !errors.token && (
              <span style={{ color: '#16A34A', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.35rem', fontWeight: 600 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Token auto-applied from your request
              </span>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="input-label" htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              className={`form-control ${errors.newPassword ? 'input-error' : ''}`}
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setErrors(prev => ({ ...prev, newPassword: '' })); }}
              disabled={loading}
            />
            {errors.newPassword && (
              <span style={{ color: '#EF4444', fontSize: '0.8rem', display: 'block', marginTop: '0.3rem' }}>
                {errors.newPassword}
              </span>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="input-label" htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              className={`form-control ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
              disabled={loading}
            />
            {errors.confirmPassword && (
              <span style={{ color: '#EF4444', fontSize: '0.8rem', display: 'block', marginTop: '0.3rem' }}>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              height: 'auto',
              minHeight: '46px',
              padding: '0.75rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              borderRadius: '10px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)'
            }}
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #F1F5F9' }}>
          <Link to="/login" style={{ fontSize: '0.875rem', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
