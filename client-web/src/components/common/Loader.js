import React from 'react';

const Loader = ({ size = 'md', text = '' }) => {
  const sizeClass = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : '';
  return (
    <div className="loader-container" style={{ flexDirection: 'column', gap: 12 }}>
      <div className={`loader-spinner ${sizeClass}`} />
      {text && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{text}</span>}
    </div>
  );
};

export default Loader;
