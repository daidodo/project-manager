import { Solution } from './types';

export function calcEfficiency(solution: Solution) {
  const { totalTime, criticalTime } = solution;
  if (criticalTime === undefined) return undefined;
  return Math.floor((criticalTime * 100) / totalTime);
}
