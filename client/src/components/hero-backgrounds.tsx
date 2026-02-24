import { useEffect, useRef } from "react";

export function HeroBgStatic() {
  return (
    <div className="absolute inset-0 w-full h-full" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(249,115,22,0.08) 0%, transparent 50%),
                          radial-gradient(circle at 80% 30%, rgba(239,68,68,0.05) 0%, transparent 40%),
                          radial-gradient(circle at 60% 80%, rgba(249,115,22,0.04) 0%, transparent 30%)`,
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(rgba(249,115,22,0.12) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }} />
    </div>
  );
}

export function HeroBgGrid() {
  return (
    <div className="absolute inset-0 w-full h-full" aria-hidden="true">
      <div className="absolute inset-0 bg-zinc-950" />
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(249,115,22,0.06) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(249,115,22,0.06) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px)`,
        backgroundSize: '8px 8px',
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(ellipse at 30% 50%, rgba(249,115,22,0.1) 0%, transparent 60%)`,
      }} />
    </div>
  );
}

export function HeroBgMatrix() {
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
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const cols = 40;
    const drops = Array.from({ length: cols }, () => Math.random() * -50);
    const chars = "01アイウエオカキクケコSTBCS".split("");

    const draw = () => {
      ctx.fillStyle = "rgba(9, 9, 11, 0.08)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${Math.max(10, w / cols)}px monospace`;

      drops.forEach((y, i) => {
        const x = (i / cols) * w;
        const char = chars[Math.floor(Math.random() * chars.length)];
        const alpha = 0.15 + Math.random() * 0.15;
        ctx.fillStyle = `rgba(249, 115, 22, ${alpha})`;
        ctx.fillText(char, x, y * (h / 30));
        if (y * (h / 30) > h && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i] += 0.3;
      });
      animRef.current = requestAnimationFrame(draw);
    };

    ctx.fillStyle = "rgba(9, 9, 11, 1)";
    ctx.fillRect(0, 0, w, h);
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }} aria-hidden="true" />;
}

export function HeroBgHoneycomb() {
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
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const hexSize = 30;
    const hexH = hexSize * Math.sqrt(3);

    const drawHex = (cx: number, cy: number, alpha: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = cx + hexSize * Math.cos(angle);
        const y = cy + hexSize * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / (hexSize * 1.5)) + 2;
      const rows = Math.ceil(h / hexH) + 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cx = col * hexSize * 1.5;
          const cy = row * hexH + (col % 2 === 1 ? hexH / 2 : 0);
          const dist = Math.sqrt((cx - w * 0.3) ** 2 + (cy - h * 0.5) ** 2);
          const wave = Math.sin(time * 0.001 - dist * 0.008) * 0.5 + 0.5;
          const alpha = 0.03 + wave * 0.06;
          drawHex(cx, cy, alpha);
        }
      }

      const pulseX = w * 0.3;
      const pulseY = h * 0.5;
      const pulseR = 60 + Math.sin(time * 0.002) * 20;
      const glow = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, pulseR);
      glow.addColorStop(0, "rgba(249, 115, 22, 0.08)");
      glow.addColorStop(1, "rgba(249, 115, 22, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }} aria-hidden="true" />;
}

export function HeroBgRadar() {
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
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const blips = Array.from({ length: 12 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 0.2 + Math.random() * 0.7,
      alpha: 0,
    }));

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.7;
      const cy = h * 0.5;
      const maxR = Math.min(w, h) * 0.45;

      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * (i / 4), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(249, 115, 22, ${0.04 + i * 0.01})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
        ctx.strokeStyle = "rgba(249, 115, 22, 0.03)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      const sweepAngle = (time * 0.001) % (Math.PI * 2);
      {
        const sx = cx + Math.cos(sweepAngle) * maxR;
        const sy = cy + Math.sin(sweepAngle) * maxR;
        const trail = ctx.createLinearGradient(cx, cy, sx, sy);
        trail.addColorStop(0, "rgba(249, 115, 22, 0)");
        trail.addColorStop(0.7, "rgba(249, 115, 22, 0.03)");
        trail.addColorStop(1, "rgba(249, 115, 22, 0.12)");
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxR, sweepAngle - 0.5, sweepAngle);
        ctx.closePath();
        ctx.fillStyle = trail;
        ctx.fill();
      }

      const sweepLine = ctx.createLinearGradient(cx, cy, cx + Math.cos(sweepAngle) * maxR, cy + Math.sin(sweepAngle) * maxR);
      sweepLine.addColorStop(0, "rgba(249, 115, 22, 0.4)");
      sweepLine.addColorStop(1, "rgba(249, 115, 22, 0)");
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * maxR, cy + Math.sin(sweepAngle) * maxR);
      ctx.strokeStyle = sweepLine;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      blips.forEach((b) => {
        const angleDiff = ((sweepAngle - b.angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        if (angleDiff < 0.1) b.alpha = 1;
        b.alpha *= 0.995;
        if (b.alpha > 0.01) {
          const bx = cx + Math.cos(b.angle) * maxR * b.dist;
          const by = cy + Math.sin(b.angle) * maxR * b.dist;
          const g = ctx.createRadialGradient(bx, by, 0, bx, by, 6);
          g.addColorStop(0, `rgba(239, 68, 68, ${b.alpha * 0.8})`);
          g.addColorStop(1, `rgba(239, 68, 68, 0)`);
          ctx.beginPath();
          ctx.arc(bx, by, 6, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(bx, by, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(249, 115, 22, ${b.alpha})`;
          ctx.fill();
        }
      });

      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(249, 115, 22, 0.6)";
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }} aria-hidden="true" />;
}

export function HeroBgCircuit() {
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
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const spacing = 50;
    type TracePath = { points: { x: number; y: number }[]; progress: number; speed: number };
    const traces: TracePath[] = [];

    const generateTrace = (): TracePath => {
      const points: { x: number; y: number }[] = [];
      let x = Math.floor(Math.random() * (w / spacing)) * spacing;
      let y = Math.floor(Math.random() * (h / spacing)) * spacing;
      points.push({ x, y });
      const steps = 3 + Math.floor(Math.random() * 6);
      for (let i = 0; i < steps; i++) {
        const dir = Math.random() > 0.5;
        if (dir) x += (Math.random() > 0.5 ? 1 : -1) * spacing * (1 + Math.floor(Math.random() * 3));
        else y += (Math.random() > 0.5 ? 1 : -1) * spacing * (1 + Math.floor(Math.random() * 2));
        x = Math.max(0, Math.min(w, x));
        y = Math.max(0, Math.min(h, y));
        points.push({ x, y });
      }
      return { points, progress: 0, speed: 0.003 + Math.random() * 0.004 };
    };

    for (let i = 0; i < 8; i++) traces.push(generateTrace());

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);

      const gridCols = Math.ceil(w / spacing) + 1;
      const gridRows = Math.ceil(h / spacing) + 1;
      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          ctx.beginPath();
          ctx.arc(c * spacing, r * spacing, 1, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(249, 115, 22, 0.08)";
          ctx.fill();
        }
      }

      traces.forEach((trace) => {
        trace.progress += trace.speed;
        if (trace.progress > 1.2) {
          Object.assign(trace, generateTrace());
          return;
        }

        const totalLen = trace.points.reduce((sum, p, i) => {
          if (i === 0) return 0;
          const prev = trace.points[i - 1];
          return sum + Math.abs(p.x - prev.x) + Math.abs(p.y - prev.y);
        }, 0);

        ctx.beginPath();
        ctx.moveTo(trace.points[0].x, trace.points[0].y);
        let accumulated = 0;
        const drawLen = trace.progress * totalLen;

        for (let i = 1; i < trace.points.length; i++) {
          const prev = trace.points[i - 1];
          const cur = trace.points[i];
          const segLen = Math.abs(cur.x - prev.x) + Math.abs(cur.y - prev.y);
          if (accumulated + segLen <= drawLen) {
            ctx.lineTo(cur.x, cur.y);
            accumulated += segLen;
          } else {
            const remaining = drawLen - accumulated;
            const t = remaining / segLen;
            ctx.lineTo(prev.x + (cur.x - prev.x) * t, prev.y + (cur.y - prev.y) * t);
            break;
          }
        }
        ctx.strokeStyle = `rgba(249, 115, 22, ${0.15 * Math.min(1, (1.2 - trace.progress) * 3)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const headIdx = Math.min(Math.floor(trace.progress * trace.points.length), trace.points.length - 1);
        const hp = trace.points[headIdx];
        const glow = ctx.createRadialGradient(hp.x, hp.y, 0, hp.x, hp.y, 10);
        glow.addColorStop(0, `rgba(249, 115, 22, ${0.5 * Math.min(1, (1.2 - trace.progress) * 3)})`);
        glow.addColorStop(1, "rgba(249, 115, 22, 0)");
        ctx.beginPath();
        ctx.arc(hp.x, hp.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }} aria-hidden="true" />;
}

export function HeroBgPulse() {
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
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const rings: { cx: number; cy: number; radius: number; maxRadius: number; alpha: number }[] = [];
    let lastSpawn = 0;

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "rgba(9, 9, 11, 1)";
      ctx.fillRect(0, 0, w, h);

      if (time - lastSpawn > 2000) {
        rings.push({
          cx: w * (0.2 + Math.random() * 0.6),
          cy: h * (0.2 + Math.random() * 0.6),
          radius: 0,
          maxRadius: 80 + Math.random() * 120,
          alpha: 0.3,
        });
        lastSpawn = time;
      }

      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.radius += 0.5;
        r.alpha *= 0.995;
        if (r.alpha < 0.01) { rings.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.arc(r.cx, r.cy, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(249, 115, 22, ${r.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (r.radius < r.maxRadius * 0.3) {
          const g = ctx.createRadialGradient(r.cx, r.cy, 0, r.cx, r.cy, r.radius);
          g.addColorStop(0, `rgba(249, 115, 22, ${r.alpha * 0.15})`);
          g.addColorStop(1, "rgba(249, 115, 22, 0)");
          ctx.fillStyle = g;
          ctx.fill();
        }
      }

      const centerGlow = ctx.createRadialGradient(w * 0.3, h * 0.5, 0, w * 0.3, h * 0.5, 150);
      centerGlow.addColorStop(0, "rgba(249, 115, 22, 0.04)");
      centerGlow.addColorStop(1, "rgba(249, 115, 22, 0)");
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, w, h);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }} aria-hidden="true" />;
}

export function HeroBgWaveform() {
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
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);

      const layers = [
        { offset: 0, amplitude: 25, freq: 0.008, speed: 0.0008, color: "249, 115, 22", alpha: 0.12 },
        { offset: 15, amplitude: 20, freq: 0.012, speed: 0.001, color: "239, 68, 68", alpha: 0.08 },
        { offset: -10, amplitude: 30, freq: 0.006, speed: 0.0006, color: "249, 115, 22", alpha: 0.06 },
        { offset: 25, amplitude: 15, freq: 0.015, speed: 0.0012, color: "239, 68, 68", alpha: 0.05 },
      ];

      layers.forEach((layer) => {
        const cy = h * 0.5 + layer.offset;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        for (let x = 0; x <= w; x += 2) {
          const y = cy + Math.sin(x * layer.freq + time * layer.speed) * layer.amplitude
            + Math.sin(x * layer.freq * 2.3 + time * layer.speed * 1.7) * (layer.amplitude * 0.3);
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${layer.color}, ${layer.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = `rgba(${layer.color}, ${layer.alpha * 0.15})`;
        ctx.fill();
      });

      for (let x = 0; x < w; x += 3) {
        const barH = (Math.sin(x * 0.05 + time * 0.002) * 0.5 + 0.5) * 15;
        const alpha = 0.03 + (barH / 15) * 0.04;
        ctx.fillStyle = `rgba(249, 115, 22, ${alpha})`;
        ctx.fillRect(x, h - barH - 5, 1.5, barH);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }} aria-hidden="true" />;
}

function HeroBgImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="absolute inset-0 w-full h-full" aria-hidden="true">
      <div className="absolute inset-0 bg-zinc-950" />
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-zinc-950/40 to-zinc-950/70" />
    </div>
  );
}

export function HeroBgGlobalNetwork() {
  return <HeroBgImage src="/images/hero-bg/global-network.png" alt="Global network connectivity" />;
}
export function HeroBgDataCenter() {
  return <HeroBgImage src="/images/hero-bg/data-center.png" alt="Data center connectivity" />;
}
export function HeroBgRoutingMap() {
  return <HeroBgImage src="/images/hero-bg/routing-map.png" alt="Network routing topology" />;
}
export function HeroBgCommandCenter() {
  return <HeroBgImage src="/images/hero-bg/command-center.png" alt="Cyber defense command center" />;
}
export function HeroBgThreatLandscape() {
  return <HeroBgImage src="/images/hero-bg/threat-landscape.png" alt="Digital threat landscape" />;
}
export function HeroBgSecureBlueprint() {
  return <HeroBgImage src="/images/hero-bg/secure-blueprint.png" alt="Secure infrastructure blueprint" />;
}

export const HERO_BACKGROUNDS = [
  {
    id: "threat-map",
    name: "Threat Network Map",
    description: "Animated global threat network with nodes, pulse trails, and scan line. Current default.",
    tags: ["animated", "current", "default"],
    component: "AnimatedMap",
  },
  {
    id: "static-dots",
    name: "Static Dot Grid (Original)",
    description: "The original static background with dot grid pattern and subtle orange/red gradient glows. Clean and lightweight.",
    tags: ["static", "original", "lightweight"],
    component: "HeroBgStatic",
  },
  {
    id: "cyber-grid",
    name: "Cyber Grid",
    description: "Technical grid overlay with fine and coarse lines, subtle orange glow. Minimal and professional.",
    tags: ["static", "minimal", "professional"],
    component: "HeroBgGrid",
  },
  {
    id: "matrix-rain",
    name: "Matrix Rain",
    description: "Falling binary and katakana characters in orange. Classic cybersecurity aesthetic.",
    tags: ["animated", "classic", "cyber"],
    component: "HeroBgMatrix",
  },
  {
    id: "honeycomb",
    name: "Honeycomb Shield",
    description: "Animated hexagonal mesh with pulsing wave effect and center glow. Inspired by the STBCS logo.",
    tags: ["animated", "brand", "mesh"],
    component: "HeroBgHoneycomb",
  },
  {
    id: "radar-sweep",
    name: "Radar Sweep",
    description: "Rotating radar sweep with threat blips that light up as the sweep passes. Active surveillance feel.",
    tags: ["animated", "surveillance", "tactical"],
    component: "HeroBgRadar",
  },
  {
    id: "circuit-trace",
    name: "Circuit Trace",
    description: "Animated circuit board traces with glowing signals traveling along paths. Hardware security vibe.",
    tags: ["animated", "hardware", "technical"],
    component: "HeroBgCircuit",
  },
  {
    id: "pulse-rings",
    name: "Pulse Rings",
    description: "Expanding sonar-like pulse rings from random origins. Alert/detection theme.",
    tags: ["animated", "alert", "sonar"],
    component: "HeroBgPulse",
  },
  {
    id: "waveform",
    name: "Signal Waveform",
    description: "Layered sine wave signals with frequency bars at the bottom. Network traffic monitoring feel.",
    tags: ["animated", "signals", "monitoring"],
    component: "HeroBgWaveform",
  },
  {
    id: "global-network",
    name: "Global Network Map",
    description: "Worldwide cyber connectivity map with glowing nodes and data routes spanning continents. Strategic overview.",
    tags: ["image", "global", "network"],
    component: "HeroBgGlobalNetwork",
  },
  {
    id: "data-center",
    name: "Data Center Connectivity",
    description: "Server infrastructure with fiber optic connections and data flow visualization. Enterprise scale.",
    tags: ["image", "infrastructure", "enterprise"],
    component: "HeroBgDataCenter",
  },
  {
    id: "routing-map",
    name: "Routing Topology",
    description: "Network routing paths and autonomous systems with interconnected transit links. Technical depth.",
    tags: ["image", "routing", "topology"],
    component: "HeroBgRoutingMap",
  },
  {
    id: "command-center",
    name: "Cyber Command Center",
    description: "Security operations center with holographic threat displays and tactical interfaces. Defensive posture.",
    tags: ["image", "SOC", "tactical"],
    component: "HeroBgCommandCenter",
  },
  {
    id: "threat-landscape",
    name: "Digital Threat Landscape",
    description: "Abstract cyber terrain with threat indicators, vulnerability hotspots, and topographic data mesh.",
    tags: ["image", "terrain", "threats"],
    component: "HeroBgThreatLandscape",
  },
  {
    id: "secure-blueprint",
    name: "Security Blueprint",
    description: "Infrastructure schematic with firewall barriers, encrypted tunnels, and shield nodes. Architectural.",
    tags: ["image", "blueprint", "architecture"],
    component: "HeroBgSecureBlueprint",
  },
] as const;

export type HeroBgId = typeof HERO_BACKGROUNDS[number]["id"];

export function getHeroBackground(id: string) {
  switch (id) {
    case "static-dots": return <HeroBgStatic />;
    case "cyber-grid": return <HeroBgGrid />;
    case "matrix-rain": return <HeroBgMatrix />;
    case "honeycomb": return <HeroBgHoneycomb />;
    case "radar-sweep": return <HeroBgRadar />;
    case "circuit-trace": return <HeroBgCircuit />;
    case "pulse-rings": return <HeroBgPulse />;
    case "waveform": return <HeroBgWaveform />;
    case "global-network": return <HeroBgGlobalNetwork />;
    case "data-center": return <HeroBgDataCenter />;
    case "routing-map": return <HeroBgRoutingMap />;
    case "command-center": return <HeroBgCommandCenter />;
    case "threat-landscape": return <HeroBgThreatLandscape />;
    case "secure-blueprint": return <HeroBgSecureBlueprint />;
    default: return null;
  }
}
