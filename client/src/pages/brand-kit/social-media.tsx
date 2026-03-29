import { useState, useRef } from "react";
import { Shield, Copy, Check, ChevronLeft, ChevronRight, Eye, Zap, ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const SITE_URL = "https://www.stbcybersecurity.com";
const LOGO_URL = `${SITE_URL}/brand/icon-shield.png`;

interface BannerFields {
  companyName: string;
  tagline: string;
  subtitle: string;
  website: string;
}

const defaultFields: BannerFields = {
  companyName: "STB Cybersecurity",
  tagline: "Securing the Digital Frontier",
  subtitle: "Threat Intelligence | Monitoring | Incident Response",
  website: "stbcybersecurity.com",
};

function banner1(f: BannerFields) {
  return `<div style="width:100%;aspect-ratio:1500/500;background:#09090b;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;flex-direction:column;">
  <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#f97316,transparent);"></div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#f97316,transparent);"></div>
  <div style="position:absolute;left:50px;top:50%;transform:translateY(-50%);width:1px;height:60%;background:linear-gradient(180deg,transparent,#f97316 50%,transparent);"></div>
  <div style="position:absolute;right:50px;top:50%;transform:translateY(-50%);width:1px;height:60%;background:linear-gradient(180deg,transparent,#f97316 50%,transparent);"></div>
  <img src="${LOGO_URL}" alt="STB Cybersecurity social media banner logo" width="80" height="80" loading="lazy" style="border-radius:16px;margin-bottom:16px;border:2px solid #f97316;" />
  <div style="font-size:32px;font-weight:900;color:#ffffff;letter-spacing:6px;text-transform:uppercase;">${f.companyName}</div>
  <div style="font-size:14px;color:#f97316;margin-top:8px;letter-spacing:3px;text-transform:uppercase;">${f.tagline}</div>
  <div style="font-size:11px;color:#71717a;margin-top:12px;letter-spacing:2px;">${f.website}</div>
</div>`;
}

function banner2(f: BannerFields) {
  return `<div style="width:100%;aspect-ratio:1500/500;background:#09090b;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;">
  <div style="position:absolute;bottom:0;left:0;right:0;height:40%;background:linear-gradient(135deg,#f97316,#ea580c,#c2410c);clip-path:polygon(0 40%,100% 0,100% 100%,0 100%);"></div>
  <div style="position:relative;z-index:1;padding-left:60px;">
    <div style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:4px;text-transform:uppercase;">${f.companyName}</div>
    <div style="font-size:13px;color:#e4e4e7;margin-top:6px;letter-spacing:2px;">${f.tagline}</div>
    <div style="font-size:11px;color:#a1a1aa;margin-top:10px;">${f.subtitle}</div>
    <div style="font-size:11px;color:#f97316;margin-top:8px;font-weight:600;">${f.website}</div>
  </div>
  <div style="position:absolute;right:60px;top:50%;transform:translateY(-50%);z-index:1;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity social media banner logo" width="90" height="90" loading="lazy" style="border-radius:18px;border:3px solid rgba(255,255,255,0.3);" />
  </div>
</div>`;
}

function banner3(f: BannerFields) {
  return `<div style="width:100%;aspect-ratio:1584/396;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;">
  <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(249,115,22,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.05) 1px,transparent 1px);background-size:40px 40px;"></div>
  <div style="display:flex;align-items:center;padding-left:50px;position:relative;z-index:1;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity social media banner logo" width="64" height="64" loading="lazy" style="border-radius:12px;margin-right:24px;" />
    <div>
      <div style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:3px;text-transform:uppercase;">${f.companyName}</div>
      <div style="font-size:12px;color:#a1a1aa;margin-top:4px;letter-spacing:1px;">${f.tagline}</div>
    </div>
  </div>
  <div style="position:absolute;right:50px;top:50%;transform:translateY(-50%);text-align:right;z-index:1;">
    <div style="font-size:11px;color:#71717a;line-height:1.8;">
      <div>Threat Intelligence</div>
      <div>Security Monitoring</div>
      <div>Incident Response</div>
      <div>Penetration Testing</div>
    </div>
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#f97316,#ea580c,#f97316);"></div>
</div>`;
}

function banner4(f: BannerFields) {
  return `<div style="width:100%;aspect-ratio:1584/396;background:#09090b;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;flex-direction:column;">
  <div style="position:absolute;inset:0;background-image:radial-gradient(circle,rgba(249,115,22,0.08) 1px,transparent 1px);background-size:30px 30px;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:200px;height:200px;border:1px solid rgba(249,115,22,0.15);transform:translate(-50%,-50%) rotate(45deg);border-radius:8px;"></div>
  <div style="position:absolute;top:50%;left:50%;width:280px;height:280px;border:1px solid rgba(249,115,22,0.08);transform:translate(-50%,-50%) rotate(45deg);border-radius:8px;"></div>
  <div style="position:relative;z-index:1;text-align:center;">
    <div style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:5px;text-transform:uppercase;">${f.companyName}</div>
    <div style="width:60px;height:3px;background:#f97316;margin:10px auto;border-radius:2px;"></div>
    <div style="font-size:12px;color:#f97316;letter-spacing:3px;text-transform:uppercase;">${f.tagline}</div>
    <div style="font-size:10px;color:#52525b;margin-top:8px;letter-spacing:2px;">${f.website}</div>
  </div>
  <div style="position:absolute;top:15px;left:20px;width:8px;height:8px;background:#f97316;border-radius:50%;box-shadow:0 0 8px #f97316;"></div>
  <div style="position:absolute;top:15px;right:20px;width:8px;height:8px;background:#f97316;border-radius:50%;box-shadow:0 0 8px #f97316;"></div>
  <div style="position:absolute;bottom:15px;left:20px;width:8px;height:8px;background:#f97316;border-radius:50%;box-shadow:0 0 8px #f97316;"></div>
  <div style="position:absolute;bottom:15px;right:20px;width:8px;height:8px;background:#f97316;border-radius:50%;box-shadow:0 0 8px #f97316;"></div>
</div>`;
}

function banner5(f: BannerFields) {
  return `<div style="width:100%;aspect-ratio:2560/1440;background:#0a0a0c;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;">
  <div style="position:absolute;top:10%;left:5%;width:25%;height:35%;background:#111113;border:1px solid #1a1a1e;border-radius:6px;padding:12px;">
    <div style="font-size:8px;color:#f97316;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Threat Monitor</div>
    <div style="width:100%;height:2px;background:#1a1a1e;margin-bottom:4px;"><div style="width:72%;height:100%;background:#f97316;"></div></div>
    <div style="width:100%;height:2px;background:#1a1a1e;margin-bottom:4px;"><div style="width:45%;height:100%;background:#ea580c;"></div></div>
    <div style="width:100%;height:2px;background:#1a1a1e;"><div style="width:88%;height:100%;background:#f97316;"></div></div>
  </div>
  <div style="position:absolute;top:10%;right:5%;width:25%;height:35%;background:#111113;border:1px solid #1a1a1e;border-radius:6px;padding:12px;">
    <div style="font-size:8px;color:#f97316;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Network Status</div>
    <div style="display:flex;gap:4px;flex-wrap:wrap;">
      <div style="width:10px;height:10px;background:#22c55e;border-radius:2px;"></div>
      <div style="width:10px;height:10px;background:#22c55e;border-radius:2px;"></div>
      <div style="width:10px;height:10px;background:#f97316;border-radius:2px;"></div>
      <div style="width:10px;height:10px;background:#22c55e;border-radius:2px;"></div>
      <div style="width:10px;height:10px;background:#22c55e;border-radius:2px;"></div>
      <div style="width:10px;height:10px;background:#ef4444;border-radius:2px;"></div>
    </div>
  </div>
  <div style="position:absolute;bottom:10%;left:5%;width:25%;height:30%;background:#111113;border:1px solid #1a1a1e;border-radius:6px;padding:12px;">
    <div style="font-size:8px;color:#f97316;text-transform:uppercase;letter-spacing:2px;">Incident Log</div>
    <div style="font-size:7px;color:#52525b;margin-top:6px;line-height:1.6;font-family:'Courier New',monospace;">
      [OK] Firewall active<br/>[OK] IDS scanning<br/>[WARN] Port scan detected
    </div>
  </div>
  <div style="position:absolute;bottom:10%;right:5%;width:25%;height:30%;background:#111113;border:1px solid #1a1a1e;border-radius:6px;padding:12px;">
    <div style="font-size:8px;color:#f97316;text-transform:uppercase;letter-spacing:2px;">Alerts</div>
    <div style="margin-top:6px;">
      <div style="font-size:7px;color:#ef4444;margin-bottom:3px;">● CRITICAL: 2</div>
      <div style="font-size:7px;color:#f97316;margin-bottom:3px;">● HIGH: 5</div>
      <div style="font-size:7px;color:#eab308;">● MEDIUM: 12</div>
    </div>
  </div>
  <div style="position:relative;z-index:1;text-align:center;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity social media banner logo" width="60" height="60" loading="lazy" style="border-radius:12px;margin-bottom:12px;border:2px solid #f97316;" />
    <div style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:5px;text-transform:uppercase;">${f.companyName}</div>
    <div style="font-size:11px;color:#f97316;margin-top:6px;letter-spacing:2px;">${f.tagline}</div>
    <div style="font-size:9px;color:#52525b;margin-top:6px;">${f.subtitle}</div>
  </div>
</div>`;
}

function banner6(f: BannerFields) {
  return `<div style="width:100%;aspect-ratio:2560/1440;background:#050a05;position:relative;overflow:hidden;font-family:'Courier New',Consolas,monospace;display:flex;align-items:center;justify-content:center;">
  <div style="position:absolute;inset:0;display:flex;gap:12px;padding:8px;opacity:0.15;">
    ${Array.from({ length: 20 }, (_, i) => `<div style="flex:1;color:#22c55e;font-size:10px;line-height:1.4;word-break:break-all;overflow:hidden;">${Array.from({ length: 40 }, () => String.fromCharCode(33 + Math.floor(Math.random() * 94))).join('')}</div>`).join('')}
  </div>
  <div style="position:relative;z-index:1;text-align:center;background:rgba(5,10,5,0.85);padding:30px 50px;border-radius:8px;border:1px solid rgba(34,197,94,0.2);">
    <img src="${LOGO_URL}" alt="STB Cybersecurity social media banner logo" width="56" height="56" loading="lazy" style="border-radius:12px;margin-bottom:12px;filter:hue-rotate(80deg) brightness(1.2);border:2px solid rgba(34,197,94,0.4);" />
    <div style="font-size:22px;font-weight:900;color:#22c55e;letter-spacing:4px;text-transform:uppercase;">${f.companyName}</div>
    <div style="font-size:11px;color:#16a34a;margin-top:6px;letter-spacing:2px;">${f.tagline}</div>
    <div style="font-size:9px;color:#15803d;margin-top:8px;">${f.website}</div>
  </div>
</div>`;
}

function banner7(f: BannerFields) {
  return `<div style="width:100%;aspect-ratio:820/312;background:#09090b;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;flex-direction:column;">
  <div style="position:absolute;top:0;left:0;right:0;height:35%;background:#09090b;"></div>
  <div style="position:absolute;top:30%;left:0;right:0;height:40%;background:#f97316;display:flex;align-items:center;justify-content:center;">
    <div style="text-align:center;">
      <div style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:5px;text-transform:uppercase;">${f.companyName}</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.9);margin-top:4px;letter-spacing:2px;">${f.tagline}</div>
    </div>
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:30%;background:#09090b;display:flex;align-items:center;justify-content:center;">
    <div style="font-size:10px;color:#71717a;letter-spacing:2px;">${f.website}</div>
  </div>
  <div style="position:absolute;top:10%;left:30px;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity social media banner logo" width="40" height="40" loading="lazy" style="border-radius:8px;opacity:0.8;" />
  </div>
</div>`;
}

function banner8(f: BannerFields) {
  return `<div style="width:100%;aspect-ratio:820/312;background:#0c0c0e;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;">
  <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(249,115,22,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.06) 1px,transparent 1px);background-size:30px 30px;"></div>
  <div style="position:absolute;top:20%;left:15%;width:6px;height:6px;background:#f97316;border-radius:50%;box-shadow:0 0 10px #f97316;"></div>
  <div style="position:absolute;top:60%;left:25%;width:6px;height:6px;background:#f97316;border-radius:50%;box-shadow:0 0 10px #f97316;"></div>
  <div style="position:absolute;top:35%;right:20%;width:6px;height:6px;background:#f97316;border-radius:50%;box-shadow:0 0 10px #f97316;"></div>
  <div style="position:absolute;top:70%;right:30%;width:6px;height:6px;background:#f97316;border-radius:50%;box-shadow:0 0 10px #f97316;"></div>
  <div style="position:absolute;top:15%;right:40%;width:6px;height:6px;background:#ef4444;border-radius:50%;box-shadow:0 0 10px #ef4444;"></div>
  <div style="position:absolute;top:75%;left:45%;width:6px;height:6px;background:#22c55e;border-radius:50%;box-shadow:0 0 10px #22c55e;"></div>
  <div style="position:absolute;top:20%;left:15%;width:100px;height:1px;background:rgba(249,115,22,0.2);transform:rotate(30deg);"></div>
  <div style="position:absolute;top:60%;left:25%;width:80px;height:1px;background:rgba(249,115,22,0.2);transform:rotate(-20deg);"></div>
  <div style="position:absolute;top:35%;right:20%;width:120px;height:1px;background:rgba(249,115,22,0.2);transform:rotate(45deg);"></div>
  <div style="position:relative;z-index:1;text-align:center;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity social media banner logo" width="50" height="50" loading="lazy" style="border-radius:10px;margin-bottom:10px;border:2px solid #f97316;" />
    <div style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:4px;text-transform:uppercase;">${f.companyName}</div>
    <div style="font-size:11px;color:#f97316;margin-top:4px;letter-spacing:2px;">${f.tagline}</div>
    <div style="font-size:9px;color:#52525b;margin-top:6px;letter-spacing:1px;">${f.subtitle}</div>
  </div>
</div>`;
}

function banner9(f: BannerFields) {
  return `<div style="width:100%;aspect-ratio:9/16;background:linear-gradient(180deg,#09090b 0%,#0c0c0e 50%,#18181b 100%);position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;">
  <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:2px;height:25%;background:linear-gradient(180deg,#f97316,transparent);"></div>
  <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:2px;height:25%;background:linear-gradient(0deg,#f97316,transparent);"></div>
  <div style="position:absolute;top:15%;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(249,115,22,0.3),transparent);"></div>
  <div style="position:absolute;bottom:15%;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(249,115,22,0.3),transparent);"></div>
  <div style="position:absolute;left:8%;top:20%;bottom:20%;width:1px;background:linear-gradient(180deg,transparent,rgba(249,115,22,0.15),transparent);"></div>
  <div style="position:absolute;right:8%;top:20%;bottom:20%;width:1px;background:linear-gradient(180deg,transparent,rgba(249,115,22,0.15),transparent);"></div>
  <img src="${LOGO_URL}" alt="STB Cybersecurity social media banner logo" width="80" height="80" loading="lazy" style="border-radius:16px;margin-bottom:24px;border:2px solid #f97316;box-shadow:0 0 30px rgba(249,115,22,0.3);" />
  <div style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:5px;text-transform:uppercase;text-align:center;padding:0 10%;">${f.companyName}</div>
  <div style="width:50px;height:3px;background:#f97316;margin:16px auto;border-radius:2px;box-shadow:0 0 10px rgba(249,115,22,0.5);"></div>
  <div style="font-size:14px;color:#f97316;letter-spacing:3px;text-transform:uppercase;text-align:center;padding:0 15%;">${f.tagline}</div>
  <div style="font-size:11px;color:#71717a;margin-top:16px;letter-spacing:2px;text-align:center;">${f.subtitle}</div>
  <div style="position:absolute;bottom:8%;font-size:10px;color:#52525b;letter-spacing:2px;">${f.website}</div>
  <div style="position:absolute;top:6%;left:6%;width:20px;height:20px;border-left:2px solid #f97316;border-top:2px solid #f97316;"></div>
  <div style="position:absolute;top:6%;right:6%;width:20px;height:20px;border-right:2px solid #f97316;border-top:2px solid #f97316;"></div>
  <div style="position:absolute;bottom:6%;left:6%;width:20px;height:20px;border-left:2px solid #f97316;border-bottom:2px solid #f97316;"></div>
  <div style="position:absolute;bottom:6%;right:6%;width:20px;height:20px;border-right:2px solid #f97316;border-bottom:2px solid #f97316;"></div>
</div>`;
}

function banner10(f: BannerFields) {
  return `<div style="width:100%;aspect-ratio:960/540;background:linear-gradient(135deg,#1a0a2e 0%,#16082b 30%,#1a0a0a 70%,#18100a 100%);position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;flex-direction:column;">
  <div style="position:absolute;inset:0;background-image:radial-gradient(circle,rgba(139,92,246,0.06) 1px,transparent 1px);background-size:24px 24px;"></div>
  <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#8b5cf6,#f97316);"></div>
  <div style="position:absolute;top:12px;left:12px;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.25);border-radius:6px;padding:6px 12px;">
    <div style="font-size:8px;color:#8b5cf6;text-transform:uppercase;letter-spacing:2px;font-weight:700;"># general</div>
  </div>
  <div style="position:absolute;top:12px;left:120px;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.15);border-radius:6px;padding:6px 12px;">
    <div style="font-size:8px;color:#a78bfa;text-transform:uppercase;letter-spacing:2px;"># threat-intel</div>
  </div>
  <div style="position:absolute;top:12px;right:12px;background:rgba(249,115,22,0.15);border:1px solid rgba(249,115,22,0.25);border-radius:6px;padding:6px 12px;">
    <div style="font-size:8px;color:#f97316;text-transform:uppercase;letter-spacing:2px;">LIVE</div>
  </div>
  <img src="${LOGO_URL}" alt="STB Cybersecurity social media banner logo" width="70" height="70" loading="lazy" style="border-radius:50%;margin-bottom:16px;border:3px solid #8b5cf6;box-shadow:0 0 20px rgba(139,92,246,0.3);" />
  <div style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:4px;text-transform:uppercase;">${f.companyName}</div>
  <div style="font-size:13px;color:#f97316;margin-top:8px;letter-spacing:2px;font-weight:600;">JOIN OUR THREAT INTEL COMMUNITY</div>
  <div style="font-size:11px;color:#a78bfa;margin-top:6px;letter-spacing:1px;">${f.tagline}</div>
  <div style="position:absolute;bottom:16px;display:flex;gap:16px;">
    <div style="font-size:9px;color:#71717a;letter-spacing:1px;">500+ Members</div>
    <div style="font-size:9px;color:#71717a;">•</div>
    <div style="font-size:9px;color:#71717a;letter-spacing:1px;">24/7 Active</div>
    <div style="font-size:9px;color:#71717a;">•</div>
    <div style="font-size:9px;color:#71717a;letter-spacing:1px;">${f.website}</div>
  </div>
</div>`;
}

function banner11(f: BannerFields) {
  return `<div style="width:100%;aspect-ratio:1920/1080;background:#09090b;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;flex-direction:column;">
  <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(249,115,22,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.03) 1px,transparent 1px);background-size:60px 60px;"></div>
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(249,115,22,0.05) 0%,transparent 70%);"></div>
  <div style="position:absolute;top:20px;right:20px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);border-radius:4px;padding:4px 10px;">
    <div style="font-size:10px;color:#ef4444;font-weight:700;letter-spacing:2px;">OFFLINE</div>
  </div>
  <img src="${LOGO_URL}" alt="STB Cybersecurity social media banner logo" width="90" height="90" loading="lazy" style="border-radius:18px;margin-bottom:20px;border:2px solid rgba(249,115,22,0.4);opacity:0.9;" />
  <div style="font-size:32px;font-weight:900;color:#ffffff;letter-spacing:6px;text-transform:uppercase;">${f.companyName}</div>
  <div style="font-size:16px;color:#f97316;margin-top:12px;letter-spacing:4px;text-transform:uppercase;">SECURING THE PERIMETER</div>
  <div style="width:80px;height:2px;background:linear-gradient(90deg,transparent,#f97316,transparent);margin:16px auto;"></div>
  <div style="font-size:12px;color:#a1a1aa;letter-spacing:2px;">${f.tagline}</div>
  <div style="position:absolute;bottom:60px;display:flex;gap:24px;align-items:center;">
    <div style="text-align:center;">
      <div style="font-size:8px;color:#71717a;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Schedule</div>
      <div style="font-size:10px;color:#a1a1aa;">MON — FRI</div>
      <div style="font-size:10px;color:#a1a1aa;">9AM — 5PM EST</div>
    </div>
    <div style="width:1px;height:30px;background:#27272a;"></div>
    <div style="text-align:center;">
      <div style="font-size:8px;color:#71717a;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Follow Us</div>
      <div style="font-size:10px;color:#f97316;">${f.website}</div>
    </div>
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#f97316,transparent);"></div>
</div>`;
}

function banner12(f: BannerFields) {
  return `<div style="width:100%;aspect-ratio:600/200;background:#09090b;position:relative;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;">
  <div style="position:absolute;top:0;left:0;right:0;height:4px;background:#f97316;"></div>
  <div style="display:flex;align-items:center;padding-left:30px;position:relative;z-index:1;flex:1;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity social media banner logo" width="48" height="48" loading="lazy" style="border-radius:10px;margin-right:18px;border:1px solid rgba(249,115,22,0.3);" />
    <div>
      <div style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:3px;text-transform:uppercase;">${f.companyName}</div>
      <div style="font-size:11px;color:#f97316;margin-top:2px;letter-spacing:1px;">${f.tagline}</div>
    </div>
  </div>
  <div style="position:absolute;right:30px;top:50%;transform:translateY(-50%);text-align:right;z-index:1;">
    <div style="font-size:10px;color:#a1a1aa;letter-spacing:1px;">${f.subtitle}</div>
    <div style="font-size:9px;color:#71717a;margin-top:4px;">${f.website}</div>
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,#f97316,rgba(249,115,22,0.3),transparent);"></div>
</div>`;
}

const banners = [
  { id: 1, name: "Twitter Dark Shield", platform: "Twitter / X", dimensions: "1500 × 500", ratio: "1500/500", desc: "Dark background with large shield logo center, orange accent lines", render: banner1 },
  { id: 2, name: "Twitter Gradient Wave", platform: "Twitter / X", dimensions: "1500 × 500", ratio: "1500/500", desc: "Orange-to-dark gradient wave with text left-aligned, logo right", render: banner2 },
  { id: 3, name: "LinkedIn Corporate", platform: "LinkedIn", dimensions: "1584 × 396", ratio: "1584/396", desc: "Professional dark layout with logo, services listed, subtle grid background", render: banner3 },
  { id: 4, name: "LinkedIn Tech Grid", platform: "LinkedIn", dimensions: "1584 × 396", ratio: "1584/396", desc: "Hexagonal grid pattern with centered branding and orange nodes", render: banner4 },
  { id: 5, name: "YouTube Cyber HQ", platform: "YouTube", dimensions: "2560 × 1440", ratio: "2560/1440", desc: "Command center aesthetic with multiple panels, logo center", render: banner5 },
  { id: 6, name: "YouTube Matrix", platform: "YouTube", dimensions: "2560 × 1440", ratio: "2560/1440", desc: "Falling code rain effect with logo overlay, dark green tint", render: banner6 },
  { id: 7, name: "Facebook Brand Bar", platform: "Facebook", dimensions: "820 × 312", ratio: "820/312", desc: "Bold orange bar across center with white text, dark top/bottom", render: banner7 },
  { id: 8, name: "Facebook Tactical", platform: "Facebook", dimensions: "820 × 312", ratio: "820/312", desc: "Tactical map aesthetic with grid lines, orange markers, logo", render: banner8 },
  { id: 9, name: "Instagram Story", platform: "Instagram", dimensions: "1080 × 1920", ratio: "9/16", desc: "Vertical dark design with neon orange accent lines, story-optimized layout", render: banner9 },
  { id: 10, name: "Discord Server", platform: "Discord", dimensions: "960 × 540", ratio: "960/540", desc: "Gaming/community aesthetic with purple-to-orange gradient, channel-like elements", render: banner10 },
  { id: 11, name: "Twitch Offline", platform: "Twitch", dimensions: "1920 × 1080", ratio: "1920/1080", desc: "Stream offline screen with schedule placeholder and social links", render: banner11 },
  { id: 12, name: "Email Header", platform: "Email", dimensions: "600 × 200", ratio: "600/200", desc: "Newsletter header banner with clean branding and orange accent bar", render: banner12 },
];

export default function SocialMedia() {
  const [fields, setFields] = useState<BannerFields>(defaultFields);
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState<number | null>(null);
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const active = banners[activeIdx];

  function handleCopy(idx: number) {
    const html = banners[idx].render(fields);

    function fallbackCopy() {
      const ta = document.createElement("textarea");
      ta.value = html;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(idx);
      toast({ title: "HTML copied!", description: "Paste the HTML into your design tool or CMS." });
      setTimeout(() => setCopied(null), 2500);
    }

    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      const blob = new Blob([html], { type: "text/html" });
      const plainBlob = new Blob([html], { type: "text/plain" });
      navigator.clipboard.write([
        new ClipboardItem({ "text/html": blob, "text/plain": plainBlob }),
      ]).then(() => {
        setCopied(idx);
        toast({ title: "Banner HTML copied!", description: "Paste it into your website or design tool." });
        setTimeout(() => setCopied(null), 2500);
      }).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  const prev = () => setActiveIdx(i => (i - 1 + banners.length) % banners.length);
  const next = () => setActiveIdx(i => (i + 1) % banners.length);

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/brand-kit">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white" data-testid="link-back">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Brand Kit
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Share2 className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wider" data-testid="text-page-title">
              SOCIAL MEDIA BANNERS
            </h1>
          </div>
          <p className="text-zinc-400 text-sm">Professional social media banners for STB Cybersecurity brand</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="bg-zinc-900/80 border-zinc-800 p-5 lg:col-span-1">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-500" />
              Customize Fields
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-zinc-400 text-xs">Company Name</Label>
                <Input
                  data-testid="input-company-name"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.companyName}
                  onChange={e => setFields(p => ({ ...p, companyName: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Tagline</Label>
                <Input
                  data-testid="input-tagline"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.tagline}
                  onChange={e => setFields(p => ({ ...p, tagline: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Subtitle</Label>
                <Input
                  data-testid="input-subtitle"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.subtitle}
                  onChange={e => setFields(p => ({ ...p, subtitle: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Website</Label>
                <Input
                  data-testid="input-website"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.website}
                  onChange={e => setFields(p => ({ ...p, website: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800">
              <h4 className="text-zinc-400 text-xs font-semibold mb-3 uppercase tracking-wider">All Styles</h4>
              <div className="space-y-2">
                {banners.map((b, i) => (
                  <button
                    key={b.id}
                    data-testid={`button-style-${b.id}`}
                    onClick={() => setActiveIdx(i)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      i === activeIdx
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                        : "bg-zinc-800/50 text-zinc-400 border border-transparent hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs opacity-70 mt-0.5">{b.platform} — {b.dimensions}</div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={prev} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" data-testid="button-prev">
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <div className="text-center">
                <h2 className="text-white font-bold text-lg" data-testid="text-active-style">{active.name}</h2>
                <p className="text-zinc-500 text-xs">{activeIdx + 1} of {banners.length} — {active.platform} ({active.dimensions})</p>
              </div>
              <Button variant="outline" size="sm" onClick={next} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" data-testid="button-next">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <Card className="bg-zinc-900/80 border-zinc-800 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-zinc-500 text-xs flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Live Preview — <span className="text-orange-500 font-medium">{active.platform}</span> <span className="text-zinc-600">({active.dimensions}px)</span>
                </span>
                <Button
                  data-testid={`button-copy-${active.id}`}
                  size="sm"
                  onClick={() => handleCopy(activeIdx)}
                  className={`transition-all ${copied === activeIdx ? "bg-green-600 hover:bg-green-600" : "bg-orange-600 hover:bg-orange-500"}`}
                >
                  {copied === activeIdx ? <><Check className="h-4 w-4 mr-1" /> Copied!</> : <><Copy className="h-4 w-4 mr-1" /> Copy HTML</>}
                </Button>
              </div>

              <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800 overflow-hidden">
                <div
                  ref={previewRef}
                  dangerouslySetInnerHTML={{ __html: active.render(fields) }}
                  style={{ maxWidth: "100%" }}
                />
              </div>
            </Card>

            <Card className="bg-zinc-900/60 border-zinc-800 p-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-white text-sm font-semibold mb-1">How to Use</h4>
                  <ol className="text-zinc-400 text-xs space-y-1 list-decimal list-inside">
                    <li>Customize the text fields on the left</li>
                    <li>Browse through banner styles using the arrows or style list</li>
                    <li>Click "Copy HTML" to copy the banner code</li>
                    <li>Paste into your website, email, or render as an image using a screenshot tool</li>
                    <li>For best results, take a screenshot at the exact pixel dimensions shown</li>
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
