import React from 'react';

type EvidenceStatus = 'VERIFIED' | 'CALCULATED' | 'AI_INFERRED' | 'UNVERIFIED' | 'CONTRADICTED';

interface EvidenceBadgeProps {
  status: EvidenceStatus;
  label?: string;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({ status, label }) => {
  const statusConfig = {
    VERIFIED: { color: 'var(--evidence-verified)', bg: 'rgba(16, 185, 129, 0.1)' },
    CALCULATED: { color: 'var(--evidence-calculated)', bg: 'rgba(59, 130, 246, 0.1)' },
    AI_INFERRED: { color: 'var(--evidence-ai-inferred)', bg: 'rgba(139, 92, 246, 0.1)' },
    UNVERIFIED: { color: 'var(--evidence-unverified)', bg: 'rgba(245, 158, 11, 0.1)' },
    CONTRADICTED: { color: 'var(--evidence-contradicted)', bg: 'rgba(239, 68, 68, 0.1)' },
  };

  const config = statusConfig[status];

  return (
    <span
      className="badge"
      style={{
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}`
      }}
    >
      {label || status}
    </span>
  );
};
