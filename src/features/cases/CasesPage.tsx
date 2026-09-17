import React, { useState } from 'react';
import { loadDemoDataset } from '../../../fixtures/demo-worker.ts';

export const CasesPage: React.FC = () => {
  const data = loadDemoDataset();
  const [generatedUri, setGeneratedUri] = useState<string | null>(null);

  const handleGeneratePackage = (caseId: string) => {
    setGeneratedUri(`s3://kavach-evidence-bucket/packages/${caseId}-dispute-package.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Cases & Dispute Review Packages</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Package structured evidence, policy clauses, and timelines for platform review submission ({data.cases.length} active cases).
        </p>
      </div>

      {generatedUri && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--accent-success)',
            padding: '1rem',
            borderRadius: '6px',
            fontSize: '0.9rem',
          }}
        >
          <strong style={{ color: 'var(--accent-success)' }}>✓ Evidence Package Generated: </strong>
          <code>{generatedUri}</code>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {data.cases.map((c) => (
          <div
            key={c.id}
            style={{
              background: 'var(--bg-surface)',
              padding: '1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-warning">{c.type} CASE</span>
                <span className="badge badge-success">{c.status}</span>
                <strong style={{ fontSize: '1rem' }}>Case #{c.id}</strong>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Created: {new Date(c.createdAt).toLocaleDateString()} | Findings linked: {c.findingIds.length}
              </p>
            </div>
            <div>
              <button
                onClick={() => handleGeneratePackage(c.id)}
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Generate Dispute Package
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
