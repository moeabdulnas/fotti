import type { Zone, ZoneId } from '../types';

export const ZONES: Zone[] = [
  { id: '1', name: 'Zone 1', x: 0, y: 0, width: 16.67, height: 33.33 },
  { id: '2', name: 'Zone 2', x: 16.67, y: 0, width: 16.66, height: 33.33 },
  { id: '3', name: 'Zone 3', x: 33.33, y: 0, width: 16.67, height: 33.33 },
  { id: '4', name: 'Zone 4', x: 50, y: 0, width: 16.67, height: 33.33 },
  { id: '5', name: 'Zone 5', x: 66.67, y: 0, width: 16.66, height: 33.33 },
  { id: '6', name: 'Zone 6', x: 83.33, y: 0, width: 16.67, height: 33.33 },
  { id: '7', name: 'Zone 7', x: 0, y: 33.33, width: 16.67, height: 33.34 },
  { id: '8', name: 'Zone 8', x: 16.67, y: 33.33, width: 16.66, height: 33.34 },
  { id: '9', name: 'Zone 9', x: 33.33, y: 33.33, width: 16.67, height: 33.34 },
  { id: '10', name: 'Zone 10', x: 50, y: 33.33, width: 16.67, height: 33.34 },
  { id: '11', name: 'Zone 11', x: 66.67, y: 33.33, width: 16.66, height: 33.34 },
  { id: '12', name: 'Zone 12', x: 83.33, y: 33.33, width: 16.67, height: 33.34 },
  { id: '13', name: 'Zone 13', x: 0, y: 66.67, width: 16.67, height: 33.33 },
  { id: '14', name: 'Zone 14', x: 16.67, y: 66.67, width: 16.66, height: 33.33 },
  { id: '15', name: 'Zone 15', x: 33.33, y: 66.67, width: 16.67, height: 33.33 },
  { id: '16', name: 'Zone 16', x: 50, y: 66.67, width: 16.67, height: 33.33 },
  { id: '17', name: 'Zone 17', x: 66.67, y: 66.67, width: 16.66, height: 33.33 },
  { id: '18', name: 'Zone 18', x: 83.33, y: 66.67, width: 16.67, height: 33.33 },
];

export function getZoneForPosition(x: number, y: number): ZoneId {
  const col = x < 16.67 ? 0 : x < 33.33 ? 1 : x < 50 ? 2 : x < 66.67 ? 3 : x < 83.33 ? 4 : 5;
  const row = y < 33.33 ? 0 : y < 66.67 ? 1 : 2;
  const zoneIndex = row * 6 + col;
  return String(zoneIndex + 1) as ZoneId;
}
