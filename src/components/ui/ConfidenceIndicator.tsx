import React from 'react';

interface ConfidenceIndicatorProps {
  value: number; // 0-1
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ value, label, size = 'md' }) => {
  const percentage = Math.max(0, Math.min(100, Math.round(value * 100)));
  
  let color = 'var(--accent-success)';
  if (percentage < 50) color = 'var(--accent-danger)';
  else if (percentage < 80) color = 'var(--accent-warning)';

  const heightMap = {
    sm: '4px',
    md: '8px',
    lg: '12px'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
          <span style={{ fontWeight: 'var(--weight-medium)', color }}>{percentage}%</span>
        </div>
      )}
      <div style={{ 
        width: '100%', 
        height: heightMap[size], 
        backgroundColor: 'var(--bg-surface-hover)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: color,
          transition: 'width 0.3s ease-in-out'
        }} />
      </div>
    </div>
  );
};
