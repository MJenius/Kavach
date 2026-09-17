import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppShell } from '../components/AppShell.tsx';
import { DashboardPage } from '../features/dashboard/DashboardPage.tsx';
import { EarningsPage } from '../features/earnings/EarningsPage.tsx';
import { EvidencePage } from '../features/evidence/EvidencePage.tsx';
import { InvestigationPage } from '../features/investigation/InvestigationPage.tsx';
import { WorkerTwinPage } from '../features/worker-twin/WorkerTwinPage.tsx';
import { CasesPage } from '../features/cases/CasesPage.tsx';

export const App: React.FC = () => {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/earnings" element={<EarningsPage />} />
        <Route path="/evidence" element={<EvidencePage />} />
        <Route path="/investigation" element={<InvestigationPage />} />
        <Route path="/worker-twin" element={<WorkerTwinPage />} />
        <Route path="/cases" element={<CasesPage />} />
      </Routes>
    </AppShell>
  );
};
