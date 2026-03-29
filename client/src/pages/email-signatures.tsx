import { useState, useRef } from "react";
import { Link } from "wouter";
import { Shield, Copy, Check, ChevronLeft, ChevronRight, Globe, Phone, Mail, MapPin, Lock, Zap, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const SITE_URL = "https://www.stbcybersecurity.com";
const LOGO_URL = `${SITE_URL}/brand/icon-shield.png`;

interface SigFields {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
}

const defaultFields: SigFields = {
  name: "Your Name",
  title: "Cybersecurity Analyst",
  email: "contact@stbcybersecurity.com",
  phone: "+1 (555) 000-0000",
  location: "United States",
};

function sig1(f: SigFields) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e4e4e7;max-width:520px;">
  <tr>
    <td style="padding-right:18px;vertical-align:top;border-right:3px solid #f97316;">
      <img src="${LOGO_URL}" alt="STB Cybersecurity email signature logo" width="70" height="70" loading="lazy" style="display:block;border-radius:12px;" />
    </td>
    <td style="padding-left:18px;vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:18px;font-weight:700;color:#ffffff;padding-bottom:2px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${f.name}</td></tr>
        <tr><td style="font-size:13px;color:#f97316;padding-bottom:8px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${f.title}</td></tr>
        <tr><td style="font-size:17px;font-weight:700;color:#f97316;padding-bottom:6px;letter-spacing:2px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">STB CYBERSECURITY</td></tr>
        <tr><td style="font-size:12px;color:#a1a1aa;padding-bottom:2px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">&#9993; ${f.email}</td></tr>
        <tr><td style="font-size:12px;color:#a1a1aa;padding-bottom:2px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">&#9742; ${f.phone}</td></tr>
        <tr><td style="font-size:12px;color:#a1a1aa;padding-bottom:6px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">&#127760; <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">stbcybersecurity.com</a></td></tr>
        <tr><td style="font-size:10px;color:#52525b;padding-top:6px;border-top:1px solid #27272a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Threat Intelligence &bull; Incident Response &bull; Security Monitoring</td></tr>
      </table>
    </td>
  </tr>
</table>`;
}

function sig2(f: SigFields) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:540px;background:#18181b;border-radius:12px;overflow:hidden;">
  <tr>
    <td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:16px 20px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="vertical-align:middle;"><img src="${LOGO_URL}" alt="STB Cybersecurity email signature logo" width="48" height="48" loading="lazy" style="display:block;border-radius:10px;border:2px solid rgba(255,255,255,0.3);" /></td>
          <td style="padding-left:14px;vertical-align:middle;">
            <div style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:1.5px;">STBCS</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.85);letter-spacing:3px;text-transform:uppercase;">Cybersecurity</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:16px 20px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:17px;font-weight:700;color:#ffffff;padding-bottom:2px;">${f.name}</td></tr>
        <tr><td style="font-size:12px;color:#f97316;padding-bottom:10px;text-transform:uppercase;letter-spacing:1px;">${f.title}</td></tr>
        <tr><td style="font-size:12px;color:#a1a1aa;padding-bottom:3px;">&#9993; <a href="mailto:${f.email}" style="color:#d4d4d8;text-decoration:none;">${f.email}</a></td></tr>
        <tr><td style="font-size:12px;color:#a1a1aa;padding-bottom:3px;">&#9742; ${f.phone}</td></tr>
        <tr><td style="font-size:12px;color:#a1a1aa;padding-bottom:3px;">&#128205; ${f.location}</td></tr>
        <tr><td style="font-size:12px;color:#a1a1aa;">&#127760; <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;font-weight:600;">www.stbcybersecurity.com</a></td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0 20px 14px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #27272a;">
        <tr><td style="font-size:10px;color:#52525b;padding-top:10px;">&#128274; Protecting Digital Assets 24/7 &bull; Threat Intelligence &bull; Incident Response</td></tr>
      </table>
    </td>
  </tr>
</table>`;
}

function sig3(f: SigFields) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:520px;">
  <tr>
    <td style="padding-bottom:12px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;"><img src="${LOGO_URL}" alt="STB Cybersecurity email signature logo" width="44" height="44" loading="lazy" style="display:block;border-radius:8px;" /></td>
          <td style="padding-left:10px;vertical-align:middle;">
            <div style="font-size:16px;font-weight:700;color:#ffffff;">${f.name}</div>
            <div style="font-size:11px;color:#71717a;">${f.title} &mdash; <span style="color:#f97316;font-weight:600;">STB Cybersecurity</span></div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="border-top:2px solid #f97316;padding-top:10px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size:12px;color:#a1a1aa;padding-right:20px;">&#9993; <a href="mailto:${f.email}" style="color:#d4d4d8;text-decoration:none;">${f.email}</a></td>
          <td style="font-size:12px;color:#a1a1aa;padding-right:20px;">&#9742; ${f.phone}</td>
          <td style="font-size:12px;color:#a1a1aa;">&#127760; <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">stbcybersecurity.com</a></td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-top:8px;">
      <div style="font-size:10px;color:#3f3f46;letter-spacing:0.5px;">THREAT INTEL &bull; MONITORING &bull; INCIDENT RESPONSE &bull; SECURITY CONSULTING</div>
    </td>
  </tr>
</table>`;
}

function sig4(f: SigFields) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:560px;">
  <tr>
    <td style="vertical-align:top;padding-right:16px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="text-align:center;padding-bottom:6px;"><img src="${LOGO_URL}" alt="STB Cybersecurity email signature logo" width="64" height="64" loading="lazy" style="display:block;border-radius:50%;border:3px solid #f97316;" /></td></tr>
        <tr><td style="text-align:center;font-size:9px;color:#f97316;font-weight:700;letter-spacing:2px;">STBCS</td></tr>
      </table>
    </td>
    <td style="vertical-align:top;border-left:2px solid #27272a;padding-left:16px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:18px;font-weight:800;color:#ffffff;padding-bottom:1px;">${f.name}</td></tr>
        <tr><td style="font-size:12px;color:#f97316;padding-bottom:8px;font-weight:500;">${f.title}</td></tr>
        <tr><td style="font-size:14px;font-weight:700;color:#d4d4d8;padding-bottom:8px;">STB Cybersecurity</td></tr>
        <tr><td>
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-size:11px;color:#71717a;padding-right:6px;">E:</td>
              <td style="font-size:11px;padding-bottom:2px;"><a href="mailto:${f.email}" style="color:#a1a1aa;text-decoration:none;">${f.email}</a></td>
            </tr>
            <tr>
              <td style="font-size:11px;color:#71717a;padding-right:6px;">P:</td>
              <td style="font-size:11px;color:#a1a1aa;padding-bottom:2px;">${f.phone}</td>
            </tr>
            <tr>
              <td style="font-size:11px;color:#71717a;padding-right:6px;">W:</td>
              <td style="font-size:11px;padding-bottom:2px;"><a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">www.stbcybersecurity.com</a></td>
            </tr>
          </table>
        </td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td colspan="2" style="padding-top:12px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#1a1a1e;border-radius:6px;">
        <tr><td style="padding:8px 12px;font-size:10px;color:#52525b;">&#9888;&#65039; This email may contain confidential information. If received in error, please delete and notify the sender.</td></tr>
      </table>
    </td>
  </tr>
</table>`;
}

function sig5(f: SigFields) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:540px;border:1px solid #27272a;border-radius:10px;overflow:hidden;">
  <tr>
    <td style="background:#0c0c0e;padding:18px 22px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="vertical-align:middle;">
            <div style="font-size:22px;font-weight:900;color:#f97316;letter-spacing:3px;">STB</div>
            <div style="font-size:9px;color:#52525b;letter-spacing:4px;text-transform:uppercase;">CYBERSECURITY</div>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <img src="${LOGO_URL}" alt="STB Cybersecurity email signature logo" width="42" height="42" loading="lazy" style="display:inline-block;border-radius:8px;opacity:0.9;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:16px 22px;background:#18181b;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:16px;font-weight:700;color:#ffffff;padding-bottom:2px;">${f.name}</td></tr>
        <tr><td style="font-size:11px;color:#f97316;padding-bottom:12px;text-transform:uppercase;letter-spacing:1.5px;">${f.title}</td></tr>
      </table>
      <table cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #27272a;padding-top:10px;">
        <tr>
          <td style="padding-top:10px;padding-right:24px;">
            <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;padding-bottom:2px;">Email</div>
            <div style="font-size:12px;"><a href="mailto:${f.email}" style="color:#d4d4d8;text-decoration:none;">${f.email}</a></div>
          </td>
          <td style="padding-top:10px;padding-right:24px;">
            <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;padding-bottom:2px;">Phone</div>
            <div style="font-size:12px;color:#d4d4d8;">${f.phone}</div>
          </td>
          <td style="padding-top:10px;">
            <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;padding-bottom:2px;">Web</div>
            <div style="font-size:12px;"><a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">stbcybersecurity.com</a></div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="background:#0c0c0e;padding:10px 22px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="font-size:10px;color:#3f3f46;">&#128274; Securing the Digital Frontier</td>
          <td style="text-align:right;font-size:10px;"><a href="${SITE_URL}/pricing" style="color:#f97316;text-decoration:none;font-weight:600;">Get Protected &rarr;</a></td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

function sig6(f: SigFields) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Courier New',Consolas,monospace;max-width:500px;background:#0a0a0c;border:1px solid #1a1a1e;border-radius:8px;overflow:hidden;">
  <tr>
    <td style="padding:4px 16px;background:#111113;border-bottom:1px solid #1a1a1e;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td><span style="font-size:11px;color:#f97316;">&#9679;</span> <span style="font-size:11px;color:#52525b;">stbcs_terminal</span></td>
          <td style="text-align:right;"><span style="font-size:10px;color:#27272a;">v2.0</span></td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:14px 16px;">
      <div style="font-size:11px;color:#52525b;padding-bottom:4px;">$ whoami</div>
      <div style="font-size:14px;color:#ffffff;font-weight:700;padding-bottom:2px;">${f.name}</div>
      <div style="font-size:11px;color:#f97316;padding-bottom:10px;">${f.title} @ STB Cybersecurity</div>
      <div style="font-size:11px;color:#52525b;padding-bottom:4px;">$ cat contact.conf</div>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:11px;color:#71717a;padding-right:8px;font-family:'Courier New',Consolas,monospace;">email</td><td style="font-size:11px;color:#22c55e;padding-left:8px;font-family:'Courier New',Consolas,monospace;">= <a href="mailto:${f.email}" style="color:#22c55e;text-decoration:none;">${f.email}</a></td></tr>
        <tr><td style="font-size:11px;color:#71717a;padding-right:8px;font-family:'Courier New',Consolas,monospace;">phone</td><td style="font-size:11px;color:#22c55e;padding-left:8px;font-family:'Courier New',Consolas,monospace;">= ${f.phone}</td></tr>
        <tr><td style="font-size:11px;color:#71717a;padding-right:8px;font-family:'Courier New',Consolas,monospace;">web</td><td style="font-size:11px;padding-left:8px;font-family:'Courier New',Consolas,monospace;">= <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">stbcybersecurity.com</a></td></tr>
        <tr><td style="font-size:11px;color:#71717a;padding-right:8px;font-family:'Courier New',Consolas,monospace;">loc</td><td style="font-size:11px;color:#22c55e;padding-left:8px;font-family:'Courier New',Consolas,monospace;">= ${f.location}</td></tr>
      </table>
      <div style="font-size:11px;color:#52525b;padding-top:10px;border-top:1px solid #1a1a1e;margin-top:10px;">$ echo $MISSION</div>
      <div style="font-size:10px;color:#3f3f46;padding-top:2px;">Threat Intelligence | Monitoring | Incident Response</div>
    </td>
  </tr>
</table>`;
}

function sig7(f: SigFields) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:520px;">
  <tr>
    <td style="padding:3px;background:linear-gradient(135deg,#f97316,#ea580c,#c2410c,#f97316);border-radius:14px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#111113;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:18px 22px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="vertical-align:top;width:70px;">
                  <div style="width:64px;height:64px;background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;line-height:64px;">
                    <img src="${LOGO_URL}" alt="STB Cybersecurity email signature logo" width="40" height="40" loading="lazy" style="display:inline-block;border-radius:8px;" />
                  </div>
                </td>
                <td style="padding-left:14px;vertical-align:top;">
                  <div style="font-size:10px;color:#f97316;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding-bottom:4px;">&#9632; CLASSIFIED PERSONNEL</div>
                  <div style="font-size:18px;font-weight:800;color:#ffffff;padding-bottom:2px;">${f.name}</div>
                  <div style="font-size:12px;color:#f97316;padding-bottom:6px;font-weight:600;">${f.title}</div>
                  <div style="font-size:13px;font-weight:700;color:#d4d4d8;letter-spacing:1.5px;padding-bottom:10px;">STB CYBERSECURITY</div>
                </td>
              </tr>
            </table>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #27272a;">
              <tr>
                <td style="padding-top:10px;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="font-size:11px;color:#71717a;padding-right:6px;">&#9993;</td>
                      <td style="font-size:11px;padding-bottom:3px;"><a href="mailto:${f.email}" style="color:#a1a1aa;text-decoration:none;">${f.email}</a></td>
                    </tr>
                    <tr>
                      <td style="font-size:11px;color:#71717a;padding-right:6px;">&#9742;</td>
                      <td style="font-size:11px;color:#a1a1aa;padding-bottom:3px;">${f.phone}</td>
                    </tr>
                    <tr>
                      <td style="font-size:11px;color:#71717a;padding-right:6px;">&#128205;</td>
                      <td style="font-size:11px;color:#a1a1aa;padding-bottom:3px;">${f.location}</td>
                    </tr>
                    <tr>
                      <td style="font-size:11px;color:#71717a;padding-right:6px;">&#127760;</td>
                      <td style="font-size:11px;"><a href="${SITE_URL}" style="color:#f97316;text-decoration:none;font-weight:600;">stbcybersecurity.com</a></td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <div style="margin-top:10px;padding-top:8px;border-top:1px solid #27272a;">
              <div style="font-size:9px;color:#52525b;letter-spacing:2px;text-transform:uppercase;">&#128274; AUTHORIZED SECURITY CLEARANCE &bull; CYBER DEFENSE DIVISION</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

function sig8(f: SigFields) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:560px;overflow:hidden;border-radius:10px;border:1px solid #27272a;">
  <tr>
    <td style="background:#0c0c0e;padding:14px 20px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="vertical-align:middle;">
            <img src="${LOGO_URL}" alt="STB Cybersecurity email signature logo" width="36" height="36" loading="lazy" style="display:inline-block;border-radius:8px;vertical-align:middle;" />
          </td>
          <td style="padding-left:12px;vertical-align:middle;">
            <div style="font-size:16px;font-weight:800;color:#ffffff;letter-spacing:2px;">STB CYBERSECURITY</div>
            <div style="font-size:9px;color:#52525b;letter-spacing:3px;text-transform:uppercase;">SECURITY OPERATIONS CENTER</div>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;margin-right:6px;vertical-align:middle;"></span>
            <span style="font-size:10px;color:#22c55e;font-weight:600;vertical-align:middle;">ONLINE</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="background:#18181b;padding:14px 20px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="vertical-align:top;width:50%;">
            <div style="font-size:16px;font-weight:700;color:#ffffff;padding-bottom:2px;">${f.name}</div>
            <div style="font-size:11px;color:#f97316;padding-bottom:6px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">${f.title}</div>
            <div style="font-size:11px;color:#71717a;padding-bottom:2px;">&#128205; ${f.location}</div>
          </td>
          <td style="vertical-align:top;width:50%;padding-left:16px;border-left:1px solid #27272a;">
            <div style="font-size:11px;color:#a1a1aa;padding-bottom:4px;">&#9993; <a href="mailto:${f.email}" style="color:#d4d4d8;text-decoration:none;">${f.email}</a></div>
            <div style="font-size:11px;color:#a1a1aa;padding-bottom:4px;">&#9742; ${f.phone}</div>
            <div style="font-size:11px;">&#127760; <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;font-weight:600;">stbcybersecurity.com</a></div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="background:#0c0c0e;padding:8px 20px;">
      <div style="font-size:9px;color:#3f3f46;letter-spacing:1px;">24/7 THREAT MONITORING &bull; INCIDENT RESPONSE &bull; DIGITAL FORENSICS &bull; VULNERABILITY MANAGEMENT</div>
    </td>
  </tr>
</table>`;
}

function sig9(f: SigFields) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:540px;">
  <tr>
    <td style="background:linear-gradient(135deg,#7f1d1d,#991b1b,#b91c1c);padding:4px 20px;border-radius:8px 8px 0 0;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="font-size:11px;font-weight:800;color:#fbbf24;letter-spacing:4px;text-transform:uppercase;">&#9888; OFFENSIVE SECURITY</td>
          <td style="text-align:right;">
            <img src="${LOGO_URL}" alt="STB Cybersecurity email signature logo" width="28" height="28" loading="lazy" style="display:inline-block;border-radius:6px;opacity:0.9;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="background:#18181b;padding:16px 20px;">
      <div style="font-size:22px;font-weight:900;color:#ffffff;text-transform:uppercase;letter-spacing:2px;padding-bottom:2px;">${f.name}</div>
      <div style="font-size:13px;color:#f97316;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;padding-bottom:4px;">${f.title}</div>
      <div style="font-size:15px;font-weight:800;color:#ef4444;letter-spacing:2px;padding-bottom:12px;">STB CYBERSECURITY</div>
      <div style="width:100%;height:3px;background:linear-gradient(90deg,#ef4444,#f97316,#ef4444);margin-bottom:12px;"></div>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size:12px;color:#fbbf24;font-weight:700;padding-right:8px;text-transform:uppercase;">E /</td>
          <td style="font-size:12px;padding-bottom:3px;"><a href="mailto:${f.email}" style="color:#d4d4d8;text-decoration:none;">${f.email}</a></td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#fbbf24;font-weight:700;padding-right:8px;text-transform:uppercase;">P /</td>
          <td style="font-size:12px;color:#d4d4d8;padding-bottom:3px;">${f.phone}</td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#fbbf24;font-weight:700;padding-right:8px;text-transform:uppercase;">L /</td>
          <td style="font-size:12px;color:#d4d4d8;padding-bottom:3px;">${f.location}</td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#fbbf24;font-weight:700;padding-right:8px;text-transform:uppercase;">W /</td>
          <td style="font-size:12px;"><a href="${SITE_URL}" style="color:#f97316;text-decoration:none;font-weight:700;">stbcybersecurity.com</a></td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="background:linear-gradient(135deg,#7f1d1d,#991b1b);padding:8px 20px;border-radius:0 0 8px 8px;">
      <div style="font-size:9px;color:#fca5a5;letter-spacing:2px;font-weight:700;text-transform:uppercase;">&#9733; PENETRATION TESTING &bull; RED TEAM OPS &bull; EXPLOIT DEVELOPMENT &bull; ADVERSARY SIMULATION</div>
    </td>
  </tr>
</table>`;
}

function sig10(f: SigFields) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:540px;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e4e4e7;">
  <tr>
    <td style="padding:18px 22px;border-bottom:2px solid #f97316;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="vertical-align:middle;">
            <img src="${LOGO_URL}" alt="STB Cybersecurity email signature logo" width="44" height="44" loading="lazy" style="display:inline-block;border-radius:10px;vertical-align:middle;" />
          </td>
          <td style="padding-left:12px;vertical-align:middle;">
            <div style="font-size:17px;font-weight:700;color:#18181b;letter-spacing:1px;">STB Cybersecurity</div>
            <div style="font-size:10px;color:#71717a;letter-spacing:1px;">Securing the Digital Frontier</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:16px 22px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:17px;font-weight:700;color:#18181b;padding-bottom:2px;">${f.name}</td></tr>
        <tr><td style="font-size:12px;color:#f97316;padding-bottom:10px;font-weight:500;">${f.title}</td></tr>
      </table>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size:12px;color:#52525b;padding-bottom:3px;">&#9993; <a href="mailto:${f.email}" style="color:#18181b;text-decoration:none;">${f.email}</a></td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#52525b;padding-bottom:3px;">&#9742; ${f.phone}</td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#52525b;padding-bottom:3px;">&#128205; ${f.location}</td>
        </tr>
        <tr>
          <td style="font-size:12px;">&#127760; <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;font-weight:600;">www.stbcybersecurity.com</a></td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:10px 22px;background:#fafafa;border-top:1px solid #e4e4e7;">
      <div style="font-size:10px;color:#a1a1aa;">Threat Intelligence &bull; Security Monitoring &bull; Incident Response &bull; Consulting</div>
    </td>
  </tr>
</table>`;
}

function sig11(f: SigFields) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:540px;background:#0a0a0c;border-radius:12px;overflow:hidden;border:2px solid #f97316;box-shadow:0 0 20px rgba(249,115,22,0.15),inset 0 0 20px rgba(249,115,22,0.05);">
  <tr>
    <td style="padding:20px 22px;border-bottom:1px solid rgba(249,115,22,0.2);">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="vertical-align:middle;">
            <div style="font-size:24px;font-weight:900;color:#f97316;letter-spacing:4px;text-shadow:0 0 10px rgba(249,115,22,0.5);">STB</div>
            <div style="font-size:9px;color:#71717a;letter-spacing:5px;text-transform:uppercase;">CYBERSECURITY</div>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <img src="${LOGO_URL}" alt="STB Cybersecurity email signature logo" width="48" height="48" loading="lazy" style="display:inline-block;border-radius:10px;border:2px solid rgba(249,115,22,0.4);" />
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:18px 22px;">
      <div style="font-size:20px;font-weight:800;color:#ffffff;padding-bottom:3px;text-shadow:0 0 8px rgba(249,115,22,0.3);">${f.name}</div>
      <div style="font-size:12px;color:#f97316;padding-bottom:14px;text-transform:uppercase;letter-spacing:2px;font-weight:600;text-shadow:0 0 6px rgba(249,115,22,0.3);">${f.title}</div>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:11px;color:#a1a1aa;padding-bottom:4px;">&#9993; <a href="mailto:${f.email}" style="color:#d4d4d8;text-decoration:none;">${f.email}</a></td></tr>
        <tr><td style="font-size:11px;color:#a1a1aa;padding-bottom:4px;">&#9742; ${f.phone}</td></tr>
        <tr><td style="font-size:11px;color:#a1a1aa;padding-bottom:4px;">&#128205; ${f.location}</td></tr>
        <tr><td style="font-size:11px;">&#127760; <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;font-weight:600;text-shadow:0 0 6px rgba(249,115,22,0.3);">stbcybersecurity.com</a></td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:10px 22px;background:rgba(249,115,22,0.05);border-top:1px solid rgba(249,115,22,0.2);">
      <div style="font-size:9px;color:#f97316;letter-spacing:3px;text-transform:uppercase;text-shadow:0 0 4px rgba(249,115,22,0.4);">&#9889; NEON PULSE &bull; ALWAYS ON &bull; ALWAYS WATCHING</div>
    </td>
  </tr>
</table>`;
}

function sig12(f: SigFields) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:520px;background:#18181b;border-radius:12px;overflow:hidden;border:2px solid #3f3f46;">
  <tr>
    <td style="background:#27272a;padding:8px 16px;border-bottom:3px solid #f97316;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="font-size:10px;font-weight:800;color:#f97316;letter-spacing:3px;text-transform:uppercase;">&#128737; SECURITY BADGE</td>
          <td style="text-align:right;font-size:9px;color:#52525b;letter-spacing:2px;">STB CYBERSECURITY</td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="vertical-align:top;width:80px;">
            <div style="width:72px;height:72px;background:#27272a;border-radius:8px;border:2px solid #3f3f46;display:table-cell;vertical-align:middle;text-align:center;">
              <img src="${LOGO_URL}" alt="STB Cybersecurity email signature logo" width="48" height="48" loading="lazy" style="display:inline-block;border-radius:6px;" />
            </div>
          </td>
          <td style="padding-left:14px;vertical-align:top;">
            <div style="font-size:18px;font-weight:800;color:#ffffff;padding-bottom:2px;">${f.name}</div>
            <div style="font-size:11px;color:#f97316;padding-bottom:4px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">${f.title}</div>
            <div style="font-size:10px;color:#71717a;padding-bottom:6px;">CLEARANCE: <span style="color:#22c55e;font-weight:700;">AUTHORIZED</span></div>
            <table cellpadding="0" cellspacing="0" border="0">
              <tr><td style="font-size:11px;color:#a1a1aa;padding-bottom:2px;">&#9993; <a href="mailto:${f.email}" style="color:#d4d4d8;text-decoration:none;">${f.email}</a></td></tr>
              <tr><td style="font-size:11px;color:#a1a1aa;padding-bottom:2px;">&#9742; ${f.phone}</td></tr>
              <tr><td style="font-size:11px;color:#a1a1aa;">&#128205; ${f.location}</td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0 16px 12px;">
      <div style="font-size:11px;padding-bottom:6px;">&#127760; <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;font-weight:600;">www.stbcybersecurity.com</a></div>
      <div style="background:#27272a;border-radius:4px;padding:6px 10px;font-family:'Courier New',Consolas,monospace;">
        <div style="font-size:8px;color:#52525b;letter-spacing:6px;text-align:center;">&#9612;&#9612;&#9615;&#9612;&#9615;&#9612;&#9612;&#9615;&#9612;&#9612;&#9615;&#9612;&#9615;&#9615;&#9612;&#9612;&#9615;&#9612;&#9612;&#9615;&#9612;&#9615;&#9612;&#9612;&#9615;&#9612;&#9612;&#9615;&#9612;</div>
        <div style="font-size:7px;color:#3f3f46;text-align:center;padding-top:2px;letter-spacing:1px;">ID-STBCS-VERIFIED</div>
      </div>
    </td>
  </tr>
</table>`;
}

function sig13(f: SigFields) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:540px;border-collapse:separate;">
  <tr>
    <td style="background:#0c0c0e;padding:12px 16px;border:1px solid #27272a;border-right:none;border-radius:8px 0 0 0;">
      <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;padding-bottom:4px;">OPERATOR</div>
      <div style="font-size:17px;font-weight:800;color:#ffffff;">${f.name}</div>
      <div style="font-size:11px;color:#f97316;font-weight:600;text-transform:uppercase;letter-spacing:1px;">${f.title}</div>
    </td>
    <td style="background:#0c0c0e;padding:12px 16px;border:1px solid #27272a;border-left:1px solid #27272a;border-radius:0 8px 0 0;">
      <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;padding-bottom:4px;">CONTACT</div>
      <div style="font-size:11px;color:#a1a1aa;padding-bottom:2px;">&#9993; <a href="mailto:${f.email}" style="color:#d4d4d8;text-decoration:none;">${f.email}</a></div>
      <div style="font-size:11px;color:#a1a1aa;padding-bottom:2px;">&#9742; ${f.phone}</div>
      <div style="font-size:11px;color:#a1a1aa;">&#128205; ${f.location}</div>
    </td>
  </tr>
  <tr>
    <td style="background:#111113;padding:10px 16px;border:1px solid #27272a;border-top:none;border-right:none;border-radius:0 0 0 8px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;padding-right:8px;">
            <img src="${LOGO_URL}" alt="STB Cybersecurity email signature logo" width="28" height="28" loading="lazy" style="display:block;border-radius:6px;" />
          </td>
          <td style="vertical-align:middle;">
            <div style="font-size:12px;font-weight:700;color:#d4d4d8;letter-spacing:1px;">STB CYBERSECURITY</div>
            <div style="font-size:10px;">&#127760; <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">stbcybersecurity.com</a></div>
          </td>
        </tr>
      </table>
    </td>
    <td style="background:#111113;padding:10px 16px;border:1px solid #27272a;border-top:none;border-left:1px solid #27272a;border-radius:0 0 8px 0;">
      <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;padding-bottom:4px;">THREAT STATUS</div>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right:12px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;vertical-align:middle;margin-right:4px;"></span>
            <span style="font-size:10px;color:#22c55e;vertical-align:middle;">NETWORK</span>
          </td>
          <td style="padding-right:12px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f97316;vertical-align:middle;margin-right:4px;"></span>
            <span style="font-size:10px;color:#f97316;vertical-align:middle;">ALERTS</span>
          </td>
          <td>
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;vertical-align:middle;margin-right:4px;"></span>
            <span style="font-size:10px;color:#22c55e;vertical-align:middle;">SECURE</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

function sig14(f: SigFields) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:500px;background:#0a0a0a;border-radius:4px;overflow:hidden;border:1px solid #1a1a1a;">
  <tr>
    <td style="padding:16px 20px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="vertical-align:middle;">
            <div style="font-size:15px;font-weight:700;color:#a1a1aa;letter-spacing:1px;">${f.name}</div>
            <div style="font-size:10px;color:#3f3f46;padding-top:2px;text-transform:uppercase;letter-spacing:2px;">${f.title}</div>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <img src="${LOGO_URL}" alt="STB Cybersecurity email signature logo" width="28" height="28" loading="lazy" style="display:inline-block;border-radius:4px;opacity:0.4;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0 20px;">
      <div style="height:1px;background:#1a1a1a;"></div>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 20px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:10px;color:#27272a;padding-bottom:3px;">&#9993; <a href="mailto:${f.email}" style="color:#52525b;text-decoration:none;">${f.email}</a></td></tr>
        <tr><td style="font-size:10px;color:#27272a;padding-bottom:3px;">&#9742; <span style="color:#52525b;">${f.phone}</span></td></tr>
        <tr><td style="font-size:10px;">&#127760; <a href="${SITE_URL}" style="color:#3f3f46;text-decoration:none;">stbcybersecurity.com</a></td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:8px 20px 12px;">
      <div style="display:flex;gap:4px;">
        <span style="display:inline-block;width:40px;height:6px;background:#1a1a1a;border-radius:1px;"></span>
        <span style="display:inline-block;width:60px;height:6px;background:#1a1a1a;border-radius:1px;"></span>
        <span style="display:inline-block;width:30px;height:6px;background:#1a1a1a;border-radius:1px;"></span>
        <span style="display:inline-block;width:50px;height:6px;background:#1a1a1a;border-radius:1px;"></span>
      </div>
      <div style="font-size:8px;color:#1a1a1a;padding-top:6px;letter-spacing:4px;text-transform:uppercase;">STEALTH OPERATIONS &bull; ${f.location}</div>
    </td>
  </tr>
</table>`;
}

function sig15(f: SigFields) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:540px;background:#0c0c0e;border-radius:12px;overflow:hidden;border:2px solid #27272a;">
  <tr>
    <td style="padding:4px 0;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="padding:0 20px;">
            <div style="border:2px solid #3f3f46;border-radius:8px;overflow:hidden;">
              <div style="background:repeating-linear-gradient(90deg,#27272a 0px,#27272a 8px,transparent 8px,transparent 16px);height:6px;"></div>
              <div style="padding:16px 18px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="vertical-align:top;">
                      <div style="width:56px;height:56px;background:linear-gradient(135deg,#f97316,#ea580c);border-radius:50%;text-align:center;line-height:56px;border:3px solid #27272a;">
                        <img src="${LOGO_URL}" alt="STB Cybersecurity email signature logo" width="34" height="34" loading="lazy" style="display:inline-block;border-radius:6px;vertical-align:middle;" />
                      </div>
                    </td>
                    <td style="padding-left:14px;vertical-align:top;">
                      <div style="font-size:19px;font-weight:800;color:#ffffff;padding-bottom:2px;">${f.name}</div>
                      <div style="font-size:11px;color:#f97316;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;padding-bottom:4px;">${f.title}</div>
                      <div style="font-size:14px;font-weight:700;color:#d4d4d8;letter-spacing:1px;">STB CYBERSECURITY</div>
                    </td>
                  </tr>
                </table>
                <table cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;border-top:1px solid #27272a;padding-top:10px;" width="100%">
                  <tr>
                    <td style="font-size:11px;color:#a1a1aa;padding-bottom:3px;">&#9993; <a href="mailto:${f.email}" style="color:#d4d4d8;text-decoration:none;">${f.email}</a></td>
                  </tr>
                  <tr>
                    <td style="font-size:11px;color:#a1a1aa;padding-bottom:3px;">&#9742; ${f.phone}</td>
                  </tr>
                  <tr>
                    <td style="font-size:11px;color:#a1a1aa;padding-bottom:3px;">&#128205; ${f.location}</td>
                  </tr>
                  <tr>
                    <td style="font-size:11px;">&#127760; <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;font-weight:600;">stbcybersecurity.com</a></td>
                  </tr>
                </table>
              </div>
              <div style="background:#18181b;padding:8px 18px;border-top:1px solid #27272a;">
                <div style="font-size:9px;color:#f97316;font-weight:700;letter-spacing:3px;text-transform:uppercase;text-align:center;">&#9632; FORTIFIED COMMUNICATIONS &#9632;</div>
              </div>
              <div style="background:repeating-linear-gradient(90deg,#27272a 0px,#27272a 8px,transparent 8px,transparent 16px);height:6px;"></div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

const signatures = [
  { id: 1, name: "Executive Classic", desc: "Clean vertical divider with orange accent — professional and authoritative", render: sig1 },
  { id: 2, name: "Command Center", desc: "Orange gradient header card — bold, branded, modern", render: sig2 },
  { id: 3, name: "Tactical Minimal", desc: "Compact inline layout with orange rule — perfect for high-volume email", render: sig3 },
  { id: 4, name: "Intelligence Brief", desc: "Circular badge with structured fields — formal intelligence aesthetic", render: sig4 },
  { id: 5, name: "Operations Panel", desc: "Dark panel with labeled sections — sleek ops-center feel", render: sig5 },
  { id: 6, name: "Terminal Hacker", desc: "Monospace terminal theme — the cybersec classic for tech-forward teams", render: sig6 },
  { id: 7, name: "Cyber Shield", desc: "Shield-shaped badge with gradient border — classified top-secret styling", render: sig7 },
  { id: 8, name: "SOC Operator", desc: "Two-row dark banner layout with status indicator — security operations center feel", render: sig8 },
  { id: 9, name: "Red Team", desc: "Aggressive red/orange styling with angular dividers — offensive security aesthetic", render: sig9 },
  { id: 10, name: "Corporate Clean", desc: "Light-mode professional design with subtle orange accents — ideal for non-tech recipients", render: sig10 },
  { id: 11, name: "Neon Pulse", desc: "Dark background with neon glow effect around borders — futuristic and electrifying", render: sig11 },
  { id: 12, name: "Badge ID", desc: "ID card / badge style with clearance level and barcode — lanyard-inspired identity", render: sig12 },
  { id: 13, name: "Threat Matrix", desc: "Grid/matrix layout with threat status indicators — tactical operations dashboard feel", render: sig13 },
  { id: 14, name: "Stealth Ops", desc: "Ultra-minimal dark design with redacted-style bars — covert and barely visible", render: sig14 },
  { id: 15, name: "Digital Fortress", desc: "Fortress-inspired geometric border with shield emblem — medieval meets cyber defense", render: sig15 },
];

export default function EmailSignatures() {
  const [fields, setFields] = useState<SigFields>(defaultFields);
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState<number | null>(null);
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const active = signatures[activeIdx];

  function handleCopy(idx: number) {
    const html = signatures[idx].render(fields);

    function fallbackCopy() {
      const ta = document.createElement("textarea");
      ta.value = html;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(idx);
      toast({ title: "HTML copied!", description: "Paste the HTML into your email signature editor." });
      setTimeout(() => setCopied(null), 2500);
    }

    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      const blob = new Blob([html], { type: "text/html" });
      const plainBlob = new Blob([html], { type: "text/plain" });
      navigator.clipboard.write([
        new ClipboardItem({ "text/html": blob, "text/plain": plainBlob }),
      ]).then(() => {
        setCopied(idx);
        toast({ title: "Signature copied!", description: "Paste it into your email client's signature settings." });
        setTimeout(() => setCopied(null), 2500);
      }).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  const prev = () => setActiveIdx(i => (i - 1 + signatures.length) % signatures.length);
  const next = () => setActiveIdx(i => (i + 1) % signatures.length);

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4">
          <Link href="/brand-kit" className="text-zinc-400 hover:text-orange-400 transition-colors text-sm" data-testid="link-back-brand-kit">
            ← Back to Brand Kit
          </Link>
        </div>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Shield className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wider" data-testid="text-page-title">
              STBCS EMAIL SIGNATURES
            </h1>
          </div>
          <p className="text-zinc-400 text-sm">Professional email signatures matching the STB Cybersecurity brand</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/80 border-zinc-800 p-5 lg:col-span-1">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 text-orange-500" />
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
                <Label className="text-zinc-400 text-xs">Location</Label>
                <Input
                  data-testid="input-location"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.location}
                  onChange={e => setFields(p => ({ ...p, location: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800">
              <h4 className="text-zinc-400 text-xs font-semibold mb-3 uppercase tracking-wider">All Styles</h4>
              <div className="space-y-2">
                {signatures.map((s, i) => (
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
              <Button variant="outline" size="sm" onClick={prev} className="border-zinc-500 text-zinc-300 hover:bg-zinc-800" data-testid="button-prev">
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <div className="text-center">
                <h2 className="text-white font-bold text-lg" data-testid="text-active-style">{active.name}</h2>
                <p className="text-zinc-500 text-xs">{activeIdx + 1} of {signatures.length}</p>
              </div>
              <Button variant="outline" size="sm" onClick={next} className="border-zinc-500 text-zinc-300 hover:bg-zinc-800" data-testid="button-next">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <Card className="bg-zinc-900/80 border-zinc-800 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-zinc-500 text-xs flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Live Preview
                </span>
                <Button
                  data-testid={`button-copy-${active.id}`}
                  size="sm"
                  onClick={() => handleCopy(activeIdx)}
                  className={`transition-all ${copied === activeIdx ? "bg-green-600 hover:bg-green-600" : "bg-orange-600 hover:bg-orange-500"}`}
                >
                  {copied === activeIdx ? <><Check className="h-4 w-4 mr-1" /> Copied!</> : <><Copy className="h-4 w-4 mr-1" /> Copy Signature</>}
                </Button>
              </div>

              <div className="bg-zinc-950 rounded-lg p-6 border border-zinc-800">
                <div className="mb-4 pb-4 border-b border-zinc-800/50">
                  <div className="text-zinc-600 text-xs space-y-1">
                    <div><span className="text-zinc-500">From:</span> {fields.name} &lt;{fields.email}&gt;</div>
                    <div><span className="text-zinc-500">To:</span> recipient@example.com</div>
                    <div><span className="text-zinc-500">Subject:</span> Security Assessment Follow-Up</div>
                  </div>
                </div>
                <div className="text-zinc-400 text-sm mb-6">
                  <p>Hi,</p>
                  <p className="mt-2">Thank you for your interest in our cybersecurity services. I've attached the security assessment report for your review.</p>
                  <p className="mt-2">Best regards,</p>
                </div>
                <div className="border-t border-zinc-800/50 pt-4">
                  <div
                    ref={previewRef}
                    dangerouslySetInnerHTML={{ __html: active.render(fields) }}
                  />
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
                    <li>Pick a style you like</li>
                    <li>Click <strong className="text-orange-400">Copy Signature</strong></li>
                    <li><strong className="text-white">Gmail:</strong> Settings &rarr; See all settings &rarr; Signature &rarr; Paste</li>
                    <li><strong className="text-white">Outlook:</strong> Settings &rarr; Mail &rarr; Compose &rarr; Email signature &rarr; Paste</li>
                    <li><strong className="text-white">Apple Mail:</strong> Preferences &rarr; Signatures &rarr; Paste</li>
                  </ol>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {signatures.map((s, i) => (
                <button
                  key={s.id}
                  data-testid={`button-thumbnail-${s.id}`}
                  onClick={() => setActiveIdx(i)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    i === activeIdx
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-500"
                  }`}
                >
                  <div className="text-xs font-semibold text-white mb-1">{s.name}</div>
                  <div className="transform scale-[0.35] origin-top-left h-[60px] overflow-hidden pointer-events-none">
                    <div dangerouslySetInnerHTML={{ __html: s.render(fields) }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}