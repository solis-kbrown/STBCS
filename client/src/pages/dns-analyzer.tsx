import { useState } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield, Lock, Crown, Loader2, AlertTriangle, CheckCircle2, XCircle,
  Info, Globe, ShieldCheck, ShieldAlert, Mail, Server, Clock,
  ChevronDown, ChevronUp, Search, FileText, Layers, Key
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface DnsSecurityResult {
  domain: string;
  score: number;
  grade: string;
  aRecords: string[];
  aaaaRecords: string[];
  mxRecords: { priority: number; exchange: string; provider?: string }[];
  nsRecords: string[];
  txtRecords: string[];
  soa: {
    nsname: string;
    hostmaster: string;
    serial: number;
    refresh: number;
    retry: number;
    expire: number;
    minttl: number;
  } | null;
  spf: {
    found: boolean;
    record: string | null;
    policy: string | null;
    mechanisms: string[];
    includes: string[];
    warnings: string[];
    valid: boolean;
  };
  dkim: {
    found: boolean;
    selectors: { selector: string; found: boolean; record: string | null; keyType: string | null; valid: boolean }[];
  };
  dmarc: {
    found: boolean;
    record: string | null;
    policy: string | null;
    subdomainPolicy: string | null;
    rua: string[];
    ruf: string[];
    percentage: number;
    warnings: string[];
    valid: boolean;
  };
  caa: { critical: number; tag: string; value: string }[];
  dnssec: {
    enabled: boolean;
    details: string;
  };
  nsAnalysis: {
    count: number;
    singlePointOfFailure: boolean;
    providers: string[];
  };
  findings: { severity: "critical" | "warning" | "info" | "pass"; category: string; message: string }[];
  timestamp: string;
}

function gradeColor(grade: string): string {
  if (grade === "A+" || grade === "A") return "#22c55e";
  if (grade === "B") return "#84cc16";
  if (grade === "C") return "#eab308";
  if (grade === "D") return "#f97316";
  return "#ef4444";
}

function GradeBadge({ grade, score }: { grade: string; score: number }) {
  const color = gradeColor(grade);
  return (
    <div className="flex items-center gap-4">
      <div
        className="flex items-center justify-center w-20 h-20 rounded-2xl border-2 shadow-lg"
        style={{ borderColor: color, boxShadow: `0 0 24px ${color}30` }}
        data-testid="badge-dns-grade"
      >
        <span className="text-3xl font-display font-black" style={{ color }}>{grade}</span>
      </div>
      <div>
        <p className="text-sm text-zinc-400">DNS Security Score</p>
        <p className="text-2xl font-display font-bold text-white" data-testid="text-dns-score">{score}/100</p>
      </div>
    </div>
  );
}

function SeverityIcon({ severity }: { severity: "critical" | "warning" | "info" | "pass" }) {
  if (severity === "critical") return <XCircle className="h-4 w-4 text-red-400 shrink-0" />;
  if (severity === "warning") return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
  if (severity === "pass") return <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />;
  return <Info className="h-4 w-4 text-blue-400 shrink-0" />;
}

function severityBorder(severity: "critical" | "warning" | "info" | "pass") {
  if (severity === "critical") return "border-red-500/30 bg-red-500/5";
  if (severity === "warning") return "border-amber-500/30 bg-amber-500/5";
  if (severity === "pass") return "border-green-500/30 bg-green-500/5";
  return "border-blue-500/30 bg-blue-500/5";
}

function FindingsCard({ findings }: { findings: DnsSecurityResult["findings"] }) {
  const groups = [
    { label: "Critical", items: findings.filter(f => f.severity === "critical"), color: "text-red-400" },
    { label: "Warnings", items: findings.filter(f => f.severity === "warning"), color: "text-amber-400" },
    { label: "Passed", items: findings.filter(f => f.severity === "pass"), color: "text-green-400" },
    { label: "Informational", items: findings.filter(f => f.severity === "info"), color: "text-blue-400" },
  ].filter(g => g.items.length > 0);

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-findings">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <ShieldCheck className="h-4 w-4 text-orange-400" /> Security Findings
          </CardTitle>
          <div className="flex items-center gap-2">
            {findings.filter(f => f.severity === "critical").length > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-[10px]">
                {findings.filter(f => f.severity === "critical").length} Critical
              </Badge>
            )}
            {findings.filter(f => f.severity === "pass").length > 0 && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-[10px]">
                {findings.filter(f => f.severity === "pass").length} Passed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.map((group) => (
          <div key={group.label} className="space-y-2">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${group.color}`}>{group.label}</h4>
            {group.items.map((finding, i) => (
              <div key={i} className={`p-3 rounded-lg border ${severityBorder(finding.severity)}`} data-testid={`finding-${finding.severity}-${i}`}>
                <div className="flex items-start gap-2">
                  <SeverityIcon severity={finding.severity} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[9px]">{finding.category}</Badge>
                    </div>
                    <p className="text-sm text-white mt-1">{finding.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MxRecordsCard({ mxRecords }: { mxRecords: DnsSecurityResult["mxRecords"] }) {
  if (mxRecords.length === 0) return null;

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-mx-records">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <Mail className="h-4 w-4 text-orange-400" /> MX Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {mxRecords.map((mx, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800" data-testid={`mx-record-${i}`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono text-zinc-500 w-8 shrink-0">P:{mx.priority}</span>
                <span className="text-sm text-white font-mono truncate">{mx.exchange}</span>
              </div>
              {mx.provider && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-[10px] shrink-0 ml-2">
                  {mx.provider}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SpfCard({ spf }: { spf: DnsSecurityResult["spf"] }) {
  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-spf">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <FileText className="h-4 w-4 text-orange-400" /> SPF Record
          </CardTitle>
          {spf.found ? (
            spf.valid ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Valid</Badge>
            ) : (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">Weak</Badge>
            )
          ) : (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Missing</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {spf.record ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
            <code className="text-xs text-green-400 font-mono break-all" data-testid="text-spf-record">{spf.record}</code>
          </div>
        ) : (
          <p className="text-sm text-zinc-500" data-testid="text-spf-record">No SPF record found</p>
        )}
        {spf.policy && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Policy:</span>
            <Badge className={`text-[10px] ${
              spf.policy === "-all" ? "bg-green-500/20 text-green-400 border-green-500/50" :
              spf.policy === "~all" ? "bg-amber-500/20 text-amber-400 border-amber-500/50" :
              "bg-red-500/20 text-red-400 border-red-500/50"
            }`} data-testid="badge-spf-policy">
              {spf.policy}
            </Badge>
          </div>
        )}
        {spf.includes.length > 0 && (
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Includes ({spf.includes.length})</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {spf.includes.map((inc, i) => (
                <Badge key={i} className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] font-mono">
                  {inc}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {spf.warnings.length > 0 && (
          <div className="space-y-1">
            {spf.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-amber-400">
                <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DkimCard({ dkim }: { dkim: DnsSecurityResult["dkim"] }) {
  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-dkim">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Key className="h-4 w-4 text-orange-400" /> DKIM Records
          </CardTitle>
          {dkim.found ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Found</Badge>
          ) : (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">Not Found</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {dkim.selectors.map((sel, i) => (
            <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
              sel.found ? "border-green-500/30 bg-green-500/5" : "border-zinc-800 bg-zinc-900/50"
            }`} data-testid={`dkim-selector-${i}`}>
              <div className="flex items-center gap-2 min-w-0">
                {sel.found ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-zinc-600 shrink-0" />
                )}
                <span className={`text-sm font-mono ${sel.found ? "text-white" : "text-zinc-500"}`}>{sel.selector}</span>
              </div>
              {sel.found && sel.keyType && (
                <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px]">
                  {sel.keyType.toUpperCase()}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DmarcCard({ dmarc }: { dmarc: DnsSecurityResult["dmarc"] }) {
  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-dmarc">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Shield className="h-4 w-4 text-orange-400" /> DMARC Policy
          </CardTitle>
          {dmarc.found ? (
            dmarc.valid ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Enforced</Badge>
            ) : (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">Weak</Badge>
            )
          ) : (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Missing</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {dmarc.record ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
            <code className="text-xs text-green-400 font-mono break-all" data-testid="text-dmarc-record">{dmarc.record}</code>
          </div>
        ) : (
          <p className="text-sm text-zinc-500" data-testid="text-dmarc-record">No DMARC record found</p>
        )}
        {dmarc.found && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Policy</span>
              <p className={`text-sm font-mono font-bold ${
                dmarc.policy === "reject" ? "text-green-400" :
                dmarc.policy === "quarantine" ? "text-amber-400" :
                "text-red-400"
              }`} data-testid="text-dmarc-policy">
                {dmarc.policy || "none"}
              </p>
            </div>
            {dmarc.subdomainPolicy && (
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Subdomain Policy</span>
                <p className="text-sm font-mono text-white">{dmarc.subdomainPolicy}</p>
              </div>
            )}
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Percentage</span>
              <p className="text-sm font-mono text-white">{dmarc.percentage}%</p>
            </div>
          </div>
        )}
        {dmarc.rua.length > 0 && (
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Aggregate Reports (rua)</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {dmarc.rua.map((uri, i) => (
                <Badge key={i} className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] font-mono">
                  {uri}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {dmarc.ruf.length > 0 && (
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Forensic Reports (ruf)</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {dmarc.ruf.map((uri, i) => (
                <Badge key={i} className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] font-mono">
                  {uri}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {dmarc.warnings.length > 0 && (
          <div className="space-y-1">
            {dmarc.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-amber-400">
                <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NsRecordsCard({ nsRecords, nsAnalysis }: { nsRecords: string[]; nsAnalysis: DnsSecurityResult["nsAnalysis"] }) {
  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-ns-records">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Server className="h-4 w-4 text-orange-400" /> Nameservers
          </CardTitle>
          {nsAnalysis.singlePointOfFailure ? (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">SPOF Risk</Badge>
          ) : (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">{nsAnalysis.count} NS</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {nsRecords.map((ns, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800" data-testid={`ns-record-${i}`}>
              <Server className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <span className="text-sm text-white font-mono">{ns}</span>
            </div>
          ))}
        </div>
        {nsAnalysis.providers.length > 0 && (
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Providers</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {nsAnalysis.providers.map((p, i) => (
                <Badge key={i} className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-[10px]">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DnssecCard({ dnssec }: { dnssec: DnsSecurityResult["dnssec"] }) {
  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-dnssec">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <ShieldCheck className="h-4 w-4 text-orange-400" /> DNSSEC
          </CardTitle>
          {dnssec.enabled ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Enabled</Badge>
          ) : (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">Not Enabled</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`flex items-start gap-2 p-3 rounded-lg border ${
          dnssec.enabled ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"
        }`}>
          {dnssec.enabled ? (
            <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          )}
          <p className={`text-sm ${dnssec.enabled ? "text-green-400" : "text-amber-400"}`} data-testid="text-dnssec-status">
            {dnssec.details}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CaaRecordsCard({ caa }: { caa: DnsSecurityResult["caa"] }) {
  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-caa-records">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Layers className="h-4 w-4 text-orange-400" /> CAA Records
          </CardTitle>
          {caa.length > 0 ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">{caa.length} Record(s)</Badge>
          ) : (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">None</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {caa.length > 0 ? (
          <div className="space-y-2">
            {caa.map((record, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800" data-testid={`caa-record-${i}`}>
                <div className="flex items-center gap-2">
                  <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[9px]">{record.tag}</Badge>
                  <span className="text-sm text-white font-mono">{record.value}</span>
                </div>
                {record.critical > 0 && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-[9px]">CRITICAL</Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No CAA records — any Certificate Authority can issue certificates for this domain.</p>
        )}
      </CardContent>
    </Card>
  );
}

function DnsRecordsCard({ aRecords, aaaaRecords, txtRecords }: { aRecords: string[]; aaaaRecords: string[]; txtRecords: string[] }) {
  const [showTxt, setShowTxt] = useState(false);

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-dns-records">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <Globe className="h-4 w-4 text-orange-400" /> DNS Records
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {aRecords.length > 0 && (
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">A Records ({aRecords.length})</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {aRecords.map((ip, i) => (
                <Badge key={i} className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] font-mono" data-testid={`a-record-${i}`}>
                  {ip}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {aaaaRecords.length > 0 && (
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">AAAA Records ({aaaaRecords.length})</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {aaaaRecords.map((ip, i) => (
                <Badge key={i} className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] font-mono" data-testid={`aaaa-record-${i}`}>
                  {ip}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {txtRecords.length > 0 && (
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">TXT Records ({txtRecords.length})</span>
              <button
                onClick={() => setShowTxt(!showTxt)}
                className="text-[10px] text-orange-400 hover:text-orange-300 flex items-center gap-0.5"
                data-testid="button-toggle-txt"
              >
                {showTxt ? <><ChevronUp className="h-3 w-3" /> Hide</> : <><ChevronDown className="h-3 w-3" /> Show</>}
              </button>
            </div>
            {showTxt && (
              <div className="mt-2 space-y-1.5">
                {txtRecords.map((txt, i) => (
                  <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-lg p-2">
                    <code className="text-[10px] text-green-400 font-mono break-all" data-testid={`txt-record-${i}`}>{txt}</code>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SoaCard({ soa }: { soa: DnsSecurityResult["soa"] }) {
  if (!soa) return null;

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-soa">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <Clock className="h-4 w-4 text-orange-400" /> SOA Record
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Primary NS</span>
            <p className="text-sm text-white font-mono" data-testid="text-soa-nsname">{soa.nsname}</p>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Admin Email</span>
            <p className="text-sm text-white font-mono" data-testid="text-soa-hostmaster">{soa.hostmaster}</p>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Serial</span>
            <p className="text-sm text-white font-mono">{soa.serial}</p>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Refresh</span>
            <p className="text-sm text-white font-mono">{soa.refresh}s</p>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Retry</span>
            <p className="text-sm text-white font-mono">{soa.retry}s</p>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Expire</span>
            <p className="text-sm text-white font-mono">{soa.expire}s</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DnsAnalyzer() {
  useDocumentTitle("DNS Security Analyzer | STB Cybersecurity");
  const { isAuthenticated, isPro } = useAuth();
  const { toast } = useToast();

  const [domain, setDomain] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<DnsSecurityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/tools/dns-security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ domain: domain.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Scan failed" }));
        throw new Error(data.error || `Scan failed (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
      toast({ title: "Analysis Complete", description: `DNS security analysis for ${domain} — Grade: ${data.grade}` });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Analysis Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="p-5 rounded-full bg-orange-500/10">
              <Lock className="h-12 w-12 text-orange-400" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-dns-analyzer-login-required">
                Sign In Required
              </h2>
              <p className="text-zinc-400 max-w-md">
                DNS Security Analyzer requires authentication. Please sign in with your STB Cybersecurity account to continue.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </Layout>
    );
  }

  if (!isPro) {
    return (
      <Layout>
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="p-5 rounded-full bg-orange-500/10">
              <Crown className="h-12 w-12 text-orange-400" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-dns-analyzer-upgrade-required">
                Pro Subscription Required
              </h2>
              <p className="text-zinc-400 max-w-md">
                The DNS Security Analyzer is available to Pro, Business, and Enterprise subscribers.
                Upgrade your plan to analyze SPF, DKIM, DMARC, DNSSEC, and more.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold" asChild>
              <a href="/pricing" data-testid="link-dns-analyzer-upgrade">
                <Crown className="h-4 w-4 mr-2" /> Upgrade to Pro
              </a>
            </Button>
          </div>
        </div>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white" data-testid="text-dns-analyzer-title">
              DNS Security Analyzer
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive DNS security analysis — SPF, DKIM, DMARC, DNSSEC, CAA, and more
            </p>
          </div>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
            <Crown className="h-3 w-3 mr-1" /> PRO
          </Badge>
        </div>

        <Card className="border-white/5 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Search className="h-5 w-5 text-orange-400" /> Analyze Domain
            </CardTitle>
            <CardDescription>
              Enter a domain to check its DNS security configuration including email authentication, DNSSEC, and certificate authority restrictions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScan} className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="domain-input" className="sr-only">Domain</Label>
                <Input
                  id="domain-input"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="bg-zinc-900 border-zinc-700 focus:border-orange-500/50 font-mono"
                  disabled={isScanning}
                  data-testid="input-dns-domain"
                />
              </div>
              <Button
                type="submit"
                disabled={isScanning || !domain.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6"
                data-testid="button-dns-scan"
              >
                {isScanning ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing…</>
                ) : (
                  <><Globe className="h-4 w-4 mr-2" /> Analyze</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400" data-testid="text-dns-error">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-in fade-in duration-500" data-testid="container-dns-results">
            <Card className="border-white/5 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <GradeBadge grade={result.grade} score={result.score} />
                  <div className="text-right">
                    <p className="text-sm text-zinc-400">Domain</p>
                    <p className="text-lg font-mono font-bold text-white" data-testid="text-dns-domain-result">{result.domain}</p>
                    <p className="text-xs text-zinc-500 mt-1">{new Date(result.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <FindingsCard findings={result.findings} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpfCard spf={result.spf} />
              <DmarcCard dmarc={result.dmarc} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DkimCard dkim={result.dkim} />
              <MxRecordsCard mxRecords={result.mxRecords} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NsRecordsCard nsRecords={result.nsRecords} nsAnalysis={result.nsAnalysis} />
              <DnssecCard dnssec={result.dnssec} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CaaRecordsCard caa={result.caa} />
              <SoaCard soa={result.soa} />
            </div>

            <DnsRecordsCard aRecords={result.aRecords} aaaaRecords={result.aaaaRecords} txtRecords={result.txtRecords} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <FileText className="h-4 w-4 text-orange-400" />
                </div>
                <CardTitle className="text-sm text-white">SPF Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Validates Sender Policy Framework records to prevent email spoofing and phishing.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Shield className="h-4 w-4 text-blue-400" />
                </div>
                <CardTitle className="text-sm text-white">DMARC Check</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Analyzes DMARC policies for email authentication enforcement and reporting configuration.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Key className="h-4 w-4 text-green-400" />
                </div>
                <CardTitle className="text-sm text-white">DKIM Verification</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Checks DomainKeys Identified Mail selectors to verify email message integrity.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                </div>
                <CardTitle className="text-sm text-white">DNSSEC Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Verifies DNSSEC deployment to ensure DNS responses are cryptographically signed and authentic.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-start gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <Shield className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
          <p className="text-xs text-zinc-400">
            DNS queries are performed using public resolvers. Results reflect the current state of DNS records and may change as records are updated.
            DKIM checks are performed against common selectors only.
          </p>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
