import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell.tsx';
import { DashboardPage } from '../features/dashboard/DashboardPage.tsx';
import { EarningsPage } from '../features/earnings/EarningsPage.tsx';
import { CasesPage } from '../features/cases/CasesPage.tsx';
import { AskKavachPage } from '../features/worker-twin/AskKavachPage.tsx';
import { CaseDetailPage } from '../features/cases/CaseDetailPage.tsx';

export const App: React.FC = () => {
  return (
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
  );
};
