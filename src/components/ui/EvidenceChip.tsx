import React from 'react';

type EvidenceStatus = 'VERIFIED' | 'CALCULATED' | 'AI_INFERRED' | 'UNVERIFIED' | 'CONTRADICTED';

interface EvidenceChipProps {
  evidenceId: string;
  onClick?: (id: string) => void;
  status?: EvidenceStatus;
}

export const EvidenceChip: React.FC<EvidenceChipProps> = ({ evidenceId, onClick, status = 'UNVERIFIED' }) => {
  const statusColors = {
    VERIFIED: 'var(--evidence-verified)',
    CALCULATED: 'var(--evidence-calculated)',
    AI_INFERRED: 'var(--evidence-ai-inferred)',
    UNVERIFIED: 'var(--evidence-unverified)',
    CONTRADICTED: 'var(--evidence-contradicted)',
  };

  const color = statusColors[status];

  return (
    <button
      className="evidence-chip"
      onClick={() => onClick && onClick(evidenceId)}
      style={{
        borderLeft: `3px solid ${color}`,
        cursor: onClick ? 'pointer' : 'default',
        padding: '2px 8px'
      }}
      type="button"
    >
      <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>ID</span>
      <span>{evidenceId.substring(0, 8)}</span>
    </button>
  );
};
