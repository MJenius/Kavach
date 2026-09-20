import React from 'react';
import { EvidenceChip } from './EvidenceChip';

type EvidenceStatus = 'VERIFIED' | 'CALCULATED' | 'AI_INFERRED' | 'UNVERIFIED' | 'CONTRADICTED';

interface TimelineItem {
  timestamp: string;
  title: string;
  subtitle?: string;
  source?: string;
  evidenceIds?: string[];
  status?: EvidenceStatus;
  onEvidenceClick?: (id: string) => void;
}

interface TimelineViewProps {
  items: TimelineItem[];
  title?: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ items, title }) => {
  const formatTime = (isoString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      day: '2-digit',
      month: 'short'
    }).format(new Date(isoString));
  };

  return (
    <div style={{ padding: 'var(--space-4)' }}>
      {title && <h3 className="section-title">{title}</h3>}
      <div style={{ marginTop: 'var(--space-4)' }}>
        {items.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No timeline events.</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="timeline-item">
              <div style={{
                position: 'absolute',
                left: 0,
                top: '6px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                border: '2px solid var(--bg-surface)'
              }} />
              <div style={{ marginLeft: 'var(--space-6)', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 'var(--weight-medium)' }}>{item.title}</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                    {formatTime(item.timestamp)}
                  </div>
                </div>
                {item.subtitle && (
                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                    {item.subtitle}
                  </div>
                )}
                {item.source && (
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
                    Source: {item.source}
                  </div>
                )}
                {item.evidenceIds && item.evidenceIds.length > 0 && (
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
                    {item.evidenceIds.map(id => (
                      <EvidenceChip
                        key={id}
                        evidenceId={id}
                        status={item.status}
                        onClick={item.onEvidenceClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
