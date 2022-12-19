export type Holiday = number | { from: number; days: number };

export interface Person {
  readonly uuid: string;
  readonly holidays?: Holiday[];
}

export interface Task {
  readonly uuid: string;
  readonly effort: number;
  readonly dependencies?: string[];
}

export interface Assignment {
  readonly taskId: string;
  readonly personId: string;
  readonly workDays: number[];
}

export interface Solution {
  readonly assignments: Assignment[];
  readonly totalTime: number;
  readonly criticalTime?: number;
}
