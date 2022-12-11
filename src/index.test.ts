/* eslint jest/no-conditional-expect: "off" */
/* eslint @typescript-eslint/no-unused-vars: "off" */

import { assignTasks } from './';
import { generateProject } from './generate';
import { calcEfficiency } from './solution';
import { toTimelineString } from './timeline';
import { verifySolution } from './verify';

describe('assignTasks', () => {
  /*
  const tasks = [
    { uuid: 'A', timeToDelivery: 5 },
    { uuid: 'B', timeToDelivery: 5 },
    { uuid: 'C', timeToDelivery: 5, dependencies: ['B'] },
    { uuid: 'D', timeToDelivery: 3, dependencies: ['B'] },
    { uuid: 'E', timeToDelivery: 5 },
  ];
  const people = [
    {
      uuid: 'P1',
      holidays: [
        0,
        2,
        8,
        10,
        16,
        {
          from: 29,
          days: 3,
        },
        {
          from: 35,
          days: 2,
        },
        42,
      ],
    },
    {
      uuid: 'P2',
      holidays: [
        0,
        2,
        8,
        13,
        {
          from: 17,
          days: 2,
        },
        25,
        28,
        30,
        35,
        43,
      ],
    },
  ]; //*/
  describe('Random', () => {
    const { tasks, people } = generateProject(12, 2);
    console.log('tasks =', tasks);
    console.log('people =', JSON.stringify(people, null, '  '));
    it('should pass the test', () => {
      const solution = assignTasks(tasks, people);
      // console.log('solution: ', JSON.stringify(solution, null, '  '));
      expect(verifySolution(solution, tasks, people)).toBeTruthy();
      const efficiency = calcEfficiency(solution);
      console.log(`efficiency = ${efficiency}% (${solution.criticalTime}/${solution.totalTime})`);
      expect(efficiency).toBeDefined();
      const timelineString = toTimelineString(solution, people);
      console.log('timelines =\n', timelineString);
      expect(timelineString).toBeDefined();
    });
  });
});
