import React, { useState } from 'react';
import { FiEdit2, FiCheck, FiX, FiCpu, FiArrowRight } from 'react-icons/fi';

const FIELDS = [
  { key: 'jobTitle', label: 'Job Title', type: 'text' },
  { key: 'companyName', label: 'Company Name', type: 'text' },
  { key: 'salary', label: 'Salary', type: 'text' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'jobType', label: 'Job Type', type: 'select', options: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship', 'Freelance'] },
  { key: 'experienceLevel', label: 'Experience Level', type: 'select', options: ['Entry', 'Mid', 'Senior', 'Lead'] },
  { key: 'recruiterName', label: 'Recruiter Name', type: 'text' },
  { key: 'recruiterEmail', label: 'Recruiter Email', type: 'email' },
  { key: 'phoneNumber', label: 'Phone Number', type: 'text' },
  { key: 'website', label: 'Website URL', type: 'text' },
  { key: 'applyLink', label: 'Apply Link', type: 'text' },
];

const ParsedJobReview = ({ parsed, jobDescription, onConfirm, onCancel, loading }) => {
  const [edited, setEdited] = useState({ ...parsed, jobDescription });
  const [editingField, setEditingField] = useState(null);

  const handleChange = (key, value) => {
    setEdited(prev => ({ ...prev, [key]: value }));
  };

  const filledCount = FIELDS.filter(f => edited[f.key] && edited[f.key].toString().trim()).length;

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem' }}>
          <FiEdit2 />
        </div>
        <div>
          <h3 style={{ margin: 0 }}>Extracted Job Details</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            AI parsed {filledCount}/{FIELDS.length} fields from the screenshot
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10, marginBottom: 16 }}>
        {FIELDS.map(field => {
          const val = edited[field.key];
          const isEditing = editingField === field.key;
          const hasValue = val && val.toString().trim();

          return (
            <div key={field.key} style={{
              padding: '8px 12px', borderRadius: 8,
              background: hasValue ? 'rgba(56,142,60,0.06)' : 'rgba(211,47,47,0.04)',
              border: `1px solid ${hasValue ? 'rgba(56,142,60,0.15)' : 'rgba(211,47,47,0.1)'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: hasValue ? 'var(--success)' : 'var(--danger)' }}>
                  {field.label} {!hasValue && <span style={{ fontWeight: 400, textTransform: 'none' }}>(missing)</span>}
                </label>
                <button
                  onClick={() => setEditingField(isEditing ? null : field.key)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, display: 'flex' }}
                  title={isEditing ? 'Done' : 'Edit'}
                >
                  {isEditing ? <FiCheck size={14} /> : <FiEdit2 size={14} />}
                </button>
              </div>
              {isEditing ? (
                field.type === 'select' ? (
                  <select
                    className="form-select"
                    value={val || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '4px 8px', marginTop: 2 }}
                    autoFocus
                  >
                    <option value="">--</option>
                    {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    className="form-input"
                    value={val || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '4px 8px', marginTop: 2 }}
                    autoFocus
                  />
                )
              ) : (
                <div style={{ fontSize: '0.85rem', fontWeight: 500, color: hasValue ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: hasValue ? 'normal' : 'italic' }}>
                  {hasValue ? val : 'Not found'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 4, display: 'block' }}>Full Description (editable)</label>
        <textarea
          className="form-textarea"
          rows={6}
          value={edited.jobDescription}
          onChange={e => handleChange('jobDescription', e.target.value)}
          style={{ fontSize: '0.82rem' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {onCancel && (
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            <FiX /> Cancel
          </button>
        )}
        <button className="btn btn-primary btn-lg" onClick={() => onConfirm(edited)} disabled={loading}>
          {loading ? (
            <><div className="loader-spinner sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> Analyzing...</>
          ) : (
            <><FiCpu /> <FiArrowRight /> Run Full Analysis</>
          )}
        </button>
      </div>
    </div>
  );
};

export default ParsedJobReview;
