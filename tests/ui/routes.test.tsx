import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../src/app/App.tsx';

describe('UI Route & Page Rendering Verification', () => {
  const routes = [
    { path: '/', expectedText: 'Worker Overview' },
    { path: '/dashboard', expectedText: 'Worker Overview' },
    { path: '/earnings', expectedText: 'Earnings Reconciliation' },
    { path: '/evidence', expectedText: 'Worker Evidence Graph' },
    { path: '/investigation', expectedText: 'Trip Forensics' },
    { path: '/worker-twin', expectedText: 'Worker Digital Twin' },
    { path: '/cases', expectedText: 'Dispute Review Packages' },
  ];

  for (const route of routes) {
    it(`renders route ${route.path} without crashing`, () => {
      const html = renderToString(
        <MemoryRouter initialEntries={[route.path]}>
          <App />
        </MemoryRouter>
      );
      expect(html).toContain(route.expectedText);
      expect(html).toContain('Kavach AI');
    });
  }
});
