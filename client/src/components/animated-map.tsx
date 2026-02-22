import { useEffect, useRef } from "react";

const NODES = [
  { x: 20, y: 30, label: "US-E" },
  { x: 15, y: 35, label: "US-W" },
  { x: 45, y: 25, label: "EU-W" },
  { x: 50, y: 22, label: "EU-E" },
  { x: 55, y: 30, label: "ME" },
  { x: 70, y: 28, label: "CN" },
  { x: 75, y: 35, label: "SEA" },
  { x: 80, y: 45, label: "AU" },
  { x: 60, y: 20, label: "RU" },
  { x: 35, y: 50, label: "BR" },
  { x: 48, y: 55, label: "ZA" },
  { x: 78, y: 25, label: "JP" },
  { x: 65, y: 35, label: "IN" },
  { x: 42, y: 28, label: "UK" },
  { x: 25, y: 45, label: "MX" },
];

const CONNECTIONS = [
  [0, 2], [0, 3], [1, 9], [2, 3], [2, 8], [3, 4],
  [4, 6], [5, 6], [5, 11], [6, 7], [8, 5], [9, 10],
  [11, 6], [12, 4], [12, 6], [13, 2], [13, 0], [14, 0], [14, 1],
];

export default function AnimatedMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const dpr = window.devicePixelRatio || 1;
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

    const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        life: Math.random() * 200,
        maxLife: 150 + Math.random() * 150,
      });
    }

    const pulseTrails: { from: number; to: number; progress: number; speed: number }[] = [];
    let lastPulse = 0;

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life > p.maxLife) {
          p.x = Math.random() * 100;
          p.y = Math.random() * 100;
          p.life = 0;
        }
        if (p.x < 0 || p.x > 100) p.vx *= -1;
        if (p.y < 0 || p.y > 100) p.vy *= -1;
        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.15;
        ctx.beginPath();
        ctx.arc((p.x / 100) * w, (p.y / 100) * h, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249, 115, 22, ${alpha})`;
        ctx.fill();
      });

      CONNECTIONS.forEach(([from, to]) => {
        const a = NODES[from];
        const b = NODES[to];
        const ax = (a.x / 100) * w, ay = (a.y / 100) * h;
        const bx = (b.x / 100) * w, by = (b.y / 100) * h;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = "rgba(249, 115, 22, 0.06)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      if (time - lastPulse > 800) {
        const conn = CONNECTIONS[Math.floor(Math.random() * CONNECTIONS.length)];
        pulseTrails.push({
          from: conn[0],
          to: conn[1],
          progress: 0,
          speed: 0.008 + Math.random() * 0.008,
        });
        lastPulse = time;
      }

      for (let i = pulseTrails.length - 1; i >= 0; i--) {
        const trail = pulseTrails[i];
        trail.progress += trail.speed;
        if (trail.progress > 1) {
          pulseTrails.splice(i, 1);
          continue;
        }
        const a = NODES[trail.from];
        const b = NODES[trail.to];
        const ax = (a.x / 100) * w, ay = (a.y / 100) * h;
        const bx = (b.x / 100) * w, by = (b.y / 100) * h;
        const px = ax + (bx - ax) * trail.progress;
        const py = ay + (by - ay) * trail.progress;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 8);
        grad.addColorStop(0, "rgba(249, 115, 22, 0.6)");
        grad.addColorStop(1, "rgba(249, 115, 22, 0)");
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      NODES.forEach((node) => {
        const nx = (node.x / 100) * w;
        const ny = (node.y / 100) * h;
        const pulse = 0.4 + Math.sin(time * 0.002 + node.x) * 0.3;

        const glow = ctx.createRadialGradient(nx, ny, 0, nx, ny, 12);
        glow.addColorStop(0, `rgba(239, 68, 68, ${pulse * 0.4})`);
        glow.addColorStop(1, "rgba(239, 68, 68, 0)");
        ctx.beginPath();
        ctx.arc(nx, ny, 12, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249, 115, 22, ${0.6 + pulse * 0.4})`;
        ctx.fill();
      });

      const scanY = ((time * 0.03) % (h + 40)) - 20;
      const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      scanGrad.addColorStop(0, "rgba(239, 68, 68, 0)");
      scanGrad.addColorStop(0.5, "rgba(239, 68, 68, 0.02)");
      scanGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 20, w, 40);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
      aria-hidden="true"
    />
  );
}
