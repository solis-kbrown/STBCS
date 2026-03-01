import { useEffect, useRef, useCallback } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: "red" | "cyan" | "amber";
  alpha: number;
  baseAlpha: number;
};

const COLORS = {
  red: { r: 239, g: 68, b: 68 },
  cyan: { r: 6, g: 182, b: 212 },
  amber: { r: 245, g: 158, b: 11 },
};

const MAX_PARTICLES = 80;
const CONNECTION_DIST = 120;
const MOUSE_RADIUS = 150;

export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const particlesRef = useRef<Particle[]>([]);
  const reducedMotionRef = useRef(false);

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const colorRoll = Math.random();
      const color: Particle["color"] = colorRoll < 0.4 ? "red" : colorRoll < 0.7 ? "cyan" : "amber";
      const baseAlpha = 0.3 + Math.random() * 0.5;
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 1.2 + Math.random() * 1.8,
        color,
        alpha: baseAlpha,
        baseAlpha,
      });
    }
    particlesRef.current = particles;
  }, []);

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
      if (particlesRef.current.length === 0) {
        initParticles(w, h);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };
    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    if (particlesRef.current.length === 0) {
      initParticles(w, h);
    }

    const draw = () => {
      if (reducedMotionRef.current) {
        ctx.clearRect(0, 0, w, h);
        const particles = particlesRef.current;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const c = COLORS[p.color];
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${p.baseAlpha * 0.6})`;
          ctx.fill();
        }
        return;
      }

      ctx.clearRect(0, 0, w, h);
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force * 0.15;
            p.vy += Math.sin(angle) * force * 0.15;
          }
        }

        p.vx *= 0.99;
        p.vy *= 0.99;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) { p.x = 0; p.vx *= -0.5; }
        if (p.x > w) { p.x = w; p.vx *= -0.5; }
        if (p.y < 0) { p.y = 0; p.vy *= -0.5; }
        if (p.y > h) { p.y = h; p.vy *= -0.5; }

        p.alpha = p.baseAlpha + Math.sin(Date.now() * 0.002 + i) * 0.1;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(148, 163, 184, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const c = COLORS[p.color];

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        glow.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${p.alpha * 0.3})`);
        glow.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${p.alpha})`;
        ctx.fill();
      }

      if (mouse.active) {
        const cursorGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_RADIUS * 0.6);
        cursorGlow.addColorStop(0, "rgba(6, 182, 212, 0.03)");
        cursorGlow.addColorStop(1, "rgba(6, 182, 212, 0)");
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = cursorGlow;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      mq.removeEventListener("change", handler);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.85 }}
      aria-hidden="true"
      data-testid="hero-particles-canvas"
    />
  );
}
