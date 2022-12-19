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
  totalTime: number;
  verify?: (solution: Solution) => boolean;
}

describe('assignTasks', () => {
  const examples = genExamples();
  examples.forEach(({ title, tasks, people, totalTime, verify }) =>
    describe(title, () => {
      it('should pass the test', () => {
        const solution = assignTasks(tasks, people);
        expect(verifySolution(solution, tasks, people)).toBeTruthy();
        expect(solution.totalTime).toEqual(totalTime);
        if (verify) expect(verify(solution)).toBeTruthy();
      });
    }),
  );
  describe('Random', () => {
    const RANDOM = true;
    const { tasks, people } = RANDOM ? generateProject(9, 2) : example_2();
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
});

function genExamples(): Setting[] {
  return [examples_1(), example_2()];
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
  return { title: 'Example 1', tasks, people, totalTime: 27 };
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
    totalTime: 21,
    verify: solution => solution.assignments.find(a => a.taskId === 'G')?.workDays[0] === 0,
  };
}
