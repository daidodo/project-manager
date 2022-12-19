import {
  assertIsNumber,
  isNonNull,
} from '@dozerg/condition';

import PersonExt from './PersonExt';
import {
  Assignment,
  Person,
  Solution,
  Task,
} from './types';

export function verifySolution(solution: Solution, tasks: Task[], people: Person[]) {
  const { assignments } = solution;
  // Check totalTime
  if (!verifyTotalTime(solution)) return false;
  // Check tasks
  if (assignments.length !== tasks.length) return false;
  if (tasks.some(t => !verifyTask(t, solution, people))) return false;
  // Check people
  if (people.some(p => !verifyPerson(p, solution))) return false;

  return true;
}

function verifyTotalTime(solution: Solution) {
  const { assignments, totalTime } = solution;
  const needTimes = assignments.map(a => nextStart(a));
  return totalTime === Math.max(...needTimes);
}

function nextStart(assignment: Assignment) {
  const [end] = assignment.workDays.slice(-1);
  assertIsNumber(end);
  return end + 1;
}

function verifyTask(task: Task, { assignments }: Solution, people: Person[]) {
  // Has assignment
  const assignment = assignments.find(a => a.taskId === task.uuid);
  if (!assignment) return false;
  // Deliver time is enough
  if (task.effort !== assignment.workDays.length) return false;
  // Assignee is known
  if (!people.some(p => p.uuid === assignment.personId)) return false;
  // Dependencies finsh first
  if (task.dependencies) {
    const depEnds = task.dependencies
      .map(id => assignments.find(a => a.taskId === id))
      .filter(isNonNull)
      .map(a => nextStart(a));
    if (depEnds.length !== task.dependencies.length) return false;
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
