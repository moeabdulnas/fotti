import { useMemo, useRef, useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Pitch } from '@/components/Pitch';
import { ZONES } from '@/utils/zones';
import { useMatch } from '@/hooks/useMatch';
import { useLanguage } from '@/hooks/LanguageContext';
import { calculateStats } from '@/utils/stats';

type ChartTab = 'shots' | 'conceded' | 'outcomes' | 'zone-dist' | 'ball-losses' | 'recoveries';

const OUTCOME_COLORS: Record<string, string> = {
  Goal: '#22c55e',
  'On Target': '#3b82f6',
  'Off Target': '#f59e0b',
  Blocked: '#ef4444',
};

const SHOT_FOR_COLOR = '#26d947';
const SHOT_AGAINST_COLOR = '#b847a3';

const EXPORT_WIDTH = 800;
const EXPORT_HEIGHT = 380;

import { type ZoneStats } from '@/utils/stats';

function HeatmapPitch({ data, total, dataKey, color }: { data: ZoneStats[], total: number, dataKey: keyof ZoneStats, color: string }) {
  return (
    <div className="flex justify-center mt-4 mb-4">
      <Pitch width={600} height={420} showZones={true} showZoneNumbers={false}>
        {ZONES.map((zone) => {
          const zoneStat = data.find((d) => d.zoneId === zone.id);
          const value = zoneStat ? Number(zoneStat[dataKey]) : 0;
          const percentage = total > 0 ? (value / total) * 100 : 0;
          
          if (value === 0) return null;
          
          const pitchUnit = Math.min(600 / 100, 420 / 70);
          const pitchWidth = pitchUnit * 100;
          const pitchHeight = pitchUnit * 70;
          const offsetX = (600 - pitchWidth) / 2;
          const offsetY = (420 - pitchHeight) / 2;
          
          const x = offsetX + (zone.x / 100) * pitchWidth;
          const y = offsetY + (zone.y / 100) * pitchHeight;
          const width = (zone.width / 100) * pitchWidth;
          const height = (zone.height / 100) * pitchHeight;
          
          const fillOpacity = Math.max(0.1, percentage / 100);
          const rgbMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
          let rgbaColor = `rgba(255, 255, 255, ${fillOpacity})`;
          if (rgbMatch) {
            const r = parseInt(rgbMatch[1], 16);
            const g = parseInt(rgbMatch[2], 16);
            const b = parseInt(rgbMatch[3], 16);
            rgbaColor = `rgba(${r}, ${g}, ${b}, ${fillOpacity})`;
          } else if (color.startsWith('rgb')) {
             // Basic support for rgb/rgba strings if provided
             rgbaColor = color.replace(')', `, ${fillOpacity})`).replace('rgb(', 'rgba(');
          }
          
          return (
            <g key={`heatmap-${zone.id}`}>
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={rgbaColor}
                style={{ pointerEvents: 'none' }}
              />
              <text
                x={x + width / 2}
                y={y + height / 2 - 8}
                fill="white"
                fontSize={14}
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ pointerEvents: 'none', textShadow: '1px 1px 2px black' }}
              >
                {percentage.toFixed(1)}%
              </text>
              <text
                x={x + width / 2}
                y={y + height / 2 + 8}
                fill="white"
                fontSize={12}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ pointerEvents: 'none', textShadow: '1px 1px 2px black' }}
              >
                ({value})
              </text>
            </g>
          );
        })}
      </Pitch>
    </div>
  );
}

export function ChartsPanel() {
  const { currentMatch } = useMatch();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ChartTab>('shots');
  const [viewType, setViewType] = useState<'chart' | 'pitch'>('chart');
  const exportRef = useRef<HTMLDivElement>(null);

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

  const ballLossesZoneData = useMemo(() => {
    if (!stats) return [];
    return stats.zoneStats
      .filter((z) => z.ballLosses > 0)
      .map((z) => ({
        zone: `Zone ${z.zoneId}`,
        ballLosses: z.ballLosses,
      }))
      .sort((a, b) => b.ballLosses - a.ballLosses);
  }, [stats]);

  const recoveriesZoneData = useMemo(() => {
    if (!stats) return [];
    return stats.zoneStats
      .filter((z) => z.recoveries > 0)
      .map((z) => ({
        zone: `Zone ${z.zoneId}`,
        recoveries: z.recoveries,
      }))
      .sort((a, b) => b.recoveries - a.recoveries);
  }, [stats]);

  const shotOutcomeData = useMemo(() => {
    if (!currentMatch) return [];
    
    // First, isolate all 'shot' events to calculate their specific outcomes.
    // We filter out conceding events, ball losses, and recoveries.
    const shots = currentMatch.events.filter((e) => e.type === 'shot');
    
    // Initialize a tally map tracking the four possible shot outcomes.
    // We structure this with capitalized keys so the names display correctly in charts.
    const outcomeMap: Record<string, number> = {
      'On Target': 0,
      'Off Target': 0,
      Blocked: 0,
      Goal: 0,
    };
    
    // Accumulate the tallies based on the 'outcome' property string.
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
    
    // Recharts expects an array of objects ({name, value}), not a dictionary record.
    // We convert the dictionary into a tuple array using Object.entries, 
    // filter out any outcomes with a value of 0 to declutter the pie chart, 
    // and map it into the Recharts `{name, value}` structure.
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

  const chartTitleByTab: Record<ChartTab, string> = {
    shots: t('shotsFor'),
    conceded: t('shotsAgainstTab'),
    outcomes: t('shotOutcomes'),
    'zone-dist': t('zoneDist'),
    'ball-losses': t('ballLosses'),
    recoveries: t('recoveries'),
  };

  const handleExportChartPng = async () => {
    if (!exportRef.current) return;

    try {
      // html2canvas takes a DOM element and essentially "takes a screenshot" of it, 
      // rendering it onto a virtual HTML5 Canvas. We pass scale: 2 for a higher resolution 
      // output, and ensure the background is solid white instead of transparent.
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // To trigger a download, we create a phantom <a> tag dynamically.
      const link = document.createElement('a');
      link.download = `${currentMatch?.homeTeam.name}-vs-${currentMatch?.awayTeam.name}-chart.png`;
      
      // Convert the rendered canvas into a base64 Data URL (image/png) and set it as the link's href.
      link.href = canvas.toDataURL('image/png');
      
      // Programmatically click the link to initiate the browser's download dialog, 
      // and let the browser handle saving the image file.
      link.click();
    } catch (error) {
      console.error('Failed to export chart:', error);
    }
  };

  if (!currentMatch || !stats) return null;

  const hasShots = stats.totalShots > 0;
  const hasConceded = stats.totalConceded > 0;
  const hasBallLosses = stats.totalBallLosses > 0;
  const hasRecoveries = stats.totalRecoveries > 0;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>{t('analysis')}</CardTitle>
            <div className="flex items-center space-x-2 border-l pl-4 ml-2 border-border">
              <Switch 
                id="view-type" 
                checked={viewType === 'pitch'} 
                onCheckedChange={(c) => setViewType(c ? 'pitch' : 'chart')} 
              />
              <Label htmlFor="view-type">
                {viewType === 'pitch' ? t('pitchView') || 'Pitch View' : t('chartView') || 'Chart View'}
              </Label>
            </div>
          </div>
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
      <CardContent>
        {/* Off-screen container for PNG export: current chart name (centered) + chart only */}
        <div
          ref={exportRef}
          style={{
            position: 'fixed',
            left: '-9999px',
            top: 0,
            width: EXPORT_WIDTH,
            minHeight: EXPORT_HEIGHT,
            padding: 24,
            backgroundColor: '#ffffff',
            boxSizing: 'border-box',
          }}
        >
          <h2
            style={{
              textAlign: 'center',
              margin: 0,
              marginBottom: 16,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            {chartTitleByTab[activeTab]}
          </h2>
          {activeTab === 'shots' && hasShots && (
            viewType === 'chart' ? (
              <BarChart
                width={EXPORT_WIDTH - 48}
                height={300}
                data={shotZoneData}
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="shots" fill={SHOT_FOR_COLOR} name={t('shotsFor')} />
              </BarChart>
            ) : (
              <HeatmapPitch data={stats.zoneStats} total={stats.totalShots} dataKey="shots" color={SHOT_FOR_COLOR} />
            )
          )}
          {activeTab === 'conceded' && hasConceded && (
            viewType === 'chart' ? (
              <BarChart
                width={EXPORT_WIDTH - 48}
                height={300}
                data={concededZoneData}
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="conceded" fill={SHOT_AGAINST_COLOR} name={t('shotsAgainstTab')} />
              </BarChart>
            ) : (
              <HeatmapPitch data={stats.zoneStats} total={stats.totalConceded} dataKey="conceded" color={SHOT_AGAINST_COLOR} />
            )
          )}
          {activeTab === 'ball-losses' && hasBallLosses && (
            viewType === 'chart' ? (
              <BarChart
                width={EXPORT_WIDTH - 48}
                height={300}
                data={ballLossesZoneData}
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ballLosses" fill="#f59e0b" name={t('ballLosses')} />
              </BarChart>
            ) : (
              <HeatmapPitch data={stats.zoneStats} total={stats.totalBallLosses} dataKey="ballLosses" color="#f59e0b" />
            )
          )}
          {activeTab === 'recoveries' && hasRecoveries && (
            viewType === 'chart' ? (
              <BarChart
                width={EXPORT_WIDTH - 48}
                height={300}
                data={recoveriesZoneData}
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="recoveries" fill="#3b82f6" name={t('recoveries')} />
              </BarChart>
            ) : (
              <HeatmapPitch data={stats.zoneStats} total={stats.totalRecoveries} dataKey="recoveries" color="#3b82f6" />
            )
          )}
          {activeTab === 'outcomes' && (
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
              {shotOutcomeData.length > 0 && (
                <div>
                  <h4 style={{ textAlign: 'center', marginBottom: 8, fontSize: 14 }}>
                    {t('shotsFor')}
                  </h4>
                  <PieChart width={280} height={250} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <Pie
                      data={shotOutcomeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
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
                </div>
              )}
              {concededOutcomeData.length > 0 && (
                <div>
                  <h4 style={{ textAlign: 'center', marginBottom: 8, fontSize: 14 }}>
                    {t('shotsAgainstTab')}
                  </h4>
                  <PieChart width={280} height={250} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <Pie
                      data={concededOutcomeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
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
                </div>
              )}
            </div>
          )}
          {activeTab === 'zone-dist' && (
            viewType === 'chart' ? (
              <BarChart
                width={EXPORT_WIDTH - 48}
                height={300}
                data={stats.zoneStats}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="zoneId" type="category" width={70} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="shots" fill={SHOT_FOR_COLOR} name={t('shotsFor')} />
                <Bar dataKey="conceded" fill={SHOT_AGAINST_COLOR} name={t('shotsAgainstTab')} />
                <Bar dataKey="ballLosses" fill="#f59e0b" name={t('ballLosses')} />
                <Bar dataKey="recoveries" fill="#3b82f6" name={t('recoveries')} />
              </BarChart>
            ) : (
              <div style={{ textAlign: 'center', marginTop: 40, color: '#6b7280' }}>
                {t('pitchViewNotAvailable')}
              </div>
            )
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ChartTab)} className="w-full">
          <TabsList className="flex flex-wrap w-full h-auto">
            <TabsTrigger value="shots" className="flex-1 min-w-[100px]">{t('shotsFor')}</TabsTrigger>
            <TabsTrigger value="conceded" className="flex-1 min-w-[100px]">{t('shotsAgainstTab')}</TabsTrigger>
            <TabsTrigger value="ball-losses" className="flex-1 min-w-[100px]">{t('ballLosses')}</TabsTrigger>
            <TabsTrigger value="recoveries" className="flex-1 min-w-[100px]">{t('recoveries')}</TabsTrigger>
            <TabsTrigger value="outcomes" className="flex-1 min-w-[100px]">{t('shotOutcomes')}</TabsTrigger>
            <TabsTrigger value="zone-dist" className="flex-1 min-w-[100px]">{t('zoneDist')}</TabsTrigger>
          </TabsList>

          <TabsContent value="shots" className="mt-4">
            {hasShots ? (
              viewType === 'chart' ? (
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
                <HeatmapPitch data={stats.zoneStats} total={stats.totalShots} dataKey="shots" color={SHOT_FOR_COLOR} />
              )
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {t('noShotsRecorded')}
              </div>
            )}
          </TabsContent>

          <TabsContent value="conceded" className="mt-4">
            {hasConceded ? (
              viewType === 'chart' ? (
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
                <HeatmapPitch data={stats.zoneStats} total={stats.totalConceded} dataKey="conceded" color={SHOT_AGAINST_COLOR} />
              )
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
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <Pie
                        data={shotOutcomeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
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
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    {t('noShots')}
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2 text-center">{t('shotsAgainstTab')}</h4>
                {concededOutcomeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <Pie
                        data={concededOutcomeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
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
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    {t('noShotsAgainst')}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="zone-dist" className="mt-4">
            {viewType === 'chart' ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.zoneStats} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="zoneId" type="category" width={70} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="shots" fill={SHOT_FOR_COLOR} name={t('shotsFor')} />
                  <Bar dataKey="conceded" fill={SHOT_AGAINST_COLOR} name={t('shotsAgainstTab')} />
                  <Bar dataKey="ballLosses" fill="#f59e0b" name={t('ballLosses')} />
                  <Bar dataKey="recoveries" fill="#3b82f6" name={t('recoveries')} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-center px-4">
                {t('pitchViewNotAvailable')}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ball-losses" className="mt-4">
            {hasBallLosses ? (
              viewType === 'chart' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ballLossesZoneData} margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="ballLosses" fill="#f59e0b" name={t('ballLosses')} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <HeatmapPitch data={stats.zoneStats} total={stats.totalBallLosses} dataKey="ballLosses" color="#f59e0b" />
              )
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {t('noBallLossesRecorded')}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recoveries" className="mt-4">
            {hasRecoveries ? (
              viewType === 'chart' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={recoveriesZoneData} margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="recoveries" fill="#3b82f6" name={t('recoveries')} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <HeatmapPitch data={stats.zoneStats} total={stats.totalRecoveries} dataKey="recoveries" color="#3b82f6" />
              )
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {t('noRecoveriesRecorded')}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
