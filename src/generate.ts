import genTaskId from 'excel-column-id';

import {
  assertTrue,
  isNumber,
} from '@dozerg/condition';

import {
  Holiday,
  Person,
  Task,
} from './types';
import { sequence } from './utils';

const DEFAULT_OPTION = {
  maxTaskEffort: 5,
  maxDependencies: 3,
  maxHolidaysInPercentage: 50,
};

type Options = Partial<typeof DEFAULT_OPTION>;

export function generateProject(taskCount: number, peopleCount: number, options?: Options) {
  const tasks = genTasks(taskCount, options);
  const people = genPeople(peopleCount, tasks, options);
  return { tasks, people };
}

function genTasks(taskCount: number, options?: Options): Task[] {
  const maxTaskEffort = Math.max(1, options?.maxTaskEffort ?? DEFAULT_OPTION.maxTaskEffort);
  const tasks: Task[] = [];
  for (let i = 0; i < taskCount; ++i) {
    const uuid = genTaskId(i);
    const effort = randomNumber(1, maxTaskEffort);
    const dependencies = genDeps(tasks, options);
    if (dependencies) tasks.push({ uuid, effort, dependencies });
    else tasks.push({ uuid, effort });
  }
  return tasks;
}

function genDeps(tasks: Task[], options?: Options) {
  if (tasks.length < 1) return undefined;
  const maxDependencies = Math.max(0, options?.maxDependencies ?? DEFAULT_OPTION.maxDependencies);
  const deps = randomNumber(0, maxDependencies);
  if (!deps) return undefined;
  const ids = tasks.map(t => t.uuid).slice(-Math.max(4, 2 * deps));
  if (deps >= ids.length) return ids;
  return shuffle(ids).slice(0, deps).sort();
}

function genPeople(peopleCount: number, tasks: Task[], options?: Options): Person[] {
  const people: Person[] = [];
  for (let i = 1; i <= peopleCount; ++i) {
    const uuid = genPersonId(i, peopleCount);
    people.push({ uuid });
  }
  return people.map(person => genHolidays(person, tasks, options));
}

function genHolidays(person: Person, tasks: Task[], options?: Options) {
  const maxHolidaysInPercentage = Math.max(
    0,
    options?.maxHolidaysInPercentage ?? DEFAULT_OPTION.maxHolidaysInPercentage,
  );
  if (maxHolidaysInPercentage < 1) return person;
  const totalEfforts = tasks.map(t => t.effort).reduce((a, b) => a + b);
  const maxHolidays = Math.floor((totalEfforts * maxHolidaysInPercentage) / 100);
  const holidayCount = randomNumber(0, maxHolidays);
  if (holidayCount < 1) return person;
  const days = sequence(0, totalEfforts * 2);
  const holidayArray = [...shuffle(days).slice(0, holidayCount)].sort((a, b) => a - b);
  const holidays = holidayArray.reduce<Holiday[]>((r, h) => {
    if (r.length < 1) return [h];
    const i = r.length - 1;
    const last = r[i];
    if (isNumber(last)) {
      if (last + 1 === h) r[i] = { from: last, days: 2 };
      else r.push(h);
    } else if (last.from + last.days === h) r[i] = { ...last, days: last.days + 1 };
    else r.push(h);
    return r;
  }, []);
  return { ...person, holidays };
}

// Generate a random number in range [from, to].
function randomNumber(from: number, to: number) {
  assertTrue(Math.floor(from) === from);
  assertTrue(Math.floor(to) === to);
  assertTrue(from <= to);
  return Math.floor(Math.random() * (to - from + 1)) + from;
}

function genPersonId(index: number, count: number) {
  const P = 'P';
  const a = `${index}`;
  const n = `${count}`;
  if (a.length === n.length) return P + a;
  assertTrue(a.length < n.length);
  return P + `0`.repeat(n.length - a.length) + a;
}

function shuffle<T>(array: T[]) {
  if (array.length < 1) return array;
  for (let i = array.length - 1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
