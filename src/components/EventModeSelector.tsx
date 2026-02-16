export type EventMode = 'shot' | 'conceded' | 'ball_loss' | 'recovery';

interface EventModeSelectorProps {
  mode: EventMode;
  onModeChange: (mode: EventMode) => void;
}

const MODES: { value: EventMode; label: string; color: string }[] = [
  { value: 'shot', label: 'Shots For', color: '#3b82f6' },
  { value: 'conceded', label: 'Shots Against', color: '#ef4444' },
  { value: 'ball_loss', label: 'Ball Loss', color: '#f97316' },
  { value: 'recovery', label: 'Recovery', color: '#8b5cf6' },
];

export function EventModeSelector({ mode, onModeChange }: EventModeSelectorProps) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      {MODES.map((m) => (
        <button
          key={m.value}
          onClick={() => onModeChange(m.value)}
          style={{
            padding: '8px 16px',
            background: mode === m.value ? m.color : '#e5e7eb',
            color: mode === m.value ? 'white' : '#374151',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: mode === m.value ? 'bold' : 'normal',
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
