import React from 'react';
import { Link } from 'react-router-dom';
import { loadDemoDataset } from '../../../fixtures/demo-worker.ts';
import { Card, WaterfallChart, StatusBadge, Button } from '../../components/ui/index.ts';

export const EarningsPage: React.FC = () => {
  const data = loadDemoDataset();
  const summary = data.summary;

  const waterfallSteps = [
    { label: 'Platform Gross', value: summary.platformGrossPayout, type: 'positive' as const },
    { label: 'Penalties', value: summary.penalties, type: 'negative' as const, color: 'var(--accent-danger)' },
    { label: 'Platform Net', value: summary.platformNetPayout, type: 'subtotal' as const },
    { label: 'Op Expenses', value: summary.totalExpenses, type: 'negative' as const, color: 'var(--accent-warning)' },
    { label: 'Real Earnings', value: summary.estimatedRealEarnings, type: 'subtotal' as const, color: 'var(--accent-success)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%', minWidth: 0 }}>
      {/* Consumer Header: Real Earnings Summary */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(19, 27, 46, 0.95) 100%)',
          border: '1px solid var(--accent-success-border)',
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
            <span className="badge badge-success">ESTIMATED REAL EARNINGS</span>
            <span className="badge badge-primary">Week of Sep 14–19</span>
          </div>
          <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 0.25rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Earnings Reconciliation
          </h1>
          <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.4rem)', fontWeight: 900, color: 'var(--accent-success)', letterSpacing: '-0.03em', margin: 0 }}>
            ₹{summary.estimatedRealEarnings.toLocaleString('en-IN')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Real take-home after ₹{summary.totalExpenses} operating expenses &amp; ₹{summary.deductions} platform deduction across {summary.activeHours} active hours.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/cases/case-001/analysis" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="sm">
              Dispute ₹350 Penalty
            </Button>
          </Link>
          <Link to="/ask-kavach" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="sm">
              Simulate Compensation
            </Button>
          </Link>
        </div>
      </div>

      {/* Visual Money Flow Step-by-Step Card */}
      <Card elevated>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', color: '#ffffff' }}>
          Visual Money Flow Breakdown
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          <div style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Platform Payout</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
              ₹{summary.platformGrossPayout.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Base pay, bonus, surge</div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.2rem' }}>↓</div>

          <div style={{ background: 'var(--accent-danger-bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-danger-border)' }}>
            <div style={{ fontSize: '0.75rem', color: '#f87171' }}>Deductions</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-danger)', fontFamily: 'var(--font-mono)' }}>
              -₹{summary.deductions}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Disputed penalty (Tue)</div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.2rem' }}>↓</div>

          <div style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Platform Net</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-info)', fontFamily: 'var(--font-mono)' }}>
              ₹{summary.platformNetPayout.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Transferred to bank</div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.2rem' }}>↓</div>

          <div style={{ background: 'var(--accent-warning-bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-warning-border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-warning)' }}>Vehicle Costs</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-warning)', fontFamily: 'var(--font-mono)' }}>
              -₹{summary.totalExpenses.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fuel, phone, service</div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.2rem' }}>=</div>

          <div style={{ background: 'var(--accent-success-bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-success-border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-success)' }}>Real Take-Home</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--accent-success)', fontFamily: 'var(--font-mono)' }}>
              ₹{summary.estimatedRealEarnings.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>₹157.73 / active hr</div>
          </div>
        </div>
      </Card>

      {/* Main Grid: Itemized Ledger & Side Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', width: '100%' }}>
        {/* Scannable Transaction Ledger */}
        <Card elevated style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Transaction Ledger ({data.earnings.length} Records)
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Week of Sep 14–19
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '580px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {data.earnings.map((earn) => {
              const isPenalty = earn.type === 'PENALTY';
              const isShortfall = earn.type === 'INCENTIVE' && (earn.expectedAmount || 0) > (earn.actualAmount || 0);

              return (
                <div
                  key={earn.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.9rem 1rem',
                    background: isPenalty
                      ? 'var(--accent-danger-bg)'
                      : isShortfall
                      ? 'var(--accent-warning-bg)'
                      : 'var(--bg-surface-hover)',
                    borderRadius: 'var(--radius-sm)',
                    border: isPenalty
                      ? '1px solid var(--accent-danger-border)'
                      : isShortfall
                      ? '1px solid var(--accent-warning-border)'
                      : '1px solid var(--border-color)',
                    gap: '0.75rem',
                    minWidth: 0,
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ color: isPenalty ? '#f87171' : isShortfall ? '#fbbf24' : '#ffffff' }}>
                        {earn.type.replace('_', ' ')}
                      </span>
                      {isPenalty && <StatusBadge variant="danger" label="REVIEW RECOMMENDED" />}
                      {isShortfall && <StatusBadge variant="warning" label="EVIDENCE NEEDED" />}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.25rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {new Date(earn.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                        timeZone: 'Asia/Kolkata',
                      })}{' '}
                      • {earn.source}
                    </div>
                    {isPenalty && (
                      <Link
                        to="/cases/case-001/analysis"
                        style={{
                          fontSize: '0.75rem',
                          display: 'inline-block',
                          marginTop: '0.35rem',
                          color: '#ff9838',
                          fontWeight: 600,
                        }}
                      >
                        Investigate Disputed Penalty →
                      </Link>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        fontFamily: 'var(--font-mono)',
                        color:
                          (earn.actualAmount || 0) < 0
                            ? 'var(--accent-danger)'
                            : isPenalty
                            ? 'var(--accent-danger)'
                            : isShortfall
                            ? 'var(--accent-warning)'
                            : 'var(--accent-success)',
                      }}
                    >
                      {(earn.actualAmount || 0) < 0
                        ? `-₹${Math.abs(earn.actualAmount || 0)}`
                        : `₹${earn.actualAmount}`}
                    </div>
                    {earn.expectedAmount !== undefined && earn.expectedAmount !== earn.actualAmount && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-warning)', marginTop: '0.2rem' }}>
                        Expected: ₹{earn.expectedAmount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Side: Waterfall Flow & Itemized Vehicle Expenses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
          <Card elevated>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', color: '#ffffff' }}>
              Earnings Flow Waterfall
            </h3>
            <WaterfallChart steps={waterfallSteps} />
          </Card>

          <Card elevated>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Itemized Operating Expenses
              </h3>
              <span className="badge badge-warning">₹{summary.totalExpenses}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {data.expenses.map((exp) => (
                <div
                  key={exp.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 0.85rem',
                    background: 'var(--bg-surface-hover)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>{exp.type}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(exp.timestamp).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        timeZone: 'Asia/Kolkata',
                      })}{' '}
                      • {exp.source}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--accent-warning)', fontFamily: 'var(--font-mono)' }}>
                    ₹{exp.amount}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '0.95rem',
              }}
            >
              <span>Total Operating Expenses</span>
              <span style={{ color: 'var(--accent-warning)', fontFamily: 'var(--font-mono)' }}>
                ₹{summary.totalExpenses}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
