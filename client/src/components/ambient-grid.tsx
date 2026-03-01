import { useEffect, useRef } from "react";

const GRID_SPACING = 40;
const PULSE_COUNT = 6;
const PULSE_SPEED = 0.6;

type Pulse = {
  x: number;
  y: number;
  horizontal: boolean;
  progress: number;
  speed: number;
  length: number;
};

export default function AmbientGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => { reducedMotionRef.current = e.matches; };
    mq.addEventListener("change", handler);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const pulses: Pulse[] = [];
    const spawnPulse = () => {
      const horizontal = Math.random() > 0.5;
      const gridLines = horizontal
        ? Math.floor(h / GRID_SPACING)
        : Math.floor(w / GRID_SPACING);
      const lineIdx = Math.floor(Math.random() * gridLines);
      pulses.push({
        x: horizontal ? -80 : lineIdx * GRID_SPACING,
        y: horizontal ? lineIdx * GRID_SPACING : -80,
        horizontal,
        progress: 0,
        speed: PULSE_SPEED + Math.random() * 0.4,
        length: 60 + Math.random() * 80,
      });
    };

    for (let i = 0; i < PULSE_COUNT; i++) {
      spawnPulse();
      pulses[i].progress = Math.random() * (horizontal(pulses[i]) ? w + 200 : h + 200);
    }

    function horizontal(p: Pulse) { return p.horizontal; }

    let lastSpawn = 0;

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);

      const cols = Math.ceil(w / GRID_SPACING) + 1;
      const rows = Math.ceil(h / GRID_SPACING) + 1;

      for (let i = 0; i < cols; i++) {
        const x = i * GRID_SPACING;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.strokeStyle = "rgba(6, 182, 212, 0.04)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      for (let j = 0; j < rows; j++) {
        const y = j * GRID_SPACING;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.strokeStyle = "rgba(6, 182, 212, 0.04)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          ctx.beginPath();
          ctx.arc(i * GRID_SPACING, j * GRID_SPACING, 1, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(6, 182, 212, 0.08)";
          ctx.fill();
        }
      }

      if (reducedMotionRef.current) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      if (time - lastSpawn > 1200 && pulses.length < PULSE_COUNT * 2) {
        spawnPulse();
        lastSpawn = time;
      }

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += p.speed;

        const maxDist = p.horizontal ? w + p.length + 100 : h + p.length + 100;
        if (p.progress > maxDist) {
          pulses.splice(i, 1);
          continue;
        }

        if (p.horizontal) {
          const headX = p.progress - p.length;
          const tailX = p.progress;
          const y = p.y;
          const grad = ctx.createLinearGradient(
            Math.max(0, headX), y,
            Math.min(w, tailX), y
          );
          grad.addColorStop(0, "rgba(6, 182, 212, 0)");
          grad.addColorStop(0.3, "rgba(6, 182, 212, 0.25)");
          grad.addColorStop(0.7, "rgba(6, 182, 212, 0.25)");
          grad.addColorStop(1, "rgba(6, 182, 212, 0)");
          ctx.beginPath();
          ctx.moveTo(Math.max(0, headX), y);
          ctx.lineTo(Math.min(w, tailX), y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          const glowX = (headX + tailX) / 2;
          const glow = ctx.createRadialGradient(glowX, y, 0, glowX, y, 20);
          glow.addColorStop(0, "rgba(6, 182, 212, 0.06)");
          glow.addColorStop(1, "rgba(6, 182, 212, 0)");
          ctx.beginPath();
          ctx.arc(glowX, y, 20, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        } else {
          const headY = p.progress - p.length;
          const tailY = p.progress;
          const x = p.x;
          const grad = ctx.createLinearGradient(
            x, Math.max(0, headY),
            x, Math.min(h, tailY)
          );
          grad.addColorStop(0, "rgba(6, 182, 212, 0)");
          grad.addColorStop(0.3, "rgba(6, 182, 212, 0.25)");
          grad.addColorStop(0.7, "rgba(6, 182, 212, 0.25)");
          grad.addColorStop(1, "rgba(6, 182, 212, 0)");
          ctx.beginPath();
          ctx.moveTo(x, Math.max(0, headY));
          ctx.lineTo(x, Math.min(h, tailY));
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          const glowY = (headY + tailY) / 2;
          const glow = ctx.createRadialGradient(x, glowY, 0, x, glowY, 20);
          glow.addColorStop(0, "rgba(6, 182, 212, 0.06)");
          glow.addColorStop(1, "rgba(6, 182, 212, 0)");
          ctx.beginPath();
          ctx.arc(x, glowY, 20, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      mq.removeEventListener("change", handler);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
      aria-hidden="true"
      data-testid="ambient-grid-canvas"
    />
  );
}
