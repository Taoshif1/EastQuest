import { buildingFloors } from "./buildings";
import { approximate } from "./evidence";
import type { BuildingId, Connection } from "./types";
// Lobby numbers are official; landing coordinates and lift service patterns await survey.
const cores: { buildingId: BuildingId; x: number; y: number; name: string }[] =
  [
    { buildingId: "admin", x: 1250, y: 860, name: "Lobby 1" },
    { buildingId: "a", x: 1350, y: 280, name: "Lobby 2" },
    { buildingId: "b", x: 790, y: 280, name: "Block B corridor" },
    { buildingId: "c-north", x: 410, y: 280, name: "Lobby 3" },
    { buildingId: "c-middle", x: 350, y: 700, name: "Gallery landing" },
    { buildingId: "c-south", x: 410, y: 980, name: "Lobby 4" },
    { buildingId: "d", x: 1015, y: 865, name: "Block D foyer" },
  ];
export const connections: Connection[] = cores.flatMap((c) =>
  (["lift", "stairs"] as const).map((kind) => ({
    id: c.buildingId + "-" + kind,
    buildingId: c.buildingId,
    kind,
    name: c.name + " · " + kind,
    position: {
      x:
        c.x -
        (kind === "stairs" &&
        c.buildingId !== "admin" &&
        c.buildingId !== "c-middle"
          ? 45
          : 0),
      y:
        c.y +
        (kind === "stairs" && c.buildingId === "admin"
          ? 80
          : kind === "stairs" && c.buildingId === "c-middle"
            ? -100
            : 0),
    },
    floors: buildingFloors(c.buildingId),
    evidence: approximate(
      "Core associated with plan circulation. Individual lift stop availability and exact landing offsets require physical survey.",
    ),
  })),
);
export const connectionsOn = (floorId: string) =>
  connections.filter((c) => c.floors.includes(floorId as never));
export function destinations(c: Connection, current: string) {
  const i = c.floors.indexOf(current as never);
  return i < 0
    ? []
    : c.floors.filter((_, j) =>
        c.kind === "lift" ? j !== i : Math.abs(j - i) === 1,
      );
}
