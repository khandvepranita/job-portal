import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container">
      <h2 style={{ marginBottom: '1rem' }}>⚡ Admin Security Dashboard</h2>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Role-Based Access Control (RBAC) Management System</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem' }}>
          <h4 style={{ color: '#06b6d4', marginBottom: '0.5rem' }}>Logged User Principal</h4>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Assigned Role:</strong> <span className="badge">{user?.role}</span></p>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem' }}>
          <h4 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Security Policies Active</h4>
          <ul style={{ color: '#94a3b8', paddingLeft: '1.2rem', lineHeight: '1.8' }}>
            <li>JWT HttpOnly Cookie Token Storage</li>
            <li>Method Security (@PreAuthorize)</li>
            <li>JPA Auditing (createdAt, createdBy)</li>
            <li>Soft Delete (status = INACTIVE)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
