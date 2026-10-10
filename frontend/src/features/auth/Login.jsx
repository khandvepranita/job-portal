import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ToastNotification } from '../../components/common/ToastNotification';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      setToast({ message: 'Login successful! Redirecting...', type: 'success' });
      setTimeout(() => navigate('/jobs'), 1000);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Login failed. Please check credentials.',
        type: 'error'
      });
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Sign In</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
            placeholder="admin@jobportal.com"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: '1rem', padding: '0.75rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem', textAlignment: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
        Don't have an account? <Link to="/register" style={{ color: '#6366f1' }}>Register here</Link>
      </p>

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
