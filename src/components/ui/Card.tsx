import React from 'react';

interface CardProps {
  children: React.ReactNode;
  elevated?: boolean;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevated = false,
  className = '',
  padding = 'md',
  style,
  onClick,
}) => {
  const paddingMap = {
    sm: 'var(--space-2)',
    md: 'var(--space-4)',
    lg: 'var(--space-6)',
  };

  const classes = `card ${elevated ? 'card-elevated' : ''} ${className}`.trim();

  return (
    <div
      className={classes}
      onClick={onClick}
      style={{
        padding: paddingMap[padding],
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
