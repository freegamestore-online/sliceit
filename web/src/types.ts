export type GamePhase = "menu" | "playing" | "over";

export type FoodType = "watermelon" | "strawberry" | "banana" | "donut" | "cake" | "orange" | "kiwi" | "lollipop";

export interface FoodItem {
  id: number;
  type: FoodType;
  x: number;
  y: number;
  pathT: number; // 0..1 position along the conveyor path
  speed: number;
  radius: number;
  sliced: boolean;
  sliceProgress: number; // 0..1 for animation
  sliceAngle: number;
  points: number;
  wobble: number;
  wobbleSpeed: number;
}

export interface SliceParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  life: number;
  maxLife: number;
  type: "juice" | "chunk";
}

export interface KnifeConfig {
  id: string;
  name: string;
  emoji: string;
  bladeColor: string;
  handleColor: string;
  trailColor: string;
  unlockScore: number;
}

export interface BackgroundTheme {
  id: string;
  name: string;
  bg: string;
  stripes: string[];
  unlockScore: number;
}

export interface PathPoint {
  x: number;
  y: number;
}
