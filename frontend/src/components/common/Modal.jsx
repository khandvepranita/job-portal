import React from 'react';

export const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        maxWidth: '560px',
        width: '100%',
        padding: '1.75rem',
        color: '#1E293B',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '1rem',
          marginBottom: '1.25rem'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#173B57' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '1.25rem', cursor: 'pointer', padding: '0.2rem' }}
            title="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
