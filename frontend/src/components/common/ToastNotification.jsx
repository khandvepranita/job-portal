import React, { useEffect } from 'react';

export const ToastNotification = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const bgColors = {
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    info: '#2563EB',
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: bgColors[type] || bgColors.info,
      color: '#FFFFFF',
      padding: '0.75rem 1.25rem',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      fontWeight: '500',
      fontSize: '0.9rem',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
      >
        ✕
      </button>
    </div>
  );
};
