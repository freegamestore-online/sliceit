import type { LevelDef } from "../types";

export const LEVELS: LevelDef[] = [
  {
    level: 1, name: "Candy Lane", subtitle: "Slice your first fruits!",
    toSlice: 8,  spawnInterval: 1.8, zSpeed: 0.28, bombChance: 0,
    bgTop: "#fce4ec", bgBottom: "#f8bbd0",
    roadColor: "#f48fb1", stripeColor: "#fff9c4",
  },
  {
    level: 2, name: "Sugar Rush", subtitle: "More fruit, more fun!",
    toSlice: 12, spawnInterval: 1.5, zSpeed: 0.32, bombChance: 0,
    bgTop: "#fce4ec", bgBottom: "#e1bee7",
    roadColor: "#ce93d8", stripeColor: "#fff9c4",
  },
  {
    level: 3, name: "Donut Derby", subtitle: "Watch out — bombs incoming!",
    toSlice: 15, spawnInterval: 1.3, zSpeed: 0.36, bombChance: 0.08,
    bgTop: "#e8f5e9", bgBottom: "#c8e6c9",
    roadColor: "#81c784", stripeColor: "#fffde7",
  },
  {
    level: 4, name: "Kiwi Storm", subtitle: "Speed it up!",
    toSlice: 18, spawnInterval: 1.1, zSpeed: 0.42, bombChance: 0.10,
    bgTop: "#e3f2fd", bgBottom: "#bbdefb",
    roadColor: "#64b5f6", stripeColor: "#fff9c4",
  },
  {
    level: 5, name: "Lollipop Blitz", subtitle: "Faster! Don't miss!",
    toSlice: 20, spawnInterval: 0.95, zSpeed: 0.48, bombChance: 0.12,
    bgTop: "#fff8e1", bgBottom: "#ffe082",
    roadColor: "#ffb74d", stripeColor: "#f8bbd0",
  },
  {
    level: 6, name: "Cake Chaos", subtitle: "High speed madness!",
    toSlice: 22, spawnInterval: 0.85, zSpeed: 0.54, bombChance: 0.15,
    bgTop: "#fce4ec", bgBottom: "#f8bbd0",
    roadColor: "#f06292", stripeColor: "#e1bee7",
  },
  {
    level: 7, name: "Fruit Fury", subtitle: "Almost there — stay sharp!",
    toSlice: 25, spawnInterval: 0.75, zSpeed: 0.60, bombChance: 0.18,
    bgTop: "#e8eaf6", bgBottom: "#c5cae9",
    roadColor: "#7986cb", stripeColor: "#fff9c4",
  },
  {
    level: 8, name: "Sweet Infinity", subtitle: "Endless slicing glory!",
    toSlice: 30, spawnInterval: 0.65, zSpeed: 0.68, bombChance: 0.20,
    bgTop: "#f3e5f5", bgBottom: "#e1bee7",
    roadColor: "#ba68c8", stripeColor: "#fff9c4",
  },
];

export function getLevel(n: number): LevelDef {
  // levels 9+ reuse level 8 with increasing speed
  const base = LEVELS[Math.min(n - 1, LEVELS.length - 1)]!;
  if (n <= LEVELS.length) return base;
  const extra = n - LEVELS.length;
  return {
    ...base,
    level: n,
    name: `Sweet Infinity ${extra + 1}`,
    subtitle: "Endless slicing glory!",
    toSlice: 30 + extra * 5,
    spawnInterval: Math.max(0.45, base.spawnInterval - extra * 0.04),
    zSpeed: base.zSpeed + extra * 0.06,
    bombChance: Math.min(0.30, base.bombChance + extra * 0.02),
  };
}
