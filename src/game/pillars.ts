import { generateRandomTuple } from "../generateRandomTuple";

export const NUM_OF_PILLARS = 5;
export const DIST_BETWEEN_PILLARS = 300;

export const pillarCount = (level: number) => NUM_OF_PILLARS + level * 2;

export const levelEndThreshold = (level: number) => pillarCount(level);

export function generatePillarHeights(level: number): [number, number][] {
  const count = pillarCount(level);
  const multiplier = level * 5;
  return Array.from({ length: count }, (_, i) => {
    if (i === 0) {
      return generateRandomTuple(
        Math.min(10 + multiplier / 2, 75),
        Math.min(45 + multiplier / 2, 60),
      );
    }
    return generateRandomTuple(
      Math.min(50 + multiplier / 2, 80),
      Math.min(80 + multiplier / 2, 85),
    );
  });
}
