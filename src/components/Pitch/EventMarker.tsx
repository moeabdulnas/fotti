import type { MatchEvent, ShotEvent, ConcededEvent } from '../../types';

interface EventMarkerProps {
  event: MatchEvent;
  width: number;
  height: number;
}

const SHOT_OUTCOME_COLORS: Record<ShotEvent['outcome'], string> = {
  goal: '#22c55e',
  on_target: '#3b82f6',
  off_target: '#f59e0b',
  blocked: '#ef4444',
};

export function EventMarker({ event, width, height }: EventMarkerProps) {
  const pitchUnit = Math.min(width / 100, height / 70);
  const pitchWidth = pitchUnit * 100;
  const pitchHeight = pitchUnit * 70;
  const offsetX = (width - pitchWidth) / 2;
  const offsetY = (height - pitchHeight) / 2;

  // Position with offset (children rendered outside the transformed group)
  const x = offsetX + (event.position.x / 100) * pitchWidth;
  const y = offsetY + (event.position.y / 100) * pitchHeight;

  const isShot = event.type === 'shot' || event.type === 'conceded';
  const outcome = isShot ? (event as ShotEvent | ConcededEvent).outcome : null;

  let fill: string;
  let marker: 'circle' | 'square' | 'triangle' = 'circle';

  switch (event.type) {
    case 'shot':
      fill = outcome ? SHOT_OUTCOME_COLORS[outcome] : '#3b82f6';
      break;
    case 'conceded':
      fill = outcome ? SHOT_OUTCOME_COLORS[outcome] : '#ef4444';
      break;
    case 'ball_loss':
      fill = '#f97316';
      marker = 'square';
      break;
    case 'recovery':
      fill = '#8b5cf6';
      marker = 'triangle';
      break;
    default:
      fill = '#6b7280';
  }

  const title = `${event.type}${outcome ? ` - ${outcome}` : ''} - Zone ${event.zone}`;

  if (marker === 'square') {
    const size = pitchUnit * 1.2;
    return (
      <rect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        fill={fill}
        stroke="white"
        strokeWidth={2}
        style={{ cursor: 'pointer' }}
      >
        <title>{title}</title>
      </rect>
    );
  }

  if (marker === 'triangle') {
    const size = pitchUnit * 1.4;
    return (
      <polygon
        points={`${x},${y - size / 2} ${x - size / 2},${y + size / 2} ${x + size / 2},${y + size / 2}`}
        fill={fill}
        stroke="white"
        strokeWidth={2}
        style={{ cursor: 'pointer' }}
      >
        <title>{title}</title>
      </polygon>
    );
  }

  return (
    <circle
      cx={x}
      cy={y}
      r={pitchUnit * 0.8}
      fill={fill}
      stroke="white"
      strokeWidth={2}
      style={{ cursor: 'pointer' }}
    >
      <title>{title}</title>
    </circle>
  );
}
