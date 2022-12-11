import PersonExt from './PersonExt';
import {
  Person,
  Solution,
} from './types';

type Timeline = Map<string, string>[];

export function toTimelineString(solution: Solution, people: Person[]) {
  const timeline: Timeline = Array(solution.totalTime);
  for (let i = 0; i < solution.totalTime; ++i) timeline[i] = new Map();
  people.forEach(p => {
    const { holidays } = new PersonExt(p);
    holidays?.forEach(d => {
      if (d < timeline.length) timeline[d].set(p.uuid, '-');
    });
  });
  solution.assignments.forEach(a => {
    a.workDays.forEach(d => timeline[d].set(a.personId, a.taskId));
  });
  return toString(timeline, people);
}

function toString(timeline: Timeline, people: Person[]) {
  const personIds = people.map(p => p.uuid);
  const title = [' ', ...personIds].join('\t');
  const dailyAssigns = timeline.map((t, i) => {
    const personAssigns = people.map(p => t.get(p.uuid) ?? ' ');
    return [`${i}`, ...personAssigns].join('\t');
  });
  return [title, ...dailyAssigns, `${timeline.length}\t---`].join('\n');
}
