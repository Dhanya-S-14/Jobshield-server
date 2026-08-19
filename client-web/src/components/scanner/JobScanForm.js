import React, { useState } from 'react';
import { FiSend, FiPlus, FiX } from 'react-icons/fi';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship', 'Freelance', 'Temporary'];
const EXPERIENCE_LEVELS = ['Entry', 'Mid', 'Senior', 'Lead', 'Manager', 'Director', 'Executive'];

const JobScanForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({
    jobTitle: '', companyName: '', jobDescription: '', salary: '', location: '',
    jobType: '', recruiterName: '', recruiterEmail: '', phoneNumber: '',
    website: '', experienceLevel: '', skills: [], applyLink: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm({ ...form, skills: [...form.skills, s] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });
  };

  const validate = () => {
    const errs = {};
    if (!form.jobTitle.trim()) errs.jobTitle = 'Job title is required';
    if (!form.companyName.trim()) errs.companyName = 'Company name is required';
    if (!form.jobDescription.trim()) errs.jobDescription = 'Job description is required';
    if (form.recruiterEmail && !/\S+@\S+\.\S+/.test(form.recruiterEmail)) errs.recruiterEmail = 'Invalid email';
    if (form.applyLink && !/^(https?:\/\/|www\.)?.+\..+/.test(form.applyLink.trim())) errs.applyLink = 'Please enter a valid URL';
    if (form.website && !/^(https?:\/\/|www\.)?.+\..+/.test(form.website.trim())) errs.website = 'Please enter a valid URL';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const normalizeUrl = (url) => {
    const trimmed = (url || '').trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^www\./i.test(trimmed)) return 'https://' + trimmed;
    if (/^[\w-]+(\.[\w-]+)+/.test(trimmed)) return 'https://' + trimmed;
    return trimmed;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      website: normalizeUrl(form.website),
      applyLink: normalizeUrl(form.applyLink),
    });
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  return (
    <div className="scanner-form-card">
      <h2>🔍 Job Scanner</h2>
      <p className="form-subtitle">Enter job details below for instant AI scam analysis</p>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              className={`form-input ${errors.jobTitle ? 'error' : ''}`}
              placeholder="e.g. Software Engineer"
              value={form.jobTitle}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
            />
            {errors.jobTitle && <div className="form-error">{errors.jobTitle}</div>}
          </div>
          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              className={`form-input ${errors.companyName ? 'error' : ''}`}
              placeholder="e.g. Acme Corp"
              value={form.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
            />
            {errors.companyName && <div className="form-error">{errors.companyName}</div>}
          </div>
        </div>

        <div className="form-group">
          <label>Job Description *</label>
          <textarea
            className={`form-textarea ${errors.jobDescription ? 'error' : ''}`}
            placeholder="Paste the full job description here..."
            rows={6}
            value={form.jobDescription}
            onChange={(e) => handleChange('jobDescription', e.target.value)}
          />
          {errors.jobDescription && <div className="form-error">{errors.jobDescription}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Salary Range</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. $60,000 - $80,000"
              value={form.salary}
              onChange={(e) => handleChange('salary', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. New York, NY"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Job Type</label>
            <select className="form-select" value={form.jobType} onChange={(e) => handleChange('jobType', e.target.value)}>
              <option value="">Select type</option>
              {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Experience Level</label>
            <select className="form-select" value={form.experienceLevel} onChange={(e) => handleChange('experienceLevel', e.target.value)}>
              <option value="">Select level</option>
              {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Recruiter Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Jane Smith"
              value={form.recruiterName}
              onChange={(e) => handleChange('recruiterName', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Recruiter Email</label>
            <input
              type="email"
              className={`form-input ${errors.recruiterEmail ? 'error' : ''}`}
              placeholder="recruiter@company.com"
              value={form.recruiterEmail}
              onChange={(e) => handleChange('recruiterEmail', e.target.value)}
            />
            {errors.recruiterEmail && <div className="form-error">{errors.recruiterEmail}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="+1 (555) 123-4567"
              value={form.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Website URL</label>
            <input
              type="text"
              className={`form-input ${errors.website ? 'error' : ''}`}
              placeholder="https://company.com"
              value={form.website}
              onChange={(e) => handleChange('website', e.target.value)}
            />
            {errors.website && <div className="form-error">{errors.website}</div>}
          </div>
        </div>

        <div className="form-group">
          <label>Skills</label>
          <div className="tags-input" onClick={(e) => { if (e.target === e.currentTarget) document.getElementById('skill-input')?.focus(); }}>
            {form.skills.map((s) => (
              <span key={s} className="tag">
                {s}
                <span className="tag-remove" onClick={() => removeSkill(s)}><FiX /></span>
              </span>
            ))}
            <input
              id="skill-input"
              type="text"
              placeholder={form.skills.length ? '' : 'Type a skill and press Enter'}
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Apply Button Link</label>
          <input
            type="text"
            className={`form-input ${errors.applyLink ? 'error' : ''}`}
            placeholder="https://company.com/careers/apply"
            value={form.applyLink}
            onChange={(e) => handleChange('applyLink', e.target.value)}
          />
          {errors.applyLink && <div className="form-error">{errors.applyLink}</div>}
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? (
            <><div className="loader-spinner sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> Analyzing...</>
          ) : (
            <><FiSend /> Scan Job Posting</>
          )}
        </button>
      </form>
    </div>
  );
};

export default JobScanForm;
