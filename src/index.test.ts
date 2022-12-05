import {
  assignTasks,
  toResourceMap,
} from './';
import { generateProject } from './generate';
import {
  Person,
  Task,
} from './types';
import { verifySolution } from './verify';

// https://www.youtube.com/watch?v=nKF9DjXfbuU&t=6s
describe('Suite', () => {
  describe('Example 1', () => {
    const tasks: Task[] = [
      { uuid: 'A', timeToDelivery: 2 },
      { uuid: 'B', timeToDelivery: 3 },
      { uuid: 'C', timeToDelivery: 4 },
      { uuid: 'D', timeToDelivery: 3, dependencies: ['A'] },
      { uuid: 'E', timeToDelivery: 6, dependencies: ['A'] },
      { uuid: 'F', timeToDelivery: 5, dependencies: ['E', 'B'] },
      { uuid: 'G', timeToDelivery: 2, dependencies: ['F', 'C'] },
      { uuid: 'H', timeToDelivery: 4 },
    ];
    const people: Person[] = [{ uuid: 'P1' }, { uuid: 'P2' }];
    it('should pass the test', () => {
      const solution = assignTasks(tasks, people);
      expect(verifySolution(solution, tasks, people)).toBeTruthy();
      const timelines = toResourceMap(solution, people);
      expect(timelines).toBeDefined();
    });
  });
  describe('With idle', () => {
    const tasks: Task[] = [
      { uuid: 'A', timeToDelivery: 1 },
      { uuid: 'B', timeToDelivery: 3 },
      { uuid: 'C', timeToDelivery: 1, dependencies: ['A'] },
      { uuid: 'D', timeToDelivery: 9, dependencies: ['C'] },
      { uuid: 'E', timeToDelivery: 4, dependencies: ['C', 'B'] },
      { uuid: 'F', timeToDelivery: 5, dependencies: ['C', 'B'] },
      { uuid: 'G', timeToDelivery: 8, dependencies: ['E', 'F'] },
    ];
    const people: Person[] = [{ uuid: 'P1' }, { uuid: 'P2' }];
    it('should pass the test', () => {
      const solution = assignTasks(tasks, people);
      expect(verifySolution(solution, tasks, people)).toBeTruthy();
      const timelines = toResourceMap(solution, people);
      expect(timelines).toBeDefined();
    });
  });
  describe('With person start', () => {
    const tasks: Task[] = [
      { uuid: 'A', timeToDelivery: 1 },
      { uuid: 'B', timeToDelivery: 3 },
      { uuid: 'C', timeToDelivery: 1, dependencies: ['A'] },
      { uuid: 'D', timeToDelivery: 9, dependencies: ['C'] },
      { uuid: 'E', timeToDelivery: 4, dependencies: ['C', 'B'] },
      { uuid: 'F', timeToDelivery: 5, dependencies: ['C', 'B'] },
      { uuid: 'G', timeToDelivery: 8, dependencies: ['E', 'F'] },
    ];
    const people: Person[] = [{ uuid: 'P1' }, { uuid: 'P2', start: 3 }];
    it('should pass the test', () => {
      const solution = assignTasks(tasks, people);
      expect(verifySolution(solution, tasks, people)).toBeTruthy();
      const timelines = toResourceMap(solution, people);
      expect(timelines).toBeDefined();
    });
  });
  describe('Random', () => {
    const { tasks, people } = generateProject(10, 3);
    it('should pass the test', () => {
      const solution = assignTasks(tasks, people);
      expect(verifySolution(solution, tasks, people)).toBeTruthy();
      const timelines = toResourceMap(solution, people);
      expect(timelines).toBeDefined();
    });
  });
});
