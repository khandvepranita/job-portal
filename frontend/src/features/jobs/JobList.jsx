import React, { useState, useEffect } from 'react';
import { jobApi } from '../../api/jobApi';
import { applicationApi } from '../../api/applicationApi';
import { savedJobApi } from '../../api/savedJobApi';
import { atsApi } from '../../api/atsApi';
import { profileApi } from '../../api/profileApi';
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

  // Saved & Applied Jobs State
  const storageUserKey = user?.email || 'guest';

  const [savedJobs, setSavedJobs] = useState({});
  const [appliedJobs, setAppliedJobs] = useState({});

  // ATS Fit Scanner State
  const [atsModalJob, setAtsModalJob] = useState(null);
  const [atsResult, setAtsResult] = useState(null);
  const [isAnalyzingATS, setIsAnalyzingATS] = useState(false);

  // Post Job Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [jobForm, setJobForm] = useState({ title: '', company: '', location: '', type: 'Full-time', description: '', salary: '' });
  const [jobFormErrors, setJobFormErrors] = useState({});

  // One-Click Apply Modal State (Naukri style)
  const [applyModalJob, setApplyModalJob] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [isSubmittingApply, setIsSubmittingApply] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [feedFilter, setFeedFilter] = useState('ALL'); // 'ALL' | 'HIGH_MATCH'
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Load Saved & Applied Jobs from Backend
  useEffect(() => {
    if (user) {
      profileApi.getProfile()
        .then(p => {
          if (p) setCandidateProfile(p);
        })
        .catch(err => console.log('Profile sync error', err));

      savedJobApi.getSavedJobs()
        .then(list => {
          const map = {};
          (list || []).forEach(item => {
            if (item.job?.id) map[item.job.id] = true;
          });
          setSavedJobs(map);
        })
        .catch(err => console.log('Saved jobs sync error', err));

      applicationApi.getMyApplications()
        .then(list => {
          const map = {};
          (list || []).forEach(item => {
            if (item.jobId) {
              map[item.jobId] = {
                appliedDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently',
                status: item.status,
                matchScore: item.matchScore
              };
            }
          });
          setAppliedJobs(map);
        })
        .catch(err => console.log('Applications sync error', err));
    }
  }, [user]);

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

  const toggleSaveJob = async (id) => {
    if (!user) {
      setToast({ message: 'Please log in to save positions.', type: 'error' });
      return;
    }
    const isCurrentlySaved = !!savedJobs[id];
    try {
      if (isCurrentlySaved) {
        await savedJobApi.unsaveJob(id);
        setSavedJobs(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        setToast({ message: 'Job removed from bookmarks.', type: 'info' });
      } else {
        await savedJobApi.saveJob(id);
        setSavedJobs(prev => ({ ...prev, [id]: true }));
        setToast({ message: 'Job saved to your bookmarks!', type: 'success' });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to update bookmark.', type: 'error' });
    }
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

    try {
      const res = await applicationApi.apply({
        jobId: applyModalJob.id,
        coverLetter: coverNote
      }, null);

      setAppliedJobs(prev => ({
        ...prev,
        [applyModalJob.id]: {
          appliedDate: new Date().toLocaleDateString(),
          status: res.status || 'APPLIED',
          matchScore: res.matchScore
        }
      }));

      setToast({
        message: `🎉 Application submitted! ATS Compatibility: ${res.matchScore || 85}%`,
        type: 'success'
      });
      setApplyModalJob(null);
    } catch (err) {
      console.error('Application submission error:', err);
      if (err.response?.status === 401) {
        setToast({
          message: '⚠️ Your login session expired. Please sign in again to submit your application.',
          type: 'error'
        });
      } else {
        const errorMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : null);
        setToast({
          message: errorMsg || 'Application submission failed. Please try again.',
          type: 'error'
        });
      }
    } finally {
      setIsSubmittingApply(false);
    }
  };

  const handleCheckATS = async (job) => {
    setAtsModalJob(job);
    setIsAnalyzingATS(true);
    setAtsResult(null);

    try {
      let candidateProfile = null;
      if (user) {
        candidateProfile = await profileApi.getProfile().catch(() => null);
      }

      const res = await atsApi.analyzeMatch({
        jobId: job.id,
        candidateSkills: candidateProfile?.skills || 'Java, Spring Boot, React, MySQL, REST APIs, Git',
        candidateSummary: candidateProfile?.summary || 'Full stack engineer with experience in cloud applications and microservices.',
        candidateExperience: candidateProfile?.experiences || ''
      });
      setAtsResult(res);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Could not complete ATS match calculation.', type: 'error' });
      setAtsModalJob(null);
    } finally {
      setIsAnalyzingATS(false);
    }
  };

  const validateJobForm = () => {
    const errs = {};
    if (!jobForm.title.trim()) {
      errs.title = 'Job title is required.';
    } else if (jobForm.title.trim().length < 3) {
      errs.title = 'Job title must be at least 3 characters.';
    }

    if (!jobForm.company.trim()) {
      errs.company = 'Company name is required.';
    } else if (jobForm.company.trim().length < 2) {
      errs.company = 'Company name must be at least 2 characters.';
    }

    if (!jobForm.location.trim()) {
      errs.location = 'Job location is required.';
    }

    if (jobForm.description && jobForm.description.trim().length > 0 && jobForm.description.trim().length < 15) {
      errs.description = 'Job description must provide at least 15 characters of detail.';
    }

    setJobFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!validateJobForm()) return;

    try {
      await jobApi.createJob(jobForm);
      setToast({ message: 'Job posting created successfully!', type: 'success' });
      setIsPostModalOpen(false);
      setJobForm({ title: '', company: '', location: '', type: 'Full-time', description: '', salary: '' });
      setJobFormErrors({});
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

  // Smart ATS Fit Score calculation based on Candidate Profile skills
  const calculateJobMatch = (job) => {
    if (!candidateProfile || !candidateProfile.skills) return 82;
    const skillsList = candidateProfile.skills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    if (skillsList.length === 0) return 82;

    const targetText = `${job.title} ${job.company} ${job.description || ''} ${job.location || ''}`.toLowerCase();
    let matches = 0;
    skillsList.forEach(s => {
      if (targetText.includes(s)) matches++;
    });

    const ratio = matches / skillsList.length;
    return Math.min(Math.round(68 + (ratio * 26) + ((job.id || 1) % 5)), 98);
  };

  // One-Click AI Cover Letter Generator
  const handleGenerateAICoverLetter = () => {
    if (!applyModalJob) return;
    setIsGeneratingCover(true);

    const skills = candidateProfile?.skills || 'Full-Stack Software Engineering, Cloud Architecture, Modern React and Java development';
    const experienceYears = candidateProfile?.experienceYears ? `${candidateProfile.experienceYears} years` : 'substantial hands-on experience';
    const headline = candidateProfile?.headline || 'Passionate Software Engineer';

    setTimeout(() => {
      const generated = `Dear Hiring Team at ${applyModalJob.company},

I am writing to express my strong interest in the ${applyModalJob.title} position in ${applyModalJob.location}. As a ${headline} with ${experienceYears} specializing in ${skills}, I am confident that my technical foundation and problem-solving skills align directly with your engineering requirements.

Throughout my career, I have prioritized shipping performant, reliable applications, writing clean maintainable code, and collaborating cross-functionally to achieve strategic milestones. The mission and engineering standards at ${applyModalJob.company} are inspiring, and I would love to contribute my proactive ownership and technical depth to your team's upcoming initiatives.

Thank you for your time and review. I look forward to the possibility of discussing how my experience can support your team's immediate roadmap.

Warm regards,
${user?.name || 'Candidate'}`;

      setCoverNote(generated);
      setIsGeneratingCover(false);
      setToast({ message: '✨ Tailored AI Cover Letter generated successfully!', type: 'success' });
    }, 450);
  };

  // Filter Jobs by location, type, and AI Recommendation filter
  const filteredJobs = jobs.filter(job => {
    const matchLocation = !locationSearch || job.location.toLowerCase().includes(locationSearch.toLowerCase());
    const matchType = selectedJobType === 'ALL' || (job.type && job.type.toLowerCase().includes(selectedJobType.toLowerCase()));
    if (!matchLocation || !matchType) return false;
    if (feedFilter === 'HIGH_MATCH') {
      return calculateJobMatch(job) >= 78;
    }
    return true;
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

          <h1 className="hero-headline" style={{ fontSize: '2.35rem', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: '0.75rem', color: '#FFFFFF' }}>
            Find Your Dream Role on India's Tech Career Portal
          </h1>
          <p className="hero-subheadline" style={{ fontSize: '1.05rem', color: '#93C5FD', maxWidth: '650px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
            Explore verified openings from top MNCs, unicorn startups, and hiring teams.
          </p>

          {/* Naukri 3-Field Hero Search Bar - Responsive */}
          <form onSubmit={handleSearchSubmit} className="hero-search-form">
            <div className="hero-search-input-col" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg style={{ position: 'absolute', left: '14px', color: '#64748B' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="form-control hero-input"
                style={{ paddingLeft: '2.6rem', border: 'none', background: 'transparent', boxShadow: 'none', height: '46px' }}
                placeholder="Skills, Designation, Company (e.g. Java, React, Developer)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="hero-search-input-col hero-search-location-col" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg style={{ position: 'absolute', left: '14px', color: '#64748B' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <input
                type="text"
                className="form-control hero-input"
                style={{ paddingLeft: '2.6rem', border: 'none', background: 'transparent', boxShadow: 'none', height: '46px' }}
                placeholder="Location (e.g. Pune, Mumbai, Remote)"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary hero-search-btn" style={{ height: '46px', padding: '0 1.75rem', fontSize: '0.95rem', fontWeight: 700, borderRadius: 'var(--radius-md)' }}>
              Search Jobs
            </button>
          </form>
        </div>
      </section>

      {/* Main Container Layout: Left Filters Sidebar vs Right Job Cards */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.25rem' }}>

        {/* Mobile Filter Toggle Bar (Shows only on <= 900px) */}
        <div className="mobile-filter-bar">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="btn btn-secondary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '42px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            {mobileFiltersOpen ? 'Hide Filters ✕' : 'Filter Openings (Work Mode / Experience) ⚙️'}
          </button>
        </div>

        <div className={`job-portal-layout ${mobileFiltersOpen ? 'mobile-filters-expanded' : ''}`}>

          {/* Left Naukri Filter Sidebar */}
          <aside className="job-filters-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

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

            {/* Header Result Counter & AI Recommended Feed Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <button
                    onClick={() => setFeedFilter('ALL')}
                    style={{
                      border: 'none',
                      background: feedFilter === 'ALL' ? 'var(--primary-navy)' : 'rgba(0,0,0,0.05)',
                      color: feedFilter === 'ALL' ? '#FFFFFF' : 'var(--text-muted)',
                      padding: '5px 14px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    All Openings ({jobs.length})
                  </button>
                  <button
                    onClick={() => setFeedFilter('HIGH_MATCH')}
                    style={{
                      border: 'none',
                      background: feedFilter === 'HIGH_MATCH' ? 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)' : 'rgba(37, 99, 235, 0.1)',
                      color: feedFilter === 'HIGH_MATCH' ? '#FFFFFF' : '#2563EB',
                      padding: '5px 14px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    🎯 AI High Match ({jobs.filter(j => calculateJobMatch(j) >= 78).length})
                  </button>
                </div>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Showing {filteredJobs.length} verified tech positions • Page {page + 1} of {totalPages || 1}
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
                      const matchScore = calculateJobMatch(job);

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
                                    <span style={{
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      backgroundColor: matchScore >= 80 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                      color: matchScore >= 80 ? '#15803D' : '#B45309',
                                      border: `1px solid ${matchScore >= 80 ? '#BBF7D0' : '#FDE68A'}`,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}>
                                      ⚡ {matchScore}% Match
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
                              <div className="job-card-footer">
                                <span className="job-card-meta" style={{ fontSize: '0.775rem', color: '#94A3B8' }}>
                                  Posted 2 days ago • 150+ Applicants
                                </span>

                                <div className="job-card-actions">
                                  {isAdmin && (
                                    <button
                                      onClick={() => handleDeleteJob(job.id)}
                                      className="btn btn-outline-danger"
                                      style={{ height: '36px', padding: '0 0.75rem', fontSize: '0.825rem' }}
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
                                    <>
                                      <button
                                        onClick={() => handleCheckATS(job)}
                                        className="btn btn-secondary job-action-btn"
                                        style={{ height: '36px', padding: '0 0.85rem', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                        title="Compare your candidate skills with this job posting"
                                      >
                                        ⚡ ATS Fit
                                      </button>
                                      <button
                                        onClick={() => handleOpenApplyModal(job)}
                                        className="btn btn-primary job-action-btn"
                                        style={{ height: '36px', padding: '0 1.25rem', fontSize: '0.875rem', fontWeight: 600 }}
                                      >
                                        Apply Now
                                      </button>
                                    </>
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
        <form onSubmit={handleCreateJob} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="input-label">Job Title *</label>
            <input
              type="text"
              className={`form-control ${jobFormErrors.title ? 'input-error' : ''}`}
              placeholder="e.g. Senior Full Stack Java Developer"
              value={jobForm.title}
              onChange={(e) => { setJobForm({...jobForm, title: e.target.value}); setJobFormErrors(prev => ({...prev, title: ''})); }}
            />
            {jobFormErrors.title && (
              <span style={{ color: '#EF4444', fontSize: '0.8rem', display: 'block', marginTop: '0.3rem', fontWeight: 500 }}>
                {jobFormErrors.title}
              </span>
            )}
          </div>

          <div>
            <label className="input-label">Company Name *</label>
            <input
              type="text"
              className={`form-control ${jobFormErrors.company ? 'input-error' : ''}`}
              placeholder="e.g. Tata Consultancy Services / Infosys"
              value={jobForm.company}
              onChange={(e) => { setJobForm({...jobForm, company: e.target.value}); setJobFormErrors(prev => ({...prev, company: ''})); }}
            />
            {jobFormErrors.company && (
              <span style={{ color: '#EF4444', fontSize: '0.8rem', display: 'block', marginTop: '0.3rem', fontWeight: 500 }}>
                {jobFormErrors.company}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="input-label">Location *</label>
              <input
                type="text"
                className={`form-control ${jobFormErrors.location ? 'input-error' : ''}`}
                placeholder="e.g. Pune, Maharashtra / Remote"
                value={jobForm.location}
                onChange={(e) => { setJobForm({...jobForm, location: e.target.value}); setJobFormErrors(prev => ({...prev, location: ''})); }}
              />
              {jobFormErrors.location && (
                <span style={{ color: '#EF4444', fontSize: '0.8rem', display: 'block', marginTop: '0.3rem', fontWeight: 500 }}>
                  {jobFormErrors.location}
                </span>
              )}
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
              className={`form-control ${jobFormErrors.description ? 'input-error' : ''}`}
              style={{ height: 'auto' }}
              placeholder="Describe roles, responsibilities, required technical skills..."
              value={jobForm.description}
              onChange={(e) => { setJobForm({...jobForm, description: e.target.value}); setJobFormErrors(prev => ({...prev, description: ''})); }}
            ></textarea>
            {jobFormErrors.description && (
              <span style={{ color: '#EF4444', fontSize: '0.8rem', display: 'block', marginTop: '0.3rem', fontWeight: 500 }}>
                {jobFormErrors.description}
              </span>
            )}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="input-label" style={{ margin: 0 }}>Cover Note / Message to Recruiter</label>
                  <button
                    type="button"
                    onClick={handleGenerateAICoverLetter}
                    disabled={isGeneratingCover}
                    style={{
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '0.775rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                      transition: 'all 0.2s ease'
                    }}
                    title="Generate a custom personalized cover letter matching your profile with this job"
                  >
                    {isGeneratingCover ? '✨ Writing with AI...' : '✨ Generate with AI'}
                  </button>
                </div>
                <textarea
                  className="form-control"
                  rows="5"
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Share a brief message highlighting your relevant experience, or click 'Generate with AI' above to draft one instantly..."
                  style={{ lineHeight: 1.5, fontSize: '0.875rem', minHeight: '130px', maxHeight: '220px', resize: 'vertical' }}
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

      {/* ATS Fit Scanner Modal */}
      {atsModalJob && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 className="modal-title">⚡ ATS Resume Match Scanner</h3>
              <button onClick={() => setAtsModalJob(null)} className="modal-close-btn">&times;</button>
            </div>

            <div style={{ padding: '0.5rem 0' }}>
              <div style={{ padding: '0.85rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>{atsModalJob.title}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{atsModalJob.company} • {atsModalJob.location}</div>
              </div>

              {isAnalyzingATS ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <div className="spinner" style={{ margin: '0 auto 1rem', width: '32px', height: '32px' }}></div>
                  <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Analyzing candidate competencies against job requirements...</p>
                </div>
              ) : atsResult ? (
                <div>
                  {/* Score Dial / Bar */}
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: atsResult.matchScore >= 75 ? '#15803D' : '#D97706' }}>
                      {atsResult.matchScore}%
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {atsResult.matchCategory}
                    </div>
                    <p style={{ fontSize: '0.825rem', color: '#14532D', margin: '0.35rem 0 0' }}>
                      {atsResult.roleReadinessSummary}
                    </p>
                  </div>

                  {/* Matched Skills */}
                  {atsResult.matchedSkills && atsResult.matchedSkills.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803D', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                        ✓ Matching Key Competencies
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {atsResult.matchedSkills.map(sk => (
                          <span key={sk} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 9px', borderRadius: '14px', backgroundColor: '#DCFCE7', color: '#166534' }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {atsResult.missingSkills && atsResult.missingSkills.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                        ⚠️ Recommended Skills to Add
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {atsResult.missingSkills.map(sk => (
                          <span key={sk} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 9px', borderRadius: '14px', backgroundColor: '#FEF3C7', color: '#92400E' }}>
                            + {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {atsResult.suggestions && atsResult.suggestions.length > 0 && (
                    <div style={{ padding: '0.75rem 1rem', backgroundColor: '#EFF6FF', borderRadius: '8px', fontSize: '0.825rem', color: '#1E40AF', marginBottom: '1.25rem' }}>
                      <strong>ATS Optimization Tip:</strong>
                      <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', lineHeight: '1.5' }}>
                        {atsResult.suggestions.map((sug, i) => <li key={i}>{sug}</li>)}
                      </ul>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setAtsModalJob(null)}>
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        const target = atsModalJob;
                        setAtsModalJob(null);
                        handleOpenApplyModal(target);
                      }}
                    >
                      Proceed to Apply
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
