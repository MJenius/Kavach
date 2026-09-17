import React from 'react';
import { loadDemoDataset } from '../../../fixtures/demo-worker.ts';

export const EvidencePage: React.FC = () => {
  const data = loadDemoDataset();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Worker Evidence Graph</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Standardized multi-modal evidence objects linked to findings and trip timelines ({data.evidence.length} items logged).
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {data.evidence.map((ev) => (
          <div
            key={ev.id}
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-warning">{ev.type}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Confidence: {ev.confidence ? `${Math.round(ev.confidence * 100)}%` : 'N/A'}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {ev.description}
              </p>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <div>Source: {ev.source}</div>
              {ev.uri && <div style={{ wordBreak: 'break-all', color: 'var(--primary)' }}>{ev.uri}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
