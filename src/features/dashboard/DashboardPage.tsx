import React from 'react';
import { Link } from 'react-router-dom';
import { loadDemoDataset } from '../../../fixtures/demo-worker.ts';
import { MetricCard, Card, WaterfallChart, Button } from '../../components/ui/index.ts';
import { SparklesIcon, ShieldIcon } from '../../components/icons.tsx';

export const DashboardPage: React.FC = () => {
  const data = loadDemoDataset();
  const summary = data.summary;

  const waterfallSteps = [
    { label: 'Gross Payout', value: summary.platformGrossPayout, type: 'positive' as const },
    { label: 'Deductions', value: summary.deductions, type: 'negative' as const },
    { label: 'Platform Net', value: summary.platformNetPayout, type: 'subtotal' as const },
    { label: 'Op Expenses', value: summary.totalExpenses, type: 'negative' as const },
    { label: 'Real Earnings', value: summary.estimatedRealEarnings, type: 'subtotal' as const },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%', minWidth: 0 }}>
      {/* Consumer Hero Greeting: Your week at a glance */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(252, 128, 25, 0.15) 0%, rgba(19, 27, 46, 0.9) 100%)',
          border: '1px solid var(--primary-subtle-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-primary">YOUR WEEK AT A GLANCE</span>
            <span className="badge badge-success">Reconciled Telemetry</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.35rem, 3.8vw, 1.85rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Welcome back, {data.worker.name}!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem', maxWidth: '650px' }}>
            Financial Command Center — Independent earnings reconciliation for your 37 delivery shifts across {data.worker.platforms.join(' & ')} in Bengaluru.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link to="/ask-kavach" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="sm">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <SparklesIcon size={14} /> Ask Kavach
              </span>
            </Button>
          </Link>
          <Link to="/cases" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="sm">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldIcon size={14} /> View Cases (2)
              </span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', width: '100%' }}>
        <MetricCard
          label="Real Take-Home Earnings"
          value={`₹${summary.estimatedRealEarnings.toLocaleString('en-IN')}`}
          sublabel="Net money in pocket after fuel & bike costs"
          color="success"
          source="Kavach Reconciled"
        />
        <MetricCard
          label="Platform Gross Payout"
          value={`₹${summary.platformGrossPayout.toLocaleString('en-IN')}`}
          sublabel="Gross earnings reported by platform apps"
          source="QuickBite & FlashDrop"
        />
        <MetricCard
          label="Effective Hourly Rate"
          value={`₹${summary.effectiveHourlyRate} / hr`}
          sublabel={`Across ${summary.activeHours} active shift hours`}
          source="GPS Active Hours"
        />
        <MetricCard
          label="Operating Expenses"
          value={`₹${summary.totalExpenses.toLocaleString('en-IN')}`}
          sublabel="Fuel (₹900), Mobile (₹120) & Service (₹250)"
          color="warning"
          source="Itemized Bills"
        />
      </div>

      {/* Two Column Layout: Needs Attention & Your Money This Week */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', width: '100%' }}>
        {/* Needs Your Attention — Clean Task List */}
        <Card elevated style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Needs Attention
              </h3>
              <span className="badge badge-warning">2 Discrepancies</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Case 1: ₹350 Penalty */}
              <div
                style={{
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem',
                  background: 'var(--accent-danger-bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <strong style={{ fontSize: '1rem', color: '#ffffff' }}>₹350 Penalty</strong>
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>Review recommended</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                      QuickBite • Sep 15 (19:30 IST) • Late-delivery deduction
                    </p>
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-danger)', fontFamily: 'var(--font-mono)' }}>
                    -₹350
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  GPS verified: 7m merchant kitchen delay consumed SLA. Strong evidence chain compiled.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <Link to="/cases/case-001/analysis" style={{ textDecoration: 'none' }}>
                    <Button variant="primary" size="sm">
                      Review Case &amp; Dispute
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Case 2: ₹300 Incentive Shortfall */}
              <div
                style={{
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem',
                  background: 'var(--accent-warning-bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <strong style={{ fontSize: '1rem', color: '#ffffff' }}>₹300 Incentive</strong>
                      <span className="badge badge-warning" style={{ fontSize: '10px' }}>Evidence needed</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                      QuickBite • Sep 15 (22:00 IST) • Peak surge milestone shortfall
                    </p>
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-warning)', fontFamily: 'var(--font-mono)' }}>
                    ₹300
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Promised ₹500 for 6 peak deliveries; received ₹200. Awaiting platform qualification logs.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <Link to="/earnings" style={{ textDecoration: 'none' }}>
                    <Button variant="secondary" size="sm">
                      View Ledger Record
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Your Money This Week — Waterfall Chart Card */}
        <Card elevated>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Your Money This Week
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                How gross platform revenue translates into real take-home pay
              </p>
            </div>
            <Link to="/earnings" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
              Full Ledger →
            </Link>
          </div>
          <WaterfallChart steps={waterfallSteps} />
        </Card>
      </div>

      {/* Weekly Activity — 6-Day Polished Shift Component */}
      <Card elevated>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Weekly Activity &amp; Daily Net Take-Home
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.25rem 0 0 0' }}>
              Daily reconciliation across active hours, gross payouts, and operational expenses.
            </p>
          </div>
          <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
            37 TRIPS • 47.55 ACTIVE HOURS
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '0.75rem', width: '100%' }}>
          {[
            { day: 'Mon Sep 14', trips: 6, hours: '7.8h', gross: '₹1,010', net: '₹845', status: 'NORMAL' },
            {
              day: 'Tue Sep 15',
              trips: 7,
              hours: '8.4h',
              gross: '₹754',
              net: '₹229',
              status: 'PENALTY_DIP',
              note: '₹350 Penalty',
            },
            {
              day: 'Wed Sep 16',
              trips: 6,
              hours: '7.8h',
              gross: '₹994',
              net: '₹574',
              status: 'MAINTENANCE',
              note: 'Bike Service ₹250',
            },
            { day: 'Thu Sep 17', trips: 6, hours: '7.8h', gross: '₹995', net: '₹830', status: 'NORMAL' },
            { day: 'Fri Sep 18', trips: 6, hours: '8.1h', gross: '₹1,040', net: '₹875', status: 'NORMAL' },
            {
              day: 'Sat Sep 19',
              trips: 6,
              hours: '7.9h',
              gross: '₹4,327',
              net: '₹4,147',
              status: 'TARGET_BONUS',
              note: 'Milestone Bonus',
            },
          ].map((item, idx) => {
            const isPenaltyDip = item.status === 'PENALTY_DIP';

            return (
              <div
                key={idx}
                style={{
                  background: isPenaltyDip ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-surface-hover)',
                  border: `1px solid ${isPenaltyDip ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  minWidth: 0,
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.day}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {item.trips} trips • {item.hours}
                </div>
                <div style={{ marginTop: '0.3rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.4rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Gross: {item.gross}</div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: isPenaltyDip ? 'var(--accent-danger)' : 'var(--accent-success)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    Net: {item.net}
                  </div>
                </div>
                {item.note && (
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: isPenaltyDip ? 'var(--accent-danger)' : 'var(--accent-warning)',
                      fontWeight: 700,
                      marginTop: '0.1rem',
                    }}
                  >
                    {item.note}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
