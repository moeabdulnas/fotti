import type { Match, StorageData } from '../types';

const STORAGE_KEY = 'fotti_data';

const DEFAULT_DATA: StorageData = {
  version: 1,
  matches: [],
};

export function loadData(): StorageData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_DATA;
    return JSON.parse(stored) as StorageData;
  } catch {
    return DEFAULT_DATA;
  }
}

export function saveData(data: StorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addMatch(match: Match): void {
  const data = loadData();
  data.matches.push(match);
  saveData(data);
}

export function getMatches(): Match[] {
  return loadData().matches;
}

export function getMatch(id: string): Match | undefined {
  return loadData().matches.find((m) => m.id === id);
}

export function updateMatch(match: Match): void {
  const data = loadData();
  const index = data.matches.findIndex((m) => m.id === match.id);
  if (index !== -1) {
    data.matches[index] = match;
    saveData(data);
  }
}

export function deleteMatch(id: string): void {
  const data = loadData();
  data.matches = data.matches.filter((m) => m.id !== id);
  saveData(data);
}
