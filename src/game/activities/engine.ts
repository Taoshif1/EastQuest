import type { ActivityDefinition, ActivityProgress, GameSave, SportMedal } from "@/types/game";
import { activities, activityById, rumors } from "./data";

export function initialActivities(): Record<string, ActivityProgress> {
  return Object.fromEntries(
    activities.map((activity) => [
      activity.id,
      { plays: 0, bestScore: 0, completed: false },
    ]),
  );
}

function withActivityDefaults(save: GameSave) {
  return { ...initialActivities(), ...save.activities };
}

export function activityProgress(save: GameSave, id: string) {
  return withActivityDefaults(save)[id];
}

export function completedActivityDomains(save: GameSave) {
  const progress = withActivityDefaults(save);
  return new Set(
    activities
      .filter((activity) => progress[activity.id]?.completed)
      .map((activity) => activity.domain),
  );
}

function awardAchievement(save: GameSave, id: string): GameSave {
  if (save.achievements?.[id]) return save;
  return {
    ...save,
    achievements: {
      ...save.achievements,
      [id]: { awardedAt: new Date().toISOString() },
    },
  };
}

export type ActivityOutcome = {
  save: GameSave;
  score: number;
  completed: boolean;
  newAchievementIds: string[];
  newStamp: boolean;
  newMedal?: SportMedal;
  newPersonalBest: boolean;
  isReplay: boolean;
  xpAwarded: number;
};

export const sportMedalThresholds: Array<{ medal: SportMedal; score: number }> = [
  { medal: "GOLD", score: 90 },
  { medal: "SILVER", score: 75 },
  { medal: "BRONZE", score: 60 },
];

export function sportMedalForScore(score: number): SportMedal | undefined {
  return sportMedalThresholds.find((item) => score >= item.score)?.medal;
}

export function penaltyScore(corner: string, keeperCorner: string) {
  return corner === keeperCorner ? 0 : 100;
}

export function validBudget(
  budget: Record<string, number>,
  constraints: Record<string, number>,
  total = 100,
) {
  return Object.values(budget).reduce((sum, value) => sum + value, 0) === total &&
    Object.entries(constraints).every(([name, minimum]) => (budget[name] ?? 0) >= minimum);
}

export function validRoute(route: string[], expected: string[]) {
  return route.join("|") === expected.join("|");
}

export function timingScore(position: number, windowSize: number) {
  return Math.max(0, Math.round(100 - (Math.abs(position - 50) * 100) / (windowSize * 1.5)));
}

const sportIds = ["cricket-boundary-timing", "futsal-penalty", "table-tennis-reaction"];

/** Applies a runner result once and keeps all rewards in the domain layer. */
export function recordActivityResult(
  save: GameSave,
  definition: ActivityDefinition,
  score: number,
  completed: boolean,
): ActivityOutcome {
  const specialtyBonus =
    definition.specialty &&
    save.profile.specialty === definition.specialty &&
    score > 0
      ? 10
      : 0;
  const adjustedScore = Math.min(100, Math.max(0, score + specialtyBonus));
  const adjustedCompleted = completed || adjustedScore >= 60;
  const previous = activityProgress(save, definition.id) ?? {
    plays: 0,
    bestScore: 0,
    completed: false,
  };
  const now = new Date().toISOString();
  const nextProgress = {
    plays: previous.plays + 1,
    bestScore: Math.max(previous.bestScore, adjustedScore),
    completed: previous.completed || adjustedCompleted,
    lastPlayedAt: now,
  };
  const newPersonalBest = adjustedScore > previous.bestScore;
  const isReplay = previous.completed;
  const xpAwarded = isReplay ? 0 : adjustedCompleted ? definition.rewardXp : 0;
  let next: GameSave = {
    ...save,
    activities: { ...withActivityDefaults(save), [definition.id]: nextProgress },
    stamps: adjustedCompleted
      ? { ...save.stamps, [definition.id]: save.stamps?.[definition.id] ?? { obtainedAt: now } }
      : save.stamps,
  };
  const newAchievementIds: string[] = [];
  const medal = definition.domain === "SPORTS" && sportIds.includes(definition.id)
    ? sportMedalForScore(adjustedScore)
    : undefined;
  let newMedal: SportMedal | undefined;
  if (medal) {
    const rank: Record<SportMedal, number> = { BRONZE: 1, SILVER: 2, GOLD: 3 };
    const previousMedal = next.sportsMedals?.[definition.id];
    if (!previousMedal || rank[medal] > rank[previousMedal]) {
      newMedal = medal;
      next = { ...next, sportsMedals: { ...(next.sportsMedals ?? {}), [definition.id]: medal } };
      if (sportIds.every((id) => next.sportsMedals?.[id])) {
        next = awardAchievement(next, "sports-all-rounder");
        if (!save.achievements?.["sports-all-rounder"]) newAchievementIds.push("sports-all-rounder");
      }
    }
  }
  if (!previous.completed && adjustedCompleted) {
    next = { ...next, xp: next.xp + xpAwarded };
    next = awardAchievement(next, "first-activity");
    if (!save.achievements?.["first-activity"]) newAchievementIds.push("first-activity");
    if (completedActivityDomains(next).size >= 3) {
      next = awardAchievement(next, "activity-explorer");
      if (!save.achievements?.["activity-explorer"]) newAchievementIds.push("activity-explorer");
    }
    if (definition.domain === "SPORTS" && adjustedScore >= 80) {
      next = awardAchievement(next, "sports-ace");
      if (!save.achievements?.["sports-ace"]) newAchievementIds.push("sports-ace");
    }
    if (definition.hidden) {
      next = awardAchievement(next, "rumor-keeper");
      if (!save.achievements?.["rumor-keeper"]) newAchievementIds.push("rumor-keeper");
      if (!next.discoveredRumors?.includes(definition.id))
        next = { ...next, discoveredRumors: [...(next.discoveredRumors ?? []), definition.id] };
      if (definition.id === "midnight-stairwell")
        next = {
          ...next,
          followedRumors: {
            ...(next.followedRumors ?? {}),
            "midnight-stairwell": { followedAt: now },
          },
        };
    }
  }
  return {
    save: { ...next, level: Math.floor(next.xp / 300) + 1 },
    score: adjustedScore,
    completed: adjustedCompleted,
    newAchievementIds,
    newStamp: adjustedCompleted && !save.stamps?.[definition.id],
    newMedal,
    newPersonalBest,
    isReplay,
    xpAwarded,
  };
}

export function discoverRumor(save: GameSave, rumorId: string): { save: GameSave; isNew: boolean } {
  if (!rumors.some((rumor) => rumor.id === rumorId)) return { save, isNew: false };
  if (save.discoveredRumors?.includes(rumorId)) return { save, isNew: false };
  let next: GameSave = { ...save, discoveredRumors: [...(save.discoveredRumors ?? []), rumorId] };
  if (rumorId === "midnight-stairwell") next = awardAchievement(next, "rumor-keeper");
  return { save: next, isNew: true };
}

export function activityStatus(save: GameSave, id: string) {
  const definition = activityById(id);
  if (!definition) return "UNKNOWN" as const;
  return activityProgress(save, id)?.completed ? "COMPLETED" as const : "AVAILABLE" as const;
}
