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
export function HeroBgFirewallDefense() {
  return <HeroBgImage src="/images/hero-bg/firewall-defense.png" alt="Firewall defense shields" />;
}
export function HeroBgSatelliteNetwork() {
  return <HeroBgImage src="/images/hero-bg/satellite-network.png" alt="Satellite surveillance network" />;
}
export function HeroBgBlockchainGrid() {
  return <HeroBgImage src="/images/hero-bg/blockchain-grid.png" alt="Blockchain distributed ledger" />;
}
export function HeroBgNeuralDefense() {
  return <HeroBgImage src="/images/hero-bg/neural-defense.png" alt="AI neural defense network" />;
}
export function HeroBgSubmarineCables() {
  return <HeroBgImage src="/images/hero-bg/submarine-cables.png" alt="Submarine fiber optic cables" />;
}
export function HeroBgZeroTrust() {
  return <HeroBgImage src="/images/hero-bg/zero-trust.png" alt="Zero trust security architecture" />;
}
export function HeroBgCloudSecurity() {
  return <HeroBgImage src="/images/hero-bg/cloud-security.png" alt="Cloud infrastructure security" />;
}
export function HeroBgEndpointGrid() {
  return <HeroBgImage src="/images/hero-bg/endpoint-grid.png" alt="Endpoint detection response grid" />;
}
export function HeroBgSiemFlow() {
  return <HeroBgImage src="/images/hero-bg/siem-flow.png" alt="SIEM event correlation flow" />;
}
export function HeroBgDarkwebIntel() {
  return <HeroBgImage src="/images/hero-bg/darkweb-intel.png" alt="Dark web threat intelligence" />;
}
export function HeroBgThreatHunting() {
  return <HeroBgImage src="/images/hero-bg/threat-hunting.png" alt="Threat hunting visualization" />;
}
export function HeroBgIncidentResponse() {
  return <HeroBgImage src="/images/hero-bg/incident-response.png" alt="Incident response war room" />;
}
export function HeroBgQuantumCrypto() {
  return <HeroBgImage src="/images/hero-bg/quantum-crypto.png" alt="Quantum encryption lattice" />;
}
export function HeroBgIcsScada() {
  return <HeroBgImage src="/images/hero-bg/ics-scada.png" alt="ICS SCADA infrastructure" />;
}
export function HeroBgPentestSurface() {
  return <HeroBgImage src="/images/hero-bg/pentest-surface.png" alt="Penetration testing attack surface" />;
}
export function HeroBgDnsSinkhole() {
  return <HeroBgImage src="/images/hero-bg/dns-sinkhole.png" alt="DNS sinkhole traffic analysis" />;
}
export function HeroBgVulnHeatmap() {
  return <HeroBgImage src="/images/hero-bg/vuln-heatmap.png" alt="Vulnerability assessment heat map" />;
}
export function HeroBgKillChain() {
  return <HeroBgImage src="/images/hero-bg/kill-chain.png" alt="Cyber kill chain" />;
}
export function HeroBgHoneypotNet() {
  return <HeroBgImage src="/images/hero-bg/honeypot-net.png" alt="Honeypot decoy network" />;
}
export function HeroBgIntelFusion() {
  return <HeroBgImage src="/images/hero-bg/intel-fusion.png" alt="Threat intelligence fusion center" />;
}
export function HeroBgCyberBattlefield() {
  return <HeroBgImage src="/images/hero-bg/cyber-battlefield.png" alt="Cyber battlefield" />;
}
export function HeroBgSupplyChain() {
  return <HeroBgImage src="/images/hero-bg/supply-chain.png" alt="Supply chain security" />;
}
export function HeroBgSocPanorama() {
  return <HeroBgImage src="/images/hero-bg/soc-panorama.png" alt="SOC analyst workstation" />;
}
export function HeroBgMalwareSandbox() {
  return <HeroBgImage src="/images/hero-bg/malware-sandbox.png" alt="Malware analysis sandbox" />;
}
export function HeroBgIdentityMesh() {
  return <HeroBgImage src="/images/hero-bg/identity-mesh.png" alt="Digital identity mesh" />;
}
export function HeroBgRansomwareContain() {
  return <HeroBgImage src="/images/hero-bg/ransomware-contain.png" alt="Ransomware containment" />;
}
export function HeroBg5gSecurity() {
  return <HeroBgImage src="/images/hero-bg/5g-security.png" alt="5G network security" />;
}
export function HeroBgRiskMatrix() {
  return <HeroBgImage src="/images/hero-bg/risk-matrix.png" alt="Cyber risk matrix" />;
}
export function HeroBgForensicsTrail() {
  return <HeroBgImage src="/images/hero-bg/forensics-trail.png" alt="Digital forensics investigation" />;
}
export function HeroBgSoarAutomation() {
  return <HeroBgImage src="/images/hero-bg/soar-automation.png" alt="SOAR automation" />;
}

const WORLD_MAP_CONTINENTS = [
  { name: "North America", points: [[5,18],[8,15],[12,13],[15,11],[20,10],[25,12],[28,15],[30,18],[28,22],[30,25],[32,28],[30,32],[28,35],[25,38],[22,42],[18,44],[15,42],[12,38],[10,35],[8,30],[6,25],[5,22]] },
  { name: "South America", points: [[22,48],[24,46],[27,44],[30,46],[32,50],[34,54],[35,58],[36,62],[35,66],[33,70],[30,74],[28,76],[25,75],[23,72],[21,68],[20,64],[19,60],[20,56],[21,52]] },
  { name: "Europe", points: [[42,12],[44,10],[47,9],[50,10],[52,12],[54,14],[52,16],[50,18],[48,20],[46,22],[44,24],[42,22],[40,20],[39,18],[40,15]] },
  { name: "Africa", points: [[40,28],[42,26],[45,24],[48,25],[50,28],[52,30],[54,34],[55,38],[54,42],[53,46],[52,50],[50,54],[48,56],[45,58],[42,56],[40,52],[38,48],[37,44],[36,40],[37,36],[38,32]] },
  { name: "Asia", points: [[52,8],[56,6],[60,5],[65,6],[70,8],[75,10],[80,12],[82,15],[84,18],[85,22],[83,25],[80,28],[78,30],[75,32],[72,34],[68,35],[65,32],[62,30],[58,28],[55,25],[52,22],[50,18],[51,14]] },
  { name: "Middle East", points: [[50,22],[52,20],[55,22],[58,24],[56,28],[53,30],[50,28],[48,26]] },
  { name: "India", points: [[62,28],[65,26],[68,28],[70,32],[68,36],[65,40],[62,38],[60,34],[61,30]] },
  { name: "Southeast Asia", points: [[75,28],[78,26],[82,28],[85,30],[84,34],[80,36],[76,34],[74,32]] },
  { name: "Australia", points: [[78,48],[82,46],[86,48],[90,50],[92,52],[90,56],[86,58],[82,58],[78,56],[76,52]] },
  { name: "Japan", points: [[82,14],[84,12],[86,14],[85,18],[83,20],[81,18]] },
  { name: "UK/Ireland", points: [[40,12],[42,10],[44,12],[43,15],[41,16],[39,14]] },
  { name: "Greenland", points: [[28,4],[32,3],[36,4],[38,7],[36,10],[32,11],[28,9],[27,6]] },
];

function drawWorldMap(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number = 0.06, fillAlpha: number = 0.02) {
  WORLD_MAP_CONTINENTS.forEach((continent) => {
    const pts = continent.points;
    if (pts.length < 3) return;
    ctx.beginPath();
    ctx.moveTo((pts[0][0] / 100) * w, (pts[0][1] / 100) * h);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo((pts[i][0] / 100) * w, (pts[i][1] / 100) * h);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(249,115,22,${fillAlpha})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(249,115,22,${alpha})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  });
}

export function HeroBgGlobePackets() {
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
    const cities = [
      {x:18,y:28},{x:14,y:38},{x:22,y:42},{x:30,y:52},{x:35,y:48},
      {x:42,y:24},{x:44,y:28},{x:48,y:20},{x:50,y:26},{x:52,y:32},
      {x:55,y:22},{x:58,y:18},{x:60,y:28},{x:65,y:34},{x:68,y:26},
      {x:72,y:30},{x:75,y:38},{x:78,y:24},{x:80,y:44},{x:82,y:28},
      {x:38,y:56},{x:46,y:58},{x:25,y:34},{x:33,y:30},{x:62,y:40},
    ];
    const links: number[][] = [];
    cities.forEach((a, i) => {
      cities.forEach((b, j) => {
        if (j <= i) return;
        const d = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
        if (d < 18) links.push([i, j]);
      });
    });
    type Packet = { from: number; to: number; t: number; speed: number; color: string };
    const packets: Packet[] = [];
    let lastPacket = 0;
    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(9,9,11,0.3)";
      ctx.fillRect(0, 0, w, h);
      drawWorldMap(ctx, w, h, 0.08, 0.03);
      const latAlpha = 0.025 + Math.sin(time * 0.0005) * 0.01;
      for (let y = 0; y < h; y += h / 12) {
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(w, y);
        ctx.strokeStyle = `rgba(249,115,22,${latAlpha})`;
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }
      for (let x = 0; x < w; x += w / 18) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x, h);
        ctx.strokeStyle = `rgba(249,115,22,${latAlpha * 0.8})`;
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }
      links.forEach(([i, j]) => {
        const a = cities[i], b = cities[j];
        const ax = (a.x / 100) * w, ay = (a.y / 100) * h;
        const bx = (b.x / 100) * w, by = (b.y / 100) * h;
        const mx = (ax + bx) / 2, my = Math.min(ay, by) - 15 - Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2) * 0.1;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(mx, my, bx, by);
        ctx.strokeStyle = "rgba(249,115,22,0.06)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
      if (time - lastPacket > 400 && links.length > 0) {
        const link = links[Math.floor(Math.random() * links.length)];
        const reverse = Math.random() > 0.5;
        packets.push({
          from: reverse ? link[1] : link[0],
          to: reverse ? link[0] : link[1],
          t: 0,
          speed: 0.006 + Math.random() * 0.008,
          color: Math.random() > 0.3 ? "249,115,22" : "239,68,68",
        });
        lastPacket = time;
      }
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += p.speed;
        if (p.t > 1) { packets.splice(i, 1); continue; }
        const a = cities[p.from], b = cities[p.to];
        const ax = (a.x / 100) * w, ay = (a.y / 100) * h;
        const bx = (b.x / 100) * w, by = (b.y / 100) * h;
        const mx = (ax + bx) / 2, my = Math.min(ay, by) - 15 - Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2) * 0.1;
        const t = p.t;
        const px = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * mx + t * t * bx;
        const py = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * my + t * t * by;
        const g = ctx.createRadialGradient(px, py, 0, px, py, 6);
        g.addColorStop(0, `rgba(${p.color},0.7)`);
        g.addColorStop(1, `rgba(${p.color},0)`);
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},0.9)`;
        ctx.fill();
      }
      cities.forEach((c, idx) => {
        const nx = (c.x / 100) * w, ny = (c.y / 100) * h;
        const pulse = 0.5 + Math.sin(time * 0.003 + idx * 0.7) * 0.3;
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 10);
        g.addColorStop(0, `rgba(249,115,22,${pulse * 0.5})`);
        g.addColorStop(1, "rgba(249,115,22,0)");
        ctx.beginPath();
        ctx.arc(nx, ny, 10, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(nx, ny, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249,115,22,${0.5 + pulse * 0.5})`;
        ctx.fill();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }} aria-hidden="true" />;
}

export function HeroBgDataFlow() {
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
    const hubs = [
      {x:15,y:30,r:40,label:"NA"},{x:42,y:25,r:35,label:"EU"},{x:60,y:20,r:30,label:"RU"},
      {x:70,y:32,r:35,label:"APAC"},{x:35,y:55,r:25,label:"SA"},{x:50,y:50,r:25,label:"AF"},
    ];
    type Stream = { fromHub: number; toHub: number; particles: { t: number; speed: number; size: number }[] };
    const streams: Stream[] = [];
    const hubPairs = [[0,1],[0,4],[1,2],[1,5],[2,3],[3,5],[0,2],[1,3],[4,5],[0,3]];
    hubPairs.forEach(([f, t]) => {
      const count = 3 + Math.floor(Math.random() * 4);
      const parts = Array.from({length: count}, () => ({
        t: Math.random(), speed: 0.001 + Math.random() * 0.003, size: 1 + Math.random() * 2,
      }));
      streams.push({ fromHub: f, toHub: t, particles: parts });
    });
    const draw = (time: number) => {
      ctx.fillStyle = "rgba(9,9,11,0.15)";
      ctx.fillRect(0, 0, w, h);
      drawWorldMap(ctx, w, h, 0.07, 0.025);
      hubs.forEach((hub, idx) => {
        const hx = (hub.x / 100) * w, hy = (hub.y / 100) * h;
        const r = hub.r * (w / 1000);
        const pulse = 0.5 + Math.sin(time * 0.002 + idx) * 0.3;
        ctx.beginPath();
        ctx.arc(hx, hy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(249,115,22,${0.05 + pulse * 0.05})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(hx, hy, r * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(249,115,22,${0.03 + pulse * 0.03})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        const inner = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.3);
        inner.addColorStop(0, `rgba(249,115,22,${0.08 * pulse})`);
        inner.addColorStop(1, "rgba(249,115,22,0)");
        ctx.fillStyle = inner;
        ctx.beginPath();
        ctx.arc(hx, hy, r * 0.3, 0, Math.PI * 2);
        ctx.fill();
      });
      streams.forEach((s) => {
        const a = hubs[s.fromHub], b = hubs[s.toHub];
        const ax = (a.x / 100) * w, ay = (a.y / 100) * h;
        const bx = (b.x / 100) * w, by = (b.y / 100) * h;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = "rgba(249,115,22,0.03)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
        s.particles.forEach((p) => {
          p.t += p.speed;
          if (p.t > 1) p.t -= 1;
          const px = ax + (bx - ax) * p.t;
          const py = ay + (by - ay) * p.t;
          const g = ctx.createRadialGradient(px, py, 0, px, py, p.size * 3);
          g.addColorStop(0, `rgba(249,115,22,0.6)`);
          g.addColorStop(1, "rgba(249,115,22,0)");
          ctx.beginPath();
          ctx.arc(px, py, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(249,115,22,0.8)";
          ctx.fill();
        });
      });
      const scanX = ((time * 0.02) % (w + 60)) - 30;
      const scanGrad = ctx.createLinearGradient(scanX - 30, 0, scanX + 30, 0);
      scanGrad.addColorStop(0, "rgba(249,115,22,0)");
      scanGrad.addColorStop(0.5, "rgba(249,115,22,0.015)");
      scanGrad.addColorStop(1, "rgba(249,115,22,0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(scanX - 30, 0, 60, h);
      animRef.current = requestAnimationFrame(draw);
    };
    ctx.fillStyle = "rgba(9,9,11,1)";
    ctx.fillRect(0, 0, w, h);
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }} aria-hidden="true" />;
}

export function HeroBgCyberMesh() {
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
    type Node = { x: number; y: number; vx: number; vy: number; size: number; type: "router"|"server"|"endpoint" };
    const nodes: Node[] = [];
    const types: Node["type"][] = ["router", "server", "endpoint"];
    for (let i = 0; i < 50; i++) {
      nodes.push({
        x: Math.random() * 100, y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.015, vy: (Math.random() - 0.5) * 0.015,
        size: 1.5 + Math.random() * 2.5, type: types[Math.floor(Math.random() * 3)],
      });
    }
    type Ping = { from: number; to: number; t: number; speed: number };
    const pings: Ping[] = [];
    let lastPing = 0;
    const draw = (time: number) => {
      ctx.fillStyle = "rgba(9,9,11,0.08)";
      ctx.fillRect(0, 0, w, h);
      drawWorldMap(ctx, w, h, 0.05, 0.015);
      nodes.forEach((n) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 2 || n.x > 98) n.vx *= -1;
        if (n.y < 2 || n.y > 98) n.vy *= -1;
      });
      const connectionDist = 20;
      const edges: [number, number][] = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.sqrt((nodes[i].x - nodes[j].x) ** 2 + (nodes[i].y - nodes[j].y) ** 2);
          if (d < connectionDist) {
            edges.push([i, j]);
            const ax = (nodes[i].x / 100) * w, ay = (nodes[i].y / 100) * h;
            const bx = (nodes[j].x / 100) * w, by = (nodes[j].y / 100) * h;
            const alpha = 0.03 + (1 - d / connectionDist) * 0.06;
            ctx.beginPath();
            ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
            ctx.strokeStyle = `rgba(249,115,22,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      if (time - lastPing > 300 && edges.length > 0) {
        const e = edges[Math.floor(Math.random() * edges.length)];
        pings.push({ from: e[0], to: e[1], t: 0, speed: 0.01 + Math.random() * 0.015 });
        lastPing = time;
      }
      for (let i = pings.length - 1; i >= 0; i--) {
        const p = pings[i];
        p.t += p.speed;
        if (p.t > 1) { pings.splice(i, 1); continue; }
        const a = nodes[p.from], b = nodes[p.to];
        if (!a || !b) { pings.splice(i, 1); continue; }
        const px = ((a.x + (b.x - a.x) * p.t) / 100) * w;
        const py = ((a.y + (b.y - a.y) * p.t) / 100) * h;
        const g = ctx.createRadialGradient(px, py, 0, px, py, 5);
        g.addColorStop(0, "rgba(239,68,68,0.8)");
        g.addColorStop(1, "rgba(239,68,68,0)");
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      nodes.forEach((n, idx) => {
        const nx = (n.x / 100) * w, ny = (n.y / 100) * h;
        const pulse = 0.5 + Math.sin(time * 0.003 + idx) * 0.3;
        if (n.type === "router") {
          ctx.save();
          ctx.translate(nx, ny);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = `rgba(249,115,22,${0.4 + pulse * 0.4})`;
          ctx.fillRect(-n.size, -n.size, n.size * 2, n.size * 2);
          ctx.restore();
        } else if (n.type === "server") {
          ctx.fillStyle = `rgba(249,115,22,${0.4 + pulse * 0.4})`;
          ctx.fillRect(nx - n.size, ny - n.size, n.size * 2, n.size * 2);
        } else {
          ctx.beginPath();
          ctx.arc(nx, ny, n.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(249,115,22,${0.4 + pulse * 0.4})`;
          ctx.fill();
        }
      });
      animRef.current = requestAnimationFrame(draw);
    };
    ctx.fillStyle = "rgba(9,9,11,1)";
    ctx.fillRect(0, 0, w, h);
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }} aria-hidden="true" />;
}

export function HeroBgThreatStreams() {
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
    const regions = [
      {x:18,y:32,name:"Americas",nodes:[{x:15,y:28},{x:20,y:35},{x:22,y:40},{x:17,y:44},{x:25,y:30}]},
      {x:45,y:25,name:"Europe",nodes:[{x:42,y:22},{x:46,y:26},{x:44,y:30},{x:48,y:24},{x:50,y:28}]},
      {x:58,y:20,name:"Russia",nodes:[{x:55,y:18},{x:60,y:20},{x:63,y:22},{x:56,y:24}]},
      {x:72,y:30,name:"Asia",nodes:[{x:68,y:26},{x:72,y:32},{x:76,y:28},{x:78,y:36},{x:80,y:24}]},
      {x:48,y:52,name:"Africa",nodes:[{x:46,y:48},{x:50,y:54},{x:48,y:58},{x:52,y:50}]},
      {x:82,y:45,name:"Oceania",nodes:[{x:80,y:42},{x:84,y:46},{x:82,y:50}]},
    ];
    type ThreatArc = { fromR: number; toR: number; fromN: number; toN: number; t: number; speed: number; threat: boolean };
    const arcs: ThreatArc[] = [];
    let lastArc = 0;
    const draw = (time: number) => {
      ctx.fillStyle = "rgba(9,9,11,0.12)";
      ctx.fillRect(0, 0, w, h);
      drawWorldMap(ctx, w, h, 0.08, 0.03);
      regions.forEach((r, ri) => {
        r.nodes.forEach((n, ni) => {
          const nx = (n.x / 100) * w, ny = (n.y / 100) * h;
          r.nodes.forEach((m, mi) => {
            if (mi <= ni) return;
            const mx = (m.x / 100) * w, my = (m.y / 100) * h;
            ctx.beginPath();
            ctx.moveTo(nx, ny); ctx.lineTo(mx, my);
            ctx.strokeStyle = "rgba(249,115,22,0.04)";
            ctx.lineWidth = 0.3;
            ctx.stroke();
          });
          const pulse = 0.4 + Math.sin(time * 0.002 + ri + ni * 0.5) * 0.3;
          ctx.beginPath();
          ctx.arc(nx, ny, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(249,115,22,${0.3 + pulse * 0.5})`;
          ctx.fill();
        });
      });
      if (time - lastArc > 600) {
        const fromR = Math.floor(Math.random() * regions.length);
        let toR = Math.floor(Math.random() * regions.length);
        while (toR === fromR) toR = Math.floor(Math.random() * regions.length);
        arcs.push({
          fromR, toR,
          fromN: Math.floor(Math.random() * regions[fromR].nodes.length),
          toN: Math.floor(Math.random() * regions[toR].nodes.length),
          t: 0, speed: 0.004 + Math.random() * 0.006,
          threat: Math.random() > 0.6,
        });
        lastArc = time;
      }
      for (let i = arcs.length - 1; i >= 0; i--) {
        const arc = arcs[i];
        arc.t += arc.speed;
        if (arc.t > 1) { arcs.splice(i, 1); continue; }
        const fn = regions[arc.fromR].nodes[arc.fromN];
        const tn = regions[arc.toR].nodes[arc.toN];
        const ax = (fn.x / 100) * w, ay = (fn.y / 100) * h;
        const bx = (tn.x / 100) * w, by = (tn.y / 100) * h;
        const mx = (ax + bx) / 2, my = Math.min(ay, by) - 20 - Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2) * 0.15;
        const tailLen = 0.15;
        const headT = arc.t;
        const tailT = Math.max(0, arc.t - tailLen);
        ctx.beginPath();
        for (let s = 0; s <= 20; s++) {
          const t = tailT + (headT - tailT) * (s / 20);
          const px = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * mx + t * t * bx;
          const py = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * my + t * t * by;
          s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        const col = arc.threat ? "239,68,68" : "249,115,22";
        ctx.strokeStyle = `rgba(${col},0.4)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        const hx = (1 - headT) * (1 - headT) * ax + 2 * (1 - headT) * headT * mx + headT * headT * bx;
        const hy = (1 - headT) * (1 - headT) * ay + 2 * (1 - headT) * headT * my + headT * headT * by;
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 8);
        g.addColorStop(0, `rgba(${col},0.8)`);
        g.addColorStop(1, `rgba(${col},0)`);
        ctx.beginPath();
        ctx.arc(hx, hy, 8, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      animRef.current = requestAnimationFrame(draw);
    };
    ctx.fillStyle = "rgba(9,9,11,1)";
    ctx.fillRect(0, 0, w, h);
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }} aria-hidden="true" />;
}

export function HeroBgNetTopology() {
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
    const core = { x: 50, y: 45 };
    const rings = [
      [{x:40,y:30},{x:60,y:30},{x:65,y:50},{x:55,y:65},{x:38,y:60},{x:32,y:42}],
      [{x:20,y:20},{x:50,y:12},{x:80,y:22},{x:85,y:50},{x:78,y:75},{x:50,y:82},{x:22,y:72},{x:12,y:48}],
      [{x:8,y:15},{x:35,y:5},{x:65,y:8},{x:92,y:18},{x:95,y:55},{x:88,y:85},{x:55,y:92},{x:18,y:88},{x:5,y:60}],
    ];
    const allNodes = [core, ...rings[0], ...rings[1], ...rings[2]];
    const edges: [number, number][] = [];
    rings[0].forEach((_, i) => edges.push([0, 1 + i]));
    const r1Start = 1, r2Start = r1Start + rings[0].length, r3Start = r2Start + rings[1].length;
    rings[0].forEach((_, i) => { edges.push([r1Start + i, r1Start + (i + 1) % rings[0].length]); });
    rings[1].forEach((_, i) => {
      edges.push([r2Start + i, r2Start + (i + 1) % rings[1].length]);
      edges.push([r2Start + i, r1Start + (i % rings[0].length)]);
    });
    rings[2].forEach((_, i) => {
      edges.push([r3Start + i, r3Start + (i + 1) % rings[2].length]);
      edges.push([r3Start + i, r2Start + (i % rings[1].length)]);
    });
    type Pulse = { edge: number; t: number; speed: number; reverse: boolean };
    const pulses: Pulse[] = [];
    let lastPulse = 0;
    const draw = (time: number) => {
      ctx.fillStyle = "rgba(9,9,11,0.1)";
      ctx.fillRect(0, 0, w, h);
      drawWorldMap(ctx, w, h, 0.06, 0.02);
      edges.forEach(([i, j]) => {
        const a = allNodes[i], b = allNodes[j];
        if (!a || !b) return;
        const ax = (a.x / 100) * w, ay = (a.y / 100) * h;
        const bx = (b.x / 100) * w, by = (b.y / 100) * h;
        ctx.beginPath();
        ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        ctx.strokeStyle = "rgba(249,115,22,0.05)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
      if (time - lastPulse > 250) {
        const ei = Math.floor(Math.random() * edges.length);
        pulses.push({ edge: ei, t: 0, speed: 0.008 + Math.random() * 0.012, reverse: Math.random() > 0.5 });
        lastPulse = time;
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.speed;
        if (p.t > 1) { pulses.splice(i, 1); continue; }
        const [fi, ti] = edges[p.edge];
        const a = allNodes[p.reverse ? ti : fi], b = allNodes[p.reverse ? fi : ti];
        if (!a || !b) { pulses.splice(i, 1); continue; }
        const px = ((a.x + (b.x - a.x) * p.t) / 100) * w;
        const py = ((a.y + (b.y - a.y) * p.t) / 100) * h;
        const g = ctx.createRadialGradient(px, py, 0, px, py, 5);
        g.addColorStop(0, "rgba(249,115,22,0.7)");
        g.addColorStop(1, "rgba(249,115,22,0)");
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      allNodes.forEach((n, idx) => {
        const nx = (n.x / 100) * w, ny = (n.y / 100) * h;
        const pulse = 0.4 + Math.sin(time * 0.002 + idx * 0.5) * 0.3;
        const isCore = idx === 0;
        const r = isCore ? 5 : (idx < r2Start ? 3 : (idx < r3Start ? 2 : 1.5));
        if (isCore) {
          const glow = ctx.createRadialGradient(nx, ny, 0, nx, ny, 25);
          glow.addColorStop(0, `rgba(249,115,22,${0.15 * pulse})`);
          glow.addColorStop(1, "rgba(249,115,22,0)");
          ctx.beginPath();
          ctx.arc(nx, ny, 25, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249,115,22,${0.4 + pulse * 0.5})`;
        ctx.fill();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    ctx.fillStyle = "rgba(9,9,11,1)";
    ctx.fillRect(0, 0, w, h);
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }} aria-hidden="true" />;
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
  {
    id: "firewall-defense",
    name: "Firewall Defense",
    description: "Layered shield barriers deflecting incoming threat particles. Active perimeter defense visualization.",
    tags: ["image", "defense", "firewall"],
    component: "HeroBgFirewallDefense",
  },
  {
    id: "satellite-network",
    name: "Satellite Surveillance",
    description: "Orbital satellite nodes with data downlinks monitoring global cyber activity from space.",
    tags: ["image", "space", "surveillance"],
    component: "HeroBgSatelliteNetwork",
  },
  {
    id: "blockchain-grid",
    name: "Blockchain Ledger",
    description: "Distributed cryptographic blocks with hash chains and verification nodes. Decentralized security.",
    tags: ["image", "blockchain", "crypto"],
    component: "HeroBgBlockchainGrid",
  },
  {
    id: "neural-defense",
    name: "AI Neural Defense",
    description: "Deep learning neural pathways with synaptic connections firing for AI-powered threat detection.",
    tags: ["image", "AI", "neural"],
    component: "HeroBgNeuralDefense",
  },
  {
    id: "submarine-cables",
    name: "Submarine Cable Network",
    description: "Undersea fiber optic cables connecting continents. Critical internet infrastructure visualization.",
    tags: ["image", "infrastructure", "undersea"],
    component: "HeroBgSubmarineCables",
  },
  {
    id: "zero-trust",
    name: "Zero Trust Architecture",
    description: "Concentric verification rings with authentication checkpoints and microsegmentation boundaries.",
    tags: ["image", "zero-trust", "access"],
    component: "HeroBgZeroTrust",
  },
  {
    id: "cloud-security",
    name: "Cloud Security Map",
    description: "Multi-cloud regions connected by encrypted tunnels with security perimeters. Hybrid architecture.",
    tags: ["image", "cloud", "enterprise"],
    component: "HeroBgCloudSecurity",
  },
  {
    id: "endpoint-grid",
    name: "Endpoint Detection Grid",
    description: "Thousands of managed device nodes with status indicators and central EDR management hub.",
    tags: ["image", "EDR", "endpoints"],
    component: "HeroBgEndpointGrid",
  },
  {
    id: "siem-flow",
    name: "SIEM Event Correlation",
    description: "Streaming log data rivers converging into analysis nodes with alert highlights and pattern matching.",
    tags: ["image", "SIEM", "analytics"],
    component: "HeroBgSiemFlow",
  },
  {
    id: "darkweb-intel",
    name: "Dark Web Intelligence",
    description: "Onion network topology with monitoring probes scanning hidden services. Covert threat tracking.",
    tags: ["image", "darkweb", "intel"],
    component: "HeroBgDarkwebIntel",
  },
  {
    id: "threat-hunting",
    name: "Threat Hunting",
    description: "Hunter-seeker probes scanning a digital forest with detection beams illuminating hidden threats.",
    tags: ["image", "hunting", "proactive"],
    component: "HeroBgThreatHunting",
  },
  {
    id: "incident-response",
    name: "Incident Response",
    description: "War room with tactical screens showing active breach containment and response timelines.",
    tags: ["image", "IR", "tactical"],
    component: "HeroBgIncidentResponse",
  },
  {
    id: "quantum-crypto",
    name: "Quantum Encryption",
    description: "Crystalline quantum key distribution lattice with entangled particle paths. Post-quantum ready.",
    tags: ["image", "quantum", "crypto"],
    component: "HeroBgQuantumCrypto",
  },
  {
    id: "ics-scada",
    name: "ICS/SCADA Network",
    description: "Industrial control systems with power grid, pipeline, and critical infrastructure monitoring points.",
    tags: ["image", "ICS", "OT"],
    component: "HeroBgIcsScada",
  },
  {
    id: "pentest-surface",
    name: "Attack Surface Map",
    description: "Network perimeter with probe vectors testing entry points and vulnerability scan rays.",
    tags: ["image", "pentest", "offensive"],
    component: "HeroBgPentestSurface",
  },
  {
    id: "dns-sinkhole",
    name: "DNS Sinkhole",
    description: "Domain resolution paths with malicious domains being redirected to sinkholes. Traffic analysis.",
    tags: ["image", "DNS", "defense"],
    component: "HeroBgDnsSinkhole",
  },
  {
    id: "vuln-heatmap",
    name: "Vulnerability Heat Map",
    description: "Enterprise network with CVSS severity heat zones across network segments. Risk management.",
    tags: ["image", "vulns", "risk"],
    component: "HeroBgVulnHeatmap",
  },
  {
    id: "kill-chain",
    name: "Cyber Kill Chain",
    description: "Seven-stage attack progression from reconnaissance to actions on objectives with defense breakpoints.",
    tags: ["image", "MITRE", "killchain"],
    component: "HeroBgKillChain",
  },
  {
    id: "honeypot-net",
    name: "Honeypot Network",
    description: "Decoy server nodes with tripwire connections redirecting attackers into containment zones.",
    tags: ["image", "deception", "traps"],
    component: "HeroBgHoneypotNet",
  },
  {
    id: "intel-fusion",
    name: "Intelligence Fusion",
    description: "Multi-source data streams converging into a central analysis hub with correlation lines.",
    tags: ["image", "CTI", "fusion"],
    component: "HeroBgIntelFusion",
  },
  {
    id: "cyber-battlefield",
    name: "Cyber Battlefield",
    description: "Opposing forces clashing with defensive shields against attack vectors. Digital warfare frontline.",
    tags: ["image", "warfare", "tactical"],
    component: "HeroBgCyberBattlefield",
  },
  {
    id: "supply-chain",
    name: "Supply Chain Security",
    description: "Interconnected vendor nodes with trust verification chains and third-party risk indicators.",
    tags: ["image", "supply-chain", "risk"],
    component: "HeroBgSupplyChain",
  },
  {
    id: "soc-panorama",
    name: "SOC Panorama",
    description: "Security operations center with wall of monitors displaying real-time threat dashboards.",
    tags: ["image", "SOC", "operations"],
    component: "HeroBgSocPanorama",
  },
  {
    id: "malware-sandbox",
    name: "Malware Sandbox",
    description: "Suspicious specimens contained in quarantine cells with behavioral analysis scanning.",
    tags: ["image", "malware", "forensics"],
    component: "HeroBgMalwareSandbox",
  },
  {
    id: "identity-mesh",
    name: "Identity Access Mesh",
    description: "Identity tokens and credential nodes with authentication pathways, SSO bridges, and MFA checkpoints.",
    tags: ["image", "IAM", "identity"],
    component: "HeroBgIdentityMesh",
  },
  {
    id: "ransomware-contain",
    name: "Ransomware Containment",
    description: "Encrypted files isolated behind quarantine barriers with decryption keys and backup restoration.",
    tags: ["image", "ransomware", "recovery"],
    component: "HeroBgRansomwareContain",
  },
  {
    id: "5g-security",
    name: "5G Network Security",
    description: "Cellular tower mesh with secure communication channels and edge computing nodes.",
    tags: ["image", "5G", "telecom"],
    component: "HeroBg5gSecurity",
  },
  {
    id: "risk-matrix",
    name: "Cyber Risk Matrix",
    description: "Risk categories mapped as glowing zones with probability/impact axes and coverage boundaries.",
    tags: ["image", "risk", "insurance"],
    component: "HeroBgRiskMatrix",
  },
  {
    id: "forensics-trail",
    name: "Digital Forensics",
    description: "Evidence trails with artifact markers, timeline reconstruction, and chain of custody links.",
    tags: ["image", "forensics", "DFIR"],
    component: "HeroBgForensicsTrail",
  },
  {
    id: "soar-automation",
    name: "SOAR Automation",
    description: "AI-driven security orchestration with automated response chains and playbook execution paths.",
    tags: ["image", "SOAR", "automation"],
    component: "HeroBgSoarAutomation",
  },
  {
    id: "globe-packets",
    name: "Globe Packet Flow",
    description: "Animated rotating globe wireframe with 25 city nodes and data packets flowing along curved arcs between continents.",
    tags: ["animated", "globe", "packets", "network"],
    component: "HeroBgGlobePackets",
  },
  {
    id: "data-flow",
    name: "Regional Data Flow",
    description: "Animated continental hub regions with continuous particle streams flowing between NA, EU, RU, APAC, SA, and AF.",
    tags: ["animated", "regions", "streams", "flow"],
    component: "HeroBgDataFlow",
  },
  {
    id: "cyber-mesh",
    name: "Dynamic Cyber Mesh",
    description: "50 drifting network nodes (routers, servers, endpoints) that auto-connect when nearby, with pings traveling along edges.",
    tags: ["animated", "mesh", "topology", "dynamic"],
    component: "HeroBgCyberMesh",
  },
  {
    id: "threat-streams",
    name: "Threat Arc Streams",
    description: "Animated arcing threat trajectories between world regions. Red arcs for threats, orange for legitimate traffic.",
    tags: ["animated", "threats", "arcs", "regions"],
    component: "HeroBgThreatStreams",
  },
  {
    id: "net-topology",
    name: "Network Topology",
    description: "Animated concentric ring topology with a core hub, 3 tiers of nodes, and data pulses radiating outward along edges.",
    tags: ["animated", "topology", "rings", "core"],
    component: "HeroBgNetTopology",
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
    case "firewall-defense": return <HeroBgFirewallDefense />;
    case "satellite-network": return <HeroBgSatelliteNetwork />;
    case "blockchain-grid": return <HeroBgBlockchainGrid />;
    case "neural-defense": return <HeroBgNeuralDefense />;
    case "submarine-cables": return <HeroBgSubmarineCables />;
    case "zero-trust": return <HeroBgZeroTrust />;
    case "cloud-security": return <HeroBgCloudSecurity />;
    case "endpoint-grid": return <HeroBgEndpointGrid />;
    case "siem-flow": return <HeroBgSiemFlow />;
    case "darkweb-intel": return <HeroBgDarkwebIntel />;
    case "threat-hunting": return <HeroBgThreatHunting />;
    case "incident-response": return <HeroBgIncidentResponse />;
    case "quantum-crypto": return <HeroBgQuantumCrypto />;
    case "ics-scada": return <HeroBgIcsScada />;
    case "pentest-surface": return <HeroBgPentestSurface />;
    case "dns-sinkhole": return <HeroBgDnsSinkhole />;
    case "vuln-heatmap": return <HeroBgVulnHeatmap />;
    case "kill-chain": return <HeroBgKillChain />;
    case "honeypot-net": return <HeroBgHoneypotNet />;
    case "intel-fusion": return <HeroBgIntelFusion />;
    case "cyber-battlefield": return <HeroBgCyberBattlefield />;
    case "supply-chain": return <HeroBgSupplyChain />;
    case "soc-panorama": return <HeroBgSocPanorama />;
    case "malware-sandbox": return <HeroBgMalwareSandbox />;
    case "identity-mesh": return <HeroBgIdentityMesh />;
    case "ransomware-contain": return <HeroBgRansomwareContain />;
    case "5g-security": return <HeroBg5gSecurity />;
    case "risk-matrix": return <HeroBgRiskMatrix />;
    case "forensics-trail": return <HeroBgForensicsTrail />;
    case "soar-automation": return <HeroBgSoarAutomation />;
    case "globe-packets": return <HeroBgGlobePackets />;
    case "data-flow": return <HeroBgDataFlow />;
    case "cyber-mesh": return <HeroBgCyberMesh />;
    case "threat-streams": return <HeroBgThreatStreams />;
    case "net-topology": return <HeroBgNetTopology />;
    default: return null;
  }
}
