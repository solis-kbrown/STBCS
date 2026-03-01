import { useState, useRef } from "react";
import { Shield, Copy, Check, ChevronLeft, ChevronRight, FileSearch, Eye, Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const SITE_URL = "https://www.stbcybersecurity.com";
const LOGO_URL = `${SITE_URL}/brand/icon-shield.png`;

interface ReportFields {
  reportTitle: string;
  clientName: string;
  reportDate: string;
  classificationLevel: string;
  reportNumber: string;
  preparedBy: string;
  version: string;
}

const defaultFields: ReportFields = {
  reportTitle: "Security Assessment Report",
  clientName: "Acme Corporation",
  reportDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  classificationLevel: "Confidential",
  reportNumber: "STBCS-2026-001",
  preparedBy: "STB Cybersecurity",
  version: "1.0",
};

const classificationLevels = ["Public", "Internal", "Confidential", "Restricted", "Top Secret"];

function classificationColor(level: string) {
  switch (level) {
    case "Public": return "#22c55e";
    case "Internal": return "#3b82f6";
    case "Confidential": return "#f97316";
    case "Restricted": return "#ef4444";
    case "Top Secret": return "#dc2626";
    default: return "#f97316";
  }
}

function cover1(f: ReportFields) {
  const clr = classificationColor(f.classificationLevel);
  return `<div style="width:100%;aspect-ratio:210/297;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;padding:40px;">
  <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${clr};"></div>
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:30px;">
    <img src="${LOGO_URL}" alt="STBCS" width="48" height="48" style="border-radius:10px;" />
    <div>
      <div style="font-size:16px;font-weight:800;color:#ffffff;letter-spacing:2px;">STB CYBERSECURITY</div>
      <div style="font-size:9px;color:#52525b;letter-spacing:3px;">SECURING THE DIGITAL FRONTIER</div>
    </div>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
    <div style="display:inline-block;background:${clr};color:#ffffff;font-size:9px;font-weight:700;padding:3px 10px;border-radius:3px;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;align-self:flex-start;">${f.classificationLevel}</div>
    <div style="background:linear-gradient(90deg,#f97316,#ea580c);height:3px;width:60px;margin-bottom:16px;border-radius:2px;"></div>
    <div style="font-size:28px;font-weight:900;color:#ffffff;line-height:1.2;margin-bottom:12px;">${f.reportTitle}</div>
    <div style="font-size:14px;color:#a1a1aa;margin-bottom:24px;">Prepared for ${f.clientName}</div>
    <div style="display:flex;gap:20px;flex-wrap:wrap;font-size:11px;">
      <div><span style="color:#52525b;text-transform:uppercase;letter-spacing:1px;">Report #:</span> <span style="color:#d4d4d8;">${f.reportNumber}</span></div>
      <div><span style="color:#52525b;text-transform:uppercase;letter-spacing:1px;">Date:</span> <span style="color:#d4d4d8;">${f.reportDate}</span></div>
      <div><span style="color:#52525b;text-transform:uppercase;letter-spacing:1px;">Version:</span> <span style="color:#d4d4d8;">${f.version}</span></div>
    </div>
  </div>
  <div style="border-top:1px solid #27272a;padding-top:16px;display:flex;justify-content:space-between;font-size:10px;color:#52525b;">
    <div>Prepared by: ${f.preparedBy}</div>
    <div>${SITE_URL}</div>
  </div>
</div>`;
}

function cover2(f: ReportFields) {
  return `<div style="width:100%;aspect-ratio:210/297;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;">
  <div style="position:absolute;top:30px;right:30px;border:2px solid #ef4444;border-radius:50%;width:80px;height:80px;display:flex;align-items:center;justify-content:center;transform:rotate(-15deg);">
    <div style="font-size:9px;font-weight:900;color:#ef4444;text-align:center;letter-spacing:1px;line-height:1.3;">AUTHORIZED<br/>TESTING</div>
  </div>
  <div style="background:linear-gradient(135deg,#dc2626,#f97316);padding:40px;flex:0 0 auto;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
      <img src="${LOGO_URL}" alt="STBCS" width="36" height="36" style="border-radius:8px;" />
      <span style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:2px;">STB CYBERSECURITY</span>
    </div>
    <div style="font-size:10px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:3px;margin-bottom:8px;">PENETRATION TEST REPORT</div>
    <div style="font-size:26px;font-weight:900;color:#ffffff;line-height:1.2;">${f.reportTitle}</div>
  </div>
  <div style="flex:1;padding:30px 40px;display:flex;flex-direction:column;justify-content:center;">
    <div style="position:relative;margin-bottom:24px;">
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:120px;height:120px;border:2px solid #27272a;border-radius:50%;opacity:0.3;"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80px;height:80px;border:1px solid #27272a;border-radius:50%;opacity:0.2;"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:6px;height:6px;background:#f97316;border-radius:50%;"></div>
      <div style="height:140px;"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:11px;">
      <div style="background:#18181b;border:1px solid #27272a;border-radius:6px;padding:12px;">
        <div style="color:#52525b;text-transform:uppercase;letter-spacing:1px;font-size:9px;margin-bottom:4px;">Client</div>
        <div style="color:#d4d4d8;">${f.clientName}</div>
      </div>
      <div style="background:#18181b;border:1px solid #27272a;border-radius:6px;padding:12px;">
        <div style="color:#52525b;text-transform:uppercase;letter-spacing:1px;font-size:9px;margin-bottom:4px;">Report #</div>
        <div style="color:#d4d4d8;">${f.reportNumber}</div>
      </div>
      <div style="background:#18181b;border:1px solid #27272a;border-radius:6px;padding:12px;">
        <div style="color:#52525b;text-transform:uppercase;letter-spacing:1px;font-size:9px;margin-bottom:4px;">Date</div>
        <div style="color:#d4d4d8;">${f.reportDate}</div>
      </div>
      <div style="background:#18181b;border:1px solid #27272a;border-radius:6px;padding:12px;">
        <div style="color:#52525b;text-transform:uppercase;letter-spacing:1px;font-size:9px;margin-bottom:4px;">Classification</div>
        <div style="color:${classificationColor(f.classificationLevel)};font-weight:700;">${f.classificationLevel.toUpperCase()}</div>
      </div>
    </div>
  </div>
  <div style="padding:16px 40px;border-top:1px solid #27272a;font-size:10px;color:#52525b;display:flex;justify-content:space-between;">
    <span>Prepared by: ${f.preparedBy}</span>
    <span>v${f.version}</span>
  </div>
</div>`;
}

function cover3(f: ReportFields) {
  const clr = classificationColor(f.classificationLevel);
  return `<div style="width:100%;aspect-ratio:210/297;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;padding:40px;">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:30px;">
    <img src="${LOGO_URL}" alt="STBCS" width="40" height="40" style="border-radius:8px;" />
    <div>
      <div style="font-size:14px;font-weight:800;color:#ffffff;letter-spacing:2px;">STB CYBERSECURITY</div>
      <div style="font-size:9px;color:#52525b;letter-spacing:2px;">THREAT INTELLIGENCE DIVISION</div>
    </div>
  </div>
  <div style="margin-bottom:20px;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
      <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;">Threat Level</div>
    </div>
    <div style="height:6px;background:#18181b;border-radius:3px;overflow:hidden;margin-bottom:6px;">
      <div style="height:100%;width:${f.classificationLevel === 'Top Secret' ? '100' : f.classificationLevel === 'Restricted' ? '80' : f.classificationLevel === 'Confidential' ? '60' : f.classificationLevel === 'Internal' ? '40' : '20'}%;background:linear-gradient(90deg,#22c55e,#f97316,#ef4444);border-radius:3px;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:8px;color:#3f3f46;">
      <span>LOW</span><span>MODERATE</span><span>HIGH</span><span>CRITICAL</span><span>SEVERE</span>
    </div>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
    <div style="font-size:10px;color:#f97316;text-transform:uppercase;letter-spacing:3px;font-weight:700;margin-bottom:10px;">THREAT REPORT</div>
    <div style="font-size:26px;font-weight:900;color:#ffffff;line-height:1.2;margin-bottom:12px;">${f.reportTitle}</div>
    <div style="font-size:13px;color:#a1a1aa;margin-bottom:24px;">Intelligence Brief — ${f.clientName}</div>
    <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:16px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:11px;">
        <div><span style="color:#52525b;">Report #:</span> <span style="color:#d4d4d8;">${f.reportNumber}</span></div>
        <div><span style="color:#52525b;">Date:</span> <span style="color:#d4d4d8;">${f.reportDate}</span></div>
        <div><span style="color:#52525b;">Classification:</span> <span style="color:${clr};font-weight:700;">${f.classificationLevel}</span></div>
        <div><span style="color:#52525b;">Version:</span> <span style="color:#d4d4d8;">${f.version}</span></div>
      </div>
    </div>
  </div>
  <div style="border-top:1px solid #27272a;padding-top:16px;font-size:10px;color:#52525b;display:flex;justify-content:space-between;">
    <span>${f.preparedBy}</span>
    <span>${SITE_URL}</span>
  </div>
</div>`;
}

function cover4(f: ReportFields) {
  return `<div style="width:100%;aspect-ratio:210/297;background:#ffffff;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;padding:40px;color:#18181b;">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:40px;">
    <img src="${LOGO_URL}" alt="STBCS" width="40" height="40" style="border-radius:8px;" />
    <div>
      <div style="font-size:14px;font-weight:800;color:#18181b;letter-spacing:2px;">STB CYBERSECURITY</div>
      <div style="font-size:9px;color:#71717a;letter-spacing:2px;">COMPLIANCE &amp; AUDIT</div>
    </div>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
      <div style="width:20px;height:20px;border:2px solid #22c55e;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#22c55e;">✓</div>
      <div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:3px;">COMPLIANCE AUDIT</div>
    </div>
    <div style="font-size:26px;font-weight:900;color:#18181b;line-height:1.2;margin-bottom:12px;">${f.reportTitle}</div>
    <div style="font-size:13px;color:#71717a;margin-bottom:24px;">Prepared for ${f.clientName}</div>
    <div style="display:flex;gap:8px;margin-bottom:24px;">
      ${['Policy Review', 'Access Control', 'Data Protection', 'Incident Mgmt'].map((item, i) => 
        `<div style="display:flex;align-items:center;gap:4px;font-size:10px;padding:4px 8px;border-radius:4px;background:${i < 3 ? '#f0fdf4' : '#fff7ed'};color:${i < 3 ? '#22c55e' : '#f97316'};border:1px solid ${i < 3 ? '#bbf7d0' : '#fed7aa'};">
          <span>${i < 3 ? '✓' : '!'}</span> ${item}
        </div>`
      ).join('')}
    </div>
    <div style="background:#f4f4f5;border:1px solid #e4e4e7;border-radius:8px;padding:16px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:11px;">
        <div><span style="color:#71717a;">Report #:</span> <span style="color:#18181b;">${f.reportNumber}</span></div>
        <div><span style="color:#71717a;">Date:</span> <span style="color:#18181b;">${f.reportDate}</span></div>
        <div><span style="color:#71717a;">Classification:</span> <span style="color:${classificationColor(f.classificationLevel)};font-weight:700;">${f.classificationLevel}</span></div>
        <div><span style="color:#71717a;">Version:</span> <span style="color:#18181b;">${f.version}</span></div>
      </div>
    </div>
  </div>
  <div style="border-top:2px solid #f97316;padding-top:16px;font-size:10px;color:#71717a;display:flex;justify-content:space-between;">
    <span>${f.preparedBy}</span>
    <span>${SITE_URL}</span>
  </div>
</div>`;
}

function cover5(f: ReportFields) {
  const clr = classificationColor(f.classificationLevel);
  const severityWidth = f.classificationLevel === 'Top Secret' ? '100' : f.classificationLevel === 'Restricted' ? '80' : f.classificationLevel === 'Confidential' ? '60' : f.classificationLevel === 'Internal' ? '40' : '20';
  return `<div style="width:100%;aspect-ratio:210/297;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;">
  <div style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:30px 40px;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <img src="${LOGO_URL}" alt="STBCS" width="32" height="32" style="border-radius:6px;" />
        <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:2px;">STB CYBERSECURITY</span>
      </div>
      <div style="background:rgba(0,0,0,0.3);color:#ffffff;font-size:8px;font-weight:700;padding:3px 8px;border-radius:3px;letter-spacing:2px;">URGENT</div>
    </div>
    <div style="font-size:10px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:3px;margin-bottom:6px;">INCIDENT REPORT</div>
    <div style="font-size:24px;font-weight:900;color:#ffffff;line-height:1.2;">${f.reportTitle}</div>
  </div>
  <div style="flex:1;padding:30px 40px;display:flex;flex-direction:column;justify-content:center;">
    <div style="margin-bottom:20px;">
      <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Severity Level</div>
      <div style="height:8px;background:#18181b;border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${severityWidth}%;background:linear-gradient(90deg,#22c55e,#eab308,#f97316,#ef4444);border-radius:4px;"></div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;font-size:11px;">
      <div style="display:flex;gap:8px;">
        <div style="flex:1;background:#18181b;border:1px solid #27272a;border-left:3px solid #ef4444;border-radius:0 6px 6px 0;padding:12px;">
          <div style="color:#52525b;font-size:9px;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Case Number</div>
          <div style="color:#d4d4d8;font-weight:600;">${f.reportNumber}</div>
        </div>
        <div style="flex:1;background:#18181b;border:1px solid #27272a;border-left:3px solid #f97316;border-radius:0 6px 6px 0;padding:12px;">
          <div style="color:#52525b;font-size:9px;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Classification</div>
          <div style="color:${clr};font-weight:700;">${f.classificationLevel.toUpperCase()}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <div style="flex:1;background:#18181b;border:1px solid #27272a;border-radius:6px;padding:12px;">
          <div style="color:#52525b;font-size:9px;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Client</div>
          <div style="color:#d4d4d8;">${f.clientName}</div>
        </div>
        <div style="flex:1;background:#18181b;border:1px solid #27272a;border-radius:6px;padding:12px;">
          <div style="color:#52525b;font-size:9px;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Date Reported</div>
          <div style="color:#d4d4d8;">${f.reportDate}</div>
        </div>
      </div>
      <div style="background:#18181b;border:1px solid #27272a;border-radius:6px;padding:12px;">
        <div style="color:#52525b;font-size:9px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Timeline Reference</div>
        <div style="display:flex;align-items:center;gap:4px;">
          <div style="width:8px;height:8px;border-radius:50%;background:#ef4444;"></div>
          <div style="flex:1;height:2px;background:linear-gradient(90deg,#ef4444,#f97316,#52525b);border-radius:1px;"></div>
          <div style="font-size:9px;color:#52525b;">Ongoing</div>
        </div>
      </div>
    </div>
  </div>
  <div style="padding:16px 40px;border-top:1px solid #27272a;font-size:10px;color:#52525b;display:flex;justify-content:space-between;">
    <span>${f.preparedBy} — v${f.version}</span>
    <span>${SITE_URL}</span>
  </div>
</div>`;
}

function cover6(f: ReportFields) {
  return `<div style="width:100%;aspect-ratio:210/297;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;">
  <div style="height:80px;background:linear-gradient(90deg,#22c55e,#eab308,#f97316,#ef4444,#dc2626);position:relative;">
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent,#0c0c0e);"></div>
    <div style="position:absolute;bottom:10px;left:40px;font-size:9px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:3px;">RISK ANALYSIS</div>
  </div>
  <div style="flex:1;padding:20px 40px;display:flex;flex-direction:column;justify-content:center;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
      <img src="${LOGO_URL}" alt="STBCS" width="40" height="40" style="border-radius:8px;" />
      <div>
        <div style="font-size:14px;font-weight:800;color:#ffffff;letter-spacing:2px;">STB CYBERSECURITY</div>
        <div style="font-size:9px;color:#52525b;letter-spacing:2px;">RISK MANAGEMENT</div>
      </div>
    </div>
    <div style="font-size:26px;font-weight:900;color:#ffffff;line-height:1.2;margin-bottom:12px;">${f.reportTitle}</div>
    <div style="font-size:13px;color:#a1a1aa;margin-bottom:24px;">Executive Risk Analysis — ${f.clientName}</div>
    <div style="margin-bottom:24px;">
      <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Risk Matrix Reference</div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:2px;">
        ${[
          '#22c55e','#22c55e','#eab308','#f97316','#ef4444',
          '#22c55e','#eab308','#eab308','#f97316','#ef4444',
          '#eab308','#eab308','#f97316','#f97316','#dc2626',
          '#eab308','#f97316','#f97316','#ef4444','#dc2626',
          '#f97316','#f97316','#ef4444','#dc2626','#dc2626',
        ].map((c, i) => `<div style="aspect-ratio:1;background:${c};opacity:0.25;border-radius:2px;"></div>`).join('')}
      </div>
    </div>
    <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:16px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:11px;">
        <div><span style="color:#52525b;">Report #:</span> <span style="color:#d4d4d8;">${f.reportNumber}</span></div>
        <div><span style="color:#52525b;">Date:</span> <span style="color:#d4d4d8;">${f.reportDate}</span></div>
        <div><span style="color:#52525b;">Classification:</span> <span style="color:${classificationColor(f.classificationLevel)};font-weight:700;">${f.classificationLevel}</span></div>
        <div><span style="color:#52525b;">Version:</span> <span style="color:#d4d4d8;">${f.version}</span></div>
      </div>
    </div>
  </div>
  <div style="padding:16px 40px;border-top:1px solid #27272a;font-size:10px;color:#52525b;display:flex;justify-content:space-between;">
    <span>${f.preparedBy}</span>
    <span>${SITE_URL}</span>
  </div>
</div>`;
}

const covers = [
  { id: 1, name: "Security Assessment", desc: "Dark cover with shield, orange title bar, classification badge", render: cover1 },
  { id: 2, name: "Penetration Test", desc: "Red/orange theme, target crosshair motif, AUTHORIZED stamp", render: cover2 },
  { id: 3, name: "Threat Report", desc: "Dark with threat level indicator, intelligence brief layout", render: cover3 },
  { id: 4, name: "Compliance Audit", desc: "Professional/formal, checklist motif, compliance status indicators", render: cover4 },
  { id: 5, name: "Incident Report", desc: "Urgent styling, severity indicator, timeline reference", render: cover5 },
  { id: 6, name: "Risk Analysis", desc: "Heat map gradient header, risk matrix reference", render: cover6 },
];

export default function ReportCovers() {
  const [fields, setFields] = useState<ReportFields>(defaultFields);
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState<number | null>(null);
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const active = covers[activeIdx];

  function handleCopy(idx: number) {
    const html = covers[idx].render(fields);
    function fallbackCopy() {
      const ta = document.createElement("textarea");
      ta.value = html;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(idx);
      toast({ title: "HTML copied!", description: "Paste the HTML into your document editor." });
      setTimeout(() => setCopied(null), 2500);
    }
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      const blob = new Blob([html], { type: "text/html" });
      const plainBlob = new Blob([html], { type: "text/plain" });
      navigator.clipboard.write([new ClipboardItem({ "text/html": blob, "text/plain": plainBlob })]).then(() => {
        setCopied(idx);
        toast({ title: "Cover copied!", description: "Paste into your document editor." });
        setTimeout(() => setCopied(null), 2500);
      }).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  function handlePrint() {
    window.print();
  }

  const prev = () => setActiveIdx(i => (i - 1 + covers.length) % covers.length);
  const next = () => setActiveIdx(i => (i + 1) % covers.length);

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/brand-kit" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-orange-400 text-sm mb-6 transition-colors" data-testid="link-back-brand-kit">
          <ArrowLeft className="h-4 w-4" /> Back to Brand Kit
        </Link>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <FileSearch className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wider" data-testid="text-page-title">
              REPORT COVERS
            </h1>
          </div>
          <p className="text-zinc-400 text-sm">Professional cover pages for security reports and assessments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/80 border-zinc-800 p-5 lg:col-span-1">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-orange-500" />
              Customize Fields
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-zinc-400 text-xs">Report Title</Label>
                <Input data-testid="input-report-title" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.reportTitle} onChange={e => setFields(p => ({ ...p, reportTitle: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Client Name</Label>
                <Input data-testid="input-client-name" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.clientName} onChange={e => setFields(p => ({ ...p, clientName: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Report Date</Label>
                <Input data-testid="input-report-date" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.reportDate} onChange={e => setFields(p => ({ ...p, reportDate: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Classification Level</Label>
                <select
                  data-testid="select-classification"
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm"
                  value={fields.classificationLevel}
                  onChange={e => setFields(p => ({ ...p, classificationLevel: e.target.value }))}
                >
                  {classificationLevels.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Report Number</Label>
                <Input data-testid="input-report-number" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.reportNumber} onChange={e => setFields(p => ({ ...p, reportNumber: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Prepared By</Label>
                <Input data-testid="input-prepared-by" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.preparedBy} onChange={e => setFields(p => ({ ...p, preparedBy: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Version</Label>
                <Input data-testid="input-version" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.version} onChange={e => setFields(p => ({ ...p, version: e.target.value }))} />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800">
              <h4 className="text-zinc-400 text-xs font-semibold mb-3 uppercase tracking-wider">All Styles</h4>
              <div className="space-y-2">
                {covers.map((s, i) => (
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
                <p className="text-zinc-500 text-xs">{activeIdx + 1} of {covers.length}</p>
              </div>
              <Button variant="outline" size="sm" onClick={next} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" data-testid="button-next">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <Card className="bg-zinc-900/80 border-zinc-800 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-zinc-500 text-xs flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Live Preview (A4)
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

              <div className="bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden max-w-md mx-auto">
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
                    <li>Fill in report details on the left</li>
                    <li>Select a classification level from the dropdown</li>
                    <li>Browse cover styles using the arrows or style list</li>
                    <li>Click "Copy HTML" or use "Print / PDF" to save</li>
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