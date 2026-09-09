export const progressionConfig = { xpPerLevel: 300 };
export function progression(xp: number) {
  return {
    level: Math.floor(xp / progressionConfig.xpPerLevel) + 1,
    current: xp % progressionConfig.xpPerLevel,
    target: progressionConfig.xpPerLevel,
  };
}
