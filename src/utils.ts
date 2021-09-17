import {format, toDate} from 'date-fns-tz';
import memoize from 'fast-memoize';

import {useDateOrder} from 'data';

function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export const getOffsetDate = memoize((dateString: string, offset: number): string => {
  const order = useDateOrder().dates;
  while (offset != 0) {
    const current = order.get(dateString);
    if (!current) {
      return "";
    }
    if (offset < 0) {
      dateString = current.prev;
      offset += 1;
    }
    if (offset > 0) {
      dateString = current.next;
      offset -= 1;
    }
  }
  return dateString;
});

export function secondsToMinutes(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export function toReadableDate(dateString: string): string {
  return format(toDate(dateString), 'EEEE, MMMM d, yyyy');
}
