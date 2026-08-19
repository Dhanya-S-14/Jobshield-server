import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getReports } from '../../services/reportService';
import { FiFlag, FiClock, FiAlertTriangle, FiExternalLink } from 'react-icons/fi';

const PublicReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getReports({ limit: 5, status: 'approved' });
        setReports(data.data || data.reports || []);
      } catch {
        // silent — just don't show the section
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading || reports.length === 0) return null;

  return (
    <section className="public-reports-section reveal">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 4 }}>
              <FiFlag style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Recent Community Reports
            </h2>
            <p className="section-subtitle" style={{ margin: 0 }}>
              Real scam reports from job seekers — stay informed, stay safe
            </p>
          </div>
          <Link to="/community-reports" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            View All Reports
          </Link>
        </div>

        <div className="reports-grid">
          {reports.map((r) => (
            <div key={r._id || r.id} className="report-card card-hover-effect">
              <div className="report-card-header">
                <div className="report-card-icon">
                  <FiAlertTriangle />
                </div>
                <div className="report-card-meta">
                  <h4 className="report-card-company">{r.companyName}</h4>
                  <span className="report-card-job">{r.jobTitle}</span>
                </div>
              </div>
              <p className="report-card-desc">
                {r.description?.length > 140
                  ? r.description.substring(0, 140) + '...'
                  : r.description}
              </p>
              <div className="report-card-footer">
                <span className="report-card-date">
                  <FiClock /> {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                </span>
                {r.website && (
                  <span className="report-card-link">
                    <FiExternalLink />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link to="/new-report" className="btn btn-outline" style={{ marginRight: 12 }}>
            <FiFlag /> Report a Scam
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PublicReports;
