export type Day = number | { from: number; days: number };

export type DependsOn = 'delivery' | 'effort';

export const DEFAULT_DEPENDS_ON: DependsOn = 'delivery';

export type Dependency = string | { uuid: string; dependsOn: DependsOn };

export interface Person {
  readonly uuid: string;
  readonly holidays?: Day[];
}

export interface Task {
  readonly uuid: string;
  readonly effort: number;
  readonly leadTime?: number;
  readonly dependencies?: Dependency[];
}

export interface Assignment {
  readonly taskId: string;
  readonly personId: string;
  readonly workDays: number[];
}

export interface Solution {
  readonly assignments: Assignment[];
  readonly totalWorkDays: number;
  readonly deliveryTime: number;
  readonly criticalTime: number;
}
