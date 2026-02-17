import { useMemo, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMatch } from '@/hooks/useMatch';
import { useLanguage } from '@/hooks/LanguageContext';
import { calculateStats } from '@/utils/stats';

const OUTCOME_COLORS: Record<string, string> = {
  Goal: '#22c55e',
  'On Target': '#3b82f6',
  'Off Target': '#f59e0b',
  Blocked: '#ef4444',
};

const SHOT_FOR_COLOR = '#26d947';
const SHOT_AGAINST_COLOR = '#b847a3';

export function ChartsPanel() {
  const { currentMatch } = useMatch();
  const { t } = useLanguage();
  const chartRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    if (!currentMatch) return null;
    return calculateStats(currentMatch);
  }, [currentMatch]);

  const shotZoneData = useMemo(() => {
    if (!stats) return [];
    return stats.zoneStats
      .filter((z) => z.shots > 0)
      .map((z) => ({
        zone: `Zone ${z.zoneId}`,
        shots: z.shots,
      }))
      .sort((a, b) => b.shots - a.shots);
  }, [stats]);

  const concededZoneData = useMemo(() => {
    if (!stats) return [];
    return stats.zoneStats
      .filter((z) => z.conceded > 0)
      .map((z) => ({
        zone: `Zone ${z.zoneId}`,
        conceded: z.conceded,
      }))
      .sort((a, b) => b.conceded - a.conceded);
  }, [stats]);

  const shotOutcomeData = useMemo(() => {
    if (!currentMatch) return [];
    const shots = currentMatch.events.filter((e) => e.type === 'shot');
    const outcomeMap: Record<string, number> = {
      'On Target': 0,
      'Off Target': 0,
      Blocked: 0,
      Goal: 0,
    };
    shots.forEach((s) => {
      const shot = s as { outcome: string };
      switch (shot.outcome) {
        case 'on_target':
          outcomeMap['On Target']++;
          break;
        case 'off_target':
          outcomeMap['Off Target']++;
          break;
        case 'blocked':
          outcomeMap['Blocked']++;
          break;
        case 'goal':
          outcomeMap['Goal']++;
          break;
      }
    });
    return Object.entries(outcomeMap)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [currentMatch]);

  const concededOutcomeData = useMemo(() => {
    if (!currentMatch) return [];
    const conceded = currentMatch.events.filter((e) => e.type === 'conceded');
    const outcomeMap: Record<string, number> = {
      'On Target': 0,
      'Off Target': 0,
      Blocked: 0,
      Goal: 0,
    };
    conceded.forEach((s) => {
      const shot = s as { outcome: string };
      switch (shot.outcome) {
        case 'on_target':
          outcomeMap['On Target']++;
          break;
        case 'off_target':
          outcomeMap['Off Target']++;
          break;
        case 'blocked':
          outcomeMap['Blocked']++;
          break;
        case 'goal':
          outcomeMap['Goal']++;
          break;
      }
    });
    return Object.entries(outcomeMap)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [currentMatch]);

  const handleExportCSV = () => {
    if (!currentMatch || !stats) return;

    const rows = [
      ['Zone', 'Shots', 'Goals', 'Shots Conceded', 'Goals Conceded', 'Ball Losses', 'Recoveries'],
      ...stats.zoneStats.map((z) => [
        `Zone ${z.zoneId}`,
        z.shots,
        z.goals,
        z.conceded,
        z.concededGoals,
        z.ballLosses,
        z.recoveries,
      ]),
    ];

    const summaryRows = [
      [],
      ['Summary'],
      ['Total Shots', stats.totalShots],
      ['Total Goals', stats.totalGoals],
      ['Total Conceded', stats.totalConceded],
      ['Total Conceded Goals', stats.totalConcededGoals],
      ['Ball Losses', stats.totalBallLosses],
      ['Recoveries', stats.totalRecoveries],
    ];

    const csvContent = [...rows, ...summaryRows].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentMatch.homeTeam.name}-vs-${currentMatch.awayTeam.name}-stats.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportChartPng = async () => {
    if (!chartRef.current) return;

    try {
      const element = chartRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `${currentMatch?.homeTeam.name}-vs-${currentMatch?.awayTeam.name}-chart.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to export chart:', error);
    }
  };

  if (!currentMatch || !stats) return null;

  const hasShots = stats.totalShots > 0;
  const hasConceded = stats.totalConceded > 0;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{t('shotAnalysis')}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              {t('exportCsv')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportChartPng}>
              <Download className="h-4 w-4 mr-2" />
              {t('exportChartPng')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent ref={chartRef}>
        <Tabs defaultValue="shots" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="shots">{t('shotsFor')}</TabsTrigger>
            <TabsTrigger value="conceded">{t('shotsAgainstTab')}</TabsTrigger>
            <TabsTrigger value="outcomes">{t('shotOutcomes')}</TabsTrigger>
            <TabsTrigger value="zone-dist">{t('zoneDist')}</TabsTrigger>
          </TabsList>

          <TabsContent value="shots" className="mt-4">
            {hasShots ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shotZoneData} margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="shots" fill={SHOT_FOR_COLOR} name={t('shotsFor')} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {t('noShotsRecorded')}
              </div>
            )}
          </TabsContent>

          <TabsContent value="conceded" className="mt-4">
            {hasConceded ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={concededZoneData} margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="conceded" fill={SHOT_AGAINST_COLOR} name={t('shotsAgainstTab')} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {t('noShotsConceded')}
              </div>
            )}
          </TabsContent>

          <TabsContent value="outcomes" className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2 text-center">{t('shotsFor')}</h4>
                {shotOutcomeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={shotOutcomeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        dataKey="value"
                        label={({ name, percent = 0 }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {shotOutcomeData.map((entry) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={OUTCOME_COLORS[entry.name] || '#6b7280'}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    {t('noShots')}
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2 text-center">{t('shotsAgainstTab')}</h4>
                {concededOutcomeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={concededOutcomeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        dataKey="value"
                        label={({ name, percent = 0 }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {concededOutcomeData.map((entry) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={OUTCOME_COLORS[entry.name] || '#6b7280'}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    {t('noShotsAgainst')}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="zone-dist" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.zoneStats} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="zoneId" type="category" width={70} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="shots" fill={SHOT_FOR_COLOR} name={t('shotsFor')} />
                <Bar dataKey="conceded" fill={SHOT_AGAINST_COLOR} name={t('shotsAgainstTab')} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
