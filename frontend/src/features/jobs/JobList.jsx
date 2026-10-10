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
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('ALL');
  const [selectedJobType, setSelectedJobType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Saved & Applied Jobs LocalStorage Persistence (Naukri style)
  const storageUserKey = user?.email || 'guest';

  const [savedJobs, setSavedJobs] = useState(() => {
    const saved = localStorage.getItem(`saved_jobs_${storageUserKey}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [appliedJobs, setAppliedJobs] = useState(() => {
    const applied = localStorage.getItem(`applied_jobs_${storageUserKey}`);
    return applied ? JSON.parse(applied) : {};
  });

  // Post Job Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [jobForm, setJobForm] = useState({ title: '', company: '', location: '', type: 'Full-time', description: '', salary: '' });

  // One-Click Apply Modal State (Naukri style)
  const [applyModalJob, setApplyModalJob] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [isSubmittingApply, setIsSubmittingApply] = useState(false);

  useEffect(() => {
    localStorage.setItem(`saved_jobs_${storageUserKey}`, JSON.stringify(savedJobs));
  }, [savedJobs, storageUserKey]);

  useEffect(() => {
    localStorage.setItem(`applied_jobs_${storageUserKey}`, JSON.stringify(appliedJobs));
  }, [appliedJobs, storageUserKey]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await jobApi.getJobs({ page, size: 6, search });
      setJobs(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to connect to backend service.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchJobs();
  };

  const toggleSaveJob = (id) => {
    setSavedJobs(prev => {
      const newState = { ...prev, [id]: !prev[id] };
      setToast({
        message: newState[id] ? 'Job saved to your bookmarks.' : 'Job removed from bookmarks.',
        type: 'info'
      });
      return newState;
    });
  };

  const handleOpenApplyModal = (job) => {
    if (!user) {
      setToast({ message: 'Please sign in to apply for positions.', type: 'error' });
      return;
    }
    setApplyModalJob(job);
    setCoverNote('');
  };

  const handleConfirmApply = async (e) => {
    e.preventDefault();
    if (!applyModalJob) return;
    setIsSubmittingApply(true);

    setTimeout(() => {
      setAppliedJobs(prev => ({
        ...prev,
        [applyModalJob.id]: {
          appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'Application Submitted'
        }
      }));

      setIsSubmittingApply(false);
      setToast({ message: `🎉 Application submitted successfully for ${applyModalJob.title}!`, type: 'success' });
      setApplyModalJob(null);
    }, 800);
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await jobApi.createJob(jobForm);
      setToast({ message: 'Job posting created successfully!', type: 'success' });
      setIsPostModalOpen(false);
      setJobForm({ title: '', company: '', location: '', type: 'Full-time', description: '', salary: '' });
      fetchJobs();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to create job posting.', type: 'error' });
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await jobApi.deleteJob(id);
      setToast({ message: 'Job posting deleted.', type: 'info' });
      fetchJobs();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Delete operation failed.', type: 'error' });
    }
  };

  // Filter Jobs by location and type
  const filteredJobs = jobs.filter(job => {
    const matchLocation = !locationSearch || job.location.toLowerCase().includes(locationSearch.toLowerCase());
    const matchType = selectedJobType === 'ALL' || (job.type && job.type.toLowerCase().includes(selectedJobType.toLowerCase()));
    return matchLocation && matchType;
  });

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: 'calc(100vh - 61px)', paddingBottom: '3rem' }}>

      {/* Naukri-Style Search Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #173B57 0%, #0B192C 75%, #1E3E62 100%)',
        color: '#FFFFFF',
        padding: '3rem 1.5rem 3.5rem 1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(37, 99, 235, 0.25)',
            border: '1px solid rgba(96, 165, 250, 0.3)',
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '0.825rem',
            fontWeight: 600,
            color: '#60A5FA',
            marginBottom: '1rem'
          }}>
            🚀 50,000+ Verified Tech & Enterprise Jobs Live Now
          </span>

          <h1 style={{ fontSize: '2.35rem', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: '0.75rem', color: '#FFFFFF' }}>
            Find Your Dream Role on India's Tech Career Portal
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#93C5FD', maxWidth: '650px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
            Explore verified openings from top MNCs, unicorn startups, and hiring teams.
          </p>

          {/* Naukri 3-Field Hero Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '0.6rem',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr) auto',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg style={{ position: 'absolute', left: '14px', color: '#64748B' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.6rem', border: 'none', background: 'transparent', boxShadow: 'none', height: '46px' }}
                placeholder="Skills, Designation, Company (e.g. Java, React, Developer)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', borderLeft: '1px solid #E2E8F0' }}>
              <svg style={{ position: 'absolute', left: '14px', color: '#64748B' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.6rem', border: 'none', background: 'transparent', boxShadow: 'none', height: '46px' }}
                placeholder="Location (e.g. Pune, Mumbai, Remote)"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ height: '46px', padding: '0 1.75rem', fontSize: '0.95rem', fontWeight: 700, borderRadius: 'var(--radius-md)' }}>
              Search Jobs
            </button>
          </form>
        </div>
      </section>

      {/* Main Container Layout: Left Filters Sidebar vs Right Job Cards */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.25rem' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '270px minmax(0, 1fr)', gap: '1.5rem' }}>

          {/* Left Naukri Filter Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  All Filters
                </h3>
                <button
                  onClick={() => { setSelectedJobType('ALL'); setSelectedExperience('ALL'); setLocationSearch(''); setSearch(''); }}
                  style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Reset
                </button>
              </div>

              {/* Work Mode / Job Type Filter */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.6rem' }}>
                  Work Mode / Type
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                  {['ALL', 'Full-time', 'Remote', 'Part-time', 'Contract'].map((type) => (
                    <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="jobType"
                        checked={selectedJobType === type}
                        onChange={() => setSelectedJobType(type)}
                        style={{ accentColor: '#2563EB', cursor: 'pointer' }}
                      />
                      <span>{type === 'ALL' ? 'All Work Modes' : type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Range Filter */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.6rem' }}>
                  Experience Level
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                  {[
                    { id: 'ALL', label: 'Any Experience' },
                    { id: '0-1', label: 'Freshers (0 - 1 Yrs)' },
                    { id: '1-3', label: 'Intermediate (1 - 3 Yrs)' },
                    { id: '3-5', label: 'Experienced (3 - 5 Yrs)' },
                    { id: '5+', label: 'Senior Lead (5+ Yrs)' }
                  ].map((exp) => (
                    <label key={exp.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="expLevel"
                        checked={selectedExperience === exp.id}
                        onChange={() => setSelectedExperience(exp.id)}
                        style={{ accentColor: '#2563EB', cursor: 'pointer' }}
                      />
                      <span>{exp.label}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Recruiter Quick Banner */}
            {(isAdmin || isManager) && (
              <div style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 'var(--radius-lg)',
                padding: '1.15rem',
                textAlign: 'center'
              }}>
                <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#1E40AF', margin: '0 0 0.4rem 0' }}>
                  📢 Recruiter Action
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#1E3A8A', margin: '0 0 0.85rem 0' }}>
                  Post new openings to reach top candidates.
                </p>
                <button
                  onClick={() => setIsPostModalOpen(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '0.85rem', height: '36px' }}
                >
                  + Post New Job
                </button>
              </div>
            )}

          </aside>

          {/* Right Main Job Feed Column */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Header Result Counter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                  Recommended Openings ({filteredJobs.length})
                </h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Page {page + 1} of {totalPages || 1} • Verified Hiring Partners
                </span>
              </div>

              {(isAdmin || isManager) && (
                <button onClick={() => setIsPostModalOpen(true)} className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
                  + Post Job
                </button>
              )}
            </div>

            {/* Content Cards */}
            {loading ? (
              <Loader message="Fetching Naukri job listings..." />
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map(job => {
                      const isSaved = !!savedJobs[job.id];
                      const appliedInfo = appliedJobs[job.id];
                      const companyInitial = job.company ? job.company.charAt(0).toUpperCase() : 'J';

                      return (
                        <div key={job.id} style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--border-color)',
                          padding: '1.5rem',
                          boxShadow: 'var(--shadow-subtle)',
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}>
                          <div style={{ display: 'flex', gap: '1.15rem', alignItems: 'flex-start' }}>

                            {/* Company Logo Avatar */}
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '12px',
                              backgroundColor: '#F1F5F9',
                              border: '1px solid #E2E8F0',
                              color: '#173B57',
                              fontSize: '1.25rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {companyInitial}
                            </div>

                            {/* Main Content */}
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.2rem 0' }}>
                                    {job.title}
                                  </h3>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-navy)' }}>
                                      {job.company}
                                    </span>
                                    <span style={{
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      backgroundColor: '#FEF3C7',
                                      color: '#D97706',
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}>
                                      ⭐ 4.2 | 1.1k+ Reviews
                                    </span>
                                  </div>
                                </div>

                                {/* Bookmark Save Button */}
                                <button
                                  onClick={() => toggleSaveJob(job.id)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    color: isSaved ? '#2563EB' : '#94A3B8'
                                  }}
                                  title={isSaved ? "Saved" : "Save Job"}
                                >
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "#2563EB" : "none"} stroke="currentColor" strokeWidth="2">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                  </svg>
                                </button>
                              </div>

                              {/* Quick Specs Pill Row (Naukri style) */}
                              <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '1rem',
                                fontSize: '0.85rem',
                                color: '#475569',
                                marginBottom: '0.85rem',
                                backgroundColor: '#F8FAFC',
                                padding: '0.6rem 0.85rem',
                                borderRadius: 'var(--radius-md)'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                  </svg>
                                  <span>0 - 4 Yrs Exp</span>
                                </div>

                                {job.salary && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                                      <line x1="12" y1="1" x2="12" y2="23"></line>
                                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                    </svg>
                                    <span>{job.salary}</span>
                                  </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                  </svg>
                                  <span>{job.location}</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <span className="badge" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                                    {job.type || 'Full-time'}
                                  </span>
                                </div>
                              </div>

                              <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                                {job.description}
                              </p>

                              {/* Footer Actions & Apply Button */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.775rem', color: '#94A3B8' }}>
                                  Posted 2 days ago • 150+ Applicants
                                </span>

                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  {isAdmin && (
                                    <button
                                      onClick={() => handleDeleteJob(job.id)}
                                      className="btn btn-outline-danger"
                                      style={{ height: '34px', padding: '0 0.75rem', fontSize: '0.825rem' }}
                                    >
                                      Delete
                                    </button>
                                  )}

                                  {appliedInfo ? (
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      backgroundColor: '#D1FAE5',
                                      color: '#065F46',
                                      padding: '0.4rem 1rem',
                                      borderRadius: 'var(--radius-md)',
                                      fontSize: '0.85rem',
                                      fontWeight: 700
                                    }}>
                                      ✓ Applied on {appliedInfo.appliedDate}
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenApplyModal(job)}
                                      className="btn btn-primary"
                                      style={{ height: '36px', padding: '0 1.25rem', fontSize: '0.875rem', fontWeight: 600 }}
                                    >
                                      Apply Now
                                    </button>
                                  )}
                                </div>
                              </div>

                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ marginBottom: '1rem' }}>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <h3 style={{ color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>No Matching Jobs Found</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Try resetting filters or searching for different job titles or locations.</p>
                    </div>
                  )}
                </div>

                <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
              </>
            )}

          </main>

        </div>

      </div>

      {/* Post Job Modal (Recruiter/Admin) */}
      <Modal isOpen={isPostModalOpen} title="Post a New Job Opening" onClose={() => setIsPostModalOpen(false)}>
        <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="input-label">Job Title *</label>
            <input
              required
              type="text"
              className="form-control"
              placeholder="e.g. Senior Full Stack Java Developer"
              value={jobForm.title}
              onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
            />
          </div>

          <div>
            <label className="input-label">Company Name *</label>
            <input
              required
              type="text"
              className="form-control"
              placeholder="e.g. Tata Consultancy Services / Infosys"
              value={jobForm.company}
              onChange={(e) => setJobForm({...jobForm, company: e.target.value})}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="input-label">Location *</label>
              <input
                required
                type="text"
                className="form-control"
                placeholder="e.g. Pune, Maharashtra / Remote"
                value={jobForm.location}
                onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
              />
            </div>
            <div>
              <label className="input-label">Employment Type</label>
              <select
                className="form-control"
                value={jobForm.type}
                onChange={(e) => setJobForm({...jobForm, type: e.target.value})}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Remote">Remote</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Salary Range</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. ₹8,00,000 - ₹14,00,000 PA"
              value={jobForm.salary}
              onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
            />
          </div>

          <div>
            <label className="input-label">Job Description</label>
            <textarea
              rows="4"
              className="form-control"
              style={{ height: 'auto' }}
              placeholder="Describe roles, responsibilities, required technical skills..."
              value={jobForm.description}
              onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPostModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Publish Job Listing
            </button>
          </div>
        </form>
      </Modal>

      {/* One-Click Apply Modal (Naukri Style) */}
      {applyModalJob && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Apply for Job Position</h3>
              <button onClick={() => setApplyModalJob(null)} className="modal-close-btn">&times;</button>
            </div>

            <form onSubmit={handleConfirmApply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {applyModalJob.title}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-navy)', marginTop: '0.2rem' }}>
                  {applyModalJob.company} • {applyModalJob.location}
                </div>
              </div>

              <div>
                <label className="input-label">Applicant Name</label>
                <input type="text" className="form-control" readOnly value={user?.name || 'Candidate'} />
              </div>

              <div>
                <label className="input-label">Email Address</label>
                <input type="email" className="form-control" readOnly value={user?.email || 'email@example.com'} />
              </div>

              <div>
                <label className="input-label">Cover Note / Message to Recruiter (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Share a brief message highlighting your relevant experience..."
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setApplyModalJob(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmittingApply} className="btn btn-primary">
                  {isSubmittingApply ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
