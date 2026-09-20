import React from 'react';
import { Card } from './Card';

interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'default' | 'success' | 'warning' | 'danger';
  source?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  sublabel,
  trend,
  color = 'default',
  source,
}) => {
  const colorMap = {
    default: 'var(--text-primary)',
    success: 'var(--accent-success)',
    warning: 'var(--accent-warning)',
    danger: 'var(--accent-danger)',
  };

  return (
    <Card className="metric-card" elevated>
      <div className="metric-label">
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        {source && (
          <span
            style={{
              fontSize: 'var(--font-2xs)',
              color: 'var(--text-muted)',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {source}
          </span>
        )}
      </div>

      <div
        className="metric-value"
        style={{
          color: colorMap[color],
          minWidth: 0,
        }}
      >
        {value}
      </div>

      {(sublabel || trend) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: 'var(--font-xs)',
            color: 'var(--text-muted)',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
          }}
        >
          {trend === 'up' && <span style={{ color: 'var(--accent-success)', fontWeight: 700 }}>↑</span>}
          {trend === 'down' && <span style={{ color: 'var(--accent-danger)', fontWeight: 700 }}>↓</span>}
          {trend === 'neutral' && <span>→</span>}
          {sublabel && <span>{sublabel}</span>}
        </div>
      )}
    </Card>
  );
};
