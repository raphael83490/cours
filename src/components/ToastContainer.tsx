import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '400px',
      width: '100%',
      pointerEvents: 'none'
    }}>
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="animate-slide-up"
            style={{
              pointerEvents: 'auto',
              background: 'white',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${
                isSuccess 
                  ? '#86EFAC' 
                  : isWarning 
                  ? '#FDE68A' 
                  : isError 
                  ? '#FCA5A5' 
                  : '#BAE6FD'
              }`,
              borderLeftWidth: '6px',
              borderLeftColor: isSuccess 
                ? '#00A389' 
                : isWarning 
                ? '#F59E0B' 
                : isError 
                ? '#EF4444' 
                : '#0596DE',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            <div style={{
              color: isSuccess ? '#00A389' : isWarning ? '#F59E0B' : isError ? '#EF4444' : '#0596DE',
              flexShrink: 0,
              marginTop: '1px'
            }}>
              {isSuccess && <CheckCircle2 size={20} />}
              {isWarning && <AlertTriangle size={20} />}
              {isError && <AlertCircle size={20} />}
              {!isSuccess && !isWarning && !isError && <Info size={20} />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                {toast.title}
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                color: 'var(--text-muted)',
                padding: '2px',
                borderRadius: '4px'
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
