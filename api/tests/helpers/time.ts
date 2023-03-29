export function isRecent(dateA: Date, dateB: Date = new Date()) {
  const diff = Math.abs(dateA.getTime() - dateB.getTime());
  return diff < 1000;
}
