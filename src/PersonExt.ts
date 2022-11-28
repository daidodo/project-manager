import { Person } from './types';

export default class PersonExt {
  nextAvailability: number;

  constructor(private readonly details_: Person) {
    this.nextAvailability = details_.start ?? 0;
  }

  get uuid() {
    return this.details_.uuid;
  }
}
