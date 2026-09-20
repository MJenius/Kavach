import React from 'react';

interface LoadingStateProps {
  message?: string;
  steps?: { label: string; status: 'pending' | 'active' | 'done' }[];
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...', steps }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)', textAlign: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <div style={{ marginTop: 'var(--space-4)', fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' }}>
        {message}
      </div>
      
      {steps && steps.length > 0 && (
        <div style={{ marginTop: 'var(--space-6)', width: '100%', maxWidth: '300px', textAlign: 'left' }}>
          {steps.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', opacity: step.status === 'pending' ? 0.5 : 1 }}>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: step.status === 'done' ? 'var(--accent-success)' : step.status === 'active' ? 'var(--primary)' : 'var(--bg-surface)',
                border: `1px solid ${step.status === 'pending' ? 'var(--border-color)' : 'transparent'}`
              }}>
                {step.status === 'done' && <span style={{ color: 'white', fontSize: '10px' }}>✓</span>}
                {step.status === 'active' && <span style={{ width: '6px', height: '6px', backgroundColor: 'white', borderRadius: '50%' }} />}
              </div>
              <span style={{ fontSize: 'var(--font-sm)', color: step.status === 'active' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
