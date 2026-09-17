import React from 'react';
import { loadDemoDataset } from '../../../fixtures/demo-worker.ts';

export const EarningsPage: React.FC = () => {
  const data = loadDemoDataset();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Earnings Reconciliation</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Compare platform payouts against actual expected amounts, incentives, and operational expenses.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Earnings Table */}
        <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Payout & Penalty Records</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.earnings.map((earn) => (
              <div
                key={earn.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{earn.type}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{earn.source}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: (earn.actualAmount || 0) < 0 ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                    {(earn.actualAmount || 0) < 0 ? `-₹${Math.abs(earn.actualAmount || 0)}` : `₹${earn.actualAmount}`}
                  </div>
                  {earn.expectedAmount !== undefined && earn.expectedAmount !== earn.actualAmount && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-warning)' }}>
                      Expected: ₹{earn.expectedAmount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Table */}
        <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Operational Expenses</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.expenses.map((exp) => (
              <div
                key={exp.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{exp.type}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exp.source}</div>
                </div>
                <div style={{ fontWeight: 700 }}>₹{exp.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
