import { useRef, useEffect, useCallback, useState } from "react";
import type { FoodItem, SliceParticle, KnifeConfig, BackgroundTheme } from "../types";
import {
  FOOD_CONFIGS,
  getPathPoints,
  getPathPosition,
  randomFood,
  ROUND_SECONDS,
} from "../lib/logic";

export interface GameProps {
  onScore: (score: number) => void;
  onTime: (secondsLeft: number) => void;
  onGameOver: () => void;
  knife: KnifeConfig;
  theme: BackgroundTheme;
}

// ─── drawing helpers ─────────────────────────────────────────────────────────

function drawConveyorPath(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  theme: BackgroundTheme
) {
  if (points.length < 2) return;
  ctx.save();
  ctx.lineWidth = 44;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = theme.stripes[0] ?? "#ffe0ef";
  ctx.beginPath();
  ctx.moveTo(points[0]!.x, points[0]!.y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i]!.x, points[i]!.y);
  }
  ctx.stroke();

  // inner stripe
  ctx.lineWidth = 28;
  ctx.strokeStyle = theme.stripes[1] ?? "#ffd6eb";
  ctx.beginPath();
  ctx.moveTo(points[0]!.x, points[0]!.y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i]!.x, points[i]!.y);
  }
  ctx.stroke();

  // dashed center
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.setLineDash([8, 10]);
  ctx.beginPath();
  ctx.moveTo(points[0]!.x, points[0]!.y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i]!.x, points[i]!.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawFood(ctx: CanvasRenderingContext2D, food: FoodItem, time: number) {
  const { x, y, radius, type, sliced, sliceProgress, sliceAngle } = food;
  const cfg = FOOD_CONFIGS[type];
  const wobble = Math.sin(time * food.wobbleSpeed + food.id) * 3;

  ctx.save();
  ctx.translate(x, y + wobble);

  if (!sliced) {
    // shadow
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.12)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // main circle
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = cfg.color;
    ctx.fill();

    // inner detail
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = cfg.accent;
    ctx.globalAlpha = 0.25;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();

    // border
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // emoji label
    ctx.font = `${radius * 0.9}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cfg.label, 0, 0);
  } else {
    // sliced animation — two halves separating
    const sep = sliceProgress * radius * 0.8;
    const nx = Math.cos(sliceAngle + Math.PI / 2);
    const ny = Math.sin(sliceAngle + Math.PI / 2);

    for (const sign of [-1, 1]) {
      ctx.save();
      ctx.translate(nx * sep * sign * 0.5, ny * sep * sign * 0.5);
      ctx.rotate(sliceAngle + (sign * sliceProgress * 0.4));
      ctx.globalAlpha = 1 - sliceProgress * 0.8;

      ctx.beginPath();
      ctx.arc(0, 0, radius * (1 - sliceProgress * 0.3), sliceAngle, sliceAngle + Math.PI);
      ctx.closePath();
      ctx.fillStyle = cfg.color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, radius * (1 - sliceProgress * 0.3) * 0.7, sliceAngle, sliceAngle + Math.PI);
      ctx.closePath();
      ctx.fillStyle = cfg.accent;
      ctx.globalAlpha = (1 - sliceProgress * 0.8) * 0.4;
      ctx.fill();
      ctx.globalAlpha = 1 - sliceProgress * 0.8;

      ctx.font = `${radius * 0.7 * (1 - sliceProgress * 0.3)}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(cfg.label, 0, 0);
      ctx.restore();
    }
  }
  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: SliceParticle[]) {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (p.type === "juice") {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawKnife(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  knife: KnifeConfig,
  trail: { x: number; y: number }[]
) {
  // Draw trail
  if (trail.length > 1) {
    ctx.save();
    for (let i = 1; i < trail.length; i++) {
      const alpha = (i / trail.length) * 0.6;
      const width = (i / trail.length) * 6;
      ctx.beginPath();
      ctx.moveTo(trail[i - 1]!.x, trail[i - 1]!.y);
      ctx.lineTo(trail[i]!.x, trail[i]!.y);
      ctx.strokeStyle = knife.trailColor.replace(/[\d.]+\)$/, `${alpha})`);
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.stroke();
    }
    ctx.restore();
  }

  // Draw knife
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Handle
  ctx.beginPath();
  ctx.roundRect(-8, 6, 16, 32, 4);
  ctx.fillStyle = knife.handleColor;
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Blade
  ctx.beginPath();
  ctx.moveTo(0, -40);
  ctx.lineTo(5, 6);
  ctx.lineTo(-5, 6);
  ctx.closePath();
  ctx.fillStyle = knife.bladeColor;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Shine on blade
  ctx.beginPath();
  ctx.moveTo(-1, -35);
  ctx.lineTo(2, -10);
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.restore();
}

function drawScorePopup(ctx: CanvasRenderingContext2D, popups: ScorePopup[]) {
  for (const p of popups) {
    const alpha = p.life / p.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "bold 22px Manrope, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ff6b8a";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.strokeText(`+${p.points}`, p.x, p.y);
    ctx.fillText(`+${p.points}`, p.x, p.y);
    ctx.restore();
  }
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  theme: BackgroundTheme,
  time: number
) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, W, H);

  // Floating candy decorations
  const candyEmojis = ["🍬", "🍭", "🍫", "🧁", "🍰", "⭐", "🌸", "✨"];
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.font = "24px serif";
  ctx.textAlign = "center";
  for (let i = 0; i < 12; i++) {
    const ex = ((i * 137.5) % W);
    const ey = ((i * 83.7) % H);
    const drift = Math.sin(time * 0.3 + i) * 6;
    ctx.fillText(candyEmojis[i % candyEmojis.length]!, ex, ey + drift);
  }
  ctx.restore();
}

interface ScorePopup {
  id: number;
  x: number;
  y: number;
  points: number;
  life: number;
  maxLife: number;
}

// ─── main component ───────────────────────────────────────────────────────────

export function Game({ onScore, onTime, onGameOver, knife, theme }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // game state refs (mutable, no re-render needed each frame)
  const stateRef = useRef({
    foods: [] as FoodItem[],
    particles: [] as SliceParticle[],
    popups: [] as ScorePopup[],
    score: 0,
    timeLeft: ROUND_SECONDS,
    nextFoodId: 0,
    nextParticleId: 0,
    nextPopupId: 0,
    spawnTimer: 0,
    clockTimer: 0,
    mouseX: 0,
    mouseY: 0,
    prevMouseX: 0,
    prevMouseY: 0,
    isSlicing: false,
    trail: [] as { x: number; y: number }[],
    time: 0,
    pathPoints: [] as { x: number; y: number }[],
    running: true,
    animId: 0,
    lastTime: 0,
    W: 0,
    H: 0,
  });

  const [_tick, setTick] = useState(0); // force re-render only for score updates

  const spawnFood = useCallback(() => {
    const s = stateRef.current;
    const food = randomFood(s.nextFoodId++);
    food.pathT = 0;
    const pos = getPathPosition(s.pathPoints, 0);
    food.x = pos.x;
    food.y = pos.y;
    s.foods.push(food);
  }, []);

  const spawnParticles = useCallback((food: FoodItem) => {
    const s = stateRef.current;
    const cfg = FOOD_CONFIGS[food.type];
    const count = 10 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      const isJuice = Math.random() > 0.4;
      s.particles.push({
        id: s.nextParticleId++,
        x: food.x,
        y: food.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        color: isJuice ? cfg.color : cfg.accent,
        radius: isJuice ? 3 + Math.random() * 4 : 5 + Math.random() * 8,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 0.6 + Math.random() * 0.4,
        type: isJuice ? "juice" : "chunk",
      });
    }
    s.popups.push({
      id: s.nextPopupId++,
      x: food.x,
      y: food.y - food.radius - 10,
      points: food.points,
      life: 1.0,
      maxLife: 1.0,
    });
  }, []);

  const trySlice = useCallback((mx: number, my: number, pmx: number, pmy: number) => {
    const s = stateRef.current;
    const dx = mx - pmx;
    const dy = my - pmy;
    const speed = Math.sqrt(dx * dx + dy * dy);
    if (speed < 5) return;

    for (const food of s.foods) {
      if (food.sliced) continue;
      const fdx = food.x - mx;
      const fdy = food.y - my;
      if (Math.sqrt(fdx * fdx + fdy * fdy) < food.radius) {
        food.sliced = true;
        food.sliceAngle = Math.atan2(dy, dx);
        s.score += food.points;
        onScore(s.score);
        spawnParticles(food);
      }
    }
  }, [onScore, spawnParticles]);

  // Main loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = stateRef.current;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      s.W = rect.width;
      s.H = rect.height;
      s.pathPoints = getPathPoints(s.W, s.H);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Spawn initial foods
    for (let i = 0; i < 4; i++) {
      const food = randomFood(s.nextFoodId++);
      food.pathT = i * 0.18;
      const pos = getPathPosition(s.pathPoints, food.pathT);
      food.x = pos.x;
      food.y = pos.y;
      s.foods.push(food);
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      s.prevMouseX = s.mouseX;
      s.prevMouseY = s.mouseY;
      s.mouseX = e.clientX - rect.left;
      s.mouseY = e.clientY - rect.top;
      if (s.isSlicing) {
        s.trail.push({ x: s.mouseX, y: s.mouseY });
        if (s.trail.length > 18) s.trail.shift();
        trySlice(s.mouseX, s.mouseY, s.prevMouseX, s.prevMouseY);
      }
    };
    const onMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      s.isSlicing = true;
      s.mouseX = e.clientX - rect.left;
      s.mouseY = e.clientY - rect.top;
      s.trail = [{ x: s.mouseX, y: s.mouseY }];
    };
    const onMouseUp = () => {
      s.isSlicing = false;
      s.trail = [];
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      if (!t) return;
      const rect = canvas.getBoundingClientRect();
      s.prevMouseX = s.mouseX;
      s.prevMouseY = s.mouseY;
      s.mouseX = t.clientX - rect.left;
      s.mouseY = t.clientY - rect.top;
      s.trail.push({ x: s.mouseX, y: s.mouseY });
      if (s.trail.length > 18) s.trail.shift();
      trySlice(s.mouseX, s.mouseY, s.prevMouseX, s.prevMouseY);
    };
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      if (!t) return;
      const rect = canvas.getBoundingClientRect();
      s.isSlicing = true;
      s.mouseX = t.clientX - rect.left;
      s.mouseY = t.clientY - rect.top;
      s.trail = [{ x: s.mouseX, y: s.mouseY }];
    };
    const onTouchEnd = () => {
      s.isSlicing = false;
      s.trail = [];
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);

    const loop = (ts: number) => {
      if (!s.running) return;
      const dt = Math.min((ts - s.lastTime) / 1000, 0.1);
      s.lastTime = ts;
      s.time += dt;

      // clock
      s.clockTimer += dt;
      if (s.clockTimer >= 1) {
        s.clockTimer -= 1;
        s.timeLeft = Math.max(0, s.timeLeft - 1);
        onTime(s.timeLeft);
        if (s.timeLeft <= 0) {
          s.running = false;
          onGameOver();
          return;
        }
      }

      // spawn food
      s.spawnTimer += dt;
      const spawnInterval = Math.max(0.8, 2.0 - s.score * 0.002);
      if (s.spawnTimer >= spawnInterval) {
        s.spawnTimer = 0;
        spawnFood();
      }

      // update foods
      for (const food of s.foods) {
        if (!food.sliced) {
          food.pathT += food.speed * dt;
          const pos = getPathPosition(s.pathPoints, food.pathT);
          food.x = pos.x;
          food.y = pos.y;
        } else {
          food.sliceProgress = Math.min(1, food.sliceProgress + dt * 2.5);
        }
      }
      // remove fully animated + off-path foods
      s.foods = s.foods.filter(f => {
        if (f.sliced) return f.sliceProgress < 1;
        return f.pathT < 1.05;
      });

      // update particles
      for (const p of s.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 200 * dt; // gravity
        p.life -= dt;
      }
      s.particles = s.particles.filter(p => p.life > 0);

      // update popups
      for (const p of s.popups) {
        p.y -= 40 * dt;
        p.life -= dt;
      }
      s.popups = s.popups.filter(p => p.life > 0);

      // ── render ──
      const { W, H } = s;
      if (W === 0 || H === 0) {
        s.animId = requestAnimationFrame(loop);
        return;
      }

      drawBackground(ctx, W, H, theme, s.time);
      drawConveyorPath(ctx, s.pathPoints, theme);
      drawParticles(ctx, s.particles);

      for (const food of s.foods) {
        drawFood(ctx, food, s.time);
      }

      drawScorePopup(ctx, s.popups);

      // knife angle from trail
      let knifeAngle = -Math.PI / 2;
      if (s.trail.length >= 2) {
        const a = s.trail[s.trail.length - 2]!;
        const b = s.trail[s.trail.length - 1]!;
        knifeAngle = Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2;
      }
      drawKnife(ctx, s.mouseX, s.mouseY, knifeAngle, knife, s.trail);

      s.animId = requestAnimationFrame(loop);
    };

    s.lastTime = performance.now();
    s.animId = requestAnimationFrame(loop);

    return () => {
      s.running = false;
      cancelAnimationFrame(s.animId);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [knife, theme, spawnFood, spawnParticles, trySlice, onTime, onGameOver]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block touch-none cursor-none"
      style={{ display: "block" }}
    />
  );
}
