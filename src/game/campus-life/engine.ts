import type { GameSave, SideQuestDefinition } from "@/types/game";
import { activities } from "@/game/activities/data";
import { discoveryById, sideQuestById } from "./data";

const isoNow = () => new Date().toISOString();
const dateKey = (date = new Date()) => date.toISOString().slice(0, 10);

export function dailyChallenge(date = new Date()) {
  const key = dateKey(date);
  const playable = activities.filter((activity) => !activity.hidden);
  const index = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0) % playable.length;
  return { date: key, activityId: playable[index].id };
}

export function discoverHidden(save: GameSave, id: string) {
  const discovery = discoveryById(id);
  if (!discovery || save.hiddenDiscoveries?.[id]) return { save, isNew: false };
  const now = isoNow();
  const notifications = [
    ...(save.notifications ?? []),
    { id: `discovery-${id}`, message: `${discovery.title} added to your collection.`, createdAt: now, read: false },
  ].slice(-20);
  const discovered = { ...(save.hiddenDiscoveries ?? {}), [id]: { discoveredAt: now, stamp: discovery.stamp } };
  const marks = ["three-marks-i", "three-marks-ii", "three-marks-iii"];
  const completedMarks = marks.every((mark) => discovered[mark]);
  const achievements = completedMarks
    ? { ...(save.achievements ?? {}), "three-marks": { awardedAt: now } }
    : save.achievements;
  return {
    isNew: true,
    save: {
      ...save,
      xp: save.xp + discovery.rewardXp,
      level: Math.floor((save.xp + discovery.rewardXp) / 300) + 1,
      hiddenDiscoveries: discovered,
      achievements,
      discoveredInteractions: { ...(save.discoveredInteractions ?? {}), [discovery.interactionId]: { discoveredAt: now } },
      followedRumors:
        id === "first-leaf"
          ? { ...(save.followedRumors ?? {}), "rooftop-garden": { followedAt: now } }
          : save.followedRumors,
      notifications,
    },
  };
}

export function meetNpc(save: GameSave, npcId: string) {
  if (save.npcsMet?.[npcId]) return { save, isNew: false };
  const now = isoNow();
  return {
    isNew: true,
    save: {
      ...save,
      npcsMet: { ...(save.npcsMet ?? {}), [npcId]: { metAt: now } },
      notifications: [...(save.notifications ?? []), { id: `npc-${npcId}`, message: "A new campus contact joined your notebook.", createdAt: now, read: false }].slice(-20),
    },
  };
}

export function startSideQuest(save: GameSave, definition: SideQuestDefinition) {
  const existing = save.sideQuests?.[definition.id];
  if (existing?.status === "COMPLETED") return save;
  return {
    ...save,
    sideQuests: {
      ...(save.sideQuests ?? {}),
      [definition.id]: existing ?? { status: "ACTIVE" as const, currentStep: 0 },
    },
  };
}

export function completeSideQuestStep(save: GameSave, questId: string, stepId: string, branch?: string) {
  const definition = sideQuestById(questId);
  const progress = save.sideQuests?.[questId];
  if (!definition || !progress || progress.status !== "ACTIVE") return { save, advanced: false, completed: false };
  const step = definition.steps[progress.currentStep];
  if (!step || step.id !== stepId) return { save, advanced: false, completed: false };
  const nextIndex = progress.currentStep + 1;
  const completed = nextIndex >= definition.steps.length;
  const now = isoNow();
  const next = {
    ...save,
    xp: save.xp + (completed ? definition.rewardXp : 0),
    level: Math.floor((save.xp + (completed ? definition.rewardXp : 0)) / 300) + 1,
    sideQuests: {
      ...(save.sideQuests ?? {}),
      [questId]: {
        ...progress,
        status: completed ? "COMPLETED" as const : "ACTIVE" as const,
        currentStep: nextIndex,
        ...(branch ? { branch } : {}),
        ...(completed ? { completedAt: now } : {}),
      },
    },
    notifications: [...(save.notifications ?? []), {
      id: `quest-${questId}-${stepId}`,
      message: completed ? `${definition.title} complete — +${definition.rewardXp} XP.` : `${definition.title}: ${step.title} complete.`,
      createdAt: now,
      read: false,
    }].slice(-20),
  };
  return { save: next, advanced: true, completed };
}

export function claimDailyChallenge(save: GameSave, date = new Date()) {
  const challenge = dailyChallenge(date);
  if (save.dailyChallenge?.date === challenge.date && save.dailyChallenge.claimedAt)
    return { save, claimed: false };
  if (!save.activities?.[challenge.activityId]?.completed)
    return { save, claimed: false };
  const now = isoNow();
  const reward = 50;
  return {
    claimed: true,
    save: {
      ...save,
      xp: save.xp + reward,
      level: Math.floor((save.xp + reward) / 300) + 1,
      dailyChallenge: { ...challenge, completed: true, claimedAt: now },
      notifications: [...(save.notifications ?? []), { id: `daily-${challenge.date}`, message: `Daily challenge complete — +${reward} XP.`, createdAt: now, read: false }].slice(-20),
    },
  };
}

export function markNotificationsRead(save: GameSave) {
  return { ...save, notifications: (save.notifications ?? []).map((item) => ({ ...item, read: true })) };
}
