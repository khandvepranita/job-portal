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
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: bgColors[type] || bgColors.info,
      color: '#fff',
      padding: '0.85rem 1.5rem',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
      fontWeight: '500',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
      >
        ✕
      </button>
    </div>
  );
};
