export type GamePhase = "menu" | "playing" | "levelcomplete" | "shop" | "over";

export type FoodType =
  | "watermelon" | "strawberry" | "banana" | "donut"
  | "orange"     | "kiwi"       | "lollipop" | "cake" | "bomb";

export interface FoodItem {
  id: number;
  type: FoodType;
  /** world X — 0 = left edge of road, 1 = right edge */
  laneX: number;
  /** world Z — distance along road (0 = horizon, 1 = player feet) */
  z: number;
  /** spin angle for 3-D feel */
  spin: number;
  spinSpeed: number;
  sliced: boolean;
  sliceProgress: number; // 0→1 fade-out after slice
  sliceAngle: number;
  points: number;
  coins: number;
  /** screen coords computed each frame from z */
  sx: number;
  sy: number;
  sr: number; // screen radius
}

export interface Particle {
  id: number;
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  r: number;
  life: number; maxLife: number;
}

export interface ScorePopup {
  id: number;
  x: number; y: number;
  text: string;
  color: string;
  life: number; maxLife: number;
}

export interface KnifeSkin {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  owned: boolean;
  bladeColor: string;
  bladeShine: string;
  handleColor: string;
  trailColor: string;
  special: "none" | "rainbow" | "fire" | "ice" | "gold";
}

export interface LevelDef {
  level: number;
  name: string;
  subtitle: string;
  toSlice: number;       // food items needed to complete
  spawnInterval: number; // seconds
  zSpeed: number;        // z units per second food travels toward player
  bombChance: number;    // 0–1
  bgTop: string;
  bgBottom: string;
  roadColor: string;
  stripeColor: string;
}
