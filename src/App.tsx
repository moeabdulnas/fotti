import { useState, useRef, useMemo } from 'react';
import { Pitch } from './components/Pitch';
import { EventMarker } from './components/Pitch/EventMarker';
import { OutcomeSelector } from './components/OutcomeSelector';
import { EventModeSelector, type EventMode } from './components/EventModeSelector';
import { EventEditor } from './components/EventEditor';
import { StatsTable } from './components/StatsTable';
import { MatchProvider } from './hooks/MatchContext';
import { useMatch } from './hooks/useMatch';
import { ThemeProvider } from './hooks/ThemeContext';
import { LanguageProvider, useLanguage } from './hooks/LanguageContext';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './components/ui/dialog';
import { Plus, Download, Upload, Globe } from 'lucide-react';

function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setLanguage(language === 'sv' ? 'en' : 'sv')}
        title={language === 'sv' ? 'Switch to English' : 'Byt till svenska'}
      >
        <Globe className="h-5 w-5" />
      </Button>
      <span className="text-sm font-medium">{language.toUpperCase()}</span>
    </div>
  );
}

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
    importMatch,
    exportMatch,
    updateEvent,
  } = useMatch();
  const { t } = useLanguage();
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);
  const [editingEvent, setEditingEvent] = useState<MatchEvent | null>(null);
  const [eventMode, setEventMode] = useState<EventMode>('shot');
  const [showZones, setShowZones] = useState(true);
  const [showZoneNumbers, setShowZoneNumbers] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
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

  const handleExportPng = () => {
    if (pitchRef.current && currentMatch) {
      const filename = `${currentMatch.homeTeam.name}-vs-${currentMatch.awayTeam.name}`
        .replace(/\s+/g, '-')
        .toLowerCase();
      exportToPng(pitchRef.current, `${filename}.png`);
    }
  };

  const handleExportMatch = () => {
    const json = exportMatch();
    if (!json || !currentMatch) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentMatch.homeTeam.name}-vs-${currentMatch.awayTeam.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    if (currentMatch && !window.confirm(t('importWarning'))) {
      return;
    }
    fileInputRef?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const result = importMatch(data);
        if (!result.success) {
          setImportError(result.error || t('invalidMatchFile'));
        } else {
          setImportDialogOpen(false);
          setImportError(null);
        }
      } catch {
        setImportError(t('invalidMatchFile'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
            {t('appName')}
          </h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex gap-4">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg">
                <Upload className="mr-2 h-4 w-4" />
                {t('importMatch')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('importMatch')}</DialogTitle>
                <DialogDescription>{t('invalidMatchFile')}</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <input
                  ref={(el) => setFileInputRef(el)}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button variant="outline" onClick={handleImportClick} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  {t('importMatch')}
                </Button>
                {importError && <p className="text-destructive text-sm mt-2">{importError}</p>}
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={handleNewMatch} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            {t('createNewMatch')}
          </Button>
        </div>
        {existingMatches.length > 0 && (
          <div className="mt-8 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-center">{t('previousMatches')}</h3>
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
                    {m.date} - {m.homeTeam.name} {t('vs')} {m.awayTeam.name}
                    <span className="ml-auto text-muted-foreground text-xs">
                      {m.events.length} {t('events')}
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
              {currentMatch.homeTeam.name} {t('vs')} {currentMatch.awayTeam.name}
            </h1>
            <span className="text-sm text-muted-foreground">{currentMatch.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
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
                  <Label htmlFor="show-zones">{t('showZones')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-zone-numbers"
                    checked={showZoneNumbers}
                    onCheckedChange={setShowZoneNumbers}
                    disabled={!showZones}
                  />
                  <Label htmlFor="show-zone-numbers">{t('zoneNumbers')}</Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportPng}>
                  <Download className="mr-2 h-4 w-4" />
                  {t('exportPng')}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportMatch}>
                  <Download className="mr-2 h-4 w-4" />
                  {t('exportMatch')}
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      {t('import')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('importMatch')}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <input
                        ref={(el) => setFileInputRef(el)}
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button variant="outline" onClick={handleImportClick} className="w-full">
                        <Upload className="mr-2 h-4 w-4" />
                        {t('importMatch')}
                      </Button>
                      {importError && (
                        <p className="text-destructive text-sm mt-2">{importError}</p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={undoLastEvent}>
                  {t('undo')}
                </Button>
                <Button variant="destructive" size="sm" onClick={clearMatch}>
                  {t('clear')}
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
              <EventMarker 
                key={event.id} 
                event={event} 
                width={800} 
                height={520} 
                onClick={(e) => setEditingEvent(e)}
              />
            ))}
          </Pitch>
        </div>

        <ChartsPanel />

        {stats && (
          <StatsTable
            zoneStats={stats.zoneStats}
            totalShots={stats.totalShots}
            totalGoals={stats.totalGoals}
            totalConceded={stats.totalConceded}
            totalConcededGoals={stats.totalConcededGoals}
          />
        )}

        {pendingPosition && (eventMode === 'shot' || eventMode === 'conceded') && (
          <OutcomeSelector onSelect={handleOutcomeSelect} onCancel={handleCancel} />
        )}

        {editingEvent && (
          <EventEditor
            event={editingEvent}
            onSave={(updates) => updateEvent(editingEvent.id, updates)}
            onClose={() => setEditingEvent(null)}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MatchProvider>
          <MatchEditor />
        </MatchProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
