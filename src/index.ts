import {
  assertNonNull,
  assertTrue,
} from '@dozerg/condition';

import PersonExt from './PersonExt';
import TaskExt from './TaskExt';
import {
  Person,
  Task,
} from './types';

export function assignTasks(tasks: Task[], people: Person[]) {
  const tasksMap = new Map<string, TaskExt>(tasks.map(t => [t.uuid, new TaskExt(t)]));

  // calc tasks' depandencies and dependants
  tasksMap.forEach((task, _, map) => task.calcDependency(map));

  const readyTasks = new Set(
    [...tasksMap.values()].filter(t => !t.dependencies || t.dependencies.length < 1),
  );

  const peopleExt = people.map(p => new PersonExt(p));

  for (; readyTasks.size > 0; ) {
    // find available person and task
    const person = calcNextPerson(peopleExt);
    const task = calcNextTask(readyTasks, person);
    // assign task to person
    assignTask(task, person);
    // remove task from ready tasks
    readyTasks.delete(task);
    // find ready tasks
    task.dependants?.forEach(t => {
      // update earliest start
      if (t.isReadyToPick) readyTasks.add(t);
    });
  }
  return tasksMap;
}

export function toResourceMap(people: Person[], tasks: Map<string, TaskExt>) {
  return people.map(person => {
    const timeline = [...tasks.values()]
      .map(({ uuid, assignment, timeToDelivery }) => {
        assertNonNull(assignment);
        const { assignee, start } = assignment;
        return { uuid, assignee, start, timeToDelivery };
      })
      .filter(t => t.assignee.uuid === person.uuid)
      .sort((t1, t2) => t1.start - t2.start)
      .reduce((r, t) => {
        if (r.length < t.start) r.push(...Array(t.start - r.length));
        assertTrue(r.length === t.start);
        if (t.timeToDelivery > 0) r.push(...Array(t.timeToDelivery).fill(t.uuid));
        return r;
      }, Array<string>());
    return timeline;
  });
}

function calcNextTask(ready: Set<TaskExt>, person: PersonExt) {
  const tasks = [...ready.keys()];
  // find tasks can start immediately.
  const immediate = tasks.filter(t => t.earliestStart <= person.nextAvailability);
  if (immediate.length > 0) return calcPriorityTask(immediate);
  // find tasks can start at the earliest time.
  const earliest = tasks.reduce((r, t) => {
    const [p] = r;
    if (!p || p.earliestStart === t.earliestStart) r.push(t);
    else if (p.earliestStart > t.earliestStart) return [t];
    return r;
  }, Array<TaskExt>());
  assertTrue(earliest.length > 0);
  return calcPriorityTask(earliest);
}

function calcPriorityTask(tasks: TaskExt[]) {
  return tasks.reduce((r, t) => (r.criticalTime < t.criticalTime ? t : r));
}

function calcNextPerson(people: PersonExt[]) {
  return people.reduce((r, p) => (p.nextAvailability < r.nextAvailability ? p : r));
}

function assignTask(task: TaskExt, person: PersonExt) {
  const start = Math.max(person.nextAvailability, task.earliestStart);
  const end = person.assign(task, start);
  task.assign(person, start, end);
}
