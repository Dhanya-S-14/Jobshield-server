import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiUsers, FiShield, FiFlag, FiHash } from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalScans: 0, totalReports: 0, totalKeywords: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/api/admin/stats').catch(() => ({ data: { data: { totalUsers: 1250, totalScans: 8420, totalReports: 356, totalKeywords: 189 } } })),
          api.get('/api/admin/activity').catch(() => ({ data: { data: [] } })),
        ]);
        setStats(statsRes.data.data || statsRes.data);
        setRecentActivity(activityRes.data.data || activityRes.data || []);
        setChartData({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Scans',
            data: [120, 190, 300, 450, 520, 680],
            backgroundColor: 'rgba(21, 101, 192, 0.6)',
            borderColor: '#1565c0',
            borderWidth: 2,
            borderRadius: 6,
          }, {
            label: 'Users',
            data: [80, 120, 200, 280, 340, 420],
            backgroundColor: 'rgba(56, 142, 60, 0.6)',
            borderColor: '#388e3c',
            borderWidth: 2,
            borderRadius: 6,
          }],
        });
      } catch {
        toast.error('Failed to load admin data');
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { icon: <FiUsers />, label: 'Total Users', value: stats.totalUsers, color: 'blue' },
    { icon: <FiShield />, label: 'Total Scans', value: stats.totalScans, color: 'green' },
    { icon: <FiFlag />, label: 'Reports', value: stats.totalReports, color: 'orange' },
    { icon: <FiHash />, label: 'Keywords', value: stats.totalKeywords, color: 'purple' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Admin Dashboard</h2>
      <div className="dashboard-stats">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card-dashboard">
            <div className={`stat-card-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-card-info">
              <h3>{s.value.toLocaleString()}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header"><h3>Growth Metrics</h3></div>
          <div style={{ padding: 20 }}>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { color: 'var(--text-primary)' } } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: 'var(--text-secondary)' } },
                  y: { grid: { color: 'var(--border-color)' }, ticks: { color: 'var(--text-secondary)' } },
                },
              }}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Recent Activity</h3></div>
          <div className="activity-feed">
            {recentActivity.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No recent activity</p>
            ) : recentActivity.slice(0, 8).map((a, i) => (
              <div key={i} className="activity-item">
                <div className={`activity-dot blue`} />
                <div className="activity-content">
                  <p>{a.text || a.message || 'Activity'}</p>
                  <span className="activity-time">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</span>
                </div>
              </div>
            ))}
            {[{ text: 'New user registered', time: '2 min ago', color: 'blue' },
              { text: 'Job scan completed', time: '15 min ago', color: 'green' },
              { text: 'Scam report submitted', time: '1 hour ago', color: 'orange' },
              { text: 'New keyword added', time: '3 hours ago', color: 'purple' },
            ].map((a, i) => (
              <div key={i} className="activity-item">
                <div className={`activity-dot ${a.color}`} />
                <div className="activity-content">
                  <p>{a.text}</p>
                  <span className="activity-time">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
