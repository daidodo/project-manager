/* eslint-disable jest/valid-title */
/* eslint jest/no-conditional-expect: "off" */
/* eslint @typescript-eslint/no-unused-vars: "off" */

import { isNumber } from '@dozerg/condition';

import { assignTasks } from './';
import { generateProject } from './generate';
import { calcEfficiency } from './solution';
import { toTimelineString } from './timeline';
import {
  Person,
  Solution,
  Task,
} from './types';
import { verifySolution } from './verify';

interface Setting {
  title: string;
  tasks: Task[];
  people: Person[];
  deliveryTime: number;
  verify?: (solution: Solution) => boolean;
}

describe('assignTasks', () => {
  const examples = genExamples();
  examples.forEach(({ title, tasks, people, deliveryTime, verify }) =>
    describe(title, () => {
      it('should pass the test', () => {
        const solution = assignTasks(tasks, people);
        expect(verifySolution(solution, tasks, people)).toBeTruthy();
        expect(solution.deliveryTime).toEqual(deliveryTime);
        if (verify) expect(verify(solution)).toBeTruthy();
      });
    }),
  );
  describe('Random', () => {
    const RANDOM = true;
    const { tasks, people, verify } = RANDOM ? (generateProject(8, 2) as Setting) : example_3();
    console.log('tasks =', JSON.stringify(tasks, null, '  '));
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
          `Time efficiency = ${timeEfficiency}% (${solution.criticalTime}/${solution.deliveryTime})`,
        );
      console.log(`Resource efficiency = ${resourceEfficiency}% (${neededDays}/${availableDays})`);
      const timelineString = toTimelineString(solution, tasks, people);
      console.log(timelineString);
      if (verify) expect(verify(solution)).toBeTruthy();
    });
  });
});

function genExamples(): Setting[] {
  return [examples_1(), example_2(), example_3()];
}

function examples_1() {
  const tasks = [
    { uuid: 'A', effort: 1 },
    { uuid: 'B', effort: 3, dependencies: ['A'] },
    { uuid: 'C', effort: 2, dependencies: ['A', 'B'] },
    { uuid: 'D', effort: 5, dependencies: ['A', 'B', 'C'] },
    { uuid: 'E', effort: 4, dependencies: ['A', 'C', 'D'] },
    { uuid: 'F', effort: 2, dependencies: ['A', 'C', 'E'] },
    { uuid: 'G', effort: 3 },
    { uuid: 'H', effort: 3, dependencies: ['E', 'F'] },
    { uuid: 'I', effort: 1, dependencies: ['D', 'G', 'H'] },
    { uuid: 'J', effort: 2, dependencies: ['D', 'G', 'H'] },
    { uuid: 'K', effort: 2, dependencies: ['J'] },
    { uuid: 'L', effort: 3, dependencies: ['G', 'J', 'K'] },
  ];
  const people = [
    {
      uuid: 'P1',
      holidays: [6, 11, 51, 57, 59],
    },
    {
      uuid: 'P2',
      holidays: [
        { from: 0, days: 2 },
        { from: 15, days: 2 },
        21,
        27,
        29,
        { from: 31, days: 2 },
        34,
        40,
        44,
        52,
      ],
    },
  ];
  return { title: 'Example 1', tasks, people, deliveryTime: 27 };
}

function example_2(): Setting {
  const tasks = [
    { uuid: 'A', effort: 5 },
    { uuid: 'B', effort: 4, dependencies: ['A'] },
    { uuid: 'C', effort: 3, dependencies: ['A'] },
    { uuid: 'D', effort: 2, dependencies: ['C'] },
    { uuid: 'E', effort: 4, dependencies: ['B'] },
    { uuid: 'F', effort: 1, dependencies: ['B', 'D'] },
    { uuid: 'G', effort: 2 },
    { uuid: 'H', effort: 3, dependencies: ['D', 'E'] },
    { uuid: 'I', effort: 3, dependencies: ['F', 'H'] },
  ];
  const people = [
    {
      uuid: 'P1',
      holidays: [
        2,
        17,
        24,
        { from: 27, days: 3 },
        33,
        35,
        { from: 39, days: 2 },
        46,
        { from: 48, days: 2 },
      ],
    },
    {
      uuid: 'P2',
      holidays: [
        { from: 2, days: 2 },
        { from: 16, days: 2 },
        20,
        24,
        { from: 29, days: 2 },
        44,
        50,
        53,
      ],
    },
  ];
  return {
    title: 'Example 2',
    tasks,
    people,
    deliveryTime: 21,
    verify: solution => solution.assignments.find(a => a.taskId === 'G')?.workDays[0] === 0,
  };
}

function example_3(): Setting {
  const tasks = [
    { uuid: 'A', effort: 2, leadTime: 4 },
    { uuid: 'B', effort: 4, leadTime: 3, dependencies: ['A'] },
    { uuid: 'C', effort: 3, dependencies: ['A'] },
    {
      uuid: 'D',
      effort: 4,
      leadTime: 3,
      dependencies: ['A', 'B', 'C'],
    },
    { uuid: 'E', effort: 3, leadTime: 5 },
    { uuid: 'F', effort: 3, leadTime: 4, dependencies: ['C', 'E'] },
    { uuid: 'G', effort: 1, leadTime: 3 },
    { uuid: 'H', effort: 1, leadTime: 4 },
  ];
  const people = [
    {
      uuid: 'P1',
      holidays: [19, 21, 28, 35],
    },
    {
      uuid: 'P2',
      holidays: [14, 19, 26, 32],
    },
  ];
  return {
    title: 'Example 3',
    tasks,
    people,
    deliveryTime: 20,
    verify: solution => solution.criticalTime === 20,
  };
}
