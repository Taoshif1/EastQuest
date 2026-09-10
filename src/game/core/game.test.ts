import { describe, it, expect } from "vitest";
import {
  parseStudentId,
  studentIdToEmail,
  validateStudentId,
} from "@/lib/validation/student-id";
import { quests, locations, WORLD } from "@/game/data/campus";
import { QuestEngine, newGame } from "@/game/quests/quest-engine";
import {
  SimulatedPositionProvider,
  normalizedDirection,
} from "@/game/movement/position-provider";
import { ProximityVerificationProvider } from "@/game/verification/location-verification";
import {
  LocalGameRepository,
  type StoragePort,
} from "@/game/persistence/game-repository";
import { PrototypeAuthProvider } from "@/components/auth/auth-provider";
import { progression } from "@/game/progression/progression";
const profile = {
  id: "local:2023-3-60-376",
  studentId: "2023-3-60-376",
  email: "2023-3-60-376@std.ewubd.edu",
  displayName: "Campus Explorer",
  avatarId: "explorer-01",
};
function setup() {
  const position = new SimulatedPositionProvider(WORLD.spawn);
  return {
    position,
    engine: new QuestEngine(
      quests,
      locations,
      new ProximityVerificationProvider(position),
    ),
  };
}
function memory() {
  const values = new Map<string, string>();
  const storage: StoragePort = {
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => {
      values.set(k, v);
    },
    removeItem: (k) => {
      values.delete(k);
    },
  };
  return { values, storage };
}
describe("prototype student identity", () => {
  it("parses and trims a valid example", () =>
    expect(parseStudentId(" 2023-3-60-376 ")).toBe(profile.studentId));
  it("derives the student email", () =>
    expect(studentIdToEmail(profile.studentId)).toBe(profile.email));
  it.each([
    "",
    "2023-4-60-376",
    "2023-3-60",
    "abc",
    profile.email,
    "2023-3-60-376<script>",
  ])("rejects invalid input %s", (id) => {
    expect(validateStudentId(id)).toBe(false);
    expect(() => studentIdToEmail(id)).toThrow();
  });
});
describe("QuestEngine", () => {
  it("makes tutorial available and later quests locked", () => {
    const { engine } = setup();
    expect(engine.status(newGame(profile), "welcome")).toBe("AVAILABLE");
    expect(engine.status(newGame(profile), "research")).toBe("LOCKED");
  });
  it("enforces prerequisites and activation", async () => {
    const { engine } = setup();
    await expect(engine.activate(newGame(profile), "research")).rejects.toThrow(
      "tutorial",
    );
    await expect(engine.submit(newGame(profile), "welcome", 0)).rejects.toThrow(
      "Start",
    );
  });
  it("activates, completes, awards XP and unlocks a dated key", async () => {
    const { engine } = setup();
    const active = await engine.activate(newGame(profile), "welcome");
    expect(engine.status(active, "welcome")).toBe("ACTIVE");
    const { save } = await engine.submit(active, "welcome", 0);
    expect(engine.status(save, "welcome")).toBe("COMPLETED");
    expect(save.xp).toBe(50);
    expect(save.collectibles["explorer-pass"].obtainedAt).toBeTruthy();
    expect(engine.status(save, "research")).toBe("AVAILABLE");
  });
  it("protects rewards from duplicate completion", async () => {
    const { engine } = setup();
    const active = await engine.activate(newGame(profile), "welcome");
    const { save } = await engine.submit(active, "welcome", 0);
    const repeated = await engine.submit(save, "welcome", 0);
    expect(repeated.save).toBe(save);
    expect(save.xp).toBe(50);
    expect(Object.keys(save.collectibles)).toHaveLength(1);
  });
  it("rechecks proximity on completion", async () => {
    const { engine, position } = setup();
    const active = await engine.activate(newGame(profile), "welcome");
    position.update({ x: 50, y: 50 });
    await expect(engine.activate(newGame(profile), "welcome")).rejects.toThrow(
      "closer",
    );
    await expect(engine.submit(active, "welcome", 0)).rejects.toThrow("closer");
  });
  it("records failed attempts without rewards and allows retries", async () => {
    const { engine } = setup();
    const active = await engine.activate(newGame(profile), "welcome");
    const wrong = await engine.submit(active, "welcome", 2);
    expect(wrong.correct).toBe(false);
    expect(wrong.save.xp).toBe(0);
    expect(wrong.save.quests.welcome.attempts).toBe(1);
    expect(wrong.save.collectibles).toEqual({});
    const right = await engine.submit(wrong.save, "welcome", 0);
    expect(right.save.quests.welcome.attempts).toBe(2);
  });
  it("finishes five quests at 450 XP and level 2", async () => {
    const { engine, position } = setup();
    let save = newGame(profile);
    for (const q of quests) {
      const l = locations.find((l) => l.id === q.locationId)!;
      position.updateWorldLocation({
        buildingId: l.buildingId,
        floorId: l.floorId,
        position: l.worldPosition,
      });
      save = await engine.activate(save, q.id);
      save = (await engine.submit(save, q.id, q.config.correctIndex)).save;
    }
    expect(save.xp).toBe(450);
    expect(save.level).toBe(2);
    expect(Object.keys(save.collectibles)).toHaveLength(5);
    expect(
      Object.values(save.quests).every((q) => q.status === "COMPLETED"),
    ).toBe(true);
  });
});
describe("movement and verification", () => {
  it("normalizes diagonal motion", () => {
    const v = normalizedDirection(1, 1);
    expect(Math.hypot(v.x, v.y)).toBeCloseTo(1);
    expect(normalizedDirection(0, 0)).toEqual({ x: 0, y: 0 });
  });
  it("includes exact proximity boundary and rejects points beyond it", async () => {
    const l = locations[0];
    const p = new SimulatedPositionProvider({
      x: l.worldPosition.x + l.interactionRadius,
      y: l.worldPosition.y,
    });
    const verifier = new ProximityVerificationProvider(p);
    expect((await verifier.verify(l)).verified).toBe(true);
    p.update({
      x: l.worldPosition.x + l.interactionRadius + 1,
      y: l.worldPosition.y,
    });
    expect((await verifier.verify(l)).verified).toBe(false);
  });
  it("cleans up position subscriptions and protects snapshots", () => {
    const p = new SimulatedPositionProvider({ x: 0, y: 0 });
    let calls = 0;
    const off = p.subscribe(() => calls++);
    p.update({ x: 1, y: 2 });
    off();
    p.update({ x: 3, y: 4 });
    p.getPosition().x = 999;
    expect(calls).toBe(1);
    expect(p.getPosition().x).toBe(3);
  });
  it("computes level boundaries", () => {
    expect(progression(299)).toEqual({ level: 1, current: 299, target: 300 });
    expect(progression(300).level).toBe(2);
  });
});
describe("LocalGameRepository", () => {
  it("serializes and restores rewarded progress in a fresh instance", async () => {
    const { storage } = memory();
    const repo = new LocalGameRepository(storage);
    const { engine } = setup();
    const save = (
      await engine.submit(
        await engine.activate(newGame(profile), "welcome"),
        "welcome",
        0,
      )
    ).save;
    await repo.save(save);
    await repo.setActiveStudentId(profile.studentId);
    const fresh = new LocalGameRepository(storage);
    expect(await fresh.load(profile.studentId)).toEqual({ ...save, sportsMedals: {} });
    expect(await fresh.activeStudentId()).toBe(profile.studentId);
  });
  it("isolates profiles and deletes only the selected save", async () => {
    const { storage } = memory();
    const repo = new LocalGameRepository(storage);
    await repo.save(newGame(profile));
    expect(await repo.load("2024-1-60-001")).toBeNull();
    await repo.remove(profile.studentId);
    expect(await repo.load(profile.studentId)).toBeNull();
  });
  it("rejects corrupt saves without overwriting them", async () => {
    const { storage, values } = memory();
    const key = "eastquest:v1:player:" + profile.studentId;
    values.set(key, "{bad");
    await expect(
      new LocalGameRepository(storage).load(profile.studentId),
    ).rejects.toThrow("unreadable");
    expect(values.get(key)).toBe("{bad");
  });
  it("surfaces failed writes", async () => {
    const { storage } = memory();
    storage.setItem = () => {
      throw new Error("Quota exceeded");
    };
    await expect(
      new LocalGameRepository(storage).save(newGame(profile)),
    ).rejects.toThrow("Quota");
  });
  it("restores the same prototype identity without passwords", async () => {
    const { storage } = memory();
    const repo = new LocalGameRepository(storage);
    const auth = new PrototypeAuthProvider(repo);
    expect((await auth.signIn(profile.studentId)).avatarId).toBe("explorer-01");
    await auth.signOut();
    expect(await repo.activeStudentId()).toBeNull();
    expect((await auth.signIn(profile.studentId)).email).toBe(profile.email);
  });
});
