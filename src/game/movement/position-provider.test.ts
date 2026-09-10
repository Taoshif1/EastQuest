import { describe, expect, it } from "vitest";
import { facingDirection, normalizedDirection } from "./position-provider";

describe("movement direction presentation", () => {
  it("keeps cardinal and diagonal movement normalized", () => {
    expect(normalizedDirection(-1, -1).x).toBeCloseTo(-Math.SQRT1_2);
    expect(normalizedDirection(-1, -1).y).toBeCloseTo(-Math.SQRT1_2);
    expect(Math.hypot(...Object.values(normalizedDirection(1, -1)))).toBeCloseTo(1);
  });
  it("maps movement to upright-facing states", () => {
    expect(facingDirection(0, -1)).toBe("up");
    expect(facingDirection(0, 1)).toBe("down");
    expect(facingDirection(-1, 0)).toBe("left");
    expect(facingDirection(1, 0)).toBe("right");
    expect(facingDirection(0, 0)).toBeNull();
  });
});
