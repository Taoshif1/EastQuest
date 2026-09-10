import { describe, expect, it } from "vitest";
import { newGame } from "@/game/quests/quest-engine";
import { claimDailyChallenge, completeSideQuestStep, dailyChallenge, discoverHidden, startSideQuest } from "./engine";
import { hiddenDiscoveries, npcs, sideQuests, worldInteractions } from "./data";

const profile = { id: "local:life", studentId: "life-1", email: "life@test", displayName: "Life", avatarId: "explorer-01" };

describe("campus life progression", () => {
  it("ships distributed interactions, NPCs, discoveries, and side quests as content data", async () => {
    expect(hiddenDiscoveries).toHaveLength(11);
    expect(worldInteractions.length).toBeGreaterThanOrEqual(12);
    expect(npcs.length).toBeGreaterThanOrEqual(6);
    expect(sideQuests).toHaveLength(5);
    expect(new Set(hiddenDiscoveries.map((item) => item.floorId)).size).toBeGreaterThanOrEqual(5);
  });
  it("stamps hidden discoveries and does not duplicate XP", () => {
    const first = discoverHidden(newGame(profile), "punch-gate-story");
    const second = discoverHidden(first.save, "punch-gate-story");
    expect(first.isNew).toBe(true);
    expect(second.isNew).toBe(false);
    expect(second.save.xp).toBe(first.save.xp);
    expect(first.save.hiddenDiscoveries?.["punch-gate-story"]?.stamp).toBe("TRACE-01");
  });
  it("completes the optional Three Marks chain across floors", () => {
    let save = newGame(profile);
    for (const id of ["three-marks-i", "three-marks-ii", "three-marks-iii"])
      save = discoverHidden(save, id).save;
    expect(save.achievements?.["three-marks"]).toBeDefined();
    expect(save.hiddenDiscoveries?.["three-marks-iii"]?.stamp).toBe("MARK-III");
  });
  it("advances and completes a multi-step route", () => {
    let save = startSideQuest(newGame(profile), sideQuests[0]);
    const first = completeSideQuestStep(save, sideQuests[0].id, "ask-mina");
    save = first.save;
    const second = completeSideQuestStep(save, sideQuests[0].id, "check-atlas");
    save = second.save;
    const third = completeSideQuestStep(save, sideQuests[0].id, "share-lina");
    expect(third.completed).toBe(true);
    expect(third.save.sideQuests?.["echoes-and-edges"]?.status).toBe("COMPLETED");
  });
  it("selects a stable daily challenge and claims its reward once per date", () => {
    const date = new Date("2026-09-10T00:00:00.000Z");
    const challenge = dailyChallenge(date);
    const first = claimDailyChallenge(newGame(profile), date);
    const second = claimDailyChallenge(first.save, date);
    expect(challenge.date).toBe("2026-09-10");
    expect(first.claimed).toBe(true);
    expect(second.claimed).toBe(false);
  });
});
