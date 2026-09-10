import {
  buildingName,
  connections,
  destinations,
} from "@/game/data/campus/index";
import { locations, quests } from "@/game/data/campus";
import type { GameSave } from "@/types/game";

export type CurrentObjective = {
  questId: string;
  title: string;
  locationId: string;
  locationName: string;
  building: string;
  floor: string;
  description: string;
  guidance: string;
};

export function currentObjective(save: GameSave): CurrentObjective | null {
  const quest = quests.find((item) => save.quests[item.id]?.status !== "COMPLETED");
  if (!quest) return null;
  const location = locations.find((item) => item.id === quest.locationId);
  if (!location) return null;
  const building = buildingName(location.buildingId);
  const connection = connections.find(
    (item) => item.buildingId === location.buildingId && item.kind === "lift",
  );
  const guidance =
    location.floorId === "ground"
      ? "Follow the entry path to the marked location."
      : `Use ${connection ? "the lift or stairs" : "campus circulation"} to reach it.`;
  return {
    questId: quest.id,
    title: quest.title,
    locationId: location.id,
    locationName: location.name,
    building,
    floor: location.floor ?? "Campus floor",
    description: quest.description,
    guidance,
  };
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
