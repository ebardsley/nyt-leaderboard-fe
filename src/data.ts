import memoize from 'fast-memoize';

import data from './nytxw-combined.json'

interface ObjWithDate {
  date: string;
}

function compareDateDescending(a: ObjWithDate, b: ObjWithDate): number {
  return a.date < b.date ? 1 : -1;
}

export type Period = {
  end: string;
  start: string;
} | undefined

export interface PlayerResults {
  name: string;
  results: PlayerResult[];
}

export function getFirstPuzzleDate(): string {
  const results: PuzzleResult[] = usePuzzleResults();
  if (!results) {
    return '';
  }
  return results.sort(compareDateDescending)[results.length-1].date;
}

export function getLatestPuzzleDate(): string {
  const results: PuzzleResult[] = usePuzzleResults();
  if (!results) {
    return '';
  }
  return results.sort(compareDateDescending)[0].date;
}

export function useLeaderboard(period?: Period): PlayerResults[] {
  const leaderboard: PlayerResults[] = data;

  return leaderboard.map(({name, results}) => {
    const filtered = period ? results.filter(({date}) => (
      date >= period.start && date <= period.end
    )) : results;

    return {
      name,
      results: filtered.sort(compareDateDescending)
    };
  });
}

export interface PlayerResult {
  date: string;
  time: number;
}

interface PuzzleLeaderboardTime {
  name: string;
  time: number | null;
}

export function usePuzzleLeaderboard(date: string, period?: Period): PuzzleLeaderboardTime[] {
  return useLeaderboard(period).map(({name, results}) => ({
    name,
    time: results.find(result => result.date === date)?.time ?? null,
  })).sort((a, b) => {
    if (a.time === b.time) {
      return a.name < b.name ? -1 : 1;
    }
    if (a.time != null && b.time != null) {
      return a.time - b.time;
    }
    return a.time != null ? -1 : 1;
  });
}

interface PlayerTime {
  name: string;
  time: number;
}

export interface PuzzleResult {
  date: string;
  results: PuzzleLeaderboardTime[];
}


export function usePuzzleResults(period?: Period): PuzzleResult[] {
  const times: Map<string, PlayerTime[]> = new Map();

  for (const {name, results} of useLeaderboard(period)) {
    for (const {date, time} of results) {
      const playerResults = times.get(date);
      if (playerResults) {
        playerResults.push({name, time});
      } else {
        times.set(date, [{name, time}]);
      }
    }
  }

  return Array.from(times).map(([date, results]) => ({
    date,
    results: results.sort((a, b) => {
      if (a.time === b.time) {
        return a.name < b.name ? -1 : 1;
      }
      return a.time - b.time;
    }),
  })).sort(compareDateDescending);
}

interface DateInfo {
  prev: string;
  next: string;
}

interface DateOrder {
  dates: Map<string, DateInfo>;
}

export const useDateOrder = memoize((period?: Period): DateOrder => {
  const dates: Map<string, DateInfo> = new Map();
  const results = usePuzzleResults(period);  // descending order of date
  for (let i = 0; i < results.length; i++) {
    dates.set(results[i].date, {
      next: i > 0 ? results[i - 1].date : "",
      prev: i < results.length - 1 ? results[i + 1].date : "",
    })
  }
  return {
    dates: dates,
  }
});
