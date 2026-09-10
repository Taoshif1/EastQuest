import { describe, it, expect } from "vitest";
import {
  buildings,
  buildingFloors,
  collisionRects,
  connections,
  defaultLocation,
  destinations,
  floors,
  floorById,
  restoreLocation,
  walkable,
  WORLD,
  zoneAt,
} from "./index";
import { locations } from "./pois";
import { quests } from "../campus";
import { SimulatedPositionProvider } from "@/game/movement/position-provider";
import { ProximityVerificationProvider } from "@/game/verification/location-verification";
import { LocalGameRepository } from "@/game/persistence/game-repository";
import { newGame } from "@/game/quests/quest-engine";

describe("EWU campus data", () => {
  it("has unique IDs and twelve distinct referenced levels", () => {
    expect(new Set(floors.map((f) => f.id)).size).toBe(12);
    expect(new Set(buildings.map((b) => b.id)).size).toBe(buildings.length);
    expect(new Set(connections.map((c) => c.id)).size).toBe(connections.length);
    for (const f of floors) {
      expect(f.source).toMatch(/\.png$/);
      expect(f.evidence.sourceType).toBe("FLOORPLAN_REFERENCE");
      for (const a of f.areas) {
        expect(a.width).toBeGreaterThan(0);
        expect(a.height).toBeGreaterThan(0);
        expect(a.x + a.width).toBeLessThanOrEqual(WORLD.width);
        expect(a.y + a.height).toBeLessThanOrEqual(WORLD.height);
        if (a.buildingId)
          expect(buildings.some((b) => b.id === a.buildingId)).toBe(true);
      }
      if (f.order > 0) expect(walkable(f.id, { x: 780, y: 600 })).toBe(false);
    }
  });
  it("respects storey limits and keeps roof context out of normal play", () => {
    expect(buildingFloors("admin")).not.toContain("sixth");
    expect(buildingFloors("d")).not.toContain("third");
    expect(buildingFloors("b")).not.toContain("sixth");
    expect(buildingFloors("c-north")).toContain("eighth");
    expect(buildingFloors("fub")).toEqual([]);
    expect(floorById("roof-deck")?.access).toBe("REFERENCE_ONLY");
  });
  it("puts every vertical landing on walkable geometry in its own block", () => {
    for (const c of connections)
      for (const id of c.floors) {
        expect(walkable(id, c.position), c.id + " / " + id).toBe(true);
        expect(zoneAt(id, c.position)?.buildingId, c.id + " / " + id).toBe(
          c.buildingId,
        );
        for (const dest of destinations(c, id)) {
          expect(c.floors).toContain(dest);
          expect(destinations(c, dest)).toContain(id);
          if (c.kind === "stairs")
            expect(
              Math.abs(floorById(dest)!.order - floorById(id)!.order),
            ).toBe(1);
        }
      }
  });
  it("keeps quests on documented, reachable campus POIs", () => {
    for (const q of quests) {
      const l = locations.find((l) => l.id === q.locationId)!;
      expect(l).toBeDefined();
      expect(walkable(l.floorId, l.worldPosition), l.id).toBe(true);
      expect(l.evidence.sourceType).toBe(
        l.id === "gate" ? "FIELD_OBSERVED" : "OFFICIAL_SOURCE",
      );
      expect(l.evidence.sourceRef).toBeTruthy();
    }
  });
  it("does not verify identical coordinates on a different floor or block", async () => {
    const l = locations[1];
    const p = new SimulatedPositionProvider(l.worldPosition);
    const v = new ProximityVerificationProvider(p);
    expect((await v.verify(l)).verified).toBe(false);
    p.updateWorldLocation({
      buildingId: l.buildingId,
      floorId: l.floorId,
      position: l.worldPosition,
    });
    expect((await v.verify(l)).verified).toBe(true);
    p.updateWorldLocation({
      buildingId: "a",
      floorId: l.floorId,
      position: l.worldPosition,
    });
    expect((await v.verify(l)).verified).toBe(false);
  });
  it("recovers bad, obsolete and colliding positions", () => {
    for (const bad of [
      null,
      {},
      { floorId: "fictional", position: { x: 640, y: 915 } },
      { floorId: "fifth", position: { x: 780, y: 600 } },
      { floorId: "ground", position: { x: NaN, y: 20 } },
    ])
      expect(restoreLocation(bad)).toEqual(defaultLocation);
    expect(collisionRects("ground").length).toBeGreaterThan(30);
  });
  it("migrates old saves without losing rewards and round-trips new world context", async () => {
    const m = new Map<string, string>();
    const repo = new LocalGameRepository({
      getItem: (k) => m.get(k) ?? null,
      setItem: (k, v) => {
        m.set(k, v);
      },
      removeItem: (k) => {
        m.delete(k);
      },
    });
    const profile = {
      id: "local:2023-3-60-376",
      studentId: "2023-3-60-376",
      email: "test@std.ewubd.edu",
      displayName: "Test",
      avatarId: "explorer-01",
    };
    const old = {
      ...newGame(profile),
      worldRevision: undefined,
      worldLocation: undefined,
      xp: 50,
      collectibles: { "explorer-pass": { obtainedAt: "2026-09-10T00:00:00Z" } },
    };
    await repo.save(old);
    const migrated = (await repo.load(profile.studentId))!;
    expect(migrated.worldLocation).toEqual(defaultLocation);
    expect(migrated.xp).toBe(50);
    expect(migrated.collectibles).toEqual(old.collectibles);
    const l = locations[1];
    migrated.worldLocation = {
      buildingId: l.buildingId,
      floorId: l.floorId,
      position: l.worldPosition,
    };
    await repo.save(migrated);
    expect((await repo.load(profile.studentId))?.worldLocation).toEqual(
      migrated.worldLocation,
    );
  });
});

/** A marker being walkable alone does not prove that a player can reach it. */
describe("campus route connectivity", () => {
  const reachable = (
    floorId: string,
    start: { x: number; y: number },
    target: { x: number; y: number },
  ) => {
    const step = 10;
    const key = (x: number, y: number) => x + "," + y;
    const origin = {
      x: Math.round(start.x / step) * step,
      y: Math.round(start.y / step) * step,
    };
    const queue = [origin];
    const visited = new Set([key(origin.x, origin.y)]);
    for (let i = 0; i < queue.length; i++) {
      const point = queue[i];
      if (Math.hypot(point.x - target.x, point.y - target.y) < 20) return true;
      for (const [dx, dy] of [
        [step, 0],
        [-step, 0],
        [0, step],
        [0, -step],
      ]) {
        const x = point.x + dx,
          y = point.y + dy,
          k = key(x, y);
        if (visited.has(k)) continue;
        visited.add(k);
        if (walkable(floorId, { x, y })) queue.push({ x, y });
      }
    }
    return false;
  };
  it("connects ground arrival to each building lift through actual clear passages", () => {
    for (const c of connections.filter((c) => c.kind === "lift"))
      expect(
        reachable("ground", defaultLocation.position, c.position),
        c.id,
      ).toBe(true);
  });
  it("connects each quest to its building landing", () => {
    for (const location of locations.filter((l) => l.id !== "gate")) {
      const core = connections.find(
        (c) => c.buildingId === location.buildingId && c.kind === "lift",
      )!;
      expect(
        reachable(location.floorId, core.position, location.worldPosition),
        location.id,
      ).toBe(true);
    }
  });
  it("preserves completed quests and discovered POIs when migrating and restoring", async () => {
    const memory = new Map<string, string>();
    const repository = new LocalGameRepository({
      getItem: (k) => memory.get(k) ?? null,
      setItem: (k, v) => {
        memory.set(k, v);
      },
      removeItem: (k) => {
        memory.delete(k);
      },
    });
    const profile = {
      id: "local:2023-3-60-902",
      studentId: "2023-3-60-902",
      email: "qa@std.ewubd.edu",
      displayName: "QA",
      avatarId: "explorer-01",
    };
    const save = newGame(profile);
    save.quests = { welcome: { status: "COMPLETED", attempts: 1, score: 1 } };
    save.discoveredPois = ["gate", "library"];
    const library = locations.find((l) => l.id === "library")!;
    save.worldLocation = {
      floorId: library.floorId,
      buildingId: library.buildingId,
      position: library.worldPosition,
    };
    await repository.save(save);
    const restored = await repository.load(profile.studentId);
    expect(restored?.quests).toEqual(save.quests);
    expect(restored?.discoveredPois).toEqual(save.discoveredPois);
    expect(restored?.worldLocation).toEqual(save.worldLocation);
  });
});
