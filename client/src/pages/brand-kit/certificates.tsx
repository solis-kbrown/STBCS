import { useState, useRef } from "react";
import { Award, Copy, Check, ChevronLeft, ChevronRight, Eye, Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const SITE_URL = "https://www.stbcybersecurity.com";
const LOGO_URL = `${SITE_URL}/brand/icon-shield.png`;

interface CertFields {
  recipientName: string;
  certTitle: string;
  description: string;
  issueDate: string;
  certNumber: string;
  issuedBy: string;
  company: string;
}

const defaultFields: CertFields = {
  recipientName: "John Smith",
  certTitle: "Certified Threat Analyst",
  description: "Has successfully completed the STB Cybersecurity Threat Analysis certification program",
  issueDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  certNumber: "CERT-2026-001",
  issuedBy: "Director of Operations",
  company: "STB Cybersecurity",
};

function cert1(f: CertFields) {
  return `<div style="width:100%;aspect-ratio:4/3;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;">
  <div style="position:absolute;inset:8px;border:2px solid #f9731640;border-radius:12px;"></div>
  <div style="position:absolute;inset:14px;border:1px solid #f9731620;border-radius:10px;"></div>
  <div style="position:absolute;top:8px;left:50%;transform:translateX(-50);width:60px;height:3px;background:#f97316;border-radius:2px;"></div>
  <div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:60px;height:3px;background:#f97316;border-radius:2px;"></div>
  <img src="${LOGO_URL}" alt="STB Cybersecurity certification seal" width="48" height="48" loading="lazy" style="border-radius:10px;margin-bottom:12px;" />
  <div style="font-size:9px;color:#f97316;text-transform:uppercase;letter-spacing:4px;margin-bottom:6px;">Certificate of</div>
  <div style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;">Achievement</div>
  <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,#f97316,transparent);margin-bottom:16px;"></div>
  <div style="font-size:11px;color:#a1a1aa;margin-bottom:6px;">This certificate is proudly presented to</div>
  <div style="font-size:22px;font-weight:700;color:#f97316;margin-bottom:6px;font-style:italic;">${f.recipientName}</div>
  <div style="width:180px;height:1px;background:#27272a;margin-bottom:16px;"></div>
  <div style="font-size:14px;font-weight:700;color:#e4e4e7;margin-bottom:8px;">${f.certTitle}</div>
  <div style="font-size:11px;color:#71717a;text-align:center;max-width:380px;line-height:1.6;margin-bottom:20px;">${f.description}</div>
  <div style="display:flex;align-items:flex-end;gap:60px;margin-bottom:16px;">
    <div style="text-align:center;">
      <div style="width:120px;border-bottom:1px solid #52525b;padding-bottom:4px;font-size:11px;color:#a1a1aa;">${f.issuedBy}</div>
      <div style="font-size:8px;color:#52525b;margin-top:4px;text-transform:uppercase;letter-spacing:1px;">Authorized Signature</div>
    </div>
    <div style="width:50px;height:50px;border:2px solid #f97316;border-radius:50%;display:flex;align-items:center;justify-content:center;">
      <div style="width:36px;height:36px;border:1px solid #f9731660;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;color:#f97316;font-weight:700;letter-spacing:1px;">SEAL</div>
    </div>
    <div style="text-align:center;">
      <div style="width:120px;border-bottom:1px solid #52525b;padding-bottom:4px;font-size:11px;color:#a1a1aa;">${f.issueDate}</div>
      <div style="font-size:8px;color:#52525b;margin-top:4px;text-transform:uppercase;letter-spacing:1px;">Date of Issue</div>
    </div>
  </div>
  <div style="font-size:8px;color:#3f3f46;letter-spacing:1px;">${f.certNumber} — ${f.company}</div>
</div>`;
}

function cert2(f: CertFields) {
  return `<div style="width:100%;aspect-ratio:4/3;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;padding:32px;">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity certification seal" width="36" height="36" loading="lazy" style="border-radius:8px;" />
    <div>
      <div style="font-size:12px;font-weight:800;color:#ffffff;letter-spacing:2px;">${f.company.toUpperCase()}</div>
      <div style="font-size:8px;color:#52525b;letter-spacing:2px;">TRAINING DIVISION</div>
    </div>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
    <div style="font-size:9px;color:#f97316;text-transform:uppercase;letter-spacing:3px;margin-bottom:8px;">Course Completion Certificate</div>
    <div style="font-size:20px;font-weight:900;color:#ffffff;margin-bottom:4px;">${f.certTitle}</div>
    <div style="font-size:12px;color:#a1a1aa;margin-bottom:16px;">Awarded to <span style="color:#f97316;font-weight:700;">${f.recipientName}</span></div>
    <div style="font-size:10px;color:#71717a;line-height:1.5;margin-bottom:16px;">${f.description}</div>
    <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:14px;margin-bottom:16px;">
      <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Course Modules Completed</div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${['Threat Landscape Fundamentals', 'Malware Analysis Techniques', 'Incident Response Procedures', 'Advanced Threat Hunting'].map((m, i) => `<div style="display:flex;align-items:center;gap:6px;">
          <div style="width:14px;height:14px;border-radius:3px;background:#22c55e20;display:flex;align-items:center;justify-content:center;font-size:8px;color:#22c55e;">✓</div>
          <div style="font-size:10px;color:#d4d4d8;">${m}</div>
        </div>`).join('')}
      </div>
      <div style="margin-top:10px;">
        <div style="font-size:8px;color:#52525b;margin-bottom:4px;">PROGRESS</div>
        <div style="height:6px;background:#27272a;border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:100%;background:linear-gradient(90deg,#f97316,#22c55e);border-radius:3px;"></div>
        </div>
        <div style="font-size:8px;color:#22c55e;text-align:right;margin-top:2px;">100% Complete — 40 Hours</div>
      </div>
    </div>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid #27272a;padding-top:12px;">
    <div>
      <div style="font-size:10px;color:#a1a1aa;">${f.issuedBy}</div>
      <div style="font-size:8px;color:#52525b;">Authorized Instructor</div>
    </div>
    <div style="font-size:8px;color:#3f3f46;">${f.certNumber}</div>
    <div style="text-align:right;">
      <div style="font-size:10px;color:#a1a1aa;">${f.issueDate}</div>
      <div style="font-size:8px;color:#52525b;">Date Issued</div>
    </div>
  </div>
</div>`;
}

function cert3(f: CertFields) {
  return `<div style="width:100%;aspect-ratio:4/3;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;">
  <div style="width:140px;background:linear-gradient(180deg,#f97316,#ea580c);display:flex;flex-direction:column;align-items:center;padding:24px 12px;gap:12px;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity certification seal" width="48" height="48" loading="lazy" style="border-radius:10px;" />
    <div style="font-size:8px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:2px;text-align:center;text-transform:uppercase;">${f.company}</div>
    <div style="flex:1;"></div>
    <div style="width:80px;height:100px;background:rgba(0,0,0,0.2);border-radius:6px;display:flex;align-items:center;justify-content:center;">
      <div style="font-size:8px;color:rgba(255,255,255,0.5);text-align:center;text-transform:uppercase;letter-spacing:1px;">ID<br/>Photo</div>
    </div>
    <div style="flex:1;"></div>
    <div style="width:60px;height:30px;display:flex;flex-direction:column;justify-content:center;gap:2px;">
      ${Array(8).fill(0).map((_, i) => `<div style="height:2px;background:rgba(0,0,0,${i % 2 === 0 ? '0.4' : '0.2'});width:${60 + Math.sin(i) * 10}px;"></div>`).join('')}
    </div>
    <div style="font-size:6px;color:rgba(255,255,255,0.4);letter-spacing:1px;">${f.certNumber}</div>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;padding:28px 32px;">
    <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:3px;margin-bottom:6px;">Security Clearance</div>
    <div style="font-size:20px;font-weight:900;color:#ffffff;margin-bottom:16px;">${f.certTitle}</div>
    <div style="display:inline-block;background:#22c55e;color:#ffffff;font-size:10px;font-weight:700;padding:4px 12px;border-radius:4px;letter-spacing:2px;margin-bottom:16px;align-self:flex-start;">ACCESS GRANTED</div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:11px;margin-bottom:16px;">
        <div style="background:#18181b;border:1px solid #27272a;border-radius:6px;padding:10px;">
          <div style="color:#52525b;font-size:8px;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Holder</div>
          <div style="color:#d4d4d8;font-weight:600;">${f.recipientName}</div>
        </div>
        <div style="background:#18181b;border:1px solid #27272a;border-radius:6px;padding:10px;">
          <div style="color:#52525b;font-size:8px;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Clearance Level</div>
          <div style="color:#f97316;font-weight:700;">LEVEL 4 — TOP SECRET</div>
        </div>
        <div style="background:#18181b;border:1px solid #27272a;border-radius:6px;padding:10px;">
          <div style="color:#52525b;font-size:8px;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Valid From</div>
          <div style="color:#d4d4d8;">${f.issueDate}</div>
        </div>
        <div style="background:#18181b;border:1px solid #27272a;border-radius:6px;padding:10px;">
          <div style="color:#52525b;font-size:8px;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Cert #</div>
          <div style="color:#d4d4d8;">${f.certNumber}</div>
        </div>
      </div>
      <div style="font-size:10px;color:#71717a;line-height:1.5;">${f.description}</div>
    </div>
    <div style="border-top:1px solid #27272a;padding-top:10px;display:flex;justify-content:space-between;font-size:9px;color:#52525b;">
      <span>Authorized by: ${f.issuedBy}</span>
      <span>${SITE_URL}</span>
    </div>
  </div>
</div>`;
}

function cert4(f: CertFields) {
  return `<div style="width:100%;aspect-ratio:4/3;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;align-items:center;padding:32px;">
  <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#f97316,#22c55e,#3b82f6,#f97316);"></div>
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity certification seal" width="32" height="32" loading="lazy" style="border-radius:6px;" />
    <div style="font-size:10px;font-weight:700;color:#f97316;letter-spacing:2px;">${f.company.toUpperCase()} CTF</div>
  </div>
  <div style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:2px;margin-bottom:4px;">🏆 CTF CHAMPION</div>
  <div style="font-size:10px;color:#52525b;letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;">Capture The Flag Competition</div>
  <div style="font-size:18px;font-weight:700;color:#f97316;margin-bottom:4px;">${f.recipientName}</div>
  <div style="font-size:12px;color:#a1a1aa;margin-bottom:16px;">${f.certTitle}</div>
  <div style="display:flex;gap:12px;margin-bottom:20px;">
    <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:12px 20px;text-align:center;">
      <div style="font-size:20px;font-weight:900;color:#f97316;">1st</div>
      <div style="font-size:8px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Rank</div>
    </div>
    <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:12px 20px;text-align:center;">
      <div style="font-size:20px;font-weight:900;color:#22c55e;">15</div>
      <div style="font-size:8px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Flags</div>
    </div>
    <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:12px 20px;text-align:center;">
      <div style="font-size:20px;font-weight:900;color:#3b82f6;">4850</div>
      <div style="font-size:8px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Points</div>
    </div>
    <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:12px 20px;text-align:center;">
      <div style="font-size:20px;font-weight:900;color:#a855f7;">48h</div>
      <div style="font-size:8px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Duration</div>
    </div>
  </div>
  <div style="font-size:10px;color:#71717a;text-align:center;max-width:380px;line-height:1.5;margin-bottom:16px;">${f.description}</div>
  <div style="display:flex;gap:6px;margin-bottom:16px;">
    ${['Web', 'Crypto', 'Pwn', 'Rev', 'Forensics'].map(c => `<div style="background:#27272a;color:#a1a1aa;font-size:8px;padding:3px 8px;border-radius:10px;font-weight:600;">${c}</div>`).join('')}
  </div>
  <div style="display:flex;align-items:center;gap:20px;font-size:9px;color:#52525b;">
    <span>${f.certNumber}</span>
    <span>•</span>
    <span>${f.issueDate}</span>
    <span>•</span>
    <span>${f.issuedBy}</span>
  </div>
</div>`;
}

function cert5(f: CertFields) {
  return `<div style="width:100%;aspect-ratio:4/3;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;padding:40px;">
  <div style="width:280px;height:280px;border-radius:50%;border:3px solid #f97316;display:flex;align-items:center;justify-content:center;position:relative;">
    <div style="width:250px;height:250px;border-radius:50%;border:1px solid #f9731640;display:flex;align-items:center;justify-content:center;">
      <div style="width:220px;height:220px;border-radius:50%;background:#18181b;border:2px solid #27272a;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;text-align:center;">
        <img src="${LOGO_URL}" alt="STB Cybersecurity certification seal" width="32" height="32" loading="lazy" style="border-radius:6px;margin-bottom:8px;" />
        <div style="font-size:8px;color:#f97316;text-transform:uppercase;letter-spacing:3px;margin-bottom:4px;">SOC Analyst</div>
        <div style="font-size:14px;font-weight:900;color:#ffffff;margin-bottom:4px;">${f.recipientName}</div>
        <div style="font-size:10px;color:#a1a1aa;margin-bottom:8px;">${f.certTitle}</div>
        <div style="display:flex;gap:4px;margin-bottom:8px;">
          ${[1,2,3].map(i => `<div style="width:8px;height:8px;background:#f97316;border-radius:50%;"></div>`).join('')}
          ${[4,5].map(i => `<div style="width:8px;height:8px;background:#27272a;border-radius:50%;border:1px solid #52525b;"></div>`).join('')}
        </div>
        <div style="font-size:8px;color:#52525b;">TIER 3 ANALYST</div>
        <div style="font-size:8px;color:#52525b;margin-top:6px;">${f.issueDate}</div>
      </div>
    </div>
    <div style="position:absolute;top:-8px;background:#0c0c0e;padding:0 8px;">
      <div style="font-size:7px;color:#52525b;letter-spacing:2px;text-transform:uppercase;">${f.company}</div>
    </div>
    <div style="position:absolute;bottom:-8px;background:#0c0c0e;padding:0 8px;">
      <div style="font-size:7px;color:#52525b;letter-spacing:2px;">${f.certNumber}</div>
    </div>
  </div>
  <div style="position:absolute;bottom:20px;right:24px;text-align:right;">
    <div style="width:60px;height:60px;border:1px dashed #27272a;border-radius:6px;display:flex;align-items:center;justify-content:center;">
      <div style="font-size:7px;color:#3f3f46;text-align:center;">QR<br/>Code</div>
    </div>
    <div style="font-size:7px;color:#3f3f46;margin-top:4px;">Verify at ${SITE_URL}</div>
  </div>
  <div style="position:absolute;bottom:20px;left:24px;font-size:8px;color:#3f3f46;">
    <div>Issued by: ${f.issuedBy}</div>
  </div>
</div>`;
}

function cert6(f: CertFields) {
  return `<div style="width:100%;aspect-ratio:4/3;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;padding:32px;">
  <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#ef4444,#f97316);"></div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
    <div style="display:flex;align-items:center;gap:8px;">
      <img src="${LOGO_URL}" alt="STB Cybersecurity certification seal" width="32" height="32" loading="lazy" style="border-radius:6px;" />
      <div style="font-size:10px;font-weight:700;color:#ffffff;letter-spacing:2px;">${f.company.toUpperCase()}</div>
    </div>
    <div style="background:#ef444420;border:1px solid #ef444440;color:#ef4444;font-size:8px;font-weight:700;padding:3px 10px;border-radius:4px;letter-spacing:2px;">INCIDENT RESPONSE</div>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
    <div style="font-size:9px;color:#f97316;text-transform:uppercase;letter-spacing:3px;margin-bottom:8px;">Certification of Competency</div>
    <div style="font-size:20px;font-weight:900;color:#ffffff;margin-bottom:6px;">${f.certTitle}</div>
    <div style="font-size:12px;color:#a1a1aa;margin-bottom:16px;">Awarded to <span style="color:#f97316;font-weight:700;">${f.recipientName}</span></div>
    <div style="font-size:10px;color:#71717a;line-height:1.5;margin-bottom:16px;">${f.description}</div>
    <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:14px;">
      <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Severity Levels Mastered</div>
      <div style="display:flex;gap:8px;">
        ${[
          { label: 'P1 Critical', color: '#ef4444' },
          { label: 'P2 High', color: '#f97316' },
          { label: 'P3 Medium', color: '#eab308' },
          { label: 'P4 Low', color: '#22c55e' },
        ].map(s => `<div style="flex:1;text-align:center;padding:8px;background:${s.color}15;border:1px solid ${s.color}30;border-radius:6px;">
          <div style="font-size:12px;color:${s.color};font-weight:700;">✓</div>
          <div style="font-size:7px;color:${s.color};margin-top:2px;">${s.label}</div>
        </div>`).join('')}
      </div>
      <div style="margin-top:10px;display:flex;gap:8px;">
        <div style="flex:1;background:#27272a;border-radius:4px;padding:8px;text-align:center;">
          <div style="font-size:14px;font-weight:700;color:#f97316;">< 15min</div>
          <div style="font-size:7px;color:#52525b;text-transform:uppercase;">Avg Response Time</div>
        </div>
        <div style="flex:1;background:#27272a;border-radius:4px;padding:8px;text-align:center;">
          <div style="font-size:14px;font-weight:700;color:#22c55e;">99.2%</div>
          <div style="font-size:7px;color:#52525b;text-transform:uppercase;">Resolution Rate</div>
        </div>
        <div style="flex:1;background:#27272a;border-radius:4px;padding:8px;text-align:center;">
          <div style="font-size:14px;font-weight:700;color:#3b82f6;">240+</div>
          <div style="font-size:7px;color:#52525b;text-transform:uppercase;">Incidents Handled</div>
        </div>
      </div>
    </div>
  </div>
  <div style="border-top:1px solid #27272a;padding-top:10px;display:flex;justify-content:space-between;font-size:9px;color:#52525b;">
    <span>${f.issuedBy} — ${f.issueDate}</span>
    <span>${f.certNumber}</span>
  </div>
</div>`;
}

function cert7(f: CertFields) {
  return `<div style="width:100%;aspect-ratio:4/3;background:#ffffff;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;padding:32px;color:#18181b;">
  <div style="position:absolute;top:0;left:0;right:0;height:4px;background:#f97316;"></div>
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity certification seal" width="36" height="36" loading="lazy" style="border-radius:8px;" />
    <div>
      <div style="font-size:12px;font-weight:800;color:#18181b;letter-spacing:2px;">${f.company.toUpperCase()}</div>
      <div style="font-size:8px;color:#71717a;letter-spacing:2px;">COMPLIANCE DIVISION</div>
    </div>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
    <div style="font-size:9px;color:#f97316;text-transform:uppercase;letter-spacing:3px;margin-bottom:8px;">Compliance Certification</div>
    <div style="font-size:20px;font-weight:900;color:#18181b;margin-bottom:6px;">${f.certTitle}</div>
    <div style="font-size:12px;color:#71717a;margin-bottom:16px;">Certified: <span style="color:#18181b;font-weight:700;">${f.recipientName}</span></div>
    <div style="font-size:10px;color:#71717a;line-height:1.5;margin-bottom:16px;">${f.description}</div>
    <div style="background:#f4f4f5;border:1px solid #e4e4e7;border-radius:8px;padding:14px;margin-bottom:16px;">
      <div style="font-size:9px;color:#71717a;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Frameworks Covered</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
        ${['SOC 2 Type II', 'ISO 27001', 'NIST CSF', 'PCI DSS', 'HIPAA', 'GDPR'].map(fw => `<div style="display:flex;align-items:center;gap:6px;font-size:10px;">
          <div style="width:14px;height:14px;border-radius:3px;background:#22c55e15;border:1px solid #22c55e30;display:flex;align-items:center;justify-content:center;font-size:8px;color:#22c55e;">✓</div>
          <span style="color:#18181b;">${fw}</span>
        </div>`).join('')}
      </div>
    </div>
  </div>
  <div style="border-top:2px solid #f97316;padding-top:10px;display:flex;justify-content:space-between;align-items:flex-end;">
    <div>
      <div style="font-size:10px;color:#18181b;">${f.issuedBy}</div>
      <div style="font-size:8px;color:#71717a;">Compliance Officer</div>
    </div>
    <div style="font-size:8px;color:#71717a;">${f.certNumber}</div>
    <div style="text-align:right;">
      <div style="font-size:10px;color:#18181b;">${f.issueDate}</div>
      <div style="font-size:8px;color:#71717a;">Date of Certification</div>
    </div>
  </div>
</div>`;
}

function cert8(f: CertFields) {
  return `<div style="width:100%;aspect-ratio:4/3;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;">
  <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#dc2626,#f97316,#dc2626);"></div>
  <div style="position:absolute;top:20px;right:20px;border:2px solid #dc2626;border-radius:50%;width:60px;height:60px;display:flex;align-items:center;justify-content:center;transform:rotate(-15deg);">
    <div style="font-size:7px;font-weight:900;color:#dc2626;text-align:center;letter-spacing:1px;line-height:1.3;">AUTHORIZED<br/>TESTER</div>
  </div>
  <div style="position:relative;width:80px;height:80px;margin-bottom:16px;">
    <div style="position:absolute;inset:0;border:2px solid #dc2626;border-radius:50%;"></div>
    <div style="position:absolute;inset:6px;border:1px solid #dc262660;border-radius:50%;display:flex;align-items:center;justify-content:center;">
      <img src="${LOGO_URL}" alt="STB Cybersecurity certification seal" width="40" height="40" loading="lazy" style="border-radius:8px;" />
    </div>
  </div>
  <div style="font-size:8px;color:#dc2626;text-transform:uppercase;letter-spacing:4px;margin-bottom:4px;">Certified</div>
  <div style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:2px;margin-bottom:4px;">ETHICAL HACKER</div>
  <div style="font-size:9px;color:#52525b;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;">Authorized Penetration Tester</div>
  <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,#dc2626,transparent);margin-bottom:16px;"></div>
  <div style="font-size:18px;font-weight:700;color:#dc2626;margin-bottom:4px;">${f.recipientName}</div>
  <div style="font-size:11px;color:#a1a1aa;margin-bottom:8px;">${f.certTitle}</div>
  <div style="font-size:10px;color:#71717a;text-align:center;max-width:360px;line-height:1.5;margin-bottom:20px;">${f.description}</div>
  <div style="display:flex;gap:8px;margin-bottom:16px;">
    ${['Network Pen Testing', 'Web App Security', 'Social Engineering', 'Red Teaming'].map(s => `<div style="background:#dc262615;border:1px solid #dc262630;color:#dc2626;font-size:7px;padding:3px 8px;border-radius:4px;font-weight:600;">${s}</div>`).join('')}
  </div>
  <div style="display:flex;align-items:center;gap:20px;font-size:9px;color:#52525b;">
    <span>${f.certNumber}</span>
    <span>•</span>
    <span>${f.issueDate}</span>
    <span>•</span>
    <span>${f.issuedBy}</span>
  </div>
  <div style="position:absolute;bottom:12px;font-size:7px;color:#3f3f46;">${f.company} — ${SITE_URL}</div>
</div>`;
}

const certificates = [
  { id: 1, name: "Achievement Award", desc: "Classic certificate with ornate border, gold/orange seal, formal typography", render: cert1 },
  { id: 2, name: "Course Completion", desc: "Training completion cert, course modules, progress bar, hours completed", render: cert2 },
  { id: 3, name: "Security Clearance", desc: "Clearance badge/card style, ID photo placeholder, ACCESS GRANTED", render: cert3 },
  { id: 4, name: "CTF Champion", desc: "Capture The Flag winner, trophy, rank/score/flags, gaming aesthetic", render: cert4 },
  { id: 5, name: "SOC Analyst Badge", desc: "Circular badge design, analyst tier/rank, QR verification placeholder", render: cert5 },
  { id: 6, name: "Incident Handler", desc: "Emergency response cert, severity levels mastered, response time stats", render: cert6 },
  { id: 7, name: "Compliance Officer", desc: "Regulatory compliance cert, frameworks (SOC2, ISO27001, etc.), formal", render: cert7 },
  { id: 8, name: "Ethical Hacker", desc: "Dark aggressive design, AUTHORIZED PENETRATION TESTER, red accent", render: cert8 },
];

export default function Certificates() {
  const [fields, setFields] = useState<CertFields>(defaultFields);
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState<number | null>(null);
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const active = certificates[activeIdx];

  function handleCopy(idx: number) {
    const html = certificates[idx].render(fields);
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
        toast({ title: "Certificate copied!", description: "Paste into your document editor." });
        setTimeout(() => setCopied(null), 2500);
      }).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  function handlePrint() {
    window.print();
  }

  const prev = () => setActiveIdx(i => (i - 1 + certificates.length) % certificates.length);
  const next = () => setActiveIdx(i => (i + 1) % certificates.length);

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/brand-kit" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-orange-400 text-sm mb-6 transition-colors" data-testid="link-back-brand-kit">
          <ArrowLeft className="h-4 w-4" /> Back to Brand Kit
        </Link>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Award className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wider" data-testid="text-page-title">
              CERTIFICATE TEMPLATES
            </h1>
          </div>
          <p className="text-zinc-400 text-sm">Awards, badges, and certification templates for training and achievements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/80 border-zinc-800 p-5 lg:col-span-1">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-orange-500" />
              Customize Fields
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-zinc-400 text-xs">Recipient Name</Label>
                <Input data-testid="input-recipient-name" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.recipientName} onChange={e => setFields(p => ({ ...p, recipientName: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Certificate Title</Label>
                <Input data-testid="input-cert-title" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.certTitle} onChange={e => setFields(p => ({ ...p, certTitle: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Description</Label>
                <Input data-testid="input-description" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.description} onChange={e => setFields(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Issue Date</Label>
                <Input data-testid="input-issue-date" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.issueDate} onChange={e => setFields(p => ({ ...p, issueDate: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Certificate Number</Label>
                <Input data-testid="input-cert-number" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.certNumber} onChange={e => setFields(p => ({ ...p, certNumber: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Issued By</Label>
                <Input data-testid="input-issued-by" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.issuedBy} onChange={e => setFields(p => ({ ...p, issuedBy: e.target.value }))} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Company</Label>
                <Input data-testid="input-company" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={fields.company} onChange={e => setFields(p => ({ ...p, company: e.target.value }))} />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800">
              <h4 className="text-zinc-400 text-xs font-semibold mb-3 uppercase tracking-wider">All Styles</h4>
              <div className="space-y-2">
                {certificates.map((s, i) => (
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
                <p className="text-zinc-500 text-xs">{activeIdx + 1} of {certificates.length}</p>
              </div>
              <Button variant="outline" size="sm" onClick={next} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" data-testid="button-next">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <Card className="bg-zinc-900/80 border-zinc-800 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-zinc-500 text-xs flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Live Preview (4:3)
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

              <div className="bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden max-w-lg mx-auto">
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
                    <li>Fill in recipient details and certificate information on the left</li>
                    <li>Browse certificate styles using the arrows or style list</li>
                    <li>Click "Copy HTML" or use "Print / PDF" to save</li>
                    <li>Customize the certificate for awards, training, or clearances</li>
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