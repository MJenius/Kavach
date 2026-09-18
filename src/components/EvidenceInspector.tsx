import React from 'react';
import { loadDemoDataset } from '../../fixtures/demo-worker.ts';

interface EvidenceInspectorProps {
  evidenceId: string | null;
  onClose: () => void;
}

/**
 * Formats ISO timestamp to HH:mm:ss IST
 */
function formatTimeIST(iso?: string): string {
  if (!iso) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    }).format(new Date(iso)) + ' IST';
  } catch {
    return iso;
  }
}

export const EvidenceInspector: React.FC<EvidenceInspectorProps> = ({ evidenceId, onClose }) => {
  if (!evidenceId) return null;

  const dataset = loadDemoDataset();
  const evidence = dataset.evidence.find((e) => e.id === evidenceId);

  // Find related trip events containing this evidenceId
  const relatedTripEvents = dataset.tripEvents.filter(
    (evt) => evt.evidenceIds && evt.evidenceIds.includes(evidenceId)
  );

  // Find related findings linking this evidenceId
  const relatedFindings = dataset.findings.filter(
    (f) => f.evidenceIds && f.evidenceIds.includes(evidenceId)
  );

  // Check relationship type from EvidenceGraph definition (default SUPPORTS for findings)
  const relationshipType = relatedFindings.length > 0 ? 'SUPPORTS' : 'RELATES_TO';

  return (
    <div
      data-testid="evidence-inspector-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        data-testid="evidence-inspector-drawer"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-color)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          overflowY: 'auto',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-warning">PROVENANCE INSPECTOR</span>
              {evidence && <span className="badge badge-success">{evidence.type}</span>}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, fontFamily: 'monospace' }}>
              {evidenceId}
            </h3>
          </div>
          <button
            data-testid="evidence-inspector-close-btn"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            ✕
          </button>
        </div>

        {!evidence ? (
          <div
            data-testid="evidence-unknown-state"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--accent-danger)',
              padding: '1rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              color: 'var(--accent-danger)',
            }}
          >
            <strong>Unknown Evidence Record:</strong> No recorded metadata found for <code>{evidenceId}</code>.
          </div>
        ) : (
          <>
            {/* Metadata Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                padding: '1rem',
                background: 'rgba(0,0,0,0.25)',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SOURCE SYSTEM</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: 'monospace' }}>
                  {evidence.source}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TIMESTAMP (IST)</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {formatTimeIST(evidence.timestamp)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CONFIDENCE SCORE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-warning)' }}>
                  {evidence.confidence ? `${Math.round(evidence.confidence * 100)}%` : 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GRAPH RELATIONSHIP</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-success)' }}>
                  {relationshipType}
                </div>
              </div>
            </div>

            {/* Factual Description */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                OBSERVED EVIDENCE FACT
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                {evidence.description}
              </p>
            </div>

            {/* Artifact / URI Reference */}
            {evidence.uri && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  STORAGE ARTIFACT / URI
                </div>
                <div
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    padding: '0.65rem',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    wordBreak: 'break-all',
                    color: '#93c5fd',
                  }}
                >
                  {evidence.uri}
                </div>
              </div>
            )}

            {/* Associated Trip Event(s) */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                LINKED TRIP EVENT(S) ({relatedTripEvents.length})
              </div>
              {relatedTripEvents.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Derived from deterministic calculation or post-trip dispute record.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {relatedTripEvents.map((evt) => (
                    <div
                      key={evt.id}
                      style={{
                        padding: '0.6rem 0.75rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '4px',
                        borderLeft: '3px solid var(--primary)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{evt.type}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {formatTimeIST(evt.timestamp)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Source: {evt.source} {evt.confidence ? `(${Math.round(evt.confidence * 100)}% conf)` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Associated Finding(s) */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                SUPPORTED INVESTIGATION FINDING(S) ({relatedFindings.length})
              </div>
              {relatedFindings.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No directly linked findings.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {relatedFindings.map((f) => (
                    <div
                      key={f.id}
                      style={{
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#93c5fd' }}>
                            {f.id}
                          </span>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{f.title}</strong>
                        </div>
                        <span className={f.severity === 'HIGH' ? 'badge badge-danger' : 'badge badge-warning'}>
                          {f.severity}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {f.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Non-legal Guidance Disclaimer */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Available evidence indicates factual occurrence from verified telemetry and portal records. No legal conclusions or reimbursement guarantees are asserted.
            </div>
          </>
        )}
      </div>
    </div>
  );
};
