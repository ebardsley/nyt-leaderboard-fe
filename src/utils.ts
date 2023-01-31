import {format, toDate} from 'date-fns-tz';

import {DateOrder} from 'data';

export function getOffsetDate(dateOrder: DateOrder, dateString: string, offset: number) {
  while (offset != 0) {
    const current = dateOrder.dates.get(dateString);
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
};

export function secondsToMinutes(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export function toReadableDate(dateString: string): string {
  return format(toDate(dateString), 'EEEE, MMMM d, yyyy');
}
