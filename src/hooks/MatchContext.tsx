import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type {
  Match,
  ShotEvent,
  Team,
  MatchEvent,
  ConcededEvent,
  BallLossEvent,
  RecoveryEvent,
  ShotOutcome,
} from '../types';
import { getZoneForPosition } from '../utils/zones';
import { loadData, saveData } from '../utils/storage';

interface MatchContextType {
  currentMatch: Match | null;
  createNewMatch: (homeTeam: Team, awayTeam: Team) => void;
  updateHomeTeam: (name: string) => void;
  updateAwayTeam: (name: string) => void;
  addShot: (x: number, y: number, outcome: ShotOutcome) => void;
  addConceded: (x: number, y: number, outcome: ShotOutcome) => void;
  addBallLoss: (x: number, y: number) => void;
  addRecovery: (x: number, y: number) => void;
  removeEvent: (id: string) => void;
  undoLastEvent: () => void;
  clearMatch: () => void;
  loadMatch: (id: string) => void;
  getMatches: () => Match[];
}

const MatchContext = createContext<MatchContextType | null>(null);

export { MatchContext };

function createEmptyMatch(homeTeam: Team, awayTeam: Team): Match {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split('T')[0],
    homeTeam,
    awayTeam,
    events: [],
  };
}

function getInitialMatch(): Match | null {
  if (typeof window === 'undefined') return null;
  const matches = loadData().matches;
  return matches.length > 0 ? matches[matches.length - 1] : null;
}

function getNextMinute(events: MatchEvent[]): number {
  return events.length + 1;
}

export function MatchProvider({ children }: { children: ReactNode }) {
  const [currentMatch, setCurrentMatch] = useState<Match | null>(getInitialMatch);

  useEffect(() => {
    if (currentMatch) {
      const data = loadData();
      const existingIndex = data.matches.findIndex((m) => m.id === currentMatch.id);
      if (existingIndex >= 0) {
        data.matches[existingIndex] = currentMatch;
      } else {
        data.matches.push(currentMatch);
      }
      saveData(data);
    }
  }, [currentMatch]);

  const createNewMatch = useCallback((homeTeam: Team, awayTeam: Team) => {
    setCurrentMatch(createEmptyMatch(homeTeam, awayTeam));
  }, []);

  const updateHomeTeam = useCallback((name: string) => {
    setCurrentMatch((prev) => {
      if (!prev) return prev;
      return { ...prev, homeTeam: { ...prev.homeTeam, name } };
    });
  }, []);

  const updateAwayTeam = useCallback((name: string) => {
    setCurrentMatch((prev) => {
      if (!prev) return prev;
      return { ...prev, awayTeam: { ...prev.awayTeam, name } };
    });
  }, []);

  const addShot = useCallback((x: number, y: number, outcome: ShotOutcome) => {
    setCurrentMatch((prev) => {
      if (!prev) return prev;
      const shot: ShotEvent = {
        id: crypto.randomUUID(),
        type: 'shot',
        position: { x, y },
        zone: getZoneForPosition(x, y),
        outcome,
        minute: getNextMinute(prev.events),
        timestamp: Date.now(),
      };
      return { ...prev, events: [...prev.events, shot] };
    });
  }, []);

  const addConceded = useCallback((x: number, y: number, outcome: ShotOutcome) => {
    setCurrentMatch((prev) => {
      if (!prev) return prev;
      const conceded: ConcededEvent = {
        id: crypto.randomUUID(),
        type: 'conceded',
        position: { x, y },
        zone: getZoneForPosition(x, y),
        outcome,
        minute: getNextMinute(prev.events),
        timestamp: Date.now(),
      };
      return { ...prev, events: [...prev.events, conceded] };
    });
  }, []);

  const addBallLoss = useCallback((x: number, y: number) => {
    setCurrentMatch((prev) => {
      if (!prev) return prev;
      const loss: BallLossEvent = {
        id: crypto.randomUUID(),
        type: 'ball_loss',
        position: { x, y },
        zone: getZoneForPosition(x, y),
        minute: getNextMinute(prev.events),
        timestamp: Date.now(),
      };
      return { ...prev, events: [...prev.events, loss] };
    });
  }, []);

  const addRecovery = useCallback((x: number, y: number) => {
    setCurrentMatch((prev) => {
      if (!prev) return prev;
      const recovery: RecoveryEvent = {
        id: crypto.randomUUID(),
        type: 'recovery',
        position: { x, y },
        zone: getZoneForPosition(x, y),
        minute: getNextMinute(prev.events),
        timestamp: Date.now(),
      };
      return { ...prev, events: [...prev.events, recovery] };
    });
  }, []);

  const removeEvent = useCallback((id: string) => {
    setCurrentMatch((prev) => {
      if (!prev) return prev;
      return { ...prev, events: prev.events.filter((e) => e.id !== id) };
    });
  }, []);

  const undoLastEvent = useCallback(() => {
    setCurrentMatch((prev) => {
      if (!prev || prev.events.length === 0) return prev;
      return { ...prev, events: prev.events.slice(0, -1) };
    });
  }, []);

  const clearMatch = useCallback(() => {
    setCurrentMatch((prev) => {
      if (!prev) return prev;
      return { ...prev, events: [] };
    });
  }, []);

  const loadMatch = useCallback((id: string) => {
    const match = loadData().matches.find((m) => m.id === id);
    if (match) {
      setCurrentMatch(match);
    }
  }, []);

  const getMatches = useCallback(() => {
    return loadData().matches;
  }, []);

  return (
    <MatchContext.Provider
      value={{
        currentMatch,
        createNewMatch,
        updateHomeTeam,
        updateAwayTeam,
        addShot,
        addConceded,
        addBallLoss,
        addRecovery,
        removeEvent,
        undoLastEvent,
        clearMatch,
        loadMatch,
        getMatches,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
}
