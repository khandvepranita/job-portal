import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { ToastNotification } from '../../components/common/ToastNotification';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);
  const [extractedToken, setExtractedToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const validate = () => {
    if (!email.trim()) {
      setError('Email address is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email format (e.g. name@example.com).');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      const token = res.token || res.message?.match(/Token:\s*([A-Za-z0-9]+)/i)?.[1] || '';
      setExtractedToken(token);
      if (token) {
        sessionStorage.setItem('reset_token', token);
      }
      setSuccessInfo(res.message);
      setToast({ message: 'Password reset request generated successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'No registered account found with this email.');
      setToast({ message: 'Account lookup failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="auth-card" style={{ maxWidth: '460px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#2563EB' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
            Reset Your Password
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Enter your account email and we'll send you instructions to set a new password.
          </p>
        </div>

        {successInfo ? (
          <div style={{ padding: '1.5rem', backgroundColor: '#F0FDF4', borderRadius: '16px', border: '1px solid #BBF7D0', marginBottom: '1.5rem', textAlign: 'center', boxShadow: '0 4px 16px rgba(22, 163, 74, 0.08)' }}>
            <div style={{ color: '#166534', fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Authorization Key Generated!
            </div>
            <p style={{ color: '#166534', fontSize: '0.875rem', lineHeight: '1.5', margin: '0 0 1.25rem 0' }}>
              We've created a secure one-time verification token for your account. You don't need to write it down—click below to automatically apply it.
            </p>

            {extractedToken && (
              <div style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #BFDBFE', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    One-Time Reset Key
                  </span>
                  <span style={{ fontSize: '0.725rem', color: '#15803D', fontWeight: 700, backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '10px' }}>
                    15 Min Expiry
                  </span>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#1D4ED8', letterSpacing: '0.15em', fontFamily: 'monospace', padding: '0.2rem 0' }}>
                  {extractedToken}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(extractedToken);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{
                    background: copied ? '#DCFCE7' : '#F8FAFC',
                    border: '1px solid',
                    borderColor: copied ? '#86EFAC' : '#CBD5E1',
                    color: copied ? '#15803D' : '#334155',
                    padding: '5px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginTop: '0.25rem'
                  }}
                >
                  {copied ? '✓ Copied to Clipboard!' : '📋 Copy Token'}
                </button>
              </div>
            )}

            <Link
              to={`/reset-password${extractedToken ? `?token=${extractedToken}` : ''}`}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                height: 'auto',
                minHeight: '46px',
                padding: '0.75rem 1rem',
                fontWeight: 700,
                fontSize: '0.95rem',
                textDecoration: 'none',
                borderRadius: '10px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
                boxSizing: 'border-box'
              }}
            >
              <span>Proceed to Set New Password</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="input-label" htmlFor="reset-email">Email Address</label>
              <input
                id="reset-email"
                type="email"
                className={`form-control ${error ? 'input-error' : ''}`}
                placeholder="candidate@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                disabled={loading}
                autoFocus
              />
              {error && (
                <span style={{ color: '#EF4444', fontSize: '0.8rem', display: 'block', marginTop: '0.35rem', fontWeight: 500 }}>
                  {error}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontWeight: 600, fontSize: '0.95rem' }}
            >
              {loading ? 'Sending Instructions...' : 'Send Reset Instructions'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #F1F5F9' }}>
          <Link to="/login" style={{ fontSize: '0.875rem', color: '#2563EB', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
