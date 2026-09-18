import React, { useState } from 'react';
import { loadDemoDataset } from '../../../fixtures/demo-worker.ts';
import { LocalEvidenceStore } from '../../evidence/store.ts';
import { EvidenceInspector } from '../../components/EvidenceInspector.tsx';

/**
 * Format ISO timestamp to 24-hr Indian Standard Time (HH:mm IST)
 */
function formatTimeIST(iso?: string): string {
  if (!iso) return '';
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
      type: 'TRIP_EVENT',
      source: 'GPS_LOG',
      impact: 'On-time arrival; 8 minutes left in 10-minute SLA window',
      relationship: 'SUPPORTS',
    },
    {
      step: '2. Merchant Queue / Waiting',
      title: 'Merchant Order Preparation Delay',
      evidenceId: 'ev-merchant-log',
      time: '19:02 - 19:09 IST',
      type: 'DOCUMENT',
      source: 'MERCHANT_PORTAL_RECEIPT',
      impact: '7 minutes uncredited merchant delay before packaging',
      relationship: 'SUPPORTS',
    },
    {
      step: '3. Package Handover',
      title: 'Order Barcode Handover Scan',
      evidenceId: 'ev-merchant-handover-scan',
      time: '19:09 IST',
      type: 'TRIP_EVENT',
      source: 'APP_SCAN',
      impact: 'Dispatched with only 3 minutes remaining for delivery SLA',
      relationship: 'SUPPORTS',
    },
    {
      step: '4. Delivery Started & SLA Feasibility',
      title: 'Kavach SLA Feasibility Calculation',
      evidenceId: 'ev-wait-calc',
      time: '19:09 IST',
      type: 'CALCULATION',
      source: 'KAVACH_DETERMINISTIC_ENGINE',
      impact: 'Deterministic calculation confirms 10m SLA infeasible after wait',
      relationship: 'SUPPORTS',
    },
    {
      step: '5. Traffic Disruption',
      title: 'Road Congestion Advisory',
      evidenceId: 'ev-traffic-alert-koramangala',
      time: '19:16 IST',
      type: 'TRIP_EVENT',
      source: 'TRAFFIC_API',
      impact: 'Traffic delay of 6 minutes (360s) due to road obstruction on 80 Feet Road Koramangala',
      relationship: 'SUPPORTS',
    },
    {
      step: '6. Delivery Completed',
      title: 'Customer OTP Handover Verification',
      evidenceId: 'ev-customer-delivery-otp',
      time: '19:24 IST',
      type: 'TRIP_EVENT',
      source: 'OTP_VERIFICATION',
      impact: 'Successful delivery completed with customer PIN confirmation',
      relationship: 'SUPPORTS',
    },
    {
      step: '7. Platform Penalty',
      title: 'Platform Late-Delivery Penalty Notice',
      evidenceId: 'ev-penalty-screenshot',
      time: '19:30 IST',
      type: 'SCREENSHOT',
      source: 'WORKER_UPLOAD',
      impact: '₹350 penalty assessed despite verified merchant & traffic delay',
      relationship: 'CONTESTED_CLAIM',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Worker Evidence Graph</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Standardized multi-modal evidence objects, DAG relationships, and independent provenance chains ({data.evidence.length} items logged).
        </p>
      </div>

      {/* Interactive Provenance Section */}
      <div
        data-testid="evidence-provenance-section"
        style={{
          background: 'var(--bg-surface)',
          borderRadius: '8px',
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
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              {primaryFinding.title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              Click any evidence node below to inspect source systems, exact telemetry, and graph relationships.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-warning)' }}>
              {supportingEvidence.length} Supporting Nodes Linked
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              1 Contested Claim • {data.evidence.length} Total Evidence Items in Graph
            </div>
          </div>
        </div>

        {/* Provenance Steps Visual DAG */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
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
                  background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {step.step}
                    </span>
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                      {step.type}
                    </span>
                  </div>

                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                    {step.title}
                  </strong>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {step.impact}
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      color: '#93c5fd',
                      background: 'rgba(59, 130, 246, 0.1)',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                    }}
                  >
                    {step.evidenceId}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {step.time} {evItem?.confidence ? `(${Math.round(evItem.confidence * 100)}%)` : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Standardized Evidence Objects Grid (Preserved & Enhanced with click-to-inspect) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>
          All Standardized Evidence Graph Objects ({data.evidence.length})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {data.evidence.map((ev) => (
            <div
              key={ev.id}
              data-testid={`evidence-card-${ev.id}`}
              onClick={() => setSelectedEvidenceId(ev.id)}
              style={{
                background: 'var(--bg-surface)',
                borderRadius: '8px',
                border: selectedEvidenceId === ev.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-warning">{ev.type}</span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#93c5fd' }}>
                      {ev.id}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {ev.confidence ? `${Math.round(ev.confidence * 100)}% conf` : 'N/A'}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                  {ev.description}
                </p>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Source: {ev.source}</span>
                  <span>{formatTimeIST(ev.timestamp)}</span>
                </div>
                {ev.uri && <div style={{ wordBreak: 'break-all', color: 'var(--primary)', marginTop: '0.2rem' }}>{ev.uri}</div>}
              </div>
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
