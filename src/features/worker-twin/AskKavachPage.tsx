import React, { useState } from 'react';
import { createApiClient } from '../../api/mock-client.ts';
import { Card, Button, StatusBadge, LoadingState, ErrorState } from '../../components/ui/index.ts';

import type { WorkerTwinResponse } from '../../domain/index.ts';

const PRESET_QUESTIONS = [
  "Why was ₹350 deducted from my QuickBite shift on Tuesday?",
  "How much did I actually take home after fuel and bike maintenance this week?",
  "What happened to my ₹500 peak surge incentive?",
  "What was my real hourly wage on Wednesday compared to Saturday?",
  "Can QuickBite legally penalize me if the restaurant delayed my order?",
  "How much would my weekly earnings increase if merchant wait times were compensated?",
];

const STORAGE_KEY_QUERY = 'kavach_ask_query_v2';
const STORAGE_KEY_RESPONSE = 'kavach_ask_response_v2';

export const AskKavachPage: React.FC = () => {
  const [query, setQuery] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(STORAGE_KEY_QUERY) || '';
      }
    } catch {
      // ignore
    }
    return '';
  });

  const [response, setResponse] = useState<WorkerTwinResponse | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY_RESPONSE);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Purge any stale ungrounded responses from previous builds
          if (parsed && typeof parsed.answer === 'string' && parsed.answer.includes('Hub 4b during rush hours')) {
            window.localStorage.removeItem(STORAGE_KEY_RESPONSE);
            return null;
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCalculation, setShowCalculation] = useState(false);

  const handleAsk = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setLoading(true);
    setError(null);
    setShowCalculation(false);

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY_QUERY, trimmed);
      }
    } catch {
      // ignore
    }

    try {
      const client = createApiClient();
      await new Promise((resolve) => setTimeout(resolve, 200));
      const res = await client.queryWorkerTwin({ workerId: 'worker-vikram-01', query: trimmed });
      setResponse(res);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY_RESPONSE, JSON.stringify(res));
        }
      } catch {
        // ignore
      }
    } catch (_err) {
      setError('Unable to fetch answer from Kavach AI. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%', minWidth: 0 }}>
      {/* Consumer Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(252, 128, 25, 0.15) 0%, rgba(19, 27, 46, 0.95) 100%)',
          border: '1px solid var(--primary-subtle-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-primary">WORKER DIGITAL TWIN</span>
            <span className="badge badge-success">Grounded Answers</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Ask Kavach
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem', maxWidth: '650px' }}>
            Your independent worker financial assistant. Get verified, evidence-grounded answers about your earnings, deductions, and platform policies.
          </p>
        </div>
      </div>

      <Card elevated>
        {/* Large Input Box */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your trips, payouts, or platform policies..."
            style={{
              flex: 1,
              minWidth: '220px',
              padding: '0.9rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim() !== '') {
                handleAsk(query);
              }
            }}
          />
          <Button
            variant="primary"
            onClick={() => handleAsk(query)}
            disabled={loading || !query.trim()}
            loading={loading}
          >
            Ask Kavach
          </Button>
        </div>

        {/* Suggested Questions Pill Carousel */}
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>
            Suggested Questions:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAsk(q)}
                style={{
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '0.45rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ marginTop: '1.25rem' }}>
            <ErrorState message={error} onRetry={() => handleAsk(query)} />
          </div>
        )}

        {loading && (
          <div style={{ marginTop: '1.25rem' }}>
            <LoadingState message="Kavach AI is reconciling telemetry &amp; calculating grounded answers..." />
          </div>
        )}

        {/* Answer Card */}
        {response && !loading && !error && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, rgba(252, 128, 25, 0.06) 0%, rgba(19, 27, 46, 0.9) 100%)',
              borderLeft: '4px solid var(--primary)',
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              border: '1px solid rgba(252, 128, 25, 0.25)',
              borderLeftWidth: '4px',
              animation: 'fadeIn 0.25s ease-out',
            }}
          >
            {/* Answer Header & Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span className="badge badge-primary">KAVACH AI ASSISTANT</span>

              {response.verificationBadge === 'VERIFIED_DATA' && (
                <StatusBadge label="VERIFIED TELEMETRY GROUNDING" variant="success" />
              )}
              {response.verificationBadge === 'SIMULATION_PROJECTION' && (
                <StatusBadge label="SIMULATION PROJECTION" variant="info" />
              )}
              {response.verificationBadge === 'POLICY_GUIDANCE' && (
                <StatusBadge label="POLICY INTERPRETATION" variant="warning" />
              )}
              {response.verificationBadge === 'INSUFFICIENT_EVIDENCE' && (
                <StatusBadge label="UNVERIFIED (PENDING PLATFORM LOGS)" variant="danger" />
              )}
              {!response.verificationBadge && response.isEvidenceBacked && (
                <StatusBadge label="VERIFIED TELEMETRY GROUNDING" variant="success" />
              )}

              {response.isEvidenceBacked && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Grounding Confidence: {Math.round(response.confidence * 100)}%
                </span>
              )}
            </div>

            {/* Answer Text */}
            <div style={{ whiteSpace: 'pre-wrap', color: '#ffffff', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              {response.answer}
            </div>

            {/* "Why?" / Calculation Details Toggle Button */}
            {response.calculationDetails && (
              <div style={{ marginBottom: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCalculation(!showCalculation)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--primary-subtle-border)',
                    color: 'var(--primary)',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>{showCalculation ? '▼ Hide Calculation Details' : '▶ Show Calculation & "Why?"'}</span>
                </button>

                {showCalculation && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      padding: '1rem',
                      background: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                      animation: 'fadeIn 0.2s ease-out',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Deterministic Calculation Breakdown:
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', color: '#93c5fd', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {response.calculationDetails}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Linked Evidence IDs */}
            {response.evidenceIds && response.evidenceIds.length > 0 && (
              <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Linked Evidence:</span>
                {response.evidenceIds.map((id) => (
                  <span
                    key={id}
                    className="evidence-chip"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-color)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-info)',
                    }}
                  >
                    {id}
                  </span>
                ))}
              </div>
            )}

            {/* Supporting Trips */}
            {response.supportingTrips && response.supportingTrips.length > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Supporting Trips:</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                  {response.supportingTrips.length > 4
                    ? `${response.supportingTrips.slice(0, 3).join(', ')}... (${response.supportingTrips.length} reconciled trips)`
                    : response.supportingTrips.join(', ')}
                </span>
              </div>
            )}

            {/* Observed Factors */}
            {response.observedFactors && response.observedFactors.length > 0 && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 600 }}>Reconciled Factors: </span>
                {response.observedFactors.join(' • ')}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
