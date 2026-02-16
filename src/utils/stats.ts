import type {
  Match,
  ShotEvent,
  ConcededEvent,
  BallLossEvent,
  RecoveryEvent,
  ZoneId,
} from '../types';
import { ZONES } from './zones';

export interface ZoneStats {
  zoneId: ZoneId;
  zoneName: string;
  shots: number;
  goals: number;
  conceded: number;
  concededGoals: number;
  ballLosses: number;
  recoveries: number;
}

export interface MatchStats {
  totalShots: number;
  totalGoals: number;
  totalConceded: number;
  totalConcededGoals: number;
  totalBallLosses: number;
  totalRecoveries: number;
  zoneStats: ZoneStats[];
}

export function calculateStats(match: Match): MatchStats {
  const shots = match.events.filter((e): e is ShotEvent => e.type === 'shot');
  const conceded = match.events.filter((e): e is ConcededEvent => e.type === 'conceded');
  const ballLosses = match.events.filter((e): e is BallLossEvent => e.type === 'ball_loss');
  const recoveries = match.events.filter((e): e is RecoveryEvent => e.type === 'recovery');

  const zoneMap = new Map<ZoneId, ZoneStats>();

  for (const zone of ZONES) {
    zoneMap.set(zone.id, {
      zoneId: zone.id,
      zoneName: zone.name,
      shots: 0,
      goals: 0,
      conceded: 0,
      concededGoals: 0,
      ballLosses: 0,
      recoveries: 0,
    });
  }

  for (const shot of shots) {
    const data = zoneMap.get(shot.zone);
    if (data) {
      data.shots++;
      if (shot.outcome === 'goal') {
        data.goals++;
      }
    }
  }

  for (const c of conceded) {
    const data = zoneMap.get(c.zone);
    if (data) {
      data.conceded++;
      if (c.outcome === 'goal') {
        data.concededGoals++;
      }
    }
  }

  for (const loss of ballLosses) {
    const data = zoneMap.get(loss.zone);
    if (data) {
      data.ballLosses++;
    }
  }

  for (const recovery of recoveries) {
    const data = zoneMap.get(recovery.zone);
    if (data) {
      data.recoveries++;
    }
  }

  const totalShots = shots.length;
  const totalGoals = shots.filter((s) => s.outcome === 'goal').length;
  const totalConceded = conceded.length;
  const totalConcededGoals = conceded.filter((c) => c.outcome === 'goal').length;
  const totalBallLosses = ballLosses.length;
  const totalRecoveries = recoveries.length;

  const zoneStats: ZoneStats[] = ZONES.map((zone) => zoneMap.get(zone.id)!);

  return {
    totalShots,
    totalGoals,
    totalConceded,
    totalConcededGoals,
    totalBallLosses,
    totalRecoveries,
    zoneStats,
  };
}
