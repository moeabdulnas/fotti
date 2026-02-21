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
  updateHomeScore: (score: number) => void;
  updateAwayScore: (score: number) => void;
  updateDate: (date: string) => void;
  addShot: (x: number, y: number, outcome: ShotOutcome) => void;
  addConceded: (x: number, y: number, outcome: ShotOutcome) => void;
  addBallLoss: (x: number, y: number) => void;
  addRecovery: (x: number, y: number) => void;
  removeEvent: (id: string) => void;
  undoLastEvent: () => void;
  clearMatch: () => void;
  loadMatch: (id: string) => void;
  getMatches: () => Match[];
  importMatch: (data: unknown) => { success: boolean; error?: string };
  exportMatch: () => string | null;
  updateEvent: (id: string, updates: Partial<MatchEvent>) => void;
}

const MatchContext = createContext<MatchContextType | null>(null);

export { MatchContext };

function createEmptyMatch(homeTeam: Team, awayTeam: Team): Match {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split('T')[0],
    homeTeam,
    awayTeam,
    homeScore: 0,
    awayScore: 0,
    events: [],
  };
}

function getInitialMatch(): Match | null {
  if (typeof window === 'undefined') return null;
  const matches = loadData().matches;
  return matches.length > 0 ? matches[matches.length - 1] : null;
}

function getNextMinute(events: MatchEvent[]): number {
  // Simply calculates the logical progression of events for a match by counting
  // the total events and adding 1. This generates a sequential, 1-indexed count
  // to serve as the match "minute" or logical sequence number.
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

  const updateHomeScore = useCallback((score: number) => {
    setCurrentMatch((prev) => {
      if (!prev) return prev;
      return { ...prev, homeScore: score };
    });
  }, []);

  const updateAwayScore = useCallback((score: number) => {
    setCurrentMatch((prev) => {
      if (!prev) return prev;
      return { ...prev, awayScore: score };
    });
  }, []);

  const updateDate = useCallback((date: string) => {
    setCurrentMatch((prev) => {
      if (!prev) return prev;
      return { ...prev, date };
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

  const updateEvent = useCallback((id: string, updates: Partial<MatchEvent>) => {
    setCurrentMatch((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        events: prev.events.map((e) => (e.id === id ? { ...e, ...updates } as MatchEvent : e)),
      };
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

  const importMatch = useCallback((data: unknown): { success: boolean; error?: string } => {
    // 1. Initial Validation: Determine if the imported data exists and is a Javascript Object.
    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Invalid data format' };
    }

    // Cast data to a Record (key-value dictionary) to allow type-safe checks on generic objects
    const match = data as Record<string, unknown>;

    // 2. Validate Root Level Properties:
    // We strictly enforce that the payload has a unique 'id' and a 'date'.
    if (!match.id || typeof match.id !== 'string') {
      return { success: false, error: 'Missing or invalid id' };
    }
    if (!match.date || typeof match.date !== 'string') {
      return { success: false, error: 'Missing or invalid date' };
    }
    
    // We extract home and away team objects. We verify they exist, are objects,
    // and specifically contain an id and name. If a team is malformed, we throw an error.
    const homeTeam = match.homeTeam as Record<string, unknown> | undefined;
    const awayTeam = match.awayTeam as Record<string, unknown> | undefined;
    if (!homeTeam || typeof homeTeam !== 'object' || !homeTeam.id || !homeTeam.name) {
      return { success: false, error: 'Missing or invalid homeTeam' };
    }
    if (!awayTeam || typeof awayTeam !== 'object' || !awayTeam.id || !awayTeam.name) {
      return { success: false, error: 'Missing or invalid awayTeam' };
    }
    
    // We enforce that the events array exists, even if it is empty.
    if (!Array.isArray(match.events)) {
      return { success: false, error: 'Missing or invalid events' };
    }

    // 3. Validate Match Events Loop:
    // Iterate through all historical events within the imported match and strictly validate them
    for (const event of match.events) {
      if (!event || typeof event !== 'object') {
        return { success: false, error: 'Invalid event format' };
      }
      
      const e = event as Record<string, unknown>;
      
      // Every single match event MUST have these base positional and chronological properties
      if (!e.id || !e.type || !e.position || !e.zone || !e.minute || !e.timestamp) {
        return { success: false, error: 'Invalid event properties' };
      }
      
      // Strict allowlist for event types. If a random string exists, reject the payload
      if (!['shot', 'conceded', 'ball_loss', 'recovery'].includes(e.type as string)) {
        return { success: false, error: 'Invalid event type' };
      }
      
      // Specifically for 'shot' and 'conceded' events, an outcome (e.g., 'goal', 'off_target')
      // is mandatory. If one is missing, reject the payload.
      if ((e.type === 'shot' || e.type === 'conceded') && !e.outcome) {
        return { success: false, error: 'Missing outcome for shot event' };
      }
    }

    // 4. Update Application State:
    // Once all checks pass, we can safely coerce the unknown object to a strict Match type
    // and load it into the application context using our React setter.
    setCurrentMatch(match as unknown as Match);
    return { success: true };
  }, []);

  const exportMatch = useCallback((): string | null => {
    if (!currentMatch) return null;
    return JSON.stringify(currentMatch, null, 2);
  }, [currentMatch]);

  return (
    <MatchContext.Provider
      value={{
        currentMatch,
        createNewMatch,
        updateHomeTeam,
        updateAwayTeam,
        updateHomeScore,
        updateAwayScore,
        updateDate,
        addShot,
        addConceded,
        addBallLoss,
        addRecovery,
        removeEvent,
        undoLastEvent,
        clearMatch,
        loadMatch,
        getMatches,
        importMatch,
        exportMatch,
        updateEvent,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
}
