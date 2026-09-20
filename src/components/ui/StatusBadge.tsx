import React from 'react';

type StatusVariant = 'info' | 'primary' | 'success' | 'warning' | 'danger';

interface StatusBadgeProps {
  variant?: StatusVariant;
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ variant = 'primary', label }) => {
  return (
    <span className={`badge badge-${variant}`}>
      {label}
    </span>
  );
};
