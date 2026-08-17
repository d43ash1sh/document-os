import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '380px'
      }}
    >
      {toasts.map(t => (
        <div
          key={t.id}
          className="fade-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            borderLeft: `4px solid ${
              t.type === 'success' ? 'var(--success)' : t.type === 'error' ? 'var(--danger)' : 'var(--primary-purple)'
            }`
          }}
        >
          {t.type === 'success' && <CheckCircle2 size={18} color="var(--success)" />}
          {t.type === 'error' && <AlertCircle size={18} color="var(--danger)" />}
          {t.type === 'info' && <Info size={18} color="var(--primary-purple)" />}
          
          <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--dark-text)' }}>{t.text}</span>
          
          <button
            onClick={() => onDismiss(t.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary-text)' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
