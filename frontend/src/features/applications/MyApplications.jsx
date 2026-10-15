import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationApi } from '../../api/applicationApi';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/common/Loader';
import { ToastNotification } from '../../components/common/ToastNotification';

export const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedNoteApp, setSelectedNoteApp] = useState(null);

  const fetchApplications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await applicationApi.getMyApplications();
      setApplications(data || []);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to retrieve application history.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return { bg: '#DCFCE7', text: '#166534', label: 'Offer Extended' };
      case 'INTERVIEW':
        return { bg: '#EDE9FE', text: '#6D28D9', label: 'Interview Scheduled' };
      case 'SHORTLISTED':
        return { bg: '#DBEAFE', text: '#1E40AF', label: 'Shortlisted' };
      case 'UNDER_REVIEW':
        return { bg: '#FEF3C7', text: '#92400E', label: 'Under Review' };
      case 'REJECTED':
        return { bg: '#FEE2E2', text: '#991B1B', label: 'Not Selected' };
      case 'APPLIED':
      default:
        return { bg: '#F1F5F9', text: '#475569', label: 'Submitted' };
    }
  };

  const getStageIndex = (status) => {
    const stages = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED'];
    const idx = stages.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', background: '#FFFFFF', padding: '2.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>Sign In to Track Applications</h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: '1.75rem' }}>View real-time updates and interview invitations from employers.</p>
          <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block', padding: '0.65rem 1.75rem' }}>Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
            My Job Applications
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
            Real-time status tracking and recruiter feedback across {applications.length} submitted position{applications.length === 1 ? '' : 's'}
          </p>
        </div>
        <Link to="/jobs" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          Browse More Jobs
        </Link>
      </div>

      {loading ? (
        <Loader text="Retrieving your candidate application history..." />
      ) : applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>No Applications Submitted Yet</h3>
          <p style={{ color: '#64748B', fontSize: '0.925rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            Find the right role for your skills and apply in one click using your candidate profile.
          </p>
          <Link to="/jobs" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>Explore Available Openings</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {applications.map(app => {
            const badge = getStatusBadge(app.status);
            const stageIdx = getStageIndex(app.status);
            const isRejected = app.status === 'REJECTED';

            return (
              <div key={app.id} style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        {app.jobTitle}
                      </h3>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '3px 12px', borderRadius: '20px', backgroundColor: badge.bg, color: badge.text }}>
                        {badge.label}
                      </span>
                      {app.matchScore && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', backgroundColor: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
                          ⚡ {app.matchScore}% ATS Fit
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 500 }}>
                      {app.jobCompany} • {app.jobLocation} • {app.jobType || 'Full-time'}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#64748B' }}>
                    <div>Applied on: <strong>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}</strong></div>
                    {app.resumeFileName && (
                      <div style={{ marginTop: '0.25rem', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                        {app.resumeFileName}
                      </div>
                    )}
                  </div>
                </div>

                {/* ATS Pipeline Stepper (Visual Progress) */}
                {!isRejected ? (
                  <div style={{ margin: '1.5rem 0 1rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                      {['Submitted', 'Review', 'Shortlist', 'Interview', 'Offer'].map((step, idx) => {
                        const isCompleted = idx <= stageIdx;
                        const isCurrent = idx === stageIdx;
                        return (
                          <div key={step} style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              margin: '0 auto 6px',
                              backgroundColor: isCompleted ? '#2563EB' : '#CBD5E1',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              boxShadow: isCurrent ? '0 0 0 4px #DBEAFE' : 'none',
                              transition: 'all 0.2s ease'
                            }}>
                              {isCompleted ? '✓' : idx + 1}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: isCurrent ? 700 : 500, color: isCompleted ? '#1E293B' : '#94A3B8' }}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ margin: '1rem 0', padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', borderRadius: '8px', color: '#991B1B', fontSize: '0.875rem' }}>
                    Position closed or application was not selected. Keep applying for other active listings!
                  </div>
                )}

                {/* Recruiter Notes or Feedback */}
                {app.recruiterNotes && (
                  <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', backgroundColor: '#F0FDF4', borderLeft: '4px solid #22C55E', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Recruiter Note
                    </span>
                    <p style={{ margin: '0.25rem 0 0', color: '#14532D', fontSize: '0.9rem' }}>
                      {app.recruiterNotes}
                    </p>
                  </div>
                )}

                {/* Match Reason Summary */}
                {app.matchReason && (
                  <p style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '0.75rem', fontStyle: 'italic' }}>
                    ATS Evaluation: {app.matchReason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
