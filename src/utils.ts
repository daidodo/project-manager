export function sequence(from: number, len: number) {
  return Array(len)
    .fill(0)
    .map((_, i) => i + from);
}
