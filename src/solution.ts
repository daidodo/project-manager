import { isNumber } from '@dozerg/condition';

import PersonExt from './PersonExt';
import {
  Person,
  Solution,
  Task,
} from './types';

export function calcEfficiency(solution: Solution, tasks: Task[], people: Person[]) {
  const { totalTime, criticalTime } = solution;
  const timeEfficiency = isNumber(criticalTime)
    ? Math.floor((criticalTime * 100) / totalTime)
    : undefined;
  const neededDays = tasks.map(t => t.timeToDelivery).reduce((a, b) => a + b);
  const availableDays = people
    .map(p => {
      const person = new PersonExt(p);
      return person.calcAvailabilityBefore(totalTime);
    })
    .reduce((a, b) => a + b);
  const resourceEfficiency = Math.floor((neededDays * 100) / availableDays);
  return { timeEfficiency, resourceEfficiency, neededDays, availableDays };
}
