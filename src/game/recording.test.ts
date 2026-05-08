import { describe, expect, it } from "vitest";
import {
  appendEvent,
  recordingDurationMs,
  valueAt,
  type Recording,
} from "./recording";

describe("recording", () => {
  it("appends edges only when the value actually changes", () => {
    let r: Recording = [];
    r = appendEvent(r, 0, false);
    r = appendEvent(r, 100, false);
    r = appendEvent(r, 200, true);
    r = appendEvent(r, 300, true);
    r = appendEvent(r, 400, false);
    expect(r).toEqual([
      [0, false],
      [200, true],
      [400, false],
    ]);
  });

  it("rounds and clamps timestamps", () => {
    let r: Recording = [];
    r = appendEvent(r, -5, false);
    r = appendEvent(r, 12.7, true);
    expect(r).toEqual([
      [0, false],
      [13, true],
    ]);
  });

  it("resolves the right value at a given time", () => {
    const r: Recording = [
      [0, false],
      [100, true],
      [250, false],
      [400, true],
    ];
    expect(valueAt(r, 0)).toBe(false);
    expect(valueAt(r, 50)).toBe(false);
    expect(valueAt(r, 100)).toBe(true);
    expect(valueAt(r, 200)).toBe(true);
    expect(valueAt(r, 250)).toBe(false);
    expect(valueAt(r, 999)).toBe(true);
  });

  it("returns false on an empty recording", () => {
    expect(valueAt([], 0)).toBe(false);
    expect(valueAt([], 9999)).toBe(false);
    expect(recordingDurationMs([])).toBe(0);
  });

  it("reports the duration as the last event's timestamp", () => {
    expect(
      recordingDurationMs([
        [0, false],
        [500, true],
        [1234, false],
      ]),
    ).toBe(1234);
  });
});
