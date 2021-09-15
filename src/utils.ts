import {format, toDate} from 'date-fns-tz';
import memoize from 'fast-memoize';

function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export const getOffsetDate = memoize((dateString: string, offset: number): string => {
  const date = toDate(dateString);
  date.setDate(date.getDate() + offset);

  return formatDate(date);
});

export function secondsToMinutes(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export function toReadableDate(dateString: string): string {
  return format(toDate(dateString), 'EEEE, MMMM d, yyyy');
}
