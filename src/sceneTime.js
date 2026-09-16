// Local device time; night spans midnight.
export function getSceneTime(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 15) return "day";
  if (hour >= 15 && hour < 18) return "evening";
  return "night";
}
