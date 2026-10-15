import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationApi } from '../../api/notificationApi';

export const Navbar = () => {
  const { user, isAdmin, isManager, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Fetch notifications
  useEffect(() => {
    if (user) {
      notificationApi.getUnreadCount()
        .then(count => setUnreadCount(count))
        .catch(() => {});

      notificationApi.getNotifications()
        .then(data => setNotifications(data || []))
        .catch(() => {});
    }
  }, [user]);

  const handleToggleNotifs = async () => {
    setNotifsOpen(!notifsOpen);
    setDropdownOpen(false);
    if (!notifsOpen && user) {
      try {
        const list = await notificationApi.getNotifications();
        setNotifications(list || []);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 900, backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#0F172A', fontWeight: 800, fontSize: '1.25rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </div>
        <span>JobPortal<span style={{ color: '#2563EB' }}>.io</span></span>
      </Link>

      <div className="navbar-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <Link to="/jobs" className={`nav-link ${isActive('/jobs') || isActive('/') ? 'active' : ''}`}>
          Find Jobs
        </Link>

        {user && (
          <Link to="/applications" className={`nav-link ${isActive('/applications') ? 'active' : ''}`}>
            My Applications
          </Link>
        )}

        <Link to="/saved" className={`nav-link ${isActive('/saved') ? 'active' : ''}`}>
          Saved Jobs
        </Link>

        {(isAdmin || isManager) && (
          <Link to="/recruiter/applications" className={`nav-link ${isActive('/recruiter/applications') ? 'active' : ''}`} style={{ color: '#2563EB', fontWeight: 600 }}>
            Recruiter ATS
          </Link>
        )}

        {isAdmin && (
          <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
            Admin Stats
          </Link>
        )}

        {/* Theme Mode Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-main)',
            transition: 'all 0.2s ease',
            padding: 0
          }}
        >
          {isDark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>

        {/* Real-time Notifications Bell */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={handleToggleNotifs}
              title="Notifications"
              style={{
                background: 'none',
                border: '1px solid #E2E8F0',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
                position: 'relative'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifsOpen && (
              <div style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: '320px',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                padding: '0.75rem 0',
                zIndex: 1000
              }}>
                <div style={{ padding: '0 1rem 0.6rem 1rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                      No new alerts
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        style={{
                          padding: '0.65rem 1rem',
                          borderBottom: '1px solid #F8FAFC',
                          backgroundColor: n.read ? '#FFFFFF' : '#F0F9FF',
                          fontSize: '0.825rem'
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: '0.15rem' }}>{n.title}</div>
                        <div style={{ color: '#475569', lineHeight: '1.4' }}>{n.message}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Just now'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {user ? (
          <div style={{ position: 'relative' }}>
            {/* User Candidate Pill Button (Naukri/Indeed style) */}
            <button
              onClick={() => { setDropdownOpen(!dropdownOpen); setNotifsOpen(false); }}
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
                    textDecoration: 'none'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Candidate Profile
                </Link>

                <Link
                  to="/applications"
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
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  My Applications
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
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Saved Jobs
                </Link>

                {(isAdmin || isManager) && (
                  <Link
                    to="/recruiter/applications"
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
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                    Recruiter ATS
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.65rem 1rem',
                      fontSize: '0.875rem',
                      color: '#0F172A',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
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
                      textAlign: 'left'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.875rem' }}>
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.875rem' }}>
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
