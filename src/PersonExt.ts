import { firstIndex } from 'bsearch';
import { List } from 'immutable';

import { isNumber } from '@dozerg/condition';

import { Person } from './types';
import { sequence } from './utils';

export default class PersonExt {
  readonly holidays?: List<number>;

  constructor(private details_: Person) {
    const holidays = details_.holidays
      ?.flatMap(v => {
        if (isNumber(v)) return v;
        else {
          const { from, days } = v;
          return sequence(from, days);
        }
      })
      .sort((a, b) => a - b);
    if (holidays) this.holidays = List(holidays);
  }

  get uuid() {
    return this.details_.uuid;
  }

  calcAvailability(start: number) {
    if (!this.holidays) return start;
    let i = firstIndex(this.holidays.toArray(), v => start <= v);
    if (i < 0) return start;
    for (; i < this.holidays.size && this.holidays.get(i) === start; ++i, ++start);
    return start;
  }

  calcWorkDays(start: number, timeToDelivery: number) {
    if (!this.holidays) return sequence(start, timeToDelivery);
    let i = firstIndex(this.holidays.toArray(), v => start <= v);
    if (i < 0) return sequence(start, timeToDelivery);
    const r = [];
    for (; timeToDelivery > 0; --timeToDelivery, ++start) {
      for (; i < this.holidays.size && this.holidays.get(i) === start; ++i, ++start);
      r.push(start);
    }
    return r;
  }

  isHoliday(day: number) {
    return !!this.holidays?.includes(day);
  }
}
