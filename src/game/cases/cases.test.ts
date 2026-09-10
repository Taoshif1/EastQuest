import { describe, expect, it } from "vitest";
import { newGame } from "@/game/quests/quest-engine";
import { cases, clues } from "./data";
import { collectClue, completeCase, initialCases, startCase, useHint } from "./engine";
import { evaluateEvidenceOrder, evaluatePattern } from "./minigames";

const profile = { id: "local:case", studentId: "2023-3-60-901", email: "case@test", displayName: "Case Tester", avatarId: "explorer-01" };
describe("case and clue foundation", () => {
  it("initializes a case without changing legacy quests", () => {
    const save = startCase(newGame(profile), cases[0]);
    expect(save.cases?.["lost-campus-file"].status).toBe("ACTIVE");
    expect(save.quests).toEqual({});
  });
  it("collects each clue once", () => {
    const save = startCase(newGame(profile), cases[0]);
    const first = collectClue(save, "lost-campus-file", clues[0].id);
    const second = collectClue(first.save, "lost-campus-file", clues[0].id);
    expect(first.isNew).toBe(true);
    expect(second.isNew).toBe(false);
    expect(second.save.cases?.["lost-campus-file"].discoveredClues).toHaveLength(1);
  });
  it("does not collect unknown clues or skip stages", () => {
    const save = startCase(newGame(profile), cases[0]);
    expect(collectClue(save, "lost-campus-file", "unknown").isNew).toBe(false);
    expect(save.cases?.["lost-campus-file"]).toEqual({ ...initialCases()["lost-campus-file"], status: "ACTIVE", startedAt: expect.any(String) });
  });
  it("completes the case and awards its badge once", () => {
    let save = startCase(newGame(profile), cases[0]);
    save = completeCase(save, cases[0]);
    const again = completeCase(save, cases[0]);
    expect(save.xp).toBe(75);
    expect(save.badges?.investigator).toBeDefined();
    expect(again.xp).toBe(75);
  });
  it("keeps specialty optional and non-blocking", () => {
    const save = startCase(newGame({ ...profile, specialty: "COMPUTING" }), cases[0]);
    expect(save.profile.specialty).toBe("COMPUTING");
    expect(save.cases?.["lost-campus-file"].status).toBe("ACTIVE");
  });
  it("persists layered hint usage and evaluates reusable mini-games", () => {
    let save = startCase(newGame(profile), cases[0]);
    save = useHint(save, "lost-campus-file");
    expect(save.cases?.["lost-campus-file"].hintsUsed).toBe(1);
    expect(evaluatePattern("triangle", false)).toBe(true);
    expect(evaluateEvidenceOrder(["courtyard", "library", "final"])).toBe(true);
    expect(evaluateEvidenceOrder(["library", "courtyard", "final"])).toBe(false);
  });
});
