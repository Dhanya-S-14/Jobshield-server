import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    if (start > 1) pages.push(1);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    if (end < totalPages) pages.push(totalPages);
    return pages;
  };

  return (
    <div className="pagination">
      <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        <FiChevronLeft />
      </button>
      {getPages().map((p, i) =>
        p === '...' ? <span key={`ellipsis-${i}`} style={{ color: 'var(--text-muted)' }}>...</span> : (
          <button key={p} className={currentPage === p ? 'active' : ''} onClick={() => onPageChange(p)}>
            {p}
          </button>
        )
      )}
      <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        <FiChevronRight />
      </button>
    </div>
  );
};

export default Pagination;
