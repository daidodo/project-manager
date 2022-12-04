import { Map } from 'immutable';

import { assertNonNull } from '@dozerg/condition';

import { Task } from './types';

export default class TaskExt {
  private dependencies_?: TaskExt[];
  private dependants_?: TaskExt[];
  private criticalTime_ = -1;

  constructor(private readonly details_: Task) {}

  get uuid() {
    return this.details_.uuid;
  }

  get timeToDelivery() {
    return this.details_.timeToDelivery;
  }

  get dependencies() {
    return this.dependencies_;
  }

  get dependants() {
    return this.dependants_;
  }

  get criticalTime() {
    if (this.criticalTime_ < 0) {
      const base = this.dependants?.reduce((r, d) => Math.max(r, d.criticalTime), 0);
      this.criticalTime_ = this.details_.timeToDelivery + (base ?? 0);
    }
    return this.criticalTime_;
  }

  calcDependency(allTasks: Map<string, TaskExt>) {
    this.dependencies_ = this.details_.dependencies?.map(id => {
      const dependency = allTasks.get(id);
      assertNonNull(dependency, `Cannot find dependency for task`, {
        task: this.details_,
        dependency: id,
        allTasks,
      });
      if (dependency.dependants_) dependency.dependants_.push(this);
      else dependency.dependants_ = [this];
      return dependency;
    });
  }
}
