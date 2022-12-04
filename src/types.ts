export interface Person {
  readonly uuid: string;
  readonly start?: number;
}

export interface Task {
  readonly uuid: string;
  readonly timeToDelivery: number;
  readonly dependencies?: string[];
}

interface Assignment {
  readonly taskId: string;
  readonly personId: string;
  readonly start: number;
  readonly end: number;
}

export interface Solution {
  readonly assignments: Assignment[];
  readonly totalTime: number;
}
