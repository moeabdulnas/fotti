import { useState, useRef, useMemo } from 'react';
import { Pitch } from './components/Pitch';
import { EventMarker } from './components/Pitch/EventMarker';
import { OutcomeSelector } from './components/OutcomeSelector';
import { EventModeSelector, type EventMode } from './components/EventModeSelector';
import { StatsTable } from './components/StatsTable';
import { MatchProvider } from './hooks/MatchContext';
import { useMatch } from './hooks/useMatch';
import { ThemeProvider } from './hooks/ThemeContext';
import { calculateStats } from './utils/stats';
import { exportToPng } from './utils/export';
import type { ShotOutcome, MatchEvent } from './types';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader } from './components/ui/card';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';
import { ThemeToggle } from './components/ThemeToggle';
import { TeamEditor } from './components/TeamEditor';
import { ChartsPanel } from './components/ChartsPanel';
import { Plus } from 'lucide-react';

function MatchEditor() {
  const {
    currentMatch,
    createNewMatch,
    addShot,
    addConceded,
    addBallLoss,
    addRecovery,
    undoLastEvent,
    clearMatch,
    getMatches,
    loadMatch,
  } = useMatch();
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);
  const [eventMode, setEventMode] = useState<EventMode>('shot');
  const [showZones, setShowZones] = useState(true);
  const [showZoneNumbers, setShowZoneNumbers] = useState(false);
  const pitchRef = useRef<SVGSVGElement>(null);

  const stats = useMemo(() => {
    if (!currentMatch) return null;
    return calculateStats(currentMatch);
  }, [currentMatch]);

  const handlePitchClick = (x: number, y: number) => {
    if (eventMode === 'shot' || eventMode === 'conceded') {
      setPendingPosition({ x, y });
    } else if (eventMode === 'ball_loss') {
      addBallLoss(x, y);
    } else if (eventMode === 'recovery') {
      addRecovery(x, y);
    }
  };

  const handleOutcomeSelect = (outcome: ShotOutcome) => {
    if (pendingPosition) {
      if (eventMode === 'shot') {
        addShot(pendingPosition.x, pendingPosition.y, outcome);
      } else if (eventMode === 'conceded') {
        addConceded(pendingPosition.x, pendingPosition.y, outcome);
      }
      setPendingPosition(null);
    }
  };

  const handleCancel = () => {
    setPendingPosition(null);
  };

  const handleExport = () => {
    if (pitchRef.current && currentMatch) {
      const filename = `${currentMatch.homeTeam.name}-vs-${currentMatch.awayTeam.name}`
        .replace(/\s+/g, '-')
        .toLowerCase();
      exportToPng(pitchRef.current, `${filename}.png`);
    }
  };

  const handleNewMatch = () => {
    createNewMatch({ id: 'home', name: 'Home Team' }, { id: 'away', name: 'Away Team' });
  };

  const existingMatches = getMatches();

  if (!currentMatch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-evergreen-600 dark:text-evergreen-400">
            Fotti
          </h1>
          <p className="text-muted-foreground">Football Pitch Analyzer</p>
        </div>
        <Button onClick={handleNewMatch} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Create New Match
        </Button>
        {existingMatches.length > 0 && (
          <div className="mt-8 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-center">Previous Matches</h3>
            <div className="flex flex-col gap-2">
              {existingMatches
                .slice(-5)
                .reverse()
                .map((m) => (
                  <Button
                    key={m.id}
                    variant="outline"
                    onClick={() => loadMatch(m.id)}
                    className="justify-start"
                  >
                    {m.date} - {m.homeTeam.name} vs {m.awayTeam.name}
                    <span className="ml-auto text-muted-foreground text-xs">
                      {m.events.length} events
                    </span>
                  </Button>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {currentMatch.homeTeam.name} vs {currentMatch.awayTeam.name}
            </h1>
            <span className="text-sm text-muted-foreground">{currentMatch.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        <TeamEditor />

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="show-zones" checked={showZones} onCheckedChange={setShowZones} />
                  <Label htmlFor="show-zones">Show Zones</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-zone-numbers"
                    checked={showZoneNumbers}
                    onCheckedChange={setShowZoneNumbers}
                    disabled={!showZones}
                  />
                  <Label htmlFor="show-zone-numbers">Zone Numbers</Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  Export PNG
                </Button>
                <Button variant="outline" size="sm" onClick={undoLastEvent}>
                  Undo
                </Button>
                <Button variant="destructive" size="sm" onClick={clearMatch}>
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <EventModeSelector mode={eventMode} onModeChange={setEventMode} />
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Pitch
            ref={pitchRef}
            width={800}
            height={520}
            showZones={showZones}
            showZoneNumbers={showZoneNumbers}
            onClick={handlePitchClick}
          >
            {currentMatch.events.map((event: MatchEvent) => (
              <EventMarker key={event.id} event={event} width={800} height={520} />
            ))}
          </Pitch>
        </div>

        {stats && (
          <StatsTable
            zoneStats={stats.zoneStats}
            totalShots={stats.totalShots}
            totalGoals={stats.totalGoals}
            totalConceded={stats.totalConceded}
            totalConcededGoals={stats.totalConcededGoals}
          />
        )}

        <ChartsPanel />

        {pendingPosition && (eventMode === 'shot' || eventMode === 'conceded') && (
          <OutcomeSelector onSelect={handleOutcomeSelect} onCancel={handleCancel} />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <MatchProvider>
        <MatchEditor />
      </MatchProvider>
    </ThemeProvider>
  );
}

export default App;
