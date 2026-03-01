import { useState } from "react";
import { Shield, Copy, Check, ChevronLeft, ChevronRight, Video, Eye, Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const LOGO_URL = "https://www.stbcybersecurity.com/brand/icon-shield.png";

function bg1() {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0a0a0c;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="position:absolute;inset:0;display:flex;justify-content:center;align-items:flex-end;gap:16px;padding:0 40px;">
    ${[...Array(5)].map((_, i) => `<div style="width:18%;height:${55 + i * 5}%;background:linear-gradient(180deg,#18181b,#0c0c0e);border:1px solid #27272a;border-bottom:none;border-radius:6px 6px 0 0;position:relative;overflow:hidden;">
      <div style="padding:8px;display:flex;flex-wrap:wrap;gap:3px;">
        ${[...Array(6)].map((_, j) => `<div style="width:6px;height:6px;border-radius:50%;background:${j % 3 === 0 ? '#f97316' : j % 3 === 1 ? '#22c55e' : '#3b82f6'};opacity:${0.3 + (j * 0.1)};"></div>`).join('')}
      </div>
      <div style="margin:4px 8px;height:2px;background:linear-gradient(90deg,#f97316,transparent);opacity:0.4;"></div>
      <div style="margin:4px 8px;height:1px;background:#27272a;"></div>
      <div style="margin:2px 8px;height:1px;background:#27272a;opacity:0.5;"></div>
    </div>`).join('')}
  </div>
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(249,115,22,0.06),transparent 70%);"></div>
  <div style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:8px;opacity:0.3;">
    <img src="${LOGO_URL}" alt="" width="16" height="16" style="border-radius:3px;" />
    <span style="font-size:8px;color:#52525b;letter-spacing:3px;">STB CYBERSECURITY</span>
  </div>
</div>`;
}

function bg2() {
  return `<div style="width:100%;aspect-ratio:16/9;background:linear-gradient(180deg,#0a0c10,#0c0e14);position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="position:absolute;inset:0;display:flex;justify-content:center;gap:20px;padding:20px 60px;">
    ${[...Array(6)].map((_, i) => `<div style="width:14%;height:100%;background:#111318;border:1px solid #1e2028;border-radius:4px;position:relative;">
      ${[...Array(8)].map((_, j) => `<div style="position:absolute;left:${4 + (j % 3) * 10}px;top:${10 + j * 12}%;width:5px;height:5px;border-radius:50%;background:${j % 4 === 0 ? '#f97316' : j % 4 === 1 ? '#22c55e' : j % 4 === 2 ? '#3b82f6' : '#ef4444'};opacity:${0.5 + (j * 0.05)};box-shadow:0 0 4px ${j % 4 === 0 ? '#f97316' : j % 4 === 1 ? '#22c55e' : j % 4 === 2 ? '#3b82f6' : '#ef4444'};"></div>`).join('')}
    </div>`).join('')}
  </div>
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,rgba(59,130,246,0.05),transparent 50%),radial-gradient(ellipse at 70% 50%,rgba(249,115,22,0.05),transparent 50%);"></div>
  <div style="position:absolute;bottom:16px;right:24px;opacity:0.2;">
    <img src="${LOGO_URL}" alt="" width="20" height="20" style="border-radius:4px;" />
  </div>
</div>`;
}

function bg3() {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:70%;height:35%;border:1px solid #1a1a1e;border-bottom:none;border-radius:8px 8px 0 0;background:#111113;"></div>
  <div style="position:absolute;bottom:35%;left:25%;width:20%;height:25%;background:#111113;border:1px solid #1a1a1e;border-radius:4px;display:flex;align-items:center;justify-content:center;">
    <div style="width:80%;height:70%;background:#0a0a0c;border:1px solid #27272a;border-radius:2px;"></div>
  </div>
  <div style="position:absolute;bottom:35%;right:25%;width:20%;height:25%;background:#111113;border:1px solid #1a1a1e;border-radius:4px;display:flex;align-items:center;justify-content:center;">
    <div style="width:80%;height:70%;background:#0a0a0c;border:1px solid #27272a;border-radius:2px;"></div>
  </div>
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 80%,rgba(249,115,22,0.04),transparent 50%);"></div>
  <div style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);width:8px;height:8px;border-radius:50%;background:#f97316;opacity:0.3;box-shadow:0 0 12px #f97316;"></div>
</div>`;
}

function bg4() {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0a0a0c;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;">
    <div style="display:flex;flex:1;">
      <div style="flex:1;border:1px solid #1a1a1e;margin:8px;border-radius:4px;display:flex;align-items:center;justify-content:center;">
        <div style="width:70%;height:70%;border:1px solid #27272a;border-radius:50%;position:relative;">
          <div style="position:absolute;top:50%;left:50%;width:60%;height:1px;background:#f97316;opacity:0.4;transform-origin:left center;transform:rotate(-30deg);"></div>
          <div style="position:absolute;top:50%;left:50%;width:4px;height:4px;background:#f97316;border-radius:50%;transform:translate(-50%,-50%);"></div>
        </div>
      </div>
      <div style="width:60%;border:1px solid #1a1a1e;margin:8px;border-radius:4px;display:flex;align-items:center;justify-content:center;">
        <div style="width:90%;height:80%;background:linear-gradient(180deg,#111113,#0a0a0c);border:1px solid #27272a;border-radius:4px;position:relative;overflow:hidden;">
          <div style="position:absolute;inset:0;opacity:0.08;background-image:repeating-linear-gradient(0deg,transparent,transparent 12px,#3b82f6 12px,#3b82f6 13px),repeating-linear-gradient(90deg,transparent,transparent 12px,#3b82f6 12px,#3b82f6 13px);"></div>
        </div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;">
        <div style="flex:1;border:1px solid #1a1a1e;margin:8px 8px 4px;border-radius:4px;"></div>
        <div style="flex:1;border:1px solid #1a1a1e;margin:4px 8px 8px;border-radius:4px;"></div>
      </div>
    </div>
  </div>
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(249,115,22,0.03),transparent 60%);"></div>
</div>`;
}

function bg5() {
  return `<div style="width:100%;aspect-ratio:16/9;background:#000000;position:relative;overflow:hidden;font-family:'Courier New',Consolas,monospace;">
  <div style="position:absolute;inset:0;display:flex;gap:2px;padding:0 10px;opacity:0.5;">
    ${[...Array(30)].map((_, i) => {
      const chars = "01アイウエオカキクケコ∞∑∂λ";
      const col = [...Array(12)].map((_, j) => `<div style="font-size:10px;color:#22c55e;opacity:${(0.1 + Math.random() * 0.6).toFixed(2)};line-height:1.4;">${chars[Math.floor(Math.random() * chars.length)]}</div>`).join('');
      return `<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-start;padding-top:${Math.floor(Math.random() * 40)}%;">${col}</div>`;
    }).join('')}
  </div>
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 30%,rgba(0,0,0,0.7) 100%);"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0.08;">
    <img src="${LOGO_URL}" alt="" width="120" height="120" style="border-radius:20px;" />
  </div>
</div>`;
}

function bg6() {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="position:absolute;inset:0;display:flex;flex-wrap:wrap;align-content:flex-start;padding:10px;gap:0;">
    ${[...Array(48)].map((_, i) => `<div style="width:12.5%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;opacity:${(0.03 + (i % 5) * 0.01).toFixed(2)};">
      <img src="${LOGO_URL}" alt="" width="28" height="28" style="border-radius:6px;" />
    </div>`).join('')}
  </div>
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(249,115,22,0.04),transparent 60%);"></div>
  <div style="position:absolute;inset:0;box-shadow:inset 0 0 100px rgba(0,0,0,0.8);"></div>
</div>`;
}

function bg7() {
  return `<div style="width:100%;aspect-ratio:16/9;background:linear-gradient(180deg,#05060a 0%,#0a0c12 60%,#0c0e14 100%);position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="position:absolute;inset:0;opacity:0.06;background-image:repeating-linear-gradient(0deg,transparent,transparent 30px,#3b82f6 30px,#3b82f6 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,#3b82f6 30px,#3b82f6 31px);"></div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:40%;display:flex;align-items:flex-end;justify-content:center;gap:4px;padding:0 30px;">
    ${[...Array(25)].map((_, i) => {
      const h = 15 + Math.abs(12 - i) * 3 + (i % 3) * 8;
      const hasLight = i % 2 === 0;
      return `<div style="width:3.4%;height:${h}%;background:#0e1018;border:1px solid #1a1d28;border-bottom:none;position:relative;">
        ${hasLight ? `<div style="position:absolute;top:${20 + (i % 4) * 15}%;left:30%;width:3px;height:3px;background:#f97316;border-radius:50%;box-shadow:0 0 6px #f97316;"></div>
        <div style="position:absolute;top:${50 + (i % 3) * 10}%;right:25%;width:2px;height:2px;background:#f97316;opacity:0.6;border-radius:50%;"></div>` : `<div style="position:absolute;top:${30 + (i % 5) * 12}%;left:25%;width:4px;height:3px;background:#1a1d28;"></div>`}
      </div>`;
    }).join('')}
  </div>
  <div style="position:absolute;top:15%;left:50%;transform:translateX(-50%);width:60px;height:60px;border-radius:50%;border:1px solid rgba(249,115,22,0.1);box-shadow:0 0 40px rgba(249,115,22,0.05);"></div>
  <div style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:8px;opacity:0.25;">
    <img src="${LOGO_URL}" alt="" width="14" height="14" style="border-radius:3px;" />
    <span style="font-size:7px;color:#52525b;letter-spacing:3px;">STB CYBERSECURITY</span>
  </div>
</div>`;
}

function bg8() {
  const nodes = [
    {x:20,y:25},{x:45,y:15},{x:70,y:30},{x:30,y:55},{x:55,y:50},{x:80,y:55},
    {x:15,y:75},{x:40,y:80},{x:65,y:70},{x:85,y:80},{x:50,y:35},{x:35,y:40}
  ];
  const connections = [
    [0,1],[1,2],[0,3],[1,4],[2,5],[3,4],[4,5],[3,6],[4,7],[5,9],[6,7],[7,8],[8,9],[1,10],[10,4],[0,11],[11,4],[3,7]
  ];
  return `<div style="width:100%;aspect-ratio:16/9;background:#08090c;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <svg viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%;" preserveAspectRatio="none">
    ${connections.map(([a,b]) => `<line x1="${nodes[a].x}" y1="${nodes[a].y}" x2="${nodes[b].x}" y2="${nodes[b].y}" stroke="#f97316" stroke-width="0.15" opacity="0.3"/>`).join('')}
    ${nodes.map((n,i) => `<circle cx="${n.x}" cy="${n.y}" r="${i % 3 === 0 ? 1.2 : 0.8}" fill="#f97316" opacity="${0.4 + (i % 3) * 0.2}"><animate attributeName="opacity" values="${0.3 + (i%3)*0.1};${0.6 + (i%2)*0.2};${0.3 + (i%3)*0.1}" dur="${2 + i % 3}s" repeatCount="indefinite"/></circle>
    <circle cx="${n.x}" cy="${n.y}" r="${i % 3 === 0 ? 2.5 : 1.8}" fill="none" stroke="#f97316" stroke-width="0.1" opacity="0.15"/>`).join('')}
  </svg>
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,rgba(249,115,22,0.06),transparent 60%);"></div>
  <div style="position:absolute;bottom:14px;right:20px;opacity:0.2;">
    <img src="${LOGO_URL}" alt="" width="18" height="18" style="border-radius:4px;" />
  </div>
</div>`;
}

function bg9() {
  const codeSnippets = [
    ['$ nmap -sV 10.0.0.1', 'PORT   STATE SERVICE', '22/tcp open  ssh', '80/tcp open  http', '443/tcp open  https'],
    ['root@kali:~#', 'hashcat -m 1000', 'Status: Running', 'Speed: 1.2 GH/s', 'Recovered: 3/12'],
    ['[ALERT] Intrusion', 'src: 192.168.1.42', 'dst: 10.0.0.5:443', 'payload: 0x4141', 'action: BLOCKED'],
    ['$ wireshark -i eth0', 'Capturing on eth0', 'Packets: 14,293', 'Display: TCP only', 'Filter applied']
  ];
  return `<div style="width:100%;aspect-ratio:16/9;background:#0a0b0e;position:relative;overflow:hidden;font-family:'Courier New',Consolas,monospace;">
  ${codeSnippets.map((lines, i) => {
    const left = 5 + i * 24;
    const top = 8 + (i % 2) * 35;
    const color = i % 2 === 0 ? '#22c55e' : '#f97316';
    return `<div style="position:absolute;left:${left}%;top:${top}%;width:22%;background:rgba(10,12,16,0.9);border:1px solid ${color}33;border-radius:4px;overflow:hidden;">
      <div style="background:${color}15;padding:3px 6px;font-size:6px;color:${color};opacity:0.7;border-bottom:1px solid ${color}22;">terminal-${i + 1}</div>
      <div style="padding:4px 6px;">
        ${lines.map(l => `<div style="font-size:5.5px;color:${color};opacity:${0.5 + Math.random() * 0.4};line-height:1.6;white-space:nowrap;overflow:hidden;">${l}</div>`).join('')}
      </div>
    </div>`;
  }).join('')}
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,0.6) 100%);"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0.06;">
    <img src="${LOGO_URL}" alt="" width="80" height="80" style="border-radius:16px;" />
  </div>
</div>`;
}

function bg10() {
  return `<div style="width:100%;aspect-ratio:16/9;background:#060810;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="position:absolute;inset:0;">
    ${[...Array(60)].map((_, i) => `<div style="position:absolute;left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${1 + Math.random() * 2}px;height:${1 + Math.random() * 2}px;background:#ffffff;border-radius:50%;opacity:${0.1 + Math.random() * 0.5};"></div>`).join('')}
  </div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:50%;height:70%;border:1px solid #1a1d28;border-radius:8px;background:rgba(8,10,16,0.8);">
    <div style="position:absolute;top:8%;left:5%;right:5%;height:35%;border:1px solid #1e2030;border-radius:6px;background:linear-gradient(180deg,#0c0e18,#080a12);overflow:hidden;">
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60%;height:60%;border:1px solid rgba(59,130,246,0.15);border-radius:50%;"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:30%;height:30%;border:1px solid rgba(59,130,246,0.1);border-radius:50%;"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:4px;height:4px;background:#3b82f6;border-radius:50%;box-shadow:0 0 8px #3b82f6;"></div>
    </div>
  </div>
  <div style="position:absolute;left:3%;top:20%;width:8%;height:60%;display:flex;flex-direction:column;gap:4px;">
    ${[...Array(6)].map((_, i) => `<div style="flex:1;border:1px solid #1a1d28;border-radius:3px;background:#0a0c14;display:flex;align-items:center;justify-content:center;">
      <div style="width:4px;height:4px;border-radius:50%;background:${i % 3 === 0 ? '#f97316' : i % 3 === 1 ? '#22c55e' : '#3b82f6'};opacity:0.5;"></div>
    </div>`).join('')}
  </div>
  <div style="position:absolute;right:3%;top:20%;width:8%;height:60%;display:flex;flex-direction:column;gap:4px;">
    ${[...Array(6)].map((_, i) => `<div style="flex:1;border:1px solid #1a1d28;border-radius:3px;background:#0a0c14;display:flex;align-items:center;justify-content:center;">
      <div style="width:4px;height:4px;border-radius:50%;background:${i % 3 === 0 ? '#22c55e' : i % 3 === 1 ? '#f97316' : '#3b82f6'};opacity:0.5;"></div>
    </div>`).join('')}
  </div>
  <div style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:6px;opacity:0.2;">
    <img src="${LOGO_URL}" alt="" width="14" height="14" style="border-radius:3px;" />
    <span style="font-size:7px;color:#52525b;letter-spacing:3px;">STB CYBERSECURITY</span>
  </div>
</div>`;
}

const backgrounds = [
  { id: 1, name: "SOC Center", desc: "Multiple monitor panels with data visualizations, dark room glow", render: bg1 },
  { id: 2, name: "Server Room", desc: "Rack silhouettes with blinking status LEDs, cool blue/orange lighting", render: bg2 },
  { id: 3, name: "Dark Office", desc: "Minimalist dark workspace, desk outline, monitors, ambient orange glow", render: bg3 },
  { id: 4, name: "Command Center", desc: "Large central display with radar/map, side panels, tactical feel", render: bg4 },
  { id: 5, name: "Matrix", desc: "Falling green characters on black, subtle STBCS watermark", render: bg5 },
  { id: 6, name: "Shield Wall", desc: "Repeating shield logo pattern on dark bg, subtle depth/shadow", render: bg6 },
  { id: 7, name: "Cyber City", desc: "Futuristic cityscape silhouette, neon orange lights, dark sky, grid overlay", render: bg7 },
  { id: 8, name: "Neural Network", desc: "Connected nodes/neurons pattern, pulsing glow effects, brain-inspired", render: bg8 },
  { id: 9, name: "Hacker Den", desc: "Floating terminal windows with code snippets, green/orange on dark", render: bg9 },
  { id: 10, name: "Space Station", desc: "Sci-fi interior, viewport with stars, control panels, futuristic", render: bg10 },
];

export default function Backgrounds() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState<number | null>(null);
  const { toast } = useToast();

  const active = backgrounds[activeIdx];

  function handleCopy(idx: number) {
    const html = backgrounds[idx].render();
    function fallbackCopy() {
      const ta = document.createElement("textarea");
      ta.value = html;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(idx);
      toast({ title: "HTML copied!", description: "Paste into an HTML file and screenshot for your background." });
      setTimeout(() => setCopied(null), 2500);
    }
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      const blob = new Blob([html], { type: "text/html" });
      const plainBlob = new Blob([html], { type: "text/plain" });
      navigator.clipboard.write([new ClipboardItem({ "text/html": blob, "text/plain": plainBlob })]).then(() => {
        setCopied(idx);
        toast({ title: "Background copied!", description: "Paste into an HTML file and screenshot." });
        setTimeout(() => setCopied(null), 2500);
      }).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  function handlePrint() {
    window.print();
  }

  const prev = () => setActiveIdx(i => (i - 1 + backgrounds.length) % backgrounds.length);
  const next = () => setActiveIdx(i => (i + 1) % backgrounds.length);

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/brand-kit" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-orange-400 text-sm mb-6 transition-colors" data-testid="link-back-brand-kit">
          <ArrowLeft className="h-4 w-4" /> Back to Brand Kit
        </Link>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Video className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wider" data-testid="text-page-title">
              MEETING BACKGROUNDS
            </h1>
          </div>
          <p className="text-zinc-400 text-sm">Virtual backgrounds for Zoom, Teams & Meet — pure CSS/HTML art, 16:9 ratio</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="bg-zinc-900/80 border-zinc-800 p-5 lg:col-span-1">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Video className="h-4 w-4 text-orange-500" />
              Styles
            </h3>
            <div className="space-y-2">
              {backgrounds.map((s, i) => (
                <button
                  key={s.id}
                  data-testid={`button-style-${s.id}`}
                  onClick={() => setActiveIdx(i)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    i === activeIdx
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                      : "bg-zinc-800/50 text-zinc-400 border border-transparent hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs opacity-70 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </Card>

          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={prev} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" data-testid="button-prev">
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <div className="text-center">
                <h2 className="text-white font-bold text-lg" data-testid="text-active-style">{active.name}</h2>
                <p className="text-zinc-500 text-xs">{activeIdx + 1} of {backgrounds.length}</p>
              </div>
              <Button variant="outline" size="sm" onClick={next} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" data-testid="button-next">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <Card className="bg-zinc-900/80 border-zinc-800 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-zinc-500 text-xs flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Live Preview (16:9)
                </span>
                <div className="flex gap-2">
                  <Button data-testid="button-print" size="sm" variant="outline" onClick={handlePrint} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    Print / PDF
                  </Button>
                  <Button
                    data-testid={`button-copy-${active.id}`}
                    size="sm"
                    onClick={() => handleCopy(activeIdx)}
                    className={`transition-all ${copied === activeIdx ? "bg-green-600 hover:bg-green-600" : "bg-orange-600 hover:bg-orange-500"}`}
                  >
                    {copied === activeIdx ? <><Check className="h-4 w-4 mr-1" /> Copied!</> : <><Copy className="h-4 w-4 mr-1" /> Copy HTML</>}
                  </Button>
                </div>
              </div>

              <div className="bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
                <div dangerouslySetInnerHTML={{ __html: active.render() }} />
              </div>
            </Card>

            <Card className="bg-zinc-900/60 border-zinc-800 p-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-white text-sm font-semibold mb-1">How to Save as Background</h4>
                  <ol className="text-zinc-400 text-xs space-y-1 list-decimal list-inside">
                    <li>Right-click the preview and select "Save image as..." or take a screenshot</li>
                    <li>Alternatively, use "Print / PDF" and save as image</li>
                    <li>Upload the image in your Zoom/Teams/Meet background settings</li>
                    <li>For best quality, use a 1920x1080 or higher resolution screenshot</li>
                  </ol>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}