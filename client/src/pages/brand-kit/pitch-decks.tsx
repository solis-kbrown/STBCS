import { useState, useRef } from "react";
import { Shield, Copy, Check, ChevronLeft, ChevronRight, Presentation, Eye, Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const SITE_URL = "https://www.stbcybersecurity.com";
const LOGO_URL = `${SITE_URL}/brand/icon-shield.png`;

interface PitchFields {
  proposalTitle: string;
  clientName: string;
  date: string;
  preparedBy: string;
  company: string;
  projectScope: string;
}

const defaultFields: PitchFields = {
  proposalTitle: "Cybersecurity Partnership Proposal",
  clientName: "Acme Corporation",
  date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  preparedBy: "Your Name",
  company: "STB Cybersecurity",
  projectScope: "Comprehensive Security Assessment & Monitoring",
};

function pitch1(f: PitchFields) {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:60px 80px;">
  <div style="position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#f97316,#ea580c,#f97316);"></div>
  <div style="position:absolute;top:30px;right:40px;display:flex;align-items:center;gap:10px;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity pitch deck logo" width="32" height="32" loading="lazy" style="border-radius:6px;" />
    <span style="font-size:11px;color:#52525b;font-weight:700;letter-spacing:2px;">${f.company.toUpperCase()}</span>
  </div>
  <div style="font-size:12px;color:#f97316;text-transform:uppercase;letter-spacing:4px;font-weight:700;margin-bottom:16px;">PROPOSAL</div>
  <div style="font-size:36px;font-weight:900;color:#ffffff;line-height:1.15;max-width:80%;">${f.proposalTitle}</div>
  <div style="font-size:14px;color:#a1a1aa;margin-top:14px;max-width:65%;">${f.projectScope}</div>
  <div style="margin-top:40px;display:flex;gap:40px;font-size:11px;">
    <div><span style="color:#52525b;text-transform:uppercase;letter-spacing:1px;">Prepared for:</span><br/><span style="color:#e4e4e7;font-weight:600;font-size:14px;">${f.clientName}</span></div>
    <div><span style="color:#52525b;text-transform:uppercase;letter-spacing:1px;">Prepared by:</span><br/><span style="color:#e4e4e7;font-size:13px;">${f.preparedBy}</span></div>
    <div><span style="color:#52525b;text-transform:uppercase;letter-spacing:1px;">Date:</span><br/><span style="color:#e4e4e7;font-size:13px;">${f.date}</span></div>
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:#f97316;"></div>
</div>`;
}

function pitch2(f: PitchFields) {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:50px 70px;">
  <div style="position:absolute;inset:0;opacity:0.04;background-image:repeating-linear-gradient(0deg,transparent,transparent 24px,#f97316 24px,#f97316 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,#f97316 24px,#f97316 25px);"></div>
  <div style="position:absolute;top:16px;left:20px;font-size:9px;color:#52525b;letter-spacing:3px;">TOP SECRET // ${f.company.toUpperCase()}</div>
  <div style="position:absolute;top:16px;right:20px;display:flex;align-items:center;gap:6px;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity pitch deck logo" width="24" height="24" loading="lazy" style="border-radius:4px;" />
  </div>
  <div style="border-left:4px solid #f97316;padding-left:24px;">
    <div style="font-size:10px;color:#f97316;text-transform:uppercase;letter-spacing:4px;font-weight:700;margin-bottom:6px;">OPERATION:</div>
    <div style="font-size:30px;font-weight:900;color:#ffffff;line-height:1.2;">${f.proposalTitle}</div>
  </div>
  <div style="margin-top:30px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;max-width:80%;">
    <div style="background:#18181b;border:1px solid #27272a;padding:12px 16px;border-radius:6px;">
      <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;">TARGET</div>
      <div style="font-size:13px;color:#e4e4e7;margin-top:4px;font-weight:600;">${f.clientName}</div>
    </div>
    <div style="background:#18181b;border:1px solid #27272a;padding:12px 16px;border-radius:6px;">
      <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;">MISSION SCOPE</div>
      <div style="font-size:11px;color:#a1a1aa;margin-top:4px;">${f.projectScope}</div>
    </div>
    <div style="background:#18181b;border:1px solid #27272a;padding:12px 16px;border-radius:6px;">
      <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;">COMMANDER</div>
      <div style="font-size:13px;color:#e4e4e7;margin-top:4px;">${f.preparedBy}</div>
      <div style="font-size:10px;color:#52525b;margin-top:2px;">${f.date}</div>
    </div>
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:#f97316;"></div>
</div>`;
}

function pitch3(f: PitchFields) {
  return `<div style="width:100%;aspect-ratio:16/9;background:linear-gradient(135deg,#18181b 0%,#0c0c0e 100%);position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:50px;text-align:center;">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(249,115,22,0.06),transparent 70%);"></div>
  <div style="font-size:10px;color:#f97316;text-transform:uppercase;letter-spacing:6px;font-weight:700;margin-bottom:20px;position:relative;">STRATEGIC ALLIANCE</div>
  <div style="display:flex;align-items:center;gap:30px;margin-bottom:24px;position:relative;">
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:64px;height:64px;border-radius:16px;background:#27272a;border:2px solid #f97316;display:flex;align-items:center;justify-content:center;">
        <img src="${LOGO_URL}" alt="STB Cybersecurity pitch deck logo" width="40" height="40" loading="lazy" style="border-radius:8px;" />
      </div>
      <div style="font-size:11px;color:#e4e4e7;margin-top:8px;font-weight:600;">${f.company}</div>
    </div>
    <div style="font-size:24px;color:#f97316;font-weight:300;">&times;</div>
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:64px;height:64px;border-radius:16px;background:#27272a;border:2px solid #3f3f46;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:20px;color:#a1a1aa;font-weight:700;">${f.clientName.charAt(0)}</span>
      </div>
      <div style="font-size:11px;color:#e4e4e7;margin-top:8px;font-weight:600;">${f.clientName}</div>
    </div>
  </div>
  <div style="font-size:28px;font-weight:900;color:#ffffff;line-height:1.2;max-width:80%;position:relative;">${f.proposalTitle}</div>
  <div style="font-size:13px;color:#71717a;margin-top:10px;max-width:60%;position:relative;">${f.projectScope}</div>
  <div style="margin-top:24px;font-size:11px;color:#52525b;position:relative;">${f.preparedBy} &bull; ${f.date}</div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#f97316,#ea580c,#f97316);"></div>
</div>`;
}

function pitch4(f: PitchFields) {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:50px 70px;">
  <div style="position:absolute;inset:0;opacity:0.03;">
    <div style="position:absolute;top:20%;left:10%;width:200px;height:200px;border:1px solid #f97316;border-radius:50%;"></div>
    <div style="position:absolute;top:15%;left:7%;width:260px;height:260px;border:1px dashed #3f3f46;border-radius:50%;"></div>
    <div style="position:absolute;bottom:10%;right:5%;width:160px;height:160px;border:1px solid #27272a;border-radius:50%;"></div>
  </div>
  <div style="position:absolute;top:24px;left:30px;display:flex;align-items:center;gap:8px;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity pitch deck logo" width="28" height="28" loading="lazy" style="border-radius:6px;" />
    <span style="font-size:10px;color:#52525b;letter-spacing:2px;font-weight:600;">${f.company.toUpperCase()}</span>
  </div>
  <div style="font-size:10px;color:#f97316;text-transform:uppercase;letter-spacing:5px;font-weight:700;margin-bottom:12px;">NEXT-GEN SECURITY</div>
  <div style="font-size:34px;font-weight:900;color:#ffffff;line-height:1.15;max-width:75%;">${f.proposalTitle}</div>
  <div style="font-size:13px;color:#a1a1aa;margin-top:12px;max-width:55%;">${f.projectScope}</div>
  <div style="margin-top:32px;display:flex;gap:24px;">
    <div style="background:linear-gradient(135deg,#18181b,#27272a);border:1px solid #3f3f46;padding:10px 18px;border-radius:8px;">
      <div style="font-size:9px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Client</div>
      <div style="font-size:12px;color:#e4e4e7;font-weight:600;">${f.clientName}</div>
    </div>
    <div style="background:linear-gradient(135deg,#18181b,#27272a);border:1px solid #3f3f46;padding:10px 18px;border-radius:8px;">
      <div style="font-size:9px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">By</div>
      <div style="font-size:12px;color:#e4e4e7;">${f.preparedBy}</div>
    </div>
    <div style="background:linear-gradient(135deg,#18181b,#27272a);border:1px solid #3f3f46;padding:10px 18px;border-radius:8px;">
      <div style="font-size:9px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Date</div>
      <div style="font-size:12px;color:#e4e4e7;">${f.date}</div>
    </div>
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#f97316,transparent);"></div>
</div>`;
}

function pitch5(f: PitchFields) {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:50px 70px;">
  <div style="position:absolute;top:0;right:0;width:40%;height:100%;background:linear-gradient(180deg,rgba(249,115,22,0.08),rgba(234,88,12,0.03),transparent);"></div>
  <div style="position:absolute;top:24px;right:30px;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity pitch deck logo" width="32" height="32" loading="lazy" style="border-radius:6px;" />
  </div>
  <div style="font-size:10px;color:#f97316;text-transform:uppercase;letter-spacing:5px;font-weight:700;margin-bottom:12px;">YOUR RISK PROFILE</div>
  <div style="font-size:32px;font-weight:900;color:#ffffff;line-height:1.2;max-width:70%;">${f.proposalTitle}</div>
  <div style="font-size:13px;color:#71717a;margin-top:10px;max-width:50%;">${f.projectScope}</div>
  <div style="margin-top:28px;display:flex;gap:16px;">
    <div style="background:#18181b;border:1px solid #27272a;padding:14px 20px;border-radius:8px;min-width:80px;text-align:center;">
      <div style="font-size:22px;font-weight:900;color:#ef4444;">7.8</div>
      <div style="font-size:8px;color:#71717a;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Risk Score</div>
    </div>
    <div style="background:#18181b;border:1px solid #27272a;padding:14px 20px;border-radius:8px;min-width:80px;text-align:center;">
      <div style="font-size:22px;font-weight:900;color:#f97316;">24</div>
      <div style="font-size:8px;color:#71717a;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Findings</div>
    </div>
    <div style="background:#18181b;border:1px solid #27272a;padding:14px 20px;border-radius:8px;min-width:80px;text-align:center;">
      <div style="font-size:22px;font-weight:900;color:#22c55e;">92%</div>
      <div style="font-size:8px;color:#71717a;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Coverage</div>
    </div>
  </div>
  <div style="margin-top:24px;display:flex;gap:24px;font-size:11px;">
    <div><span style="color:#52525b;">Client:</span> <span style="color:#a1a1aa;">${f.clientName}</span></div>
    <div><span style="color:#52525b;">Analyst:</span> <span style="color:#a1a1aa;">${f.preparedBy}</span></div>
    <div><span style="color:#52525b;">Date:</span> <span style="color:#a1a1aa;">${f.date}</span></div>
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:#f97316;"></div>
</div>`;
}

function pitch6(f: PitchFields) {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:50px 70px;">
  <div style="position:absolute;inset:0;opacity:0.05;background-image:repeating-linear-gradient(90deg,transparent,transparent 60px,#3f3f46 60px,#3f3f46 61px);"></div>
  <div style="position:absolute;top:24px;left:30px;display:flex;align-items:center;gap:8px;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity pitch deck logo" width="28" height="28" loading="lazy" style="border-radius:6px;" />
    <span style="font-size:10px;color:#52525b;letter-spacing:2px;font-weight:600;">${f.company.toUpperCase()}</span>
  </div>
  <div style="font-size:10px;color:#f97316;text-transform:uppercase;letter-spacing:5px;font-weight:700;margin-bottom:12px;">COMPLIANCE ROADMAP</div>
  <div style="font-size:30px;font-weight:900;color:#ffffff;line-height:1.2;max-width:75%;">${f.proposalTitle}</div>
  <div style="font-size:13px;color:#71717a;margin-top:10px;max-width:55%;">${f.projectScope}</div>
  <div style="margin-top:28px;display:flex;gap:12px;align-items:center;">
    <div style="display:flex;align-items:center;gap:8px;background:#18181b;border:1px solid #27272a;padding:8px 14px;border-radius:6px;">
      <div style="width:16px;height:16px;border-radius:4px;background:#22c55e;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;">&#10003;</div>
      <span style="font-size:10px;color:#a1a1aa;">Assessment</span>
    </div>
    <div style="width:20px;height:2px;background:#3f3f46;"></div>
    <div style="display:flex;align-items:center;gap:8px;background:#18181b;border:1px solid #27272a;padding:8px 14px;border-radius:6px;">
      <div style="width:16px;height:16px;border-radius:4px;background:#f97316;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;">2</div>
      <span style="font-size:10px;color:#a1a1aa;">Remediation</span>
    </div>
    <div style="width:20px;height:2px;background:#3f3f46;"></div>
    <div style="display:flex;align-items:center;gap:8px;background:#18181b;border:1px solid #27272a;padding:8px 14px;border-radius:6px;">
      <div style="width:16px;height:16px;border-radius:4px;background:#3f3f46;display:flex;align-items:center;justify-content:center;font-size:10px;color:#71717a;">3</div>
      <span style="font-size:10px;color:#71717a;">Certification</span>
    </div>
    <div style="width:20px;height:2px;background:#3f3f46;"></div>
    <div style="display:flex;align-items:center;gap:8px;background:#18181b;border:1px solid #27272a;padding:8px 14px;border-radius:6px;">
      <div style="width:16px;height:16px;border-radius:4px;background:#3f3f46;display:flex;align-items:center;justify-content:center;font-size:10px;color:#71717a;">4</div>
      <span style="font-size:10px;color:#71717a;">Monitoring</span>
    </div>
  </div>
  <div style="margin-top:24px;display:flex;gap:24px;font-size:11px;">
    <div><span style="color:#52525b;">For:</span> <span style="color:#a1a1aa;">${f.clientName}</span></div>
    <div><span style="color:#52525b;">By:</span> <span style="color:#a1a1aa;">${f.preparedBy}</span></div>
    <div><span style="color:#52525b;">Date:</span> <span style="color:#a1a1aa;">${f.date}</span></div>
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:#f97316;"></div>
</div>`;
}

function pitch7(f: PitchFields) {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:50px;text-align:center;">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(249,115,22,0.05),transparent 60%);"></div>
  <div style="position:relative;width:220px;height:260px;margin-bottom:16px;">
    <div style="position:absolute;inset:0;clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);background:linear-gradient(180deg,#27272a,#18181b);border:2px solid #f97316;"></div>
    <div style="position:absolute;inset:4px;clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);background:#0c0c0e;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:30px;">
      <img src="${LOGO_URL}" alt="STB Cybersecurity pitch deck logo" width="40" height="40" loading="lazy" style="border-radius:8px;margin-bottom:12px;" />
      <div style="font-size:14px;font-weight:900;color:#ffffff;line-height:1.3;max-width:90%;">${f.proposalTitle}</div>
      <div style="font-size:9px;color:#71717a;margin-top:6px;">${f.projectScope}</div>
    </div>
  </div>
  <div style="font-size:14px;color:#e4e4e7;font-weight:600;position:relative;">Prepared for <span style="color:#f97316;">${f.clientName}</span></div>
  <div style="font-size:11px;color:#52525b;margin-top:6px;position:relative;">${f.preparedBy} &bull; ${f.company} &bull; ${f.date}</div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#f97316,#ea580c,#f97316);"></div>
</div>`;
}

function pitch8(f: PitchFields) {
  return `<div style="width:100%;aspect-ratio:16/9;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:50px 70px;">
  <div style="position:absolute;top:24px;right:30px;display:flex;align-items:center;gap:8px;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity pitch deck logo" width="28" height="28" loading="lazy" style="border-radius:6px;" />
    <span style="font-size:10px;color:#52525b;letter-spacing:2px;font-weight:600;">${f.company.toUpperCase()}</span>
  </div>
  <div style="font-size:10px;color:#f97316;text-transform:uppercase;letter-spacing:5px;font-weight:700;margin-bottom:12px;">SECURITY INVESTMENT ANALYSIS</div>
  <div style="font-size:30px;font-weight:900;color:#ffffff;line-height:1.2;max-width:70%;">${f.proposalTitle}</div>
  <div style="font-size:13px;color:#71717a;margin-top:10px;max-width:55%;">${f.projectScope}</div>
  <div style="margin-top:28px;display:flex;gap:16px;">
    <div style="background:#18181b;border:1px solid #27272a;padding:16px 22px;border-radius:8px;min-width:120px;">
      <div style="font-size:8px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Projected ROI</div>
      <div style="font-size:28px;font-weight:900;color:#22c55e;margin-top:4px;">340%</div>
      <div style="width:100%;height:4px;background:#27272a;border-radius:2px;margin-top:8px;overflow:hidden;">
        <div style="width:85%;height:100%;background:linear-gradient(90deg,#22c55e,#16a34a);border-radius:2px;"></div>
      </div>
    </div>
    <div style="background:#18181b;border:1px solid #27272a;padding:16px 22px;border-radius:8px;min-width:120px;">
      <div style="font-size:8px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Risk Reduction</div>
      <div style="font-size:28px;font-weight:900;color:#f97316;margin-top:4px;">78%</div>
      <div style="width:100%;height:4px;background:#27272a;border-radius:2px;margin-top:8px;overflow:hidden;">
        <div style="width:78%;height:100%;background:linear-gradient(90deg,#f97316,#ea580c);border-radius:2px;"></div>
      </div>
    </div>
    <div style="background:#18181b;border:1px solid #27272a;padding:16px 22px;border-radius:8px;min-width:120px;">
      <div style="font-size:8px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Annual Savings</div>
      <div style="font-size:28px;font-weight:900;color:#e4e4e7;margin-top:4px;">$2.4M</div>
      <div style="width:100%;height:4px;background:#27272a;border-radius:2px;margin-top:8px;overflow:hidden;">
        <div style="width:92%;height:100%;background:linear-gradient(90deg,#a1a1aa,#71717a);border-radius:2px;"></div>
      </div>
    </div>
  </div>
  <div style="margin-top:20px;display:flex;gap:24px;font-size:11px;">
    <div><span style="color:#52525b;">Client:</span> <span style="color:#a1a1aa;">${f.clientName}</span></div>
    <div><span style="color:#52525b;">Analyst:</span> <span style="color:#a1a1aa;">${f.preparedBy}</span></div>
    <div><span style="color:#52525b;">Date:</span> <span style="color:#a1a1aa;">${f.date}</span></div>
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:#f97316;"></div>
</div>`;
}

const pitchDecks = [
  { id: 1, name: "Executive Pitch", desc: "Clean, premium dark layout with large title and orange accents", render: pitch1 },
  { id: 2, name: "Battle Plan", desc: "Military operations briefing aesthetic with mission details grid", render: pitch2 },
  { id: 3, name: "Partnership", desc: "Two-shield collaborative design with strategic alliance motif", render: pitch3 },
  { id: 4, name: "Innovation Lab", desc: "Tech startup pitch feel with circuit patterns and futuristic layout", render: pitch4 },
  { id: 5, name: "Risk Briefing", desc: "Risk dashboard aesthetic with threat heat indicators", render: pitch5 },
  { id: 6, name: "Compliance Roadmap", desc: "Timeline/roadmap layout with compliance milestones", render: pitch6 },
  { id: 7, name: "Digital Shield", desc: "Large shield graphic with proposal info overlaid", render: pitch7 },
  { id: 8, name: "Cost-Benefit", desc: "ROI-focused with mock chart areas and investment analysis", render: pitch8 },
];

export default function PitchDecks() {
  const [fields, setFields] = useState<PitchFields>(defaultFields);
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState<number | null>(null);
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const active = pitchDecks[activeIdx];

  function handleCopy(idx: number) {
    const html = pitchDecks[idx].render(fields);
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
        toast({ title: "Pitch deck copied!", description: "Paste it into your presentation tool." });
        setTimeout(() => setCopied(null), 2500);
      }).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  function handlePrint() {
    window.print();
  }

  const prev = () => setActiveIdx(i => (i - 1 + pitchDecks.length) % pitchDecks.length);
  const next = () => setActiveIdx(i => (i + 1) % pitchDecks.length);

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/brand-kit" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-orange-400 text-sm mb-6 transition-colors" data-testid="link-back-brand-kit">
          <ArrowLeft className="h-4 w-4" /> Back to Brand Kit
        </Link>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Presentation className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wider" data-testid="text-page-title">
              PITCH DECK COVERS
            </h1>
          </div>
          <p className="text-zinc-400 text-sm">Proposal and pitch deck cover designs — 16:9 aspect ratio</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/80 border-zinc-800 p-5 lg:col-span-1">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Presentation className="h-4 w-4 text-orange-500" />
              Customize Fields
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-zinc-400 text-xs">Proposal Title</Label>
                <Input data-testid="input-proposal-title" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.proposalTitle} onChange={e => setFields(p => ({ ...p, proposalTitle: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Client Name</Label>
                <Input data-testid="input-client-name" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.clientName} onChange={e => setFields(p => ({ ...p, clientName: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Date</Label>
                <Input data-testid="input-date" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.date} onChange={e => setFields(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Prepared By</Label>
                <Input data-testid="input-prepared-by" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.preparedBy} onChange={e => setFields(p => ({ ...p, preparedBy: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Company</Label>
                <Input data-testid="input-company" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.company} onChange={e => setFields(p => ({ ...p, company: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Project Scope</Label>
                <Input data-testid="input-project-scope" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.projectScope} onChange={e => setFields(p => ({ ...p, projectScope: e.target.value }))} />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800">
              <h4 className="text-zinc-400 text-xs font-semibold mb-3 uppercase tracking-wider">All Styles</h4>
              <div className="space-y-2">
                {pitchDecks.map((s, i) => (
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
                <p className="text-zinc-500 text-xs">{activeIdx + 1} of {pitchDecks.length}</p>
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
                    data-testid="button-copy"
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
                    <li>Customize your proposal details on the left</li>
                    <li>Browse styles using the arrows or style list</li>
                    <li>Click "Copy HTML" to copy the pitch deck cover markup</li>
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
