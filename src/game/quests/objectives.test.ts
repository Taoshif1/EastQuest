import { describe, expect, it } from "vitest";
import { newGame } from "./quest-engine";
import { currentObjective, nextFloorsForObjective } from "./objectives";
import { recordDiscovery } from "./discovery";

const profile = {
  id: "local:test",
  studentId: "2023-3-60-376",
  email: "test@std.ewubd.edu",
  displayName: "Test",
  avatarId: "explorer-01",
};

describe("current objective", () => {
  it("selects the next incomplete quest from campus data", () => {
    const save = newGame(profile);
    const objective = currentObjective(save);
    expect(objective?.locationId).toBe("gate");
    expect(objective?.floor).toBe("Ground Floor");
  });

  it("advances to the library after the tutorial is completed", () => {
    const save = newGame(profile);
    save.quests.welcome = { status: "COMPLETED", score: 100, attempts: 1 };
    const objective = currentObjective(save);
    expect(objective?.locationId).toBe("library");
    expect(objective?.guidance).toContain("lift or stairs");
    expect(nextFloorsForObjective("ground", objective!)).toContain("fifth");
  });

  it("returns no objective after all quests are complete", () => {
    const save = newGame(profile);
    for (const id of ["welcome", "research", "debug", "future", "care"])
      save.quests[id] = { status: "COMPLETED", score: 100, attempts: 1 };
    expect(currentObjective(save)).toBeNull();
  });

  it("records a discovery once and leaves repeated discoveries unchanged", () => {
    const save = newGame(profile);
    const first = recordDiscovery(save, "gate");
    const second = recordDiscovery(first.save, "gate");
    expect(first.isNew).toBe(true);
    expect(first.save.discoveredPois).toEqual(["gate"]);
    expect(second.isNew).toBe(false);
    expect(second.save).toBe(first.save);
  });
});
