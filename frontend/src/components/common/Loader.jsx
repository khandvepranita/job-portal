import React from 'react';

export const Loader = ({ message = 'Loading...' }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3.5rem 1rem',
    color: 'var(--text-muted)'
  }}>
    <div style={{
      width: '36px',
      height: '36px',
      border: '3px solid #E2E8F0',
      borderTop: '3px solid #2563EB',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      marginBottom: '0.85rem'
    }}></div>
    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);
