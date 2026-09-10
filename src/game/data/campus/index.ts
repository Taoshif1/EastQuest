import f0 from "./floors/lower-basement";
import f1 from "./floors/upper-basement";
import f2 from "./floors/ground";
import f3 from "./floors/first";
import f4 from "./floors/second";
import f5 from "./floors/third";
import f6 from "./floors/fourth";
import f7 from "./floors/fifth";
import f8 from "./floors/sixth";
import f9 from "./floors/seventh";
import f10 from "./floors/eighth";
import f11 from "./floors/roof-deck";
import { contains } from "./floors/factory";
import type { FloorId, PlayerWorldLocation, Rect } from "./types";
export { buildings, buildingName, buildingFloors } from "./buildings";
export { connections, connectionsOn, destinations } from "./connections";
export const floors = [f0, f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11];
export const WORLD = {
  width: 1560,
  height: 1560,
  spawn: { x: 1270, y: 1470 },
  speed: 200,
};
export const defaultLocation: PlayerWorldLocation = {
  buildingId: null,
  floorId: "ground",
  position: WORLD.spawn,
};
export const floorById = (id: string) => floors.find((f) => f.id === id);
export function zoneAt(floorId: string, p: { x: number; y: number }) {
  return floorById(floorId)?.areas.find((a) => contains(a, p));
}
// Shared collision geometry: avatar uses a centred 18px body, map and save validation use the same bounds.
const boundaryCache = new Map<string, Rect[]>();
export function collisionRects(floorId: string): Rect[] {
  const cached = boundaryCache.get(floorId);
  if (cached) return cached;
  const f = floorById(floorId);
  if (!f) return [];
  const edges: Rect[] = [];
  const inside = (x: number, y: number) =>
    f.areas.some((a) => contains(a, { x, y }));
  for (const a of f.areas) {
    for (const side of ["top", "bottom", "left", "right"] as const) {
      const horizontal = side === "top" || side === "bottom";
      const length = horizontal ? a.width : a.height;
      let run = -1;
      for (let t = 0; t <= length; t += 10) {
        const x = horizontal ? a.x + t : a.x + (side === "right" ? a.width : 0);
        const y = horizontal
          ? a.y + (side === "bottom" ? a.height : 0)
          : a.y + t;
        const nx = x + (side === "left" ? -2 : side === "right" ? 2 : 5);
        const ny = y + (side === "top" ? -2 : side === "bottom" ? 2 : 5);
        const exposed = t < length && !inside(nx, ny);
        if (exposed && run < 0) run = t;
        if (!exposed && run >= 0) {
          edges.push(
            horizontal
              ? { x: a.x + run, y: y - 4, width: t - run, height: 8 }
              : { x: x - 4, y: a.y + run, width: 8, height: t - run },
          );
          run = -1;
        }
      }
    }
  }
  const result = [...f.walls, ...f.objects.filter((o) => o.solid), ...edges];
  boundaryCache.set(floorId, result);
  return result;
}
export function walkable(floorId: string, p: { x: number; y: number }) {
  const f = floorById(floorId);
  return (
    !!f &&
    f.access === "EXPLORATION" &&
    Number.isFinite(p.x) &&
    Number.isFinite(p.y) &&
    !!zoneAt(floorId, p) &&
    !collisionRects(floorId).some(
      (r) =>
        p.x + 9 > r.x &&
        p.x - 9 < r.x + r.width &&
        p.y + 9 > r.y &&
        p.y - 9 < r.y + r.height,
    )
  );
}
export function restoreLocation(value: unknown): PlayerWorldLocation {
  if (value && typeof value === "object") {
    const l = value as PlayerWorldLocation;
    if (l.position && walkable(l.floorId, l.position)) {
      const zone = zoneAt(l.floorId, l.position)!;
      return {
        floorId: l.floorId as FloorId,
        buildingId: zone.buildingId,
        position: { ...l.position },
      };
    }
  }
  return { ...defaultLocation, position: { ...WORLD.spawn } };
}
