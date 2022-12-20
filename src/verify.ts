import { assertNonNull } from '@dozerg/condition';

import PersonExt from './PersonExt';
import {
  DEFAULT_DEPENDS_ON,
  Person,
  Solution,
  Task,
} from './types';
import { calcNextWorkDay } from './utils';

export function verifySolution(solution: Solution, tasks: Task[], people: Person[]) {
  const { assignments } = solution;
  // Check stats
  if (!verifyStats(solution, tasks)) return false;
  // Check tasks
  if (assignments.length !== tasks.length) return false;
  if (tasks.some(t => !verifyTask(t, solution, tasks, people))) return false;
  // Check people
  if (people.some(p => !verifyPerson(p, solution))) return false;

  return true;
}

function verifyStats(solution: Solution, tasks: Task[]) {
  const { assignments, totalWorkDays, deliveryTime } = solution;
  // No. of work days is correct
  const workDays = assignments.reduce((r, a) => Math.max(r, calcNextWorkDay(a.workDays)), 0);
  if (workDays !== totalWorkDays) return false;
  // Delivery days is correct
  const delivery = assignments.reduce((r, a) => {
    const task = tasks.find(t => t.uuid === a.taskId);
    assertNonNull(task);
    const d = calcNextWorkDay(a.workDays) + (task.leadTime ?? 0);
    return Math.max(r, d);
  }, 0);
  return delivery === deliveryTime;
}

function verifyTask(task: Task, { assignments }: Solution, tasks: Task[], people: Person[]) {
  // Has assignment
  const assignment = assignments.find(a => a.taskId === task.uuid);
  if (!assignment) return false;
  // Work days is enough
  if (task.effort !== assignment.workDays.length) return false;
  // Assignee is known
  if (!people.some(p => p.uuid === assignment.personId)) return false;
  // Check dependencies
  if (task.dependencies) {
    const depEnds = task.dependencies.map(d => {
      const { uuid, dependsOn } =
        typeof d === 'string' ? { uuid: d, dependsOn: DEFAULT_DEPENDS_ON } : d;
      const assigment = assignments.find(a => a.taskId === uuid);
      assertNonNull(assigment);
      let end = calcNextWorkDay(assigment.workDays);
      if (dependsOn === 'delivery') {
        const depTask = tasks.find(t => t.uuid === uuid);
        assertNonNull(depTask);
        end += depTask.leadTime ?? 0;
      }
      return end;
    });
    const depEndMax = Math.max(...depEnds);
    if (assignment.workDays[0] < depEndMax) return false;
  }
  return true;
}

function verifyPerson(person: Person, solution: Solution) {
  const assignments = solution.assignments
    .filter(a => a.personId === person.uuid)
    .sort((a, b) => a.workDays[0] - b.workDays[0]);
  const personExt = new PersonExt(person);
  const workDays = assignments.flatMap(a => a.workDays);
  // No overlapped work days
  const uniqueWorkDays = new Set(workDays);
  if (uniqueWorkDays.size != workDays.length) return false;
  // No works in holidays
  if (workDays.some(day => personExt.isHoliday(day))) return false;
  return true;
}
