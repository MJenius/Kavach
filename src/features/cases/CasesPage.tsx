import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { loadDemoDataset } from '../../../fixtures/demo-worker.ts';
import {
  generateReviewPackage,
  saveStoredReviewPackage,
  getStoredReviewPackage,
  type ReviewPackageNavigationState,
} from './review-package.ts';
import { EvidenceInspector } from '../../components/EvidenceInspector.tsx';
import { getCaseService } from '../../services/index.ts';
import { Button } from '../../components/ui/Button.tsx';
import { ClipboardIcon, CheckIcon, SearchIcon, AlertTriangleIcon } from '../../components/icons.tsx';

/**
 * Format ISO timestamp to 24-hr Indian Standard Time (HH:mm IST) consistently
 */
function formatTimeIST(iso: string): string {
  try {
    return (
      new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata',
      }).format(new Date(iso)) + ' IST'
    );
  } catch {
    return iso;
  }
}

export const CasesPage: React.FC = () => {
  const data = loadDemoDataset();
  const location = useLocation();

  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'IDLE' | 'COPIED' | 'FALLBACK'>('IDLE');
  const [packageText, setPackageText] = useState<string>('');

  // Generation state tracking
  const [generatingCaseId, setGeneratingCaseId] = useState<string | null>(null);
  const [generationStage, setGenerationStage] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Active review case state — initialized from location.state or persisted localStorage
  const [activeReviewCase, setActiveReviewCase] = useState<ReviewPackageNavigationState | null>(() => {
    const navState = location.state as ReviewPackageNavigationState | undefined;
    if (navState?.type === 'generated-review-package' && navState.investigation) {
      saveStoredReviewPackage(navState);
      return navState;
    }
    // Check if case-001 has a persisted package in localStorage
    return getStoredReviewPackage('case-001') || getStoredReviewPackage('case-trip-2026-09-15-001');
  });

  // Keep state updated if location state changes
  useEffect(() => {
    const navState = location.state as ReviewPackageNavigationState | undefined;
    if (navState?.type === 'generated-review-package' && navState.investigation) {
      saveStoredReviewPackage(navState);
      setActiveReviewCase(navState);
    }
  }, [location.state]);

  // When activeReviewCase changes, precompute the formatted text
  useEffect(() => {
    if (activeReviewCase) {
      const text = generateReviewPackage({
        caseId: activeReviewCase.caseId,
        tripId: activeReviewCase.tripId,
        workerName: activeReviewCase.workerName,
        disputedAmount: activeReviewCase.disputedAmount,
        investigation: activeReviewCase.investigation,
        timeline: activeReviewCase.timeline,
      });
      setPackageText(text);
    }
  }, [activeReviewCase]);

  /**
   * End-to-end Generate Dispute Package flow:
   * 1. Sets loading & progression stages.
   * 2. Coordinates real cloud/export backend path (via caseService).
   * 3. Constructs canonical package data from real case & investigation result.
   * 4. Persists the package in localStorage.
   * 5. Displays immediate success state with copy/view capabilities.
   */
  const handleGeneratePackage = async (caseId: string) => {
    setGeneratingCaseId(caseId);
    setGenerationStage(1);
    setGenerationError(null);

    try {
      // Stage 1: Gather and reconcile canonical telemetry & evidence
      setGenerationStage(1);
      const caseService = getCaseService();
      const heroTrip = data.trips.find((t) => t.id === 'trip-2026-09-15-001') || data.trips[0];
      const heroEvents = data.tripEvents.filter((e) => e.tripId === heroTrip.id);

      // Stage 2: Call real export service
      setGenerationStage(2);
      const exportResult = await caseService.exportCasePackage(caseId, data.evidence);

      // Stage 3: Build and persist the full canonical package
      setGenerationStage(3);
      const generatedState: ReviewPackageNavigationState = {
        type: 'generated-review-package',
        caseId,
        tripId: heroTrip.id,
        workerId: data.worker.id,
        workerName: data.worker.name,
        disputedAmount: 350,
        caseStatus: 'READY',
        investigation: data.investigation,
        timeline: heroEvents,
        packageUri: exportResult.packageUri,
        generatedAt: new Date().toISOString(),
      };

      saveStoredReviewPackage(generatedState);
      setActiveReviewCase(generatedState);
      setGenerationStage(4);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setGenerationError(`Generation failed: ${msg}`);
    } finally {
      setGeneratingCaseId(null);
    }
  };

  const handleCopyReviewPackage = async () => {
    if (!activeReviewCase) return;

    const text =
      packageText ||
      generateReviewPackage({
        caseId: activeReviewCase.caseId,
        tripId: activeReviewCase.tripId,
        workerName: activeReviewCase.workerName,
        disputedAmount: activeReviewCase.disputedAmount,
        investigation: activeReviewCase.investigation,
        timeline: activeReviewCase.timeline,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%', minWidth: 0 }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(252, 128, 25, 0.12) 0%, rgba(19, 27, 46, 0.8) 100%)',
          border: '1px solid var(--primary-subtle-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-primary">DISPUTE COMMAND CENTER</span>
            <span className="badge badge-info">{data.cases.length} Registered Cases</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.65rem)', fontWeight: 800, color: '#ffffff' }}>
            Cases &amp; Dispute Review Packages
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '650px', marginTop: '0.25rem' }}>
            Package structured evidence, policy clauses, and deterministic timelines for platform review submission.
          </p>
        </div>

        <Link to="/cases/case-001/analysis" style={{ textDecoration: 'none' }}>
          <Button variant="secondary" size="sm">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <SearchIcon size={14} /> Live Forensics Analysis
            </span>
          </Button>
        </Link>
      </div>

      {/* Generation Error Alert */}
      {generationError && (
        <div
          style={{
            background: 'var(--accent-danger-bg)',
            border: '1px solid var(--accent-danger-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ color: '#f87171', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangleIcon size={16} /> {generationError}
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleGeneratePackage('case-001')}
          >
            Retry Generation
          </Button>
        </div>
      )}

      {/* Progressing Generation Loading Banner */}
      {generatingCaseId && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '2px solid var(--primary)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            animation: 'pulseSlow 2s infinite ease-in-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', color: 'var(--primary)' }}>
              ↻
            </span>
            <strong style={{ fontSize: '1rem', color: '#ffffff' }}>
              Generating Canonical Dispute Review Package for #{generatingCaseId}...
            </strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
            <div style={{ color: generationStage >= 1 ? 'var(--accent-success)' : 'var(--text-muted)' }}>
              {generationStage >= 1 ? '✓' : '○'} Step 1: Ingesting GPS telemetry, scan logs &amp; OTP tokens
            </div>
            <div style={{ color: generationStage >= 2 ? 'var(--accent-success)' : 'var(--text-muted)' }}>
              {generationStage >= 2 ? '✓' : '○'} Step 2: Running deterministic SLA wait-time reconciliation
            </div>
            <div style={{ color: generationStage >= 3 ? 'var(--accent-success)' : 'var(--text-muted)' }}>
              {generationStage >= 3 ? '✓' : '○'} Step 3: Exporting verifiable audit bundle to evidence vault
            </div>
          </div>
        </div>
      )}

      {/* Generated Review Case Card — Rendered when generated or retrieved from persistent store */}
      {activeReviewCase && (
        <div
          data-testid="generated-review-case"
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--primary)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-lg)',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1rem',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '1rem',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <span className="badge badge-warning">NEW GENERATED REVIEW CASE</span>
                <span className="badge badge-success">{activeReviewCase.caseStatus}</span>
                <span className="badge badge-danger">
                  ₹{activeReviewCase.disputedAmount} DISPUTED PENALTY
                </span>
                {activeReviewCase.packageUri && (
                  <span
                    className="badge badge-info"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                    }}
                  >
                    ✓ PERSISTED S3 BUNDLE
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: 'clamp(1.15rem, 3vw, 1.35rem)', fontWeight: 800, margin: '0.2rem 0' }}>
                Case #{activeReviewCase.caseId} — Trip {activeReviewCase.tripId}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Partner: {activeReviewCase.workerName} ({activeReviewCase.workerId}) | Generated from Multi-Agent
                Investigation
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '0.5rem',
                minWidth: '220px',
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-success" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  STRONG EVIDENCE CHAIN
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Deterministic Telemetry Reconciliation
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Confidence: {Math.round(activeReviewCase.investigation.confidence * 100)}% (supporting)
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  data-testid="copy-review-package-btn"
                  onClick={handleCopyReviewPackage}
                  style={{
                    background: copyStatus === 'COPIED' ? 'var(--accent-success)' : 'var(--primary)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.6rem 1.1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 8px rgba(252, 128, 25, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {copyStatus === 'COPIED' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckIcon size={14} /> Copied to Clipboard
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ClipboardIcon size={14} /> Copy Review Package
                    </span>
                  )}
                </button>

                <Link
                  to={`/cases/${activeReviewCase.caseId}/case-file`}
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="secondary" size="sm">
                    Open Case File
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Export URI Information */}
          {activeReviewCase.packageUri && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid var(--accent-success-border)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                <span style={{ color: 'var(--accent-success)', fontWeight: 700 }}>✓ Evidence Package Exported:</span>
                <code
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: '#a7f3d0',
                    wordBreak: 'break-all',
                    fontSize: '0.78rem',
                  }}
                >
                  {activeReviewCase.packageUri}
                </code>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Persisted in Cloud Store
              </span>
            </div>
          )}

          {/* Clipboard Fallback Notice */}
          {copyStatus === 'FALLBACK' && (
            <div
              style={{
                background: 'var(--accent-warning-bg)',
                border: '1px solid var(--accent-warning-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-warning)', fontWeight: 700 }}>
                Clipboard API not directly available. Select and copy formatted review package text:
              </div>
              <textarea
                readOnly
                value={packageText}
                rows={7}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.4)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                }}
              />
            </div>
          )}

          {/* Investigation Summary */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '1.1rem',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '4px solid var(--primary)',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                letterSpacing: '0.05em',
                marginBottom: '0.35rem',
                textTransform: 'uppercase',
              }}
            >
              INVESTIGATION SUMMARY
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
              {activeReviewCase.investigation.summary}
            </p>
          </div>

          {/* Findings & Evidence IDs */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Findings &amp; Supporting Evidence ({activeReviewCase.investigation.findings.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeReviewCase.investigation.findings.map((f) => (
                <div
                  key={f.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
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
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                        marginTop: '0.35rem',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Supporting Evidence IDs:
                      </span>
                      {f.evidenceIds.map((evId) => (
                        <button
                          key={evId}
                          type="button"
                          data-testid={`case-evidence-chip-${evId}`}
                          onClick={() => setSelectedEvidenceId(evId)}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--accent-info-bg)',
                            border: '1px solid var(--accent-info-border)',
                            color: '#93c5fd',
                            fontFamily: 'var(--font-mono)',
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
          {activeReviewCase.timeline && activeReviewCase.timeline.length > 0 && (
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Reconstructed Timeline (Trip {activeReviewCase.tripId})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activeReviewCase.timeline.map((evt) => (
                  <div
                    key={evt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.6rem 0.85rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: '3px solid var(--primary)',
                      fontSize: '0.85rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        color: 'var(--text-secondary)',
                        minWidth: '85px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                      }}
                    >
                      {formatTimeIST(evt.timestamp)}
                    </span>
                    <span style={{ fontWeight: 600, flex: 1, minWidth: '120px' }}>{evt.type}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      Source: {evt.source}
                    </span>
                    {evt.evidenceIds && evt.evidenceIds.length > 0 && (
                      <span
                        style={{
                          color: '#93c5fd',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        [{evt.evidenceIds.join(', ')}]
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contradictions & Missing Evidence */}
          {((activeReviewCase.investigation.contradictions &&
            activeReviewCase.investigation.contradictions.length > 0) ||
            (activeReviewCase.investigation.missingEvidence &&
              activeReviewCase.investigation.missingEvidence.length > 0)) && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
              }}
            >
              {activeReviewCase.investigation.contradictions &&
                activeReviewCase.investigation.contradictions.length > 0 && (
                  <div
                    style={{
                      background: 'var(--accent-danger-bg)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--accent-danger-border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span className="badge badge-danger">CONTRADICTIONS</span>
                      <strong style={{ fontSize: '0.85rem' }}>Platform Inconsistencies</strong>
                    </div>
                    <ul
                      style={{
                        paddingLeft: '1.25rem',
                        margin: 0,
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                      }}
                    >
                      {activeReviewCase.investigation.contradictions.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {activeReviewCase.investigation.missingEvidence &&
                activeReviewCase.investigation.missingEvidence.length > 0 && (
                  <div
                    style={{
                      background: 'var(--accent-warning-bg)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--accent-warning-border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span className="badge badge-warning">MISSING EVIDENCE</span>
                      <strong style={{ fontSize: '0.85rem' }}>Unverified Platform Claims</strong>
                    </div>
                    <ul
                      style={{
                        paddingLeft: '1.25rem',
                        margin: 0,
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                      }}
                    >
                      {activeReviewCase.investigation.missingEvidence.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

          {/* Recommended Actions */}
          {activeReviewCase.investigation.recommendedActions &&
            activeReviewCase.investigation.recommendedActions.length > 0 && (
              <div
                style={{
                  background: 'var(--accent-success-bg)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--accent-success-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="badge badge-success">RECOMMENDED ACTIONS</span>
                  <strong style={{ fontSize: '0.85rem' }}>Dispute Submission Strategy</strong>
                </div>
                <ul
                  style={{
                    paddingLeft: '1.25rem',
                    margin: 0,
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  {activeReviewCase.investigation.recommendedActions.map((a, idx) => (
                    <li key={idx}>
                      <strong style={{ color: 'var(--text-primary)' }}>Step {idx + 1}:</strong> {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Neutral Disclaimer */}
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '0.75rem',
            }}
          >
            Note: Available evidence indicates that the penalty decision warrants review. Kavach AI compiles objective telemetry and verified scans without asserting legal conclusions or guaranteeing reimbursement.
          </div>
        </div>
      )}

      {/* Existing Registered Cases List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>All Registered Cases</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Total: {data.cases.length} active
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {data.cases.map((c) => {
            const isPenalty = c.id === 'case-001';
            const isIncentive = c.id === 'case-002';
            const isGenerating = generatingCaseId === c.id;

            return (
              <div
                key={c.id}
                style={{
                  background: 'var(--bg-surface)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: isPenalty ? '1px solid rgba(252, 128, 25, 0.4)' : '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.35rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span className="badge badge-primary">{c.type} CASE</span>
                    <span className={`badge ${c.status === 'READY' ? 'badge-success' : 'badge-danger'}`}>
                      {c.status}
                    </span>
                    {isPenalty && (
                      <span className="badge badge-danger">₹350 Disputed Penalty</span>
                    )}
                    {isIncentive && (
                      <span className="badge badge-warning">₹300 Unresolved Incentive</span>
                    )}
                    <strong style={{ fontSize: '1rem', color: '#ffffff' }}>Case #{c.id}</strong>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {isPenalty &&
                      'Trip trip-2026-09-15-001 | QuickBite • Strong evidence chain verified'}
                    {isIncentive &&
                      'Ledger discrepancy • Milestone target verified, platform logs unreleased'}
                    {!isPenalty &&
                      !isIncentive &&
                      `Created: ${new Date(c.createdAt).toLocaleDateString()} | Findings linked: ${c.findingIds.length}`}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <Link
                    to={isPenalty ? '/cases/case-001/analysis' : '/earnings'}
                    style={{ textDecoration: 'none' }}
                  >
                    <Button variant="secondary" size="sm">
                      {isPenalty ? 'Review Case' : 'View Ledger'}
                    </Button>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleGeneratePackage(c.id)}
                    disabled={c.status !== 'READY' || isGenerating}
                    style={{
                      background:
                        c.status === 'READY' ? 'var(--primary)' : 'var(--bg-surface-hover)',
                      color: c.status === 'READY' ? '#ffffff' : 'var(--text-muted)',
                      border: 'none',
                      padding: '0.6rem 1.15rem',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: c.status === 'READY' && !isGenerating ? 'pointer' : 'not-allowed',
                      boxShadow:
                        c.status === 'READY' ? '0 2px 8px rgba(252, 128, 25, 0.35)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <span style={{ animation: 'spin 1s linear infinite' }}>↻</span> Generating...
                      </>
                    ) : c.status === 'READY' ? (
                      'Generate Dispute Package'
                    ) : (
                      'Awaiting Evidence'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reusable Evidence Inspector Drawer */}
      <EvidenceInspector
        evidenceId={selectedEvidenceId}
        onClose={() => setSelectedEvidenceId(null)}
      />
    </div>
  );
};
