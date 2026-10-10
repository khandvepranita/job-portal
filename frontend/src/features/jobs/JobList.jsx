import React, { useState, useEffect } from 'react';
import { jobApi } from '../../api/jobApi';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/common/Loader';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import { ToastNotification } from '../../components/common/ToastNotification';

export const JobList = () => {
  const { user, isAdmin, isManager } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobForm, setJobForm] = useState({ title: '', company: '', location: '', type: 'Full-time', description: '', salary: '' });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await jobApi.getJobs({ page, size: 6, search });
      setJobs(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to fetch jobs from backend server.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, search]);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await jobApi.createJob(jobForm);
      setToast({ message: 'Job created successfully!', type: 'success' });
      setIsModalOpen(false);
      setJobForm({ title: '', company: '', location: '', type: 'Full-time', description: '', salary: '' });
      fetchJobs();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to create job.', type: 'error' });
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to soft-delete this job posting?')) return;
    try {
      await jobApi.deleteJob(id);
      setToast({ message: 'Job posting soft-deleted.', type: 'info' });
      fetchJobs();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Delete failed.', type: 'error' });
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Explore Job Opportunities</h2>
          <p style={{ color: '#94a3b8' }}>Real-time listing powered by Spring Boot REST API & MySQL</p>
        </div>

        {(isAdmin || isManager) && (
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: '#6366f1',
              color: '#fff',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            + Post New Job
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="search-box" style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          className="search-input"
          placeholder="Search by title, company, or location..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
      </div>

      {loading ? (
        <Loader message="Fetching active jobs from Spring Boot backend..." />
      ) : (
        <>
          <div className="job-grid">
            {jobs.length > 0 ? (
              jobs.map(job => (
                <div key={job.id} className="job-card">
                  <h3 className="job-title">{job.title}</h3>
                  <div className="company-name">{job.company}</div>
                  <div className="job-details">
                    <span>📍 {job.location}</span>
                    <span>💼 {job.type}</span>
                  </div>
                  <span className="badge">{job.salary || '$80,000 - $110,000'}</span>
                  <p style={{ marginTop: '0.8rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                    {job.description}
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="apply-btn" onClick={() => alert(`Applied for ${job.title}`)}>
                      Apply Now
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlignment: 'center', gridColumn: '1 / -1', padding: '3rem', color: '#94a3b8' }}>
                No active jobs found matching your search.
              </div>
            )}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </>
      )}

      {/* Post Job Modal */}
      <Modal isOpen={isModalOpen} title="Post New Job Opening" onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Job Title</label>
            <input
              required
              type="text"
              value={jobForm.title}
              onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Company</label>
            <input
              required
              type="text"
              value={jobForm.company}
              onChange={(e) => setJobForm({...jobForm, company: e.target.value})}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Location</label>
            <input
              required
              type="text"
              value={jobForm.location}
              onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Salary Range</label>
            <input
              type="text"
              value={jobForm.salary}
              onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
              placeholder="$90,000 - $120,000"
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Description</label>
            <textarea
              rows="3"
              value={jobForm.description}
              onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
            ></textarea>
          </div>
          <button
            type="submit"
            style={{ padding: '0.75rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
          >
            Publish Job Posting
          </button>
        </form>
      </Modal>

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
