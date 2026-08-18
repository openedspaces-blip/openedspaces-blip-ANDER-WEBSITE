/** Returns a fresh Fisher-Yates shuffle; never mutate authored lesson data. */
export function shuffle<T>(items: readonly T[], seed = Math.random()): T[] {
  const shuffled = [...items];
  // Supplying a seed makes a question's answer order stable until its round changes.
  let state = Math.abs(seed % 1) || 0.5;
  const random = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}
