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
  Info, Globe, ShieldCheck, ShieldAlert, Link2, FileKey, Fingerprint,
  Server, Clock, ArrowRight, ChevronDown, ChevronUp, Copy, Check
} from "lucide-react";
import ToolPageHeader from "@/components/tool-page-header";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface CertificateDetails {
  subject: string;
  issuer: string;
  issuerOrg?: string;
  serialNumber: string;
  fingerprintSHA1: string;
  fingerprintSHA256: string;
  keyType: string;
  keySize: number;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  isExpired: boolean;
  isNotYetValid: boolean;
  sans: string[];
  signatureAlgorithm?: string;
}

interface ChainCertificate {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  isSelfSigned: boolean;
  serialNumber: string;
}

interface ProtocolSupport {
  protocol: string;
  supported: boolean;
  deprecated: boolean;
}

interface CipherInfo {
  name: string;
  version: string;
  bits: number;
  weak: boolean;
  reason?: string;
}

interface HttpSecurityHeaders {
  hsts: {
    present: boolean;
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
    raw?: string;
  };
  contentSecurityPolicy: {
    present: boolean;
    raw?: string;
  };
  xFrameOptions: {
    present: boolean;
    value?: string;
  };
  xContentTypeOptions: {
    present: boolean;
    value?: string;
  };
  referrerPolicy: {
    present: boolean;
    value?: string;
  };
  permissionsPolicy: {
    present: boolean;
    raw?: string;
  };
}

interface CaaRecord {
  critical: number;
  issue?: string;
  issuewild?: string;
  iodef?: string;
  tag: string;
  value: string;
}

interface SSLCheckResult {
  hostname: string;
  port: number;
  grade: string;
  gradeColor: string;
  certificate: CertificateDetails;
  chain: ChainCertificate[];
  chainComplete: boolean;
  protocols: ProtocolSupport[];
  ciphers: CipherInfo[];
  ocspStapling: boolean;
  httpHeaders: HttpSecurityHeaders;
  caaRecords: CaaRecord[];
  issues: { severity: "critical" | "warning" | "info"; message: string; remediation: string }[];
  scanTime: number;
  error?: string;
}

const COMMON_PORTS = [
  { port: 443, label: "HTTPS (443)" },
  { port: 8443, label: "Alt HTTPS (8443)" },
  { port: 993, label: "IMAPS (993)" },
  { port: 995, label: "POP3S (995)" },
  { port: 465, label: "SMTPS (465)" },
  { port: 587, label: "Submission (587)" },
];

function GradeBadge({ grade, color }: { grade: string; color: string }) {
  return (
    <div
      className="flex items-center justify-center w-24 h-24 rounded-2xl border-2 shadow-lg"
      style={{ borderColor: color, boxShadow: `0 0 24px ${color}30` }}
      data-testid="badge-ssl-grade"
    >
      <span className="text-4xl font-display font-black" style={{ color }}>{grade}</span>
    </div>
  );
}

function CopyableText({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied", description: `${label} copied` });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center gap-2 group">
      <code className="text-xs text-green-400 font-mono break-all bg-zinc-950 px-2 py-1 rounded border border-zinc-800 flex-1">
        {text}
      </code>
      <button
        onClick={handleCopy}
        className="p-1 text-zinc-500 hover:text-orange-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
        data-testid={`button-copy-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function SeverityIcon({ severity }: { severity: "critical" | "warning" | "info" }) {
  if (severity === "critical") return <XCircle className="h-4 w-4 text-red-400 shrink-0" />;
  if (severity === "warning") return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
  return <Info className="h-4 w-4 text-blue-400 shrink-0" />;
}

function severityColor(severity: "critical" | "warning" | "info") {
  if (severity === "critical") return "border-red-500/30 bg-red-500/5";
  if (severity === "warning") return "border-amber-500/30 bg-amber-500/5";
  return "border-blue-500/30 bg-blue-500/5";
}

function CertificateCard({ cert }: { cert: CertificateDetails }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-certificate">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <FileKey className="h-4 w-4 text-orange-400" /> Certificate Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Subject</span>
              <p className="text-sm text-white font-mono" data-testid="text-cert-subject">{cert.subject}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Issuer</span>
              <p className="text-sm text-white font-mono" data-testid="text-cert-issuer">{cert.issuer}</p>
              {cert.issuerOrg && (
                <p className="text-xs text-zinc-400">{cert.issuerOrg}</p>
              )}
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Key Type / Size</span>
              <p className="text-sm text-white font-mono" data-testid="text-cert-key">
                {cert.keyType} {cert.keySize > 0 ? `(${cert.keySize} bits)` : ""}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Valid From</span>
              <p className="text-sm text-white font-mono" data-testid="text-cert-valid-from">{cert.validFrom}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Valid To</span>
              <p className="text-sm text-white font-mono" data-testid="text-cert-valid-to">{cert.validTo}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Days Remaining</span>
              <p className={`text-sm font-mono font-bold ${
                cert.isExpired ? "text-red-400" : cert.daysRemaining <= 30 ? "text-amber-400" : "text-green-400"
              }`} data-testid="text-cert-days-remaining">
                {cert.isExpired ? "EXPIRED" : cert.isNotYetValid ? "NOT YET VALID" : `${cert.daysRemaining} days`}
              </p>
            </div>
          </div>
        </div>

        {cert.sans.length > 0 && (
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Subject Alternative Names ({cert.sans.length})</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {(expanded ? cert.sans : cert.sans.slice(0, 8)).map((san, i) => (
                <Badge key={i} className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] font-mono" data-testid={`badge-san-${i}`}>
                  {san}
                </Badge>
              ))}
              {cert.sans.length > 8 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-[10px] text-orange-400 hover:text-orange-300 flex items-center gap-0.5"
                  data-testid="button-toggle-sans"
                >
                  {expanded ? (
                    <><ChevronUp className="h-3 w-3" /> Show less</>
                  ) : (
                    <><ChevronDown className="h-3 w-3" /> +{cert.sans.length - 8} more</>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">SHA-256 Fingerprint</span>
            <CopyableText text={cert.fingerprintSHA256} label="SHA-256" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">SHA-1 Fingerprint</span>
            <CopyableText text={cert.fingerprintSHA1} label="SHA-1" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Serial Number</span>
            <CopyableText text={cert.serialNumber} label="Serial" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChainVisualization({ chain, chainComplete }: { chain: ChainCertificate[]; chainComplete: boolean }) {
  if (chain.length === 0) return null;

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-chain">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Link2 className="h-4 w-4 text-orange-400" /> Certificate Chain
          </CardTitle>
          <Badge className={chainComplete ? "bg-green-500/20 text-green-400 border-green-500/50" : "bg-amber-500/20 text-amber-400 border-amber-500/50"}>
            {chainComplete ? "Complete" : "Incomplete"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {chain.map((cert, i) => (
            <div key={i} className="relative" data-testid={`chain-cert-${i}`}>
              {i > 0 && (
                <div className="absolute left-5 -top-2 w-px h-4 bg-zinc-700" />
              )}
              <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                i === 0 ? "border-orange-500/30 bg-orange-500/5" :
                cert.isSelfSigned ? "border-green-500/30 bg-green-500/5" :
                "border-zinc-800 bg-zinc-900/50"
              }`}>
                <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                  i === 0 ? "bg-orange-500/20" :
                  cert.isSelfSigned ? "bg-green-500/20" :
                  "bg-zinc-800"
                }`}>
                  {cert.isSelfSigned ? (
                    <ShieldCheck className="h-4 w-4 text-green-400" />
                  ) : i === 0 ? (
                    <Globe className="h-4 w-4 text-orange-400" />
                  ) : (
                    <Server className="h-4 w-4 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-mono truncate">{cert.subject}</span>
                    {i === 0 && <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50 text-[9px]">LEAF</Badge>}
                    {cert.isSelfSigned && <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-[9px]">ROOT</Badge>}
                    {i > 0 && !cert.isSelfSigned && <Badge className="bg-zinc-700 text-zinc-300 text-[9px]">INTERMEDIATE</Badge>}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Issued by: {cert.issuer}</p>
                </div>
              </div>
              {i < chain.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowRight className="h-3 w-3 text-zinc-600 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProtocolTable({ protocols }: { protocols: ProtocolSupport[] }) {
  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-protocols">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <Shield className="h-4 w-4 text-orange-400" /> Protocol Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {protocols.map((p) => (
            <div key={p.protocol} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800" data-testid={`protocol-${p.protocol.replace(/\s+/g, "-").toLowerCase()}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white font-mono">{p.protocol}</span>
                {p.deprecated && p.supported && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-[9px]">DEPRECATED</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {p.supported ? (
                  <div className="flex items-center gap-1.5">
                    {p.deprecated ? (
                      <XCircle className="h-4 w-4 text-red-400" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    )}
                    <span className={`text-xs font-medium ${p.deprecated ? "text-red-400" : "text-green-400"}`}>
                      {p.deprecated ? "Enabled (Insecure)" : "Supported"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {p.deprecated ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-zinc-600" />
                    )}
                    <span className={`text-xs ${p.deprecated ? "text-green-400" : "text-zinc-500"}`}>
                      {p.deprecated ? "Disabled (Good)" : "Not Supported"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CipherList({ ciphers }: { ciphers: CipherInfo[] }) {
  if (ciphers.length === 0) return null;

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-ciphers">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <Fingerprint className="h-4 w-4 text-orange-400" /> Cipher Suites
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {ciphers.map((c, i) => (
            <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
              c.weak ? "border-red-500/30 bg-red-500/5" : "border-zinc-800 bg-zinc-900/50"
            }`} data-testid={`cipher-${i}`}>
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-mono ${c.weak ? "text-red-400" : "text-white"}`}>{c.name}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-zinc-500">{c.version}</span>
                  {c.bits > 0 && <span className="text-[10px] text-zinc-500">{c.bits} bits</span>}
                </div>
              </div>
              {c.weak ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                  <span className="text-[10px] text-red-400">{c.reason}</span>
                </div>
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function HeaderStatusRow({ label, present, value }: { label: string; present: boolean; value?: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
      <span className="text-sm text-white">{label}</span>
      <div className="flex items-center gap-2">
        {present ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            {value && <span className="text-[10px] text-zinc-400 max-w-48 truncate font-mono">{value}</span>}
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-zinc-600" />
            <span className="text-[10px] text-zinc-500">Missing</span>
          </>
        )}
      </div>
    </div>
  );
}

function HttpHeadersCard({ headers }: { headers: HttpSecurityHeaders }) {
  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-headers">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <ShieldCheck className="h-4 w-4 text-orange-400" /> HTTP Security Headers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <HeaderStatusRow
          label="Strict-Transport-Security (HSTS)"
          present={headers.hsts.present}
          value={headers.hsts.present ? `max-age=${headers.hsts.maxAge || "?"}${headers.hsts.includeSubDomains ? "; includeSubDomains" : ""}${headers.hsts.preload ? "; preload" : ""}` : undefined}
        />
        <HeaderStatusRow label="Content-Security-Policy" present={headers.contentSecurityPolicy.present} value={headers.contentSecurityPolicy.raw?.substring(0, 60)} />
        <HeaderStatusRow label="X-Frame-Options" present={headers.xFrameOptions.present} value={headers.xFrameOptions.value} />
        <HeaderStatusRow label="X-Content-Type-Options" present={headers.xContentTypeOptions.present} value={headers.xContentTypeOptions.value} />
        <HeaderStatusRow label="Referrer-Policy" present={headers.referrerPolicy.present} value={headers.referrerPolicy.value} />
        <HeaderStatusRow label="Permissions-Policy" present={headers.permissionsPolicy.present} value={headers.permissionsPolicy.raw?.substring(0, 60)} />
      </CardContent>
    </Card>
  );
}

function IssuesCard({ issues }: { issues: SSLCheckResult["issues"] }) {
  if (issues.length === 0) return null;

  const critical = issues.filter(i => i.severity === "critical");
  const warnings = issues.filter(i => i.severity === "warning");
  const infos = issues.filter(i => i.severity === "info");

  const groups = [
    { label: "Critical", items: critical, color: "text-red-400" },
    { label: "Warnings", items: warnings, color: "text-amber-400" },
    { label: "Informational", items: infos, color: "text-blue-400" },
  ].filter(g => g.items.length > 0);

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-issues">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <AlertTriangle className="h-4 w-4 text-orange-400" /> Issues & Recommendations
          </CardTitle>
          <div className="flex items-center gap-2">
            {critical.length > 0 && <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-[10px]">{critical.length} Critical</Badge>}
            {warnings.length > 0 && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-[10px]">{warnings.length} Warning</Badge>}
            {infos.length > 0 && <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-[10px]">{infos.length} Info</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.map((group) => (
          <div key={group.label} className="space-y-2">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${group.color}`}>{group.label}</h4>
            {group.items.map((issue, i) => (
              <div key={i} className={`p-3 rounded-lg border ${severityColor(issue.severity)}`} data-testid={`issue-${issue.severity}-${i}`}>
                <div className="flex items-start gap-2">
                  <SeverityIcon severity={issue.severity} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{issue.message}</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      <span className="text-zinc-500 font-medium">Fix: </span>{issue.remediation}
                    </p>
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

export default function SSLChecker() {
  useDocumentTitle("SSL Checker | STB Cybersecurity");
  const { isAuthenticated, isPro } = useAuth();
  const { toast } = useToast();

  const [hostname, setHostname] = useState("");
  const [port, setPort] = useState(443);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<SSLCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostname.trim()) return;

    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/tools/ssl-check-full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ hostname: hostname.trim(), port }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Scan failed" }));
        throw new Error(data.error || `Scan failed (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
      toast({ title: "Scan Complete", description: `SSL analysis for ${hostname} finished in ${(data.scanTime / 1000).toFixed(1)}s` });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Scan Failed", description: err.message, variant: "destructive" });
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
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-ssl-login-required">Sign In Required</h2>
              <p className="text-zinc-400 max-w-md">
                SSL Checker access requires authentication. Please sign in with your STB Cybersecurity account to continue.
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
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-ssl-upgrade-required">Pro Subscription Required</h2>
              <p className="text-zinc-400 max-w-md">
                The SSL Checker is available to Pro, Business, and Enterprise subscribers.
                Upgrade your plan to access comprehensive SSL/TLS analysis.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold" asChild>
              <a href="/pricing" data-testid="link-ssl-upgrade">
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
        <ToolPageHeader
          icon={<Shield className="h-6 w-6 text-orange-400" />}
          title="SSL Checker"
          description="Comprehensive SSL/TLS certificate analysis, protocol testing, and security grading"
          tier="pro"
          testIdPrefix="ssl-checker"
          statusBadges={result ? [
            { label: `Grade: ${result.grade}`, variant: result.grade.startsWith("A") ? "success" : result.grade.startsWith("B") ? "warning" : "error" },
            { label: `${result.issues.filter(i => i.severity === "critical").length} Critical`, count: undefined, variant: "error" },
            { label: `${result.issues.filter(i => i.severity === "warning").length} Warnings`, count: undefined, variant: "warning" },
          ].filter(b => !b.label.startsWith("0")) : undefined}
        />

        <Card className="border-white/5 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Globe className="h-5 w-5 text-orange-400" /> Scan Domain
            </CardTitle>
            <CardDescription>
              Enter a hostname to perform a full SSL/TLS security analysis including certificate details, protocol support, cipher suites, and HTTP security headers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScan} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label className="text-zinc-300 text-sm mb-1.5 block">Hostname</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      data-testid="input-ssl-hostname"
                      value={hostname}
                      onChange={(e) => setHostname(e.target.value)}
                      placeholder="example.com"
                      className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
                      required
                    />
                  </div>
                </div>
                <div className="w-full sm:w-40">
                  <Label className="text-zinc-300 text-sm mb-1.5 block">Port</Label>
                  <select
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-900 text-white px-3 text-sm"
                    data-testid="select-ssl-port"
                  >
                    {COMMON_PORTS.map(({ port: p, label }) => (
                      <option key={p} value={p}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isScanning || !hostname.trim()}
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                data-testid="button-ssl-scan"
              >
                {isScanning ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning…</>
                ) : (
                  <><ShieldCheck className="h-4 w-4 mr-2" /> Analyze SSL/TLS</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm" data-testid="text-ssl-error">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {isScanning && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4 animate-in fade-in duration-300">
            <div className="relative">
              <div className="p-4 rounded-full bg-orange-500/10">
                <Shield className="h-10 w-10 text-orange-400" />
              </div>
              <Loader2 className="absolute -top-1 -right-1 h-6 w-6 text-orange-500 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-white">Analyzing SSL/TLS Configuration…</h3>
            <p className="text-sm text-zinc-400 text-center max-w-md">
              Testing protocols, cipher suites, certificate chain, and HTTP headers. This may take 15–30 seconds.
            </p>
          </div>
        )}

        {result && !isScanning && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <Card className="border-white/5 bg-card/50" data-testid="card-grade-summary">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <GradeBadge grade={result.grade} color={result.gradeColor} />
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl font-display font-bold text-white" data-testid="text-ssl-hostname-result">
                      {result.hostname}:{result.port}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
                      {result.certificate?.isExpired && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Expired</Badge>
                      )}
                      {result.ocspStapling && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">OCSP Stapling</Badge>
                      )}
                      {result.chainComplete && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Complete Chain</Badge>
                      )}
                      {result.httpHeaders?.hsts.present && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">HSTS</Badge>
                      )}
                      {result.caaRecords.length > 0 && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">CAA Records</Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1 justify-center sm:justify-start">
                      <Clock className="h-3 w-3" /> Scanned in {(result.scanTime / 1000).toFixed(1)}s
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-white">{result.protocols.filter(p => p.supported).length}</p>
                      <p className="text-[10px] text-zinc-500">Protocols</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{result.ciphers.length}</p>
                      <p className="text-[10px] text-zinc-500">Ciphers</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{result.issues.length}</p>
                      <p className="text-[10px] text-zinc-500">Issues</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <IssuesCard issues={result.issues} />

            {result.certificate && result.certificate.subject && (
              <CertificateCard cert={result.certificate} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChainVisualization chain={result.chain} chainComplete={result.chainComplete} />
              <ProtocolTable protocols={result.protocols} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CipherList ciphers={result.ciphers} />
              <HttpHeadersCard headers={result.httpHeaders} />
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <Shield className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
          <p className="text-xs text-zinc-400">
            SSL analysis is performed server-side using direct TLS connections. No third-party APIs are used.
            Scans test protocol versions, cipher suites, certificate chains, and HTTP security headers.
          </p>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
