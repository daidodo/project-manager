import { Map } from 'immutable';

import { assertNonNull } from '@dozerg/condition';

import {
  DEFAULT_DEPENDS_ON,
  Dependency,
  DependsOn,
  Task,
} from './types';

export default class TaskExt {
  private dependencies_?: { task: TaskExt; dependsOn: DependsOn }[];
  private dependants_?: { task: TaskExt; dependsOn: DependsOn }[];
  private criticalTime_ = -1;

  constructor(private readonly details_: Task) {}

  get uuid() {
    return this.details_.uuid;
  }

  get effort() {
    return this.details_.effort;
  }

  get leadTime() {
    return this.details_.leadTime ?? 0;
  }

  private get delivery() {
    return this.details_.effort + this.leadTime;
  }

  get dependencies() {
    return this.dependencies_;
  }

  get dependants() {
    return this.dependants_;
  }

  get criticalTime() {
    if (this.criticalTime_ < 0) {
      this.criticalTime_ =
        this.dependants?.reduce((r, d) => {
          const { task, dependsOn } = d;
          const ct = task.criticalTime + (dependsOn === 'delivery' ? this.delivery : this.effort);
          return Math.max(r, ct);
        }, this.delivery) ?? this.delivery;
    }
    return this.criticalTime_;
  }

  calcDependency(allTasks: Map<string, TaskExt>) {
    this.dependencies_ = this.details_.dependencies?.map(d => {
      const dependency: Dependency =
        typeof d === 'string' ? { uuid: d, dependsOn: DEFAULT_DEPENDS_ON } : d;
      const { uuid: id, dependsOn } = dependency;
      const task = allTasks.get(id);
      assertNonNull(task, `Cannot find dependency for task`, {
        task: this.details_,
        dependency: d,
        allTasks,
      });
      const dependant = { task: this, dependsOn };
      if (task.dependants_) task.dependants_.push(dependant);
      else task.dependants_ = [dependant];
      return { task, dependsOn };
    });
  }
}
