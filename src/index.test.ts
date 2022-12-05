/* eslint jest/no-conditional-expect: "off" */

import {
  assignTasks,
  toResourceMap,
} from './';
import { generateProject } from './generate';
import { calcEfficiency } from './solution';
import { verifySolution } from './verify';

describe('assignTasks', () => {
  describe('Random', () => {
    const { tasks, people } = generateProject(13, 2);
    console.log('tasks =', tasks);
    console.log('people =', people);
    it('should pass the test', () => {
      const solution = assignTasks(tasks, people);
      expect(verifySolution(solution, tasks, people)).toBeTruthy();
      const efficiency = calcEfficiency(solution);
      console.log(`efficiency = ${efficiency}% (${solution.criticalTime}/${solution.totalTime})`);
      expect(efficiency).toBeDefined();
      const timelines = toResourceMap(solution, people);
      console.log('timelines =', timelines);
      expect(timelines).toBeDefined();
    });
  });
});
