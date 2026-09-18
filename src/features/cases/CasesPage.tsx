import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { loadDemoDataset } from '../../../fixtures/demo-worker.ts';
import {
  generateReviewPackage,
  type ReviewPackageNavigationState,
} from './review-package.ts';
import { EvidenceInspector } from '../../components/EvidenceInspector.tsx';

/**
 * Format ISO timestamp to 24-hr Indian Standard Time (HH:mm IST) consistently
 */
function formatTimeIST(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    }).format(new Date(iso)) + ' IST';
  } catch {
    return iso;
  }
}

export const CasesPage: React.FC = () => {
  const data = loadDemoDataset();
  const location = useLocation();
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [generatedUri, setGeneratedUri] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'IDLE' | 'COPIED' | 'FALLBACK'>('IDLE');
  const [packageText, setPackageText] = useState<string>('');

  // Validate typed navigation state; ONLY render generated case if valid state was passed
  const navState = location.state as ReviewPackageNavigationState | undefined;
  const isGeneratedCase = navState?.type === 'generated-review-package' && !!navState.investigation;

  const handleGeneratePackage = (caseId: string) => {
    setGeneratedUri(`s3://kavach-evidence-bucket/packages/${caseId}-dispute-package.pdf`);
  };

  const handleCopyReviewPackage = async () => {
    if (!navState) return;

    const text = generateReviewPackage({
      caseId: navState.caseId,
      tripId: navState.tripId,
      workerName: navState.workerName,
      disputedAmount: navState.disputedAmount,
      investigation: navState.investigation,
      timeline: navState.timeline,
    });

    setPackageText(text);

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopyStatus('COPIED');
        setTimeout(() => setCopyStatus('IDLE'), 3500);
      } else {
        setCopyStatus('FALLBACK');
      }
    } catch {
      setCopyStatus('FALLBACK');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Cases & Dispute Review Packages</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Package structured evidence, policy clauses, and timelines for platform review submission ({data.cases.length} active cases).
        </p>
      </div>

      {generatedUri && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--accent-success)',
            padding: '1rem',
            borderRadius: '6px',
            fontSize: '0.9rem',
          }}
        >
          <strong style={{ color: 'var(--accent-success)' }}>✓ Evidence Package Generated: </strong>
          <code>{generatedUri}</code>
        </div>
      )}

      {/* Generated Review Case: Rendered ONLY when arriving from Investigation flow */}
      {isGeneratedCase && (
        <div
          data-testid="generated-review-case"
          style={{
            background: 'var(--bg-surface)',
            borderRadius: '8px',
            border: '2px solid var(--primary)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          {/* Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span className="badge badge-warning">NEW GENERATED REVIEW CASE</span>
                <span className="badge badge-success">{navState.caseStatus}</span>
                <span className="badge badge-danger">₹{navState.disputedAmount} DISPUTED PENALTY</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.2rem 0' }}>
                Case #{navState.caseId} — Trip {navState.tripId}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Partner: {navState.workerName} ({navState.workerId}) | Generated from Live Multi-Agent Investigation
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-warning)' }}>
                  {Math.round(navState.investigation.confidence * 100)}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Investigation Confidence</div>
              </div>

              {/* Copy Review Package Action Button */}
              <button
                data-testid="copy-review-package-btn"
                onClick={handleCopyReviewPackage}
                style={{
                  background: copyStatus === 'COPIED' ? 'var(--accent-success)' : 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'background 0.2s ease',
                }}
              >
                {copyStatus === 'COPIED' ? '✓ Copied to Clipboard' : '📋 Copy Review Package'}
              </button>
            </div>
          </div>

          {/* Clipboard Fallback Notice / Manual Copy Area */}
          {copyStatus === 'FALLBACK' && (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid var(--accent-warning)',
                borderRadius: '6px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-warning)', fontWeight: 600 }}>
                Unable to auto-copy to clipboard. Please select and copy the formatted review package manually:
              </div>
              <textarea
                readOnly
                value={packageText}
                rows={8}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.4)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  padding: '0.5rem',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                }}
              />
            </div>
          )}

          {/* Investigation Summary */}
          <div
            style={{
              background: 'rgba(0,0,0,0.2)',
              padding: '1rem',
              borderRadius: '6px',
              borderLeft: '4px solid var(--primary)',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              INVESTIGATION SUMMARY
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {navState.investigation.summary}
            </p>
          </div>

          {/* Findings & Evidence IDs */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Findings & Supporting Evidence ({navState.investigation.findings.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {navState.investigation.findings.map((f) => (
                <div
                  key={f.id}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        className={
                          f.severity === 'HIGH'
                            ? 'badge badge-danger'
                            : f.severity === 'MEDIUM'
                            ? 'badge badge-warning'
                            : 'badge badge-success'
                        }
                      >
                        {f.severity}
                      </span>
                      <strong style={{ fontSize: '0.95rem' }}>{f.title}</strong>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {Math.round(f.confidence * 100)}% Confidence
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {f.explanation}
                  </p>

                  {f.evidenceIds && f.evidenceIds.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Supporting Evidence IDs:
                      </span>
                      {f.evidenceIds.map((evId) => (
                        <button
                          key={evId}
                          data-testid={`case-evidence-chip-${evId}`}
                          onClick={() => setSelectedEvidenceId(evId)}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#93c5fd',
                            fontFamily: 'monospace',
                            cursor: 'pointer',
                          }}
                          title="Inspect evidence provenance"
                        >
                          {evId}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Reconstructed Timeline */}
          {navState.timeline && navState.timeline.length > 0 && (
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Reconstructed Timeline (Trip {navState.tripId})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {navState.timeline.map((evt) => (
                  <div
                    key={evt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '4px',
                      borderLeft: '3px solid var(--primary)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)', minWidth: '85px', fontFamily: 'monospace' }}>
                      {formatTimeIST(evt.timestamp)}
                    </span>
                    <span style={{ fontWeight: 600, flex: 1 }}>{evt.type}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Source: {evt.source}</span>
                    {evt.evidenceIds && evt.evidenceIds.length > 0 && (
                      <span style={{ color: '#93c5fd', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        [{evt.evidenceIds.join(', ')}]
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contradictions & Missing Evidence */}
          {((navState.investigation.contradictions && navState.investigation.contradictions.length > 0) ||
            (navState.investigation.missingEvidence && navState.investigation.missingEvidence.length > 0)) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {navState.investigation.contradictions && navState.investigation.contradictions.length > 0 && (
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className="badge badge-danger">CONTRADICTIONS</span>
                    <strong style={{ fontSize: '0.85rem' }}>Platform Inconsistencies</strong>
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {navState.investigation.contradictions.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {navState.investigation.missingEvidence && navState.investigation.missingEvidence.length > 0 && (
                <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className="badge badge-warning">MISSING EVIDENCE</span>
                    <strong style={{ fontSize: '0.85rem' }}>Unverified Platform Claims</strong>
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {navState.investigation.missingEvidence.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Recommended Actions */}
          {navState.investigation.recommendedActions && navState.investigation.recommendedActions.length > 0 && (
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-success">RECOMMENDED ACTIONS</span>
                <strong style={{ fontSize: '0.85rem' }}>Dispute Submission Strategy</strong>
              </div>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {navState.investigation.recommendedActions.map((a, idx) => (
                  <li key={idx}>
                    <strong style={{ color: 'var(--text-primary)' }}>Step {idx + 1}:</strong> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer Banner */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            Note: Available evidence indicates that the penalty decision warrants review. Kavach AI compiles objective telemetry and verified scans without asserting legal conclusions or guaranteeing reimbursement.
          </div>
        </div>
      )}

      {/* Existing Cases List: Preserved unconditionally */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>All Registered Cases</h3>
        {data.cases.map((c) => (
          <div
            key={c.id}
            style={{
              background: 'var(--bg-surface)',
              padding: '1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-warning">{c.type} CASE</span>
                <span className="badge badge-success">{c.status}</span>
                <strong style={{ fontSize: '1rem' }}>Case #{c.id}</strong>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Created: {new Date(c.createdAt).toLocaleDateString()} | Findings linked: {c.findingIds.length}
              </p>
            </div>
            <div>
              <button
                onClick={() => handleGeneratePackage(c.id)}
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Generate Dispute Package
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reusable Evidence Inspector Drawer */}
      <EvidenceInspector
        evidenceId={selectedEvidenceId}
        onClose={() => setSelectedEvidenceId(null)}
      />
    </div>
  );
};
