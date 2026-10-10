import React from 'react';

export const Loader = ({ message = 'Loading...' }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#94a3b8'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #334155',
      borderTop: '4px solid #6366f1',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '1rem'
    }}></div>
    <span>{message}</span>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);
