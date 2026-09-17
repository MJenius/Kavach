import React, { useState } from 'react';
import { createApiClient } from '../../api/mock-client.ts';

export const WorkerTwinPage: React.FC = () => {
  const [query, setQuery] = useState('How can I optimize my earnings tomorrow?');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAskTwin = async () => {
    setLoading(true);
    const client = createApiClient();
    const res = await client.queryWorkerTwin({ workerId: 'worker-vikram-01', query });
    setResponse(res.answer);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Worker Digital Twin</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Historical profile modeling, shift optimization, and earnings counterfactual simulations.
        </p>
      </div>

      {/* Query Bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
        }}
      >
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
          Ask your Worker Twin
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: '#fff',
              fontSize: '0.9rem',
            }}
          />
          <button
            onClick={handleAskTwin}
            disabled={loading}
            style={{
              padding: '0.6rem 1.25rem',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {loading ? 'Analyzing...' : 'Simulate'}
          </button>
        </div>

        {response && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1rem',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid var(--primary)',
              borderRadius: '6px',
              fontSize: '0.9rem',
            }}
          >
            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Twin Recommendation:</strong>
            {response}
          </div>
        )}
      </div>

      {/* Profile Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Optimal Earning Hours</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            18:00 to 22:00 (Evening Surge) consistently generates 35% higher net hourly returns in South Bengaluru.
          </p>
        </div>
        <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Bottleneck Identification</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Store Koramangala 4b accounts for average merchant wait of 7.4 minutes, increasing late penalty risk by 2.3x.
          </p>
        </div>
      </div>
    </div>
  );
};
