import { describe, it, expect } from "vitest";
import { getPathPosition, ROUND_SECONDS } from "./logic";

describe("getPathPosition", () => {
  it("returns start at t=0", () => {
    const pts = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
    const p = getPathPosition(pts, 0);
    expect(p.x).toBe(0);
  });
  it("returns end at t=1", () => {
    const pts = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
    const p = getPathPosition(pts, 1);
    expect(p.x).toBe(100);
  });
  it("interpolates midpoint", () => {
    const pts = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
    const p = getPathPosition(pts, 0.5);
    expect(p.x).toBeCloseTo(50);
  });
});

describe("ROUND_SECONDS", () => {
  it("is positive", () => {
    expect(ROUND_SECONDS).toBeGreaterThan(0);
  });
});
