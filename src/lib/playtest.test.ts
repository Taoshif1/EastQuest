import { describe, expect, it } from "vitest";
import { APP_VERSION, isDebugMode } from "./app-info";
import { serializeFeedback } from "./feedback";
import { locations, quests, collectibles, WORLD } from "@/game/data/campus";
import { walkable } from "@/game/data/campus/index";
import { MiniGameRegistry } from "@/game/minigames/registry";
import manifest from "@/app/manifest";
import { version } from "../../package.json";
describe("playtest opt-in", () => {
  it("accepts only a single explicit debug=1", () => {
    expect(isDebugMode("?debug=1")).toBe(true);
    expect(isDebugMode("?other=yes&debug=1")).toBe(true);
    for (const q of [
      "",
      "?debug=0",
      "?debug=true",
      "?Debug=1",
      "?debug=1&debug=0",
      "?debug=1&debug=1",
    ])
      expect(isDebugMode(q)).toBe(false);
  });
});
describe("feedback export", () => {
  const input = {
    rating: 4,
    positiveNotes: " Good movement ",
    confusingNotes: "",
    bugNotes: "",
    suggestion: "",
    deviceInfo: { browser: "test", viewportWidth: 390, viewportHeight: 844 },
  };
  it("round-trips notes with release metadata and omits unexpected private fields", () => {
    const raw = serializeFeedback(
      { ...input, studentId: "private", token: "secret" } as typeof input,
      new Date("2026-09-09T12:00:00Z"),
    );
    const result = JSON.parse(raw);
    expect(result).toEqual({
      ...input,
      positiveNotes: "Good movement",
      schemaVersion: 1,
      version: APP_VERSION,
      createdAt: "2026-09-09T12:00:00.000Z",
    });
    expect(raw).not.toContain("private");
    expect(raw).not.toContain("secret");
  });
  it.each([0, 6, 1.5, NaN])("rejects invalid rating %s", (rating) => {
    expect(() => serializeFeedback({ ...input, rating })).toThrow();
  });
  it("limits large notes and retains escaped characters", () => {
    const result = JSON.parse(
      serializeFeedback({
        ...input,
        positiveNotes: "x".repeat(5000),
        bugNotes: 'line\n"quoted"',
      }),
    );
    expect(result.positiveNotes).toHaveLength(4000);
    expect(result.bugNotes).toBe('line\n"quoted"');
  });
});
describe("release and content integrity", () => {
  it("uses package version and a scoped standalone manifest", () => {
    expect(APP_VERSION).toBe(version);
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest()).toMatchObject({
      name: "EastQuest",
      display: "standalone",
      scope: "/",
    });
    expect(manifest().icons?.map((icon) => icon.sizes)).toEqual([
      "192x192",
      "512x512",
    ]);
  });
  it("keeps unique content IDs and valid references, choices and rewards", () => {
    for (const items of [locations, quests, collectibles])
      expect(new Set(items.map((x) => x.id)).size).toBe(items.length);
    for (const q of quests) {
      expect(locations.some((l) => l.id === q.locationId)).toBe(true);
      expect(
        collectibles.some(
          (c) => c.id === q.collectibleId && c.location === q.locationId,
        ),
      ).toBe(true);
      expect(MiniGameRegistry[q.type]).toBeTypeOf("function");
      expect(q.config.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.config.correctIndex).toBeLessThan(q.config.options.length);
      expect(Number.isInteger(q.config.correctIndex)).toBe(true);
      expect(q.rewardXp).toBeGreaterThan(0);
      for (const id of q.prerequisites)
        expect(quests.some((p) => p.id === id)).toBe(true);
    }
    const visit = (id: string, path: string[]) => {
      expect(path).not.toContain(id);
      for (const dep of quests.find((q) => q.id === id)!.prerequisites)
        visit(dep, [...path, id]);
    };
    quests.forEach((q) => visit(q.id, []));
  });
  it("keeps markers in bounds and on walkable floor geometry", () => {
    for (const l of locations) {
      expect(l.interactionRadius).toBeGreaterThan(0);
      expect(l.worldPosition.x).toBeGreaterThanOrEqual(0);
      expect(l.worldPosition.x).toBeLessThanOrEqual(WORLD.width);
      expect(l.worldPosition.y).toBeGreaterThanOrEqual(0);
      expect(l.worldPosition.y).toBeLessThanOrEqual(WORLD.height);
      expect(walkable(l.floorId, l.worldPosition)).toBe(true);
    }
  });
});
