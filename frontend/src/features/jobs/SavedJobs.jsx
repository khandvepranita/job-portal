import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { savedJobApi } from '../../api/savedJobApi';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/common/Loader';
import { ToastNotification } from '../../components/common/ToastNotification';

export const SavedJobs = () => {
  const { user } = useAuth();
  const [savedList, setSavedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchSavedJobs = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await savedJobApi.getSavedJobs();
      setSavedList(data || []);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to load saved positions.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, [user]);

  const handleRemove = async (jobId) => {
    try {
      await savedJobApi.unsaveJob(jobId);
      setSavedList(prev => prev.filter(item => item.job?.id !== jobId));
      setToast({ message: 'Job removed from bookmarks.', type: 'info' });
    } catch {
      setToast({ message: 'Could not remove bookmark.', type: 'error' });
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', background: '#FFFFFF', padding: '2.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>Sign In to View Saved Jobs</h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: '1.75rem' }}>Keep track of your favorite career opportunities across all your devices.</p>
          <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block', padding: '0.65rem 1.75rem' }}>Sign In to Account</Link>
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
            Saved Opportunities
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
            {savedList.length} bookmarked position{savedList.length === 1 ? '' : 's'} ready for your application
          </p>
        </div>
        <Link to="/jobs" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          Explore More Jobs
        </Link>
      </div>

      {loading ? (
        <Loader text="Loading your bookmarked positions..." />
      ) : savedList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.75"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>No Bookmarked Jobs Yet</h3>
          <p style={{ color: '#64748B', fontSize: '0.925rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            Click the bookmark icon on any job card to save roles you are interested in reviewing later.
          </p>
          <Link to="/jobs" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>Browse Available Positions</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {savedList.map(({ id, job, savedAt }) => (
            <div key={id} style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '3px 10px', borderRadius: '12px' }}>
                    {job.type || 'Full-time'}
                  </span>
                  <button
                    onClick={() => handleRemove(job.id)}
                    title="Remove from saved"
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                  </button>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                  {job.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.75rem' }}>
                  {job.company} • {job.location}
                </p>

                <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: '1.5', marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {job.description}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                    {job.salary || 'Competitive'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    Saved {savedAt ? new Date(savedAt).toLocaleDateString() : 'recently'}
                  </span>
                </div>

                <Link
                  to="/jobs"
                  state={{ applyJobId: job.id }}
                  className="btn btn-primary"
                  style={{ width: '100%', textAlign: 'center', display: 'block', padding: '0.6rem 1rem' }}
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
