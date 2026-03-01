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

const backgrounds = [
  { id: 1, name: "SOC Center", desc: "Multiple monitor panels with data visualizations, dark room glow", render: bg1 },
  { id: 2, name: "Server Room", desc: "Rack silhouettes with blinking status LEDs, cool blue/orange lighting", render: bg2 },
  { id: 3, name: "Dark Office", desc: "Minimalist dark workspace, desk outline, monitors, ambient orange glow", render: bg3 },
  { id: 4, name: "Command Center", desc: "Large central display with radar/map, side panels, tactical feel", render: bg4 },
  { id: 5, name: "Matrix", desc: "Falling green characters on black, subtle STBCS watermark", render: bg5 },
  { id: 6, name: "Shield Wall", desc: "Repeating shield logo pattern on dark bg, subtle depth/shadow", render: bg6 },
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