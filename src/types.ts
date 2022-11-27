export interface Person {
  readonly uuid: string;
}

export interface Task {
  readonly uuid: string;
  readonly timeToDelivery: number;
  readonly dependencies?: string[];
}
