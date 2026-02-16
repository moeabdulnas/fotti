import type { ShotOutcome } from '../types';

interface OutcomeSelectorProps {
  onSelect: (outcome: ShotOutcome) => void;
  onCancel: () => void;
}

const OUTCOMES: { value: ShotOutcome; label: string; color: string }[] = [
  { value: 'goal', label: 'Goal', color: '#22c55e' },
  { value: 'on_target', label: 'On Target', color: '#3b82f6' },
  { value: 'off_target', label: 'Off Target', color: '#f59e0b' },
  { value: 'blocked', label: 'Blocked', color: '#ef4444' },
  { value: 'missed', label: 'Missed', color: '#6b7280' },
];

export function OutcomeSelector({ onSelect, onCancel }: OutcomeSelectorProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        padding: '12px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 100,
      }}
    >
      {OUTCOMES.map((outcome) => (
        <button
          key={outcome.value}
          onClick={() => onSelect(outcome.value)}
          style={{
            padding: '8px 16px',
            background: outcome.color,
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {outcome.label}
        </button>
      ))}
      <button
        onClick={onCancel}
        style={{
          padding: '8px 16px',
          background: '#e5e7eb',
          color: '#374151',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Cancel
      </button>
    </div>
  );
}
