import React from 'react';
import { FiClock } from 'react-icons/fi';

const ActivityFeed = ({ activities = [] }) => {
  const defaultActivities = [
    { text: 'Welcome to JobShield!', time: 'Just now', color: 'blue' },
    { text: 'Start scanning your first job posting', time: 'Get started', color: 'green' },
    { text: 'Check out community reports', time: 'Explore', color: 'orange' },
  ];

  const items = activities.length ? activities : defaultActivities;

  return (
    <div className="card">
      <div className="card-header">
        <h3><FiClock style={{ marginRight: 8 }} /> Activity</h3>
      </div>
      <div className="activity-feed">
        {items.map((a, i) => (
          <div key={i} className="activity-item animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={`activity-dot ${a.color}`} />
            <div className="activity-content">
              <p>{a.text}</p>
              <span className="activity-time">{a.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
