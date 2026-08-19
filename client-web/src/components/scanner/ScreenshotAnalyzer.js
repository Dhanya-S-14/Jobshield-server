import React, { useState, useRef } from 'react';
import { FiUpload, FiFile, FiX, FiImage, FiCpu, FiAlertCircle, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

const ScreenshotAnalyzer = ({ onTextExtracted }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState('');
  const [ocrError, setOcrError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [confidence, setConfidence] = useState(null);
  const [wordCount, setWordCount] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setOcrError('Please upload an image file (PNG, JPG, etc.)');
      return;
    }
    setOcrError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setExtractedText('');
    setConfidence(null);
    setWordCount(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const runOcr = async () => {
    if (!file) return;
    setOcrLoading(true);
    setOcrError('');
    setOcrProgress('Uploading image...');
    try {
      const token = localStorage.getItem('jobshield-token');
      const formData = new FormData();
      formData.append('image', file);

      setOcrProgress('Preprocessing image...');

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('http://localhost:5002/api/ocr/extract', {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'OCR extraction failed');
      }

      const { text, confidence: conf, wordCount: wc } = result.data;

      if (!text || text.trim().length < 10) {
        setOcrError('Could not extract enough text from the image. Please upload a clearer screenshot with visible text.');
        return;
      }

      setExtractedText(text);
      setConfidence(conf);
      setWordCount(wc);
    } catch (err) {
      setOcrError(err.message || 'Failed to extract text from image. Please try a clearer screenshot.');
    } finally {
      setOcrLoading(false);
      setOcrProgress('');
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setExtractedText('');
    setOcrError('');
    setConfidence(null);
    setWordCount(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <h3 style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <FiImage /> Upload Screenshot
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
        Take a screenshot of a job posting and upload it. We'll extract the text and analyze it.
      </p>

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className="file-upload-zone"
          style={{
            border: `2px dashed ${dragOver ? 'var(--primary-main)' : 'var(--border-color)'}`,
            borderRadius: 12, padding: 40, textAlign: 'center', cursor: 'pointer',
            background: dragOver ? 'rgba(21,101,192,0.05)' : 'var(--bg-secondary)',
            transition: 'all 0.25s ease',
          }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
            background: dragOver ? 'rgba(21,101,192,0.12)' : 'var(--bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px dashed ${dragOver ? 'var(--primary-main)' : 'var(--border-color)'}`,
            transition: 'all 0.25s ease',
          }}>
            <FiUpload style={{ fontSize: '1.5rem', color: dragOver ? 'var(--primary-main)' : 'var(--text-muted)', transition: 'color 0.25s' }} />
          </div>
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)', margin: 0, fontSize: '1rem' }}>
            Drop a screenshot here
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 6 }}>
            or <span style={{ color: 'var(--primary-main)', fontWeight: 600, textDecoration: 'underline' }}>click to browse files</span>
          </p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <FiImage size={12} /> PNG, JPG, WEBP up to 5MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/bmp"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div>
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 8, border: '1px solid var(--border-color)' }}>
            <img src={preview} alt="Screenshot preview" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', background: '#f0f0f0', display: 'block' }} />
            {!ocrLoading && (
              <button
                onClick={clearFile}
                style={{
                  position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(211,47,47,0.8)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; }}
              >
                <FiX />
              </button>
            )}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', borderRadius: 8, marginBottom: 12,
            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
              <FiFile size={14} style={{ color: 'var(--primary-main)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                ({(file.size / 1024).toFixed(0)} KB)
              </span>
            </div>
            {!ocrLoading && (
              <button onClick={clearFile} style={{
                fontSize: '0.75rem', color: 'var(--danger)', background: 'none', border: 'none',
                cursor: 'pointer', fontWeight: 600, flexShrink: 0,
              }}>
                Remove
              </button>
            )}
          </div>

          {!extractedText && !ocrLoading && (
            <button className="btn btn-primary btn-block" onClick={runOcr} disabled={ocrLoading}>
              <FiCpu /> Extract Text from Image
            </button>
          )}

          {ocrLoading && (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div className="loader-spinner lg" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{ocrProgress || 'Reading text from image...'}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Server-side OCR with image preprocessing for best accuracy
              </p>
            </div>
          )}

          {ocrError && (
            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(211,47,47,0.08)', color: 'var(--danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <FiAlertCircle /> {ocrError}
              <button
                onClick={() => { setOcrError(''); }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
              >
                Try Again
              </button>
            </div>
          )}

          {extractedText && (
            <div>
              {confidence !== null && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8,
                  background: confidence >= 70 ? 'rgba(56,142,60,0.06)' : 'rgba(245,124,0,0.06)',
                  border: `1px solid ${confidence >= 70 ? 'rgba(56,142,60,0.15)' : 'rgba(245,124,0,0.15)'}`,
                  marginBottom: 12, fontSize: '0.82rem',
                }}>
                  <FiCheckCircle size={14} style={{ color: confidence >= 70 ? 'var(--success)' : '#f57c00' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>
                    OCR Confidence: <strong>{confidence}%</strong>
                    {wordCount && <span> &middot; {wordCount} words extracted</span>}
                  </span>
                </div>
              )}

              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Extracted Text</label>
              <textarea
                className="form-textarea"
                rows={8}
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono, monospace)' }}
              />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Review and edit the extracted text if needed. The more accurate the text, the better the scam detection.
              </p>

              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => { setExtractedText(''); setConfidence(null); setWordCount(null); }}
                  style={{ flex: '0 0 auto' }}
                >
                  <FiCpu /> Re-extract
                </button>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1 }}
                  onClick={() => onTextExtracted && onTextExtracted(extractedText)}
                  disabled={!extractedText.trim()}
                >
                  <FiArrowRight /> Parse & Analyze Job
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScreenshotAnalyzer;
