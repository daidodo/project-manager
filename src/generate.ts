import genTaskId from 'excel-column-id';

import { assertTrue } from '@dozerg/condition';

import {
  Person,
  Task,
} from './types';

const DEFAULT_OPTION = {
  maxTaskEffort: 5,
  maxDependencies: 3,
  lateStartsInPercentage: 0,
  maxLateStartDaysInPercentage: 10,
};

type Options = Partial<typeof DEFAULT_OPTION>;

export function generateProject(taskCount: number, peopleCount: number, options?: Options) {
  const tasks = genTasks(taskCount, options);
  const people = genPeople(peopleCount, tasks, options);
  return { tasks, people };
}

function genTasks(taskCount: number, options?: Options) {
  const maxTaskEffort = Math.max(1, options?.maxTaskEffort ?? DEFAULT_OPTION.maxTaskEffort);
  const tasks: Task[] = [];
  for (let i = 0; i < taskCount; ++i) {
    const uuid = genTaskId(i);
    const timeToDelivery = randomNumber(1, maxTaskEffort);
    const dependencies = genDeps(tasks, options);
    tasks.push({ uuid, timeToDelivery, dependencies });
  }
  return tasks;
}

function genDeps(tasks: Task[], options?: Options) {
  if (tasks.length < 1) return undefined;
  const maxDependencies = Math.max(0, options?.maxDependencies ?? DEFAULT_OPTION.maxDependencies);
  const deps = randomNumber(0, maxDependencies);
  if (!deps) return undefined;
  const ids = tasks.map(t => t.uuid);
  if (deps >= ids.length) return ids;
  return shuffle(ids).slice(0, deps).sort();
}

function genPeople(peopleCount: number, tasks: Task[], options?: Options) {
  const people: Person[] = [];
  for (let i = 1; i <= peopleCount; ++i) {
    const uuid = genPersonId(i, peopleCount);
    people.push({ uuid });
  }
  const lateStartsInPercentage = Math.max(
    0,
    options?.lateStartsInPercentage ?? DEFAULT_OPTION.lateStartsInPercentage,
  );
  const lateStarts = Math.floor((peopleCount * lateStartsInPercentage) / 100);
  return genLateStart(people, lateStarts, tasks, options);
}

function genLateStart(people: Person[], lateStarts: number, tasks: Task[], options?: Options) {
  assertTrue(lateStarts <= people.length);
  if (lateStarts < 1) return people;
  const maxStartInPercentage = Math.max(
    0,
    options?.maxLateStartDaysInPercentage ?? DEFAULT_OPTION.maxLateStartDaysInPercentage,
  );
  const totalEfforts = tasks.map(t => t.timeToDelivery).reduce((a, b) => a + b);
  const maxStart = Math.floor((totalEfforts * maxStartInPercentage) / 100);
  if (lateStarts < people.length) shuffle(people);
  for (let i = 0; i < lateStarts; ++i) {
    const start = randomNumber(1, maxStart);
    people[i] = { ...people[i], start };
  }
  return people.sort((a, b) => a.uuid.localeCompare(b.uuid));
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
