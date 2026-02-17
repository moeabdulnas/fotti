import type { ZoneStats } from '../utils/stats';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useLanguage } from '@/hooks/LanguageContext';

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
  const { t } = useLanguage();
  const maxShots = Math.max(...zoneStats.map((z) => z.shots), 1);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle>{t('shotStatistics')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <span className="text-muted-foreground">{t('totalShots')}:</span>{' '}
            <span className="font-semibold">{totalShots}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('goals')}:</span>{' '}
            <span className="font-semibold text-evergreen-600 dark:text-evergreen-400">
              {totalGoals}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('conversion')}:</span>{' '}
            <span className="font-semibold">
              {totalShots > 0 ? ((totalGoals / totalShots) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="border-l pl-4">
            <span className="text-muted-foreground">{t('shotsAgainst')}:</span>{' '}
            <span className="font-semibold">{totalConceded}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('goalsAgainst')}:</span>{' '}
            <span className="font-semibold text-destructive">{totalConcededGoals}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2">
                <th className="text-left p-2">Zone</th>
                <th className="text-center p-2">{t('shotsFor')}</th>
                <th className="text-center p-2">{t('goals')}</th>
                <th className="text-center p-2">%</th>
                <th className="text-center p-2 border-l">{t('shotsAgainstTab')}</th>
                <th className="text-center p-2">{t('goals')}</th>
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
