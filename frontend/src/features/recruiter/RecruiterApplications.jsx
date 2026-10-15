import React, { useState, useEffect } from 'react';
import { applicationApi } from '../../api/applicationApi';
import { jobApi } from '../../api/jobApi';
import { profileApi } from '../../api/profileApi';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { ToastNotification } from '../../components/common/ToastNotification';

export const RecruiterApplications = () => {
  const { isAdmin, isManager } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('KANBAN'); // 'KANBAN' | 'TABLE'
  const [draggedAppId, setDraggedAppId] = useState(null);
  const [toast, setToast] = useState(null);

  // Status Update Modal
  const [editingApp, setEditingApp] = useState(null);
  const [newStatus, setNewStatus] = useState('UNDER_REVIEW');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const KANBAN_STAGES = [
    { key: 'APPLIED', label: '📥 Applied', color: '#475569', badgeBg: '#F1F5F9' },
    { key: 'UNDER_REVIEW', label: '🔍 Under Review', color: '#B45309', badgeBg: '#FEF3C7' },
    { key: 'SHORTLISTED', label: '⭐ Shortlisted', color: '#1D4ED8', badgeBg: '#DBEAFE' },
    { key: 'INTERVIEW', label: '💬 Interview', color: '#6D28D9', badgeBg: '#EDE9FE' },
    { key: 'ACCEPTED', label: '🎉 Offer Extended', color: '#15803D', badgeBg: '#DCFCE7' }
  ];

  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData('text/plain', appId);
    setDraggedAppId(appId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (!appId) return;

    const targetApp = applications.find(a => a.id.toString() === appId.toString());
    if (!targetApp || targetApp.status === targetStage) return;

    const previousStatus = targetApp.status;
    // Optimistic UI update
    setApplications(prev => prev.map(a => a.id === targetApp.id ? { ...a, status: targetStage } : a));

    try {
      await applicationApi.updateStatus(targetApp.id, targetStage, targetApp.recruiterNotes || '');
      setToast({ message: `Candidate ${targetApp.candidateName} moved to ${targetStage.replace('_', ' ')}!`, type: 'success' });
    } catch (err) {
      console.error(err);
      // Revert if error
      setApplications(prev => prev.map(a => a.id === targetApp.id ? { ...a, status: previousStatus } : a));
      setToast({ message: 'Failed to update candidate pipeline stage.', type: 'error' });
    } finally {
      setDraggedAppId(null);
    }
  };

  // Cover Letter & Resume Preview Modals
  const [viewingCoverApp, setViewingCoverApp] = useState(null);
  const [previewResumeApp, setPreviewResumeApp] = useState(null);

  const handleExportCSV = () => {
    if (filteredApps.length === 0) {
      setToast({ message: 'No applications found to export.', type: 'error' });
      return;
    }
    const headers = ['Application ID', 'Candidate Name', 'Candidate Email', 'Job Title', 'ATS Match %', 'Stage', 'Applied Date', 'Recruiter Notes'];
    const rows = filteredApps.map(app => [
      app.id,
      `"${(app.candidateName || '').replace(/"/g, '""')}"`,
      `"${(app.candidateEmail || '').replace(/"/g, '""')}"`,
      `"${(app.jobTitle || '').replace(/"/g, '""')}"`,
      app.matchScore || 'N/A',
      app.status || 'APPLIED',
      app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : 'N/A',
      `"${(app.recruiterNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const selectedJob = jobs.find(j => j.id.toString() === selectedJobId);
    const jobSlug = selectedJob ? selectedJob.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'candidates';
    link.setAttribute('download', `candidates_${jobSlug}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ message: `Exported ${filteredApps.length} candidates to CSV!`, type: 'success' });
  };

  // 1. Fetch available jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await jobApi.getJobs({ page: 0, size: 50 });
        const list = res.content || [];
        setJobs(list);
        if (list.length > 0) {
          setSelectedJobId(list[0].id.toString());
        }
      } catch (err) {
        console.error(err);
        setToast({ message: 'Failed to load company jobs.', type: 'error' });
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  // 2. Fetch applications when selectedJobId changes
  const fetchApplicationsForJob = async (jobId) => {
    if (!jobId) return;
    setLoadingApps(true);
    try {
      const data = await applicationApi.getJobApplications(jobId);
      setApplications(data || []);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to retrieve job applicants.', type: 'error' });
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    if (selectedJobId) {
      fetchApplicationsForJob(selectedJobId);
    }
  }, [selectedJobId]);

  const handleOpenStatusModal = (app) => {
    setEditingApp(app);
    setNewStatus(app.status || 'UNDER_REVIEW');
    setNotes(app.recruiterNotes || '');
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!editingApp) return;
    setIsUpdating(true);
    try {
      const updated = await applicationApi.updateStatus(editingApp.id, newStatus, notes);
      setApplications(prev => prev.map(a => a.id === updated.id ? updated : a));
      setToast({ message: `Applicant status updated to ${newStatus.replace('_', ' ')}!`, type: 'success' });
      setEditingApp(null);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to update candidate status.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredApps = applications.filter(app => {
    if (statusFilter === 'ALL') return true;
    return app.status === statusFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return { bg: '#DCFCE7', text: '#15803D' };
      case 'INTERVIEW': return { bg: '#EDE9FE', text: '#6D28D9' };
      case 'SHORTLISTED': return { bg: '#DBEAFE', text: '#1D4ED8' };
      case 'UNDER_REVIEW': return { bg: '#FEF3C7', text: '#B45309' };
      case 'REJECTED': return { bg: '#FEE2E2', text: '#B91C1C' };
      default: return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  if (!isAdmin && !isManager) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ color: '#EF4444' }}>403 - Recruiter Portal Restricted</h2>
        <p style={{ color: '#64748B' }}>Only Hiring Managers and System Administrators can access candidate evaluation tools.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Recruiter Applicant Tracking System
        </span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem', marginBottom: '0.35rem' }}>
          Candidate Pipeline & Evaluation
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
          Review candidate qualifications, ATS compatibility metrics, and manage stage transitions.
        </p>
      </div>

      {/* Job Selector & Status Filter Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', whiteSpace: 'nowrap' }}>
            Select Position:
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            disabled={loadingJobs}
            style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', width: '100%', maxWidth: '420px', outline: 'none' }}
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.company})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* View Switcher Toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <button
              type="button"
              onClick={() => setViewMode('KANBAN')}
              style={{
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: viewMode === 'KANBAN' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'KANBAN' ? '#2563EB' : '#64748B',
                boxShadow: viewMode === 'KANBAN' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              📊 Kanban
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              style={{
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: viewMode === 'TABLE' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'TABLE' ? '#2563EB' : '#64748B',
                boxShadow: viewMode === 'TABLE' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              📑 Table
            </button>
          </div>

          <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 500 }}>Filter:</span>
          {['ALL', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: statusFilter === st ? '#2563EB' : '#E2E8F0',
                backgroundColor: statusFilter === st ? '#EFF6FF' : '#FFFFFF',
                color: statusFilter === st ? '#2563EB' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {st.replace('_', ' ')}
            </button>
          ))}

          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.35rem', color: '#0F172A', fontWeight: 600 }}
            title="Download candidate report as CSV spreadsheet"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export CSV
          </button>
        </div>
      </div>

      {loadingApps ? (
        <Loader text="Loading applicants for selected role..." />
      ) : filteredApps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>No Candidates Found</h3>
          <p style={{ color: '#64748B', fontSize: '0.925rem' }}>No candidate profiles match the chosen stage filter for this opening.</p>
        </div>
      ) : viewMode === 'KANBAN' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1rem',
          alignItems: 'start',
          overflowX: 'auto',
          paddingBottom: '1rem'
        }}>
          {KANBAN_STAGES.map(stage => {
            const stageApps = applications.filter(a => a.status === stage.key);
            return (
              <div
                key={stage.key}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.key)}
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '0.85rem',
                  minHeight: '460px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Column Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '0.65rem',
                  marginBottom: '0.75rem',
                  borderBottom: `2px solid ${stage.color}`
                }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                    {stage.label}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    backgroundColor: stage.badgeBg,
                    color: stage.color
                  }}>
                    {stageApps.length}
                  </span>
                </div>

                {/* Drop Zone & Candidate Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {stageApps.length === 0 ? (
                    <div style={{
                      border: '2px dashed #CBD5E1',
                      borderRadius: '10px',
                      padding: '2rem 0.5rem',
                      textAlign: 'center',
                      color: '#94A3B8',
                      fontSize: '0.8rem',
                      fontStyle: 'italic',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      minHeight: '130px'
                    }}>
                      Drop candidates here
                    </div>
                  ) : (
                    stageApps.map(app => (
                      <div
                        key={app.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '10px',
                          border: '1px solid #E2E8F0',
                          padding: '0.85rem',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                          cursor: 'grab',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                          <strong style={{ fontSize: '0.9rem', color: '#0F172A', display: 'block' }}>
                            {app.candidateName}
                          </strong>
                          <button
                            onClick={() => handleOpenStatusModal(app)}
                            title="Edit Stage / Notes"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748B' }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                          </button>
                        </div>

                        <div style={{ fontSize: '0.775rem', color: '#64748B', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {app.candidateEmail}
                        </div>

                        {/* ATS Match Meter */}
                        <div style={{ marginBottom: '0.6rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>ATS Match</span>
                            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: (app.matchScore || 50) >= 80 ? '#15803D' : '#B45309' }}>
                              {app.matchScore || 75}%
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '5px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${app.matchScore || 75}%`, height: '100%', backgroundColor: (app.matchScore || 50) >= 80 ? '#22C55E' : '#F59E0B' }}></div>
                          </div>
                        </div>

                        {/* Footer Quick Actions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.45rem', borderTop: '1px solid #F1F5F9' }}>
                          <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent'}
                          </span>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            {app.candidateId && (
                              <button
                                onClick={() => setPreviewResumeApp(app)}
                                style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', padding: '2px 7px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}
                                title="Preview Resume"
                              >
                                CV
                              </button>
                            )}
                            {app.coverLetter && (
                              <button
                                onClick={() => setViewingCoverApp(app)}
                                style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '2px 7px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', color: '#475569' }}
                                title="Read Cover Letter"
                              >
                                Note
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                <th style={{ padding: '1rem 1.25rem', color: '#475569', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Candidate</th>
                <th style={{ padding: '1rem 1.25rem', color: '#475569', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>ATS Match</th>
                <th style={{ padding: '1rem 1.25rem', color: '#475569', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Current Stage</th>
                <th style={{ padding: '1rem 1.25rem', color: '#475569', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Applied Date</th>
                <th style={{ padding: '1rem 1.25rem', color: '#475569', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Resume & Note</th>
                <th style={{ padding: '1rem 1.25rem', color: '#475569', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map(app => {
                const color = getStatusColor(app.status);
                return (
                  <tr key={app.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <strong style={{ color: '#0F172A', display: 'block', fontSize: '0.95rem' }}>{app.candidateName}</strong>
                      <span style={{ color: '#64748B', fontSize: '0.825rem' }}>{app.candidateEmail}</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '42px', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${app.matchScore || 50}%`, height: '100%', backgroundColor: (app.matchScore || 50) >= 80 ? '#22C55E' : '#F59E0B' }}></div>
                        </div>
                        <span style={{ fontWeight: 700, color: (app.matchScore || 50) >= 80 ? '#15803D' : '#B45309', fontSize: '0.85rem' }}>
                          {app.matchScore || 'N/A'}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '16px', backgroundColor: color.bg, color: color.text }}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.85rem' }}>
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {app.candidateId && (
                          <>
                            <button
                              onClick={() => setPreviewResumeApp(app)}
                              style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}
                              title="Preview candidate resume PDF"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                              Preview
                            </button>
                            <a
                              href={profileApi.getResumeDownloadUrl(app.candidateId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '0.75rem', color: '#64748B', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '3px 6px', border: '1px solid #E2E8F0', borderRadius: '4px' }}
                              title="Download raw file"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                              PDF
                            </a>
                          </>
                        )}
                        {app.coverLetter && (
                          <button
                            onClick={() => setViewingCoverApp(app)}
                            style={{ background: 'none', border: '1px solid #CBD5E1', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', color: '#475569' }}
                          >
                            Cover Note
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenStatusModal(app)}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}
                      >
                        Update Stage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Stage Update Modal */}
      {editingApp && (
        <Modal isOpen={!!editingApp} onClose={() => setEditingApp(null)} title={`Evaluate Candidate: ${editingApp.candidateName}`}>
          <form onSubmit={handleSaveStatus}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', marginBottom: '0.35rem' }}>
                Hiring Pipeline Stage
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
              >
                <option value="APPLIED">Applied (Initial Intake)</option>
                <option value="UNDER_REVIEW">Under Review (Recruiter Screening)</option>
                <option value="SHORTLISTED">Shortlisted (Passed Initial Screen)</option>
                <option value="INTERVIEW">Interview Scheduled (Technical/Managerial)</option>
                <option value="ACCEPTED">Offer Extended (Accepted Candidate)</option>
                <option value="REJECTED">Archived / Rejected (Not Moving Forward)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', marginBottom: '0.35rem' }}>
                Internal Recruiter Notes (Shared with Candidate on Profile)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Completed initial technical screen, strong communication skills. Invited to round 2 on Thursday."
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setEditingApp(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isUpdating} className="btn btn-primary">
                {isUpdating ? 'Saving...' : 'Confirm Stage Transition'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Cover Letter Modal */}
      {viewingCoverApp && (
        <Modal isOpen={!!viewingCoverApp} onClose={() => setViewingCoverApp(null)} title={`Cover Letter: ${viewingCoverApp.candidateName}`}>
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {viewingCoverApp.coverLetter}
            </p>
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button onClick={() => setViewingCoverApp(null)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* In-Browser PDF Resume Preview Modal */}
      {previewResumeApp && (
        <Modal isOpen={!!previewResumeApp} onClose={() => setPreviewResumeApp(null)} title={`Resume Preview: ${previewResumeApp.candidateName}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div>
                <strong style={{ color: '#0F172A', display: 'block', fontSize: '0.9rem' }}>{previewResumeApp.candidateName}</strong>
                <span style={{ color: '#64748B', fontSize: '0.8rem' }}>{previewResumeApp.candidateEmail} &bull; ATS Match: {previewResumeApp.matchScore || 'N/A'}%</span>
              </div>
              <a
                href={profileApi.getResumeDownloadUrl(previewResumeApp.candidateId)}
                download
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download PDF
              </a>
            </div>

            <div style={{ height: '520px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1', backgroundColor: '#525659' }}>
              <iframe
                src={profileApi.getResumeDownloadUrl(previewResumeApp.candidateId)}
                title={`Resume - ${previewResumeApp.candidateName}`}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            </div>

            <div style={{ textAlign: 'right' }}>
              <button onClick={() => setPreviewResumeApp(null)} className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }}>
                Close Viewer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
