import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../src/app/App.tsx';

describe('UI Route & Page Rendering Verification', () => {
  const routes = [
    { path: '/', expectedText: 'Financial Command Center' },
    { path: '/earnings', expectedText: 'Earnings Reconciliation' },
    { path: '/cases/case-trip-001/evidence', expectedText: 'All Standardized Evidence Graph Objects' },
    { path: '/cases/case-trip-001/analysis', expectedText: 'Penalty Review' },
    { path: '/ask-kavach', expectedText: 'Ask Kavach' },
    { path: '/cases', expectedText: 'All Registered Cases' },
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
