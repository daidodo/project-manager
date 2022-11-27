import {
  assertIsNumber,
  assertNonNull,
  assertTrue,
} from '@dozerg/condition';

import {
  Person,
  Task,
} from './types';

export function assignTasks(tasks: Task[], people: Person[]) {
  const tasksMap = new Map<string, TaskExt>(
    tasks.map(t => [t.uuid, { ...t, criticalTime: -1, earliestStart: 0 }]),
  );
  calcDependantMap(tasksMap);
  const readyTasks = new Set(
    [...tasksMap.values()].filter(t => !t.dependencies || t.dependencies.length < 1),
  );
  readyTasks.forEach(task => calcCriticalTime(task));
  const peopleExt = people.map(p => ({ ...p, nextAvailability: 0 }));
  for (; readyTasks.size > 0; ) {
    // assign task to person
    const person = calcNextPerson(peopleExt);
    const task = calcNextTask(readyTasks, person);
    task.assignee = person;
    task.start = Math.max(person.nextAvailability, task.earliestStart);
    // update person availability
    person.nextAvailability = task.start + task.timeToDelivery;
    // remove task from ready tasks
    readyTasks.delete(task);
    // find ready tasks
    task.dependants?.forEach(t => {
      // update earliest start
      t.earliestStart = Math.max(t.earliestStart, person.nextAvailability);
      if (isTaskReady(t, tasksMap)) readyTasks.add(t);
    });
  }
  return tasksMap;
}

export function toResourceMap(people: Person[], tasks: Map<string, TaskExt>) {
  return people.map(person => {
    const timeline = [...tasks.values()]
      .map(({ uuid, assignee, start, timeToDelivery }) => {
        assertNonNull(assignee);
        assertIsNumber(start);
        return { uuid, assignee, start, timeToDelivery };
      })
      .filter(t => t.assignee.uuid === person.uuid)
      .sort((t1, t2) => t1.start - t2.start)
      .reduce((r, t) => {
        if (r.length < t.start) r.push(...Array(t.start - r.length));
        if (t.timeToDelivery > 0) r.push(...Array(t.timeToDelivery).fill(t.uuid));
        return r;
      }, Array<string>());
    return timeline;
  });
}

interface TaskExt extends Task {
  dependants?: TaskExt[];
  criticalTime: number;
  assignee?: Person;
  earliestStart: number;
  start?: number;
}

interface PersonExt extends Person {
  nextAvailability: number;
}

function calcDependantMap(tasks: Map<string, TaskExt>) {
  tasks.forEach((task, _, map) => {
    task.dependencies?.forEach(id => {
      const dependency = map.get(id);
      assertNonNull(dependency, `Cannot find dependency for task`, {
        task,
        dependency: id,
        allTasks: tasks,
      });
      if (dependency.dependants) dependency.dependants.push(task);
      else dependency.dependants = [task];
    });
  });
}

function calcCriticalTime(task: TaskExt): number {
  if (task.criticalTime < 0) {
    const base = task.dependants?.reduce((r, d) => Math.max(r, calcCriticalTime(d)), 0);
    task.criticalTime = task.timeToDelivery + (base ?? 0);
  }
  return task.criticalTime;
}

function calcNextTask(ready: Set<TaskExt>, person: PersonExt) {
  const tasks = [...ready.keys()];
  const immediate = tasks.filter(t => t.earliestStart <= person.nextAvailability);
  if (immediate.length > 0) return calcPriorityTask(immediate);
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
  return tasks.reduce((r, t) => {
    return r.criticalTime < t.criticalTime ? t : r;
  });
}

function calcNextPerson(people: PersonExt[]) {
  return people.reduce((r, p) => (p.nextAvailability < r.nextAvailability ? p : r));
}

function isTaskReady(task: Task, tasks: Map<string, TaskExt>) {
  return !task.dependencies?.some(id => {
    const dependency = tasks.get(id);
    assertNonNull(dependency, `Cannot find dependency for task`, {
      task,
      dependency: id,
      allTasks: tasks,
    });
    return !dependency.assignee;
  });
}
