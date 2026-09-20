import React from 'react';

interface EvidenceStrengthProps {
  linkedEvidence: number;
  calculations: number;
  contradictions: number;
  missing: number;
  strength: 'STRONG' | 'MODERATE' | 'WEAK' | 'INSUFFICIENT';
}

export const EvidenceStrength: React.FC<EvidenceStrengthProps> = ({
  linkedEvidence,
  calculations,
  contradictions,
  missing,
  strength
}) => {
  const strengthConfig = {
    STRONG: { color: 'var(--accent-success)', label: 'Strong' },
    MODERATE: { color: 'var(--accent-warning)', label: 'Moderate' },
    WEAK: { color: 'var(--accent-danger)', label: 'Weak' },
    INSUFFICIENT: { color: 'var(--text-muted)', label: 'Insufficient Data' }
  };

  const config = strengthConfig[strength];

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h4 style={{ fontWeight: 'var(--weight-medium)', margin: 0 }}>Evidence Strength</h4>
        <span className="badge" style={{ backgroundColor: `${config.color}20`, color: config.color, border: `1px solid ${config.color}` }}>
          {config.label}
        </span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>{linkedEvidence}</span>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Linked Evidence</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>{calculations}</span>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Calculations</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 'var(--weight-bold)', color: contradictions > 0 ? 'var(--accent-danger)' : 'var(--text-primary)' }}>{contradictions}</span>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Contradictions</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 'var(--weight-bold)', color: missing > 0 ? 'var(--accent-warning)' : 'var(--text-primary)' }}>{missing}</span>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Missing Data</span>
        </div>
      </div>
    </div>
  );
};
