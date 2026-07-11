import type { FoodItem, FoodType } from "../types";

export interface FoodVisual {
  label: string;
  body: string;
  inner: string;
  shine: string;
  shadow: string;
  points: number;
  coins: number;
}

export const FOOD_VISUALS: Record<FoodType, FoodVisual> = {
  watermelon: { label:"🍉", body:"#f06292", inner:"#a5d6a7", shine:"#ff8a80", shadow:"#c2185b", points:10, coins:2 },
  strawberry:  { label:"🍓", body:"#e53935", inner:"#ffcdd2", shine:"#ff5252", shadow:"#b71c1c", points:15, coins:3 },
  banana:      { label:"🍌", body:"#fff176", inner:"#fff9c4", shine:"#ffff8d", shadow:"#f9a825", points: 8, coins:1 },
  donut:       { label:"🍩", body:"#ffab91", inner:"#f8bbd0", shine:"#ffccbc", shadow:"#e64a19", points:20, coins:4 },
  orange:      { label:"🍊", body:"#ffa726", inner:"#ffe0b2", shine:"#ffcc02", shadow:"#e65100", points:12, coins:2 },
  kiwi:        { label:"🥝", body:"#8bc34a", inner:"#dcedc8", shine:"#aed581", shadow:"#558b2f", points:18, coins:3 },
  lollipop:    { label:"🍭", body:"#f06292", inner:"#ce93d8", shine:"#f48fb1", shadow:"#ad1457", points:25, coins:5 },
  cake:        { label:"🎂", body:"#f8bbd0", inner:"#fff9c4", shine:"#fce4ec", shadow:"#c2185b", points:30, coins:6 },
  bomb:        { label:"💣", body:"#424242", inner:"#757575", shine:"#9e9e9e", shadow:"#212121", points:0,  coins:0 },
};

let _nextId = 0;

export function spawnFood(laneX: number, bombChance: number): FoodItem {
  const isBomb = Math.random() < bombChance;
  const foodTypes: FoodType[] = ["watermelon","strawberry","banana","donut","orange","kiwi","lollipop","cake"];
  const type: FoodType = isBomb ? "bomb" : foodTypes[Math.floor(Math.random() * foodTypes.length)]!;
  const vis = FOOD_VISUALS[type];
  return {
    id: _nextId++,
    type,
    laneX,
    z: 0.02,           // starts near horizon
    spin: Math.random() * Math.PI * 2,
    spinSpeed: (Math.random() - 0.5) * 3,
    sliced: false,
    sliceProgress: 0,
    sliceAngle: Math.random() * Math.PI,
    points: vis.points,
    coins: vis.coins,
    sx: 0, sy: 0, sr: 0,
  };
}

/** Project world coords → screen coords.
 *  Road goes from vanishing point (vpX, vpY) to bottom-center (bX, bY).
 *  laneX 0..1 maps to road width at that depth.
 */
export function projectFood(
  food: FoodItem,
  W: number, H: number,
  vpX: number, vpY: number,
): void {
  const z = food.z; // 0=far, 1=close
  // perspective scale
  const scale = 0.12 + z * 0.88;
  // road half-width at this depth
  const roadHalfW = (W * 0.42) * scale;
  const roadCenterX = vpX + (W * 0.5 - vpX) * z;
  const screenY = vpY + (H - vpY) * z;

  food.sx = roadCenterX + (food.laneX - 0.5) * roadHalfW * 2;
  food.sy = screenY;
  food.sr = (28 + 10 * z) * scale;
}

/** Draw a single food item with pseudo-3D shading */
export function drawFood(ctx: CanvasRenderingContext2D, food: FoodItem, time: number): void {
  const { sx, sy, sr, type, sliced, sliceProgress, sliceAngle, spin } = food;
  const vis = FOOD_VISUALS[type];
  if (sr < 2) return;

  ctx.save();
  ctx.translate(sx, sy);

  if (!sliced) {
    // shadow
    ctx.save();
    ctx.scale(1, 0.3);
    ctx.beginPath();
    ctx.arc(0, sr * 1.1, sr * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fill();
    ctx.restore();

    // spin wobble
    ctx.rotate(Math.sin(spin + time) * 0.12);

    // body
    const grad = ctx.createRadialGradient(-sr * 0.25, -sr * 0.25, sr * 0.05, 0, 0, sr);
    grad.addColorStop(0, vis.shine);
    grad.addColorStop(0.5, vis.body);
    grad.addColorStop(1, vis.shadow);
    ctx.beginPath();
    ctx.arc(0, 0, sr, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // inner ring
    ctx.beginPath();
    ctx.arc(0, 0, sr * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = vis.inner;
    ctx.globalAlpha = 0.35;
    ctx.fill();
    ctx.globalAlpha = 1;

    // specular highlight
    ctx.beginPath();
    ctx.arc(-sr * 0.28, -sr * 0.28, sr * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fill();

    // emoji label
    ctx.font = `${sr * 1.1}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(vis.label, 0, 0);

  } else {
    // two halves flying apart
    const sep = sliceProgress * sr * 1.2;
    const nx = Math.cos(sliceAngle + Math.PI / 2);
    const ny = Math.sin(sliceAngle + Math.PI / 2);
    const alpha = 1 - sliceProgress;
    ctx.globalAlpha = alpha;

    for (const sign of [-1, 1] as const) {
      ctx.save();
      ctx.translate(nx * sep * sign, ny * sep * sign + sliceProgress * sr * sign * 0.4);
      ctx.rotate(sliceAngle + sign * sliceProgress * 0.6);

      ctx.beginPath();
      ctx.arc(0, 0, sr * (1 - sliceProgress * 0.3), sliceAngle, sliceAngle + Math.PI);
      ctx.closePath();
      ctx.fillStyle = vis.body;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, sr * 0.55 * (1 - sliceProgress * 0.3), sliceAngle, sliceAngle + Math.PI);
      ctx.closePath();
      ctx.fillStyle = vis.inner;
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.restore();
    }
  }

  ctx.restore();
}
