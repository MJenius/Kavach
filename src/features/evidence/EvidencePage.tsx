import React, { useState } from 'react';
import { loadDemoDataset } from '../../../fixtures/demo-worker.ts';
import { LocalEvidenceStore } from '../../evidence/store.ts';
import { EvidenceInspector } from '../../components/EvidenceInspector.tsx';
import { EvidenceBadge } from '../../components/ui/index.ts';

/**
 * Format ISO timestamp to 24-hr Indian Standard Time (HH:mm IST)
 */
function formatTimeIST(iso?: string): string {
  if (!iso) return '';
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

export const EvidencePage: React.FC = () => {
  const data = loadDemoDataset();
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);

  // Initialize store with canonical graph
  const store = new LocalEvidenceStore(data.evidence, data.findings, data.tripEvents);
  const primaryFinding = data.findings[0];
  const supportingEvidence = store.graph.getEvidenceForFinding(primaryFinding.id);

  // Chronological provenance steps for the canonical disputed trip
  const provenanceSteps = [
    {
      step: '1. Store Arrival',
      title: 'Merchant Geofence GPS Arrival',
      evidenceId: 'ev-store-arrival-gps',
      time: '19:02 IST',
      type: 'TRIP_EVENT' as const,
      source: 'GPS_LOG',
      impact: 'On-time arrival; 8 minutes left in 10-minute SLA window',
      badgeStatus: 'VERIFIED' as const,
    },
    {
      step: '2. Merchant Queue / Waiting',
      title: 'Merchant Order Preparation Delay',
      evidenceId: 'ev-merchant-log',
      time: '19:02 - 19:09 IST',
      type: 'DOCUMENT' as const,
      source: 'MERCHANT_PORTAL_RECEIPT',
      impact: '7 minutes uncredited merchant delay before packaging',
      badgeStatus: 'VERIFIED' as const,
    },
    {
      step: '3. Package Handover',
      title: 'Order Barcode Handover Scan',
      evidenceId: 'ev-merchant-handover-scan',
      time: '19:09 IST',
      type: 'TRIP_EVENT' as const,
      source: 'APP_SCAN',
      impact: 'Dispatched with only 3 minutes remaining for delivery SLA',
      badgeStatus: 'VERIFIED' as const,
    },
    {
      step: '4. Delivery Started & SLA Feasibility',
      title: 'Kavach SLA Feasibility Calculation',
      evidenceId: 'ev-wait-calc',
      time: '19:09 IST',
      type: 'CALCULATION' as const,
      source: 'KAVACH_DETERMINISTIC_ENGINE',
      impact: 'Deterministic calculation confirms 10m SLA infeasible after wait',
      badgeStatus: 'CALCULATED' as const,
    },
    {
      step: '5. Traffic Disruption',
      title: 'Road Congestion Advisory',
      evidenceId: 'ev-traffic-alert-koramangala',
      time: '19:16 IST',
      type: 'TRIP_EVENT' as const,
      source: 'TRAFFIC_API',
      impact: 'Traffic delay of 6 minutes (360s) due to road obstruction on 80 Feet Road Koramangala',
      badgeStatus: 'VERIFIED' as const,
    },
    {
      step: '6. Delivery Completed',
      title: 'Customer OTP Handover Verification',
      evidenceId: 'ev-customer-delivery-otp',
      time: '19:24 IST',
      type: 'TRIP_EVENT' as const,
      source: 'OTP_VERIFICATION',
      impact: 'Successful delivery completed with customer PIN confirmation',
      badgeStatus: 'VERIFIED' as const,
    },
    {
      step: '7. Platform Penalty',
      title: 'Platform Late-Delivery Penalty Notice',
      evidenceId: 'ev-penalty-screenshot',
      time: '19:30 IST',
      type: 'SCREENSHOT' as const,
      source: 'WORKER_UPLOAD',
      impact: '₹350 penalty assessed despite verified merchant & traffic delay',
      badgeStatus: 'CONTRADICTED' as const,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%', minWidth: 0 }}>
      {/* Page Header */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
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
            <span className="badge badge-primary">EVIDENCE AUDIT VAULT</span>
            <span className="badge badge-success">Cryptographically Grounded</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.6rem)', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Worker Evidence Graph
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Standardized multi-modal evidence objects, DAG relationships, and independent provenance chains ({data.evidence.length} items logged).
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
            {supportingEvidence.length} Linked
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            1 Contested Claim • {data.evidence.length} Total in Graph
          </div>
        </div>
      </div>

      {/* Interactive Provenance Section */}
      <div
        data-testid="evidence-provenance-section"
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-warning">INTERACTIVE PROVENANCE CHAIN</span>
              <span className="badge badge-success">CANONICAL DISPUTE</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              {primaryFinding.title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              Click any evidence node below to inspect source systems, exact telemetry, and graph relationships.
            </p>
          </div>
        </div>

        {/* Provenance Steps Visual DAG */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
            width: '100%',
          }}
        >
          {provenanceSteps.map((step) => {
            const evItem = data.evidence.find((e) => e.id === step.evidenceId);
            const isSelected = selectedEvidenceId === step.evidenceId;

            return (
              <div
                key={step.evidenceId}
                data-testid={`provenance-node-${step.evidenceId}`}
                onClick={() => setSelectedEvidenceId(step.evidenceId)}
                style={{
                  background: isSelected ? 'rgba(252, 128, 25, 0.12)' : 'var(--bg-surface-hover)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  transition: 'all 0.15s ease',
                  minWidth: 0,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {step.step}
                    </span>
                    <EvidenceBadge status={step.badgeStatus} label={step.badgeStatus} />
                  </div>

                  <strong style={{ fontSize: '0.95rem', color: '#ffffff', display: 'block', marginBottom: '0.35rem' }}>
                    {step.title}
                  </strong>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {step.impact}
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '0.6rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: '#93c5fd',
                      background: 'var(--accent-info-bg)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {step.evidenceId}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {step.time} {evItem?.confidence ? `(${Math.round(evItem.confidence * 100)}%)` : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Standardized Evidence Objects Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
          All Standardized Evidence Graph Objects ({data.evidence.length} items logged)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', width: '100%' }}>
          {data.evidence.map((ev) => {
            const isContested = ev.id === 'ev-penalty-screenshot';
            const badgeStatus =
              ev.type === 'CALCULATION'
                ? 'CALCULATED'
                : isContested
                ? 'CONTRADICTED'
                : ev.type === 'TRIP_EVENT'
                ? 'VERIFIED'
                : 'UNVERIFIED';

            return (
              <div
                key={ev.id}
                data-testid={`evidence-card-${ev.id}`}
                onClick={() => setSelectedEvidenceId(ev.id)}
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: selectedEvidenceId === ev.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  minWidth: 0,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                      <EvidenceBadge status={badgeStatus} label={badgeStatus} />
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#93c5fd',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ev.id}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {ev.confidence ? `${Math.round(ev.confidence * 100)}% conf` : 'N/A'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                    {ev.description}
                  </p>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
                    <span>Source: {ev.source}</span>
                    <span>{formatTimeIST(ev.timestamp)}</span>
                  </div>
                  {ev.uri && (
                    <div style={{ wordBreak: 'break-all', color: 'var(--primary)', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                      {ev.uri}
                    </div>
                  )}
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
