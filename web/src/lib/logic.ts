import type { FoodType, KnifeConfig, BackgroundTheme } from "../types";

export const ROUND_SECONDS = 60;

export const FOOD_CONFIGS: Record<FoodType, { color: string; accent: string; points: number; label: string }> = {
  watermelon: { color: "#ff6b8a", accent: "#4caf50", points: 10, label: "🍉" },
  strawberry:  { color: "#ff4d6d", accent: "#ff8fa3", points: 15, label: "🍓" },
  banana:      { color: "#ffe066", accent: "#ffb703", points: 8,  label: "🍌" },
  donut:       { color: "#ffb7c5", accent: "#c77dff", points: 20, label: "🍩" },
  cake:        { color: "#ffd6e7", accent: "#ff85a1", points: 25, label: "🎂" },
  orange:      { color: "#ffb347", accent: "#ff6b00", points: 12, label: "🍊" },
  kiwi:        { color: "#a8e063", accent: "#56ab2f", points: 18, label: "🥝" },
  lollipop:    { color: "#f72585", accent: "#7209b7", points: 30, label: "🍭" },
};

export const FOOD_TYPES: FoodType[] = [
  "watermelon", "strawberry", "banana", "donut", "cake", "orange", "kiwi", "lollipop"
];

export const KNIFE_CONFIGS: KnifeConfig[] = [
  {
    id: "classic",
    name: "Classic",
    emoji: "🔪",
    bladeColor: "#e0e0e0",
    handleColor: "#8B5E3C",
    trailColor: "rgba(200,220,255,0.6)",
    unlockScore: 0,
  },
  {
    id: "golden",
    name: "Golden",
    emoji: "✨",
    bladeColor: "#FFD700",
    handleColor: "#B8860B",
    trailColor: "rgba(255,215,0,0.5)",
    unlockScore: 100,
  },
  {
    id: "candy",
    name: "Candy",
    emoji: "🍬",
    bladeColor: "#ff6eb4",
    handleColor: "#c77dff",
    trailColor: "rgba(255,110,180,0.5)",
    unlockScore: 200,
  },
  {
    id: "rainbow",
    name: "Rainbow",
    emoji: "🌈",
    bladeColor: "#00d2ff",
    handleColor: "#7b2ff7",
    trailColor: "rgba(100,200,255,0.5)",
    unlockScore: 400,
  },
  {
    id: "cosmic",
    name: "Cosmic",
    emoji: "🌙",
    bladeColor: "#a855f7",
    handleColor: "#1e1b4b",
    trailColor: "rgba(168,85,247,0.5)",
    unlockScore: 700,
  },
];

export const BG_THEMES: BackgroundTheme[] = [
  {
    id: "candy",
    name: "Candy Shop",
    bg: "#fff0f6",
    stripes: ["#ffe0ef", "#ffd6eb"],
    unlockScore: 0,
  },
  {
    id: "mint",
    name: "Mint Dream",
    bg: "#f0fff4",
    stripes: ["#d0f5e0", "#c5f0d8"],
    unlockScore: 150,
  },
  {
    id: "lavender",
    name: "Lavender Sky",
    bg: "#f5f0ff",
    stripes: ["#e8d8ff", "#ddc8ff"],
    unlockScore: 300,
  },
  {
    id: "peach",
    name: "Peach Bliss",
    bg: "#fff5f0",
    stripes: ["#ffe8d6", "#ffdcc8"],
    unlockScore: 500,
  },
];

export function getPathPoints(W: number, H: number): { x: number; y: number }[] {
  // Winding conveyor path from left to right across the screen
  const margin = W * 0.08;
  const rows = 3;
  const rowH = (H * 0.7) / rows;
  const startY = H * 0.18;
  const points: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    const y = startY + r * rowH + rowH * 0.5;
    if (r % 2 === 0) {
      // left to right
      for (let i = 0; i <= 20; i++) {
        points.push({ x: margin + (W - margin * 2) * (i / 20), y });
      }
    } else {
      // right to left
      for (let i = 0; i <= 20; i++) {
        points.push({ x: W - margin - (W - margin * 2) * (i / 20), y });
      }
    }
  }
  return points;
}

export function getPathPosition(points: { x: number; y: number }[], t: number): { x: number; y: number } {
  if (points.length === 0) return { x: 0, y: 0 };
  const clamped = Math.max(0, Math.min(1, t));
  const idx = clamped * (points.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, points.length - 1);
  const frac = idx - lo;
  const a = points[lo]!;
  const b = points[hi]!;
  return {
    x: a.x + (b.x - a.x) * frac,
    y: a.y + (b.y - a.y) * frac,
  };
}

export function randomFood(id: number): import("../types").FoodItem {
  const type = FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)]!;
  return {
    id,
    type,
    x: 0,
    y: 0,
    pathT: 0,
    speed: 0.04 + Math.random() * 0.03,
    radius: 32 + Math.random() * 12,
    sliced: false,
    sliceProgress: 0,
    sliceAngle: Math.random() * Math.PI,
    points: FOOD_CONFIGS[type].points,
    wobble: 0,
    wobbleSpeed: 1.5 + Math.random() * 2,
  };
}
