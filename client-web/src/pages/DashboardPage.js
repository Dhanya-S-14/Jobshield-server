import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardStats from '../components/dashboard/DashboardStats';
import RiskChart from '../components/dashboard/RiskChart';
import RecentScans from '../components/dashboard/RecentScans';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import ScanDetailModal from '../components/history/ScanDetailModal';
import { getDashboardStats, getDashboardRecent, getChartData, deleteScan } from '../services/scanService';
import { FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, recentRes, chartRes] = await Promise.all([
          getDashboardStats().catch(() => ({ data: { total: 0, safe: 0, suspicious: 0, scam: 0 } })),
          getDashboardRecent().catch(() => ({ data: [] })),
          getChartData().catch(() => ({ data: { safe: 0, suspicious: 0, scam: 0 } })),
        ]);
        setStats(statsRes.data || statsRes);
        setRecentScans(recentRes.data || recentRes || []);
        setChartData(chartRes.data || chartRes);
      } catch {
        setStats({ total: 0, safe: 0, suspicious: 0, scam: 0 });
        setRecentScans([]);
        setChartData({ safe: 0, suspicious: 0, scam: 0 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (scan) => {
    if (!window.confirm('Delete this scan?')) return;
    try {
      await deleteScan(scan._id || scan.id);
      toast.success('Scan deleted');
      setRecentScans((prev) => prev.filter((s) => (s._id || s.id) !== (scan._id || scan.id)));
    } catch {
      toast.error('Delete failed');
    }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loader-container" style={{ minHeight: 400 }}>
          <div className="loader-spinner lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="reveal visible" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff', boxShadow: '0 4px 16px rgba(21,101,192,0.3)' }}>
          <FiShield />
        </div>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 2 }}>
            {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Here's your security overview</p>
        </div>
      </div>

      <div className="reveal visible animate-delay-100">
        <DashboardStats stats={stats} />
      </div>

      <div className="dashboard-grid">
        <div className="reveal visible animate-delay-200">
          <RiskChart data={chartData} />
        </div>
        <div className="reveal visible animate-delay-300">
          <RecentScans scans={recentScans} onView={setSelectedScan} onDelete={handleDelete} />
        </div>
      </div>

      <div className="reveal visible animate-delay-400">
        <ActivityFeed activities={recentScans.slice(0, 8).map((s) => ({
          text: `Scanned ${s.jobTitle} at ${s.companyName} - ${s.riskLevel || 'Pending'}`,
          time: s.createdAt ? new Date(s.createdAt).toLocaleString() : 'Recently',
          color: s.riskLevel === 'Safe' ? 'green' : s.riskLevel === 'Scam' ? 'red' : s.riskLevel === 'Suspicious' ? 'orange' : 'blue',
        }))} />
      </div>

      <ScanDetailModal scanId={selectedScan?._id || selectedScan?.id} onClose={() => setSelectedScan(null)} onUpdate={() => {}} />
    </div>
  );
};

export default DashboardPage;
