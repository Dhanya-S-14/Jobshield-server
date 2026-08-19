import React from 'react';

const SkeletonCard = ({ count = 1 }) => {
  const arr = Array.from({ length: count }, (_, i) => i);
  return arr.map(i => (
    <div key={i} className="skeleton-card" style={{ marginBottom: 16 }}>
      <div className="skeleton skeleton-avatar" style={{ marginBottom: 12 }} />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text" style={{ width: '60%' }} />
    </div>
  ));
};

export default SkeletonCard;
