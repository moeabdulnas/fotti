import type { ShotOutcome } from '../types';
import { useLanguage } from '@/hooks/LanguageContext';

interface OutcomeSelectorProps {
  onSelect: (outcome: ShotOutcome) => void;
  onCancel: () => void;
}

const OUTCOMES: {
  value: ShotOutcome;
  labelKey: 'goal' | 'onTarget' | 'offTarget' | 'blocked';
  color: string;
}[] = [
  { value: 'goal', labelKey: 'goal', color: '#22c55e' },
  { value: 'on_target', labelKey: 'onTarget', color: '#3b82f6' },
  { value: 'off_target', labelKey: 'offTarget', color: '#f59e0b' },
  { value: 'blocked', labelKey: 'blocked', color: '#ef4444' },
];

export function OutcomeSelector({ onSelect, onCancel }: OutcomeSelectorProps) {
  const { t } = useLanguage();

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
          {t(outcome.labelKey)}
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
        {t('cancel')}
      </button>
    </div>
  );
}
