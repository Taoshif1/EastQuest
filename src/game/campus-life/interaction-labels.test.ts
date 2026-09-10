import { describe, expect, it } from "vitest";
import { interactionAction } from "./interaction-labels";

describe("interaction labels", () => {
  it("maps target types to concise game actions", () => {
    expect(interactionAction("npc:lina", false)).toBe("Talk");
    expect(interactionAction("gate-punch", false)).toBe("Investigate");
    expect(interactionAction("sports-board", false)).toBe("Play");
    expect(interactionAction("courtyard-bench", false)).toBe("Inspect");
    expect(interactionAction(null, true)).toBe("Choose floor");
  });
});
