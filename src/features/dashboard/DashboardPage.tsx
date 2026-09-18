import React from 'react';
import { Link } from 'react-router-dom';
import { loadDemoDataset } from '../../../fixtures/demo-worker.ts';

export const DashboardPage: React.FC = () => {
  const data = loadDemoDataset();
  const primaryFinding = data.findings[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Worker Overview</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Welcome back, {data.worker.name}. Independent real-time reconciliation for your delivery shifts on {data.worker.platforms.join(', ')}.
        </p>
      </div>

      {/* Metric Cards derived from unified fixture loader */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Platform Gross Payout</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>
            ₹{data.summary.grossEarnings.toLocaleString('en-IN')}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Reported by platform apps</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Estimated Real Earnings</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--accent-success)' }}>
            ₹{data.summary.netEarnings.toLocaleString('en-IN')}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>After fuel, data & deductions</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Effective Hourly Rate</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>
            ₹{data.summary.effectiveHourlyRate} / hr
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Based on active online hours</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Actionable Discrepancies</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--accent-warning)' }}>
            ₹{data.summary.discrepancyTotal.toLocaleString('en-IN')} Impact
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            ₹350 evidence dispute • ₹300 ledger shortfall ({data.cases.length} cases)
          </div>
        </div>
      </div>

      {/* Alert Banner dynamically consuming primary finding */}
      {primaryFinding && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid var(--accent-warning)',
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-warning">{primaryFinding.type}</span>
              <strong style={{ fontSize: '1rem' }}>{primaryFinding.title}</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '800px' }}>
              {primaryFinding.explanation}
            </p>
          </div>
          <Link
            to="/investigation"
            style={{
              background: 'var(--accent-warning)',
              color: '#000',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              textDecoration: 'none',
            }}
          >
            Review Evidence
          </Link>
        </div>
      )}
    </div>
  );
};
