import {
  assertNonNull,
  assertTrue,
} from '@dozerg/condition';
import {
  concatArray,
  mergeOptions,
  Merger,
} from '@dozerg/merge-options';

import PersonExt from './PersonExt';
import {
  Person,
  Solution,
  Task,
} from './types';
import { calcNextWorkDay } from './utils';

interface WorkDay {
  workOn?: string;
  wait?: string[];
}

type Timeline = Map<string, WorkDay>[];

const merger: Merger<WorkDay> = {
  wait: concatArray(),
};

export function toTimelineString(solution: Solution, tasks: Task[], people: Person[]) {
  const timeline: Timeline = Array(solution.deliveryTime);
  for (let i = 0; i < solution.deliveryTime; ++i) timeline[i] = new Map();
  people.forEach(p => {
    const { holidays } = new PersonExt(p);
    holidays?.forEach(d => updateWorkDay(timeline, d, p.uuid, { workOn: '-' }));
  });
  solution.assignments.forEach(a => {
    a.workDays.forEach(d => updateWorkDay(timeline, d, a.personId, { workOn: a.taskId }));
    const task = tasks.find(t => t.uuid === a.taskId);
    assertNonNull(task);
    if (task.leadTime && task.leadTime > 0) {
      const s = calcNextWorkDay(a.workDays);
      for (let i = 0; i < task.leadTime; ++i)
        updateWorkDay(timeline, s + i, a.personId, { wait: [a.taskId] });
    }
  });
  return toString(timeline, solution, people);
}

function updateWorkDay(timeline: Timeline, day: number, personId: string, workDay: WorkDay) {
  if (day >= timeline.length) return;
  const t = timeline[day];
  const w = t.get(personId);
  t.set(personId, mergeOptions(merger, w, workDay));
}

function toString(timeline: Timeline, solution: Solution, people: Person[]) {
  const personIds = people.map(p => p.uuid);
  const title = ['', ...personIds];
  const dailyAssigns = timeline.map((t, i) => {
    const personAssigns = people.map(p => {
      const d = t.get(p.uuid);
      if (!d) return '';
      return (
        (d.workOn ?? ' ') + (d.wait && d.wait.length > 0 ? `(${d.wait.sort().join(',')})` : '')
      );
    });
    return [`${i}`, ...personAssigns];
  });
  return formatTable(title, dailyAssigns, solution);
}

function formatTable(title: string[], table: string[][], solution: Solution) {
  const cl = table.reduce((r, a) => {
    assertTrue(r.length === a.length);
    for (let i = 0; i < r.length; ++i) r[i] = Math.max(r[i], a[i].length);
    return r;
  }, Array(title.length).fill(4));
  const { totalWorkDays, deliveryTime } = solution;
  const lines = Array<string>();
  [title, ...table].forEach((row, i) => {
    const line = row.map((c, i) => c.padEnd(cl[i], ' ')).join('  ');
    lines.push(line);
    if (i === totalWorkDays) lines.push(`${totalWorkDays} ---`);
  });
  lines.push(`${deliveryTime} ---`);
  return lines.join('\n');
}
