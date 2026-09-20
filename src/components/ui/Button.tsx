import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseClasses = `btn btn-${variant}`;


  const combinedClasses = `${baseClasses} ${className}`.trim();

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      style={
        size === 'sm' ? { padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--font-sm)' } :
        size === 'lg' ? { padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--font-lg)' } : {}
      }
      {...props}
    >
      {loading ? (
        <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>↻</span>
      ) : icon ? (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
