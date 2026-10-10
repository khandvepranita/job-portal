import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 900 }}>
      <Link to="/" className="navbar-brand">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
        <span>JobPortal</span>
      </Link>

      <div className="navbar-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <Link to="/jobs" className={`nav-link ${isActive('/jobs') || isActive('/') ? 'active' : ''}`}>
          Find Jobs
        </Link>
        <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
          My Profile
        </Link>
        <Link to="/saved" className={`nav-link ${isActive('/saved') ? 'active' : ''}`}>
          Saved Jobs
        </Link>

        {user ? (
          <div style={{ position: 'relative', marginLeft: '0.5rem' }}>
            {/* User Candidate Pill Button (Naukri/Indeed style) */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                background: 'none',
                border: '1px solid #E2E8F0',
                borderRadius: '24px',
                padding: '4px 12px 4px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                backgroundColor: dropdownOpen ? '#F1F5F9' : '#FFFFFF',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>
                {user.name}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: '220px',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                padding: '0.5rem 0',
                zIndex: 1000
              }}>
                <div style={{ padding: '0.65rem 1rem', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{user.email}</div>
                  <div style={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 600, marginTop: '0.2rem' }}>
                    Role: {user.role ? user.role.replace('ROLE_', '') : 'CANDIDATE'}
                  </div>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.65rem 1rem',
                    fontSize: '0.875rem',
                    color: '#334155',
                    textDecoration: 'none',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#F8FAFC'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  View Candidate Profile
                </Link>

                <Link
                  to="/saved"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.65rem 1rem',
                    fontSize: '0.875rem',
                    color: '#334155',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#F8FAFC'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Saved Jobs
                </Link>

                {user.role === 'ROLE_ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.65rem 1rem',
                      fontSize: '0.875rem',
                      color: '#2563EB',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#EFF6FF'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    Admin Dashboard
                  </Link>
                )}

                <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '0.25rem', paddingTop: '0.25rem' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.65rem 1rem',
                      fontSize: '0.875rem',
                      color: '#EF4444',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: 600
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#FEF2F2'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                  </button>
                </div>

              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingLeft: '0.5rem' }}>
            <Link to="/login" className="btn btn-secondary" style={{ height: '36px', padding: '0 1rem', fontSize: '0.875rem' }}>
              Log In
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ height: '36px', padding: '0 1rem', fontSize: '0.875rem' }}>
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
