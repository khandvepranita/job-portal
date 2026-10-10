import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ToastNotification } from '../../components/common/ToastNotification';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [toast, setToast] = useState(null);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ name, email, password, role });
      setToast({ message: 'Registration successful! Please sign in.', type: 'success' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Registration failed.',
        type: 'error'
      });
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '3rem auto', padding: '2rem', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create Account</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8' }}>Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
            placeholder="John Doe"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8' }}>Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8' }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
            placeholder="••••••••"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8' }}>Select Role (RBAC)</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
          >
            <option value="USER">User (Job Seeker)</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: '1rem', padding: '0.75rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
        Already have an account? <Link to="/login" style={{ color: '#6366f1' }}>Sign in</Link>
      </p>

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
