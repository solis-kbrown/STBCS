import { useState, useRef } from "react";
import { Shield, Copy, Check, ChevronLeft, ChevronRight, Eye, Zap, ArrowLeft, Printer, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const SITE_URL = "https://www.stbcybersecurity.com";
const LOGO_URL = `${SITE_URL}/brand/icon-shield.png`;

interface InvoiceFields {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  notes: string;
}

interface LineItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

const sampleItems: LineItem[] = [
  { description: "Vulnerability Assessment & Penetration Testing", qty: 1, rate: 4500, amount: 4500 },
  { description: "Security Monitoring Setup (Monthly)", qty: 3, rate: 1200, amount: 3600 },
  { description: "Incident Response Consultation (Hours)", qty: 8, rate: 275, amount: 2200 },
];

const defaultFields: InvoiceFields = {
  companyName: "STB Cybersecurity",
  companyAddress: "123 Cyber Lane, Suite 100, Security City, ST 00000",
  companyPhone: "+1 (555) 000-0000",
  companyEmail: "billing@stbcybersecurity.com",
  clientName: "John Smith",
  clientCompany: "Acme Corporation",
  clientAddress: "456 Business Ave, Suite 200, Enterprise City, EN 11111",
  invoiceNumber: "INV-2026-001",
  invoiceDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
  paymentTerms: "Net 30",
  notes: "Thank you for your business. Payment is due within 30 days of invoice date.",
};

function calcSubtotal() { return sampleItems.reduce((s, i) => s + i.amount, 0); }
function calcTax() { return Math.round(calcSubtotal() * 0.08 * 100) / 100; }
function calcTotal() { return calcSubtotal() + calcTax(); }
function fmt(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function lineItemsTable(style: "light" | "dark" | "orange") {
  const bg = style === "dark" ? "#18181b" : style === "orange" ? "#7c2d12" : "#f4f4f5";
  const headerBg = style === "dark" ? "#0c0c0e" : style === "orange" ? "#9a3412" : "#e4e4e7";
  const textColor = style === "light" ? "#18181b" : "#e4e4e7";
  const subtextColor = style === "light" ? "#52525b" : "#a1a1aa";
  const borderColor = style === "light" ? "#d4d4d8" : "#27272a";

  return `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;border-collapse:collapse;margin:16px 0;">
  <tr style="background:${headerBg};">
    <td style="padding:10px 12px;font-size:11px;font-weight:700;color:${textColor};text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;width:50%;">Description</td>
    <td style="padding:10px 12px;font-size:11px;font-weight:700;color:${textColor};text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;text-align:center;width:10%;">Qty</td>
    <td style="padding:10px 12px;font-size:11px;font-weight:700;color:${textColor};text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;text-align:right;width:20%;">Rate</td>
    <td style="padding:10px 12px;font-size:11px;font-weight:700;color:${textColor};text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;text-align:right;width:20%;">Amount</td>
  </tr>
  ${sampleItems.map((item, i) => `<tr style="background:${i % 2 === 0 ? bg : headerBg};">
    <td style="padding:10px 12px;font-size:12px;color:${textColor};border-bottom:1px solid ${borderColor};">${item.description}</td>
    <td style="padding:10px 12px;font-size:12px;color:${subtextColor};text-align:center;border-bottom:1px solid ${borderColor};">${item.qty}</td>
    <td style="padding:10px 12px;font-size:12px;color:${subtextColor};text-align:right;border-bottom:1px solid ${borderColor};">${fmt(item.rate)}</td>
    <td style="padding:10px 12px;font-size:12px;color:${textColor};text-align:right;border-bottom:1px solid ${borderColor};font-weight:600;">${fmt(item.amount)}</td>
  </tr>`).join("")}
  <tr><td colspan="2" style="padding:0;"></td>
    <td style="padding:8px 12px;font-size:12px;color:${subtextColor};text-align:right;border-top:1px solid ${borderColor};">Subtotal</td>
    <td style="padding:8px 12px;font-size:12px;color:${textColor};text-align:right;border-top:1px solid ${borderColor};">${fmt(calcSubtotal())}</td>
  </tr>
  <tr><td colspan="2" style="padding:0;"></td>
    <td style="padding:4px 12px;font-size:12px;color:${subtextColor};text-align:right;">Tax (8%)</td>
    <td style="padding:4px 12px;font-size:12px;color:${textColor};text-align:right;">${fmt(calcTax())}</td>
  </tr>
  <tr><td colspan="2" style="padding:0;"></td>
    <td style="padding:10px 12px;font-size:14px;font-weight:800;color:#f97316;text-align:right;border-top:2px solid #f97316;">TOTAL</td>
    <td style="padding:10px 12px;font-size:14px;font-weight:800;color:#f97316;text-align:right;border-top:2px solid #f97316;">${fmt(calcTotal())}</td>
  </tr>
</table>`;
}

function inv1(f: InvoiceFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:680px;background:#ffffff;color:#18181b;padding:40px;border:1px solid #e4e4e7;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="vertical-align:top;">
        <img src="${LOGO_URL}" alt="STBCS" width="50" height="50" style="display:block;border-radius:10px;" />
        <div style="font-size:18px;font-weight:800;color:#18181b;margin-top:8px;letter-spacing:1px;">${f.companyName}</div>
        <div style="font-size:11px;color:#71717a;margin-top:2px;">${f.companyAddress}</div>
        <div style="font-size:11px;color:#71717a;">${f.companyPhone} | ${f.companyEmail}</div>
      </td>
      <td style="text-align:right;vertical-align:top;">
        <div style="font-size:28px;font-weight:900;color:#f97316;letter-spacing:2px;">INVOICE</div>
        <div style="font-size:12px;color:#71717a;margin-top:4px;">${f.invoiceNumber}</div>
        <div style="font-size:11px;color:#a1a1aa;margin-top:2px;">Date: ${f.invoiceDate}</div>
        <div style="font-size:11px;color:#a1a1aa;">Due: ${f.dueDate}</div>
      </td>
    </tr>
  </table>
  <div style="height:2px;background:#f97316;margin:20px 0;"></div>
  <table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="vertical-align:top;width:50%;">
        <div style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Bill To</div>
        <div style="font-size:14px;font-weight:700;color:#18181b;">${f.clientName}</div>
        <div style="font-size:12px;color:#52525b;">${f.clientCompany}</div>
        <div style="font-size:11px;color:#71717a;">${f.clientAddress}</div>
      </td>
      <td style="vertical-align:top;text-align:right;">
        <div style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Payment Terms</div>
        <div style="font-size:13px;color:#18181b;font-weight:600;">${f.paymentTerms}</div>
      </td>
    </tr>
  </table>
  ${lineItemsTable("light")}
  <div style="margin-top:24px;padding:12px 16px;background:#fafafa;border-left:3px solid #f97316;border-radius:4px;">
    <div style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Notes</div>
    <div style="font-size:12px;color:#52525b;">${f.notes}</div>
  </div>
  <div style="margin-top:24px;text-align:center;padding-top:16px;border-top:1px solid #e4e4e7;">
    <div style="font-size:10px;color:#a1a1aa;">${f.companyName} | ${f.companyAddress} | <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">stbcybersecurity.com</a></div>
  </div>
</div>`;
}

function inv2(f: InvoiceFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:680px;background:#09090b;color:#e4e4e7;padding:0;border:1px solid #27272a;border-radius:12px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#18181b,#0c0c0e);padding:30px 36px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:middle;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align:middle;"><img src="${LOGO_URL}" alt="STBCS" width="44" height="44" style="display:block;border-radius:10px;border:2px solid #f97316;" /></td>
              <td style="padding-left:12px;vertical-align:middle;">
                <div style="font-size:16px;font-weight:800;color:#ffffff;letter-spacing:1px;">${f.companyName}</div>
                <div style="font-size:10px;color:#71717a;letter-spacing:2px;text-transform:uppercase;">CYBERSECURITY SERVICES</div>
              </td>
            </tr>
          </table>
        </td>
        <td style="text-align:right;vertical-align:middle;">
          <div style="font-size:24px;font-weight:900;color:#f97316;letter-spacing:3px;">INVOICE</div>
          <div style="font-size:11px;color:#52525b;margin-top:2px;">${f.invoiceNumber}</div>
        </td>
      </tr>
    </table>
  </div>
  <div style="padding:24px 36px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:top;width:50%;">
          <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">From</div>
          <div style="font-size:12px;color:#a1a1aa;">${f.companyAddress}</div>
          <div style="font-size:12px;color:#a1a1aa;">${f.companyPhone}</div>
          <div style="font-size:12px;color:#f97316;">${f.companyEmail}</div>
        </td>
        <td style="vertical-align:top;width:50%;">
          <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Bill To</div>
          <div style="font-size:13px;color:#ffffff;font-weight:700;">${f.clientName}</div>
          <div style="font-size:12px;color:#a1a1aa;">${f.clientCompany}</div>
          <div style="font-size:12px;color:#a1a1aa;">${f.clientAddress}</div>
        </td>
      </tr>
    </table>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:16px;">
      <tr>
        <td style="padding:8px 12px;background:#18181b;border-radius:6px;margin-right:8px;">
          <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Date</div>
          <div style="font-size:12px;color:#e4e4e7;font-weight:600;">${f.invoiceDate}</div>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:8px 12px;background:#18181b;border-radius:6px;">
          <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Due Date</div>
          <div style="font-size:12px;color:#e4e4e7;font-weight:600;">${f.dueDate}</div>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:8px 12px;background:#18181b;border-radius:6px;">
          <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Terms</div>
          <div style="font-size:12px;color:#f97316;font-weight:600;">${f.paymentTerms}</div>
        </td>
      </tr>
    </table>
    ${lineItemsTable("dark")}
    <div style="margin-top:20px;padding:12px 16px;background:#18181b;border-left:3px solid #f97316;border-radius:6px;">
      <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Notes</div>
      <div style="font-size:12px;color:#71717a;">${f.notes}</div>
    </div>
  </div>
  <div style="padding:16px 36px;background:#0c0c0e;border-top:1px solid #27272a;">
    <div style="font-size:10px;color:#3f3f46;text-align:center;">${f.companyName} | <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">stbcybersecurity.com</a> | Securing the Digital Frontier</div>
  </div>
</div>`;
}

function inv3(f: InvoiceFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:680px;background:#ffffff;color:#18181b;padding:40px;border:1px solid #e4e4e7;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="vertical-align:top;">
        <img src="${LOGO_URL}" alt="STBCS" width="44" height="44" style="display:block;border-radius:8px;" />
        <div style="font-size:16px;font-weight:800;color:#18181b;margin-top:6px;">${f.companyName}</div>
        <div style="font-size:10px;color:#f97316;text-transform:uppercase;letter-spacing:2px;">CONSULTING SERVICES</div>
      </td>
      <td style="text-align:right;vertical-align:top;">
        <div style="font-size:22px;font-weight:900;color:#18181b;">CONSULTING<br/><span style="color:#f97316;">INVOICE</span></div>
        <div style="font-size:11px;color:#71717a;margin-top:4px;">${f.invoiceNumber}</div>
      </td>
    </tr>
  </table>
  <div style="height:1px;background:#e4e4e7;margin:20px 0;"></div>
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:16px;">
    <tr>
      <td style="vertical-align:top;width:50%;">
        <div style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Client</div>
        <div style="font-size:14px;font-weight:700;color:#18181b;">${f.clientName}</div>
        <div style="font-size:12px;color:#52525b;">${f.clientCompany}</div>
        <div style="font-size:11px;color:#71717a;">${f.clientAddress}</div>
      </td>
      <td style="vertical-align:top;text-align:right;">
        <div style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Engagement Details</div>
        <div style="font-size:12px;color:#52525b;">Period: ${f.invoiceDate} — ${f.dueDate}</div>
        <div style="font-size:12px;color:#52525b;">Terms: ${f.paymentTerms}</div>
      </td>
    </tr>
  </table>
  <div style="padding:12px 16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;margin-bottom:16px;">
    <div style="font-size:11px;color:#9a3412;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Engagement Summary</div>
    <div style="font-size:12px;color:#78350f;margin-top:4px;">Security consulting engagement including vulnerability assessment, penetration testing, and remediation advisory services. Hourly rate breakdown below.</div>
  </div>
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:16px 0;">
    <tr style="background:#f4f4f5;">
      <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#18181b;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;width:40%;">Service</td>
      <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#18181b;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;text-align:center;width:15%;">Hours</td>
      <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#18181b;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;text-align:right;width:20%;">Rate/Hr</td>
      <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#18181b;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;text-align:right;width:25%;">Amount</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:10px 12px;font-size:12px;color:#18181b;border-bottom:1px solid #e4e4e7;">Vulnerability Assessment</td>
      <td style="padding:10px 12px;font-size:12px;color:#52525b;text-align:center;border-bottom:1px solid #e4e4e7;">16</td>
      <td style="padding:10px 12px;font-size:12px;color:#52525b;text-align:right;border-bottom:1px solid #e4e4e7;">$275.00</td>
      <td style="padding:10px 12px;font-size:12px;color:#18181b;text-align:right;border-bottom:1px solid #e4e4e7;font-weight:600;">$4,400.00</td>
    </tr>
    <tr style="background:#f4f4f5;">
      <td style="padding:10px 12px;font-size:12px;color:#18181b;border-bottom:1px solid #e4e4e7;">Penetration Testing</td>
      <td style="padding:10px 12px;font-size:12px;color:#52525b;text-align:center;border-bottom:1px solid #e4e4e7;">24</td>
      <td style="padding:10px 12px;font-size:12px;color:#52525b;text-align:right;border-bottom:1px solid #e4e4e7;">$325.00</td>
      <td style="padding:10px 12px;font-size:12px;color:#18181b;text-align:right;border-bottom:1px solid #e4e4e7;font-weight:600;">$7,800.00</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:10px 12px;font-size:12px;color:#18181b;border-bottom:1px solid #e4e4e7;">Remediation Advisory</td>
      <td style="padding:10px 12px;font-size:12px;color:#52525b;text-align:center;border-bottom:1px solid #e4e4e7;">8</td>
      <td style="padding:10px 12px;font-size:12px;color:#52525b;text-align:right;border-bottom:1px solid #e4e4e7;">$250.00</td>
      <td style="padding:10px 12px;font-size:12px;color:#18181b;text-align:right;border-bottom:1px solid #e4e4e7;font-weight:600;">$2,000.00</td>
    </tr>
    <tr><td colspan="2" style="padding:0;"></td>
      <td style="padding:8px 12px;font-size:12px;color:#52525b;text-align:right;border-top:1px solid #e4e4e7;">Subtotal</td>
      <td style="padding:8px 12px;font-size:12px;color:#18181b;text-align:right;border-top:1px solid #e4e4e7;">$14,200.00</td>
    </tr>
    <tr><td colspan="2" style="padding:0;"></td>
      <td style="padding:4px 12px;font-size:12px;color:#52525b;text-align:right;">Tax (8%)</td>
      <td style="padding:4px 12px;font-size:12px;color:#18181b;text-align:right;">$1,136.00</td>
    </tr>
    <tr><td colspan="2" style="padding:0;"></td>
      <td style="padding:10px 12px;font-size:14px;font-weight:800;color:#f97316;text-align:right;border-top:2px solid #f97316;">TOTAL</td>
      <td style="padding:10px 12px;font-size:14px;font-weight:800;color:#f97316;text-align:right;border-top:2px solid #f97316;">$15,336.00</td>
    </tr>
  </table>
  <div style="margin-top:20px;padding:12px 16px;background:#fafafa;border-left:3px solid #f97316;border-radius:4px;">
    <div style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Notes</div>
    <div style="font-size:12px;color:#52525b;">${f.notes}</div>
  </div>
  <div style="margin-top:24px;text-align:center;padding-top:16px;border-top:1px solid #e4e4e7;">
    <div style="font-size:10px;color:#a1a1aa;">${f.companyName} | <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">stbcybersecurity.com</a></div>
  </div>
</div>`;
}

function inv4(f: InvoiceFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:680px;background:#09090b;color:#e4e4e7;padding:0;border:1px solid #27272a;border-radius:12px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#7c2d12,#9a3412);padding:24px 36px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:middle;">
          <div style="font-size:10px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:3px;">SECURITY ASSESSMENT</div>
          <div style="font-size:22px;font-weight:900;color:#ffffff;margin-top:4px;">BILLING STATEMENT</div>
        </td>
        <td style="text-align:right;vertical-align:middle;">
          <img src="${LOGO_URL}" alt="STBCS" width="48" height="48" style="display:inline-block;border-radius:10px;border:2px solid rgba(255,255,255,0.3);" />
        </td>
      </tr>
    </table>
  </div>
  <div style="padding:24px 36px;">
    <div style="padding:16px;background:#18181b;border-radius:8px;border:1px solid #27272a;margin-bottom:20px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="width:25%;padding-right:12px;">
            <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Assessment ID</div>
            <div style="font-size:12px;color:#f97316;font-weight:700;margin-top:2px;">${f.invoiceNumber}</div>
          </td>
          <td style="width:25%;padding-right:12px;">
            <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Date</div>
            <div style="font-size:12px;color:#e4e4e7;margin-top:2px;">${f.invoiceDate}</div>
          </td>
          <td style="width:25%;padding-right:12px;">
            <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Due</div>
            <div style="font-size:12px;color:#e4e4e7;margin-top:2px;">${f.dueDate}</div>
          </td>
          <td style="width:25%;">
            <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Classification</div>
            <div style="font-size:12px;color:#ef4444;font-weight:700;margin-top:2px;">CONFIDENTIAL</div>
          </td>
        </tr>
      </table>
    </div>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td style="vertical-align:top;width:50%;">
          <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Assessor</div>
          <div style="font-size:14px;color:#ffffff;font-weight:700;">${f.companyName}</div>
          <div style="font-size:11px;color:#71717a;">${f.companyAddress}</div>
          <div style="font-size:11px;color:#f97316;">${f.companyEmail}</div>
        </td>
        <td style="vertical-align:top;width:50%;">
          <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Client Organization</div>
          <div style="font-size:14px;color:#ffffff;font-weight:700;">${f.clientName}</div>
          <div style="font-size:12px;color:#a1a1aa;">${f.clientCompany}</div>
          <div style="font-size:11px;color:#71717a;">${f.clientAddress}</div>
        </td>
      </tr>
    </table>
    <div style="padding:12px 16px;background:#18181b;border-left:3px solid #ef4444;border-radius:6px;margin-bottom:16px;">
      <div style="font-size:10px;color:#ef4444;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Findings Summary</div>
      <div style="font-size:12px;color:#a1a1aa;margin-top:4px;">Critical: 2 | High: 5 | Medium: 12 | Low: 8 — Total vulnerabilities assessed: 27</div>
    </div>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:16px 0;">
      <tr style="background:#0c0c0e;">
        <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#e4e4e7;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;width:45%;">Scope Item</td>
        <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#e4e4e7;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;text-align:center;width:15%;">Findings</td>
        <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#e4e4e7;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;text-align:right;width:20%;">Cost</td>
        <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#e4e4e7;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;text-align:right;width:20%;">Remediation</td>
      </tr>
      <tr style="background:#18181b;">
        <td style="padding:10px 12px;font-size:12px;color:#e4e4e7;border-bottom:1px solid #27272a;">Network Penetration Testing</td>
        <td style="padding:10px 12px;font-size:12px;color:#ef4444;text-align:center;border-bottom:1px solid #27272a;font-weight:600;">7 Critical</td>
        <td style="padding:10px 12px;font-size:12px;color:#e4e4e7;text-align:right;border-bottom:1px solid #27272a;">$5,500.00</td>
        <td style="padding:10px 12px;font-size:12px;color:#e4e4e7;text-align:right;border-bottom:1px solid #27272a;">$2,200.00</td>
      </tr>
      <tr style="background:#0c0c0e;">
        <td style="padding:10px 12px;font-size:12px;color:#e4e4e7;border-bottom:1px solid #27272a;">Web Application Assessment</td>
        <td style="padding:10px 12px;font-size:12px;color:#f97316;text-align:center;border-bottom:1px solid #27272a;font-weight:600;">12 High</td>
        <td style="padding:10px 12px;font-size:12px;color:#e4e4e7;text-align:right;border-bottom:1px solid #27272a;">$4,200.00</td>
        <td style="padding:10px 12px;font-size:12px;color:#e4e4e7;text-align:right;border-bottom:1px solid #27272a;">$1,800.00</td>
      </tr>
      <tr style="background:#18181b;">
        <td style="padding:10px 12px;font-size:12px;color:#e4e4e7;border-bottom:1px solid #27272a;">Social Engineering Test</td>
        <td style="padding:10px 12px;font-size:12px;color:#eab308;text-align:center;border-bottom:1px solid #27272a;font-weight:600;">8 Medium</td>
        <td style="padding:10px 12px;font-size:12px;color:#e4e4e7;text-align:right;border-bottom:1px solid #27272a;">$3,000.00</td>
        <td style="padding:10px 12px;font-size:12px;color:#e4e4e7;text-align:right;border-bottom:1px solid #27272a;">$1,500.00</td>
      </tr>
      <tr><td colspan="2" style="padding:0;"></td>
        <td style="padding:10px 12px;font-size:14px;font-weight:800;color:#f97316;text-align:right;border-top:2px solid #f97316;">TOTAL</td>
        <td style="padding:10px 12px;font-size:14px;font-weight:800;color:#f97316;text-align:right;border-top:2px solid #f97316;">$18,200.00</td>
      </tr>
    </table>
    <div style="margin-top:20px;padding:12px 16px;background:#18181b;border-left:3px solid #f97316;border-radius:6px;">
      <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Notes</div>
      <div style="font-size:12px;color:#71717a;">${f.notes}</div>
    </div>
  </div>
  <div style="padding:16px 36px;background:#0c0c0e;border-top:1px solid #27272a;">
    <div style="font-size:10px;color:#3f3f46;text-align:center;">${f.companyName} | <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">stbcybersecurity.com</a></div>
  </div>
</div>`;
}

function inv5(f: InvoiceFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:680px;background:#ffffff;color:#18181b;padding:40px;border:1px solid #e4e4e7;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="vertical-align:top;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:middle;"><img src="${LOGO_URL}" alt="STBCS" width="40" height="40" style="display:block;border-radius:8px;" /></td>
            <td style="padding-left:10px;vertical-align:middle;">
              <div style="font-size:15px;font-weight:800;color:#18181b;">${f.companyName}</div>
              <div style="font-size:10px;color:#f97316;text-transform:uppercase;letter-spacing:2px;">MANAGED SECURITY</div>
            </td>
          </tr>
        </table>
      </td>
      <td style="text-align:right;vertical-align:top;">
        <div style="display:inline-block;padding:6px 16px;background:#f97316;color:#ffffff;font-size:12px;font-weight:800;letter-spacing:2px;border-radius:4px;">RETAINER INVOICE</div>
        <div style="font-size:11px;color:#71717a;margin-top:6px;">${f.invoiceNumber}</div>
      </td>
    </tr>
  </table>
  <div style="height:1px;background:#e4e4e7;margin:20px 0;"></div>
  <table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="vertical-align:top;width:50%;">
        <div style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Client</div>
        <div style="font-size:14px;font-weight:700;color:#18181b;">${f.clientName}</div>
        <div style="font-size:12px;color:#52525b;">${f.clientCompany}</div>
      </td>
      <td style="vertical-align:top;text-align:right;">
        <div style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Service Period</div>
        <div style="font-size:13px;color:#18181b;font-weight:600;">${f.invoiceDate} — ${f.dueDate}</div>
      </td>
    </tr>
  </table>
  <div style="margin:20px 0;padding:16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="width:33%;text-align:center;border-right:1px solid #fed7aa;">
          <div style="font-size:9px;color:#9a3412;text-transform:uppercase;letter-spacing:1px;">Monthly Retainer</div>
          <div style="font-size:20px;font-weight:900;color:#f97316;margin-top:4px;">$5,500</div>
        </td>
        <td style="width:33%;text-align:center;border-right:1px solid #fed7aa;">
          <div style="font-size:9px;color:#9a3412;text-transform:uppercase;letter-spacing:1px;">Included Hours</div>
          <div style="font-size:20px;font-weight:900;color:#18181b;margin-top:4px;">40 hrs</div>
        </td>
        <td style="width:33%;text-align:center;">
          <div style="font-size:9px;color:#9a3412;text-transform:uppercase;letter-spacing:1px;">Overage Rate</div>
          <div style="font-size:20px;font-weight:900;color:#18181b;margin-top:4px;">$175/hr</div>
        </td>
      </tr>
    </table>
  </div>
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:16px 0;">
    <tr style="background:#f4f4f5;">
      <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#18181b;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;width:50%;">Service</td>
      <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#18181b;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;text-align:center;width:15%;">Hours</td>
      <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#18181b;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;text-align:right;width:35%;">Status</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:10px 12px;font-size:12px;color:#18181b;border-bottom:1px solid #e4e4e7;">24/7 Security Monitoring</td>
      <td style="padding:10px 12px;font-size:12px;color:#52525b;text-align:center;border-bottom:1px solid #e4e4e7;">Continuous</td>
      <td style="padding:10px 12px;font-size:12px;text-align:right;border-bottom:1px solid #e4e4e7;"><span style="color:#22c55e;font-weight:600;">&#9679; Active</span></td>
    </tr>
    <tr style="background:#f4f4f5;">
      <td style="padding:10px 12px;font-size:12px;color:#18181b;border-bottom:1px solid #e4e4e7;">Threat Intelligence Feeds</td>
      <td style="padding:10px 12px;font-size:12px;color:#52525b;text-align:center;border-bottom:1px solid #e4e4e7;">Included</td>
      <td style="padding:10px 12px;font-size:12px;text-align:right;border-bottom:1px solid #e4e4e7;"><span style="color:#22c55e;font-weight:600;">&#9679; Active</span></td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:10px 12px;font-size:12px;color:#18181b;border-bottom:1px solid #e4e4e7;">Incident Response (On-Call)</td>
      <td style="padding:10px 12px;font-size:12px;color:#52525b;text-align:center;border-bottom:1px solid #e4e4e7;">12 / 40</td>
      <td style="padding:10px 12px;font-size:12px;text-align:right;border-bottom:1px solid #e4e4e7;"><span style="color:#f97316;font-weight:600;">30% Used</span></td>
    </tr>
    <tr style="background:#f4f4f5;">
      <td style="padding:10px 12px;font-size:12px;color:#18181b;border-bottom:1px solid #e4e4e7;">Vulnerability Scanning</td>
      <td style="padding:10px 12px;font-size:12px;color:#52525b;text-align:center;border-bottom:1px solid #e4e4e7;">8 / 40</td>
      <td style="padding:10px 12px;font-size:12px;text-align:right;border-bottom:1px solid #e4e4e7;"><span style="color:#22c55e;font-weight:600;">20% Used</span></td>
    </tr>
    <tr><td style="padding:0;"></td>
      <td colspan="2" style="padding:10px 12px;text-align:right;border-top:2px solid #f97316;">
        <span style="font-size:12px;color:#52525b;">Monthly Retainer: </span>
        <span style="font-size:16px;font-weight:900;color:#f97316;">$5,500.00</span>
        <div style="font-size:11px;color:#71717a;margin-top:2px;">No overage this period (20 hours remaining)</div>
      </td>
    </tr>
  </table>
  <div style="margin-top:20px;padding:12px 16px;background:#fafafa;border-left:3px solid #f97316;border-radius:4px;">
    <div style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Payment Terms</div>
    <div style="font-size:12px;color:#52525b;">${f.paymentTerms} — ${f.notes}</div>
  </div>
  <div style="margin-top:24px;text-align:center;padding-top:16px;border-top:1px solid #e4e4e7;">
    <div style="font-size:10px;color:#a1a1aa;">${f.companyName} | <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">stbcybersecurity.com</a></div>
  </div>
</div>`;
}

function inv6(f: InvoiceFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:680px;background:#09090b;color:#e4e4e7;padding:0;border:1px solid #27272a;border-radius:12px;overflow:hidden;">
  <div style="padding:30px 36px;border-bottom:1px solid #27272a;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:middle;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align:middle;"><img src="${LOGO_URL}" alt="STBCS" width="44" height="44" style="display:block;border-radius:10px;" /></td>
              <td style="padding-left:12px;vertical-align:middle;">
                <div style="font-size:16px;font-weight:800;color:#ffffff;">${f.companyName}</div>
                <div style="font-size:10px;color:#71717a;letter-spacing:2px;text-transform:uppercase;">CYBERSECURITY SERVICES</div>
              </td>
            </tr>
          </table>
        </td>
        <td style="text-align:right;vertical-align:middle;">
          <div style="display:inline-block;padding:6px 16px;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;font-size:14px;font-weight:900;letter-spacing:2px;border-radius:6px;">PROPOSAL</div>
        </td>
      </tr>
    </table>
  </div>
  <div style="padding:24px 36px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td style="vertical-align:top;width:50%;">
          <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Prepared For</div>
          <div style="font-size:14px;color:#ffffff;font-weight:700;">${f.clientName}</div>
          <div style="font-size:12px;color:#a1a1aa;">${f.clientCompany}</div>
          <div style="font-size:11px;color:#71717a;">${f.clientAddress}</div>
        </td>
        <td style="vertical-align:top;text-align:right;">
          <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Quote Details</div>
          <div style="font-size:12px;color:#e4e4e7;">${f.invoiceNumber}</div>
          <div style="font-size:12px;color:#a1a1aa;">Date: ${f.invoiceDate}</div>
          <div style="font-size:12px;color:#f97316;font-weight:600;">Valid Until: ${f.dueDate}</div>
        </td>
      </tr>
    </table>
    <div style="padding:16px;background:#18181b;border:1px solid #27272a;border-radius:8px;margin-bottom:20px;">
      <div style="font-size:11px;color:#f97316;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Proposed Services</div>
      <div style="font-size:12px;color:#a1a1aa;line-height:1.6;">We propose a comprehensive cybersecurity engagement including vulnerability assessment, penetration testing, security architecture review, and ongoing monitoring services. This proposal outlines tiered pricing options for your consideration.</div>
    </div>
    <div style="font-size:10px;color:#52525b;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;font-weight:700;">Pricing Tiers</div>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin-bottom:16px;">
      <tr>
        <td style="width:33%;padding:16px;background:#18181b;border:1px solid #27272a;border-radius:8px 0 0 0;vertical-align:top;">
          <div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Essential</div>
          <div style="font-size:24px;font-weight:900;color:#e4e4e7;margin:8px 0;">$8,500</div>
          <div style="font-size:11px;color:#71717a;line-height:1.5;">&#8226; Vulnerability Assessment<br/>&#8226; Basic Penetration Test<br/>&#8226; Summary Report<br/>&#8226; Email Support</div>
        </td>
        <td style="width:4px;"></td>
        <td style="width:33%;padding:16px;background:#18181b;border:2px solid #f97316;border-radius:0;vertical-align:top;position:relative;">
          <div style="font-size:9px;color:#f97316;text-transform:uppercase;letter-spacing:1px;font-weight:800;">&#9733; RECOMMENDED</div>
          <div style="font-size:10px;color:#f97316;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Professional</div>
          <div style="font-size:24px;font-weight:900;color:#f97316;margin:8px 0;">$15,500</div>
          <div style="font-size:11px;color:#a1a1aa;line-height:1.5;">&#8226; Full Penetration Testing<br/>&#8226; Architecture Review<br/>&#8226; Detailed Report<br/>&#8226; 30-Day Support<br/>&#8226; Remediation Guidance</div>
        </td>
        <td style="width:4px;"></td>
        <td style="width:33%;padding:16px;background:#18181b;border:1px solid #27272a;border-radius:0 8px 0 0;vertical-align:top;">
          <div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Enterprise</div>
          <div style="font-size:24px;font-weight:900;color:#e4e4e7;margin:8px 0;">$28,000</div>
          <div style="font-size:11px;color:#71717a;line-height:1.5;">&#8226; Everything in Professional<br/>&#8226; Red Team Exercise<br/>&#8226; Social Engineering<br/>&#8226; 90-Day Monitoring<br/>&#8226; Executive Briefing<br/>&#8226; Priority Support</div>
        </td>
      </tr>
    </table>
    <div style="margin-top:20px;padding:12px 16px;background:#18181b;border-left:3px solid #f97316;border-radius:6px;">
      <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Terms & Conditions</div>
      <div style="font-size:12px;color:#71717a;">${f.paymentTerms} — ${f.notes}</div>
    </div>
    <div style="margin-top:20px;text-align:center;">
      <div style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;font-size:14px;font-weight:800;border-radius:8px;letter-spacing:1px;">ACCEPT PROPOSAL</div>
      <div style="font-size:10px;color:#52525b;margin-top:8px;">Reply to ${f.companyEmail} to accept this proposal</div>
    </div>
  </div>
  <div style="padding:16px 36px;background:#0c0c0e;border-top:1px solid #27272a;">
    <div style="font-size:10px;color:#3f3f46;text-align:center;">${f.companyName} | <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">stbcybersecurity.com</a> | Securing the Digital Frontier</div>
  </div>
</div>`;
}

function inv7(f: InvoiceFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:680px;background:#09090b;color:#e4e4e7;padding:0;border:2px solid #27272a;overflow:hidden;">
  <div style="background:#18181b;padding:8px 36px;border-bottom:3px solid #ef4444;text-align:center;">
    <span style="font-family:'Courier New',Consolas,monospace;font-size:13px;font-weight:900;color:#ef4444;letter-spacing:6px;">&#9608; TOP SECRET &#9608; CLASSIFIED &#9608; TOP SECRET &#9608;</span>
  </div>
  <div style="background:#0c0c0e;padding:24px 36px;border-bottom:1px solid #27272a;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:middle;">
          <img src="${LOGO_URL}" alt="STBCS" width="44" height="44" style="display:block;border-radius:8px;border:2px solid #52525b;" />
          <div style="font-size:16px;font-weight:800;color:#ffffff;margin-top:8px;">${f.companyName}</div>
          <div style="font-size:10px;color:#52525b;letter-spacing:3px;text-transform:uppercase;">CLASSIFIED BILLING DIVISION</div>
        </td>
        <td style="text-align:right;vertical-align:top;">
          <div style="display:inline-block;padding:8px 20px;border:2px solid #ef4444;border-radius:4px;">
            <div style="font-size:20px;font-weight:900;color:#ef4444;letter-spacing:3px;">CLASSIFIED</div>
            <div style="font-size:9px;color:#71717a;letter-spacing:2px;text-align:center;margin-top:2px;">BILLING DOCUMENT</div>
          </div>
        </td>
      </tr>
    </table>
  </div>
  <div style="padding:24px 36px;">
    <div style="padding:16px;background:#18181b;border:1px solid #27272a;border-radius:4px;margin-bottom:20px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="width:25%;padding-right:12px;">
            <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Document ID</div>
            <div style="font-family:'Courier New',Consolas,monospace;font-size:12px;color:#f97316;font-weight:700;margin-top:2px;">${f.invoiceNumber}</div>
          </td>
          <td style="width:25%;padding-right:12px;">
            <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Issue Date</div>
            <div style="font-family:'Courier New',Consolas,monospace;font-size:12px;color:#e4e4e7;margin-top:2px;">${f.invoiceDate}</div>
          </td>
          <td style="width:25%;padding-right:12px;">
            <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Due Date</div>
            <div style="font-family:'Courier New',Consolas,monospace;font-size:12px;color:#e4e4e7;margin-top:2px;">${f.dueDate}</div>
          </td>
          <td style="width:25%;">
            <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Classification</div>
            <div style="font-size:12px;color:#ef4444;font-weight:800;margin-top:2px;">TOP SECRET</div>
          </td>
        </tr>
      </table>
    </div>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td style="vertical-align:top;width:50%;">
          <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Originator</div>
          <div style="font-size:13px;color:#ffffff;font-weight:700;">${f.companyName}</div>
          <div style="font-size:11px;color:#71717a;">${f.companyAddress}</div>
          <div style="font-size:11px;color:#f97316;">${f.companyEmail}</div>
        </td>
        <td style="vertical-align:top;width:50%;">
          <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Recipient — Eyes Only</div>
          <div style="font-size:13px;color:#ffffff;font-weight:700;">${f.clientName}</div>
          <div style="font-size:12px;color:#a1a1aa;">${f.clientCompany}</div>
          <div style="font-size:11px;color:#71717a;">${f.clientAddress}</div>
        </td>
      </tr>
    </table>
    ${lineItemsTable("dark")}
    <div style="margin-top:20px;padding:12px 16px;background:#18181b;border-left:3px solid #ef4444;border-radius:4px;">
      <div style="font-size:9px;color:#ef4444;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;font-weight:700;">Handling Instructions</div>
      <div style="font-size:12px;color:#71717a;">${f.paymentTerms} — ${f.notes}</div>
    </div>
  </div>
  <div style="background:#18181b;padding:8px 36px;border-top:3px solid #ef4444;text-align:center;">
    <span style="font-family:'Courier New',Consolas,monospace;font-size:11px;color:#52525b;letter-spacing:4px;">AUTHORIZED PERSONNEL ONLY | ${f.companyName} | <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">stbcybersecurity.com</a></span>
  </div>
</div>`;
}

function inv8(f: InvoiceFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:680px;background:#09090b;color:#e4e4e7;padding:0;border:2px solid #7f1d1d;border-radius:12px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#991b1b,#7f1d1d);padding:20px 36px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:middle;">
          <div style="font-size:10px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:4px;">&#9888; EMERGENCY RESPONSE</div>
          <div style="font-size:22px;font-weight:900;color:#ffffff;margin-top:4px;">PRIORITY BILLING</div>
        </td>
        <td style="text-align:right;vertical-align:middle;">
          <img src="${LOGO_URL}" alt="STBCS" width="44" height="44" style="display:inline-block;border-radius:10px;border:2px solid rgba(255,255,255,0.3);" />
        </td>
      </tr>
    </table>
  </div>
  <div style="background:#7f1d1d;padding:10px 36px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="width:25%;">
          <div style="font-size:9px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;">Severity</div>
          <div style="font-size:13px;color:#fca5a5;font-weight:800;">CRITICAL</div>
        </td>
        <td style="width:25%;">
          <div style="font-size:9px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;">Incident ID</div>
          <div style="font-size:13px;color:#ffffff;font-weight:600;">${f.invoiceNumber}</div>
        </td>
        <td style="width:25%;">
          <div style="font-size:9px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;">Response Date</div>
          <div style="font-size:13px;color:#ffffff;">${f.invoiceDate}</div>
        </td>
        <td style="width:25%;">
          <div style="font-size:9px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;">Payment Due</div>
          <div style="font-size:13px;color:#fca5a5;font-weight:600;">${f.dueDate}</div>
        </td>
      </tr>
    </table>
  </div>
  <div style="padding:24px 36px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td style="vertical-align:top;width:50%;">
          <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Response Team</div>
          <div style="font-size:14px;color:#ffffff;font-weight:700;">${f.companyName}</div>
          <div style="font-size:11px;color:#71717a;">${f.companyAddress}</div>
          <div style="font-size:11px;color:#f97316;">${f.companyEmail}</div>
        </td>
        <td style="vertical-align:top;width:50%;">
          <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Affected Organization</div>
          <div style="font-size:14px;color:#ffffff;font-weight:700;">${f.clientName}</div>
          <div style="font-size:12px;color:#a1a1aa;">${f.clientCompany}</div>
          <div style="font-size:11px;color:#71717a;">${f.clientAddress}</div>
        </td>
      </tr>
    </table>
    <div style="font-size:10px;color:#ef4444;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;font-weight:700;">Response Timeline</div>
    <div style="padding:12px 16px;background:#18181b;border-left:3px solid #ef4444;border-radius:4px;margin-bottom:8px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="width:120px;font-size:11px;color:#ef4444;font-weight:700;">T+0:00</td>
          <td style="font-size:12px;color:#e4e4e7;">Incident detected — Emergency response team activated</td>
        </tr>
      </table>
    </div>
    <div style="padding:12px 16px;background:#18181b;border-left:3px solid #f97316;border-radius:4px;margin-bottom:8px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="width:120px;font-size:11px;color:#f97316;font-weight:700;">T+2:30</td>
          <td style="font-size:12px;color:#e4e4e7;">Threat contained — Forensic analysis initiated</td>
        </tr>
      </table>
    </div>
    <div style="padding:12px 16px;background:#18181b;border-left:3px solid #eab308;border-radius:4px;margin-bottom:8px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="width:120px;font-size:11px;color:#eab308;font-weight:700;">T+8:00</td>
          <td style="font-size:12px;color:#e4e4e7;">Systems restored — Monitoring enhanced</td>
        </tr>
      </table>
    </div>
    <div style="padding:12px 16px;background:#18181b;border-left:3px solid #22c55e;border-radius:4px;margin-bottom:16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="width:120px;font-size:11px;color:#22c55e;font-weight:700;">T+24:00</td>
          <td style="font-size:12px;color:#e4e4e7;">Incident closed — Post-mortem report delivered</td>
        </tr>
      </table>
    </div>
    ${lineItemsTable("dark")}
    <div style="margin-top:20px;padding:12px 16px;background:#18181b;border-left:3px solid #f97316;border-radius:4px;">
      <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Urgent Payment Terms</div>
      <div style="font-size:12px;color:#71717a;">${f.paymentTerms} — ${f.notes}</div>
    </div>
  </div>
  <div style="padding:16px 36px;background:#0c0c0e;border-top:2px solid #7f1d1d;">
    <div style="font-size:10px;color:#3f3f46;text-align:center;">${f.companyName} | Incident Response Division | <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">stbcybersecurity.com</a></div>
  </div>
</div>`;
}

function inv9(f: InvoiceFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:680px;background:#ffffff;color:#18181b;padding:40px;border:1px solid #e4e4e7;border-radius:12px;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="vertical-align:middle;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:middle;"><img src="${LOGO_URL}" alt="STBCS" width="40" height="40" style="display:block;border-radius:8px;" /></td>
            <td style="padding-left:10px;vertical-align:middle;">
              <div style="font-size:15px;font-weight:800;color:#18181b;">${f.companyName}</div>
              <div style="font-size:10px;color:#f97316;text-transform:uppercase;letter-spacing:2px;">SUBSCRIPTION SERVICES</div>
            </td>
          </tr>
        </table>
      </td>
      <td style="text-align:right;vertical-align:top;">
        <div style="display:inline-block;padding:6px 16px;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;font-size:12px;font-weight:800;letter-spacing:2px;border-radius:20px;">SUBSCRIPTION INVOICE</div>
        <div style="font-size:11px;color:#71717a;margin-top:6px;">${f.invoiceNumber}</div>
      </td>
    </tr>
  </table>
  <div style="height:1px;background:#e4e4e7;margin:20px 0;"></div>
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
    <tr>
      <td style="vertical-align:top;width:50%;">
        <div style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Subscriber</div>
        <div style="font-size:14px;font-weight:700;color:#18181b;">${f.clientName}</div>
        <div style="font-size:12px;color:#52525b;">${f.clientCompany}</div>
        <div style="font-size:11px;color:#71717a;">${f.clientAddress}</div>
      </td>
      <td style="vertical-align:top;text-align:right;">
        <div style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Billing Period</div>
        <div style="font-size:12px;color:#18181b;font-weight:600;">${f.invoiceDate} — ${f.dueDate}</div>
        <div style="font-size:11px;color:#f97316;margin-top:4px;font-weight:600;">Next Billing: ${f.dueDate}</div>
      </td>
    </tr>
  </table>
  <div style="padding:16px;background:#f4f4f5;border-radius:8px;margin-bottom:20px;">
    <div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;font-weight:700;">Active Plan</div>
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="width:33%;padding:12px;background:#ffffff;border:2px solid #f97316;border-radius:8px;text-align:center;vertical-align:top;">
          <div style="font-size:9px;color:#f97316;text-transform:uppercase;letter-spacing:1px;font-weight:800;">&#9733; CURRENT PLAN</div>
          <div style="font-size:14px;font-weight:800;color:#18181b;margin-top:4px;">Professional</div>
          <div style="font-size:20px;font-weight:900;color:#f97316;margin-top:4px;">$2,499<span style="font-size:11px;color:#71717a;">/mo</span></div>
        </td>
        <td style="width:8px;"></td>
        <td style="width:33%;padding:12px;background:#ffffff;border:1px solid #e4e4e7;border-radius:8px;text-align:center;vertical-align:top;">
          <div style="font-size:9px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;">Starter</div>
          <div style="font-size:14px;font-weight:700;color:#71717a;margin-top:4px;">Basic</div>
          <div style="font-size:20px;font-weight:900;color:#71717a;margin-top:4px;">$799<span style="font-size:11px;color:#a1a1aa;">/mo</span></div>
        </td>
        <td style="width:8px;"></td>
        <td style="width:33%;padding:12px;background:#ffffff;border:1px solid #e4e4e7;border-radius:8px;text-align:center;vertical-align:top;">
          <div style="font-size:9px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;">Enterprise</div>
          <div style="font-size:14px;font-weight:700;color:#71717a;margin-top:4px;">Custom</div>
          <div style="font-size:20px;font-weight:900;color:#71717a;margin-top:4px;">Contact</div>
        </td>
      </tr>
    </table>
  </div>
  <div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;font-weight:700;">Usage Metrics</div>
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:16px;">
    <tr>
      <td style="padding:10px 14px;background:#fff7ed;border-radius:8px;text-align:center;width:25%;">
        <div style="font-size:20px;font-weight:900;color:#f97316;">847</div>
        <div style="font-size:9px;color:#9a3412;text-transform:uppercase;letter-spacing:1px;">Scans Run</div>
      </td>
      <td style="width:8px;"></td>
      <td style="padding:10px 14px;background:#f0fdf4;border-radius:8px;text-align:center;width:25%;">
        <div style="font-size:20px;font-weight:900;color:#22c55e;">99.9%</div>
        <div style="font-size:9px;color:#166534;text-transform:uppercase;letter-spacing:1px;">Uptime</div>
      </td>
      <td style="width:8px;"></td>
      <td style="padding:10px 14px;background:#faf5ff;border-radius:8px;text-align:center;width:25%;">
        <div style="font-size:20px;font-weight:900;color:#8b5cf6;">12</div>
        <div style="font-size:9px;color:#5b21b6;text-transform:uppercase;letter-spacing:1px;">Alerts</div>
      </td>
      <td style="width:8px;"></td>
      <td style="padding:10px 14px;background:#f4f4f5;border-radius:8px;text-align:center;width:25%;">
        <div style="font-size:20px;font-weight:900;color:#18181b;">5</div>
        <div style="font-size:9px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Users</div>
      </td>
    </tr>
  </table>
  <div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;font-weight:700;">Billing Summary</div>
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin-bottom:16px;">
    <tr style="background:#f4f4f5;">
      <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#18181b;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;width:50%;">Item</td>
      <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#18181b;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;text-align:center;width:20%;">Type</td>
      <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#18181b;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;text-align:right;width:30%;">Amount</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:10px 12px;font-size:12px;color:#18181b;border-bottom:1px solid #e4e4e7;">Professional Plan — Monthly</td>
      <td style="padding:10px 12px;font-size:11px;color:#22c55e;font-weight:600;text-align:center;border-bottom:1px solid #e4e4e7;">Recurring</td>
      <td style="padding:10px 12px;font-size:12px;color:#18181b;text-align:right;border-bottom:1px solid #e4e4e7;font-weight:600;">$2,499.00</td>
    </tr>
    <tr style="background:#f4f4f5;">
      <td style="padding:10px 12px;font-size:12px;color:#18181b;border-bottom:1px solid #e4e4e7;">Additional API Calls (350 overage)</td>
      <td style="padding:10px 12px;font-size:11px;color:#f97316;font-weight:600;text-align:center;border-bottom:1px solid #e4e4e7;">Usage</td>
      <td style="padding:10px 12px;font-size:12px;color:#18181b;text-align:right;border-bottom:1px solid #e4e4e7;font-weight:600;">$175.00</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:10px 12px;font-size:12px;color:#18181b;border-bottom:1px solid #e4e4e7;">Premium Threat Intel Add-on</td>
      <td style="padding:10px 12px;font-size:11px;color:#8b5cf6;font-weight:600;text-align:center;border-bottom:1px solid #e4e4e7;">One-time</td>
      <td style="padding:10px 12px;font-size:12px;color:#18181b;text-align:right;border-bottom:1px solid #e4e4e7;font-weight:600;">$500.00</td>
    </tr>
    <tr style="background:#f4f4f5;">
      <td style="padding:10px 12px;font-size:12px;color:#22c55e;border-bottom:1px solid #e4e4e7;">Annual Commitment Credit</td>
      <td style="padding:10px 12px;font-size:11px;color:#22c55e;font-weight:600;text-align:center;border-bottom:1px solid #e4e4e7;">Credit</td>
      <td style="padding:10px 12px;font-size:12px;color:#22c55e;text-align:right;border-bottom:1px solid #e4e4e7;font-weight:600;">-$250.00</td>
    </tr>
    <tr><td style="padding:0;"></td>
      <td style="padding:10px 12px;font-size:12px;color:#52525b;text-align:right;border-top:1px solid #e4e4e7;">Subtotal</td>
      <td style="padding:10px 12px;font-size:12px;color:#18181b;text-align:right;border-top:1px solid #e4e4e7;">$2,924.00</td>
    </tr>
    <tr><td style="padding:0;"></td>
      <td style="padding:10px 12px;font-size:14px;font-weight:800;color:#f97316;text-align:right;border-top:2px solid #f97316;">TOTAL DUE</td>
      <td style="padding:10px 12px;font-size:14px;font-weight:800;color:#f97316;text-align:right;border-top:2px solid #f97316;">$2,924.00</td>
    </tr>
  </table>
  <div style="margin-top:16px;padding:12px 16px;background:#fafafa;border-left:3px solid #f97316;border-radius:4px;">
    <div style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Auto-Pay Enabled</div>
    <div style="font-size:12px;color:#52525b;">${f.paymentTerms} — ${f.notes}</div>
  </div>
  <div style="margin-top:24px;text-align:center;padding-top:16px;border-top:1px solid #e4e4e7;">
    <div style="font-size:10px;color:#a1a1aa;">${f.companyName} | <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">stbcybersecurity.com</a> | Subscription Services</div>
  </div>
</div>`;
}

function inv10(f: InvoiceFields) {
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:680px;background:#ffffff;color:#18181b;padding:0;border:2px solid #18181b;">
  <div style="background:#18181b;padding:20px 36px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:middle;">
          <img src="${LOGO_URL}" alt="STBCS" width="40" height="40" style="display:block;border-radius:6px;" />
          <div style="font-size:14px;font-weight:800;color:#ffffff;margin-top:6px;">${f.companyName}</div>
          <div style="font-size:9px;color:#71717a;letter-spacing:2px;text-transform:uppercase;">GOVERNMENT CONTRACTOR</div>
        </td>
        <td style="text-align:right;vertical-align:top;">
          <div style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:2px;">GOVERNMENT</div>
          <div style="font-size:14px;font-weight:700;color:#f97316;letter-spacing:2px;">CONTRACT INVOICE</div>
        </td>
      </tr>
    </table>
  </div>
  <div style="padding:24px 36px;">
    <div style="padding:16px;background:#f4f4f5;border:1px solid #d4d4d8;margin-bottom:20px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="width:33%;padding-right:12px;">
            <div style="font-size:9px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Contract Number</div>
            <div style="font-family:'Courier New',Consolas,monospace;font-size:12px;color:#18181b;font-weight:700;margin-top:2px;">${f.invoiceNumber}</div>
          </td>
          <td style="width:33%;padding-right:12px;">
            <div style="font-size:9px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">DUNS Number</div>
            <div style="font-family:'Courier New',Consolas,monospace;font-size:12px;color:#18181b;margin-top:2px;">08-765-4321</div>
          </td>
          <td style="width:33%;">
            <div style="font-size:9px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">CAGE Code</div>
            <div style="font-family:'Courier New',Consolas,monospace;font-size:12px;color:#18181b;margin-top:2px;">7X9K2</div>
          </td>
        </tr>
      </table>
    </div>
    <div style="padding:12px 16px;background:#fff7ed;border:1px solid #fed7aa;margin-bottom:20px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="width:50%;">
            <div style="font-size:9px;color:#9a3412;text-transform:uppercase;letter-spacing:1px;">Period of Performance</div>
            <div style="font-size:12px;color:#78350f;font-weight:700;margin-top:2px;">${f.invoiceDate} through ${f.dueDate}</div>
          </td>
          <td style="width:50%;text-align:right;">
            <div style="font-size:9px;color:#9a3412;text-transform:uppercase;letter-spacing:1px;">Payment Terms</div>
            <div style="font-size:12px;color:#78350f;font-weight:700;margin-top:2px;">${f.paymentTerms}</div>
          </td>
        </tr>
      </table>
    </div>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td style="vertical-align:top;width:50%;">
          <div style="font-size:9px;color:#71717a;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Contractor</div>
          <div style="font-size:13px;color:#18181b;font-weight:700;">${f.companyName}</div>
          <div style="font-size:11px;color:#52525b;">${f.companyAddress}</div>
          <div style="font-size:11px;color:#52525b;">${f.companyPhone}</div>
          <div style="font-size:11px;color:#f97316;">${f.companyEmail}</div>
        </td>
        <td style="vertical-align:top;width:50%;">
          <div style="font-size:9px;color:#71717a;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Contracting Agency</div>
          <div style="font-size:13px;color:#18181b;font-weight:700;">${f.clientName}</div>
          <div style="font-size:12px;color:#52525b;">${f.clientCompany}</div>
          <div style="font-size:11px;color:#71717a;">${f.clientAddress}</div>
        </td>
      </tr>
    </table>
    <div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;font-weight:700;">Contract Line Item Numbers (CLINs)</div>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin-bottom:16px;">
      <tr style="background:#18181b;">
        <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;width:12%;">CLIN</td>
        <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;width:43%;">Description</td>
        <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;text-align:center;width:15%;">Qty</td>
        <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;text-align:right;width:15%;">Unit Price</td>
        <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f97316;text-align:right;width:15%;">Amount</td>
      </tr>
      <tr style="background:#ffffff;">
        <td style="padding:10px 12px;font-family:'Courier New',Consolas,monospace;font-size:12px;color:#18181b;border-bottom:1px solid #d4d4d8;font-weight:700;">0001</td>
        <td style="padding:10px 12px;font-size:12px;color:#18181b;border-bottom:1px solid #d4d4d8;">Vulnerability Assessment & Penetration Testing</td>
        <td style="padding:10px 12px;font-size:12px;color:#52525b;text-align:center;border-bottom:1px solid #d4d4d8;">1 EA</td>
        <td style="padding:10px 12px;font-size:12px;color:#52525b;text-align:right;border-bottom:1px solid #d4d4d8;">$4,500.00</td>
        <td style="padding:10px 12px;font-size:12px;color:#18181b;text-align:right;border-bottom:1px solid #d4d4d8;font-weight:600;">$4,500.00</td>
      </tr>
      <tr style="background:#f4f4f5;">
        <td style="padding:10px 12px;font-family:'Courier New',Consolas,monospace;font-size:12px;color:#18181b;border-bottom:1px solid #d4d4d8;font-weight:700;">0002</td>
        <td style="padding:10px 12px;font-size:12px;color:#18181b;border-bottom:1px solid #d4d4d8;">Security Monitoring Setup (Monthly)</td>
        <td style="padding:10px 12px;font-size:12px;color:#52525b;text-align:center;border-bottom:1px solid #d4d4d8;">3 MO</td>
        <td style="padding:10px 12px;font-size:12px;color:#52525b;text-align:right;border-bottom:1px solid #d4d4d8;">$1,200.00</td>
        <td style="padding:10px 12px;font-size:12px;color:#18181b;text-align:right;border-bottom:1px solid #d4d4d8;font-weight:600;">$3,600.00</td>
      </tr>
      <tr style="background:#ffffff;">
        <td style="padding:10px 12px;font-family:'Courier New',Consolas,monospace;font-size:12px;color:#18181b;border-bottom:1px solid #d4d4d8;font-weight:700;">0003</td>
        <td style="padding:10px 12px;font-size:12px;color:#18181b;border-bottom:1px solid #d4d4d8;">Incident Response Consultation</td>
        <td style="padding:10px 12px;font-size:12px;color:#52525b;text-align:center;border-bottom:1px solid #d4d4d8;">8 HR</td>
        <td style="padding:10px 12px;font-size:12px;color:#52525b;text-align:right;border-bottom:1px solid #d4d4d8;">$275.00</td>
        <td style="padding:10px 12px;font-size:12px;color:#18181b;text-align:right;border-bottom:1px solid #d4d4d8;font-weight:600;">$2,200.00</td>
      </tr>
      <tr><td colspan="3" style="padding:0;"></td>
        <td style="padding:8px 12px;font-size:12px;color:#52525b;text-align:right;border-top:1px solid #d4d4d8;">Subtotal</td>
        <td style="padding:8px 12px;font-size:12px;color:#18181b;text-align:right;border-top:1px solid #d4d4d8;">$10,300.00</td>
      </tr>
      <tr><td colspan="3" style="padding:0;"></td>
        <td style="padding:4px 12px;font-size:12px;color:#52525b;text-align:right;">Tax (Exempt)</td>
        <td style="padding:4px 12px;font-size:12px;color:#18181b;text-align:right;">$0.00</td>
      </tr>
      <tr><td colspan="3" style="padding:0;"></td>
        <td style="padding:10px 12px;font-size:14px;font-weight:800;color:#f97316;text-align:right;border-top:2px solid #f97316;">TOTAL</td>
        <td style="padding:10px 12px;font-size:14px;font-weight:800;color:#f97316;text-align:right;border-top:2px solid #f97316;">$10,300.00</td>
      </tr>
    </table>
    <div style="margin-top:20px;padding:16px;background:#f4f4f5;border:1px solid #d4d4d8;">
      <div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;font-weight:700;">Authorized Signatures</div>
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="width:48%;padding-top:40px;border-top:2px solid #18181b;">
            <div style="font-size:11px;color:#18181b;font-weight:700;">Contractor Representative</div>
            <div style="font-size:10px;color:#71717a;">Name / Title / Date</div>
          </td>
          <td style="width:4%;"></td>
          <td style="width:48%;padding-top:40px;border-top:2px solid #18181b;">
            <div style="font-size:11px;color:#18181b;font-weight:700;">Contracting Officer</div>
            <div style="font-size:10px;color:#71717a;">Name / Title / Date</div>
          </td>
        </tr>
      </table>
    </div>
    <div style="margin-top:16px;padding:12px 16px;background:#fafafa;border-left:3px solid #f97316;border-radius:4px;">
      <div style="font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Notes</div>
      <div style="font-size:12px;color:#52525b;">${f.notes}</div>
    </div>
  </div>
  <div style="background:#18181b;padding:12px 36px;text-align:center;">
    <div style="font-size:10px;color:#52525b;">${f.companyName} | CAGE: 7X9K2 | DUNS: 08-765-4321 | <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">stbcybersecurity.com</a></div>
  </div>
</div>`;
}

const templates = [
  { id: 1, name: "Professional", desc: "Clean white layout with STBCS header, standard invoice table, orange accent lines", render: inv1 },
  { id: 2, name: "Dark Ops", desc: "Full dark theme matching STBCS site, orange headers, dark table rows", render: inv2 },
  { id: 3, name: "Consulting", desc: "Hourly rate focused with engagement details section and hours breakdown", render: inv3 },
  { id: 4, name: "Assessment Report", desc: "Security assessment billing with scope, findings summary, remediation costs", render: inv4 },
  { id: 5, name: "Retainer", desc: "Monthly retainer format with service period, usage summary, overage rates", render: inv5 },
  { id: 6, name: "Quote / Proposal", desc: "Proposal format with service descriptions, pricing tiers, validity period", render: inv6 },
  { id: 7, name: "Classified", desc: "TOP SECRET classified document aesthetic with stamps, document ID fields, dark header band", render: inv7 },
  { id: 8, name: "Breach Response", desc: "Emergency incident response billing with severity banner, timeline of response actions", render: inv8 },
  { id: 9, name: "Subscription", desc: "SaaS recurring subscription invoice with plan tiers, usage metrics, credits section", render: inv9 },
  { id: 10, name: "Government Contract", desc: "Formal government CAGE-style format with CLIN items, DUNS, authorized signatures block", render: inv10 },
];

export default function Invoices() {
  const [fields, setFields] = useState<InvoiceFields>(defaultFields);
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState<number | null>(null);
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const active = templates[activeIdx];

  function handleCopy(idx: number) {
    const html = templates[idx].render(fields);

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
        toast({ title: "Invoice copied!", description: "Paste it into your document or email." });
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
      printWindow.document.write(`<!DOCTYPE html><html><head><title>${active.name} Invoice - ${fields.invoiceNumber}</title><style>body{margin:0;padding:20px;background:#fff;}@media print{body{padding:0;}}</style></head><body>${html}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  }

  const prev = () => setActiveIdx(i => (i - 1 + templates.length) % templates.length);
  const next = () => setActiveIdx(i => (i + 1) % templates.length);

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/brand-kit" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-orange-400 text-sm mb-6 transition-colors" data-testid="link-back-brand-kit">
          <ArrowLeft className="h-4 w-4" /> Back to Brand Kit
        </Link>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Receipt className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wider" data-testid="text-page-title">
              INVOICE TEMPLATES
            </h1>
          </div>
          <p className="text-zinc-400 text-sm">Professional invoice and quote templates for STB Cybersecurity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/80 border-zinc-800 p-5 lg:col-span-1 max-h-[calc(100vh-200px)] overflow-y-auto">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-orange-500" />
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
                <Label className="text-zinc-400 text-xs">Company Address</Label>
                <Input
                  data-testid="input-company-address"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.companyAddress}
                  onChange={e => setFields(p => ({ ...p, companyAddress: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Company Phone</Label>
                <Input
                  data-testid="input-company-phone"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.companyPhone}
                  onChange={e => setFields(p => ({ ...p, companyPhone: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Company Email</Label>
                <Input
                  data-testid="input-company-email"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.companyEmail}
                  onChange={e => setFields(p => ({ ...p, companyEmail: e.target.value }))}
                />
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <Label className="text-zinc-400 text-xs">Client Name</Label>
                <Input
                  data-testid="input-client-name"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.clientName}
                  onChange={e => setFields(p => ({ ...p, clientName: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Client Company</Label>
                <Input
                  data-testid="input-client-company"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.clientCompany}
                  onChange={e => setFields(p => ({ ...p, clientCompany: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Client Address</Label>
                <Input
                  data-testid="input-client-address"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.clientAddress}
                  onChange={e => setFields(p => ({ ...p, clientAddress: e.target.value }))}
                />
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <Label className="text-zinc-400 text-xs">Invoice Number</Label>
                <Input
                  data-testid="input-invoice-number"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.invoiceNumber}
                  onChange={e => setFields(p => ({ ...p, invoiceNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Invoice Date</Label>
                <Input
                  data-testid="input-invoice-date"
                  type="date"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.invoiceDate}
                  onChange={e => setFields(p => ({ ...p, invoiceDate: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Due Date</Label>
                <Input
                  data-testid="input-due-date"
                  type="date"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.dueDate}
                  onChange={e => setFields(p => ({ ...p, dueDate: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Payment Terms</Label>
                <Input
                  data-testid="input-payment-terms"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.paymentTerms}
                  onChange={e => setFields(p => ({ ...p, paymentTerms: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Notes</Label>
                <Input
                  data-testid="input-notes"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  value={fields.notes}
                  onChange={e => setFields(p => ({ ...p, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800">
              <h4 className="text-zinc-400 text-xs font-semibold mb-3 uppercase tracking-wider">All Styles</h4>
              <div className="space-y-2">
                {templates.map((t, i) => (
                  <button
                    key={t.id}
                    data-testid={`button-style-${t.id}`}
                    onClick={() => setActiveIdx(i)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      i === activeIdx
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                        : "bg-zinc-800/50 text-zinc-400 border border-transparent hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs opacity-70 mt-0.5">{t.desc}</div>
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
                <p className="text-zinc-500 text-xs">{activeIdx + 1} of {templates.length}</p>
              </div>
              <Button variant="outline" size="sm" onClick={next} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" data-testid="button-next">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <Card className="bg-zinc-900/80 border-zinc-800 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-zinc-500 text-xs flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Live Preview
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

              <div className="bg-zinc-950 rounded-lg p-6 border border-zinc-800 overflow-x-auto">
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
                    <li>Fill in your company and client details on the left</li>
                    <li>Select your preferred invoice style</li>
                    <li>Click "Copy HTML" to copy the template markup</li>
                    <li>Or click "Print / PDF" to save as a PDF document</li>
                    <li>Paste into your email or document editor</li>
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