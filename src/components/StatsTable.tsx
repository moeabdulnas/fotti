import type { ZoneStats } from '../utils/stats';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface StatsTableProps {
  zoneStats: ZoneStats[];
  totalShots: number;
  totalGoals: number;
  totalConceded: number;
  totalConcededGoals: number;
}

export function StatsTable({
  zoneStats,
  totalShots,
  totalGoals,
  totalConceded,
  totalConcededGoals,
}: StatsTableProps) {
  const maxShots = Math.max(...zoneStats.map((z) => z.shots), 1);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle>Shot Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <span className="text-muted-foreground">Total Shots:</span>{' '}
            <span className="font-semibold">{totalShots}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Goals:</span>{' '}
            <span className="font-semibold text-evergreen-600 dark:text-evergreen-400">
              {totalGoals}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Conversion:</span>{' '}
            <span className="font-semibold">
              {totalShots > 0 ? ((totalGoals / totalShots) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="border-l pl-4">
            <span className="text-muted-foreground">Shots Against:</span>{' '}
            <span className="font-semibold">{totalConceded}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Goals Against:</span>{' '}
            <span className="font-semibold text-destructive">{totalConcededGoals}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2">
                <th className="text-left p-2">Zone</th>
                <th className="text-center p-2">Shots</th>
                <th className="text-center p-2">Goals</th>
                <th className="text-center p-2">%</th>
                <th className="text-center p-2 border-l">Conceded</th>
                <th className="text-center p-2">Goals</th>
              </tr>
            </thead>
            <tbody>
              {zoneStats.map((zone) => (
                <tr
                  key={zone.zoneId}
                  className="border-b"
                  style={{
                    backgroundColor:
                      zone.shots === maxShots && maxShots > 0
                        ? 'rgba(254, 243, 199, 0.3)'
                        : 'transparent',
                  }}
                >
                  <td className="p-2">Zone {zone.zoneId}</td>
                  <td className="text-center p-2">{zone.shots}</td>
                  <td className="text-center p-2">{zone.goals}</td>
                  <td className="text-center p-2">
                    {zone.shots > 0 ? ((zone.goals / zone.shots) * 100).toFixed(0) : 0}%
                  </td>
                  <td className="text-center p-2 border-l">{zone.conceded}</td>
                  <td className="text-center p-2">{zone.concededGoals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
