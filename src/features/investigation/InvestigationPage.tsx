import React from 'react';
import { loadDemoDataset } from '../../../fixtures/demo-worker.ts';
import { calculateSLAFeasibility } from '../../calculations/index.ts';

/**
 * Format ISO timestamp to 24-hr Indian Standard Time (HH:mm IST) consistently
 */
function formatTimeIST(iso: string): string {
  // Parse date and explicitly format in Asia/Kolkata timezone
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  }).format(new Date(iso)) + ' IST';
}

export const InvestigationPage: React.FC = () => {
  const data = loadDemoDataset();
  const primaryFinding = data.findings[0];
  const primaryTrip = data.trips[0];

  // Dynamic calculations derived from events rather than hardcoded
  const waitEvent = data.tripEvents.find((e) => e.type === 'WAITING_STARTED');
  const handoverEvent = data.tripEvents.find((e) => e.type === 'PACKAGE_RECEIVED');
  const waitMinutes =
    waitEvent && handoverEvent
      ? Math.floor((new Date(handoverEvent.timestamp).getTime() - new Date(waitEvent.timestamp).getTime()) / 60000)
      : 7;

  const slaFeasibility = calculateSLAFeasibility(
    primaryTrip.slaSeconds || 600,
    waitMinutes * 60,
    900 // 15 min estimated travel in traffic
  );

  const penaltyRecord = data.earnings.find((e) => e.type === 'PENALTY');
  const penaltyAmount = Math.abs(penaltyRecord?.actualAmount || 350);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Trip Forensics & Discrepancy Investigation</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Reconstruction of trip timeline and evaluation of platform claims for Trip {primaryTrip.id}.
        </p>
      </div>

      {/* Primary Magic Moment Box (Section 46) */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-danger">PLATFORM CLAIM: ₹{penaltyAmount} PENALTY</span>
              <span className="badge badge-warning">STATUS: DISCREPANCY DETECTED</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{primaryFinding.title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '800px' }}>
              {primaryFinding.explanation}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-warning)' }}>
              {Math.round(primaryFinding.confidence * 100)}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Evidence Confidence</div>
          </div>
        </div>

        {/* Fact Summary Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '6px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Store Waiting</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{waitMinutes} min</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Uncompensated delay</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Remaining SLA</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-danger)' }}>
              {Math.floor(slaFeasibility.remainingSecondsForTransit / 60)} min
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Allocated: {Math.floor((primaryTrip.slaSeconds || 600) / 60)} min
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Transit Feasibility</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: slaFeasibility.isFeasible ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
              {slaFeasibility.isFeasible ? 'Feasible' : 'Unfeasible'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Deficit: {Math.floor(slaFeasibility.transitShortfallSeconds / 60)} min
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Recommended Action</div>
            <a
              href="/cases"
              style={{
                display: 'inline-block',
                marginTop: '0.2rem',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '0.75rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              Generate Review Package
            </a>
          </div>
        </div>
      </div>

      {/* Reconstructed Timeline with explicit IST timestamps */}
      <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Independent Reconstructed Timeline (Trip {primaryTrip.id})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.tripEvents.map((evt) => (
            <div
              key={evt.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '6px',
                borderLeft: '4px solid var(--primary)',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: '90px' }}>
                {formatTimeIST(evt.timestamp)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{evt.type}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Source: {evt.source}</div>
              </div>
              {evt.confidence && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {Math.round(evt.confidence * 100)}% conf
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
