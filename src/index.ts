import {
  Map,
  Set,
} from 'immutable';

import {
  assertNonNull,
  assertTrue,
} from '@dozerg/condition';

import TaskExt from './TaskExt';
import {
  Person,
  Solution,
  Task,
} from './types';

interface TaskAssign {
  readonly personId: string;
  readonly start: number;
  readonly end: number;
}

interface Params {
  readyTasks: Set<TaskExt>;
  assignments: Map<string, TaskAssign>; // task uuid => assignment
  availability: Map<string, number>; // person uuid => availability
}

export function toResourceMap(solution: Solution, people: Person[]) {
  return people.map(person => {
    const timeline = solution.assignments
      .filter(a => a.personId === person.uuid)
      .sort((t1, t2) => t1.start - t2.start)
      .reduce((r, t) => {
        if (r.length < t.start) r.push(...Array(t.start - r.length).fill(' '));
        assertTrue(r.length === t.start);

        // TODO
        const timeToDelivery = t.end - t.start;

        if (timeToDelivery > 0) r.push(...Array(timeToDelivery).fill(t.taskId));
        return r;
      }, Array<string>());
    return timeline;
  });
}

export function assignTasks(tasks: Task[], people: Person[]): Solution {
  const tasksMap = createTasksMap(tasks);
  const criticalTime = calcCriticalTime([...tasksMap.values()]);
  const readyTasks = Set(
    [...tasksMap.values()].filter(t => !t.dependencies || t.dependencies.length < 1),
  );
  const availability = Map(people.map(p => [p.uuid, p.start ?? 0]));
  const params: Params = { readyTasks, availability, assignments: Map() };
  return { ...calcBestSolution(people, tasksMap, params), criticalTime };
}

function createTasksMap(tasks: Task[]) {
  return Map(tasks.map(t => [t.uuid, new TaskExt(t)])).withMutations(map => {
    map.forEach((task, _, all) => {
      task.calcDependency(all);
    });
  });
}

function calcCriticalTime(tasks: TaskExt[]) {
  return Math.max(...tasks.map(t => t.criticalTime));
}

function calcBestSolution(people: Person[], tasksMap: Map<string, TaskExt>, p: Params): Solution {
  if (p.readyTasks.size < 1) return generateSolution(p);
  const { person, personStart } = calcNextPerson(people, p);
  const tasks = calcNextTasks(person, p);
  const solutions = tasks.map(task => {
    const start = calcStart(task, personStart, p);
    const end = calcEnd(task, start, person);
    const assignments = p.assignments.set(task.uuid, { personId: person.uuid, start, end });
    const availability = p.availability.set(person.uuid, end);
    const readyTasks = p.readyTasks.withMutations(s => {
      s.delete(task);
      task.dependants?.forEach(t => {
        const ready = !t.dependencies?.some(d => !assignments.has(d.uuid));
        if (ready) s.add(t);
      });
    });
    return calcBestSolution(people, tasksMap, { readyTasks, assignments, availability });
  });
  return solutions.reduce((a, b) => (a.totalTime > b.totalTime ? b : a));
}

function generateSolution(p: Params) {
  const assignments = p.assignments.toArray().map(([taskId, v]) => ({ ...v, taskId }));
  const totalTime = Math.max(...assignments.map(a => a.end));
  return { totalTime, assignments };
}

function calcNextPerson(people: Person[], p: Params) {
  const [id, personStart] = p.availability.toArray().reduce((a, b) => (a[1] <= b[1] ? a : b));
  assertNonNull(id);
  assertNonNull(personStart);
  const person = people.find(p => p.uuid === id);
  assertNonNull(person);
  return { person, personStart };
}

function calcNextTasks(person: Person, p: Params) {
  // TODO
  return p.readyTasks.toArray();
}

function calcStart(task: TaskExt, personStart: number, p: Params) {
  const ends = task.dependencies?.map(t => {
    const assignment = p.assignments.get(t.uuid);
    assertNonNull(assignment);
    return assignment.end;
  });
  return Math.max(personStart, ...(ends ?? []));
}

function calcEnd(task: TaskExt, start: number, person: Person) {
  return start + task.timeToDelivery;
}

// =========================

// function calcNextTask(ready: Set<TaskExt>, person: PersonExt) {
//   const tasks = [...ready.keys()];
//   // find tasks can start immediately.
//   const immediate = tasks.filter(t => t.earliestStart <= person.nextAvailability);
//   if (immediate.length > 0) return calcPriorityTask(immediate);
//   // find tasks can start at the earliest time.
//   const earliest = tasks.reduce((r, t) => {
//     const [p] = r;
//     if (!p || p.earliestStart === t.earliestStart) r.push(t);
//     else if (p.earliestStart > t.earliestStart) return [t];
//     return r;
//   }, Array<TaskExt>());
//   assertTrue(earliest.length > 0);
//   return calcPriorityTask(earliest);
// }

// function calcPriorityTask(tasks: TaskExt[]) {
//   return tasks.reduce((r, t) => (r.criticalTime < t.criticalTime ? t : r));
// }
