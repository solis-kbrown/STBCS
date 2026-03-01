import { useState } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield, Loader2, AlertTriangle, CheckCircle2, XCircle,
  Info, Globe, ShieldCheck, Clock, ChevronDown, ChevronUp,
  Copy, Check, Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeaderAnalysis {
  name: string;
  value: string | null;
  present: boolean;
  status: "pass" | "fail" | "warning" | "info";
  severity: "critical" | "high" | "medium" | "low" | "info";
  description: string;
  recommendation: string;
}

interface HeadersScanResult {
  domain: string;
  url: string;
  statusCode: number;
  grade: string;
  score: number;
  headers: HeaderAnalysis[];
  rawHeaders: Record<string, string>;
  scannedAt: string;
  responseTime: number;
  server?: string;
}

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "#22c55e";
  if (grade.startsWith("B")) return "#eab308";
  if (grade === "C") return "#f97316";
  if (grade === "D") return "#ef4444";
  return "#dc2626";
}

function gradeBgClass(grade: string): string {
  if (grade.startsWith("A")) return "border-green-500/40 bg-green-500/10";
  if (grade.startsWith("B")) return "border-yellow-500/40 bg-yellow-500/10";
  if (grade === "C") return "border-orange-500/40 bg-orange-500/10";
  return "border-red-500/40 bg-red-500/10";
}

function StatusIcon({ status }: { status: HeaderAnalysis["status"] }) {
  if (status === "pass") return <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />;
  if (status === "fail") return <XCircle className="h-4 w-4 text-red-400 shrink-0" />;
  if (status === "warning") return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
  return <Info className="h-4 w-4 text-blue-400 shrink-0" />;
}

function statusBorderClass(status: HeaderAnalysis["status"]): string {
  if (status === "pass") return "border-green-500/20";
  if (status === "fail") return "border-red-500/20";
  if (status === "warning") return "border-amber-500/20";
  return "border-blue-500/20";
}

function statusBgClass(status: HeaderAnalysis["status"]): string {
  if (status === "pass") return "bg-green-500/5";
  if (status === "fail") return "bg-red-500/5";
  if (status === "warning") return "bg-amber-500/5";
  return "bg-blue-500/5";
}

function severityBadge(severity: HeaderAnalysis["severity"]) {
  const map: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400 border-red-500/50",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/50",
    low: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    info: "bg-zinc-700/50 text-zinc-400 border-zinc-600/50",
  };
  return map[severity] || map.info;
}

function HeaderRow({ header, index }: { header: HeaderAnalysis; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-lg border ${statusBorderClass(header.status)} ${statusBgClass(header.status)} transition-colors`}
      data-testid={`header-row-${index}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        data-testid={`button-toggle-header-${index}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <StatusIcon status={header.status} />
          <div className="min-w-0">
            <span className="text-sm font-mono text-white">{header.name}</span>
            {header.present && header.value && (
              <p className="text-[10px] text-zinc-500 font-mono truncate max-w-md mt-0.5">
                {header.value}
              </p>
            )}
            {!header.present && (
              <p className="text-[10px] text-zinc-600 mt-0.5">Not set</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className={`${severityBadge(header.severity)} text-[9px]`}>
            {header.severity.toUpperCase()}
          </Badge>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-zinc-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-3 pt-0 space-y-2 border-t border-white/5 mt-0">
          <div className="pt-3">
            <p className="text-xs text-zinc-300">{header.description}</p>
          </div>
          <div className="bg-zinc-900/60 rounded-md p-3 border border-zinc-800">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-bold">Recommendation</p>
            <p className="text-xs text-zinc-400">{header.recommendation}</p>
          </div>
          {header.present && header.value && (
            <div className="bg-zinc-950 rounded-md p-3 border border-zinc-800">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-bold">Raw Value</p>
              <code className="text-[11px] text-green-400 font-mono break-all">{header.value}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RawHeadersCard({ rawHeaders }: { rawHeaders: Record<string, string> }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const entries = Object.entries(rawHeaders);

  const handleCopy = async () => {
    const text = entries.map(([k, v]) => `${k}: ${v}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied", description: "Raw headers copied to clipboard" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-raw-headers">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Globe className="h-4 w-4 text-orange-400" /> Raw Response Headers ({entries.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-zinc-400 hover:text-white"
              data-testid="button-copy-raw-headers"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-7 px-2 text-zinc-400 hover:text-white"
              data-testid="button-toggle-raw-headers"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            {entries.map(([key, value], i) => (
              <div key={i} className="py-1 flex gap-2 border-b border-zinc-800/50 last:border-0">
                <span className="text-[11px] text-orange-400 font-mono font-bold whitespace-nowrap">{key}:</span>
                <span className="text-[11px] text-zinc-400 font-mono break-all">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function HeadersScanner() {
  useDocumentTitle("HTTP Security Headers Scanner | STB Cybersecurity");
  const { toast } = useToast();

  const [hostname, setHostname] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<HeadersScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostname.trim()) return;

    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/tools/headers-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ hostname: hostname.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Scan failed" }));
        throw new Error(data.error || `Scan failed (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
      toast({ title: "Scan Complete", description: `Header analysis for ${data.domain} finished` });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Scan Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  const passCount = result?.headers.filter((h) => h.status === "pass").length || 0;
  const failCount = result?.headers.filter((h) => h.status === "fail").length || 0;
  const warnCount = result?.headers.filter((h) => h.status === "warning").length || 0;

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white" data-testid="text-headers-scanner-title">
              HTTP Security Headers Scanner
            </h1>
            <p className="text-muted-foreground mt-1">
              Analyze HTTP response headers for security best practices, missing protections, and misconfigurations.
            </p>
          </div>
          <Badge className="bg-green-600 text-white" data-testid="badge-headers-free">
            FREE
          </Badge>
        </div>

        <Card className="border-white/5 bg-card/50">
          <CardContent className="p-6">
            <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  placeholder="Enter domain (e.g., example.com)"
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 h-11"
                  disabled={isScanning}
                  data-testid="input-headers-hostname"
                />
              </div>
              <Button
                type="submit"
                disabled={isScanning || !hostname.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-11 px-8 gap-2"
                data-testid="button-headers-scan"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Scan Headers
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="p-4 flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-400 shrink-0" />
              <div>
                <p className="text-sm text-red-400 font-medium">Scan Failed</p>
                <p className="text-xs text-red-400/70 mt-0.5" data-testid="text-headers-error">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className={`border ${gradeBgClass(result.grade)}`} data-testid="card-grade">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <div
                    className="flex items-center justify-center w-20 h-20 rounded-2xl border-2 shadow-lg mb-2"
                    style={{ borderColor: gradeColor(result.grade), boxShadow: `0 0 24px ${gradeColor(result.grade)}30` }}
                    data-testid="badge-headers-grade"
                  >
                    <span className="text-3xl font-display font-black" style={{ color: gradeColor(result.grade) }}>
                      {result.grade}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Security Grade</p>
                  <p className="text-lg font-bold text-white">{result.score}/100</p>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-card/50" data-testid="card-summary-pass">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{passCount}</p>
                  <p className="text-xs text-zinc-400">Headers Passed</p>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-card/50" data-testid="card-summary-fail">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{failCount}</p>
                  <p className="text-xs text-zinc-400">Headers Failed</p>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-card/50" data-testid="card-summary-warn">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-amber-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{warnCount}</p>
                  <p className="text-xs text-zinc-400">Warnings</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-white/5 bg-card/50" data-testid="card-scan-info">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-orange-400" />
                    <span className="font-mono text-white" data-testid="text-scanned-domain">{result.domain}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-orange-400" />
                    <span>HTTP {result.statusCode}</span>
                  </div>
                  {result.server && (
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
                      <span data-testid="text-server-header">{result.server}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-orange-400" />
                    <span>{result.responseTime}ms</span>
                  </div>
                  <div className="text-zinc-600 ml-auto">
                    Scanned: {new Date(result.scannedAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-card/50" data-testid="card-header-analysis">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-white">
                  <ShieldCheck className="h-4 w-4 text-orange-400" /> Header-by-Header Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.headers.map((header, i) => (
                  <HeaderRow key={header.name} header={header} index={i} />
                ))}
              </CardContent>
            </Card>

            <RawHeadersCard rawHeaders={result.rawHeaders} />
          </div>
        )}

        <div className="flex items-start gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <Shield className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
          <p className="text-xs text-zinc-400">
            This tool checks HTTP response headers for security best practices including HSTS, CSP, X-Frame-Options,
            X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and Cross-Origin headers. Free for all users.
          </p>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
