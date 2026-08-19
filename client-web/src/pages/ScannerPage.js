import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import JobScanForm from '../components/scanner/JobScanForm';
import ScreenshotAnalyzer from '../components/scanner/ScreenshotAnalyzer';
import ScanResults from '../components/scanner/ScanResults';
import ParsedJobReview from '../components/scanner/ParsedJobReview';
import { CommentForm } from '../components/comments/Comments';
import { ScanWarnings } from '../components/warning/WarningBanner';
import { scanJob, saveScan } from '../services/scanService';
import { detectScam } from '../utils/scamDetector';
import { parseJobText } from '../utils/textParser';
import { ReactComponent as LogoSvg } from '../assets/jobshield-logo.svg';
import { FiShield, FiUserPlus, FiEdit3, FiImage } from 'react-icons/fi';
import { toast } from 'react-toastify';

const TRIAL_KEY = 'jobshield-trial-count';

const normalizeBackendResult = (backendData) => {
  const {
    riskScore = 0,
    riskLevel = 'Safe',
    aiExplanation = '',
    keywordsFound = [],
    details = {},
  } = backendData;

  const analysis = [];
  const redFlags = [];
  const positiveIndicators = [];

  const categoryKeys = Object.keys(details);
  for (const key of categoryKeys) {
    const cat = details[key];
    if (!cat) continue;
    const score = cat.riskScore || 0;
    const findings = cat.findings || [];
    const catDetails = cat.details || '';
    const catName = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

    let status = 'safe';
    if (score >= 50) status = 'scam';
    else if (score >= 20) status = 'suspicious';

    const detailLines = [];
    if (catDetails) detailLines.push(catDetails);
    if (findings.length > 0) {
      findings.forEach(f => {
        if (typeof f === 'string') detailLines.push(f);
        else if (f.message) detailLines.push(f.message);
      });
    }
    if (detailLines.length === 0) detailLines.push('No issues detected in this category.');

    analysis.push({
      category: catName,
      status,
      summary: catDetails || `${catName} analyzed — Risk: ${score}/100`,
      details: detailLines,
    });

    if (status === 'scam' || status === 'suspicious') {
      redFlags.push(`${catName}: ${catDetails || 'Concerns detected'}`);
    } else {
      positiveIndicators.push(`${catName}: ${catDetails || 'Looks OK'}`);
    }
  }

  if (keywordsFound.length > 0) {
    const kwNames = keywordsFound.map(k => typeof k === 'string' ? k : k.keyword || '').filter(Boolean);
    if (kwNames.length > 0) {
      redFlags.push(`Scam keywords detected: ${kwNames.join(', ')}`);
    }
  }

  const verdict = riskScore <= 20 ? 'Likely Legitimate' : riskScore <= 50 ? 'Suspicious' : 'Likely Scam';
  const riskLabel = riskScore <= 20 ? 'Low Risk' : riskScore <= 50 ? 'Medium Risk' : riskScore <= 75 ? 'High Risk' : 'Very High Risk';

  let recommendation;
  if (riskScore >= 60) {
    recommendation = 'AVOID. We strongly recommend NOT applying to this job. The risk indicators are too numerous and severe. Report this posting to help protect others.';
  } else if (riskScore >= 35) {
    recommendation = 'PROCEED WITH CAUTION. Verify the company independently. Search for reviews, check their official website, and never send money. If anything feels off, trust your instinct.';
  } else {
    recommendation = 'SAFE TO PROCEED. The job posting appears legitimate. However, always stay vigilant — never share sensitive personal information or send money to any employer.';
  }

  return {
    riskScore,
    riskLevel,
    riskLabel,
    verdict,
    explanation: aiExplanation,
    analysis,
    positiveIndicators,
    redFlags,
    recommendation,
    confidence: Math.min(70 + redFlags.length * 3, 98),
    flagsDetected: redFlags.length,
    totalChecks: categoryKeys.length || 1,
    companyName: backendData.companyName || '',
    jobTitle: backendData.jobTitle || '',
    _id: backendData.id,
  };
};

const ScannerPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('text');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [parsedFields, setParsedFields] = useState(null);
  const [scanCompany, setScanCompany] = useState('');
  const [scanDescription, setScanDescription] = useState('');
  const scanIdRef = useRef(null);

  const trialsUsed = parseInt(localStorage.getItem(TRIAL_KEY) || '0', 10);
  const isTrial = !user;

  const checkTrial = () => {
    if (isTrial && trialsUsed >= 3) {
      setShowLoginPrompt(true);
      return false;
    }
    return true;
  };

  const runDetection = async (data) => {
    if (!checkTrial()) return;
    setLoading(true);
    setResults(null);
    scanIdRef.current = null;
    const isTextOnly = typeof data === 'string';
    if (!isTextOnly) {
      setScanCompany(data.companyName || '');
      setScanDescription(data.jobDescription || '');
    }

    const formData = isTextOnly
      ? { jobTitle: '', companyName: '', jobDescription: data, salary: '', location: '', jobType: '', recruiterName: '', recruiterEmail: '', phoneNumber: '', website: '', experienceLevel: '', skills: '', applyLink: '' }
      : { ...data, skills: Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || '') };
    if (isTextOnly) {
      setScanCompany('');
      setScanDescription(data);
    }

    if (!isTrial) {
      try {
        const res = await scanJob(formData);
        const raw = res.data || res;
        const normalized = normalizeBackendResult(raw);
        scanIdRef.current = normalized._id || null;
        setResults(normalized);
        toast.success('AI analysis complete!');
        setLoading(false);
        return;
      } catch (err) {
        // fall through to local detection
      }
    }

    const localResults = detectScam(formData);
    scanIdRef.current = localResults._id || localResults.id || null;
    setResults(localResults);
    toast.success('AI analysis complete!');
    setLoading(false);
    if (isTrial) localStorage.setItem(TRIAL_KEY, String(trialsUsed + 1));
    if (!isTrial) {
      scanJob(formData).then(res => {
        const raw = res.data || res;
        scanIdRef.current = raw.id || raw._id || scanIdRef.current;
      }).catch(() => {});
    }
  };

  const handleOcrComplete = (text) => {
    setOcrText(text);
    if (text && text.trim()) {
      const parsed = parseJobText(text);
      setParsedFields(parsed);
    }
  };

  const handleParsedConfirm = (edited) => {
    const { jobDescription, ...fields } = edited;
    runDetection({ ...fields, jobDescription: jobDescription || '' });
  };

  const handleResetScreenshot = () => {
    setResults(null);
    setParsedFields(null);
    setOcrText('');
  };

  const handleScan = async (formData) => {
    if (!checkTrial()) return;
    setLoading(true);
    setResults(null);
    scanIdRef.current = null;
    setScanCompany(formData.companyName || '');
    setScanDescription(formData.jobDescription || '');

    const normalizedForm = {
      ...formData,
      skills: Array.isArray(formData.skills) ? formData.skills.join(', ') : (formData.skills || ''),
    };

    if (!isTrial) {
      try {
        const data = await scanJob(normalizedForm);
        const raw = data.data || data;
        const normalized = normalizeBackendResult(raw);
        scanIdRef.current = normalized._id || null;
        setResults(normalized);
        toast.success('Scan complete!');
        setLoading(false);
        return;
      } catch {
        // fall through
      }
    }

    const localResults = detectScam(normalizedForm);
    setResults(localResults);
    toast.success('AI analysis complete!');
    if (isTrial) localStorage.setItem(TRIAL_KEY, String(trialsUsed + 1));
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) { setShowLoginPrompt(true); return; }
    const id = scanIdRef.current || results?._id || results?.id;
    if (!id) { toast.error('Cannot save — no scan ID'); return; }
    try {
      await saveScan(id);
      toast.success('Saved to your list!');
    } catch { toast.error('Failed to save'); }
  };

  const tabStyle = (tab) => ({
    flex: 1, padding: '10px 20px', border: 'none', borderRadius: 10, cursor: 'pointer',
    background: mode === tab ? 'var(--bg-card)' : 'transparent',
    color: mode === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
    fontWeight: 600, fontSize: '0.9rem',
    boxShadow: mode === tab ? 'var(--shadow)' : 'none',
    transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
  });

  return (
    <>
      {isTrial ? (
        <div style={{ background: 'var(--gradient-primary)', padding: '12px 20px', textAlign: 'center', color: '#fff' }}>
          <strong>Free Trial:</strong> You have {3 - trialsUsed} scan{3 - trialsUsed !== 1 ? 's' : ''} left.{' '}
          {trialsUsed < 3 ? (
            <span style={{ opacity: 0.9, fontSize: '0.85rem' }}>Create an account for unlimited scans!</span>
          ) : (
            <Link to="/register" style={{ color: '#ffc107', fontWeight: 700, textDecoration: 'underline' }}>Create an account</Link>
          )}
        </div>
      ) : (
        <div style={{ background: 'linear-gradient(135deg, #059669, #10b981)', padding: '12px 20px', textAlign: 'center', color: '#fff' }}>
          <strong>Unlimited Scans:</strong> You have full access.{' '}
          <span style={{ opacity: 0.9, fontSize: '0.85rem' }}>Results are automatically saved to your history.</span>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-secondary)', borderRadius: 12, padding: 4, maxWidth: 360, marginTop: 24 }}>
          <button style={tabStyle('text')} onClick={() => { setMode('text'); setResults(null); setParsedFields(null); setOcrText(''); }}>
            <FiEdit3 /> Paste Details
          </button>
          <button style={tabStyle('screenshot')} onClick={() => { setMode('screenshot'); setResults(null); setParsedFields(null); setOcrText(''); }}>
            <FiImage /> Upload Screenshot
          </button>
        </div>
      </div>

      {mode === 'text' ? (
        <div className="scanner-page tab-panel" style={{ paddingTop: 0 }}>
          <div className="scanner-section">
            <JobScanForm onSubmit={handleScan} loading={loading} />
          </div>
          <div className="scanner-section">
            {loading ? (
              <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="loader-spinner lg" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>Analyzing job posting...</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>Checking for scam patterns</p>
                </div>
              </div>
            ) : results ? (
              <>
                <ScanWarnings companyName={scanCompany} jobDescription={scanDescription} />
                <ScanResults results={results} onSave={handleSave} onRescan={() => setResults(null)} />
                {user && (
                  <div style={{ marginTop: 20 }}>
                    <CommentForm companyName={scanCompany} />
                  </div>
                )}
                {isTrial && (
                  <div style={{ marginTop: 20, padding: 24, borderRadius: 16, background: 'var(--gradient-primary)', textAlign: 'center', color: '#fff' }}>
                    <FiShield style={{ fontSize: '2.5rem', marginBottom: 12 }} />
                    <h3 style={{ color: '#fff', marginBottom: 8 }}>Unlock Full Protection</h3>
                    <p style={{ opacity: 0.9, marginBottom: 16, fontSize: '0.9rem' }}>
                      Create a free account to save results, view history, and scan unlimited job postings.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Link to="/register" className="btn" style={{ background: '#fff', color: 'var(--primary-main)', fontWeight: 700, padding: '12px 24px', borderRadius: 10 }}>
                        <FiUserPlus /> Create Free Account
                      </Link>
                      <Link to="/login" className="btn" style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.4)', fontWeight: 600, padding: '12px 24px', borderRadius: 10 }}>
                        Sign In
                      </Link>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, minHeight: 300 }}>
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <LogoSvg width="80" height="80" style={{ marginBottom: 16, opacity: 0.3, margin: '0 auto 16px' }} />
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Ready to Scan</h3>
                  <p style={{ fontSize: '0.9rem', maxWidth: 300, margin: '0 auto' }}>
                    Fill in the job details on the left and click "Scan Job Posting" to get an instant AI risk assessment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="tab-panel" style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px 40px' }}>
          <ScreenshotAnalyzer onTextExtracted={handleOcrComplete} />

          {parsedFields && !results && !loading && (
            <ParsedJobReview
              parsed={parsedFields}
              jobDescription={ocrText}
              onConfirm={handleParsedConfirm}
              onCancel={handleResetScreenshot}
              loading={loading}
            />
          )}

          {loading && (
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
              <div style={{ textAlign: 'center' }}>
                <div className="loader-spinner lg" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Analyzing screenshot...</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>Running scam detection</p>
              </div>
            </div>
          )}

          {results && !loading && (
            <>
              <ScanWarnings companyName={scanCompany} jobDescription={scanDescription} />
              <ScanResults results={results} onSave={handleSave} onRescan={handleResetScreenshot} />
              {user && (
                <div style={{ marginTop: 20 }}>
                  <CommentForm companyName={scanCompany} />
                </div>
              )}
              {isTrial && (
                <div style={{ marginTop: 20, padding: 24, borderRadius: 16, background: 'var(--gradient-primary)', textAlign: 'center', color: '#fff' }}>
                  <FiShield style={{ fontSize: '2.5rem', marginBottom: 12 }} />
                  <h3 style={{ color: '#fff', marginBottom: 8 }}>Unlock Full Protection</h3>
                  <p style={{ opacity: 0.9, marginBottom: 16, fontSize: '0.9rem' }}>
                    Create a free account to save results, view history, and scan unlimited job postings.
                  </p>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/register" className="btn" style={{ background: '#fff', color: 'var(--primary-main)', fontWeight: 700, padding: '12px 24px', borderRadius: 10 }}>
                      <FiUserPlus /> Create Free Account
                    </Link>
                    <Link to="/login" className="btn" style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.4)', fontWeight: 600, padding: '12px 24px', borderRadius: 10 }}>
                      Sign In
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {showLoginPrompt && (
        <div className="modal-overlay" onClick={() => setShowLoginPrompt(false)}>
          <div className="modal-content" style={{ maxWidth: 400, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>&#x1F512;</div>
            <h2 style={{ marginBottom: 8 }}>Login Required</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Create a free account or sign in to scan unlimited job postings and access full features.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/register')}><FiUserPlus /> Create Account</button>
              <button className="btn btn-secondary" onClick={() => navigate('/login')}>Sign In</button>
              <button className="btn btn-ghost" onClick={() => setShowLoginPrompt(false)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)' }}>Maybe Later</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScannerPage;
