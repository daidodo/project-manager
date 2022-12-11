/* eslint jest/no-conditional-expect: "off" */
/* eslint @typescript-eslint/no-unused-vars: "off" */

import { isNumber } from '@dozerg/condition';

import { assignTasks } from './';
import { generateProject } from './generate';
import { calcEfficiency } from './solution';
import { toTimelineString } from './timeline';
import { verifySolution } from './verify';

const RANDOM = true;

function genTaskAndPeople() {
  if (RANDOM) return generateProject(9, 2);

  const tasks = [
    { uuid: 'A', timeToDelivery: 1 },
    { uuid: 'B', timeToDelivery: 3, dependencies: ['A'] },
    { uuid: 'C', timeToDelivery: 2, dependencies: ['A', 'B'] },
    { uuid: 'D', timeToDelivery: 5, dependencies: ['A', 'B', 'C'] },
    { uuid: 'E', timeToDelivery: 4, dependencies: ['A', 'C', 'D'] },
    { uuid: 'F', timeToDelivery: 2, dependencies: ['A', 'C', 'E'] },
    { uuid: 'G', timeToDelivery: 3 },
    { uuid: 'H', timeToDelivery: 3, dependencies: ['E', 'F'] },
    { uuid: 'I', timeToDelivery: 1, dependencies: ['D', 'G', 'H'] },
    { uuid: 'J', timeToDelivery: 2, dependencies: ['D', 'G', 'H'] },
    { uuid: 'K', timeToDelivery: 2, dependencies: ['J'] },
    { uuid: 'L', timeToDelivery: 3, dependencies: ['G', 'J', 'K'] },
  ];
  const people = [
    {
      uuid: 'P1',
      holidays: [6, 11, 51, 57, 59],
    },
    {
      uuid: 'P2',
      holidays: [
        {
          from: 0,
          days: 2,
        },
        {
          from: 15,
          days: 2,
        },
        21,
        27,
        29,
        {
          from: 31,
          days: 2,
        },
        34,
        40,
        44,
        52,
      ],
    },
  ];
  return { tasks, people };
}

describe('assignTasks', () => {
  const { tasks, people } = genTaskAndPeople();
  console.log('tasks =', tasks);
  console.log('people =', JSON.stringify(people, null, '  '));
  it('should pass the test', () => {
    const solution = assignTasks(tasks, people);
    // console.log('solution: ', JSON.stringify(solution, null, '  '));
    expect(verifySolution(solution, tasks, people)).toBeTruthy();
    const { timeEfficiency, resourceEfficiency, neededDays, availableDays } = calcEfficiency(
      solution,
      tasks,
      people,
    );
    if (isNumber(timeEfficiency))
      console.log(
        `Time efficiency = ${timeEfficiency}% (${solution.criticalTime}/${solution.totalTime})`,
      );
    console.log(`Resource efficiency = ${resourceEfficiency}% (${neededDays}/${availableDays})`);
    const timelineString = toTimelineString(solution, people);
    console.log('timelines =\n', timelineString);
    expect(timelineString).toBeDefined();
  });
});
