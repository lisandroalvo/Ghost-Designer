import React from 'react';

interface IntentSelectorProps {
  value: 'meeting' | 'interview' | 'sales' | 'therapy' | 'lecture' | 'casual';
  onChange: (intent: 'meeting' | 'interview' | 'sales' | 'therapy' | 'lecture' | 'casual') => void;
  disabled?: boolean;
}

const intents = [
  { id: 'meeting', label: 'Meeting', description: 'Track decisions and action items' },
  { id: 'interview', label: 'Interview', description: 'Capture insights and red flags' },
  { id: 'sales', label: 'Sales', description: 'Spot objections and buying signals' },
  { id: 'therapy', label: 'Coaching', description: 'Identify patterns and breakthroughs' },
  { id: 'lecture', label: 'Lecture', description: 'Extract key concepts and examples' },
  { id: 'casual', label: 'Casual', description: 'Remember what matters most' },
] as const;

export function IntentSelector({ value, onChange, disabled }: IntentSelectorProps) {
  return (
    <div className="intent-selector">
      <div className="intent-grid">
        {intents.map((intent) => (
          <button
            key={intent.id}
            onClick={() => onChange(intent.id as any)}
            disabled={disabled}
            className={`intent-card ${value === intent.id ? 'selected' : ''}`}
            role="radio"
            aria-checked={value === intent.id}
          >
            <span className="intent-label">{intent.label}</span>
            <span className="intent-description">{intent.description}</span>
          </button>
        ))}
      </div>
      <style jsx>{`
        .intent-selector {
          --color-bg-base: #0a0c0f;
          --color-bg-card: #13151a;
          --color-bg-card-hover: #1a1d24;
          --color-bg-selected: #0d1814;
          --color-border-default: #1f2229;
          --color-border-hover: #2d3139;
          --color-border-selected: #34c98f;
          --color-text-primary: #e8eaed;
          --color-text-secondary: #9aa0a6;
          --color-accent: #34c98f;
          --radius: 8px;
          --gap: 12px;
          max-width: 48rem;
          margin: 0 auto 2rem;
        }

        .intent-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--gap);
        }

        @media (min-width: 640px) {
          .intent-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .intent-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          padding: 16px;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius);
          cursor: pointer;
          transition: all 120ms ease-out;
          text-align: left;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        .intent-card:hover:not(:disabled) {
          background: var(--color-bg-card-hover);
          border-color: var(--color-border-hover);
        }

        .intent-card.selected {
          background: var(--color-bg-selected);
          border-color: var(--color-border-selected);
          border-width: 1.5px;
        }

        .intent-card:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .intent-label {
          font-size: 15px;
          font-weight: 600;
          line-height: 1.3;
          color: var(--color-text-primary);
          letter-spacing: -0.01em;
        }

        .intent-card.selected .intent-label {
          color: var(--color-accent);
        }

        .intent-description {
          font-size: 13px;
          font-weight: 400;
          line-height: 1.4;
          color: var(--color-text-secondary);
          letter-spacing: -0.005em;
        }

        @media (prefers-color-scheme: light) {
          .intent-selector {
            --color-bg-base: #ffffff;
            --color-bg-card: #f8f9fa;
            --color-bg-card-hover: #f1f3f4;
            --color-bg-selected: #e8f5f0;
            --color-border-default: #dadce0;
            --color-border-hover: #c4c7cc;
            --color-border-selected: #1e8e5e;
            --color-text-primary: #202124;
            --color-text-secondary: #5f6368;
            --color-accent: #1e8e5e;
          }
        }
      `}</style>
    </div>
  );
}
