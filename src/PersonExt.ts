import { Person } from './types';

export default class PersonExt {
  nextAvailability = 0;

  constructor(private readonly details_: Person) {}

  get uuid() {
    return this.details_.uuid;
  }
}
