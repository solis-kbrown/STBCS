import { useState, useRef } from "react";
import { Shield, Copy, Check, ChevronLeft, ChevronRight, Eye, Zap, Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const SITE_URL = "https://www.stbcybersecurity.com";
const LOGO_URL = `${SITE_URL}/brand/icon-shield.png`;

interface CardFields {
  name: string;
  title: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  tagline: string;
}

const defaultFields: CardFields = {
  name: "Your Name",
  title: "Cybersecurity Analyst",
  email: "contact@stbcybersecurity.com",
  phone: "+1 (555) 000-0000",
  website: "stbcybersecurity.com",
  address: "123 Cyber Lane, Suite 100",
  tagline: "Securing the Digital Frontier",
};

function card1Front(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#0a0a0c;border-radius:8px;padding:24px 28px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;box-sizing:border-box;overflow:hidden;">
  <div style="display:flex;align-items:center;gap:20px;width:100%;">
    <div style="flex-shrink:0;">
      <img src="${LOGO_URL}" alt="STBCS" width="56" height="56" style="display:block;border-radius:10px;border:2px solid #f97316;" />
      <div style="font-size:8px;color:#f97316;text-align:center;margin-top:4px;letter-spacing:2px;font-weight:700;">STBCS</div>
    </div>
    <div style="border-left:2px solid #27272a;padding-left:18px;">
      <div style="font-size:16px;font-weight:700;color:#ffffff;margin-bottom:2px;">${f.name}</div>
      <div style="font-size:10px;color:#f97316;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">${f.title}</div>
      <div style="font-size:9px;color:#a1a1aa;margin-bottom:2px;">${f.email}</div>
      <div style="font-size:9px;color:#a1a1aa;margin-bottom:2px;">${f.phone}</div>
      <div style="font-size:9px;color:#71717a;">${f.address}</div>
    </div>
  </div>
</div>`;
}

function card1Back(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#0a0a0c;border-radius:8px;padding:24px 28px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;overflow:hidden;">
  <div>
    <img src="${LOGO_URL}" alt="STBCS" width="48" height="48" style="display:block;margin:0 auto 10px;border-radius:10px;" />
    <div style="font-size:14px;font-weight:800;color:#ffffff;letter-spacing:3px;margin-bottom:4px;">STB CYBERSECURITY</div>
    <div style="font-size:9px;color:#71717a;margin-bottom:10px;letter-spacing:1px;">${f.tagline}</div>
    <div style="width:40px;height:2px;background:#f97316;margin:0 auto 10px;"></div>
    <div style="font-size:9px;color:#a1a1aa;">${f.website}</div>
  </div>
</div>`;
}

function card2Front(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#0c0c0e;border-radius:8px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;overflow:hidden;box-sizing:border-box;">
  <div style="width:10px;background:linear-gradient(180deg,#f97316,#ea580c);flex-shrink:0;"></div>
  <div style="padding:24px 22px;display:flex;flex-direction:column;justify-content:center;width:100%;">
    <div style="text-align:right;">
      <div style="font-size:16px;font-weight:700;color:#ffffff;margin-bottom:2px;">${f.name}</div>
      <div style="font-size:10px;color:#f97316;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">${f.title}</div>
      <div style="font-size:9px;color:#a1a1aa;margin-bottom:2px;">${f.email}</div>
      <div style="font-size:9px;color:#a1a1aa;margin-bottom:2px;">${f.phone}</div>
      <div style="font-size:9px;color:#71717a;">${f.website}</div>
    </div>
  </div>
</div>`;
}

function card2Back(f: CardFields) {
  return `<div style="width:350px;height:200px;background:linear-gradient(135deg,#f97316,#ea580c);border-radius:8px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;overflow:hidden;">
  <div>
    <img src="${LOGO_URL}" alt="STBCS" width="56" height="56" style="display:block;margin:0 auto 12px;border-radius:12px;border:3px solid rgba(255,255,255,0.3);" />
    <div style="font-size:16px;font-weight:800;color:#ffffff;letter-spacing:3px;">STBCS</div>
    <div style="font-size:9px;color:rgba(255,255,255,0.8);letter-spacing:2px;margin-top:4px;">CYBERSECURITY</div>
  </div>
</div>`;
}

function card3Front(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#000000;border-radius:8px;padding:20px 24px;font-family:'Courier New',Consolas,monospace;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;overflow:hidden;">
  <div style="font-size:10px;color:#22c55e;margin-bottom:6px;">$ whoami</div>
  <div style="font-size:14px;color:#22c55e;font-weight:700;margin-bottom:2px;">${f.name}</div>
  <div style="font-size:9px;color:#f97316;margin-bottom:10px;">${f.title}</div>
  <div style="font-size:9px;color:#4ade80;margin-bottom:2px;">$ cat contact.txt</div>
  <div style="font-size:8px;color:#86efac;margin-bottom:1px;">email: ${f.email}</div>
  <div style="font-size:8px;color:#86efac;margin-bottom:1px;">phone: ${f.phone}</div>
  <div style="font-size:8px;color:#86efac;">web:   ${f.website}</div>
  <div style="font-size:8px;color:#166534;margin-top:8px;">$ _</div>
</div>`;
}

function card3Back(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#000000;border-radius:8px;font-family:'Courier New',Consolas,monospace;display:flex;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;overflow:hidden;position:relative;">
  <div style="position:absolute;inset:0;opacity:0.06;background-image:repeating-linear-gradient(0deg,transparent,transparent 18px,#22c55e 18px,#22c55e 19px),repeating-linear-gradient(90deg,transparent,transparent 18px,#22c55e 18px,#22c55e 19px);"></div>
  <div style="position:relative;z-index:1;">
    <img src="${LOGO_URL}" alt="STBCS" width="44" height="44" style="display:block;margin:0 auto 8px;border-radius:8px;border:2px solid #22c55e;" />
    <div style="font-size:12px;color:#22c55e;font-weight:700;letter-spacing:2px;">STB CYBERSECURITY</div>
    <div style="font-size:8px;color:#166534;margin-top:4px;">${f.tagline}</div>
  </div>
</div>`;
}

function card4Front(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#0c0c0e;border-radius:8px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;overflow:hidden;">
  <img src="${LOGO_URL}" alt="STBCS" width="64" height="64" style="display:block;border-radius:50%;border:3px solid #f97316;margin-bottom:12px;" />
  <div style="font-size:16px;font-weight:800;color:#f97316;margin-bottom:2px;">${f.name}</div>
  <div style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1.5px;">${f.title}</div>
</div>`;
}

function card4Back(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#0c0c0e;border-radius:8px;padding:24px 28px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;box-sizing:border-box;overflow:hidden;">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px 24px;width:100%;">
    <div>
      <div style="font-size:8px;color:#52525b;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Email</div>
      <div style="font-size:9px;color:#e4e4e7;">${f.email}</div>
    </div>
    <div>
      <div style="font-size:8px;color:#52525b;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Phone</div>
      <div style="font-size:9px;color:#e4e4e7;">${f.phone}</div>
    </div>
    <div>
      <div style="font-size:8px;color:#52525b;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Website</div>
      <div style="font-size:9px;color:#f97316;">${f.website}</div>
    </div>
    <div>
      <div style="font-size:8px;color:#52525b;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Address</div>
      <div style="font-size:9px;color:#e4e4e7;">${f.address}</div>
    </div>
  </div>
</div>`;
}

function card5Front(f: CardFields) {
  return `<div style="width:350px;height:200px;border-radius:8px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;overflow:hidden;position:relative;box-sizing:border-box;">
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,#18181b 50%,#f97316 50%);"></div>
  <div style="position:relative;z-index:1;padding:28px 24px;height:100%;box-sizing:border-box;">
    <div style="font-size:16px;font-weight:700;color:#ffffff;margin-bottom:2px;">${f.name}</div>
    <div style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">${f.title}</div>
    <div style="font-size:9px;color:#71717a;">${f.email}</div>
    <div style="font-size:9px;color:#71717a;">${f.phone}</div>
  </div>
</div>`;
}

function card5Back(f: CardFields) {
  return `<div style="width:350px;height:200px;border-radius:8px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;overflow:hidden;position:relative;box-sizing:border-box;">
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,#f97316 50%,#18181b 50%);"></div>
  <div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:center;height:100%;text-align:center;">
    <div>
      <img src="${LOGO_URL}" alt="STBCS" width="44" height="44" style="display:block;margin:0 auto 8px;border-radius:8px;" />
      <div style="font-size:12px;font-weight:700;color:#ffffff;letter-spacing:2px;">STB CYBERSECURITY</div>
      <div style="font-size:8px;color:rgba(255,255,255,0.7);margin-top:4px;">${f.website}</div>
    </div>
  </div>
</div>`;
}

function card6Front(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#ffffff;border-radius:8px;padding:24px 28px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;overflow:hidden;">
  <div style="font-size:16px;font-weight:700;color:#18181b;margin-bottom:2px;">${f.name}</div>
  <div style="width:30px;height:2px;background:#f97316;margin:4px 0 8px;"></div>
  <div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">${f.title}</div>
  <div style="font-size:9px;color:#52525b;margin-bottom:2px;">${f.email}</div>
  <div style="font-size:9px;color:#52525b;margin-bottom:2px;">${f.phone}</div>
  <div style="font-size:9px;color:#f97316;">${f.website}</div>
</div>`;
}

function card6Back(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#18181b;border-radius:8px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;overflow:hidden;">
  <div>
    <img src="${LOGO_URL}" alt="STBCS" width="48" height="48" style="display:block;margin:0 auto 10px;border-radius:10px;border:2px solid #f97316;" />
    <div style="font-size:12px;font-weight:700;color:#f97316;letter-spacing:2px;">STB CYBERSECURITY</div>
    <div style="font-size:8px;color:#71717a;margin-top:6px;">${f.tagline}</div>
  </div>
</div>`;
}

function card7Front(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#0c0c0e;border-radius:8px;padding:24px 28px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;box-sizing:border-box;overflow:hidden;position:relative;">
  <div style="position:absolute;inset:0;opacity:0.04;background-image:repeating-linear-gradient(0deg,transparent,transparent 16px,#f97316 16px,#f97316 17px),repeating-linear-gradient(90deg,transparent,transparent 16px,#f97316 16px,#f97316 17px);"></div>
  <div style="position:relative;z-index:1;">
    <div style="font-size:8px;color:#f97316;text-transform:uppercase;letter-spacing:3px;margin-bottom:6px;">STB CYBERSECURITY</div>
    <div style="font-size:16px;font-weight:700;color:#ffffff;margin-bottom:2px;">${f.name}</div>
    <div style="font-size:10px;color:#a1a1aa;margin-bottom:10px;">${f.title}</div>
    <div style="font-size:9px;color:#71717a;margin-bottom:1px;">${f.email} &bull; ${f.phone}</div>
    <div style="font-size:9px;color:#71717a;">${f.website}</div>
  </div>
</div>`;
}

function card7Back(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#0c0c0e;border-radius:8px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;overflow:hidden;position:relative;">
  <div style="position:absolute;inset:0;opacity:0.08;background-image:repeating-linear-gradient(0deg,transparent,transparent 12px,#f97316 12px,#f97316 13px),repeating-linear-gradient(90deg,transparent,transparent 12px,#f97316 12px,#f97316 13px);"></div>
  <div style="position:relative;z-index:1;">
    <img src="${LOGO_URL}" alt="STBCS" width="52" height="52" style="display:block;margin:0 auto 8px;border-radius:10px;opacity:0.95;" />
    <div style="font-size:10px;color:#ffffff;font-weight:600;letter-spacing:2px;">STB CYBERSECURITY</div>
  </div>
</div>`;
}

function card8Front(f: CardFields) {
  return `<div style="width:350px;height:200px;background:linear-gradient(160deg,#18181b,#0c0c0e);border-radius:8px;padding:24px 28px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;overflow:hidden;border:1px solid #27272a;">
  <div style="font-size:18px;font-weight:800;color:#f5a623;margin-bottom:2px;text-shadow:0 0 20px rgba(245,166,35,0.15);">${f.name}</div>
  <div style="width:40px;height:1px;background:linear-gradient(90deg,#f5a623,transparent);margin:6px 0 8px;"></div>
  <div style="font-size:10px;color:#d4a574;text-transform:uppercase;letter-spacing:2px;margin-bottom:14px;">${f.title}</div>
  <div style="font-size:9px;color:#a1a1aa;margin-bottom:2px;">${f.email}</div>
  <div style="font-size:9px;color:#a1a1aa;margin-bottom:2px;">${f.phone}</div>
  <div style="font-size:9px;color:#d4a574;">${f.website}</div>
</div>`;
}

function card8Back(f: CardFields) {
  return `<div style="width:350px;height:200px;background:linear-gradient(160deg,#1a1a1e,#0a0a0c);border-radius:8px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;overflow:hidden;border:1px solid #27272a;position:relative;">
  <div style="position:absolute;inset:0;background:radial-gradient(circle at center,rgba(245,166,35,0.03) 0%,transparent 70%);"></div>
  <div style="position:relative;z-index:1;">
    <img src="${LOGO_URL}" alt="STBCS" width="56" height="56" style="display:block;margin:0 auto 10px;border-radius:12px;box-shadow:0 0 30px rgba(245,166,35,0.1);border:2px solid #3d3020;" />
    <div style="font-size:14px;font-weight:800;color:#f5a623;letter-spacing:4px;text-shadow:0 0 15px rgba(245,166,35,0.15);">STBCS</div>
    <div style="font-size:8px;color:#8a7a5a;letter-spacing:3px;margin-top:4px;text-transform:uppercase;">Premium Cybersecurity</div>
  </div>
</div>`;
}

function card9Front(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#0a0a0c;border-radius:8px;padding:24px 28px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;box-sizing:border-box;overflow:hidden;position:relative;">
  <div style="position:absolute;bottom:0;left:0;width:200px;height:200px;">
    <div style="position:absolute;bottom:-100px;left:-100px;width:200px;height:200px;border:1px solid rgba(249,115,22,0.08);border-radius:50%;"></div>
    <div style="position:absolute;bottom:-75px;left:-75px;width:150px;height:150px;border:1px solid rgba(249,115,22,0.12);border-radius:50%;"></div>
    <div style="position:absolute;bottom:-50px;left:-50px;width:100px;height:100px;border:1px solid rgba(249,115,22,0.18);border-radius:50%;"></div>
    <div style="position:absolute;bottom:-25px;left:-25px;width:50px;height:50px;border:1px solid rgba(249,115,22,0.25);border-radius:50%;"></div>
    <div style="position:absolute;bottom:-3px;left:-3px;width:6px;height:6px;background:#f97316;border-radius:50%;"></div>
    <div style="position:absolute;bottom:0;left:0;width:200px;height:1px;background:linear-gradient(90deg,#f97316,transparent);transform:rotate(-30deg);transform-origin:0 100%;opacity:0.3;"></div>
  </div>
  <div style="position:relative;z-index:1;text-align:right;width:100%;">
    <div style="font-size:16px;font-weight:700;color:#ffffff;margin-bottom:2px;">${f.name}</div>
    <div style="font-size:10px;color:#f97316;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">${f.title}</div>
    <div style="font-size:9px;color:#a1a1aa;margin-bottom:2px;">${f.email}</div>
    <div style="font-size:9px;color:#a1a1aa;margin-bottom:2px;">${f.phone}</div>
    <div style="font-size:9px;color:#71717a;">${f.website}</div>
  </div>
</div>`;
}

function card9Back(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#0a0a0c;border-radius:8px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;overflow:hidden;position:relative;">
  <div style="position:absolute;inset:0;">
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:180px;height:180px;border:1px solid rgba(249,115,22,0.06);border-radius:50%;"></div>
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:140px;height:140px;border:1px solid rgba(249,115,22,0.1);border-radius:50%;"></div>
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:100px;height:100px;border:1px solid rgba(249,115,22,0.15);border-radius:50%;"></div>
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60px;height:60px;border:1px solid rgba(249,115,22,0.2);border-radius:50%;"></div>
    <div style="position:absolute;top:0;left:50%;width:1px;height:100%;background:rgba(249,115,22,0.05);"></div>
    <div style="position:absolute;top:50%;left:0;width:100%;height:1px;background:rgba(249,115,22,0.05);"></div>
    <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(45deg,transparent 48%,rgba(249,115,22,0.04) 49%,rgba(249,115,22,0.04) 51%,transparent 52%);"></div>
  </div>
  <div style="position:relative;z-index:1;">
    <img src="${LOGO_URL}" alt="STBCS" width="48" height="48" style="display:block;margin:0 auto 8px;border-radius:10px;border:2px solid rgba(249,115,22,0.4);" />
    <div style="font-size:12px;font-weight:700;color:#ffffff;letter-spacing:2px;">STB CYBERSECURITY</div>
    <div style="font-size:8px;color:#71717a;margin-top:4px;letter-spacing:1px;">${f.tagline}</div>
  </div>
</div>`;
}

function card10Front(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#0c0c0e;border-radius:8px;padding:20px 24px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;justify-content:space-between;box-sizing:border-box;overflow:hidden;">
  <div style="font-family:'Courier New',Consolas,monospace;font-size:7px;color:#f97316;opacity:0.5;letter-spacing:1px;line-height:1.3;word-break:break-all;">4A 6F 68 6E 20 44 6F 65 20 7C 20 53 54 42 43 53 20 7C 20 45 6E 63 72 79 70 74 65 64</div>
  <div>
    <div style="font-family:'Courier New',Consolas,monospace;font-size:15px;font-weight:700;color:#ffffff;margin-bottom:2px;">${f.name}</div>
    <div style="font-family:'Courier New',Consolas,monospace;font-size:9px;color:#f97316;margin-bottom:10px;">${f.title}</div>
    <div style="font-family:'Courier New',Consolas,monospace;font-size:8px;color:#a1a1aa;margin-bottom:2px;">${f.email}</div>
    <div style="font-family:'Courier New',Consolas,monospace;font-size:8px;color:#a1a1aa;">${f.phone} | ${f.website}</div>
  </div>
</div>`;
}

function card10Back(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#0c0c0e;border-radius:8px;font-family:'Courier New',Consolas,monospace;display:flex;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;overflow:hidden;position:relative;">
  <div style="position:absolute;inset:0;padding:8px;opacity:0.06;font-size:7px;color:#f97316;line-height:1.4;word-break:break-all;overflow:hidden;">C7 A3 9F 2B 8D E1 4C 70 B5 23 6A F8 D9 01 3E 7C A4 55 B2 19 8F C6 3D E0 71 2A 94 D7 48 BC 05 63 FA 91 2E 7B C8 A0 5D 16 83 E4 3F 72 B9 20 67 AE D5 4A 97 0C 61 F8 B3 2C 79 C4 A7 5E 18 85 E6 41 74 BB 22 69 A0 D7 4C 99 0E 63 FA B5 2E 7B C6 A9 50 1A 87 E8 43 76 BD 24 6B A2 D9 4E 9B 10 65 FC B7 30 7D C8 AB 52 1C 89 EA 45 78 BF 26 6D A4 DB 50 9D 12 67 FE B9 32 7F CA AD 54 1E 8B</div>
  <div style="position:relative;z-index:1;">
    <img src="${LOGO_URL}" alt="STBCS" width="44" height="44" style="display:block;margin:0 auto 8px;border-radius:8px;border:2px solid #f97316;" />
    <div style="font-size:8px;color:#52525b;letter-spacing:2px;margin-bottom:6px;">DECRYPT TO REVEAL</div>
    <div style="font-size:12px;font-weight:700;color:#f97316;letter-spacing:3px;">STBCS</div>
    <div style="font-size:7px;color:#52525b;margin-top:4px;">${f.website}</div>
  </div>
</div>`;
}

function card11Front(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#0a0a0c;border-radius:8px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;box-sizing:border-box;overflow:hidden;position:relative;">
  <div style="position:absolute;left:0;top:0;width:20px;height:100%;background:repeating-linear-gradient(135deg,#f97316 0px,#f97316 6px,#0a0a0c 6px,#0a0a0c 12px);"></div>
  <div style="padding:24px 24px 24px 36px;width:100%;">
    <div style="font-size:18px;font-weight:900;color:#ffffff;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">${f.name}</div>
    <div style="font-size:10px;color:#f97316;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:12px;">${f.title}</div>
    <div style="font-size:9px;color:#a1a1aa;margin-bottom:2px;font-weight:600;">${f.email}</div>
    <div style="font-size:9px;color:#a1a1aa;margin-bottom:2px;">${f.phone}</div>
    <div style="font-size:9px;color:#71717a;">${f.website}</div>
  </div>
</div>`;
}

function card11Back(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#0a0a0c;border-radius:8px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;overflow:hidden;position:relative;">
  <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
    <div style="width:140px;height:140px;border:2px solid rgba(249,115,22,0.1);border-radius:50%;position:absolute;"></div>
    <div style="width:100px;height:100px;border:2px solid rgba(249,115,22,0.15);border-radius:50%;position:absolute;"></div>
    <div style="width:60px;height:60px;border:2px dashed rgba(249,115,22,0.1);border-radius:50%;position:absolute;"></div>
  </div>
  <div style="position:absolute;top:0;left:0;width:100%;height:8px;background:repeating-linear-gradient(90deg,#f97316 0px,#f97316 6px,#0a0a0c 6px,#0a0a0c 12px);"></div>
  <div style="position:absolute;bottom:0;left:0;width:100%;height:8px;background:repeating-linear-gradient(90deg,#f97316 0px,#f97316 6px,#0a0a0c 6px,#0a0a0c 12px);"></div>
  <div style="position:relative;z-index:1;">
    <img src="${LOGO_URL}" alt="STBCS" width="44" height="44" style="display:block;margin:0 auto 8px;border-radius:8px;" />
    <div style="font-size:12px;font-weight:900;color:#f97316;letter-spacing:3px;text-transform:uppercase;">DANGER ZONE</div>
    <div style="font-size:8px;color:#71717a;margin-top:4px;letter-spacing:1px;">AUTHORIZED PERSONNEL ONLY</div>
  </div>
</div>`;
}

function card12Front(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#1a1a2e;border-radius:8px;padding:20px 24px;font-family:'Courier New',Consolas,monospace;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;overflow:hidden;position:relative;border:3px solid #f97316;image-rendering:pixelated;">
  <div style="position:absolute;top:3px;left:3px;right:3px;bottom:3px;border:2px solid rgba(249,115,22,0.3);"></div>
  <div style="position:absolute;top:8px;left:8px;width:8px;height:8px;background:#f97316;"></div>
  <div style="position:absolute;top:8px;right:8px;width:8px;height:8px;background:#f97316;"></div>
  <div style="position:absolute;bottom:8px;left:8px;width:8px;height:8px;background:#f97316;"></div>
  <div style="position:absolute;bottom:8px;right:8px;width:8px;height:8px;background:#f97316;"></div>
  <div style="position:relative;z-index:1;">
    <div style="font-size:15px;font-weight:700;color:#ffffff;margin-bottom:2px;text-shadow:2px 2px 0 rgba(249,115,22,0.3);">${f.name}</div>
    <div style="font-size:9px;color:#f97316;margin-bottom:10px;letter-spacing:1px;">[ ${f.title} ]</div>
    <div style="font-size:8px;color:#a1a1aa;margin-bottom:2px;">&gt; ${f.email}</div>
    <div style="font-size:8px;color:#a1a1aa;margin-bottom:2px;">&gt; ${f.phone}</div>
    <div style="font-size:8px;color:#71717a;">&gt; ${f.website}</div>
  </div>
</div>`;
}

function card12Back(f: CardFields) {
  return `<div style="width:350px;height:200px;background:#1a1a2e;border-radius:8px;font-family:'Courier New',Consolas,monospace;display:flex;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;overflow:hidden;position:relative;border:3px solid #f97316;">
  <div style="position:absolute;inset:0;opacity:0.06;">
    <div style="position:absolute;top:10px;left:10px;width:16px;height:16px;background:#f97316;"></div>
    <div style="position:absolute;top:10px;left:30px;width:16px;height:16px;background:#f97316;"></div>
    <div style="position:absolute;top:30px;left:10px;width:16px;height:16px;background:#f97316;"></div>
    <div style="position:absolute;bottom:10px;right:10px;width:16px;height:16px;background:#f97316;"></div>
    <div style="position:absolute;bottom:10px;right:30px;width:16px;height:16px;background:#f97316;"></div>
    <div style="position:absolute;bottom:30px;right:10px;width:16px;height:16px;background:#f97316;"></div>
    <div style="position:absolute;top:10px;right:10px;width:16px;height:16px;background:#f97316;"></div>
    <div style="position:absolute;bottom:10px;left:10px;width:16px;height:16px;background:#f97316;"></div>
  </div>
  <div style="position:relative;z-index:1;">
    <div style="width:48px;height:48px;margin:0 auto 8px;border:3px solid #f97316;display:flex;align-items:center;justify-content:center;">
      <img src="${LOGO_URL}" alt="STBCS" width="36" height="36" style="display:block;image-rendering:pixelated;" />
    </div>
    <div style="font-size:12px;font-weight:700;color:#f97316;letter-spacing:3px;text-shadow:2px 2px 0 rgba(249,115,22,0.2);">STBCS</div>
    <div style="font-size:7px;color:#71717a;margin-top:4px;letter-spacing:2px;">PIXEL SECURITY</div>
  </div>
</div>`;
}

const designs = [
  { id: 1, name: "Classic Dark", desc: "Matte black with orange accents — professional authority", front: card1Front, back: card1Back },
  { id: 2, name: "Gradient Edge", desc: "Orange gradient strip — bold branded statement", front: card2Front, back: card2Back },
  { id: 3, name: "Terminal", desc: "Monospace green-on-black — the hacker classic", front: card3Front, back: card3Back },
  { id: 4, name: "Shield Badge", desc: "Centered shield emblem — identity-first design", front: card4Front, back: card4Back },
  { id: 5, name: "Split Diagonal", desc: "Diagonal split dark/orange — striking and modern", front: card5Front, back: card5Back },
  { id: 6, name: "Minimal Light", desc: "White with orange accent — clean and approachable", front: card6Front, back: card6Back },
  { id: 7, name: "Circuit Board", desc: "Subtle circuit trace pattern — tech-forward aesthetic", front: card7Front, back: card7Back },
  { id: 8, name: "Executive Gold", desc: "Dark with gold accents — premium prestige feel", front: card8Front, back: card8Back },
  { id: 9, name: "Radar Sweep", desc: "Radar arc lines from corner — surveillance aesthetic", front: card9Front, back: card9Back },
  { id: 10, name: "Encryption Key", desc: "Hex characters and monospace — cryptographic style", front: card10Front, back: card10Back },
  { id: 11, name: "Danger Zone", desc: "Hazard stripes and bold type — aggressive warning style", front: card11Front, back: card11Back },
  { id: 12, name: "Pixel Art", desc: "Retro 8-bit pixel border — nostalgic gaming aesthetic", front: card12Front, back: card12Back },
];

export default function BusinessCards() {
  const [fields, setFields] = useState<CardFields>(defaultFields);
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState<number | null>(null);
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const active = designs[activeIdx];

  function handleCopy(idx: number) {
    const html = designs[idx].front(fields) + "\n" + designs[idx].back(fields);

    function fallbackCopy() {
      const ta = document.createElement("textarea");
      ta.value = html;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(idx);
      toast({ title: "HTML copied!", description: "Business card HTML copied to clipboard." });
      setTimeout(() => setCopied(null), 2500);
    }

    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      const blob = new Blob([html], { type: "text/html" });
      const plainBlob = new Blob([html], { type: "text/plain" });
      navigator.clipboard.write([
        new ClipboardItem({ "text/html": blob, "text/plain": plainBlob }),
      ]).then(() => {
        setCopied(idx);
        toast({ title: "Business card copied!", description: "Front and back HTML copied to clipboard." });
        setTimeout(() => setCopied(null), 2500);
      }).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  function handlePrint() {
    window.print();
  }

  const prev = () => setActiveIdx(i => (i - 1 + designs.length) % designs.length);
  const next = () => setActiveIdx(i => (i + 1) % designs.length);

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/brand-kit" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-orange-400 text-sm mb-6 transition-colors" data-testid="link-back-brand-kit">
          <ArrowLeft className="h-4 w-4" /> Back to Brand Kit
        </Link>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Shield className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wider" data-testid="text-page-title">
              BUSINESS CARDS
            </h1>
          </div>
          <p className="text-zinc-400 text-sm">Professional business card designs for STB Cybersecurity — front &amp; back</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/80 border-zinc-800 p-5 lg:col-span-1">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-500" />
              Customize Fields
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-zinc-400 text-xs">Full Name</Label>
                <Input
                  data-testid="input-name"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.name}
                  onChange={e => setFields(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Job Title</Label>
                <Input
                  data-testid="input-title"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.title}
                  onChange={e => setFields(p => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Email</Label>
                <Input
                  data-testid="input-email"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.email}
                  onChange={e => setFields(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Phone</Label>
                <Input
                  data-testid="input-phone"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.phone}
                  onChange={e => setFields(p => ({ ...p, phone: e.target.value }))}
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
              <div>
                <Label className="text-zinc-400 text-xs">Address</Label>
                <Input
                  data-testid="input-address"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.address}
                  onChange={e => setFields(p => ({ ...p, address: e.target.value }))}
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
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800">
              <h4 className="text-zinc-400 text-xs font-semibold mb-3 uppercase tracking-wider">All Styles</h4>
              <div className="space-y-2">
                {designs.map((s, i) => (
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
                <p className="text-zinc-500 text-xs">{activeIdx + 1} of {designs.length}</p>
              </div>
              <Button variant="outline" size="sm" onClick={next} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" data-testid="button-next">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <Card className="bg-zinc-900/80 border-zinc-800 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-zinc-500 text-xs flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Live Preview — Front &amp; Back
                </span>
                <div className="flex gap-2">
                  <Button
                    data-testid="button-print"
                    size="sm"
                    variant="outline"
                    onClick={handlePrint}
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    <Printer className="h-4 w-4 mr-1" /> Print
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

              <div ref={previewRef} className="space-y-6">
                <div>
                  <div className="text-zinc-500 text-xs mb-2 uppercase tracking-wider font-semibold">Front</div>
                  <div className="bg-zinc-950 rounded-lg p-6 border border-zinc-800 flex items-center justify-center">
                    <div dangerouslySetInnerHTML={{ __html: active.front(fields) }} />
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500 text-xs mb-2 uppercase tracking-wider font-semibold">Back</div>
                  <div className="bg-zinc-950 rounded-lg p-6 border border-zinc-800 flex items-center justify-center">
                    <div dangerouslySetInnerHTML={{ __html: active.back(fields) }} />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-zinc-900/60 border-zinc-800 p-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-white text-sm font-semibold mb-1">How to Use</h4>
                  <ol className="text-zinc-400 text-xs space-y-1 list-decimal list-inside">
                    <li>Fill in your details on the left</li>
                    <li>Browse styles using the picker or arrow buttons</li>
                    <li>Click "Copy HTML" to copy both front and back designs</li>
                    <li>Use "Print" to print or save as PDF for your print shop</li>
                    <li>Standard size: 3.5" x 2" (89mm x 51mm)</li>
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
