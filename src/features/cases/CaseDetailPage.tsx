import React, { useState } from 'react';
import { useParams, NavLink, Routes, Route, useLocation } from 'react-router-dom';
import { loadDemoDataset } from '../../../fixtures/demo-worker.ts';
import { EvidencePage } from '../evidence/EvidencePage.tsx';
import { InvestigationPage } from '../investigation/InvestigationPage.tsx';
import { Card, MetricCard, TimelineView, StatusBadge, Button } from '../../components/ui/index.ts';
import { generateReviewPackage, getStoredReviewPackage } from './review-package.ts';
import {
  PinIcon,
  ClockIcon,
  LinkIcon,
  SearchIcon,
  FileTextIcon,
  ClipboardIcon,
  CheckIcon,
} from '../../components/icons.tsx';

export const CaseDetailPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const data = loadDemoDataset();
  const location = useLocation();

  const normalizedCaseId = caseId || 'case-001';
  const isPenaltyCase = normalizedCaseId === 'case-001' || normalizedCaseId.includes('trip');

  const currentCase = {
    id: normalizedCaseId,
    status: isPenaltyCase ? 'READY' : 'REVIEW',
    disputedAmount: isPenaltyCase ? 350 : 300,
    title: isPenaltyCase ? 'Late Delivery Penalty' : 'Incentive Shortfall Discrepancy',
    tripId: 'trip-2026-09-15-001',
  };

  const heroEvents = data.tripEvents.filter((e) => e.tripId === currentCase.tripId);
  const timelineItems = (heroEvents.length > 0 ? heroEvents : data.tripEvents).map((event) => ({
    timestamp: event.timestamp,
    title: event.type,
    subtitle: `Location: ${event.latitude ?? 12.935}, ${event.longitude ?? 77.625}`,
    source: event.source,
    evidenceIds: event.evidenceIds,
  }));

  const renderOverview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', width: '100%', minWidth: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        <MetricCard
          label="Disputed Amount"
          value={`₹${currentCase.disputedAmount}`}
          color="danger"
          sublabel={isPenaltyCase ? 'Deduction on QuickBite shift' : 'Uncredited peak surge bonus'}
        />
        <MetricCard
          label="Case Status"
          value={currentCase.status}
          color={currentCase.status === 'READY' ? 'success' : 'warning'}
          sublabel={isPenaltyCase ? 'Evidence chain complete' : 'Awaiting platform logs'}
        />
        <MetricCard
          label="Evidence Strength"
          value={isPenaltyCase ? 'STRONG (94%)' : 'PENDING'}
          color={isPenaltyCase ? 'success' : 'warning'}
          sublabel={isPenaltyCase ? '6 telemetry proofs verified' : 'Screenshot captured only'}
        />
      </div>

      <Card elevated>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>
              {isPenaltyCase ? 'Penalty Dispute Summary' : 'Incentive Reconciliation'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '750px', fontSize: '0.9rem' }}>
              {isPenaltyCase
                ? 'On Tuesday Sep 15, QuickBite levied an automated ₹350 late penalty. Objective GPS telemetry confirms Vikram arrived at the restaurant at 19:02 IST. Merchant kitchen preparation consumed 7 minutes without partner fault, leaving an infeasible 3 minutes for delivery.'
                : 'Vikram completed 6 qualifying peak-hour orders on Tuesday Sep 15. The promised surge bonus of ₹500 was credited as ₹200 on the platform statement, leaving an unresolved ₹300 shortfall.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {isPenaltyCase && (
              <NavLink to={`/cases/${currentCase.id}/case-file`} style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="sm">
                  View Formatted Dispute Package
                </Button>
              </NavLink>
            )}
            <NavLink to={`/cases/${currentCase.id}/analysis`} style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="sm">
                Open Forensics Engine
              </Button>
            </NavLink>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTimeline = () => (
    <Card elevated>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
          Deterministic Telemetry Timeline (Trip {currentCase.tripId})
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Chronological timestamped events reconstructed from GPS, merchant terminal logs, and customer OTP pins.
        </p>
      </div>
      <TimelineView items={timelineItems} />
    </Card>
  );

  const renderCaseFile = () => {
    // Check if we have a persisted package for this case
    const stored = getStoredReviewPackage(currentCase.id);

    const packageText = generateReviewPackage({
      caseId: currentCase.id,
      tripId: currentCase.tripId,
      workerName: data.worker.name,
      disputedAmount: currentCase.disputedAmount,
      investigation: stored?.investigation || data.investigation,
      timeline: stored?.timeline || heroEvents,
    });

    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(packageText);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        }
      } catch (err) {
        console.error('Failed to copy', err);
      }
    };

    return (
      <Card elevated>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-success">READY FOR SUBMISSION</span>
              <span className="badge badge-primary">DISPUTE BUNDLE</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Official Review Package &amp; Case File
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
              Standardized, evidence-backed dispute review package generated from canonical investigation data.
            </p>
          </div>

          <Button variant="primary" size="sm" onClick={handleCopy}>
            {copied ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckIcon size={14} /> Copied to Clipboard
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <ClipboardIcon size={14} /> Copy Review Package
              </span>
            )}
          </Button>
        </div>

        <pre
          style={{
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowX: 'auto',
            maxHeight: '650px',
          }}
        >
          {packageText}
        </pre>
      </Card>
    );
  };

  const tabs = [
    { id: '', label: 'Overview', icon: <PinIcon size={15} /> },
    { id: 'timeline', label: 'Timeline', icon: <ClockIcon size={15} /> },
    { id: 'evidence', label: 'Evidence', icon: <LinkIcon size={15} /> },
    { id: 'analysis', label: 'Analysis', icon: <SearchIcon size={15} /> },
    { id: 'case-file', label: 'Case File', icon: <FileTextIcon size={15} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', minWidth: 0 }}>
      {/* Case Detail Header */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary">CASE RECORD</span>
            <StatusBadge
              variant={currentCase.status === 'READY' ? 'success' : 'warning'}
              label={currentCase.status}
            />
            <span className="badge badge-danger">₹{currentCase.disputedAmount}</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.6rem)', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Case {currentCase.id}: {currentCase.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.35rem 0 0 0', fontSize: '0.85rem' }}>
            Delivery Partner: {data.worker.name} • Trip {currentCase.tripId} • QuickBite Bengaluru
          </p>
        </div>

        <NavLink to="/cases" style={{ textDecoration: 'none' }}>
          <Button variant="secondary" size="sm">
            ← Back to All Cases
          </Button>
        </NavLink>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        {tabs.map((tab) => {
          const basePath = `/cases/${normalizedCaseId}`;
          const path = tab.id ? `${basePath}/${tab.id}` : basePath;
          const isActive =
            location.pathname === path || (tab.id === '' && location.pathname === basePath + '/');

          return (
            <NavLink
              key={tab.id}
              to={path}
              end={tab.id === ''}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1rem',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Sub-Route Pages */}
      <Routes>
        <Route path="/" element={renderOverview()} />
        <Route path="/timeline" element={renderTimeline()} />
        <Route path="/evidence" element={<EvidencePage />} />
        <Route path="/analysis" element={<InvestigationPage />} />
        <Route path="/case-file" element={renderCaseFile()} />
      </Routes>
    </div>
  );
};
