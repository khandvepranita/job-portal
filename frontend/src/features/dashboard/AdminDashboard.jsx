import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../../api/analyticsApi';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/common/Loader';
import { ToastNotification } from '../../components/common/ToastNotification';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await analyticsApi.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error(err);
        setToast({ message: 'Failed to retrieve analytics metrics.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalApps = stats?.totalApplications || 1;
  const statusBreakdown = stats?.statusBreakdown || {};

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System Administration & Analytics
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
            Enterprise Recruiting Insights
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
            Live platform metrics, candidate hiring funnels, and role-based security policies.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/recruiter/applications" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Review Applicants
          </Link>
          <Link to="/jobs" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            Manage Jobs
          </Link>
        </div>
      </div>

      {loading ? (
        <Loader text="Compiling administrative analytics..." />
      ) : (
        <>
          {/* KPI Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Active Jobs</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A' }}>{stats?.activeJobs ?? 0}</div>
              <span style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: 600 }}>{stats?.totalJobs ?? 0} total listings created</span>
            </div>

            <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Total Applications</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A' }}>{stats?.totalApplications ?? 0}</div>
              <span style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 600 }}>Real-time ATS processing</span>
            </div>

            <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Interviews Conducted</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FAF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333EA' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A' }}>{stats?.interviewedCount ?? 0}</div>
              <span style={{ fontSize: '0.8rem', color: '#9333EA', fontWeight: 600 }}>Active technical evaluations</span>
            </div>

            <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Offers Extended</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A' }}>{stats?.acceptedCount ?? 0}</div>
              <span style={{ fontSize: '0.8rem', color: '#D97706', fontWeight: 600 }}>Successful placements</span>
            </div>
          </div>

          {/* Visual ATS Funnel & Security Architecture */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* ATS Pipeline Funnel */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                ATS Candidate Pipeline Funnel
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Volume breakdown across the 5 recruiting lifecycle stages
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {[
                  { label: 'Initial Intake (Applied)', count: statusBreakdown['APPLIED'] || 0, color: '#3B82F6' },
                  { label: 'Under Review (Screening)', count: statusBreakdown['UNDER_REVIEW'] || 0, color: '#F59E0B' },
                  { label: 'Shortlisted for Interview', count: statusBreakdown['SHORTLISTED'] || 0, color: '#6366F1' },
                  { label: 'Technical Interviewing', count: statusBreakdown['INTERVIEW'] || 0, color: '#8B5CF6' },
                  { label: 'Offers Extended / Hired', count: statusBreakdown['ACCEPTED'] || 0, color: '#10B981' },
                  { label: 'Archived / Not Selected', count: statusBreakdown['REJECTED'] || 0, color: '#EF4444' }
                ].map(item => {
                  const pct = totalApps > 0 ? Math.round((item.count / totalApps) * 100) : 0;
                  return (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{item.label}</span>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>{item.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(pct, 4)}%`, height: '100%', backgroundColor: item.color, borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Architecture & Security Controls */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                Active Security & Architecture Stack
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Production-grade controls enforced across backend services
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', borderLeft: '4px solid #2563EB' }}>
                  <strong style={{ color: '#0F172A', display: 'block' }}>JWT HttpOnly Cookie Protection</strong>
                  <span style={{ color: '#64748B' }}>Prevents JavaScript token theft (XSS mitigation) with automated refresh rotation.</span>
                </div>

                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', borderLeft: '4px solid #10B981' }}>
                  <strong style={{ color: '#0F172A', display: 'block' }}>Spring Security RBAC (@PreAuthorize)</strong>
                  <span style={{ color: '#64748B' }}>Method-level authorization isolating ADMIN, MANAGER, and USER roles.</span>
                </div>

                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', borderLeft: '4px solid #8B5CF6' }}>
                  <strong style={{ color: '#0F172A', display: 'block' }}>Deterministic ATS Match Algorithm</strong>
                  <span style={{ color: '#64748B' }}>Keyword extraction engine scoring candidate competencies against vacancy requirements.</span>
                </div>

                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', borderLeft: '4px solid #F59E0B' }}>
                  <strong style={{ color: '#0F172A', display: 'block' }}>JPA Auditing & Soft-Delete Architecture</strong>
                  <span style={{ color: '#64748B' }}>Auto-timestamps and status flagging ensuring continuous data retention compliance.</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
