import { useState, useRef } from "react";
import { Shield, Copy, Check, ChevronLeft, ChevronRight, Monitor, Eye, Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const SITE_URL = "https://www.stbcybersecurity.com";
const LOGO_URL = `${SITE_URL}/brand/icon-shield.png`;

interface PresentationFields {
  presentationTitle: string;
  subtitle: string;
  presenter: string;
  date: string;
  company: string;
}

const defaultFields: PresentationFields = {
  presentationTitle: "Cybersecurity Threat Landscape 2026",
  subtitle: "Annual Security Assessment & Strategic Recommendations",
  presenter: "Your Name",
  date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  company: "STB Cybersecurity",
};

function slide1(f: PresentationFields) {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:40px;">
  <div style="position:absolute;inset:0;opacity:0.05;background-image:repeating-linear-gradient(0deg,transparent,transparent 30px,#f97316 30px,#f97316 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,#f97316 30px,#f97316 31px);"></div>
  <img src="${LOGO_URL}" alt="STBCS" width="64" height="64" style="margin-bottom:24px;border-radius:12px;opacity:0.9;" />
  <div style="font-size:32px;font-weight:900;color:#ffffff;text-align:center;letter-spacing:2px;max-width:80%;line-height:1.2;">${f.presentationTitle}</div>
  <div style="font-size:14px;color:#a1a1aa;text-align:center;margin-top:12px;max-width:70%;">${f.subtitle}</div>
  <div style="margin-top:24px;font-size:13px;color:#f97316;font-weight:600;">${f.presenter} &bull; ${f.company}</div>
  <div style="font-size:11px;color:#52525b;margin-top:6px;">${f.date}</div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#f97316,#ea580c,#f97316);"></div>
</div>`;
}

function slide2(f: PresentationFields) {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:40px 50px;">
  <div style="position:absolute;top:16px;right:20px;font-size:10px;color:#52525b;letter-spacing:3px;text-transform:uppercase;">CLASSIFIED</div>
  <div style="position:absolute;top:16px;left:20px;display:flex;align-items:center;gap:8px;">
    <img src="${LOGO_URL}" alt="STBCS" width="28" height="28" style="border-radius:6px;" />
    <span style="font-size:11px;color:#71717a;font-weight:700;letter-spacing:2px;">${f.company.toUpperCase()}</span>
  </div>
  <div style="border-left:4px solid #f97316;padding-left:20px;">
    <div style="font-size:10px;color:#f97316;text-transform:uppercase;letter-spacing:3px;font-weight:700;margin-bottom:8px;">TACTICAL BRIEFING</div>
    <div style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:1px;line-height:1.2;">${f.presentationTitle}</div>
    <div style="font-size:13px;color:#a1a1aa;margin-top:8px;">${f.subtitle}</div>
  </div>
  <div style="margin-top:30px;display:flex;gap:24px;font-size:11px;">
    <div><span style="color:#52525b;text-transform:uppercase;letter-spacing:1px;">Presenter:</span> <span style="color:#d4d4d8;">${f.presenter}</span></div>
    <div><span style="color:#52525b;text-transform:uppercase;letter-spacing:1px;">Date:</span> <span style="color:#d4d4d8;">${f.date}</span></div>
    <div><span style="color:#52525b;text-transform:uppercase;letter-spacing:1px;">Classification:</span> <span style="color:#f97316;">CONFIDENTIAL</span></div>
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:#f97316;"></div>
</div>`;
}

function slide3(f: PresentationFields) {
  return `<div style="width:100%;aspect-ratio:16/9;background:linear-gradient(180deg,#0c0c0e 0%,#18181b 100%);position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:40px;">
  <div style="position:absolute;bottom:0;left:0;right:0;height:40%;display:flex;justify-content:center;gap:12px;align-items:flex-end;opacity:0.15;">
    ${[...Array(8)].map((_, i) => `<div style="width:24px;height:${60 + i * 10}%;background:linear-gradient(180deg,#f97316,#0c0c0e);border-radius:4px 4px 0 0;"></div>`).join('')}
  </div>
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center bottom,rgba(249,115,22,0.08),transparent 70%);"></div>
  <img src="${LOGO_URL}" alt="STBCS" width="56" height="56" style="margin-bottom:20px;border-radius:12px;position:relative;" />
  <div style="font-size:30px;font-weight:900;color:#ffffff;text-align:center;position:relative;line-height:1.2;">${f.presentationTitle}</div>
  <div style="font-size:13px;color:#a1a1aa;text-align:center;margin-top:10px;position:relative;">${f.subtitle}</div>
  <div style="margin-top:20px;font-size:12px;color:#71717a;position:relative;">${f.presenter} &mdash; ${f.company}</div>
  <div style="font-size:11px;color:#52525b;margin-top:4px;position:relative;">${f.date}</div>
</div>`;
}

function slide4(f: PresentationFields) {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:flex-end;padding:50px 60px;">
  <div style="position:absolute;top:0;left:0;right:0;height:2px;background:#f97316;"></div>
  <div style="position:absolute;top:20px;left:60px;display:flex;align-items:center;gap:8px;">
    <img src="${LOGO_URL}" alt="STBCS" width="24" height="24" style="border-radius:4px;" />
    <span style="font-size:10px;color:#52525b;letter-spacing:2px;font-weight:600;">${f.company.toUpperCase()}</span>
  </div>
  <div style="font-size:36px;font-weight:900;color:#ffffff;line-height:1.15;max-width:70%;">${f.presentationTitle}</div>
  <div style="font-size:14px;color:#71717a;margin-top:10px;max-width:60%;">${f.subtitle}</div>
  <div style="position:absolute;bottom:30px;right:60px;text-align:right;">
    <div style="font-size:12px;color:#a1a1aa;">${f.presenter}</div>
    <div style="font-size:11px;color:#52525b;">${f.date}</div>
  </div>
</div>`;
}

function slide5(f: PresentationFields) {
  return `<div style="width:100%;aspect-ratio:16/9;background:linear-gradient(135deg,#f97316 0%,#ea580c 30%,#18181b 70%,#0c0c0e 100%);position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:50px 60px;">
  <div style="position:absolute;top:20px;left:30px;"><img src="${LOGO_URL}" alt="STBCS" width="36" height="36" style="border-radius:8px;" /></div>
  <div style="font-size:34px;font-weight:900;color:#ffffff;line-height:1.2;max-width:75%;text-shadow:0 2px 12px rgba(0,0,0,0.3);">${f.presentationTitle}</div>
  <div style="font-size:14px;color:rgba(255,255,255,0.8);margin-top:12px;max-width:60%;">${f.subtitle}</div>
  <div style="margin-top:28px;display:flex;gap:20px;font-size:12px;">
    <span style="color:rgba(255,255,255,0.9);font-weight:600;">${f.presenter}</span>
    <span style="color:rgba(255,255,255,0.6);">${f.company}</span>
    <span style="color:rgba(255,255,255,0.6);">${f.date}</span>
  </div>
</div>`;
}

function slide6(f: PresentationFields) {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Courier New',Consolas,monospace;display:flex;flex-direction:column;justify-content:center;padding:40px 50px;">
  <div style="position:absolute;inset:0;opacity:0.06;background-image:repeating-linear-gradient(0deg,transparent,transparent 20px,#3f3f46 20px,#3f3f46 21px),repeating-linear-gradient(90deg,transparent,transparent 20px,#3f3f46 20px,#3f3f46 21px);"></div>
  <div style="position:absolute;top:16px;left:20px;font-size:9px;color:#3f3f46;">REV 1.0 // TECHNICAL DOCUMENT</div>
  <div style="position:absolute;top:16px;right:20px;display:flex;align-items:center;gap:6px;">
    <img src="${LOGO_URL}" alt="STBCS" width="20" height="20" style="border-radius:4px;" />
    <span style="font-size:9px;color:#3f3f46;letter-spacing:2px;">${f.company.toUpperCase()}</span>
  </div>
  <div style="border:1px solid #27272a;padding:24px;position:relative;">
    <div style="font-size:9px;color:#f97316;text-transform:uppercase;letter-spacing:4px;margin-bottom:12px;">// TECHNICAL BRIEF</div>
    <div style="font-size:26px;font-weight:700;color:#ffffff;font-family:'Courier New',Consolas,monospace;line-height:1.3;">${f.presentationTitle}</div>
    <div style="font-size:12px;color:#71717a;margin-top:8px;">${f.subtitle}</div>
    <div style="margin-top:20px;display:flex;gap:20px;font-size:10px;border-top:1px solid #27272a;padding-top:12px;">
      <div><span style="color:#52525b;">AUTHOR:</span> <span style="color:#a1a1aa;">${f.presenter}</span></div>
      <div><span style="color:#52525b;">DATE:</span> <span style="color:#a1a1aa;">${f.date}</span></div>
      <div><span style="color:#52525b;">STATUS:</span> <span style="color:#f97316;">DRAFT</span></div>
    </div>
  </div>
</div>`;
}

function slide7(f: PresentationFields) {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:40px 50px;">
  <div style="position:absolute;inset:0;opacity:0.07;background-image:repeating-linear-gradient(0deg,transparent,transparent 40px,#27272a 40px,#27272a 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,#27272a 40px,#27272a 41px);"></div>
  <div style="position:absolute;top:16px;left:20px;display:flex;align-items:center;gap:8px;">
    <img src="${LOGO_URL}" alt="STBCS" width="24" height="24" style="border-radius:4px;" />
    <span style="font-size:10px;color:#52525b;letter-spacing:2px;font-weight:600;">${f.company.toUpperCase()}</span>
  </div>
  <div style="position:absolute;top:14px;right:20px;display:flex;gap:10px;">
    <div style="background:#18181b;border:1px solid #27272a;border-radius:6px;padding:6px 12px;text-align:center;min-width:70px;">
      <div style="font-size:18px;font-weight:900;color:#f97316;">47</div>
      <div style="font-size:7px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Critical</div>
    </div>
    <div style="background:#18181b;border:1px solid #27272a;border-radius:6px;padding:6px 12px;text-align:center;min-width:70px;">
      <div style="font-size:18px;font-weight:900;color:#eab308;">183</div>
      <div style="font-size:7px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Warnings</div>
    </div>
    <div style="background:#18181b;border:1px solid #27272a;border-radius:6px;padding:6px 12px;text-align:center;min-width:70px;">
      <div style="font-size:18px;font-weight:900;color:#22c55e;">1.2K</div>
      <div style="font-size:7px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Events</div>
    </div>
  </div>
  <div style="position:relative;margin-top:10px;">
    <div style="font-size:9px;color:#f97316;text-transform:uppercase;letter-spacing:3px;font-weight:700;margin-bottom:8px;">THREAT DASHBOARD</div>
    <div style="font-size:28px;font-weight:900;color:#ffffff;line-height:1.2;max-width:70%;">${f.presentationTitle}</div>
    <div style="font-size:13px;color:#a1a1aa;margin-top:8px;max-width:60%;">${f.subtitle}</div>
  </div>
  <div style="position:absolute;bottom:30px;left:50px;display:flex;gap:20px;font-size:11px;">
    <span style="color:#71717a;">${f.presenter}</span>
    <span style="color:#52525b;">${f.date}</span>
  </div>
  <div style="position:absolute;bottom:20px;right:20px;display:flex;gap:6px;align-items:flex-end;">
    ${[35, 55, 40, 70, 50, 80, 60, 45, 75, 55, 65, 85].map(h => `<div style="width:8px;height:${h}px;background:linear-gradient(180deg,#f97316,#18181b);border-radius:2px 2px 0 0;opacity:0.4;"></div>`).join('')}
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#f97316,#ea580c,#f97316);"></div>
</div>`;
}

function slide8(f: PresentationFields) {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:40px;">
  <div style="position:absolute;inset:0;background:conic-gradient(from 0deg at 50% 50%,rgba(249,115,22,0.03),rgba(168,85,247,0.03),rgba(59,130,246,0.03),rgba(34,197,94,0.03),rgba(249,115,22,0.03));"></div>
  <div style="position:absolute;inset:8px;border:1px solid transparent;border-image:linear-gradient(135deg,rgba(249,115,22,0.4),rgba(168,85,247,0.3),rgba(59,130,246,0.3),rgba(34,197,94,0.3),rgba(249,115,22,0.4)) 1;"></div>
  <div style="position:absolute;inset:14px;border:1px solid transparent;border-image:linear-gradient(225deg,rgba(249,115,22,0.2),rgba(168,85,247,0.15),rgba(59,130,246,0.15),rgba(34,197,94,0.15),rgba(249,115,22,0.2)) 1;"></div>
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(249,115,22,0.04),transparent 70%);"></div>
  <div style="background:rgba(12,12,14,0.85);backdrop-filter:blur(8px);border:1px solid rgba(249,115,22,0.15);border-radius:16px;padding:40px 60px;text-align:center;position:relative;max-width:80%;">
    <img src="${LOGO_URL}" alt="STBCS" width="48" height="48" style="margin:0 auto 20px;border-radius:12px;display:block;" />
    <div style="font-size:30px;font-weight:900;color:#ffffff;line-height:1.2;">${f.presentationTitle}</div>
    <div style="font-size:13px;color:#a1a1aa;margin-top:10px;">${f.subtitle}</div>
    <div style="margin-top:20px;font-size:12px;color:#71717a;">${f.presenter} &bull; ${f.company} &bull; ${f.date}</div>
  </div>
</div>`;
}

function slide9(f: PresentationFields) {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;padding:0;">
  <div style="background:linear-gradient(90deg,#18181b,#1c1917);padding:8px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #f97316;">
    <div style="display:flex;align-items:center;gap:8px;">
      <img src="${LOGO_URL}" alt="STBCS" width="20" height="20" style="border-radius:4px;" />
      <span style="font-size:10px;color:#f97316;font-weight:700;letter-spacing:3px;text-transform:uppercase;">WAR ROOM</span>
    </div>
    <div style="display:flex;gap:12px;font-size:9px;color:#52525b;">
      <span>DEFCON 2</span>
      <span style="color:#ef4444;">● ACTIVE THREAT</span>
      <span>${f.date}</span>
    </div>
  </div>
  <div style="flex:1;display:flex;">
    <div style="width:140px;background:#18181b;border-right:1px solid #27272a;padding:12px 10px;display:flex;flex-direction:column;gap:8px;">
      ${['INTEL FEED', 'THREAT MAP', 'ASSETS', 'COMMS', 'REPORTS'].map((label, i) => `<div style="background:${i === 0 ? 'rgba(249,115,22,0.15)' : '#0c0c0e'};border:1px solid ${i === 0 ? 'rgba(249,115,22,0.3)' : '#27272a'};border-radius:4px;padding:6px 8px;font-size:8px;color:${i === 0 ? '#f97316' : '#52525b'};letter-spacing:1px;text-transform:uppercase;">${label}</div>`).join('')}
    </div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:30px 40px;">
      <div style="font-size:9px;color:#f97316;text-transform:uppercase;letter-spacing:4px;font-weight:700;margin-bottom:6px;">SITUATION REPORT</div>
      <div style="font-size:26px;font-weight:900;color:#ffffff;line-height:1.2;">${f.presentationTitle}</div>
      <div style="font-size:12px;color:#a1a1aa;margin-top:8px;max-width:80%;">${f.subtitle}</div>
      <div style="margin-top:20px;display:flex;gap:16px;">
        ${[{label:'THREAT LEVEL',value:'HIGH',color:'#ef4444'},{label:'RESPONSE',value:'ACTIVE',color:'#22c55e'},{label:'CLASSIFICATION',value:'SECRET',color:'#f97316'}].map(s => `<div style="background:#18181b;border:1px solid #27272a;border-radius:4px;padding:6px 10px;"><div style="font-size:7px;color:#52525b;letter-spacing:1px;text-transform:uppercase;">${s.label}</div><div style="font-size:11px;font-weight:700;color:${s.color};margin-top:2px;">${s.value}</div></div>`).join('')}
      </div>
      <div style="margin-top:16px;font-size:10px;color:#52525b;">${f.presenter} &mdash; ${f.company}</div>
    </div>
  </div>
</div>`;
}

function slide10(f: PresentationFields) {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:flex-end;padding:50px 60px;">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 60%,rgba(249,115,22,0.08),transparent 50%),radial-gradient(ellipse at 70% 40%,rgba(249,115,22,0.03),transparent 50%);"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,#0c0c0e 0%,transparent 30%,transparent 70%,#0c0c0e 100%);"></div>
  <div style="position:absolute;top:0;left:0;right:0;height:60%;background:linear-gradient(180deg,rgba(12,12,14,0.3),rgba(12,12,14,0.95));"></div>
  <div style="position:absolute;top:20px;right:24px;display:flex;align-items:center;gap:6px;">
    <img src="${LOGO_URL}" alt="STBCS" width="20" height="20" style="border-radius:4px;opacity:0.6;" />
    <span style="font-size:9px;color:#3f3f46;letter-spacing:2px;">${f.company.toUpperCase()}</span>
  </div>
  <div style="position:relative;">
    <div style="font-size:9px;color:#71717a;text-transform:uppercase;letter-spacing:4px;margin-bottom:10px;font-style:italic;">A Cyber Noir Production</div>
    <div style="font-size:36px;font-weight:900;color:#ffffff;line-height:1.1;max-width:75%;text-shadow:0 0 40px rgba(249,115,22,0.3),0 0 80px rgba(249,115,22,0.1);">${f.presentationTitle}</div>
    <div style="font-size:14px;color:#71717a;margin-top:10px;max-width:60%;font-style:italic;">${f.subtitle}</div>
    <div style="margin-top:24px;display:flex;gap:20px;font-size:11px;">
      <span style="color:#a1a1aa;">${f.presenter}</span>
      <span style="color:#52525b;">${f.date}</span>
    </div>
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#f97316 50%,transparent);"></div>
</div>`;
}

const slides = [
  { id: 1, name: "Keynote Dark", desc: "Full dark bg, circuit pattern, orange accent bar bottom", render: slide1 },
  { id: 2, name: "Tactical Briefing", desc: "Military briefing style with CLASSIFIED watermark", render: slide2 },
  { id: 3, name: "Data Center", desc: "Server rack silhouette background with glow effects", render: slide3 },
  { id: 4, name: "Minimal", desc: "Clean dark with single orange line, title left-aligned", render: slide4 },
  { id: 5, name: "Gradient", desc: "Orange-to-dark diagonal gradient with white text", render: slide5 },
  { id: 6, name: "Technical", desc: "Blueprint/schematic aesthetic with grid lines", render: slide6 },
  { id: 7, name: "Threat Dashboard", desc: "Mock dashboard layout with threat counters and chart outlines", render: slide7 },
  { id: 8, name: "Holographic", desc: "Iridescent gradient border effect, futuristic glass panel feel", render: slide8 },
  { id: 9, name: "War Room", desc: "Military situation room with status panels and tactical feel", render: slide9 },
  { id: 10, name: "Cyber Noir", desc: "Film noir inspired with dramatic shadows and spotlight effect", render: slide10 },
];

export default function Presentations() {
  const [fields, setFields] = useState<PresentationFields>(defaultFields);
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState<number | null>(null);
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const active = slides[activeIdx];

  function handleCopy(idx: number) {
    const html = slides[idx].render(fields);
    function fallbackCopy() {
      const ta = document.createElement("textarea");
      ta.value = html;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(idx);
      toast({ title: "HTML copied!", description: "Paste the HTML into your presentation tool." });
      setTimeout(() => setCopied(null), 2500);
    }
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      const blob = new Blob([html], { type: "text/html" });
      const plainBlob = new Blob([html], { type: "text/plain" });
      navigator.clipboard.write([new ClipboardItem({ "text/html": blob, "text/plain": plainBlob })]).then(() => {
        setCopied(idx);
        toast({ title: "Slide copied!", description: "Paste it into your presentation tool." });
        setTimeout(() => setCopied(null), 2500);
      }).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  function handlePrint() {
    window.print();
  }

  const prev = () => setActiveIdx(i => (i - 1 + slides.length) % slides.length);
  const next = () => setActiveIdx(i => (i + 1) % slides.length);

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/brand-kit" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-orange-400 text-sm mb-6 transition-colors" data-testid="link-back-brand-kit">
          <ArrowLeft className="h-4 w-4" /> Back to Brand Kit
        </Link>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Monitor className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wider" data-testid="text-page-title">
              PRESENTATION HEADERS
            </h1>
          </div>
          <p className="text-zinc-400 text-sm">Title slide designs for presentations — 16:9 aspect ratio</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/80 border-zinc-800 p-5 lg:col-span-1">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Monitor className="h-4 w-4 text-orange-500" />
              Customize Fields
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-zinc-400 text-xs">Presentation Title</Label>
                <Input data-testid="input-presentation-title" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.presentationTitle} onChange={e => setFields(p => ({ ...p, presentationTitle: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Subtitle</Label>
                <Input data-testid="input-subtitle" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.subtitle} onChange={e => setFields(p => ({ ...p, subtitle: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Presenter</Label>
                <Input data-testid="input-presenter" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.presenter} onChange={e => setFields(p => ({ ...p, presenter: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Date</Label>
                <Input data-testid="input-date" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.date} onChange={e => setFields(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Company</Label>
                <Input data-testid="input-company" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.company} onChange={e => setFields(p => ({ ...p, company: e.target.value }))} />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800">
              <h4 className="text-zinc-400 text-xs font-semibold mb-3 uppercase tracking-wider">All Styles</h4>
              <div className="space-y-2">
                {slides.map((s, i) => (
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
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={prev} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" data-testid="button-prev">
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <div className="text-center">
                <h2 className="text-white font-bold text-lg" data-testid="text-active-style">{active.name}</h2>
                <p className="text-zinc-500 text-xs">{activeIdx + 1} of {slides.length}</p>
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
                <div
                  ref={previewRef}
                  dangerouslySetInnerHTML={{ __html: active.render(fields) }}
                />
              </div>
            </Card>

            <Card className="bg-zinc-900/60 border-zinc-800 p-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-white text-sm font-semibold mb-1">How to Use</h4>
                  <ol className="text-zinc-400 text-xs space-y-1 list-decimal list-inside">
                    <li>Customize your presentation details on the left</li>
                    <li>Browse styles using the arrows or style list</li>
                    <li>Click "Copy HTML" to copy the slide markup</li>
                    <li>Paste into your presentation tool or use "Print / PDF" to save</li>
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