import {
  buildingName,
  connections,
  destinations,
} from "@/game/data/campus/index";
import { locations, quests } from "@/game/data/campus";
import type { GameSave } from "@/types/game";
import { cases } from "@/game/cases/data";
import { sideQuests, worldInteractions, npcById, dailyChallenge } from "@/game/campus-life";
import { activityById } from "@/game/activities";

export type CurrentObjective = {
  type: "MAIN" | "CASE" | "SIDE_QUEST" | "DAILY";
  id: string;
  questId: string;
  title: string;
  locationId: string;
  locationName: string;
  building: string;
  floor: string;
  description: string;
  guidance: string;
};

export type ObjectiveChoice = {
  type: CurrentObjective["type"];
  id: string;
  label: string;
  available: boolean;
};

function mainObjective(save: GameSave): CurrentObjective | null {
  const quest = quests.find((item) => save.quests[item.id]?.status !== "COMPLETED");
  if (!quest) return null;
  const location = locations.find((item) => item.id === quest.locationId);
  if (!location) return null;
  const building = buildingName(location.buildingId);
  const connection = connections.find(
    (item) => item.buildingId === location.buildingId && item.kind === "lift",
  );
  return {
    type: "MAIN",
    id: quest.id,
    questId: quest.id,
    title: quest.title,
    locationId: location.id,
    locationName: location.name,
    building,
    floor: location.floor ?? "Campus floor",
    description: quest.description,
    guidance:
      location.floorId === "ground"
        ? "Follow the entry path to the marked location."
        : `Use ${connection ? "the lift or stairs" : "campus circulation"} to reach it.`,
  };
}

function caseObjective(save: GameSave): CurrentObjective | null {
  const definition = cases[0];
  const progress = save.cases?.[definition.id];
  if (!progress || progress.status !== "ACTIVE") return null;
  const stage = definition.stages[progress.currentStage];
  if (!stage) return null;
  const location = stage.locationId ? locations.find((item) => item.id === stage.locationId) : undefined;
  return {
    type: "CASE",
    id: definition.id,
    questId: definition.id,
    title: definition.title,
    locationId: location?.id ?? "",
    locationName: location?.name ?? "Case board",
    building: location ? buildingName(location.buildingId) : "Investigation desk",
    floor: location?.floor ?? "Journal",
    description: stage.objective,
    guidance: location ? "The case has identified this area." : "Review the evidence before choosing your next lead.",
  };
}

function sideQuestObjective(save: GameSave): CurrentObjective | null {
  const active = sideQuests.find((quest) => save.sideQuests?.[quest.id]?.status === "ACTIVE");
  if (!active) return null;
  const progress = save.sideQuests![active.id];
  const step = active.steps[progress.currentStep];
  if (!step) return null;
  const interaction = step.interactionId ? worldInteractions.find((item) => item.id === step.interactionId) : undefined;
  const npc = step.npcId ? npcById(step.npcId) : undefined;
  return {
    type: "SIDE_QUEST",
    id: active.id,
    questId: active.id,
    title: active.title,
    locationId: interaction?.id ?? "",
    locationName: interaction?.title ?? npc?.name ?? "Side quest journal",
    building: interaction?.floorId ?? "Campus route",
    floor: interaction ? "Known lead" : "Journal",
    description: step.description,
    guidance: interaction || npc ? "Follow the current lead; later steps remain hidden." : "Choose a direction from the journal.",
  };
}

function dailyObjective(save: GameSave): CurrentObjective | null {
  const challenge = dailyChallenge();
  if (save.dailyChallenge?.date === challenge.date && save.dailyChallenge.claimedAt) return null;
  const activity = activityById(challenge.activityId);
  if (!activity) return null;
  return {
    type: "DAILY",
    id: challenge.activityId,
    questId: challenge.activityId,
    title: "Daily Campus Challenge",
    locationId: activity.locationId ?? "",
    locationName: activity.subtitle,
    building: activity.domain,
    floor: "Activities",
    description: activity.title,
    guidance: "A fresh optional challenge is available today.",
  };
}

export function objectiveChoices(save: GameSave): ObjectiveChoice[] {
  const choices = [
    { objective: mainObjective(save), label: "Campus Quest" },
    { objective: caseObjective(save), label: "Lost Campus File" },
    { objective: sideQuestObjective(save), label: "Side Quest" },
    { objective: dailyObjective(save), label: "Daily Challenge" },
  ];
  return choices
    .filter((item) => item.objective)
    .map((item) => ({ type: item.objective!.type, id: item.objective!.id, label: item.label, available: true }));
}

export function currentObjective(save: GameSave): CurrentObjective | null {
  const available = objectiveChoices(save);
  const tracked = save.trackedObjective;
  const selected = tracked && available.find((item) => item.type === tracked.type && item.id === tracked.id);
  if (selected) {
    return [mainObjective, caseObjective, sideQuestObjective, dailyObjective]
      .map((factory) => factory(save))
      .find((objective) => objective?.type === selected.type && objective.id === selected.id) ?? null;
  }
  return mainObjective(save) ?? caseObjective(save) ?? sideQuestObjective(save);
}

export function nextFloorsForObjective(
  currentFloor: string,
  objective: CurrentObjective,
) {
  const connection = connections.find(
    (item) =>
      item.buildingId === locations.find((l) => l.id === objective.locationId)?.buildingId &&
      item.floors.includes(currentFloor as never),
  );
  return connection ? destinations(connection, currentFloor) : [];
}
