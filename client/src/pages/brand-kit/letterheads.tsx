import { useState, useRef } from "react";
import { Shield, Copy, Check, ChevronLeft, ChevronRight, FileText, Eye, Zap, Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const SITE_URL = "https://www.stbcybersecurity.com";
const LOGO_URL = `${SITE_URL}/brand/icon-shield.png`;

interface LetterheadFields {
  companyName: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  documentTitle: string;
  date: string;
  referenceNumber: string;
}

const defaultFields: LetterheadFields = {
  companyName: "STB Cybersecurity",
  address: "123 Cyber Lane, Suite 100",
  city: "Security City, ST 00000",
  phone: "+1 (555) 000-0000",
  email: "contact@stbcybersecurity.com",
  website: "stbcybersecurity.com",
  documentTitle: "CONFIDENTIAL DOCUMENT",
  date: new Date().toISOString().split("T")[0],
  referenceNumber: "STBCS-2026-001",
};

function lh1(f: LetterheadFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;width:100%;max-width:595px;min-height:842px;background:#ffffff;color:#1a1a1a;position:relative;display:flex;flex-direction:column;">
  <div style="text-align:center;padding:40px 40px 20px;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity letterhead logo" width="60" height="60" loading="lazy" style="display:inline-block;border-radius:10px;" />
    <div style="font-size:22px;font-weight:800;color:#18181b;letter-spacing:3px;margin-top:10px;">${f.companyName.toUpperCase()}</div>
    <div style="font-size:10px;color:#71717a;letter-spacing:2px;margin-top:2px;">THREAT INTELLIGENCE &bull; INCIDENT RESPONSE &bull; SECURITY MONITORING</div>
    <div style="height:3px;background:#f97316;margin:16px auto 0;width:80%;border-radius:2px;"></div>
  </div>
  <div style="padding:10px 50px 4px;display:flex;justify-content:space-between;font-size:10px;color:#71717a;">
    <span>${f.address}, ${f.city}</span>
    <span>${f.phone} &bull; ${f.email}</span>
  </div>
  <div style="flex:1;padding:30px 50px;">
    <div style="font-size:11px;color:#71717a;margin-bottom:4px;">Date: ${f.date}</div>
    <div style="font-size:11px;color:#71717a;margin-bottom:20px;">Ref: ${f.referenceNumber}</div>
    <div style="font-size:16px;font-weight:700;color:#18181b;margin-bottom:20px;">${f.documentTitle}</div>
    <div style="font-size:12px;color:#52525b;line-height:1.8;">
      <p>[Document content goes here]</p>
      <p style="margin-top:12px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </div>
  </div>
  <div style="border-top:2px solid #f97316;padding:14px 50px;text-align:center;font-size:9px;color:#71717a;">
    ${f.address}, ${f.city} &bull; ${f.phone} &bull; ${f.email} &bull; <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">${f.website}</a>
  </div>
</div>`;
}

function lh2(f: LetterheadFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;width:100%;max-width:595px;min-height:842px;background:#ffffff;color:#1a1a1a;position:relative;display:flex;">
  <div style="width:56px;background:#18181b;display:flex;flex-direction:column;align-items:center;padding:20px 0;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity letterhead logo" width="36" height="36" loading="lazy" style="border-radius:6px;margin-bottom:16px;" />
    <div style="writing-mode:vertical-rl;text-orientation:mixed;transform:rotate(180deg);font-size:11px;font-weight:800;color:#f97316;letter-spacing:4px;white-space:nowrap;">${f.companyName.toUpperCase()}</div>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;">
    <div style="padding:30px 40px 10px;border-bottom:1px solid #e4e4e7;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="font-size:9px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Reference</div>
          <div style="font-size:12px;color:#18181b;font-weight:600;">${f.referenceNumber}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:9px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Date</div>
          <div style="font-size:12px;color:#18181b;font-weight:600;">${f.date}</div>
        </div>
      </div>
    </div>
    <div style="flex:1;padding:30px 40px;">
      <div style="font-size:16px;font-weight:700;color:#18181b;margin-bottom:20px;">${f.documentTitle}</div>
      <div style="font-size:12px;color:#52525b;line-height:1.8;">
        <p>[Document content goes here]</p>
        <p style="margin-top:12px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      </div>
    </div>
    <div style="padding:14px 40px;font-size:9px;color:#a1a1aa;border-top:1px solid #e4e4e7;">
      ${f.address}, ${f.city} &bull; ${f.phone} &bull; ${f.email} &bull; ${f.website}
    </div>
  </div>
</div>`;
}

function lh3(f: LetterheadFields) {
  return `<div style="font-family:'Courier New',Consolas,monospace;width:100%;max-width:595px;min-height:842px;background:#fafafa;color:#1a1a1a;position:relative;display:flex;flex-direction:column;border:2px solid #dc2626;">
  <div style="position:absolute;top:20px;right:20px;background:#dc2626;color:#ffffff;font-size:11px;font-weight:900;padding:6px 18px;transform:rotate(12deg);letter-spacing:3px;border-radius:2px;">TOP SECRET</div>
  <div style="padding:40px 50px 20px;">
    <div style="display:flex;align-items:center;gap:12px;">
      <img src="${LOGO_URL}" alt="STB Cybersecurity letterhead logo" width="40" height="40" loading="lazy" style="border-radius:6px;" />
      <div>
        <div style="font-size:16px;font-weight:900;color:#18181b;letter-spacing:3px;">${f.companyName.toUpperCase()}</div>
        <div style="font-size:9px;color:#dc2626;letter-spacing:2px;">CLASSIFIED CORRESPONDENCE</div>
      </div>
    </div>
  </div>
  <div style="padding:10px 50px;display:flex;gap:30px;border-top:2px solid #18181b;border-bottom:2px solid #18181b;background:#f0f0f0;">
    <div style="font-size:10px;"><span style="color:#71717a;">DOC ID:</span> <span style="font-weight:700;">${f.referenceNumber}</span></div>
    <div style="font-size:10px;"><span style="color:#71717a;">DATE:</span> <span style="font-weight:700;">${f.date}</span></div>
    <div style="font-size:10px;"><span style="color:#71717a;">CLASS:</span> <span style="font-weight:700;color:#dc2626;">RESTRICTED</span></div>
  </div>
  <div style="flex:1;padding:30px 50px;">
    <div style="font-size:14px;font-weight:700;color:#18181b;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;">${f.documentTitle}</div>
    <div style="height:4px;background:repeating-linear-gradient(90deg,#18181b 0px,#18181b 20px,transparent 20px,transparent 24px);margin-bottom:20px;"></div>
    <div style="font-size:12px;color:#52525b;line-height:1.8;">
      <p>[Document content goes here]</p>
      <p style="margin-top:12px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </div>
  </div>
  <div style="padding:14px 50px;background:#18181b;color:#71717a;font-size:9px;">
    &#9888; WARNING: This document contains classified information. Unauthorized disclosure is prohibited under applicable regulations. &bull; ${f.website}
  </div>
</div>`;
}

function lh4(f: LetterheadFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;width:100%;max-width:595px;min-height:842px;background:#ffffff;color:#1a1a1a;position:relative;display:flex;flex-direction:column;">
  <div style="height:3px;background:#f97316;"></div>
  <div style="padding:30px 50px 20px;display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;align-items:center;gap:10px;">
      <img src="${LOGO_URL}" alt="STB Cybersecurity letterhead logo" width="28" height="28" loading="lazy" style="border-radius:4px;" />
      <span style="font-size:12px;font-weight:700;color:#18181b;letter-spacing:1px;">${f.companyName}</span>
    </div>
    <div style="font-size:10px;color:#a1a1aa;">${f.website}</div>
  </div>
  <div style="flex:1;padding:20px 50px;">
    <div style="display:flex;justify-content:space-between;font-size:10px;color:#a1a1aa;margin-bottom:24px;">
      <span>${f.date}</span>
      <span>${f.referenceNumber}</span>
    </div>
    <div style="font-size:16px;font-weight:600;color:#18181b;margin-bottom:24px;">${f.documentTitle}</div>
    <div style="font-size:12px;color:#52525b;line-height:1.9;">
      <p>[Document content goes here]</p>
      <p style="margin-top:12px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </div>
  </div>
  <div style="padding:16px 50px;font-size:9px;color:#a1a1aa;border-top:1px solid #e4e4e7;">
    ${f.companyName} &bull; ${f.address}, ${f.city} &bull; ${f.phone} &bull; ${f.email}
  </div>
</div>`;
}

function lh5(f: LetterheadFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;width:100%;max-width:595px;min-height:842px;background:#ffffff;color:#1a1a1a;position:relative;display:flex;flex-direction:column;">
  <div style="background:linear-gradient(180deg,#18181b 0%,#27272a 100%);padding:36px 50px;text-align:center;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity letterhead logo" width="48" height="48" loading="lazy" style="display:inline-block;border-radius:10px;margin-bottom:10px;" />
    <div style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:4px;">${f.companyName.toUpperCase()}</div>
    <div style="font-size:10px;color:#a1a1aa;letter-spacing:2px;margin-top:4px;">Securing the Digital Frontier</div>
  </div>
  <div style="height:4px;background:linear-gradient(90deg,#f97316,#ea580c,#f97316);"></div>
  <div style="flex:1;padding:30px 50px;">
    <div style="display:flex;justify-content:space-between;font-size:10px;color:#a1a1aa;margin-bottom:20px;">
      <span>Date: ${f.date}</span>
      <span>Ref: ${f.referenceNumber}</span>
    </div>
    <div style="font-size:16px;font-weight:700;color:#18181b;margin-bottom:20px;">${f.documentTitle}</div>
    <div style="font-size:12px;color:#52525b;line-height:1.8;">
      <p>[Document content goes here]</p>
      <p style="margin-top:12px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </div>
  </div>
  <div style="padding:14px 50px;font-size:9px;color:#a1a1aa;border-top:1px solid #e4e4e7;text-align:center;">
    ${f.address}, ${f.city} &bull; ${f.phone} &bull; ${f.email} &bull; <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">${f.website}</a>
  </div>
</div>`;
}

function lh6(f: LetterheadFields) {
  return `<div style="font-family:'Courier New',Consolas,monospace;width:100%;max-width:595px;min-height:842px;background:#fafafa;background-image:linear-gradient(#e4e4e7 1px,transparent 1px),linear-gradient(90deg,#e4e4e7 1px,transparent 1px);background-size:20px 20px;color:#1a1a1a;position:relative;display:flex;flex-direction:column;">
  <div style="padding:24px 40px;border-bottom:2px solid #18181b;">
    <table style="width:100%;border-collapse:collapse;font-size:10px;">
      <tr>
        <td style="padding:4px 8px;border:1px solid #a1a1aa;background:#f0f0f0;font-weight:700;width:80px;">COMPANY</td>
        <td style="padding:4px 8px;border:1px solid #a1a1aa;">${f.companyName}</td>
        <td style="padding:4px 8px;border:1px solid #a1a1aa;background:#f0f0f0;font-weight:700;width:60px;">REF</td>
        <td style="padding:4px 8px;border:1px solid #a1a1aa;">${f.referenceNumber}</td>
      </tr>
      <tr>
        <td style="padding:4px 8px;border:1px solid #a1a1aa;background:#f0f0f0;font-weight:700;">DATE</td>
        <td style="padding:4px 8px;border:1px solid #a1a1aa;">${f.date}</td>
        <td style="padding:4px 8px;border:1px solid #a1a1aa;background:#f0f0f0;font-weight:700;">REV</td>
        <td style="padding:4px 8px;border:1px solid #a1a1aa;">1.0</td>
      </tr>
      <tr>
        <td style="padding:4px 8px;border:1px solid #a1a1aa;background:#f0f0f0;font-weight:700;">TITLE</td>
        <td colspan="3" style="padding:4px 8px;border:1px solid #a1a1aa;font-weight:700;">${f.documentTitle}</td>
      </tr>
    </table>
  </div>
  <div style="padding:8px 40px 0;display:flex;align-items:center;gap:10px;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity letterhead logo" width="24" height="24" loading="lazy" style="border-radius:4px;" />
    <span style="font-size:11px;font-weight:700;color:#f97316;letter-spacing:2px;">${f.companyName.toUpperCase()}</span>
    <span style="font-size:9px;color:#a1a1aa;">// TECHNICAL BRIEF</span>
  </div>
  <div style="flex:1;padding:20px 40px;">
    <div style="font-size:12px;color:#52525b;line-height:1.8;">
      <p>[Document content goes here]</p>
      <p style="margin-top:12px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </div>
  </div>
  <div style="padding:12px 40px;border-top:2px solid #18181b;font-size:9px;color:#a1a1aa;display:flex;justify-content:space-between;">
    <span>${f.companyName} &bull; ${f.website}</span>
    <span>${f.phone} &bull; ${f.email}</span>
  </div>
</div>`;
}

function lh7(f: LetterheadFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;width:100%;max-width:595px;min-height:842px;background:#ffffff;color:#1a1a1a;position:relative;display:flex;flex-direction:column;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0.04;pointer-events:none;">
    <img src="${LOGO_URL}" alt="STB Cybersecurity letterhead watermark" width="280" height="280" loading="lazy" />
  </div>
  <div style="padding:40px 50px 20px;display:flex;justify-content:space-between;align-items:flex-start;">
    <div>
      <div style="font-size:20px;font-weight:300;color:#18181b;letter-spacing:1px;">${f.companyName}</div>
      <div style="font-size:10px;color:#f97316;letter-spacing:1px;margin-top:2px;">Cybersecurity Consulting</div>
    </div>
    <img src="${LOGO_URL}" alt="STB Cybersecurity letterhead logo" width="40" height="40" loading="lazy" style="border-radius:8px;opacity:0.8;" />
  </div>
  <div style="height:1px;background:linear-gradient(90deg,transparent,#f97316,transparent);margin:0 50px;"></div>
  <div style="flex:1;padding:30px 50px;position:relative;z-index:1;">
    <div style="display:flex;justify-content:space-between;font-size:10px;color:#a1a1aa;margin-bottom:24px;">
      <span>${f.date}</span>
      <span>${f.referenceNumber}</span>
    </div>
    <div style="font-size:16px;font-weight:600;color:#18181b;margin-bottom:24px;font-style:italic;">${f.documentTitle}</div>
    <div style="font-size:12px;color:#52525b;line-height:2;">
      <p>[Document content goes here]</p>
      <p style="margin-top:12px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </div>
  </div>
  <div style="padding:16px 50px;font-size:9px;color:#a1a1aa;">
    <div style="height:1px;background:linear-gradient(90deg,transparent,#e4e4e7,transparent);margin-bottom:12px;"></div>
    <div style="text-align:center;">${f.address}, ${f.city} &bull; ${f.phone} &bull; ${f.email} &bull; ${f.website}</div>
  </div>
</div>`;
}

function lh8(f: LetterheadFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;width:100%;max-width:595px;min-height:842px;background:#ffffff;color:#1a1a1a;position:relative;display:flex;flex-direction:column;">
  <div style="padding:30px 40px 20px;background:#18181b;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <img src="${LOGO_URL}" alt="STB Cybersecurity letterhead logo" width="36" height="36" loading="lazy" style="border-radius:6px;" />
      <div>
        <div style="font-size:16px;font-weight:800;color:#ffffff;letter-spacing:2px;">${f.companyName.toUpperCase()}</div>
        <div style="font-size:9px;color:#f97316;letter-spacing:1px;">INCIDENT REPORT</div>
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:10px;">
      <tr>
        <td style="padding:6px 10px;border:1px solid #3f3f46;color:#a1a1aa;width:100px;">SEVERITY</td>
        <td style="padding:6px 10px;border:1px solid #3f3f46;color:#ffffff;font-weight:600;"><span style="display:inline-block;width:10px;height:10px;background:#f97316;border-radius:50%;margin-right:6px;vertical-align:middle;"></span>HIGH</td>
        <td style="padding:6px 10px;border:1px solid #3f3f46;color:#a1a1aa;width:100px;">DATE</td>
        <td style="padding:6px 10px;border:1px solid #3f3f46;color:#ffffff;font-weight:600;">${f.date}</td>
      </tr>
      <tr>
        <td style="padding:6px 10px;border:1px solid #3f3f46;color:#a1a1aa;">CASE NUMBER</td>
        <td style="padding:6px 10px;border:1px solid #3f3f46;color:#ffffff;font-weight:600;">${f.referenceNumber}</td>
        <td style="padding:6px 10px;border:1px solid #3f3f46;color:#a1a1aa;">CLASSIFICATION</td>
        <td style="padding:6px 10px;border:1px solid #3f3f46;color:#f97316;font-weight:700;">CONFIDENTIAL</td>
      </tr>
      <tr>
        <td style="padding:6px 10px;border:1px solid #3f3f46;color:#a1a1aa;">ANALYST</td>
        <td colspan="3" style="padding:6px 10px;border:1px solid #3f3f46;color:#ffffff;">[Analyst Name]</td>
      </tr>
    </table>
  </div>
  <div style="height:3px;background:#f97316;"></div>
  <div style="flex:1;padding:30px 40px;">
    <div style="font-size:16px;font-weight:700;color:#18181b;margin-bottom:20px;">${f.documentTitle}</div>
    <div style="font-size:12px;color:#52525b;line-height:1.8;">
      <p>[Document content goes here]</p>
      <p style="margin-top:12px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </div>
  </div>
  <div style="padding:14px 40px;border-top:2px solid #18181b;font-size:9px;color:#a1a1aa;display:flex;justify-content:space-between;">
    <span>${f.companyName} &bull; ${f.website}</span>
    <span>${f.phone} &bull; ${f.email}</span>
  </div>
</div>`;
}

function lh9(f: LetterheadFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;width:100%;max-width:595px;min-height:842px;background:#ffffff;color:#1a1a1a;position:relative;display:flex;flex-direction:column;">
  <div style="position:absolute;left:0;top:0;bottom:0;width:48px;overflow:hidden;opacity:0.07;font-family:'Courier New',Consolas,monospace;font-size:11px;line-height:1.4;color:#18181b;padding:10px 6px;word-break:break-all;">01001001011011100111010001100101011011000110110001101001011001110110010101101110011000110110010100100000010100100110010101110000011011110111001001110100001000000101001101010100010000100100001101010011001000000101001101100101011000110111010101110010011010010111010001111001001000000100110101101111011011100110100101110100011011110111001001101001011011100110011100100000001001100010000001010100011010000111001001100101011000010111010000100000010000010110111001100001011011000111100101110011011010010111001100100000001001100010000001001001011011100110001101101001011001000110010101101110011101000010000001010010011001010111001101110000011011110110111001110011011001010010000001010011011001010111001001110110011010010110001101100101011100110010000000100110001000000101000001100101011011100110010101110100011100100110000101110100011010010110111101101110</div>
  <div style="padding:40px 50px 20px 60px;display:flex;justify-content:space-between;align-items:flex-start;">
    <div style="display:flex;align-items:center;gap:12px;">
      <img src="${LOGO_URL}" alt="STB Cybersecurity letterhead logo" width="44" height="44" loading="lazy" style="border-radius:8px;" />
      <div>
        <div style="font-size:18px;font-weight:800;color:#18181b;letter-spacing:2px;">${f.companyName.toUpperCase()}</div>
        <div style="font-size:9px;color:#71717a;letter-spacing:1px;">DIGITAL INTELLIGENCE DIVISION</div>
      </div>
    </div>
    <div style="text-align:right;font-size:10px;color:#a1a1aa;">
      <div>${f.phone}</div>
      <div>${f.email}</div>
    </div>
  </div>
  <div style="height:2px;background:linear-gradient(90deg,#18181b 60%,#f97316 60%,#f97316);margin:0 50px 0 60px;"></div>
  <div style="flex:1;padding:30px 50px 30px 60px;">
    <div style="display:flex;justify-content:space-between;font-size:10px;color:#a1a1aa;margin-bottom:20px;">
      <span>Date: ${f.date}</span>
      <span>Ref: ${f.referenceNumber}</span>
    </div>
    <div style="font-size:16px;font-weight:700;color:#18181b;margin-bottom:20px;">${f.documentTitle}</div>
    <div style="font-size:12px;color:#52525b;line-height:1.8;">
      <p>[Document content goes here]</p>
      <p style="margin-top:12px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </div>
  </div>
  <div style="padding:14px 50px 14px 60px;border-top:1px solid #e4e4e7;font-size:9px;color:#a1a1aa;text-align:center;">
    ${f.address}, ${f.city} &bull; ${f.phone} &bull; ${f.email} &bull; <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">${f.website}</a>
  </div>
</div>`;
}

function lh10(f: LetterheadFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;width:100%;max-width:595px;min-height:842px;background:#ffffff;color:#1a1a1a;position:relative;display:flex;flex-direction:column;">
  <div style="background:#18181b;padding:30px 40px;position:relative;overflow:hidden;">
    <div style="position:absolute;top:-20px;left:-10px;display:flex;flex-wrap:wrap;width:120%;opacity:0.12;">
      ${Array.from({length:48}, (_,i) => `<div style="width:40px;height:36px;background:transparent;border:1px solid #f97316;clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);margin:-5px 2px;${i === 14 ? 'opacity:1;' : ''}"></div>`).join('')}
    </div>
    <div style="position:relative;z-index:1;display:flex;align-items:center;gap:14px;">
      <div style="width:52px;height:46px;display:flex;align-items:center;justify-content:center;border:2px solid #f97316;clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);">
        <img src="${LOGO_URL}" alt="STB Cybersecurity letterhead logo" width="30" height="30" loading="lazy" style="border-radius:4px;" />
      </div>
      <div>
        <div style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:3px;">${f.companyName.toUpperCase()}</div>
        <div style="font-size:9px;color:#f97316;letter-spacing:2px;">HONEYCOMB SECURE NETWORK</div>
      </div>
    </div>
  </div>
  <div style="height:4px;background:linear-gradient(90deg,#f97316,#ea580c,#f97316);"></div>
  <div style="flex:1;padding:30px 50px;">
    <div style="display:flex;justify-content:space-between;font-size:10px;color:#a1a1aa;margin-bottom:20px;">
      <span>Date: ${f.date}</span>
      <span>Ref: ${f.referenceNumber}</span>
    </div>
    <div style="font-size:16px;font-weight:700;color:#18181b;margin-bottom:20px;">${f.documentTitle}</div>
    <div style="font-size:12px;color:#52525b;line-height:1.8;">
      <p>[Document content goes here]</p>
      <p style="margin-top:12px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </div>
  </div>
  <div style="padding:14px 50px;border-top:1px solid #e4e4e7;font-size:9px;color:#a1a1aa;text-align:center;">
    ${f.address}, ${f.city} &bull; ${f.phone} &bull; ${f.email} &bull; <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">${f.website}</a>
  </div>
</div>`;
}

function lh11(f: LetterheadFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;width:100%;max-width:595px;min-height:842px;background:#ffffff;color:#1a1a1a;position:relative;display:flex;flex-direction:column;overflow:hidden;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:72px;font-weight:900;color:rgba(249,115,22,0.04);letter-spacing:16px;white-space:nowrap;pointer-events:none;user-select:none;">FIREWALL PROTECTED</div>
  <div style="height:6px;background:repeating-linear-gradient(90deg,#f97316 0px,#f97316 30px,#ea580c 30px,#ea580c 32px,transparent 32px,transparent 40px);"></div>
  <div style="padding:30px 50px 20px;display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;align-items:center;gap:10px;">
      <img src="${LOGO_URL}" alt="STB Cybersecurity letterhead logo" width="36" height="36" loading="lazy" style="border-radius:6px;" />
      <div>
        <div style="font-size:16px;font-weight:800;color:#18181b;letter-spacing:2px;">${f.companyName.toUpperCase()}</div>
        <div style="font-size:9px;color:#f97316;letter-spacing:1px;">FIREWALL PROTECTED COMMUNICATIONS</div>
      </div>
    </div>
    <div style="background:#18181b;color:#f97316;font-size:8px;font-weight:700;padding:4px 10px;border-radius:2px;letter-spacing:1px;">SECURED</div>
  </div>
  <div style="height:2px;background:#18181b;margin:0 50px;"></div>
  <div style="flex:1;padding:30px 50px;position:relative;z-index:1;">
    <div style="display:flex;justify-content:space-between;font-size:10px;color:#a1a1aa;margin-bottom:20px;">
      <span>Date: ${f.date}</span>
      <span>Ref: ${f.referenceNumber}</span>
    </div>
    <div style="font-size:16px;font-weight:700;color:#18181b;margin-bottom:20px;">${f.documentTitle}</div>
    <div style="font-size:12px;color:#52525b;line-height:1.8;">
      <p>[Document content goes here]</p>
      <p style="margin-top:12px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </div>
  </div>
  <div style="height:6px;background:repeating-linear-gradient(90deg,#f97316 0px,#f97316 30px,#ea580c 30px,#ea580c 32px,transparent 32px,transparent 40px);"></div>
  <div style="padding:14px 50px;font-size:9px;color:#a1a1aa;text-align:center;">
    ${f.address}, ${f.city} &bull; ${f.phone} &bull; ${f.email} &bull; <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">${f.website}</a>
  </div>
</div>`;
}

function lh12(f: LetterheadFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;width:100%;max-width:595px;min-height:842px;background:#0c0c0e;color:#e4e4e7;position:relative;display:flex;flex-direction:column;">
  <div style="padding:36px 50px 20px;display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;align-items:center;gap:12px;">
      <img src="${LOGO_URL}" alt="STB Cybersecurity letterhead logo" width="44" height="44" loading="lazy" style="border-radius:8px;" />
      <div>
        <div style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:3px;">${f.companyName.toUpperCase()}</div>
        <div style="font-size:9px;color:#71717a;letter-spacing:2px;">DIGITAL-ONLY SECURE DOCUMENT</div>
      </div>
    </div>
    <div style="text-align:right;font-size:10px;color:#52525b;">
      <div>${f.website}</div>
    </div>
  </div>
  <div style="height:3px;background:linear-gradient(90deg,#f97316,#ea580c,transparent);margin:0 50px;"></div>
  <div style="padding:16px 50px;display:flex;gap:30px;font-size:10px;color:#71717a;">
    <span>Date: <span style="color:#a1a1aa;">${f.date}</span></span>
    <span>Ref: <span style="color:#a1a1aa;">${f.referenceNumber}</span></span>
  </div>
  <div style="height:1px;background:#27272a;margin:0 50px;"></div>
  <div style="flex:1;padding:30px 50px;">
    <div style="font-size:16px;font-weight:700;color:#ffffff;margin-bottom:20px;">${f.documentTitle}</div>
    <div style="font-size:12px;color:#a1a1aa;line-height:1.8;">
      <p>[Document content goes here]</p>
      <p style="margin-top:12px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </div>
  </div>
  <div style="height:3px;background:linear-gradient(90deg,transparent,#f97316,#ea580c);margin:0 50px;"></div>
  <div style="padding:14px 50px;font-size:9px;color:#52525b;display:flex;justify-content:space-between;">
    <span>${f.address}, ${f.city}</span>
    <span>${f.phone} &bull; ${f.email} &bull; <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">${f.website}</a></span>
  </div>
</div>`;
}

const letterheads = [
  { id: 1, name: "Executive", desc: "Centered logo with orange horizontal rule — clean and authoritative", render: lh1 },
  { id: 2, name: "Tactical Ops", desc: "Dark sidebar with vertical company text — modern operational style", render: lh2 },
  { id: 3, name: "Classified", desc: "TOP SECRET stamp with redacted-bar aesthetic — intelligence document style", render: lh3 },
  { id: 4, name: "Modern Minimal", desc: "Small logo with thin orange accent line — clean sans-serif design", render: lh4 },
  { id: 5, name: "Full Bleed Header", desc: "Large dark header band with centered branding — bold and impactful", render: lh5 },
  { id: 6, name: "Technical Brief", desc: "Engineering grid background with structured header table — detailed and precise", render: lh6 },
  { id: 7, name: "Consulting", desc: "Elegant layout with subtle watermark — professional consulting feel", render: lh7 },
  { id: 8, name: "Incident Report", desc: "Structured header with severity and classification fields — security operations", render: lh8 },
  { id: 9, name: "Binary Stream", desc: "Binary digits running down the left margin — subtle tech feel with clean body", render: lh9 },
  { id: 10, name: "Honeycomb", desc: "Hexagonal honeycomb pattern header with orange accents — geometric and modern", render: lh10 },
  { id: 11, name: "Firewall", desc: "FIREWALL PROTECTED watermark with orange line pattern header — bold and secure", render: lh11 },
  { id: 12, name: "Dark Mode", desc: "Full dark background for digital-only documents — modern with orange dividers", render: lh12 },
];

export default function Letterheads() {
  const [fields, setFields] = useState<LetterheadFields>(defaultFields);
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState<number | null>(null);
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const active = letterheads[activeIdx];

  function handleCopy(idx: number) {
    const html = letterheads[idx].render(fields);

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
      navigator.clipboard.write([
        new ClipboardItem({ "text/html": blob, "text/plain": plainBlob }),
      ]).then(() => {
        setCopied(idx);
        toast({ title: "Letterhead copied!", description: "Paste it into your document editor." });
        setTimeout(() => setCopied(null), 2500);
      }).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  function handlePrint() {
    const html = active.render(fields);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html><html><head><title>${active.name} Letterhead</title><style>@page{margin:0;}body{margin:0;padding:0;}</style></head><body>${html}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  }

  const prev = () => setActiveIdx(i => (i - 1 + letterheads.length) % letterheads.length);
  const next = () => setActiveIdx(i => (i + 1) % letterheads.length);

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/brand-kit" data-testid="link-back-brand-kit">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Brand Kit
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <FileText className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wider" data-testid="text-page-title">
              PDF LETTERHEADS
            </h1>
          </div>
          <p className="text-zinc-400 text-sm">Professional letterhead templates matching the STB Cybersecurity brand</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/80 border-zinc-800 p-5 lg:col-span-1">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-500" />
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
                <Label className="text-zinc-400 text-xs">Address</Label>
                <Input
                  data-testid="input-address"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.address}
                  onChange={e => setFields(p => ({ ...p, address: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">City / State / ZIP</Label>
                <Input
                  data-testid="input-city"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.city}
                  onChange={e => setFields(p => ({ ...p, city: e.target.value }))}
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
                <Label className="text-zinc-400 text-xs">Email</Label>
                <Input
                  data-testid="input-email"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.email}
                  onChange={e => setFields(p => ({ ...p, email: e.target.value }))}
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
                <Label className="text-zinc-400 text-xs">Document Title</Label>
                <Input
                  data-testid="input-document-title"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.documentTitle}
                  onChange={e => setFields(p => ({ ...p, documentTitle: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Date</Label>
                <Input
                  data-testid="input-date"
                  type="date"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.date}
                  onChange={e => setFields(p => ({ ...p, date: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Reference Number</Label>
                <Input
                  data-testid="input-reference-number"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.referenceNumber}
                  onChange={e => setFields(p => ({ ...p, referenceNumber: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800">
              <h4 className="text-zinc-400 text-xs font-semibold mb-3 uppercase tracking-wider">All Styles</h4>
              <div className="space-y-2">
                {letterheads.map((s, i) => (
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
                <p className="text-zinc-500 text-xs">{activeIdx + 1} of {letterheads.length}</p>
              </div>
              <Button variant="outline" size="sm" onClick={next} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" data-testid="button-next">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <Card className="bg-zinc-900/80 border-zinc-800 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-zinc-500 text-xs flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Live Preview (A4 Proportion)
                </span>
                <div className="flex gap-2">
                  <Button
                    data-testid="button-print"
                    size="sm"
                    variant="outline"
                    onClick={handlePrint}
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    <Printer className="h-4 w-4 mr-1" /> Print / PDF
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

              <div className="bg-zinc-300 rounded-lg p-4 flex justify-center">
                <div
                  ref={previewRef}
                  style={{ width: "100%", maxWidth: 595, aspectRatio: "210/297", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.3)", borderRadius: 4 }}
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
                    <li>Fill in your company details on the left</li>
                    <li>Choose a letterhead style from the list</li>
                    <li>Click "Copy HTML" to copy the template markup</li>
                    <li>Or click "Print / PDF" to save as a PDF document</li>
                    <li>Paste into your HTML editor or use the PDF in your workflow</li>
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