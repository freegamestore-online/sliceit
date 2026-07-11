import type { KnifeSkin } from "../types";

export const KNIFE_SKINS: KnifeSkin[] = [
  {
    id: "classic", name: "Classic Chef", emoji: "🔪", cost: 0, owned: true,
    bladeColor: "#e0e0e0", bladeShine: "#ffffff", handleColor: "#8d6e63",
    trailColor: "rgba(200,220,255,", special: "none",
  },
  {
    id: "golden", name: "Golden Blade", emoji: "✨", cost: 30, owned: false,
    bladeColor: "#ffd54f", bladeShine: "#fff9c4", handleColor: "#bf8f00",
    trailColor: "rgba(255,215,0,", special: "gold",
  },
  {
    id: "candy", name: "Candy Cane", emoji: "🍬", cost: 50, owned: false,
    bladeColor: "#f48fb1", bladeShine: "#fce4ec", handleColor: "#ce93d8",
    trailColor: "rgba(244,143,177,", special: "none",
  },
  {
    id: "ice", name: "Ice Shard", emoji: "❄️", cost: 80, owned: false,
    bladeColor: "#81d4fa", bladeShine: "#e1f5fe", handleColor: "#0288d1",
    trailColor: "rgba(129,212,250,", special: "ice",
  },
  {
    id: "fire", name: "Flame Blade", emoji: "🔥", cost: 120, owned: false,
    bladeColor: "#ff7043", bladeShine: "#ffccbc", handleColor: "#bf360c",
    trailColor: "rgba(255,112,67,", special: "fire",
  },
  {
    id: "rainbow", name: "Rainbow", emoji: "🌈", cost: 200, owned: false,
    bladeColor: "#ce93d8", bladeShine: "#f3e5f5", handleColor: "#7b1fa2",
    trailColor: "rgba(206,147,216,", special: "rainbow",
  },
];

export interface KnifeState {
  /** current knife tip X in screen coords */
  x: number;
  /** current knife tip Y */
  y: number;
  /** previous tip positions for trail */
  trail: { x: number; y: number }[];
  isDown: boolean;
  angle: number;
}

export function makeKnifeState(W: number, H: number): KnifeState {
  return { x: W / 2, y: H * 0.75, trail: [], isDown: false, angle: -Math.PI / 2 };
}

export function drawKnife(
  ctx: CanvasRenderingContext2D,
  ks: KnifeState,
  skin: KnifeSkin,
  time: number,
): void {
  const { x, y, angle, trail, isDown } = ks;

  // ── trail ──────────────────────────────────────────────────────────────────
  if (isDown && trail.length > 1) {
    for (let i = 1; i < trail.length; i++) {
      const t = i / trail.length;
      const prev = trail[i - 1]!;
      const curr = trail[i]!;

      if (skin.special === "rainbow") {
        const hue = (time * 120 + i * 15) % 360;
        ctx.strokeStyle = `hsla(${hue},90%,70%,${t * 0.7})`;
      } else if (skin.special === "fire") {
        ctx.strokeStyle = `rgba(255,${Math.floor(100 + t * 100)},0,${t * 0.8})`;
      } else {
        ctx.strokeStyle = skin.trailColor + (t * 0.65) + ")";
      }
      ctx.lineWidth = t * 10;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();
    }
  }

  // ── knife body ─────────────────────────────────────────────────────────────
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // handle
  const hGrad = ctx.createLinearGradient(-7, 4, 7, 36);
  hGrad.addColorStop(0, skin.handleColor);
  hGrad.addColorStop(1, skin.handleColor + "99");
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-7, 4, 14, 30, 4);
  else ctx.rect(-7, 4, 14, 30);
  ctx.fillStyle = hGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // guard
  ctx.fillStyle = skin.bladeColor;
  ctx.fillRect(-9, 2, 18, 4);

  // blade
  const bGrad = ctx.createLinearGradient(-5, -44, 5, 4);
  bGrad.addColorStop(0, skin.bladeShine);
  bGrad.addColorStop(0.4, skin.bladeColor);
  bGrad.addColorStop(1, skin.bladeColor + "cc");
  ctx.beginPath();
  ctx.moveTo(0, -44);
  ctx.lineTo(5, 4);
  ctx.lineTo(-5, 4);
  ctx.closePath();
  ctx.fillStyle = bGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // shine line
  ctx.beginPath();
  ctx.moveTo(-1.5, -38);
  ctx.lineTo(1.5, -8);
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.restore();
}
