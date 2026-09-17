import React, { useState } from 'react';
import { loadDemoDataset } from '../../../fixtures/demo-worker.ts';
import { calculateSLAFeasibility } from '../../calculations/index.ts';
import { createApiClient } from '../../api/mock-client.ts';
import type { AIInvestigationResult } from '../../domain/index.ts';

/**
 * Format ISO timestamp to 24-hr Indian Standard Time (HH:mm IST) consistently
 */
function formatTimeIST(iso: string): string {
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

  const [investigation, setInvestigation] = useState<AIInvestigationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleStartInvestigation = async () => {
    setLoading(true);
    setError(null);
    try {
      const client = createApiClient();
      const result = await client.investigateTrip(primaryTrip.id);
      setInvestigation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const activeFindings = investigation?.findings || [primaryFinding];
  const overallConfidence = investigation?.confidence ?? primaryFinding.confidence;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header and Live Investigation Trigger */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Trip Forensics & Discrepancy Investigation</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Multi-agent reconstruction of trip timeline, earnings discrepancies, and platform claims for Trip {primaryTrip.id}.
          </p>
        </div>
        <button
          onClick={handleStartInvestigation}
          disabled={loading}
          style={{
            background: loading ? 'var(--bg-surface-hover)' : 'var(--primary)',
            color: '#fff',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          {loading ? (
            <>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
              Investigating with AI Agents...
            </>
          ) : investigation ? (
            'Re-run Live Investigation'
          ) : (
            'Start Live AI Investigation'
          )}
        </button>
      </div>

      {/* Loading State Banner */}
      {loading && (
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid var(--primary)',
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ fontSize: '1.5rem' }}>🤖</div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              Supervisor Agent Orchestration in Progress
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Executing Forensics Agent (telemetry math), Earnings Agent (reconciliation), and Policy Agent (QuickBite terms) via AWS Bedrock Mantle...
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--accent-danger)',
            borderRadius: '8px',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ color: 'var(--accent-danger)', fontSize: '0.9rem' }}>
            <strong>Investigation Error:</strong> {error}
          </div>
          <button
            onClick={handleStartInvestigation}
            style={{
              background: 'var(--accent-danger)',
              color: '#fff',
              border: 'none',
              padding: '0.4rem 0.8rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Primary Magic Moment Box (Section 46) */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-danger">PLATFORM CLAIM: ₹{penaltyAmount} PENALTY</span>
              <span className="badge badge-warning">
                {investigation ? 'AI VERIFIED: DISPUTE RECOMMENDED' : 'STATUS: DISCREPANCY DETECTED'}
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              {investigation ? 'Multi-Agent Investigation Synthesis' : primaryFinding.title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '800px', lineHeight: 1.6 }}>
              {investigation ? investigation.summary : primaryFinding.explanation}
            </p>
          </div>
          <div style={{ textAlign: 'right', minWidth: '120px' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-warning)' }}>
              {Math.round(overallConfidence * 100)}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall Confidence</div>
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

      {/* Evidence-Backed Findings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>
          Evidence-Backed Findings ({activeFindings.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {activeFindings.map((finding) => (
            <div
              key={finding.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    className={
                      finding.severity === 'HIGH'
                        ? 'badge badge-danger'
                        : finding.severity === 'MEDIUM'
                        ? 'badge badge-warning'
                        : 'badge badge-success'
                    }
                  >
                    {finding.severity} SEVERITY
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {finding.type}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-warning)' }}>
                  {Math.round(finding.confidence * 100)}% Confidence
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  {finding.title}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {finding.explanation}
                </p>
              </div>

              {finding.evidenceIds && finding.evidenceIds.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Supporting Evidence:
                  </span>
                  {finding.evidenceIds.map((evId) => (
                    <span
                      key={evId}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#93c5fd',
                        fontFamily: 'monospace',
                      }}
                    >
                      {evId}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contradictions & Missing Evidence Side-by-Side */}
      {investigation && (investigation.contradictions?.length > 0 || investigation.missingEvidence?.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {/* Contradictions */}
          {investigation.contradictions && investigation.contradictions.length > 0 && (
            <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span className="badge badge-danger">CONTRADICTIONS</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Platform Contradictions Detected</h4>
              </div>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {investigation.contradictions.map((contra, idx) => (
                  <li key={idx}>{contra}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Evidence */}
          {investigation.missingEvidence && investigation.missingEvidence.length > 0 && (
            <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span className="badge badge-warning">MISSING EVIDENCE</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Unverified Claims / Gaps</h4>
              </div>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {investigation.missingEvidence.map((miss, idx) => (
                  <li key={idx}>{miss}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recommended Actions */}
      {investigation && investigation.recommendedActions && investigation.recommendedActions.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-success">RECOMMENDED ACTIONS</span>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Dispute Strategy & Next Steps</h4>
          </div>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {investigation.recommendedActions.map((action, idx) => (
              <li key={idx} style={{ lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Step {idx + 1}:</strong> {action}
              </li>
            ))}
          </ul>
        </div>
      )}

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
