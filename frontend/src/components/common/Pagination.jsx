import React from 'react';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '2rem'
    }}>
      <button
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        className="btn btn-secondary"
        style={{ height: '36px', padding: '0 0.85rem', fontSize: '0.875rem' }}
      >
        Previous
      </button>

      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0.75rem' }}>
        Page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong>
      </span>

      <button
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        className="btn btn-secondary"
        style={{ height: '36px', padding: '0 0.85rem', fontSize: '0.875rem' }}
      >
        Next
      </button>
    </div>
  );
};
