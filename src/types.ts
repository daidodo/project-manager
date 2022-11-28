export interface Person {
  readonly uuid: string;
  readonly start?: number;
}

export interface Task {
  readonly uuid: string;
  readonly timeToDelivery: number;
  readonly dependencies?: string[];
}
