import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
          System Administration & Security
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Overview of active role-based access controls, security policies, and system status
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.75rem', boxShadow: 'var(--shadow-subtle)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-navy)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            Active Principal Session
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.925rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Name</span>
              <strong>{user?.name || 'Administrator'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</span>
              <strong>{user?.email || 'admin@jobportal.com'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Security Role</span>
              <span className="badge badge-success" style={{ marginTop: '0.2rem' }}>{user?.role || 'ROLE_ADMIN'}</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.75rem', boxShadow: 'var(--shadow-subtle)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-navy)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            Enforced Security Policies
          </h3>
          <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.8', listStyleType: 'square', paddingLeft: '1.25rem' }}>
            <li><strong style={{ color: 'var(--text-main)' }}>JWT HttpOnly Cookies:</strong> Token storage secured against XSS attacks</li>
            <li><strong style={{ color: 'var(--text-main)' }}>Method Security:</strong> Spring Security `@PreAuthorize` enabled on write/delete APIs</li>
            <li><strong style={{ color: 'var(--text-main)' }}>JPA Auditing:</strong> Automated tracking of entity creation and modification times</li>
            <li><strong style={{ color: 'var(--text-main)' }}>Soft Deletion:</strong> Database records flag `status = INACTIVE` for data retention</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
