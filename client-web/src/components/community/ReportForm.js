import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createReport } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';
import { FiSend, FiUpload, FiImage, FiX, FiFile, FiLogIn } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ReportForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    companyName: '', jobTitle: '', description: '', website: '', evidenceUrls: '',
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.companyName.trim()) errs.companyName = 'Company name is required';
    if (!form.jobTitle.trim()) errs.jobTitle = 'Job title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    else if (form.description.trim().length < 20) errs.description = 'Minimum 20 characters';
    const websiteVal = (form.website || '').trim();
    if (websiteVal && !/^(https?:\/\/|www\.)?.+\..+/.test(websiteVal)) errs.website = 'Please enter a valid URL (e.g. https://example.com)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileSelect = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  };

  const clearFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const normalizeUrl = (url) => {
    const trimmed = (url || '').trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^www\./i.test(trimmed)) return 'https://' + trimmed;
    if (/^[\w-]+(\.[\w-]+)+/.test(trimmed)) return 'https://' + trimmed;
    return trimmed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('companyName', form.companyName);
      fd.append('jobTitle', form.jobTitle);
      fd.append('description', form.description);
      fd.append('website', normalizeUrl(form.website));
      fd.append('evidenceUrls', form.evidenceUrls);
      if (file) fd.append('screenshot', file);
      await createReport(fd);
      toast.success('Report submitted successfully!');
      navigate('/community-reports');
    } catch {
      toast.error('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
      {!user ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <FiLogIn style={{ fontSize: '2.5rem', color: 'var(--primary-main)', marginBottom: 16 }} />
          <h2 style={{ marginBottom: 8 }}>Login Required</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>
            You need to be logged in to submit a scam report. This helps us prevent spam and keep the community safe.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg">
            <FiLogIn /> Login to Continue
          </Link>
          <p style={{ marginTop: 16, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary-main)' }}>Sign up free</Link>
          </p>
        </div>
      ) : (
        <>
          <h2 style={{ marginBottom: 5 }}>Report a Job Scam</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>
            Help protect others by reporting suspicious job listings.
          </p>
          <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              className={`form-input ${errors.companyName ? 'error' : ''}`}
              placeholder="e.g. Fake Corp Ltd"
              value={form.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
            />
            {errors.companyName && <div className="form-error">{errors.companyName}</div>}
          </div>
          <div className="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              className={`form-input ${errors.jobTitle ? 'error' : ''}`}
              placeholder="e.g. Data Entry Clerk"
              value={form.jobTitle}
              onChange={(e) => updateField('jobTitle', e.target.value)}
            />
            {errors.jobTitle && <div className="form-error">{errors.jobTitle}</div>}
          </div>
        </div>
        <div className="form-group">
          <label>Description *</label>
          <textarea
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            placeholder="Describe the scam in detail. Include any suspicious communication, demands, or red flags you noticed."
            rows={5}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
          />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>
        <div className="form-group">
          <label>Website URL</label>
          <input
            type="text"
            className={`form-input ${errors.website ? 'error' : ''}`}
            placeholder="https://suspicious-site.com"
            value={form.website}
            onChange={(e) => updateField('website', e.target.value)}
          />
          {errors.website && <div className="form-error">{errors.website}</div>}
        </div>
        <div className="form-group">
          <label>Evidence</label>
          <textarea
            className="form-textarea"
            placeholder="Paste any evidence such as email content, messages, or additional details..."
            rows={4}
            value={form.evidenceUrls}
            onChange={(e) => updateField('evidenceUrls', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Screenshot (optional)</label>
          {!file ? (
            <div
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className="file-upload-zone"
              style={{
                border: `2px dashed ${dragOver ? 'var(--primary-main)' : 'var(--border-color)'}`,
                borderRadius: 12, padding: '32px 20px', textAlign: 'center', cursor: 'pointer',
                background: dragOver ? 'rgba(21,101,192,0.05)' : 'var(--bg-secondary)',
                transition: 'all 0.25s ease',
              }}
            >
              <div className="file-upload-icon" style={{
                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
                background: dragOver ? 'rgba(21,101,192,0.12)' : 'var(--bg-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px dashed ${dragOver ? 'var(--primary-main)' : 'var(--border-color)'}`,
                transition: 'all 0.25s ease',
              }}>
                <FiUpload size={22} style={{ color: dragOver ? 'var(--primary-main)' : 'var(--text-muted)', transition: 'color 0.25s' }} />
              </div>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                Drop screenshot here
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
                or <span style={{ color: 'var(--primary-main)', fontWeight: 600, textDecoration: 'underline' }}>browse files</span>
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>PNG, JPG, GIF up to 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />
            </div>
          ) : (
            <div style={{
              position: 'relative', borderRadius: 12, overflow: 'hidden',
              border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
            }}>
              <img src={filePreview} alt="Preview" style={{
                width: '100%', maxHeight: 200, objectFit: 'contain', display: 'block',
                background: '#f8f8f8',
              }} />
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: 'var(--bg-primary)',
                borderTop: '1px solid var(--border-color)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                  <FiImage size={16} style={{ color: 'var(--primary-main)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                    ({(file.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', border: 'none', flexShrink: 0,
                    background: 'rgba(211,47,47,0.08)', color: 'var(--danger)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(211,47,47,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(211,47,47,0.08)'; }}
                >
                  <FiX size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
          {loading ? 'Submitting...' : <><FiSend /> Submit Report</>}
        </button>
      </form>
        </>
      )}
    </div>
  );
};

export default ReportForm;
