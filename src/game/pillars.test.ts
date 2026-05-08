import { describe, expect, it } from "vitest";
import {
  generatePillarHeights,
  levelEndThreshold,
  pillarCount,
} from "./pillars";

describe("pillars", () => {
  it("scales pillar count with level", () => {
    expect(pillarCount(1)).toBe(7);
    expect(pillarCount(5)).toBe(15);
    expect(levelEndThreshold(3)).toBe(11);
  });

  it("generates the right number of [top, bottom] tuples", () => {
    const heights = generatePillarHeights(2);
    expect(heights).toHaveLength(pillarCount(2));
    for (const tuple of heights) {
      expect(tuple).toHaveLength(2);
      expect(typeof tuple[0]).toBe("number");
      expect(typeof tuple[1]).toBe("number");
    }
  });

  it("first pillar uses a more lenient height range", () => {
    // Run many trials so we exercise the random distribution.
    for (let trial = 0; trial < 50; trial++) {
      const heights = generatePillarHeights(1);
      const [first0, first1] = heights[0];
      const sum = first0 + first1;
      // Level 1 multiplier is 5, so the level-1 first-pillar sum range is [12.5, 47.5].
      expect(sum).toBeGreaterThanOrEqual(12.5);
      expect(sum).toBeLessThanOrEqual(47.5);
    }
  });
});
