import { useState, useRef, useMemo } from 'react';
import { Pitch } from './components/Pitch';
import { EventMarker } from './components/Pitch/EventMarker';
import { OutcomeSelector } from './components/OutcomeSelector';
import { EventModeSelector, type EventMode } from './components/EventModeSelector';
import { StatsTable } from './components/StatsTable';
import { MatchProvider } from './hooks/MatchContext';
import { useMatch } from './hooks/useMatch';
import { calculateStats } from './utils/stats';
import { exportToPng } from './utils/export';
import type { ShotOutcome, MatchEvent } from './types';

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
    if (pitchRef.current) {
      exportToPng(pitchRef.current, `match-${currentMatch?.date || 'export'}.png`);
    }
  };

  const handleNewMatch = () => {
    createNewMatch({ id: 'home', name: 'Home Team' }, { id: 'away', name: 'Away Team' });
  };

  const existingMatches = getMatches();

  if (!currentMatch) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '20px' }}>Fotti - Football Pitch Analyzer</h1>
        <button
          onClick={handleNewMatch}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Create New Match
        </button>
        {existingMatches.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3>Previous Matches</h3>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}
            >
              {existingMatches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => loadMatch(m.id)}
                  style={{
                    padding: '8px 16px',
                    background: '#f3f4f6',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {m.date} - {m.homeTeam.name} vs {m.awayTeam.name} ({m.events.length} events)
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h1>
          {currentMatch.homeTeam.name} vs {currentMatch.awayTeam.name}
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowZones(!showZones)}
            style={{
              padding: '8px 12px',
              background: '#e5e7eb',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {showZones ? 'Hide' : 'Show'} Zones
          </button>
          <button
            onClick={handleExport}
            style={{
              padding: '8px 12px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Export PNG
          </button>
          <button
            onClick={undoLastEvent}
            style={{
              padding: '8px 12px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Undo
          </button>
          <button
            onClick={clearMatch}
            style={{
              padding: '8px 12px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <EventModeSelector mode={eventMode} onModeChange={setEventMode} />

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Pitch
          ref={pitchRef}
          width={800}
          height={520}
          showZones={showZones}
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
        />
      )}

      {pendingPosition && (eventMode === 'shot' || eventMode === 'conceded') && (
        <OutcomeSelector onSelect={handleOutcomeSelect} onCancel={handleCancel} />
      )}
    </div>
  );
}

function App() {
  return (
    <MatchProvider>
      <MatchEditor />
    </MatchProvider>
  );
}

export default App;
