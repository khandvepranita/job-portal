import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div className="logo">⚡ JobPortal Enterprise</div>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/jobs" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '500' }}>
          Jobs
        </Link>

        {user ? (
          <>
            <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
              👤 {user.name} ({user.role ? user.role.replace('ROLE_', '') : 'USER'})
            </span>

            {user.role === 'ROLE_ADMIN' && (
              <Link to="/admin" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: '500' }}>
                Admin Dashboard
              </Link>
            )}

            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid #ef4444',
                color: '#f87171',
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}>
              Login
            </Link>
            <Link to="/register" style={{
              backgroundColor: '#4f46e5',
              color: '#fff',
              padding: '0.4rem 0.9rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
