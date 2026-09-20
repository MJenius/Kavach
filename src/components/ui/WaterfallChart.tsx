import React from 'react';

export interface WaterfallStep {
  label: string;
  value: number;
  type: 'positive' | 'negative' | 'subtotal';
  color?: string;
}

export interface WaterfallChartProps {
  steps: WaterfallStep[];
  currency?: string;
}

export const WaterfallChart: React.FC<WaterfallChartProps> = ({ steps, currency = '₹' }) => {
  const maxValue = Math.max(...steps.map((s) => Math.abs(s.value)), 1);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: '100%',
        minWidth: 0,
      }}
    >
      {steps.map((step, idx) => {
        const isSubtotal = step.type === 'subtotal';
        const isNegative = step.type === 'negative';

        let barColor = step.color;
        if (!barColor) {
          if (isSubtotal) barColor = 'var(--primary)';
          else if (isNegative) barColor = 'var(--accent-danger)';
          else barColor = 'var(--accent-success)';
        }

        const widthPercentage = Math.min(100, Math.max(8, (Math.abs(step.value) / maxValue) * 100));
        const formattedValue = `${isNegative ? '-' : isSubtotal ? '' : '+'}${currency}${Math.abs(step.value).toLocaleString('en-IN')}`;

        return (
          <div
            key={idx}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(85px, 120px) 1fr minmax(75px, 95px)',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              minWidth: 0,
            }}
          >
            {/* Label Column */}
            <div
              style={{
                fontSize: 'var(--font-sm)',
                color: isSubtotal ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isSubtotal ? 'var(--weight-bold)' : 'var(--weight-normal)',
                textAlign: 'left',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={step.label}
            >
              {step.label}
            </div>

            {/* Visual Bar Track */}
            <div
              style={{
                height: '24px',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '6px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: `${widthPercentage}%`,
                  height: '100%',
                  backgroundColor: barColor,
                  borderRadius: '6px',
                  transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: isSubtotal ? 1 : 0.85,
                }}
              />
            </div>

            {/* Value Column - Explicitly right-aligned in dedicated column so text NEVER overflows or clips */}
            <div
              style={{
                textAlign: 'right',
                fontSize: 'var(--font-sm)',
                fontWeight: isSubtotal ? 'var(--weight-bold)' : 'var(--weight-semibold)',
                color: isSubtotal
                  ? 'var(--text-primary)'
                  : isNegative
                  ? 'var(--accent-danger)'
                  : 'var(--accent-success)',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap',
              }}
            >
              {formattedValue}
            </div>
          </div>
        );
      })}
    </div>
  );
};
