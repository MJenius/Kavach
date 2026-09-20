import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadDemoDataset } from '../../../fixtures/demo-worker.ts';
import { calculateSLAFeasibility } from '../../calculations/index.ts';
import { createApiClient } from '../../api/mock-client.ts';
import type { AIInvestigationResult } from '../../domain/index.ts';
import {
  saveStoredReviewPackage,
  type ReviewPackageNavigationState,
} from '../cases/review-package.ts';
import { EvidenceInspector } from '../../components/EvidenceInspector.tsx';
import { EvidenceStrength, Button, LoadingState, ErrorState, Card } from '../../components/ui/index.ts';

/**
 * Format ISO timestamp to 24-hr Indian Standard Time (HH:mm IST) consistently
 */
function formatTimeIST(iso: string): string {
  return (
    new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    }).format(new Date(iso)) + ' IST'
  );
}

export interface InvestigationPageProps {
  apiClient?: {
    investigateTrip: (tripId: string) => Promise<AIInvestigationResult>;
  };
}

export const InvestigationPage: React.FC<InvestigationPageProps> = ({ apiClient }) => {
  const navigate = useNavigate();
  const data = loadDemoDataset();
  const primaryFinding = data.findings[0];
  const primaryTrip = data.trips[0];

  const [investigation, setInvestigation] = useState<AIInvestigationResult | null>(
    data.investigation || null
  );
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingPackage, setGeneratingPackage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engineStage, setEngineStage] = useState<number>(0);

  // Dynamic calculations derived from events rather than hardcoded
  const waitEvent = data.tripEvents.find((e) => e.type === 'WAITING_STARTED');
  const handoverEvent = data.tripEvents.find((e) => e.type === 'PACKAGE_RECEIVED');
  const waitMinutes =
    waitEvent && handoverEvent
      ? Math.floor(
          (new Date(handoverEvent.timestamp).getTime() - new Date(waitEvent.timestamp).getTime()) /
            60000
        )
      : 7;

  const slaFeasibility = calculateSLAFeasibility(
    primaryTrip.slaSeconds || 600,
    waitMinutes * 60,
    900 // 15 min estimated travel in traffic
  );

  const penaltyRecord = data.earnings.find((e) => e.type === 'PENALTY');
  const penaltyAmount = Math.abs(penaltyRecord?.actualAmount || 350);

  const runInvestigation = async (): Promise<AIInvestigationResult> => {
    const client = apiClient || createApiClient();
    setEngineStage(1);
    await new Promise((r) => setTimeout(r, 180));
    setEngineStage(2);
    await new Promise((r) => setTimeout(r, 180));
    setEngineStage(3);
    const result = await client.investigateTrip(primaryTrip.id);
    setEngineStage(4);
    await new Promise((r) => setTimeout(r, 150));
    setEngineStage(5);
    setInvestigation(result);
    return result;
  };

  const handleStartInvestigation = async () => {
    setLoading(true);
    setError(null);
    setEngineStage(0);
    try {
      await runInvestigation();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReviewPackage = async () => {
    setGeneratingPackage(true);
    setError(null);
    try {
      let activeResult = investigation;
      if (!activeResult) {
        setLoading(true);
        activeResult = await runInvestigation();
        setLoading(false);
      }

      const navState: ReviewPackageNavigationState = {
        type: 'generated-review-package',
        caseId: 'case-001',
        tripId: primaryTrip.id,
        workerId: data.worker.id,
        workerName: data.worker.name,
        disputedAmount: penaltyAmount,
        caseStatus: 'READY',
        investigation: activeResult,
        timeline: data.tripEvents.filter((e) => e.tripId === primaryTrip.id),
      };

      saveStoredReviewPackage(navState);
      navigate('/cases', { state: navState });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setGeneratingPackage(false);
    }
  };

  const activeFindings = investigation?.findings || [primaryFinding];
  const overallConfidence = investigation?.confidence ?? primaryFinding.confidence;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%', minWidth: 0 }}>
      {/* Dominant Hero Result Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(19, 27, 46, 0.95) 100%)',
          border: '1px solid var(--accent-danger-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge badge-danger">PLATFORM CLAIM: ₹{penaltyAmount} PENALTY</span>
            <span className="badge badge-warning">Review Recommended</span>
            <span className="badge badge-info">SLA: Physically Infeasible</span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '0.25rem 0' }}>
            Penalty Review: ₹{penaltyAmount} penalty under review
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '780px', lineHeight: 1.6, marginTop: '0.4rem' }}>
            Vikram Sharma accepted order at 19:00, arrived at store at 19:02. Merchant delayed handover by 7 minutes (until 19:09). Only 3 minutes remained out of 10-minute SLA before delivery.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Button
            onClick={handleStartInvestigation}
            disabled={loading}
            variant="primary"
            loading={loading}
            size="sm"
          >
            {investigation ? 'Re-run Live Investigation' : 'Start Live AI Investigation'}
          </Button>
          <Button
            onClick={handleGenerateReviewPackage}
            disabled={generatingPackage}
            variant="secondary"
            loading={generatingPackage}
            size="sm"
          >
            Generate Review Package
          </Button>
        </div>
      </div>

      {/* Visual SLA Step Sequence Card */}
      <Card elevated>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          SLA Feasibility Sequence
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          <div style={{ background: 'var(--bg-surface-hover)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Total Allocated</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>10 min SLA</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>QuickBite SLA window</div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}>→</div>

          <div style={{ background: 'var(--accent-danger-bg)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-danger-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#f87171' }}>Store Kitchen Delay</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-danger)' }}>7 min wait</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>19:02 to 19:09 IST</div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}>→</div>

          <div style={{ background: 'var(--accent-warning-bg)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-warning-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-warning)' }}>Remaining for Transit</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-warning)' }}>
              {Math.max(0, Math.round(slaFeasibility.remainingSecondsForTransit / 60))} min left
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Deficit: {Math.round(slaFeasibility.transitShortfallSeconds / 60)} min
            </div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}>→</div>

          <div style={{ background: 'var(--bg-surface-hover)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Delivery Outcome</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-info)' }}>Required 15m</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Completed at 19:24 via PIN</div>
          </div>
        </div>
      </Card>

      {/* 4-Stage Autonomous Pipeline Flow Indicator */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.75rem',
          padding: '0.85rem',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="badge badge-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
            1. INGEST
          </span>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>Evidence Ingestion</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GPS arrival, scans, OTP PIN</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="badge badge-info" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
            2. RECONSTRUCT
          </span>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>Deterministic Math</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>7m wait + 3m SLA left</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="badge badge-warning" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
            3. SYNTHESIZE
          </span>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>Policy Synthesis</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Merchant Delay Policy</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="badge badge-success" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
            4. ACTION
          </span>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>Dispute Package</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Neutral dispute file</div>
          </div>
        </div>
      </div>

      {/* Loading State Banner */}
      {loading && (
        <LoadingState
          message="Autonomous Multi-Agent Investigation Engine Executing"
          steps={[
            {
              label: 'Stage 1 (Ingestion): Ingesting verified GPS telemetry and merchant records',
              status: engineStage > 1 ? 'done' : engineStage === 1 ? 'active' : 'pending',
            },
            {
              label: 'Stage 2 (Forensics): Deterministic timeline reconstruction & SLA feasibility math',
              status: engineStage > 2 ? 'done' : engineStage === 2 ? 'active' : 'pending',
            },
            {
              label: 'Stage 2 (Earnings): Reconciling platform ledger & deductions',
              status: engineStage > 3 ? 'done' : engineStage === 3 ? 'active' : 'pending',
            },
            {
              label: 'Stage 3 (Policy): Evaluating applicable merchant-delay terms',
              status: engineStage > 4 ? 'done' : engineStage === 4 ? 'active' : 'pending',
            },
            {
              label: 'Stage 4 (Action): Supervisor Agent synthesizing evidence-backed dispute review',
              status: engineStage >= 5 ? 'done' : engineStage === 5 ? 'active' : 'pending',
            },
          ]}
        />
      )}

      {/* Error Alert */}
      {error && (
        <ErrorState
          title="Investigation Request Unavailable"
          message={error}
          onRetry={handleStartInvestigation}
        />
      )}

      {/* Evidence Strength Card — Consuming Canonical Investigation Result */}
      <EvidenceStrength
        linkedEvidence={activeFindings.reduce((sum, f) => sum + (f.evidenceIds?.length || 0), 0)}
        calculations={1}
        contradictions={investigation ? investigation.contradictions.length : 1}
        missing={investigation ? investigation.missingEvidence.length : 1}
        strength={overallConfidence > 0.8 ? 'STRONG' : overallConfidence > 0.5 ? 'MODERATE' : 'WEAK'}
      />

      {/* Evidence-Backed Findings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
          Evidence-Backed Findings ({activeFindings.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {activeFindings.map((finding) => (
            <div
              key={finding.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
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
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-warning)', fontFamily: 'var(--font-mono)' }}>
                  {Math.round(finding.confidence * 100)}% Confidence
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem', color: '#ffffff' }}>
                  {finding.title}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {finding.explanation}
                </p>
              </div>

              {finding.evidenceIds && finding.evidenceIds.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Supporting Evidence:
                  </span>
                  {finding.evidenceIds.map((evId) => (
                    <button
                      key={evId}
                      type="button"
                      data-testid={`evidence-chip-${evId}`}
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

      {/* Contradictions & Missing Evidence Side-by-Side */}
      {investigation && (investigation.contradictions?.length > 0 || investigation.missingEvidence?.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {investigation.contradictions && investigation.contradictions.length > 0 && (
            <div style={{ background: 'var(--accent-danger-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-danger-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span className="badge badge-danger">CONTRADICTIONS</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Platform Contradictions Detected</h4>
              </div>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {investigation.contradictions.map((contra, idx) => (
                  <li key={idx} style={{ lineHeight: 1.5 }}>{contra}</li>
                ))}
              </ul>
            </div>
          )}

          {investigation.missingEvidence && investigation.missingEvidence.length > 0 && (
            <div style={{ background: 'var(--accent-warning-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-warning-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span className="badge badge-warning">MISSING EVIDENCE</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Unverified Claims / Gaps</h4>
              </div>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {investigation.missingEvidence.map((miss, idx) => (
                  <li key={idx} style={{ lineHeight: 1.5 }}>{miss}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recommended Actions */}
      {investigation && investigation.recommendedActions && investigation.recommendedActions.length > 0 && (
        <div style={{ background: 'var(--accent-success-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-success-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-success">RECOMMENDED ACTIONS</span>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Dispute Strategy &amp; Next Steps</h4>
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

      {/* Reconstructed Timeline */}
      <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: '#ffffff' }}>
          Independent Reconstructed Timeline (Trip {primaryTrip.id})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {data.tripEvents.map((evt) => (
            <div
              key={evt.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: '4px solid var(--primary)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: '90px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                {formatTimeIST(evt.timestamp)}
              </div>
              <div style={{ flex: 1, minWidth: '130px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>{evt.type}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Source: {evt.source}</div>
              </div>
              {evt.confidence && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {Math.round(evt.confidence * 100)}% conf
                </div>
              )}
            </div>
          ))}
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
