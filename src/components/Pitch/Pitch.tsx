import { useId, forwardRef } from 'react';
import { ZONES } from '../../utils/zones';

interface PitchProps {
  width?: number;
  height?: number;
  showZones?: boolean;
  showZoneNumbers?: boolean;
  onClick?: (x: number, y: number) => void;
  children?: React.ReactNode;
}

export const Pitch = forwardRef<SVGSVGElement, PitchProps>(function Pitch(
  { width = 800, height = 520, showZones = false, showZoneNumbers = false, onClick, children },
  ref
) {
  const patternId = useId();
  const pitchUnit = Math.min(width / 100, height / 70);

  const pitchWidth = pitchUnit * 100;
  const pitchHeight = pitchUnit * 70;
  const offsetX = (width - pitchWidth) / 2;
  const offsetY = (height - pitchHeight) / 2;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onClick) return;
    const svg = e.currentTarget;
    // Use SVG API to convert screen coords to viewBox coords (handles letterboxing / preserveAspectRatio)
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const screenCTM = svg.getScreenCTM();
    if (!screenCTM) return;
    const { x: viewBoxX, y: viewBoxY } = pt.matrixTransform(screenCTM.inverse());
    const clickX = ((viewBoxX - offsetX) / pitchWidth) * 100;
    const clickY = ((viewBoxY - offsetY) / pitchHeight) * 100;
    if (clickX >= 0 && clickX <= 100 && clickY >= 0 && clickY <= 100) {
      onClick(clickX, clickY);
    }
  };

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      onClick={handleClick}
      style={{ cursor: onClick ? 'crosshair' : 'default' }}
    >
      <defs>
        <pattern id={patternId} width={pitchUnit} height={pitchUnit} patternUnits="userSpaceOnUse">
          <rect width={pitchUnit} height={pitchUnit} fill="#4a7c59" />
        </pattern>
      </defs>

      <rect
        x={offsetX}
        y={offsetY}
        width={pitchWidth}
        height={pitchHeight}
        fill={`url(#${patternId})`}
        stroke="white"
        strokeWidth={2}
      />

      <g transform={`translate(${offsetX}, ${offsetY})`}>
        {showZones &&
          ZONES.map((zone) => (
            <rect
              key={zone.id}
              x={(zone.x / 100) * pitchWidth}
              y={(zone.y / 100) * pitchHeight}
              width={(zone.width / 100) * pitchWidth}
              height={(zone.height / 100) * pitchHeight}
              fill="rgba(255, 255, 255, 0.2)"
              stroke="white"
              strokeWidth={1}
              strokeDasharray="4"
              style={{ pointerEvents: 'none' }}
            />
          ))}

        {showZoneNumbers &&
          ZONES.map((zone) => (
            <text
              key={`num-${zone.id}`}
              x={((zone.x + zone.width / 2) / 100) * pitchWidth}
              y={((zone.y + zone.height / 2) / 100) * pitchHeight}
              fill="rgba(255, 255, 255, 0.5)"
              fontSize={Math.min(pitchWidth, pitchHeight) / 20}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ pointerEvents: 'none' }}
            >
              {zone.id}
            </text>
          ))}

        <line
          x1={pitchWidth / 2}
          y1={0}
          x2={pitchWidth / 2}
          y2={pitchHeight}
          stroke="white"
          strokeWidth={2}
        />

        <circle
          cx={pitchWidth / 2}
          cy={pitchHeight / 2}
          r={pitchUnit * 9.15}
          fill="none"
          stroke="white"
          strokeWidth={2}
        />

        <circle cx={pitchWidth / 2} cy={pitchHeight / 2} r={pitchUnit} fill="white" />

        <rect
          x={0}
          y={(pitchHeight - pitchUnit * 40.32) / 2}
          width={pitchUnit * 16.5}
          height={pitchUnit * 40.32}
          fill="none"
          stroke="white"
          strokeWidth={2}
        />

        <rect
          x={0}
          y={(pitchHeight - pitchUnit * 18.32) / 2}
          width={pitchUnit * 5.5}
          height={pitchUnit * 18.32}
          fill="none"
          stroke="white"
          strokeWidth={2}
        />

        <circle cx={pitchUnit * 11} cy={pitchHeight / 2} r={pitchUnit} fill="white" />

        <rect
          x={pitchWidth - pitchUnit * 16.5}
          y={(pitchHeight - pitchUnit * 40.32) / 2}
          width={pitchUnit * 16.5}
          height={pitchUnit * 40.32}
          fill="none"
          stroke="white"
          strokeWidth={2}
        />

        <rect
          x={pitchWidth - pitchUnit * 5.5}
          y={(pitchHeight - pitchUnit * 18.32) / 2}
          width={pitchUnit * 5.5}
          height={pitchUnit * 18.32}
          fill="none"
          stroke="white"
          strokeWidth={2}
        />

        <circle cx={pitchWidth - pitchUnit * 11} cy={pitchHeight / 2} r={pitchUnit} fill="white" />
      </g>

      {children}
    </svg>
  );
});
