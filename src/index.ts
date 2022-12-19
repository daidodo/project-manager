import {
  List,
  Map,
  Set,
} from 'immutable';

import { assertNonNull } from '@dozerg/condition';

import PersonExt from './PersonExt';
import { compareSolutions } from './solution';
import TaskExt from './TaskExt';
import {
  Person,
  Solution,
  Task,
} from './types';

interface TaskAssign {
  readonly personId: string;
  readonly workDays: number[];
}

interface Params {
  readyTasks: Set<TaskExt>;
  taskAssign: Map<string, TaskAssign>; // task uuid => list of TaskAssign
  personAssign: Map<string, List<string>>; // person uuid => task uuid
}

export function assignTasks(tasks: Task[], people: Person[]): Solution {
  const peopleMap = Map(people.map(p => [p.uuid, new PersonExt(p)]));
  const tasksMap = createTasksMap(tasks);

  const criticalTime = calcCriticalTime([...tasksMap.values()]);
  const readyTasks = Set(
    [...tasksMap.values()].filter(t => !t.dependencies || t.dependencies.length < 1),
  );
  const params: Params = {
    readyTasks,
    personAssign: Map(),
    taskAssign: Map(),
  };
  return { ...calcBestSolution(peopleMap, tasksMap, params), criticalTime };
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

function calcBestSolution(
  peopleMap: Map<string, PersonExt>,
  tasksMap: Map<string, TaskExt>,
  p: Params,
): Solution {
  if (p.readyTasks.size < 1) return generateSolution(p);
  const peopleAvailability = calcPeopleAvailability(peopleMap, p);
  const tasks = calcNextTasks(p);
  const solutions = peopleAvailability.flatMap(({ person, personStart }) =>
    tasks.map(task => {
      const start = calcTaskStart(task, personStart, p);
      const workDays = person.calcWorkDays(start, task.effort);
      const taskAssign = p.taskAssign.set(task.uuid, { personId: person.uuid, workDays });
      const personAssign = p.personAssign.update(person.uuid, List(), tasks =>
        tasks.push(task.uuid),
      );
      const readyTasks = p.readyTasks.withMutations(s => {
        s.delete(task);
        task.dependants?.forEach(t => {
          const ready = !t.dependencies?.some(d => !taskAssign.has(d.uuid));
          if (ready) s.add(t);
        });
      });
      return calcBestSolution(peopleMap, tasksMap, { readyTasks, taskAssign, personAssign });
    }),
  );
  return solutions.reduce((a, b) => (compareSolutions(a, b) <= 0 ? a : b));
}

function generateSolution(p: Params): Solution {
  const assignments = p.taskAssign.toArray().map(([taskId, { personId, workDays }]) => ({
    taskId,
    personId,
    workDays,
  }));
  const starts = [...p.taskAssign.values()].map(assign => calcAssignmentEnd(assign));
  const totalTime = Math.max(...starts);
  return { totalTime, assignments };
}

function calcPeopleAvailability(peopleMap: Map<string, PersonExt>, p: Params) {
  return peopleMap.toArray().map(([_, person]) => ({
    person,
    personStart: calcPersonAvailability(person, p),
  }));
}

function calcPersonAvailability(person: PersonExt, p: Params) {
  const taskId = p.personAssign.get(person.uuid)?.last();
  if (!taskId) return person.calcNextAvailability(0);
  const assignment = p.taskAssign.get(taskId);
  assertNonNull(assignment);
  const nextStart = calcAssignmentEnd(assignment);
  return person.calcNextAvailability(nextStart);
}

function calcNextTasks(p: Params) {
  // TODO
  return p.readyTasks.toArray();
}

function calcTaskStart(task: TaskExt, personStart: number, p: Params) {
  const starts = task.dependencies?.map(t => {
    const assignment = p.taskAssign.get(t.uuid);
    assertNonNull(assignment);
    return calcAssignmentEnd(assignment);
  });
  return Math.max(personStart, ...(starts ?? []));
}

function calcAssignmentEnd(assignment: TaskAssign) {
  const [lastDay] = assignment.workDays.slice(-1);
  assertNonNull(lastDay);
  return lastDay + 1;
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
