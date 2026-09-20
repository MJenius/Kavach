import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell.tsx';
import { DashboardPage } from '../features/dashboard/DashboardPage.tsx';
import { EarningsPage } from '../features/earnings/EarningsPage.tsx';
import { CasesPage } from '../features/cases/CasesPage.tsx';
import { AskKavachPage } from '../features/worker-twin/AskKavachPage.tsx';
import { CaseDetailPage } from '../features/cases/CaseDetailPage.tsx';

/**
 * React Error Boundary — catches render-time exceptions in any child component
 * and displays a recoverable error UI instead of a white screen.
 */
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Kavach ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '1rem',
            padding: '2rem',
            textAlign: 'center',
            color: '#e2e8f0',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f87171' }}>
            Something went wrong
          </h2>
          <p style={{ maxWidth: '500px', color: '#94a3b8', lineHeight: 1.6 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            style={{
              background: '#fc8019',
              color: '#ffffff',
              border: 'none',
              padding: '0.7rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const App: React.FC = () => {
  return (
    <AppErrorBoundary>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/earnings" element={<EarningsPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/ask-kavach" element={<AskKavachPage />} />
          <Route path="/worker-twin" element={<Navigate to="/ask-kavach" replace />} />
          
          {/* Redirects for old routes */}
          <Route path="/evidence" element={<Navigate to="/cases/case-trip-001/evidence" replace />} />
          <Route path="/investigation" element={<Navigate to="/cases/case-trip-001/analysis" replace />} />

          {/* Case details and sub-routes */}
          <Route path="/cases/:caseId/*" element={<CaseDetailPage />} />
        </Routes>
      </AppShell>
    </AppErrorBoundary>
  );
};
