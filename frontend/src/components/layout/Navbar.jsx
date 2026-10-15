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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Close mobile menu and dropdowns when navigating to a new route
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    setNotifsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
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
    <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 900 }}>
      <div className="navbar-container" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <span>JobPortal<span style={{ color: '#2563EB' }}>.io</span></span>
        </Link>

        {/* Right Section: Desktop Links + Quick Theme Toggle + Mobile Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

          {/* Theme Mode Toggle (Always accessible in top bar) */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
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

          {/* Desktop Navigation (Hidden on mobile screens <= 768px via CSS) */}
          <div className="navbar-nav-desktop">
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

            {/* Desktop Notifications Bell */}
            {user && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={handleToggleNotifs}
                  title="Notifications"
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
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    padding: '0.75rem 0',
                    zIndex: 1000
                  }}>
                    <div style={{ padding: '0 1rem 0.6rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Notifications</span>
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
                        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          No new alerts
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            style={{
                              padding: '0.65rem 1rem',
                              borderBottom: '1px solid var(--border-color)',
                              backgroundColor: n.read ? 'transparent' : 'rgba(37, 99, 235, 0.08)',
                              fontSize: '0.825rem'
                            }}
                          >
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.15rem' }}>{n.title}</div>
                            <div style={{ color: 'var(--text-muted)', lineHeight: '1.4' }}>{n.message}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
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

            {/* Desktop User Dropdown / Auth Buttons */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setDropdownOpen(!dropdownOpen); setNotifsOpen(false); }}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    borderRadius: '24px',
                    padding: '4px 12px 4px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    backgroundColor: dropdownOpen ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
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
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {user.name}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    padding: '0.5rem 0',
                    zIndex: 1000
                  }}>
                    <div style={{ padding: '0.65rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
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
                        color: 'var(--text-main)',
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
                        color: 'var(--text-main)',
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
                        color: 'var(--text-main)',
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
                          color: 'var(--text-main)',
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

                    <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.25rem', paddingTop: '0.25rem' }}>
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

          {/* Mobile Hamburger Toggle Button (Visible only on mobile <= 768px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="navbar-mobile-toggle"
            aria-label="Toggle navigation menu"
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              width: '38px',
              height: '38px',
              display: 'none', // Shown on mobile via media query
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-main)',
              padding: 0
            }}
          >
            {mobileMenuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>

        </div>
      </div>

      {/* Mobile Slide-Down Drawer (Visible when hamburger is opened) */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-drawer">
          {user ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--bg-main)',
              borderRadius: '10px',
              marginBottom: '1rem',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user.email}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.9rem', padding: '0.55rem' }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '0.9rem', padding: '0.55rem' }}
              >
                Register
              </Link>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <Link
              to="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className={`mobile-nav-link ${isActive('/jobs') || isActive('/') ? 'active' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Find Jobs
            </Link>

            {user && (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Candidate Profile & ATS Resume
                </Link>

                <Link
                  to="/applications"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`mobile-nav-link ${isActive('/applications') ? 'active' : ''}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  My Applications
                </Link>
              </>
            )}

            <Link
              to="/saved"
              onClick={() => setMobileMenuOpen(false)}
              className={`mobile-nav-link ${isActive('/saved') ? 'active' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              Saved Jobs
            </Link>

            {(isAdmin || isManager) && (
              <Link
                to="/recruiter/applications"
                onClick={() => setMobileMenuOpen(false)}
                className={`mobile-nav-link ${isActive('/recruiter/applications') ? 'active' : ''}`}
                style={{ color: '#2563EB', fontWeight: 600 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
                Recruiter ATS Pipeline
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`mobile-nav-link ${isActive('/admin') ? 'active' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Admin Stats Dashboard
              </Link>
            )}

            {user && (
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  color: '#EF4444',
                  background: 'none',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginTop: '0.5rem',
                  borderTop: '1px solid var(--border-color)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
