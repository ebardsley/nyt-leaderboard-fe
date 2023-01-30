import memoize from 'fast-memoize';

interface ObjWithDate {
  date: string;
}

function compareDateDescending(a: ObjWithDate, b: ObjWithDate): number {
  return a.date < b.date ? 1 : -1;
}

export type DataByDate = PuzzleResult[];
export type DataByPlayer = PlayerResults[];

export type Period = {
  end: string;
  start: string;
} | undefined

export interface PlayerResults {
  name: string;
  results: PlayerResult[];
}

export function getFirstPuzzleDate(data: DataByDate): string {
  if (!data) {
    return '';
  }
  return data[data.length-1].date;
}

export function getLatestPuzzleDate(data: DataByDate): string {
  if (!data) {
    return '';
  }
  return data[0].date;
}

export function dataForPeriod(data: DataByPlayer, period?: Period): DataByPlayer {
  return data.map(({name, results}) => {
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

export interface PuzzleLeaderboardTime {
  name: string;
  time: number | null;
}

function compareTimeAscending(a: PuzzleLeaderboardTime, b: PuzzleLeaderboardTime): number {
  if (a.time === b.time) {
    return a.name < b.name ? -1 : 1;
  }
  if (a.time != null && b.time != null) {
    return a.time - b.time;
  }
  return a.time != null ? -1 : 1;
}

export function leaderboardForDate(date: string, resultsByPlayer: DataByPlayer): PuzzleLeaderboardTime[] {
  return resultsByPlayer.map(({name, results}) => ({
    name,
    time: results.find(result => result.date === date)?.time ?? null,
  })).sort(compareTimeAscending);
}

export interface PuzzleResult {
  date: string;
  results: PuzzleLeaderboardTime[];
}

export function dataByDate(data: DataByPlayer): DataByDate {
  const times: Map<string, PuzzleLeaderboardTime[]> = new Map();

  for (const {name, results} of data) {
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
    results: results.sort(compareTimeAscending),
  })).sort(compareDateDescending);
}

/// XXX: dedupe w/ other dateinfo
interface DateInfo {
  prev: string;
  next: string;
}

interface DateOrder {
  dates: Map<string, DateInfo>;
}

export const useDateOrder = memoize((byDate: DataByDate): DateOrder => {
  const dates: Map<string, DateInfo> = new Map();
  for (let i = 0; i < byDate.length; i++) {
    dates.set(byDate[i].date, {
      next: i > 0 ? byDate[i - 1].date : "",
      prev: i < byDate.length - 1 ? byDate[i + 1].date : "",
    })
  }
  return {
    dates: dates,
  }
});
