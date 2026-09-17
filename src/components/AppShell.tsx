import React from 'react';
import { NavLink } from 'react-router-dom';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header Bar */}
      <header
        style={{
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-surface)',
          padding: '0.75rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              background: 'var(--primary)',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#fff',
            }}
          >
            K
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Kavach AI</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
              Worker Intelligence & Protection Layer
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { path: '/', label: 'Dashboard' },
            { path: '/earnings', label: 'Earnings' },
            { path: '/evidence', label: 'Evidence Graph' },
            { path: '/investigation', label: 'Investigation' },
            { path: '/worker-twin', label: 'Worker Twin' },
            { path: '/cases', label: 'Cases' },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                padding: '0.5rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive ? 'var(--primary)' : 'transparent',
                transition: 'all 0.2s ease',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Worker Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-success">MOCK MODE</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Vikram S. (QuickBite)
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          padding: '1rem 2rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>Kavach AI — Hackathon Prototype Skeleton</span>
        <span>Standard Indian Delivery Worker Persona (Bengaluru)</span>
      </footer>
    </div>
  );
};
