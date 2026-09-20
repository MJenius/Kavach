import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message, action }) => {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-8)', textAlign: 'center',
      backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
      border: '1px dashed var(--border-color)'
    }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '2rem', marginBottom: 'var(--space-4)' }}>
        ∅
      </div>
      <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
        {title}
      </h3>
      {message && (
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', maxWidth: '400px' }}>
          {message}
        </p>
      )}
      {action && (
        <Button variant="secondary" onClick={action.onClick} style={{ marginTop: message ? 0 : 'var(--space-4)' }}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
