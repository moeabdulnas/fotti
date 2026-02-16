import type { ZoneStats } from '../utils/stats';

interface StatsTableProps {
  zoneStats: ZoneStats[];
  totalShots: number;
  totalGoals: number;
}

export function StatsTable({ zoneStats, totalShots, totalGoals }: StatsTableProps) {
  const maxShots = Math.max(...zoneStats.map((z) => z.shots), 1);

  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ marginBottom: '10px', fontWeight: 'bold' }}>Shot Statistics</h3>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
        <div>
          <strong>Total Shots:</strong> {totalShots}
        </div>
        <div>
          <strong>Goals:</strong> {totalGoals}
        </div>
        <div>
          <strong>Conversion:</strong>{' '}
          {totalShots > 0 ? ((totalGoals / totalShots) * 100).toFixed(1) : 0}%
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>Zone</th>
            <th style={{ textAlign: 'center', padding: '8px' }}>Shots</th>
            <th style={{ textAlign: 'center', padding: '8px' }}>Goals</th>
            <th style={{ textAlign: 'center', padding: '8px' }}>%</th>
          </tr>
        </thead>
        <tbody>
          {zoneStats.map((zone) => (
            <tr
              key={zone.zoneId}
              style={{
                borderBottom: '1px solid #eee',
                background: zone.shots === maxShots && maxShots > 0 ? '#fef3c7' : 'transparent',
              }}
            >
              <td style={{ padding: '8px' }}>Zone {zone.zoneId}</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>{zone.shots}</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>{zone.goals}</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>
                {zone.shots > 0 ? ((zone.goals / zone.shots) * 100).toFixed(0) : 0}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
