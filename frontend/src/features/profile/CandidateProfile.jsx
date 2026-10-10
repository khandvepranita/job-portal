import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ToastNotification } from '../../components/common/ToastNotification';

export const CandidateProfile = () => {
  const { user } = useAuth();
  const [toast, setToast] = useState(null);

  // Storage key based on user email or default
  const storageKey = `candidate_profile_${user?.email || 'default'}`;

  // Clean initial profile state with NO dummy data
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Sanitize out old legacy dummy data if present
        if (parsed.resumeName === 'Alex_Morgan_Software_Engineer_CV.pdf' || parsed.currentCompany === 'TechCorp Solutions Ltd.') {
          localStorage.removeItem(storageKey);
        } else {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    }
    return {
      headline: '',
      phone: '',
      location: '',
      experienceYears: '',
      currentCompany: '',
      summary: '',
      skills: [],
      experiences: [],
      education: [],
      resumeName: '',
      resumeSize: '',
      resumeLastUpdated: ''
    };
  });

  // Edit Modal & Section States
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerForm, setHeaderForm] = useState({
    headline: profile.headline || '',
    phone: profile.phone || '',
    location: profile.location || '',
    experienceYears: profile.experienceYears || '',
    currentCompany: profile.currentCompany || '',
    summary: profile.summary || ''
  });

  const [headerErrors, setHeaderErrors] = useState({});

  // Skill Input State
  const [newSkill, setNewSkill] = useState('');

  // Add Experience Modal State
  const [isAddingExp, setIsAddingExp] = useState(false);
  const [expForm, setExpForm] = useState({ role: '', company: '', period: '', location: '', description: '' });
  const [expErrors, setExpErrors] = useState({});

  // Add Education Modal State
  const [isAddingEdu, setIsAddingEdu] = useState(false);
  const [eduForm, setEduForm] = useState({ degree: '', institution: '', year: '', grade: '' });
  const [eduErrors, setEduErrors] = useState({});

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(profile));
  }, [profile, storageKey]);

  // Compute Profile Completion Score (Naukri/Indeed style)
  const computeCompletion = () => {
    let score = 0;
    if (user?.name) score += 15;
    if (profile.headline) score += 15;
    if (profile.phone) score += 10;
    if (profile.location) score += 10;
    if (profile.summary && profile.summary.length >= 10) score += 15;
    if (profile.skills && profile.skills.length >= 1) score += 15;
    if (profile.experiences && profile.experiences.length >= 1) score += 10;
    if (profile.education && profile.education.length >= 1) score += 10;
    return Math.min(score, 100);
  };

  const completionScore = computeCompletion();

  // Header Save Handler with strict Validations
  const handleSaveHeader = (e) => {
    e.preventDefault();
    const errors = {};

    if (!headerForm.headline.trim()) {
      errors.headline = 'Professional title / headline is required.';
    }
    if (headerForm.phone.trim() && !/^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(headerForm.phone)) {
      errors.phone = 'Enter a valid phone number format.';
    }

    if (Object.keys(errors).length > 0) {
      setHeaderErrors(errors);
      return;
    }

    setProfile(prev => ({
      ...prev,
      headline: headerForm.headline.trim(),
      phone: headerForm.phone.trim(),
      location: headerForm.location.trim(),
      experienceYears: headerForm.experienceYears.trim(),
      currentCompany: headerForm.currentCompany.trim(),
      summary: headerForm.summary.trim()
    }));

    setHeaderErrors({});
    setIsEditingHeader(false);
    setToast({ message: 'Profile information updated successfully!', type: 'success' });
  };

  // Add Skill Handler
  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (profile.skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setToast({ message: `Skill "${trimmed}" is already added.`, type: 'error' });
      return;
    }
    setProfile(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setNewSkill('');
    setToast({ message: `Added "${trimmed}" to your skills!`, type: 'success' });
  };

  // Remove Skill Handler
  const handleRemoveSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
    setToast({ message: `Removed "${skillToRemove}"`, type: 'info' });
  };

  // Add Experience Handler with Validation
  const handleSaveExperience = (e) => {
    e.preventDefault();
    const errors = {};
    if (!expForm.role.trim()) errors.role = 'Role / Job title is required.';
    if (!expForm.company.trim()) errors.company = 'Company name is required.';

    if (Object.keys(errors).length > 0) {
      setExpErrors(errors);
      return;
    }

    const newExpObj = {
      id: Date.now(),
      role: expForm.role.trim(),
      company: expForm.company.trim(),
      period: expForm.period.trim() || 'Present',
      location: expForm.location.trim() || 'India',
      description: expForm.description.trim() || 'Contributed to core development and project goals.'
    };

    setProfile(prev => ({
      ...prev,
      experiences: [newExpObj, ...(prev.experiences || [])]
    }));

    setExpForm({ role: '', company: '', period: '', location: '', description: '' });
    setExpErrors({});
    setIsAddingExp(false);
    setToast({ message: 'New work experience added!', type: 'success' });
  };

  // Delete Experience Handler
  const handleDeleteExp = (id) => {
    setProfile(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }));
    setToast({ message: 'Experience record removed.', type: 'info' });
  };

  // Add Education Handler
  const handleSaveEducation = (e) => {
    e.preventDefault();
    const errors = {};
    if (!eduForm.degree.trim()) errors.degree = 'Degree / Course is required.';
    if (!eduForm.institution.trim()) errors.institution = 'University / College is required.';

    if (Object.keys(errors).length > 0) {
      setEduErrors(errors);
      return;
    }

    const newEduObj = {
      id: Date.now(),
      degree: eduForm.degree.trim(),
      institution: eduForm.institution.trim(),
      year: eduForm.year.trim() || 'N/A',
      grade: eduForm.grade.trim() || 'N/A'
    };

    setProfile(prev => ({
      ...prev,
      education: [newEduObj, ...(prev.education || [])]
    }));

    setEduForm({ degree: '', institution: '', year: '', grade: '' });
    setEduErrors({});
    setIsAddingEdu(false);
    setToast({ message: 'Education details added!', type: 'success' });
  };

  // Delete Education
  const handleDeleteEdu = (id) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
    setToast({ message: 'Education record removed.', type: 'info' });
  };

  // Resume Upload Handler
  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File validation
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      setToast({ message: 'Invalid file format! Please upload a PDF or DOCX file.', type: 'error' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'File size exceeds 5MB limit. Please choose a smaller file.', type: 'error' });
      return;
    }

    const sizeInKB = Math.round(file.size / 1024) + ' KB';
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    setProfile(prev => ({
      ...prev,
      resumeName: file.name,
      resumeSize: sizeInKB,
      resumeLastUpdated: todayStr
    }));

    setToast({ message: `Resume uploaded: ${file.name}`, type: 'success' });
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: 'calc(100vh - 61px)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Top Profile Header Banner Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-subtle)',
          overflow: 'hidden'
        }}>
          {/* Top Decorative Banner */}
          <div style={{
            height: '110px',
            background: 'linear-gradient(135deg, #173B57 0%, #1E3E62 60%, #2563EB 100%)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              padding: '4px 12px',
              borderRadius: '20px',
              color: '#FFFFFF',
              fontSize: '0.775rem',
              fontWeight: 600
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
              Verified Candidate
            </div>
          </div>

          <div style={{ padding: '0 2rem 2rem 2rem', position: 'relative' }}>
            {/* Avatar & Main Info Header - Fixed layout so name sits cleanly in white area below banner */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '4px solid #FFFFFF',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                  marginTop: '-45px',
                  flexShrink: 0
                }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                </div>

                <div style={{ paddingTop: '0.85rem' }}>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {user?.name || 'Candidate Name'}
                  </h1>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: profile.headline ? 'var(--accent-blue)' : 'var(--text-muted)', margin: 0 }}>
                    {profile.headline || 'Add your professional title / headline'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setHeaderForm({
                    headline: profile.headline || '',
                    phone: profile.phone || '',
                    location: profile.location || '',
                    experienceYears: profile.experienceYears || '',
                    currentCompany: profile.currentCompany || '',
                    summary: profile.summary || ''
                  });
                  setIsEditingHeader(true);
                }}
                className="btn btn-secondary"
                style={{ fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.85rem' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                Edit Profile Header
              </button>
            </div>

            {/* Quick Contact & Info Chips Grid */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #E2E8F0',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              color: 'var(--text-main)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>{user?.email || 'user@example.com'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>{profile.phone || 'Add phone number'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{profile.location || 'Add preferred location'}</span>
              </div>

              {(profile.experienceYears || profile.currentCompany) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  <span>{profile.experienceYears ? `${profile.experienceYears} Exp` : ''} {profile.currentCompany ? `| ${profile.currentCompany}` : ''}</span>
                </div>
              )}
            </div>

            {/* Profile Completion Indicator Progress Bar (Naukri Style) */}
            <div style={{
              padding: '1.15rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
              border: '1px solid #BFDBFE'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E40AF' }}>
                    Profile Strength: {completionScore}%
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#1E40AF', fontWeight: 500 }}>
                  {completionScore === 100 ? '🎉 Excellent! Profile is fully complete.' : 'Fill remaining sections to increase recruiter visibility!'}
                </span>
              </div>

              {/* Progress Bar Track */}
              <div style={{ width: '100%', height: '8px', backgroundColor: '#BFDBFE', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${completionScore}%`,
                  backgroundColor: completionScore > 80 ? '#10B981' : '#2563EB',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>

          </div>
        </div>

        {/* Grid Layout: Main Left Content vs Right Sidebar Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '1.5rem' }}>

          {/* Left Column: Summary, Skills, Work Experience, Education */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Profile Summary Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-subtle)'
            }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                Professional Summary
              </h3>
              {profile.summary ? (
                <p style={{ fontSize: '0.925rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  {profile.summary}
                </p>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic', margin: 0 }}>
                  No summary added yet. Click "Edit Profile Header" above to introduce your background to recruiters.
                </p>
              )}
            </div>

            {/* Key Skills & Expertise Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  Key Skills & Core Competencies ({profile.skills.length})
                </h3>
              </div>

              {/* Skill Tags List */}
              {profile.skills.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {profile.skills.map((skill, idx) => (
                    <span key={idx} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: '#EFF6FF',
                      color: '#1D4ED8',
                      border: '1px solid #BFDBFE',
                      borderRadius: '20px',
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#60A5FA',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Remove skill"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                  No skills added yet. Type a skill below (e.g. Java, React, SQL) to build your profile.
                </p>
              )}

              {/* Add Skill Input Form */}
              <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Java, React.js, Python, SQL..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  style={{ height: '38px', fontSize: '0.875rem' }}
                />
                <button type="submit" className="btn btn-primary" style={{ height: '38px', padding: '0 1.1rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  + Add Skill
                </button>
              </form>
            </div>

            {/* Work Experience Section */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  Work Experience
                </h3>
                <button
                  onClick={() => setIsAddingExp(true)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.825rem', height: '34px', padding: '0 0.85rem' }}
                >
                  + Add Experience
                </button>
              </div>

              {profile.experiences.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic', margin: 0 }}>
                  No work experience added yet. Click "+ Add Experience" to showcase your career history.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {profile.experiences.map((exp) => (
                    <div key={exp.id} style={{
                      padding: '1.15rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                            {exp.role}
                          </h4>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-blue)', marginTop: '0.2rem' }}>
                            {exp.company} • <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{exp.location}</span>
                          </div>
                          <span style={{ fontSize: '0.775rem', color: '#64748B', display: 'inline-block', marginTop: '0.15rem' }}>
                            🗓 {exp.period}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteExp(exp.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Delete record"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.75rem', marginBottom: 0, lineHeight: 1.5 }}>
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Education & Academic History */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                  </svg>
                  Education & Qualifications
                </h3>
                <button
                  onClick={() => setIsAddingEdu(true)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.825rem', height: '34px', padding: '0 0.85rem' }}
                >
                  + Add Education
                </button>
              </div>

              {profile.education.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic', margin: 0 }}>
                  No education record added yet. Click "+ Add Education" to add your degree or diploma.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {profile.education.map((edu) => (
                    <div key={edu.id} style={{
                      padding: '1rem 1.15rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                          {edu.degree}
                        </h4>
                        <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>
                          {edu.institution} • Grade: <strong style={{ color: 'var(--accent-blue)' }}>{edu.grade}</strong>
                        </div>
                        <span style={{ fontSize: '0.775rem', color: '#64748B' }}>
                          Graduated: {edu.year}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteEdu(edu.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title="Delete record"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Sidebar: Resume Card & Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Resume / CV Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-subtle)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Attached Resume (CV)
              </h3>

              {profile.resumeName ? (
                <div style={{
                  border: '1.5px dashed #CBD5E1',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.15rem',
                  backgroundColor: '#F8FAFC',
                  textAlign: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </div>

                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-all' }}>
                    {profile.resumeName}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Size: {profile.resumeSize} • Updated: {profile.resumeLastUpdated}
                  </div>
                </div>
              ) : (
                <div style={{
                  border: '1.5px dashed #CBD5E1',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.15rem',
                  backgroundColor: '#F8FAFC',
                  textAlign: 'center',
                  marginBottom: '1rem'
                }}>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
                    No resume uploaded yet. Upload your CV so recruiters can review your application.
                  </p>
                </div>
              )}

              {/* Upload Input Trigger */}
              <label className="btn btn-primary" style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                {profile.resumeName ? 'Update Resume' : 'Upload Resume'}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  style={{ display: 'none' }}
                />
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem', marginBottom: 0 }}>
                Supported formats: PDF, DOCX (Max size: 5MB)
              </p>
            </div>

            {/* Recruiter Visibility Tips */}
            <div style={{
              backgroundColor: '#173B57',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-subtle)'
            }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#60A5FA' }}>
                💡 Recruiter Visibility Tips
              </h4>
              <ul style={{ paddingLeft: '1.1rem', margin: 0, fontSize: '0.825rem', color: '#CBD5E1', lineHeight: 1.6 }}>
                <li>Keep your key skills updated with recent technologies.</li>
                <li>Add quantifiable achievements to your work experiences.</li>
                <li>Ensure your location preference matches target roles.</li>
              </ul>
            </div>

          </div>

        </div>

      </div>

      {/* Modal: Edit Header Info */}
      {isEditingHeader && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Profile Information</h3>
              <button onClick={() => setIsEditingHeader(false)} className="modal-close-btn">&times;</button>
            </div>

            <form onSubmit={handleSaveHeader} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label">Professional Title / Headline *</label>
                <input
                  type="text"
                  className="form-control"
                  value={headerForm.headline}
                  onChange={(e) => setHeaderForm({ ...headerForm, headline: e.target.value })}
                  placeholder="e.g. Full Stack Developer / Software Engineer"
                />
                {headerErrors.headline && <span style={{ color: '#EF4444', fontSize: '0.775rem' }}>{headerErrors.headline}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="input-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={headerForm.phone}
                    onChange={(e) => setHeaderForm({ ...headerForm, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                  />
                  {headerErrors.phone && <span style={{ color: '#EF4444', fontSize: '0.775rem' }}>{headerErrors.phone}</span>}
                </div>

                <div>
                  <label className="input-label">Total Experience</label>
                  <input
                    type="text"
                    className="form-control"
                    value={headerForm.experienceYears}
                    onChange={(e) => setHeaderForm({ ...headerForm, experienceYears: e.target.value })}
                    placeholder="e.g. 2 Years"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="input-label">Current Company</label>
                  <input
                    type="text"
                    className="form-control"
                    value={headerForm.currentCompany}
                    onChange={(e) => setHeaderForm({ ...headerForm, currentCompany: e.target.value })}
                    placeholder="e.g. TCS / Infosys"
                  />
                </div>

                <div>
                  <label className="input-label">Preferred Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={headerForm.location}
                    onChange={(e) => setHeaderForm({ ...headerForm, location: e.target.value })}
                    placeholder="e.g. Pune, Maharashtra"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Professional Summary</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={headerForm.summary}
                  onChange={(e) => setHeaderForm({ ...headerForm, summary: e.target.value })}
                  placeholder="Describe your background, skills, core strength and achievements..."
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsEditingHeader(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Experience */}
      {isAddingExp && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Work Experience</h3>
              <button onClick={() => setIsAddingExp(false)} className="modal-close-btn">&times;</button>
            </div>

            <form onSubmit={handleSaveExperience} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label">Role / Job Title *</label>
                <input
                  type="text"
                  className="form-control"
                  value={expForm.role}
                  onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                  placeholder="e.g. Software Engineer"
                />
                {expErrors.role && <span style={{ color: '#EF4444', fontSize: '0.775rem' }}>{expErrors.role}</span>}
              </div>

              <div>
                <label className="input-label">Company Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={expForm.company}
                  onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                  placeholder="e.g. Wipro / Cognizant"
                />
                {expErrors.company && <span style={{ color: '#EF4444', fontSize: '0.775rem' }}>{expErrors.company}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="input-label">Time Period</label>
                  <input
                    type="text"
                    className="form-control"
                    value={expForm.period}
                    onChange={(e) => setExpForm({ ...expForm, period: e.target.value })}
                    placeholder="e.g. 2023 - Present"
                  />
                </div>

                <div>
                  <label className="input-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={expForm.location}
                    onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
                    placeholder="e.g. Pune, India"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Key Responsibilities & Achievements</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={expForm.description}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  placeholder="Describe your key roles, impact, and technology stack..."
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsAddingExp(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Education */}
      {isAddingEdu && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Education Qualification</h3>
              <button onClick={() => setIsAddingEdu(false)} className="modal-close-btn">&times;</button>
            </div>

            <form onSubmit={handleSaveEducation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label">Degree / Qualification *</label>
                <input
                  type="text"
                  className="form-control"
                  value={eduForm.degree}
                  onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  placeholder="e.g. B.E. in Computer Science"
                />
                {eduErrors.degree && <span style={{ color: '#EF4444', fontSize: '0.775rem' }}>{eduErrors.degree}</span>}
              </div>

              <div>
                <label className="input-label">University / College *</label>
                <input
                  type="text"
                  className="form-control"
                  value={eduForm.institution}
                  onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  placeholder="e.g. Pune University"
                />
                {eduErrors.institution && <span style={{ color: '#EF4444', fontSize: '0.775rem' }}>{eduErrors.institution}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="input-label">Graduation Year</label>
                  <input
                    type="text"
                    className="form-control"
                    value={eduForm.year}
                    onChange={(e) => setEduForm({ ...eduForm, year: e.target.value })}
                    placeholder="e.g. 2024"
                  />
                </div>

                <div>
                  <label className="input-label">Grade / CGPA</label>
                  <input
                    type="text"
                    className="form-control"
                    value={eduForm.grade}
                    onChange={(e) => setEduForm({ ...eduForm, grade: e.target.value })}
                    placeholder="e.g. 8.5 / 10 CGPA"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsAddingEdu(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Education
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
