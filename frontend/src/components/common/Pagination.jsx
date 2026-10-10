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
        className="btn-pagination"
      >
        Previous
      </button>

      <span style={{ color: '#94a3b8', margin: '0 0.5rem' }}>
        Page {currentPage + 1} of {totalPages}
      </span>

      <button
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        className="btn-pagination"
      >
        Next
      </button>

      <style>{`
        .btn-pagination {
          background: #1e293b;
          border: 1px solid #334155;
          color: #f8fafc;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-pagination:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .btn-pagination:hover:not(:disabled) {
          border-color: #6366f1;
        }
      `}</style>
    </div>
  );
};
