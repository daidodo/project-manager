import { isNonNull } from '@dozerg/condition';

import {
  Person,
  Solution,
  Task,
} from './types';

export function verifySolution(solution: Solution, tasks: Task[], people: Person[]) {
  const { assignments, totalTime } = solution;
  // Check totalTime
  if (totalTime !== Math.max(...assignments.map(s => s.end))) return false;
  // Check tasks
  if (assignments.length !== tasks.length) return false;
  if (tasks.some(t => !verifyTask(t, solution, people))) return false;
  // Check people
  if (people.some(p => !verifyPerson(p, solution))) return false;

  return true;
}

function verifyTask(task: Task, { assignments }: Solution, people: Person[]) {
  // Has assignment
  const assignment = assignments.find(a => a.taskId === task.uuid);
  if (!assignment) return false;
  // Deliver time is enough
  if (assignment.end < assignment.start + task.timeToDelivery) return false;
  // Assignee is known
  if (!people.some(p => p.uuid === assignment.personId)) return false;
  // Dependencies finsh first
  if (task.dependencies) {
    const depEnds = task.dependencies
      .map(id => assignments.find(a => a.taskId === id)?.end)
      .filter(isNonNull);
    if (depEnds.length !== task.dependencies.length) return false;
    const depEndMax = Math.max(...depEnds);
    if (assignment.start < depEndMax) return false;
  }
  return true;
}

function verifyPerson(person: Person, { assignments }: Solution) {
  // No overlapped tasks
  const tasks = assignments
    .filter(a => a.personId === person.uuid)
    .sort((a, b) => a.start - b.start);
  let prevEnd = person.start ?? 0;
  for (const task of tasks) {
    if (task.start < prevEnd) return false;
    prevEnd = task.end;
  }
  return true;
}
