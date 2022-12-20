import { assertNonNull } from '@dozerg/condition';

export function sequence(from: number, len: number) {
  return Array(len)
    .fill(0)
    .map((_, i) => i + from);
}

export function calcNextWorkDay(workDays: number[]) {
  const [lastDay] = workDays.slice(-1);
  assertNonNull(lastDay);
  return lastDay + 1;
}
