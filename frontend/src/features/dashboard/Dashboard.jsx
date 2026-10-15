import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationApi } from '../../api/applicationApi';
import { savedJobApi } from '../../api/savedJobApi';
import { profileApi } from '../../api/profileApi';
import { jobApi } from '../../api/jobApi';
import { analyticsApi } from '../../api/analyticsApi';
import { Loader } from '../../components/common/Loader';
import { ToastNotification } from '../../components/common/ToastNotification';
import { AdminDashboard } from './AdminDashboard';

export const Dashboard = () => {
  const { user, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  // If Admin, render Admin Executive Dashboard
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // If Manager / Recruiter, render Hiring Manager Dashboard
  if (isManager) {
    return <HiringManagerDashboard user={user} />;
  }

  // Otherwise, render Job Seeker / Candidate Dashboard
  return <CandidateDashboard user={user} />;
};

/* ==========================================================================
   1. JOB SEEKER / CANDIDATE DASHBOARD
   ========================================================================== */
const CandidateDashboard = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadCandidateData = async () => {
      try {
        const [profData, appsData, savedData, jobsData] = await Promise.allSettled([
          profileApi.getProfile(),
          applicationApi.getMyApplications(),
          savedJobApi.getSavedJobs(),
          jobApi.getJobs({ page: 0, size: 4 })
        ]);

        if (profData.status === 'fulfilled' && profData.value) {
          setProfile(profData.value);
        }
        if (appsData.status === 'fulfilled' && appsData.value) {
          setApplications(appsData.value || []);
        }
        if (savedData.status === 'fulfilled' && savedData.value) {
          setSavedCount(Array.isArray(savedData.value) ? savedData.value.length : 0);
        }
        if (jobsData.status === 'fulfilled' && jobsData.value?.content) {
          setRecommendedJobs(jobsData.value.content);
        }
      } catch (err) {
        console.error('Error loading candidate dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCandidateData();
  }, []);

  // Compute Profile Completeness Score
  const calculateCompleteness = () => {
    let score = 20; // Base signup score
    if (profile?.headline) score += 20;
    if (profile?.skills) score += 25;
    if (profile?.summary) score += 15;
    if (profile?.resumeFileName) score += 20;
    return Math.min(score, 100);
  };

  const completeness = calculateCompleteness();

  // Stage counts
  const appliedCount = applications.length;
  const underReviewCount = applications.filter(a => a.status === 'UNDER_REVIEW').length;
  const interviewCount = applications.filter(a => a.status === 'INTERVIEW' || a.status === 'SHORTLISTED').length;
  const offerCount = applications.filter(a => a.status === 'ACCEPTED').length;

  if (loading) {
    return <Loader text="Loading your candidate career cockpit..." />;
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Candidate Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #173B57 0%, #0B192C 100%)',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem',
        boxShadow: '0 8px 24px rgba(11, 25, 44, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            fontSize: '1.75rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid rgba(255,255,255,0.2)',
            flexShrink: 0
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
          </div>

          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(37,99,235,0.3)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, color: '#93C5FD', marginBottom: '0.4rem' }}>
              👤 Job Seeker Career Cockpit
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Welcome back, {user?.name || 'Candidate'}!
            </h1>
            <p style={{ fontSize: '0.925rem', color: '#CBD5E1', margin: '0.25rem 0 0 0' }}>
              {profile?.headline || 'Explore active openings and track your application milestones.'}
            </p>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/profile" className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '0.6rem 1.25rem', background: '#2563EB' }}>
            📄 View ATS Resume
          </Link>
          <Link to="/jobs" className="btn btn-secondary" style={{ fontSize: '0.875rem', padding: '0.6rem 1.25rem', backgroundColor: 'rgba(255,255,255,0.12)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.25)' }}>
            🔍 Find Jobs
          </Link>
        </div>
      </div>

      {/* Profile Completeness Bar Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            🎯 Profile Completeness: <span style={{ color: completeness >= 80 ? '#16A34A' : '#2563EB' }}>{completeness}%</span>
          </span>
          <Link to="/profile" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}>
            {completeness < 100 ? '+ Complete Profile for 3x More Recruiter Views ➔' : '✓ Profile Fully Optimized'}
          </Link>
        </div>
        <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: `${completeness}%`,
            height: '100%',
            backgroundColor: completeness >= 80 ? '#10B981' : '#2563EB',
            borderRadius: '4px',
            transition: 'width 0.5s ease'
          }}></div>
        </div>
      </div>

      {/* 4 Application Pipeline KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Total Applied</span>
            <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📥</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A' }}>{appliedCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>Active job applications</span>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Under Review</span>
            <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔍</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A' }}>{underReviewCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600 }}>Recruiter screening in progress</span>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Interviews</span>
            <span style={{ backgroundColor: '#EDE9FE', color: '#7C3AED', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💬</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A' }}>{interviewCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 600 }}>Technical evaluation stage</span>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Saved Bookmarks</span>
            <span style={{ backgroundColor: '#FDF2F8', color: '#DB2777', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⭐</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A' }}>{savedCount}</div>
          <Link to="/saved" style={{ fontSize: '0.75rem', color: '#DB2777', fontWeight: 600, textDecoration: 'none' }}>View saved jobs ➔</Link>
        </div>

      </div>

      {/* 2-Column Split: Recent Applications Tracker & Top Recommended Openings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>

        {/* Left: Recent Applications */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Recent Applications ({applications.length})
            </h3>
            <Link to="/applications" style={{ fontSize: '0.825rem', fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}>
              View All ➔
            </Link>
          </div>

          {applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748B' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💼</div>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>You have not submitted any applications yet.</p>
              <Link to="/jobs" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>Browse Jobs & Apply</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {applications.slice(0, 5).map(app => (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>{app.jobTitle || 'Software Position'}</h4>
                    <span style={{ fontSize: '0.775rem', color: '#64748B' }}>{app.company || 'Enterprise Partner'}</span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '12px',
                    backgroundColor: app.status === 'ACCEPTED' ? '#DCFCE7' : app.status === 'UNDER_REVIEW' ? '#FEF3C7' : app.status === 'INTERVIEW' ? '#EDE9FE' : '#EFF6FF',
                    color: app.status === 'ACCEPTED' ? '#15803D' : app.status === 'UNDER_REVIEW' ? '#B45309' : app.status === 'INTERVIEW' ? '#6D28D9' : '#1D4ED8'
                  }}>
                    {app.status ? app.status.replace('_', ' ') : 'APPLIED'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recommended Positions */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Recommended For Your Profile ⚡
            </h3>
            <Link to="/jobs" style={{ fontSize: '0.825rem', fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}>
              Explore Feed ➔
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recommendedJobs.slice(0, 4).map(job => (
              <div key={job.id} style={{ padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ overflow: 'hidden' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {job.title}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <span>{job.company}</span> • <span>{job.location}</span>
                  </div>
                </div>
                <Link to="/jobs" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', height: '30px', whiteSpace: 'nowrap' }}>
                  View Job
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

/* ==========================================================================
   2. HIRING MANAGER / RECRUITER DASHBOARD
   ========================================================================== */
const HiringManagerDashboard = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadManagerData = async () => {
      try {
        const [jobsData, statsData] = await Promise.allSettled([
          jobApi.getJobs({ page: 0, size: 20 }),
          analyticsApi.getAdminStats()
        ]);

        if (jobsData.status === 'fulfilled' && jobsData.value?.content) {
          setJobs(jobsData.value.content);
        }
        if (statsData.status === 'fulfilled' && statsData.value) {
          setStats(statsData.value);
        }
      } catch (err) {
        console.error('Error loading manager dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadManagerData();
  }, []);

  if (loading) {
    return <Loader text="Loading Recruiter Command Center..." />;
  }

  const activeJobsCount = jobs.length || stats?.activeJobs || 5;
  const totalApplications = stats?.totalApplications || 8;
  const interviewsCount = stats?.interviewedCount || 3;
  const offersCount = stats?.acceptedCount || 1;

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      
      {/* Manager Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem',
        boxShadow: '0 8px 24px rgba(30, 58, 138, 0.15)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(59,130,246,0.3)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, color: '#93C5FD', marginBottom: '0.4rem' }}>
            🏢 Hiring Manager Command Center
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
            Recruiter Pipeline & Candidate Evaluations
          </h1>
          <p style={{ fontSize: '0.925rem', color: '#CBD5E1', margin: '0.25rem 0 0 0' }}>
            Manage talent pipeline stages, review candidate ATS fit scores, and fast-track hiring.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/recruiter/applications" className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '0.6rem 1.25rem', background: '#2563EB' }}>
            📋 Open Kanban ATS Board
          </Link>
          <Link to="/jobs" className="btn btn-secondary" style={{ fontSize: '0.875rem', padding: '0.6rem 1.25rem', backgroundColor: 'rgba(255,255,255,0.12)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.25)' }}>
            + Post New Opening
          </Link>
        </div>
      </div>

      {/* Recruiter KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Active Openings</span>
            <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💼</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A' }}>{activeJobsCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>Currently accepting candidates</span>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Total Applicants</span>
            <span style={{ backgroundColor: '#F0FDF4', color: '#16A34A', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👥</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A' }}>{totalApplications}</div>
          <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>Candidates in active review</span>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Technical Interviews</span>
            <span style={{ backgroundColor: '#FAF5FF', color: '#9333EA', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💻</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A' }}>{interviewsCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#9333EA', fontWeight: 600 }}>Live rounds scheduled</span>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Offers Extended</span>
            <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎉</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A' }}>{offersCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600 }}>Final candidate offers</span>
        </div>

      </div>

      {/* Active Posted Openings Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Active Position Pipeline
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Select any role to inspect candidate pool and stage progression
            </span>
          </div>
          <Link to="/recruiter/applications" className="btn btn-primary" style={{ fontSize: '0.825rem', padding: '0.45rem 1rem' }}>
            Open ATS Kanban Board ➔
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#64748B' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Position Title</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Company</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Location</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Type</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                  <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700, color: '#1E293B' }}>{j.title}</td>
                  <td style={{ padding: '0.85rem 0.5rem', color: '#475569' }}>{j.company}</td>
                  <td style={{ padding: '0.85rem 0.5rem', color: '#64748B' }}>{j.location}</td>
                  <td style={{ padding: '0.85rem 0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                      {j.type || 'Full-time'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                    <Link to="/recruiter/applications" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', height: '28px' }}>
                      Inspect Candidates
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
