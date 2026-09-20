import React from 'react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ title = 'An error occurred', message, onRetry }) => {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-8)', textAlign: 'center',
      backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)',
      border: '1px dashed var(--accent-danger)'
    }}>
      <div style={{ color: 'var(--accent-danger)', fontSize: '2rem', marginBottom: 'var(--space-4)' }}>
        ⚠
      </div>
      <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', maxWidth: '400px' }}>
        {message}
      </p>
      {onRetry && (
        <Button variant="danger" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
