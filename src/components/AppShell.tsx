import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { isLiveApiConfigured } from '../api/mock-client.ts';
import { ShieldIcon, DashboardIcon, WalletIcon, SparklesIcon, LinkIcon } from './icons.tsx';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Overview', icon: <DashboardIcon size={16} /> },
    { path: '/earnings', label: 'Earnings', icon: <WalletIcon size={16} /> },
    { path: '/cases', label: 'Cases', icon: <ShieldIcon size={16} /> },
    { path: '/ask-kavach', label: 'Ask Kavach', icon: <SparklesIcon size={16} /> },
    { path: '/architecture', label: 'Architecture', icon: <LinkIcon size={16} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      {/* Top Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(19, 27, 46, 0.95)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          width: '100%',
        }}
      >
        <div
          className="container-responsive"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '68px',
            gap: '1rem',
          }}
        >
          {/* Logo & Identity */}
          <NavLink
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              minWidth: 0,
            }}
          >
            <div
              style={{
                background: 'var(--primary-gradient)',
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 10px rgba(252, 128, 25, 0.35)',
                flexShrink: 0,
              }}
            >
              <ShieldIcon size={20} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  Kavach AI
                </span>
                <span
                  style={{
                    background: 'rgba(252, 128, 25, 0.15)',
                    color: '#ff9838',
                    border: '1px solid rgba(252, 128, 25, 0.3)',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  PRO
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Worker Intelligence &amp; Protection
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.4rem',
            }}
            className="desktop-nav"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => (isActive ? 'active-nav-link' : 'nav-link')}
              >
                <span style={{ fontSize: '0.95rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right Profile & Mobile Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--accent-success)',
                  boxShadow: '0 0 8px var(--accent-success)',
                }}
              />
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                Vikram S.
              </span>
              <span
                style={{
                  fontSize: '10px',
                  background: 'rgba(252, 128, 25, 0.2)',
                  color: '#ff9838',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 700,
                }}
              >
                QuickBite
              </span>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              aria-label="Toggle Navigation Menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-btn"
              style={{
                display: 'none',
                background: mobileMenuOpen ? 'var(--primary)' : 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                color: '#ffffff',
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
              }}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            className="mobile-dropdown"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '0.75rem 1rem 1rem 1rem',
              background: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border-color)',
              gap: '0.5rem',
            }}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => (isActive ? 'active-nav-link' : 'nav-link')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          width: '100%',
          padding: '1.5rem 0 3rem 0',
        }}
      >
        <div className="container-responsive">{children}</div>
      </main>

      {/* Consumer Product Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-surface)',
          padding: '1.25rem 0',
          width: '100%',
        }}
      >
        <div
          className="container-responsive"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: 'var(--font-xs)',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Kavach AI</span>
            <span>•</span>
            <span>Bengaluru Gig Partner Intelligence</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: 'var(--accent-success)' }}>● Deterministic Engine Ready</span>
            {!isLiveApiConfigured() && (
              <span
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--accent-warning)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                Demo Telemetry
              </span>
            )}
          </div>
        </div>
      </footer>

      {/* Embedded Responsive Media Query Overrides for Navigation */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
          .mobile-dropdown {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};
