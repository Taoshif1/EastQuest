import type { CaseDefinition, CaseProgress, GameSave } from "@/types/game";
import { clues } from "./data";

export function initialCases(): Record<string, CaseProgress> {
  return { "lost-campus-file": { status: "AVAILABLE", currentStage: 0, completedStages: [], discoveredClues: [], insightTokens: 0, hintsUsed: 0, pinned: false, choices: [], miniGameResults: {} } };
}
export function startCase(save: GameSave, definition: CaseDefinition): GameSave {
  const progress = save.cases?.[definition.id];
  if (progress?.status === "COMPLETED") return save;
  const defaults = initialCases()[definition.id];
  return { ...save, cases: { ...initialCases(), ...save.cases, [definition.id]: { ...defaults, ...progress, status: "ACTIVE", startedAt: progress?.startedAt ?? new Date().toISOString() } } };
}
export function collectClue(save: GameSave, caseId: string, clueId: string): { save: GameSave; isNew: boolean } {
  const progress = save.cases?.[caseId] ?? initialCases()[caseId];
  if (!progress || !clues.some((clue) => clue.id === clueId && clue.caseId === caseId)) return { save, isNew: false };
  if (progress.discoveredClues.includes(clueId)) return { save, isNew: false };
  return { isNew: true, save: { ...save, cases: { ...initialCases(), ...save.cases, [caseId]: { ...progress, status: "ACTIVE", discoveredClues: [...progress.discoveredClues, clueId] } } } };
}
export function completeStage(save: GameSave, caseId: string, stageId: string): GameSave {
  const progress = save.cases?.[caseId];
  if (!progress || progress.completedStages.includes(stageId)) return save;
  const next = { ...progress, completedStages: [...progress.completedStages, stageId], currentStage: progress.currentStage + 1 };
  return { ...save, cases: { ...save.cases, [caseId]: next } };
}
export function useHint(save: GameSave, caseId: string): GameSave {
  const progress = save.cases?.[caseId];
  if (!progress) return save;
  return { ...save, cases: { ...save.cases, [caseId]: { ...progress, hintsUsed: progress.hintsUsed + 1 } } };
}
export function setCasePinned(save: GameSave, caseId: string, pinned: boolean): GameSave {
  const progress = save.cases?.[caseId];
  if (!progress) return save;
  return { ...save, cases: { ...save.cases, [caseId]: { ...progress, pinned } } };
}
export function recordMiniGameResult(save: GameSave, caseId: string, gameId: string, result: "SUCCESS" | "FAILED" | "CANCELLED"): GameSave {
  const progress = save.cases?.[caseId];
  if (!progress) return save;
  return { ...save, cases: { ...save.cases, [caseId]: { ...progress, miniGameResults: { ...progress.miniGameResults, [gameId]: result } } } };
}
export function awardReflex(save: GameSave): GameSave {
  if (save.badges?.["campus-reflex"]) return save;
  return { ...save, xp: save.xp + 10, badges: { ...save.badges, "campus-reflex": { awardedAt: new Date().toISOString() } } };
}
export function completeCase(save: GameSave, definition: CaseDefinition): GameSave {
  const progress = save.cases?.[definition.id];
  if (!progress || progress.status === "COMPLETED") return save;
  const completedAt = new Date().toISOString();
  return { ...save, xp: save.xp + definition.rewards.xp, cases: { ...save.cases, [definition.id]: { ...progress, status: "COMPLETED", completedAt } }, badges: { ...save.badges, [definition.rewards.badgeId]: { awardedAt: completedAt } } };
}
