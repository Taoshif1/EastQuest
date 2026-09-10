import { official, approximate } from "./evidence";
import type { BuildingId, Rect, FloorId } from "./types";
export const floorIds: FloorId[] = [
  "lower-basement",
  "upper-basement",
  "ground",
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "roof-deck",
];
export const buildings: {
  id: BuildingId;
  name: string;
  bounds: Rect;
  highest: number;
  evidence: ReturnType<typeof official>;
  geometryEvidence: ReturnType<typeof approximate>;
}[] = [
  {
    id: "c-north",
    name: "Block C · North",
    bounds: { x: 160, y: 100, width: 320, height: 340 },
    highest: 8,
  },
  {
    id: "b",
    name: "Block B",
    bounds: { x: 500, y: 100, width: 560, height: 340 },
    highest: 5,
  },
  {
    id: "a",
    name: "Block A",
    bounds: { x: 1080, y: 100, width: 320, height: 340 },
    highest: 7,
  },
  {
    id: "c-middle",
    name: "Block C · Middle",
    bounds: { x: 160, y: 460, width: 320, height: 320 },
    highest: 6,
  },
  {
    id: "c-south",
    name: "Block C · South",
    bounds: { x: 160, y: 800, width: 320, height: 340 },
    highest: 7,
  },
  {
    id: "d",
    name: "Block D",
    bounds: { x: 500, y: 800, width: 560, height: 340 },
    highest: 2,
  },
  {
    id: "admin",
    name: "Admin Block",
    bounds: { x: 1080, y: 460, width: 320, height: 680 },
    highest: 5,
  },
  {
    id: "fub",
    name: "Farashuddin Building (FUB)",
    bounds: { x: 160, y: 1220, width: 320, height: 220 },
    highest: 9,
  },
].map((b) => ({
  ...b,
  id: b.id as BuildingId,
  evidence: official(
    "Name and storey count from Block Information. FUB interior is outside the supplied drawings.",
  ),
  geometryEvidence: approximate(
    "Rectified footprint from the plans; units are game pixels, not surveyed metres.",
  ),
}));
export const buildingName = (id: string | null) =>
  buildings.find((b) => b.id === id)?.name ?? "Campus arrival / courtyard";
export const buildingFloors = (id: BuildingId) => {
  const b = buildings.find((b) => b.id === id)!;
  return id === "fub" ? [] : floorIds.filter((_, i) => i <= b.highest + 2);
};
