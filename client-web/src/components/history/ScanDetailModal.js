import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import RiskScoreGauge from '../common/RiskScoreGauge';
import RiskBadge from '../common/RiskBadge';
import AnalysisDetail from '../scanner/AnalysisDetail';
import Loader from '../common/Loader';
import { CommentForm, CommentList } from '../comments/Comments';
import { getScanById, saveScan, deleteScan } from '../../services/scanService';
import { FiSave, FiTrash2, FiDownload, FiShare2, FiCpu } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ScanDetailModal = ({ scanId, onClose, onUpdate }) => {
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scanId) return;
    setLoading(true);
    getScanById(scanId)
      .then((data) => setScan(data.data || data.scan || data))
      .catch(() => toast.error('Failed to load scan details'))
      .finally(() => setLoading(false));
  }, [scanId]);

  const handleSave = async () => {
    try {
      await saveScan(scan._id || scan.id);
      toast.success('Saved!');
      onUpdate && onUpdate();
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this scan?')) return;
    try {
      await deleteScan(scan._id || scan.id);
      toast.success('Deleted');
      onClose();
      onUpdate && onUpdate();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <Modal isOpen={!!scanId} onClose={onClose} title="Scan Details" maxWidth="650px">
      {loading ? <Loader text="Loading details..." /> : !scan ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Scan not found</p>
      ) : (
        <>
          <RiskScoreGauge score={scan.riskScore || 0} size={160} />
          <div style={{ textAlign: 'center', margin: '12px 0' }}>
            <RiskBadge level={scan.riskLevel} />
          </div>

          <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <h4 style={{ marginBottom: 8 }}>Job Details</h4>
            {[
              { label: 'Job Title', value: scan.jobTitle },
              { label: 'Company', value: scan.companyName },
              { label: 'Location', value: scan.location },
              { label: 'Salary', value: scan.salary },
              { label: 'Job Type', value: scan.jobType },
              { label: 'Experience', value: scan.experienceLevel },
              { label: 'Recruiter', value: scan.recruiterName },
              { label: 'Recruiter Email', value: scan.recruiterEmail },
              { label: 'Phone', value: scan.phoneNumber },
              { label: 'Website', value: scan.website },
            ].filter((r) => r.value).map((r, i) => (
              <div key={i} className="company-info-row">
                <span className="label">{r.label}</span>
                <span className="value">{r.value}</span>
              </div>
            ))}
          </div>

          {scan.explanation && (
            <div className="ai-explanation">
              <h4><FiCpu /> AI Analysis</h4>
              <p>{scan.explanation}</p>
            </div>
          )}

          {scan.analysis && scan.analysis.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ marginBottom: 12, fontSize: '0.95rem', fontWeight: 600 }}>Analysis Breakdown</h4>
              {scan.analysis.map((item, i) => (
                <AnalysisDetail key={i} item={item} />
              ))}
            </div>
          )}

          <div className="results-actions" style={{ marginTop: 20 }}>
            <button className="btn btn-success btn-sm" onClick={handleSave}><FiSave /> Save</button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}><FiTrash2 /> Delete</button>
            <button className="btn btn-secondary btn-sm"><FiDownload /> Export PDF</button>
            <button className="btn btn-secondary btn-sm"><FiShare2 /> Share</button>
          </div>

          <CommentForm scanId={scan._id || scan.id} companyName={scan.companyName} />
          <CommentList scanId={scan._id || scan.id} companyName={scan.companyName} />
        </>
      )}
    </Modal>
  );
};

export default ScanDetailModal;
