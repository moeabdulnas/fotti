import { useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMatch } from '@/hooks/useMatch';
import { calculateStats } from '@/utils/stats';

const COLORS = ['#26d947', '#1fad39', '#17822b', '#659a69', '#4eb649', '#3f923a'];

export function ChartsPanel() {
  const { currentMatch } = useMatch();

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
      Missed: 0,
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
        case 'missed':
          outcomeMap['Missed']++;
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
      Missed: 0,
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
        case 'missed':
          outcomeMap['Missed']++;
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

  if (!currentMatch || !stats) return null;

  const hasShots = stats.totalShots > 0;
  const hasConceded = stats.totalConceded > 0;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Shot Analysis</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="shots" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="shots">Shots For</TabsTrigger>
            <TabsTrigger value="conceded">Shots Against</TabsTrigger>
            <TabsTrigger value="outcomes">Shot Outcomes</TabsTrigger>
            <TabsTrigger value="zone-dist">Zone Dist.</TabsTrigger>
          </TabsList>

          <TabsContent value="shots" className="mt-4">
            {hasShots ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shotZoneData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="shots" fill="#26d947" name="Shots" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No shots recorded yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="conceded" className="mt-4">
            {hasConceded ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={concededZoneData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="conceded" fill="#b847a3" name="Shots Conceded" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No shots conceded recorded yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="outcomes" className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2 text-center">Shots For</h4>
                {shotOutcomeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={shotOutcomeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {shotOutcomeData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    No shots
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2 text-center">Shots Against</h4>
                {concededOutcomeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={concededOutcomeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {concededOutcomeData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    No shots against
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="zone-dist" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.zoneStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="zoneId" type="category" width={60} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="shots" fill="#26d947" name="Shots For" />
                <Bar dataKey="conceded" fill="#b847a3" name="Shots Against" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
