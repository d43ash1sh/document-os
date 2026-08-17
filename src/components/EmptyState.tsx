import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: any;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div
      style={{
        padding: '60px 24px',
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px dashed var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '20px 0'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--light-purple)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}
      >
        <Icon size={26} color="var(--primary-purple)" />
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--dark-text)', marginBottom: '6px' }}>
        {title}
      </h3>

      <p style={{ fontSize: '13px', color: 'var(--secondary-text)', maxWidth: '400px', marginBottom: '20px', lineHeight: 1.5 }}>
        {description}
      </p>

      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
};
