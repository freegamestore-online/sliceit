import type { LevelDef } from "../types";

export interface RoadState {
  /** road stripe offset 0..1, animated each frame */
  stripeOffset: number;
}

export function makeRoadState(): RoadState {
  return { stripeOffset: 0 };
}

/** Vanishing point X and Y (top-center of canvas) */
export function vpCoords(W: number, H: number) {
  return { vpX: W * 0.5, vpY: H * 0.22 };
}

export function drawRoad(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  level: LevelDef,
  rs: RoadState,
  dt: number,
  speed: number,
): void {
  rs.stripeOffset = (rs.stripeOffset + dt * speed * 0.6) % 1;

  const { vpX, vpY } = vpCoords(W, H);

  // ── sky / background gradient ──────────────────────────────────────────────
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, level.bgTop);
  sky.addColorStop(0.55, level.bgBottom);
  sky.addColorStop(1, level.roadColor);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // candy-stripe side decorations
  const candies = ["🍬","🍭","⭐","🌸","✨","🍰","🧁"];
  ctx.save();
  ctx.globalAlpha = 0.13;
  ctx.font = "20px serif";
  for (let i = 0; i < 7; i++) {
    const ex = (i % 2 === 0) ? W * 0.06 : W * 0.94;
    const ey = H * 0.12 + i * H * 0.12;
    ctx.fillText(candies[i % candies.length]!, ex, ey);
  }
  ctx.restore();

  // ── road surface ───────────────────────────────────────────────────────────
  const roadHalfFar  = W * 0.06;
  const roadHalfNear = W * 0.42;

  ctx.beginPath();
  ctx.moveTo(vpX - roadHalfFar,  vpY);
  ctx.lineTo(vpX + roadHalfFar,  vpY);
  ctx.lineTo(vpX + roadHalfNear, H);
  ctx.lineTo(vpX - roadHalfNear, H);
  ctx.closePath();

  const roadGrad = ctx.createLinearGradient(0, vpY, 0, H);
  roadGrad.addColorStop(0, level.roadColor + "bb");
  roadGrad.addColorStop(1, level.roadColor);
  ctx.fillStyle = roadGrad;
  ctx.fill();

  // road edge lines
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(vpX - roadHalfFar, vpY);
  ctx.lineTo(vpX - roadHalfNear, H);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(vpX + roadHalfFar, vpY);
  ctx.lineTo(vpX + roadHalfNear, H);
  ctx.stroke();

  // ── dashed center stripe ───────────────────────────────────────────────────
  const stripeCount = 8;
  for (let i = 0; i < stripeCount; i++) {
    const t0 = ((i + rs.stripeOffset) / stripeCount) % 1;
    const t1 = ((i + rs.stripeOffset + 0.35) / stripeCount) % 1;
    if (t0 >= t1) continue; // skip wrapping stripes
    const y0 = vpY + (H - vpY) * t0;
    const y1 = vpY + (H - vpY) * t1;
    const s0 = 0.12 + t0 * 0.88;
    const s1 = 0.12 + t1 * 0.88;
    const hw0 = W * 0.012 * s0;
    const hw1 = W * 0.012 * s1;

    ctx.beginPath();
    ctx.moveTo(vpX - hw0, y0);
    ctx.lineTo(vpX + hw0, y0);
    ctx.lineTo(vpX + hw1, y1);
    ctx.lineTo(vpX - hw1, y1);
    ctx.closePath();
    ctx.fillStyle = level.stripeColor;
    ctx.globalAlpha = 0.75;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
