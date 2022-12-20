import { firstIndex } from 'bsearch';

import { isNumber } from '@dozerg/condition';

import { Person } from './types';
import { sequence } from './utils';

export default class PersonExt {
  readonly holidays?: number[];

  constructor(private details_: Person) {
    this.holidays = details_.holidays
      ?.flatMap(v => {
        if (isNumber(v)) return v;
        else {
          const { from, days } = v;
          return sequence(from, days);
        }
      })
      .sort((a, b) => a - b);
  }

  get uuid() {
    return this.details_.uuid;
  }

  calcNextAvailability(start: number) {
    if (!this.holidays) return start;
    let i = firstIndex(this.holidays, v => start <= v);
    if (i < 0) return start;
    for (; i < this.holidays.length && this.holidays[i] === start; ++i, ++start);
    return start;
  }

  calcWorkDays(start: number, effort: number) {
    if (!this.holidays) return sequence(start, effort);
    let i = firstIndex(this.holidays, v => start <= v);
    if (i < 0) return sequence(start, effort);
    const r = [];
    for (; effort > 0; --effort, ++start) {
      for (; i < this.holidays.length && this.holidays[i] === start; ++i, ++start);
      r.push(start);
    }
    return r;
  }

  isHoliday(day: number) {
    return !!this.holidays?.includes(day);
  }

  /**
   * Return how many working days are before `day`
   */
  calcAvailabilityBefore(day: number) {
    if (!this.holidays) return day;
    const i = firstIndex(this.holidays, v => day <= v);
    if (i < 0) return day - this.holidays.length;
    return day - i;
  }
}
