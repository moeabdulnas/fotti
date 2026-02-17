export type ZoneId =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | '13'
  | '14'
  | '15'
  | '16'
  | '17'
  | '18'
  | '19'
  | '20'
  | '21'
  | '22'
  | '23'
  | '24';

export interface Zone {
  id: ZoneId;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type EventType = 'shot' | 'conceded' | 'ball_loss' | 'recovery';

export type ShotOutcome = 'on_target' | 'off_target' | 'blocked' | 'goal';

export interface Position {
  x: number;
  y: number;
}

export interface ShotEvent {
  id: string;
  type: 'shot';
  position: Position;
  zone: ZoneId;
  outcome: ShotOutcome;
  minute: number;
  timestamp: number;
}

export interface ConcededEvent {
  id: string;
  type: 'conceded';
  position: Position;
  zone: ZoneId;
  outcome: ShotOutcome;
  minute: number;
  timestamp: number;
}

export interface BallLossEvent {
  id: string;
  type: 'ball_loss';
  position: Position;
  zone: ZoneId;
  minute: number;
  timestamp: number;
}

export interface RecoveryEvent {
  id: string;
  type: 'recovery';
  position: Position;
  zone: ZoneId;
  minute: number;
  timestamp: number;
}

export type MatchEvent = ShotEvent | ConcededEvent | BallLossEvent | RecoveryEvent;

export interface Team {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  date: string;
  homeTeam: Team;
  awayTeam: Team;
  events: MatchEvent[];
}

export interface StorageData {
  version: number;
  matches: Match[];
}
