import { useEffect, useRef } from 'react';

export type EventMode = 'shot' | 'conceded' | 'ball_loss' | 'recovery';

interface EventModeSelectorProps {
  mode: EventMode;
  onModeChange: (mode: EventMode) => void;
}

const MODES: { value: EventMode; label: string; color: string; key: string }[] = [
  { value: 'shot', label: 'Shots For', color: '#3b82f6', key: '1' },
  { value: 'conceded', label: 'Shots Against', color: '#ef4444', key: '2' },
  { value: 'ball_loss', label: 'Ball Loss', color: '#f97316', key: '3' },
  { value: 'recovery', label: 'Recovery', color: '#8b5cf6', key: '4' },
];

export function EventModeSelector({ mode, onModeChange }: EventModeSelectorProps) {
  const onModeChangeRef = useRef(onModeChange);
  onModeChangeRef.current = onModeChange;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4') {
        const index = parseInt(e.key) - 1;
        onModeChangeRef.current(MODES[index].value);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }} key={mode}>
      {MODES.map((m) => {
        const isSelected = mode === m.value;
        return (
          <button
            key={m.value}
            onClick={() => onModeChangeRef.current(m.value)}
            style={{
              padding: '8px 16px',
              background: isSelected ? m.color : '#e5e7eb',
              color: isSelected ? 'white' : '#374151',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: isSelected ? 'bold' : 'normal',
            }}
          >
            {m.label} ({m.key})
          </button>
        );
      })}
    </div>
  );
}
