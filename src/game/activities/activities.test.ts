import { describe, expect, it } from "vitest";
import { activities } from "./data";
import { discoverRumor, penaltyScore, recordActivityResult, sportMedalForScore } from "./engine";
import { newGame } from "@/game/quests/quest-engine";
import { LocalGameRepository, type StoragePort } from "@/game/persistence/game-repository";

const profile = {
  id: "local:activities",
  studentId: "2023-3-60-901",
  email: "activities@test",
  displayName: "Activity Tester",
  avatarId: "explorer-01",
};

describe("campus activity progression", () => {
  it("uses multi-round sports loops", () => {
    expect(activities.find((item) => item.id === "cricket-boundary-timing")?.rounds).toHaveLength(6);
    expect(activities.find((item) => item.id === "futsal-penalty")?.rounds).toHaveLength(5);
    expect(activities.find((item) => item.id === "table-tennis-reaction")?.rounds).toHaveLength(3);
  });
  it("keeps activity IDs unique and covers the broad playable domains", () => {
    expect(new Set(activities.map((activity) => activity.id)).size).toBe(activities.length);
    expect(new Set(activities.map((activity) => activity.specialty).filter(Boolean)).size).toBeGreaterThanOrEqual(6);
  });
  it("migrates a V0.3A save with no activity fields", async () => {
    const values = new Map<string, string>();
    const storage: StoragePort = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    };
    const legacy = newGame(profile);
    delete legacy.activities;
    delete legacy.achievements;
    delete legacy.stamps;
    delete legacy.discoveredRumors;
    values.set(`eastquest:v1:player:${profile.studentId}`, JSON.stringify(legacy));
    const migrated = await new LocalGameRepository(storage).load(profile.studentId);
    expect(Object.keys(migrated!.activities ?? {})).toContain("source-sleuth");
    expect(migrated!.achievements).toEqual({});
    expect(migrated!.stamps).toEqual({});
    expect(migrated!.discoveredRumors).toEqual([]);
  });

  it("awards a stamp, XP, and first activity achievement once", () => {
    const activity = activities.find((item) => item.id === "source-sleuth")!;
    const first = recordActivityResult(newGame(profile), activity, 100, true);
    const second = recordActivityResult(first.save, activity, 100, true);
    expect(first.save.xp).toBe(activity.rewardXp);
    expect(first.save.stamps?.[activity.id]).toBeDefined();
    expect(first.save.achievements?.["first-activity"]).toBeDefined();
    expect(first.newStamp).toBe(true);
    expect(second.save.xp).toBe(activity.rewardXp);
    expect(second.newStamp).toBe(false);
  });

  it("keeps failed runs replayable without awarding rewards", () => {
    const activity = activities.find((item) => item.id === "three-point-timing")!;
    const result = recordActivityResult(newGame(profile), activity, 25, false);
    expect(result.save.xp).toBe(0);
    expect(result.save.stamps?.[activity.id]).toBeUndefined();
    expect(result.save.activities?.[activity.id].bestScore).toBe(25);
    expect(result.save.activities?.[activity.id].completed).toBe(false);
  });

  it("gives a modest optional specialty advantage without locking general players out", () => {
    const activity = activities.find((item) => item.id === "debug-dash")!;
    const general = recordActivityResult(newGame(profile), activity, 55, false);
    expect(general.completed).toBe(false);
    const focused = newGame({ ...profile, specialty: "COMPUTING" });
    const expert = recordActivityResult(focused, activity, 55, false);
    expect(expert.completed).toBe(true);
    expect(expert.score).toBe(65);
  });

  it("tracks domain breadth and safe hidden discoveries", () => {
    let save = newGame(profile);
    for (const id of ["source-sleuth", "debug-dash", "club-pitch"]) {
      save = recordActivityResult(save, activities.find((item) => item.id === id)!, 100, true).save;
    }
    expect(save.achievements?.["activity-explorer"]).toBeDefined();
    const found = discoverRumor(save, "rooftop-garden");
    expect(found.isNew).toBe(true);
    expect(discoverRumor(found.save, "rooftop-garden").isNew).toBe(false);
  });

  it("uses centralized sports medal thresholds and only upgrades medals", () => {
    expect(sportMedalForScore(60)).toBe("BRONZE");
    expect(sportMedalForScore(75)).toBe("SILVER");
    expect(sportMedalForScore(90)).toBe("GOLD");
    const activity = activities.find((item) => item.id === "cricket-boundary-timing")!;
    const bronze = recordActivityResult(newGame(profile), activity, 60, true);
    const silver = recordActivityResult(bronze.save, activity, 80, true);
    const replay = recordActivityResult(silver.save, activity, 70, true);
    expect(bronze.save.sportsMedals?.[activity.id]).toBe("BRONZE");
    expect(silver.save.sportsMedals?.[activity.id]).toBe("SILVER");
    expect(replay.save.sportsMedals?.[activity.id]).toBe("SILVER");
    expect(replay.newMedal).toBeUndefined();
  });

  it("keeps penalty saves at zero and open corners as goals", () => {
    expect(penaltyScore("left", "left")).toBe(0);
    expect(penaltyScore("left", "right")).toBe(100);
  });
});
