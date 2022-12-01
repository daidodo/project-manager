import { Person } from './types';

export default class PersonExt {
  private ends_: number[] = [];

  constructor(private readonly details_: Person) {}

  get uuid() {
    return this.details_.uuid;
  }

  get nextAvailability() {
    return this.ends_.slice(-1)[0] ?? this.details_.start ?? 0;
  }

  assign(task: { timeToDelivery: number }, start: number) {
    const end = start + task.timeToDelivery;
    this.ends_.push(end);
    return end;
  }
}
