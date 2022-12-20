import PersonExt from './PersonExt';
import {
  Person,
  Solution,
  Task,
} from './types';

export function calcEfficiency(solution: Solution, tasks: Task[], people: Person[]) {
  const { totalWorkDays, deliveryTime, criticalTime } = solution;
  const timeEfficiency = Math.floor((criticalTime * 100) / deliveryTime);
  const neededDays = tasks.map(t => t.effort).reduce((a, b) => a + b);
  const availableDays = people
    .map(p => {
      const person = new PersonExt(p);
      return person.calcAvailabilityBefore(totalWorkDays);
    })
    .reduce((a, b) => a + b);
  const resourceEfficiency = Math.floor((neededDays * 100) / availableDays);
  return { timeEfficiency, resourceEfficiency, neededDays, availableDays };
}

export function compareSolutions(a: Solution, b: Solution) {
  if (a.deliveryTime !== b.deliveryTime) return a.deliveryTime - b.deliveryTime;
  // Tasks finish ASAP
  const endSumA = a.assignments.map(s => s.workDays.slice(-1)[0]).reduce((i, j) => i + j);
  const endSumB = b.assignments.map(s => s.workDays.slice(-1)[0]).reduce((i, j) => i + j);
  return endSumA - endSumB;
}
