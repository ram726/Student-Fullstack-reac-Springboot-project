import React, { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

// Minimal toast style, you can expand in CSS if desired
const toastContainerStyle = {
  position: 'fixed',
  bottom: 16,
  right: 16,
  zIndex: 9999,
  minWidth: 280,
};

const toastStyle = (type) => ({
  padding: '12px 16px',
  borderRadius: 8,
  color: '#fff',
  marginBottom: 8,
  boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
  background: type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#198754'
});

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // register global notify function
    notificationService.setNotifyFn((payload) => {
      // payload: { type: 'error'|'success'|'info', title, message }
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, ...payload }]);
      // auto remove after 4s
      setTimeout(() => {
        setToasts((t) => t.filter(x => x.id !== id));
      }, 4000);
    });

    return () => {
      notificationService.setNotifyFn(null);
    };
  }, []);

  const remove = (id) => setToasts((t) => t.filter(x => x.id !== id));

  return (
    <>
      {children}
      <div style={toastContainerStyle} aria-live="polite" aria-atomic="true">
        {toasts.map(t => (
          <div key={t.id} style={toastStyle(t.type || 'info')} role="alert">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontWeight: 700 }}>{t.title || (t.type === 'error' ? 'Error' : 'Info')}</div>
              <button onClick={() => remove(t.id)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }} aria-label="Close">×</button>
            </div>
            <div style={{ marginTop: 6 }}>{t.message}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default NotificationProvider;
