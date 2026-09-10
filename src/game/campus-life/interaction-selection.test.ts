import { describe, expect, it } from "vitest";
import { cycleInteraction, rankInteractions } from "./interaction-selection";

describe("nearby interaction selection", () => {
  const candidates = [
    { id: "library", kind: "poi" as const, distance: 4 },
    { id: "noticeboard-ground", kind: "discovery" as const, distance: 18 },
    { id: "npc:mina", kind: "npc" as const, distance: 30 },
    { id: "echoes-and-edges", kind: "side-quest" as const, distance: 45 },
  ];

  it("prioritizes required content before optional nearby content", () => {
    expect(rankInteractions(candidates).map((item) => item.id)).toEqual([
      "echoes-and-edges",
      "npc:mina",
      "noticeboard-ground",
      "library",
    ]);
  });

  it("cycles deterministically through ranked targets", () => {
    expect(cycleInteraction(candidates, "npc:mina")?.id).toBe(
      "noticeboard-ground",
    );
    expect(cycleInteraction(candidates, "npc:mina", -1)?.id).toBe(
      "echoes-and-edges",
    );
  });
});
