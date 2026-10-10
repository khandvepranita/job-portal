import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#173B57',
      color: '#FFFFFF',
      paddingTop: '3.5rem',
      paddingBottom: '2rem',
      marginTop: 'auto',
      borderTop: '1px solid #1E3E62'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* 4-Column Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>

          {/* Column 1: Brand & Tagline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.35rem', fontWeight: 800, marginBottom: '1rem', color: '#FFFFFF' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <span>JobPortal</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              India's leading career platform connecting top verified candidates with hiring managers and tech companies.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.775rem', color: '#60A5FA' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              256-Bit SSL Encrypted Data Protection
            </div>
          </div>

          {/* Column 2: Job Seekers */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.15rem' }}>
              For Job Seekers
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/jobs" style={{ color: '#CBD5E1', textDecoration: 'none', transition: 'color 0.15s ease' }}>
                  Browse All Jobs
                </Link>
              </li>
              <li>
                <Link to="/profile" style={{ color: '#CBD5E1', textDecoration: 'none' }}>
                  My Candidate Profile
                </Link>
              </li>
              <li>
                <Link to="/saved" style={{ color: '#CBD5E1', textDecoration: 'none' }}>
                  Saved Jobs & Bookmarks
                </Link>
              </li>
              <li>
                <span style={{ color: '#94A3B8', cursor: 'pointer' }}>Career Guidance & Advice</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Recruiters & Employers */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.15rem' }}>
              For Employers
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/admin" style={{ color: '#CBD5E1', textDecoration: 'none' }}>
                  Admin & Recruiter Portal
                </Link>
              </li>
              <li>
                <span style={{ color: '#94A3B8', cursor: 'pointer' }}>Post a New Job Opening</span>
              </li>
              <li>
                <span style={{ color: '#94A3B8', cursor: 'pointer' }}>Search Candidate Resumes</span>
              </li>
              <li>
                <span style={{ color: '#94A3B8', cursor: 'pointer' }}>Enterprise Pricing Plans</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Support */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.15rem' }}>
              Support & Legal
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li><span style={{ color: '#94A3B8', cursor: 'pointer' }}>Privacy Policy</span></li>
              <li><span style={{ color: '#94A3B8', cursor: 'pointer' }}>Terms of Service</span></li>
              <li><span style={{ color: '#94A3B8', cursor: 'pointer' }}>Help Center & FAQs</span></li>
              <li><span style={{ color: '#94A3B8', cursor: 'pointer' }}>Contact Support</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Disclaimer Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justify: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.825rem',
          color: '#94A3B8'
        }}>
          <div>
            © 2026 JobPortal Platform Inc. All rights reserved. Built for candidates & employers.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span>Verified Roles</span>
            <span>Instant Alerts</span>
            <span>Safe & Secure</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
