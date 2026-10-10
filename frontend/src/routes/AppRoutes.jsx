import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../features/auth/Login';
import { Register } from '../features/auth/Register';
import { JobList } from '../features/jobs/JobList';
import { CandidateProfile } from '../features/profile/CandidateProfile';
import { AdminDashboard } from '../features/dashboard/AdminDashboard';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/jobs" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/jobs" element={<JobList />} />
      <Route path="/profile" element={<CandidateProfile />} />

      {/* Protected RBAC Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="/unauthorized" element={
        <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444' }}>
          <h2>403 - Access Denied</h2>
          <p style={{ color: '#94a3b8' }}>You do not have the required permissions to access this page.</p>
        </div>
      } />

      <Route path="*" element={<Navigate to="/jobs" replace />} />
    </Routes>
  );
};
